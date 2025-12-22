import { useState, useEffect } from "react";

const NodeModal = ({ isOpen, onClose, nodeType, nodeData = {}, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData(nodeData);
    }
  }, [isOpen, nodeData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Configure {nodeType.toUpperCase()} Node</h3>
        <form onSubmit={handleSubmit}>
          {nodeType === "http" && (
            <>
              <label>URL:</label>
              <input
                type="url"
                value={formData.url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://jsonplaceholder.typicode.com/posts/1"
                required
              />
              <label>Method:</label>
              <select
                value={formData.method || "GET"}
                onChange={(e) =>
                  setFormData({ ...formData, method: e.target.value })
                }
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <label>Body (JSON):</label>
              <textarea
                value={formData.body || ""}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://hooks.slack.com/..."
              />
            </>
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
