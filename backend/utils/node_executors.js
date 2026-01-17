import pdfParse from "@cedrugs/pdf-parse";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Makes a short text for logs.
const safeSlice = (v, n = 200) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > n ? s.slice(0, n) + "..." : s;
};

// Gets a nested value by path from an object.
const getByPath = (obj, path) => {
  return String(path)
    .split(".")
    .reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
};

// Default passthrough executor
export const passthroughExecutor = async (node, context) => {
  console.log(` Passthrough: ${node.type}(${String(node.id).slice(0, 8)})`);
  return context;
};

// Manual trigger executor
export const startExecutor = async (node, context) => {
  console.log("Start node executed");

  return {
    ...context,
    manualNodeContext: {
      ...(context.initial ?? {}),
      triggerType: "manual",
    },
  };
};

// Google Form automated trigger executor
export const googleFormTriggerExecutor = async (node, context) => {
  console.log(" Google Form trigger executed:", node.id);

  const cfg = node?.data?.config ?? {};

  const incoming =
    context?.initialData?.googleForm ||
    context?.initialData?.google_form ||
    context?.initialData?.payload ||
    null;

  const normalized = {
    formId: incoming?.formId ?? cfg.formId ?? "",
    timestamp: incoming?.timestamp ?? new Date().toISOString(),
    answers: incoming?.answers ?? {},
    raw: incoming ?? null,
  };

  return {
    ...context,
    initial: {
      ...(context.initial ?? {}),
      timestamp: context?.initial?.timestamp ?? new Date().toISOString(),
      startNodeId: context?.initial?.startNodeId ?? node.id,
      triggerType: "google_form",
    },
    google_form: normalized,
    [`${node.id}_google_form`]: normalized,
  };
};

// PDF node executor
export const pdfExecutor = async (node, context) => {
  console.log("PDF node executed");

  const cfg = node?.data?.config ?? {};
  const fileUrl = cfg.fileUrl;
  if (!fileUrl) throw new Error(`PDF node missing data.config.fileUrl`);

  const res = await fetch(fileUrl);
  if (!res.ok)
    throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);

  const arr = await res.arrayBuffer();
  const pdfBuffer = Buffer.from(arr);
  const parsed = await pdfParse(pdfBuffer);

  const fullText = parsed.text || "";
  const preview = safeSlice(fullText, 4000);

  const result = {
    fileUrl,
    pages: parsed.numpages,
    textPreview: preview,
    textLength: fullText.length,
  };

  return {
    ...context,
    pdfNodeContext: result,
  };
};

// Gemini node executor
export const geminiExecutor = async (node, context) => {
  console.log("Gemini node executed");

  const cfg = node?.data?.config ?? {};
  const systemPrompt = cfg.systemPrompt ?? "You are a helpful assistant.";

  const userPrompt = cfg.prompt ?? cfg.userPrompt;
  if (!userPrompt) {
    throw new Error(`Gemini node "${node.id}" missing prompt`);
  }

  // PDF text content
  const pdfText = context.pdfNodeContext?.textPreview || "";

  // Google Form answers
  const formAnswers = context.google_form?.answers || {};

  // Combine extra context
  const extraContext = [
    pdfText ? `--- PDF CONTENT ---\n${pdfText}` : "",
    Object.keys(formAnswers).length
      ? `--- GOOGLE FORM ANSWERS ---\n${JSON.stringify(formAnswers, null, 2)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const fullPrompt = extraContext
    ? `${userPrompt}\n\n${extraContext}`
    : userPrompt;

  const model = google("gemini-2.5-flash");
  const { text } = await generateText({
    model,
    prompt: fullPrompt,
    system: systemPrompt,
    maxTokens: 1000,
    temperature: 0.7,
  });

  return {
    ...context,
    ai_response: {
      text,
      model: "gemini-2.5-flash",
      prompt: userPrompt,
      system: systemPrompt,
    },
  };
};

// Telegram Node Executor
export const telegramExecutor = async (node, context) => {
  console.log("Telegram node executed");

  const cfg = node?.data?.config ?? {};

  const botToken = cfg.botToken;
  const chatId = cfg.chatId;

  if (!botToken || !chatId) {
    throw new Error(`Telegram node missing botToken or chatId`);
  }

  const lastAiText = context.ai_response?.text;

  const messageToSend = cfg.message || lastAiText || "No content to send.";

  // 3. Send via Telegram API
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: messageToSend,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API Error: ${res.status} ${err}`);
  }

  const result = await res.json();

  return {
    ...context,
    telegram_response: {
      sent: true,
      messageId: result.result?.message_id,
      timestamp: new Date().toISOString(),
    },
  };
};

// Executor Registry
export const getExecutor = (nodeType) => {
  switch (String(nodeType).toLowerCase()) {
    case "trigger":
    case "trigger.manual":
      return startExecutor;

    case "trigger.googleform":
      return googleFormTriggerExecutor;

    case "file.pdfreader":
      return pdfExecutor;

    case "llm.gemini":
      return geminiExecutor;

    case "action.telegram":
      return telegramExecutor;

    default:
      return passthroughExecutor;
  }
};
