import { useEffect, useState } from "react";
import "./WorkflowPage.css";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}api/workflows`;

const WorkflowPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

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

  async function handleDelete(id) {
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
        <h1>Workflows</h1>
        <button className="workflow-new-btn" onClick={handleCreate}>
          + New workflow
        </button>
      </div>

      {loading ? (
        <div className="workflow-loading">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="workflow-empty">
          No workflows yet. Create one to get started.
        </div>
      ) : (
        <div className="workflow-cards">
          {workflows.map((wf) => (
            <div key={wf.id} className="workflow-card">
              <div className="workflow-card-top">
                <span className="workflow-card-name">{wf.name}</span>

                <button
                  className="workflow-open-btn"
                  onClick={() => {
                    window.location.href = `/editor/${wf.id}`;
                  }}
                >
                  Open Editor →
                </button>
              </div>

              <div className="workflow-card-bottom">
                <button
                  className="workflow-list-delete"
                  onClick={() => handleDelete(wf.id)}
                >
                  Delete
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
