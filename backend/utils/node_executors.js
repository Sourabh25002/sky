import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Extracts text from various input formats
const findInputText = (input) => {
  if (!input) return "";
  if (typeof input === "string") return input;

  if (Array.isArray(input)) {
    return input.map((i) => findInputText(i)).join("\n---\n");
  }

  if (input.data) {
    return findInputText(input.data);
  }

  if (input.text) return input.text;
  if (input.message) return input.message;
  if (input.answers) return JSON.stringify(input.answers, null, 2);
  if (input.content) return input.content;

  return JSON.stringify(input);
};

// Retrieves parent node from context
const getParentData = (context, node) => {
  const parentIds = node.parents || [];
  if (parentIds.length === 0) return null;

  const parentId = parentIds[0];
  return context[parentId]?.data;
};

// Default passthrough executor
export const passthroughExecutor = async (node, context) => {
  // console.log("Passthrough Node Executed");
  return {
    ...context,
    [node.id]: {
      data: { status: "passed" },
    },
  };
};

// Manual trigger executor
export const startExecutor = async (node, context) => {
  // console.log("Start Node Executed");

  return {
    ...context,
    [node.id]: {
      data: {
        triggerType: "manual",
      },
    },
  };
};

// Google Form automated trigger executor
export const googleFormTriggerExecutor = async (node, context) => {
  // console.log("Google Form trigger executed:", node.id);

  const cfg = node?.data?.config ?? {};

  const payload =
    context?.initialData?.googleForm || context?.trigger?.payload || {};

  const normalized = {
    formId: payload?.formId ?? cfg.formId ?? "unknown",
    answers: payload?.answers ?? {},
    respondentEmail: payload?.email ?? "anonymous",
    timestamp: payload?.timestamp ?? new Date().toISOString(),
  };

  return {
    ...context,
    [node.id]: {
      data: normalized,
    },
  };
};

// PDF node executor
export const pdfExecutor = async (node, context) => {
  // console.log("PDF Node Executed");

  const cfg = node?.data?.config ?? {};
  const fileUrl = cfg.fileUrl;

  return {
    ...context,
    [node.id]: {
      data: {
        fileUrl: fileUrl,
      },
    },
  };
};

// Gemini node executor
export const geminiExecutor = async (node, context) => {
  const cfg = node?.data?.config ?? {};
  const systemPrompt = cfg.systemPrompt ?? "You are a helpful assistant.";
  const userPrompt = cfg.prompt || cfg.userPrompt;

  if (!userPrompt) throw new Error("Gemini Node: Missing prompt");

  // 1. Get Parent Data
  const parentData = getParentData(context, node);

  // 2. Extract Text from Parent
  const contextText = findInputText(parentData);

  const fullPrompt = `${userPrompt}\n\n--- DATA TO PROCESS ---\n${contextText}`;

  const model = google("gemini-2.5-flash");
  const { text } = await generateText({
    model,
    prompt: fullPrompt,
    system: systemPrompt,
    maxTokens: 1000,
  });

  return {
    ...context,
    [node.id]: {
      data: {
        text: text,
        model: "gemini-2.5-flash",
      },
    },
  };
};

// Telegram Node Executor
export const telegramExecutor = async (node, context) => {
  // console.log(JSON.stringify(node, null, 2));

  const cfg = node?.data?.config ?? {};
  const botToken = cfg.botToken;
  const chatId = cfg.chatId;

  if (!botToken || !chatId)
    throw new Error("Telegram Node: Missing credentials");

  let messageToSend = cfg.message;

  if (!messageToSend) {
    const parentData = getParentData(context, node);

    if (parentData) {
      messageToSend = findInputText(parentData);
    }
  }

  const finalMessage = messageToSend || "No content received from parent.";

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: finalMessage,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API Error: ${res.status} ${err}`);
  }

  const result = await res.json();

  return {
    ...context,
    [node.id]: {
      data: {
        content: finalMessage,
      },
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
