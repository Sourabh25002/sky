import { useEffect, useMemo, useState } from "react";
import "./NodeModal.css";

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

const NodeModal = ({
  isOpen,
  onClose,
  nodeType,
  nodeData = {},
  onSave,
  workflowId,
}) => {
  const [formData, setFormData] = useState({});
  const [copiedMsg, setCopiedMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(nodeData || {});
      setCopiedMsg("");
    }
  }, [isOpen, nodeData]);

  if (!isOpen) return null;

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const onCopy = async (msg, text) => {
    const ok = await copyToClipboard(text || "");
    setCopiedMsg(ok ? msg : "Copy failed (clipboard permission blocked)");
    if (ok) setTimeout(() => setCopiedMsg(""), 1400);
  };

  // Match your catalog types (recommended)
  const showHttp = nodeType === "http.request";
  const showWebhook = nodeType === "webhook"; // keep only if you really have this node type
  const showGoogleForm = nodeType === "trigger.googleForm";
  const showGemini = nodeType === "llm.gemini";

  const webhookUrl = useMemo(() => {
    // Editable for now. Later backend should populate a real public URL.
    if (formData.webhookUrl) return formData.webhookUrl;
    if (workflowId)
      return `https://YOUR_PUBLIC_DOMAIN/api/trigger/google-form/${workflowId}`;
    return "https://YOUR_PUBLIC_DOMAIN/api/trigger/google-form/{{WORKFLOW_ID}}";
  }, [formData.webhookUrl, workflowId]);

  const secret = useMemo(() => formData.secret || "", [formData.secret]);

  const appsScriptCode = useMemo(() => {
    const wf = workflowId || "{{WORKFLOW_ID}}";
    const fid = formData.formId || "{{FORM_ID}}";
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
  }, [workflowId, formData.formId, secret, webhookUrl]);

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">
            Configure {nodeType?.replace(".", " ").toUpperCase() || "NODE"}
          </div>
          <button className="iconButton" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modalBody">
          {showHttp && (
            <>
              <label className="fieldLabel">URL</label>
              <input
                className="fieldInput"
                type="url"
                value={formData.url || ""}
                onChange={(e) => updateFormData("url", e.target.value)}
                placeholder="https://jsonplaceholder.typicode.com/posts/1"
                required
              />

              <label className="fieldLabel">Method</label>
              <select
                className="fieldInput"
                value={formData.method || "GET"}
                onChange={(e) => updateFormData("method", e.target.value)}
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>

              <label className="fieldLabel">Body (JSON)</label>
              <textarea
                className="fieldTextarea"
                value={formData.body || ""}
                onChange={(e) => updateFormData("body", e.target.value)}
                placeholder='{"title":"test"}'
                rows={5}
              />
            </>
          )}

          {showWebhook && (
            <>
              <label className="fieldLabel">Webhook URL</label>
              <input
                className="fieldInput"
                type="url"
                value={formData.url || ""}
                onChange={(e) => updateFormData("url", e.target.value)}
                placeholder="https://hooks.slack.com/..."
              />
            </>
          )}

          {showGoogleForm && (
            <>
              <div className="sectionCard">
                <div className="sectionTitle">Form details</div>

                <label className="fieldLabel">Google Form ID</label>
                <input
                  className="fieldInput"
                  type="text"
                  placeholder="1FAIpQLSfexample..."
                  value={formData.formId || ""}
                  onChange={(e) => updateFormData("formId", e.target.value)}
                />

                <label className="fieldLabel">
                  Webhook URL (public URL later)
                </label>
                <div className="row">
                  <input
                    className="fieldInput"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) =>
                      updateFormData("webhookUrl", e.target.value)
                    }
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
                  Localhost won’t work from Google Apps Script; use a public
                  HTTPS URL (ngrok/dev or real domain later).
                </div>

                <label className="fieldLabel">
                  Secret (frontend temporary)
                </label>
                <div className="row">
                  <input
                    className="fieldInput"
                    type="text"
                    value={secret}
                    readOnly
                    placeholder="Generate a secret"
                  />
                  <button
                    className="secondaryBtn"
                    type="button"
                    onClick={() => updateFormData("secret", randomSecret(40))}
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
                    <code>skyOnFormSubmit</code>, event source “From form”,
                    event type “On form submit”. [web:2]
                  </li>
                  <li>Authorize when prompted.</li>
                </ul>

                {copiedMsg && <div className="copiedMsg">{copiedMsg}</div>}
              </div>
            </>
          )}

          {showGemini && (
            <>
              <label className="fieldLabel">System Prompt</label>
              <textarea
                className="fieldTextarea"
                value={formData.systemPrompt || "You are a helpful assistant."}
                onChange={(e) => updateFormData("systemPrompt", e.target.value)}
                rows={2}
              />

              <label className="fieldLabel">User Prompt</label>
              <textarea
                className="fieldTextarea"
                value={formData.userPrompt || ""}
                onChange={(e) => updateFormData("userPrompt", e.target.value)}
                rows={4}
              />

              <div className="hint">
                Template syntax: google_form.email, http_result.data
              </div>
            </>
          )}

          <div className="modalActions">
            <button className="secondaryBtn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primaryBtn" type="submit">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeModal;
