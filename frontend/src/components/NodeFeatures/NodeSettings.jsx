import "./NodeSettings.css";

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

      <div>Selected: {cfg.fileUrl ? cfg.fileUrl : "None"}</div>
    </>
  );
}

export function NodeSettings({ open, node, onClose, setNodes }) {
  if (!open || !node) return null;

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

  const t = node.data.originalType;

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
    default:
      Body = <div>No settings UI for: {t}</div>;
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>{node.data.label}</div>
          <button onClick={onClose}>X</button>
        </div>

        {Body}
      </div>
    </div>
  );
}
