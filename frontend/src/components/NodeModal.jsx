import { useState, useEffect } from "react";

const NodeModal = ({ isOpen, onClose, nodeType, nodeData = {}, onSave, workflowId }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData(nodeData);
    }
  }, [isOpen, nodeData]);

  if (!isOpen) return null;

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Configure {nodeType?.replace('-', ' ').toUpperCase() || 'Node'}</h3>
        <form onSubmit={handleSubmit}>
          {nodeType === "http" && (
            <>
              <label>URL:</label>
              <input
                type="url"
                value={formData.url || ""}
                onChange={(e) => updateFormData('url', e.target.value)}
                placeholder="https://jsonplaceholder.typicode.com/posts/1"
                required
              />
              <label>Method:</label>
              <select
                value={formData.method || "GET"}
                onChange={(e) => updateFormData('method', e.target.value)}
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <label>Body (JSON):</label>
              <textarea
                value={formData.body || ""}
                onChange={(e) => updateFormData('body', e.target.value)}
                placeholder='{"title": "test"}'
                rows="4"
              />
            </>
          )}

          {nodeType === "webhook" && (
            <>
              <label>Webhook URL:</label>
              <input
                type="url"
                value={formData.url || ""}
                onChange={(e) => updateFormData('url', e.target.value)}
                placeholder="https://hooks.slack.com/..."
              />
            </>
          )}

          {nodeType === "googleForm" && (
            <div className="form-group">
              <label>Google Form ID</label>
              <input
                type="text"
                placeholder="1FAIpQLSfexample..."
                value={formData.formId || ''}
                onChange={(e) => updateFormData('formId', e.target.value)}
              />
              {workflowId && (
                <div style={{marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '6px', fontSize: '0.85rem'}}>
                  <strong>Production Webhook URL:</strong><br/>
                  <code style={{background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px'}}>
                    http://localhost:8000/api/trigger/google-form/{workflowId}
                  </code>
                  <br/><small>Copy this URL → Google Sheets → Webhooks</small>
                </div>
              )}
            </div>
          )}

          {/* ✅ FIXED GEMINI - BACKTICKS! */}
          {nodeType === "gemini" && (
            <>
              <label>System Prompt:</label>
              <textarea
                value={formData.systemPrompt || "You are a helpful assistant."}  // ✅ ADD THIS
                onChange={(e) => updateFormData('systemPrompt', e.target.value)}
                placeholder="Optional: Define AI behavior"
                rows="2"
              />
              <label>User Prompt:</label>
              <textarea
                value={formData.userPrompt || ""}  // ✅ ADD THIS
                onChange={(e) => updateFormData('userPrompt', e.target.value)}
                placeholder="Summarize google_form.message OR write email to google_form.email"
                rows="4"
              />
              <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '8px'}}>
                Template syntax: google_form.email, http_result.data
              </div>
            </>
          )}



          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save Configuration</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeModal;
