import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, FileText, ArrowRight, Loader2 } from "lucide-react";
import "./WorkflowPage.css";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}api/workflows`;

const WorkflowPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchWorkflows() {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load workflows");
      const data = await res.json();
      setWorkflows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function handleCreate() {
    const name = prompt("Workflow name?");
    if (!name) return;

    const res = await fetch(API_BASE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      alert("Failed to create workflow");
      return;
    }

    await res.json();
    await fetchWorkflows();
  }

  async function handleDelete(e, id) {
    e.stopPropagation(); // Prevent clicking the card when deleting
    if (!window.confirm("Delete this workflow?")) return;

    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchWorkflows();
  }

  return (
    <div className="workflow-page">
      <div className="workflow-header">
        <div className="header-content">
          <h1>Workflows</h1>
          <p className="subtitle">Manage your automation pipelines</p>
        </div>

        <button className="workflow-new-btn" onClick={handleCreate}>
          <Plus size={18} />
          <span>New Workflow</span>
        </button>
      </div>

      {loading ? (
        <div className="workflow-loading">
          <Loader2 className="spinner" size={24} />
          <span>Loading your workspace...</span>
        </div>
      ) : workflows.length === 0 ? (
        <div className="workflow-empty">
          <div className="empty-icon-wrapper">
            <FileText size={32} />
          </div>
          <h3>No workflows yet</h3>
          <p>Create your first workflow to get started with automation.</p>
          <button className="workflow-create-link" onClick={handleCreate}>
            Create now
          </button>
        </div>
      ) : (
        <div className="workflow-grid">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="workflow-card"
              onClick={() => navigate(`/editor/${wf.id}`)}
            >
              <div className="card-icon">
                <FileText size={20} />
              </div>

              <div className="card-content">
                <span className="workflow-name">{wf.name}</span>
                <span className="workflow-meta">Last edited: Just now</span>
              </div>

              <div className="card-actions">
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => handleDelete(e, wf.id)}
                  title="Delete Workflow"
                >
                  <Trash2 size={16} />
                </button>

                <button className="action-btn open-btn" title="Open Editor">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowPage;
