import { useState, useEffect } from "react";

const NodeModal = ({ isOpen, onClose, nodeType, nodeData = {}, onSave, workflowId }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData(nodeData);
    }
  }, [isOpen, nodeData]);

  if (!isOpen) return null;

  // ✅ HELPER: Update form data consistently
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

          {/* ✅ FIXED GOOGLE FORM - Now uses workflowId prop */}
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
              <div style={{marginTop: '8px', padding: '8px', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.8rem'}}>
                <strong>Setup:</strong> Google Form → Responses → Sheets → Extensions → Apps Script → Add webhook
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save Configuration</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeModal;
