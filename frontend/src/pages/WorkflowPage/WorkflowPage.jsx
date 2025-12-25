// src/pages/WorkflowPage.jsx
import { useEffect, useState } from "react";
import "./WorkflowPage.css";

const API_BASE = "http://localhost:8000/api/workflows";

const WorkflowPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [saving, setSaving] = useState(false);

  async function fetchWorkflows() {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load workflows");
      const data = await res.json();
      setWorkflows(data);

      // If we don't have a selected workflow, select first one
      if (!selectedId && data.length > 0) {
        const firstId = data[0].id;
        setSelectedId(firstId);
        fetchWorkflow(firstId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkflow(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setSelectedWorkflow(null);
        return;
      }
      const data = await res.json();
      if (!data.definition) data.definition = {};
      setSelectedWorkflow(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(id) {
    setSelectedId(id);
    await fetchWorkflow(id);
  }

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

    const wf = await res.json();
    await fetchWorkflows();
    setSelectedId(wf.id);
    setSelectedWorkflow(wf);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this workflow?")) return;

    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    // If deleting currently selected, clear the editor
    if (id === selectedId) {
      setSelectedId(null);
      setSelectedWorkflow(null);
    }

    fetchWorkflows();
  }

  async function handleSave() {
    if (!selectedWorkflow) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${selectedWorkflow.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedWorkflow.name,
          description: selectedWorkflow.description,
          status: selectedWorkflow.status,
          definition: selectedWorkflow.definition,
        }),
      });
      if (!res.ok) {
        alert("Failed to save workflow");
        return;
      }
      const data = await res.json();
      setSelectedWorkflow(data);
      // refresh list to update name/status
      fetchWorkflows();
    } catch (e) {
      console.error(e);
      alert("Error saving workflow");
    } finally {
      setSaving(false);
    }
  }

  function handleDefinitionChange(e) {
    const value = e.target.value;
    try {
      const json = value.trim() === "" ? {} : JSON.parse(value);
      setSelectedWorkflow((prev) => ({
        ...prev,
        definition: json,
        _definitionText: value,
      }));
    } catch {
      setSelectedWorkflow((prev) => ({
        ...prev,
        _definitionText: value,
      }));
    }
  }

  const definitionText =
    selectedWorkflow?._definitionText ??
    (selectedWorkflow
      ? JSON.stringify(selectedWorkflow.definition || {}, null, 2)
      : "");

  return (
    <div className="workflow-page">
      <div className="workflow-header">
        <h1>Workflows</h1>
        <button className="workflow-new-btn" onClick={handleCreate}>
          + New workflow
        </button>
      </div>

      <div className="workflow-main">
        <div className="workflow-list-panel">
          {loading ? (
            <div className="workflow-loading">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="workflow-empty">
              No workflows yet. Create one to get started.
            </div>
          ) : (
            <ul className="workflow-list">
              {workflows.map((wf) => (
                <li
                  key={wf.id}
                  className={
                    "workflow-list-item" +
                    (wf.id === selectedId ? " workflow-list-item-active" : "")
                  }
                  onClick={() => handleSelect(wf.id)}
                >
                  <div className="workflow-list-item-top">
                    <span className="workflow-list-name">{wf.name}</span>
                    <div className="workflow-list-actions">
                      <span className="workflow-list-status">{wf.status}</span>
                      <button
                        className="workflow-open-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/editor/${wf.id}`; // ✅ React Router path
                        }}
                      >
                        Open Editor →
                      </button>
                    </div>
                  </div>

                  <div className="workflow-list-meta">
                    <span>
                      Last run:{" "}
                      {wf.last_run_at
                        ? new Date(wf.last_run_at).toLocaleString()
                        : "Never"}
                    </span>
                    <button
                      className="workflow-list-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(wf.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="workflow-editor-panel">
          {!selectedWorkflow ? (
            <div className="workflow-editor-empty">
              Select a workflow or create a new one.
            </div>
          ) : (
            <>
              <div className="workflow-editor-header">
                <h2>Workflow details</h2>
                <button
                  className="workflow-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              <div className="workflow-editor-form">
                <label className="workflow-field">
                  <span className="workflow-field-label">Name</span>
                  <input
                    className="workflow-input"
                    value={selectedWorkflow.name}
                    onChange={(e) =>
                      setSelectedWorkflow((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="workflow-field">
                  <span className="workflow-field-label">Description</span>
                  <textarea
                    className="workflow-textarea"
                    value={selectedWorkflow.description || ""}
                    onChange={(e) =>
                      setSelectedWorkflow((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="workflow-field">
                  <span className="workflow-field-label">Status</span>
                  <select
                    className="workflow-select"
                    value={selectedWorkflow.status}
                    onChange={(e) =>
                      setSelectedWorkflow((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>

                <label className="workflow-field">
                  <span className="workflow-field-label">
                    Definition (JSON)
                  </span>
                  <textarea
                    className="workflow-definition"
                    value={definitionText}
                    onChange={handleDefinitionChange}
                  />
                  <small className="workflow-help-text">
                    This JSON will later be edited via the visual canvas.
                  </small>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
