import pdfParse from "@cedrugs/pdf-parse";
import path from "node:path";
import fs from "node:fs/promises";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createRequire } from "node:module";

// Makes a short text for logs.
const safeSlice = (v, n = 200) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > n ? s.slice(0, n) + "..." : s;
};

// Replaces {{key}} in text with values from context.
const applyTemplate = (template, context) => {
  if (!template) return "";
  return String(template).replace(/{{([^}]+)}}/g, (_, key) => {
    const val = context?.[key.trim()];
    return val == null ? "" : String(val);
  });
};

// Default passthrough executor
export const passthroughExecutor = async (node, context) => {
  console.log(`⏭️  Passthrough: ${node.type}(${String(node.id).slice(0, 8)})`);
  return context;
};

// Start node executor
export const startExecutor = async (node, context) => {
  console.log("▶️  Start node executed:", node.id);

  return {
    ...context,
    initial: {
      ...(context.initial ?? {}),
      timestamp: new Date().toISOString(),
      startNodeId: node.id,
    },
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
  const preview = safeSlice(fullText, 4000); // keep small

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
  const userPrompt = cfg.prompt;

  if (!userPrompt) {
    throw new Error(`Gemini node "${node.id}" missing data.config.prompt`);
  }

  const pdfText = context.pdf?.textPreview || context.pdf?.text || "";
  if (!pdfText) {
    throw new Error(
      `Gemini node "${node.id}" did not receive any PDF text from previous step`
    );
  }

  const fullPrompt = `${userPrompt}

--- PDF CONTENT ---
${pdfText}
`;

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

    case "file.pdfreader":
      return pdfExecutor;

    case "llm.gemini":
      return geminiExecutor;

    default:
      return passthroughExecutor;
  }
};
