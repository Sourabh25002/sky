import { useMemo, useState } from "react";
import "./NodeSettings.css";

// Gemini Node Settings
function GeminiSettings({ node, updateConfig }) {
  const cfg = node.data.config ?? {};

  return (
    <>
      <label>Gemini API Key</label>
      <input
        value={cfg.apiKey ?? ""}
        onChange={(e) => updateConfig({ apiKey: e.target.value })}
      />

      <label>Prompt</label>
      <textarea
        value={cfg.prompt ?? ""}
        onChange={(e) => updateConfig({ prompt: e.target.value })}
      />
    </>
  );
}

// OpenAI Node Settings
function OpenAISettings({ node, updateConfig }) {
  const cfg = node.data.config ?? {};

  return (
    <>
      <label>OpenAI API Key</label>
      <input
        value={cfg.apiKey ?? ""}
        onChange={(e) => updateConfig({ apiKey: e.target.value })}
      />

      <label>Prompt</label>
      <textarea
        value={cfg.prompt ?? ""}
        onChange={(e) => updateConfig({ prompt: e.target.value })}
      />
    </>
  );
}

// Anthropic Node Settings
function AnthropicSettings({ node, updateConfig }) {
  const cfg = node.data.config ?? {};

  return (
    <>
      <label>Anthropic API Key</label>
      <input
        value={cfg.apiKey ?? ""}
        onChange={(e) => updateConfig({ apiKey: e.target.value })}
      />

      <label>Prompt</label>
      <textarea
        value={cfg.prompt ?? ""}
        onChange={(e) => updateConfig({ prompt: e.target.value })}
      />
    </>
  );
}

// PDF Reader Node Settings
function PdfReaderSettings({ node, updateConfig }) {
  const cfg = node.data.config ?? {};

  return (
    <>
      <label>PDF URL</label>
      <input
        type="url"
        placeholder="https://example.com/file.pdf"
        value={cfg.fileUrl || ""}
        onChange={(e) => updateConfig({ fileUrl: e.target.value })}
      />

      <div className="helperText">
        Selected: {cfg.fileUrl ? cfg.fileUrl : "None"}
      </div>
    </>
  );
}

// Google Form Trigger Settings
function randomSecret(len = 40) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function GoogleFormTriggerSettings({ node, updateConfig }) {
  const cfg = node.data.config ?? {};
  const [copiedMsg, setCopiedMsg] = useState("");

  const webhookUrl = useMemo(() => {
    // For now editable placeholder (backend will set real URL later)
    return (
      cfg.webhookUrl ||
      "https://YOUR_PUBLIC_DOMAIN/api/trigger/google-form/{{WORKFLOW_ID}}"
    );
  }, [cfg.webhookUrl]);

  const secret = useMemo(() => cfg.secret || "", [cfg.secret]);

  const appsScriptCode = useMemo(() => {
    const wf = cfg.workflowId || "{{WORKFLOW_ID}}";
    const fid = cfg.formId || "{{FORM_ID}}";
    const sec = secret || "{{SECRET}}";
    const url =
      webhookUrl ||
      "https://YOUR_PUBLIC_DOMAIN/api/trigger/google-form/{{WORKFLOW_ID}}";

    return `const WEBHOOK_URL = "${url}";
const SECRET = "${sec}";

// Create an installable trigger: From form -> On form submit [web:2]
function skyOnFormSubmit(e) {
  const r = e.response;
  const items = r.getItemResponses();

  const answers = {};
  items.forEach((ir) => {
    answers[ir.getItem().getTitle()] = ir.getResponse();
  });

  const payload = {
    source: "google_form",
    workflowId: "${wf}",
    formId: "${fid}",
    secret: SECRET,
    timestamp: new Date(r.getTimestamp()).toISOString(),
    answers,
  };

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}`;
  }, [webhookUrl, secret, cfg.workflowId, cfg.formId]);

  const onCopy = async (msg, text) => {
    const ok = await copyToClipboard(text || "");
    setCopiedMsg(ok ? msg : "Copy failed (clipboard permission blocked)");
    if (ok) setTimeout(() => setCopiedMsg(""), 1400);
  };

  return (
    <>
      <div className="sectionCard">
        <div className="sectionTitle">Form details</div>

        <label>Google Form ID</label>
        <input
          type="text"
          placeholder="1FAIpQLSfexample..."
          value={cfg.formId || ""}
          onChange={(e) => updateConfig({ formId: e.target.value })}
        />

        <label>Webhook URL</label>
        <div className="row">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
          />
          <button
            className="secondaryBtn"
            type="button"
            onClick={() => onCopy("Webhook URL copied", webhookUrl)}
          >
            Copy
          </button>
        </div>

        <div className="hint">
          Localhost won’t work from Google Apps Script; use a public HTTPS URL
          (ngrok/dev or your domain later).
        </div>

        <label>Secret</label>
        <div className="row">
          <input
            type="password"
            readOnly
            value={secret}
            placeholder="Generate a secret"
          />
          <button
            className="secondaryBtn"
            type="button"
            onClick={() => updateConfig({ secret: randomSecret(40) })}
          >
            Generate
          </button>
          <button
            className="secondaryBtn"
            type="button"
            onClick={() => onCopy("Secret copied", secret)}
            disabled={!secret}
          >
            Copy
          </button>
        </div>
      </div>

      <div className="sectionCard">
        <div className="sectionTitle">Apps Script code</div>

        <div className="row">
          <button
            className="secondaryBtn"
            type="button"
            onClick={() => onCopy("Apps Script copied", appsScriptCode)}
          >
            Copy code
          </button>
        </div>

        <textarea
          className="codeTextarea"
          readOnly
          value={appsScriptCode}
          rows={14}
        />

        <div className="sectionTitle" style={{ marginTop: 10 }}>
          Setup steps (Google Form)
        </div>
        <ul className="steps">
          <li>Open the Google Form → 3 dots → Script editor.</li>
          <li>Paste the code above → Save.</li>
          <li>
            Open Triggers → Add Trigger → choose function{" "}
            <code>skyOnFormSubmit</code>, event source “From form”, event type
            “On form submit”. [web:2]
          </li>
          <li>Authorize when prompted.</li>
        </ul>

        {copiedMsg && <div className="copiedMsg">{copiedMsg}</div>}
      </div>
    </>
  );
}

// Node settings modal
export function NodeSettings({ open, node, onClose, setNodes }) {
  if (!open || !node) return null;

  // Function to update node config
  const updateConfig = (patch) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== node.id) return n;

        return {
          ...n,
          data: {
            ...n.data,
            config: {
              ...(n.data.config ?? {}),
              ...patch,
            },
          },
        };
      })
    );
  };

  // Determine which settings component to render
  const t = node.data.originalType;

  // Render the appropriate settings component based on the node type
  let Body = null;
  switch (t) {
    case "llm.openai":
      Body = <OpenAISettings node={node} updateConfig={updateConfig} />;
      break;
    case "llm.gemini":
      Body = <GeminiSettings node={node} updateConfig={updateConfig} />;
      break;
    case "llm.anthropic":
      Body = <AnthropicSettings node={node} updateConfig={updateConfig} />;
      break;
    case "file.pdfReader":
      Body = <PdfReaderSettings node={node} updateConfig={updateConfig} />;
      break;
    case "trigger.googleForm":
      Body = (
        <GoogleFormTriggerSettings node={node} updateConfig={updateConfig} />
      );
      break;
    default:
      Body = <div className="helperText">No settings UI for: {t}</div>;
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>{node.data.label}</div>
          <button type="button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="modalBody">{Body}</div>
      </div>
    </div>
  );
}
