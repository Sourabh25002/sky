import pdfParse from "@cedrugs/pdf-parse";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Makes a short text for logs.
const safeSlice = (v, n = 200) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > n ? s.slice(0, n) + "..." : s;
};

// Read nested values like "google_form.answers.Email"
const getByPath = (obj, path) => {
  return String(path)
    .split(".")
    .reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
};

// Replaces {{path.to.key}} in text with values from context.
export const applyTemplate = (template, context) => {
  if (!template) return "";
  return String(template).replace(/{{([^}]+)}}/g, (_, rawKey) => {
    const key = rawKey.trim();
    const val = getByPath(context, key);
    return val == null ? "" : String(val);
  });
};

// Default passthrough executor
export const passthroughExecutor = async (node, context) => {
  console.log(`⏭️  Passthrough: ${node.type}(${String(node.id).slice(0, 8)})`);
  return context;
};

// Manual trigger start node executor
export const startExecutor = async (node, context) => {
  console.log("▶️  Start node executed:", node.id);

  return {
    ...context,
    initial: {
      ...(context.initial ?? {}),
      timestamp: new Date().toISOString(),
      startNodeId: node.id,
      triggerType: "manual",
    },
  };
};

// ✅ Google Form trigger executor
// This DOES NOT call Google. It just places the incoming submission payload into context.google_form.
export const googleFormTriggerExecutor = async (node, context) => {
  console.log("📝 Google Form trigger executed:", node.id);

  const cfg = node?.data?.config ?? {};

  // This payload will come from backend later, via event.data.googleForm (recommended).
  // Keeping fallback keys so you can test easily.
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
  const cfg = node?.data?.config ?? {};
  const fileUrl = cfg.fileUrl;
  if (!fileUrl)
    throw new Error(`PDF node "${node.id}" missing data.config.fileUrl`);

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
    timestamp: new Date().toISOString(),
  };

  // ✅ DON'T put fullText into context
  return { ...context, pdf: result, [`${node.id}_pdf`]: result };
};

// Gemini node executor
export const geminiExecutor = async (node, context) => {
  const cfg = node?.data?.config ?? {};
  const systemPrompt = cfg.systemPrompt ?? "You are a helpful assistant.";

  // Support both cfg.prompt and cfg.userPrompt (because your UI had both styles)
  const userPromptTemplate = cfg.prompt ?? cfg.userPrompt;
  if (!userPromptTemplate) {
    throw new Error(`Gemini node "${node.id}" missing data.config.prompt`);
  }

  // Allow templates like {{google_form.answers.Email}}
  const userPrompt = applyTemplate(userPromptTemplate, context);

  // If you want Gemini to work with either PDF or Google Form, you can expand this logic.
  const pdfText = context.pdf?.textPreview || "";
  const formAnswers = context.google_form?.answers || {};

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
    [`${node.id}_ai_result`]: text,
    ai_response: {
      text,
      model: "gemini-2.5-flash",
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

    // ✅ Google Form trigger
    case "trigger.googleform":
      return googleFormTriggerExecutor;

    case "file.pdfreader":
      return pdfExecutor;

    case "llm.gemini":
      return geminiExecutor;

    default:
      return passthroughExecutor;
  }
};
