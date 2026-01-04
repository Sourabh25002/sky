export const TRIGGERS = [
  // Note: Always start trigger node types with "trigger.___" (e.g., "trigger.manual")
  {
    type: "trigger.manual",
    label: "Manual Trigger",
    icon: "/cursor.svg",
  },
  {
    type: "trigger.googleForm",
    label: "Google Form Trigger",
    icon: "/googleform.svg",
    defaults: { formId: "", secret: "", webhookBaseUrl: "" },
  },
];

export const LLM = [
  {
    type: "llm.openai",
    label: "OpenAI",
    icon: "/openai.svg",
  },
  {
    type: "llm.gemini",
    label: "Gemini",
    icon: "/gemini.svg",
  },
  {
    type: "llm.anthropic",
    label: "Anthropic",
    icon: "/anthropic.svg",
  },
];

export const APPS = [
  {
    type: "app.slack",
    label: "Slack",
    icon: "/slack.svg",
  },
  {
    type: "app.discord",
    label: "Discord",
    icon: "/discord.svg",
  },
];

export const HTTP = [
  {
    type: "http.request",
    label: "HTTP Request",
    icon: "/globe.svg",
  },
];

export const usefulNodeTypes = [
  {
    type: "file.pdfReader",
    label: "PDF Reader ",
    icon: "/file-pdf.svg",
  },
];

export const NODE_TEMPLATES = [
  ...TRIGGERS,
  ...LLM,
  ...APPS,
  ...HTTP,
  ...usefulNodeTypes,
];
