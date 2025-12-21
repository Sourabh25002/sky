// src/pages/EditorPage/EditorPage.jsx
import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./EditorPage.css";

const API_BASE = "http://localhost:8000/api/workflows";

const nodeTypes = {
  // ✅ START NODE (Entry point - NO target handle)
  start: ({ data }) => (
    <div className="node start-node">
      <div className="node-header">▶ Start</div>
      <div className="node-body">{data.label || "Workflow Entry"}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  webhook: ({ data }) => (
    <div className="node webhook-node">
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">🌐 Webhook</div>
      <div className="node-body">{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  openai: ({ data }) => (
    <div className="node openai-node">
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">🤖 OpenAI</div>
      <div className="node-body">{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  slack: ({ data }) => (
    <div className="node slack-node">
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">💬 Slack</div>
      <div className="node-body">{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  http: ({ data }) => (
    <div className="node http-node">
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">🔗 HTTP</div>
      <div className="node-body">{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
};

const EditorPage = () => {
  const { workflowId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onKeyDown = useCallback(
    (event) => {
      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onEdgeDoubleClick = useCallback(
    (_event, edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(
    () => {
      if (!workflowId) {
        setLoading(false);
        return;
      }

      fetch(`${API_BASE}/${workflowId}`, { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Workflow not found");
          return res.json();
        })
        .then((data) => {
          setWorkflow(data);
          setNodes(data.definition?.nodes || []);
          setEdges(data.definition?.edges || []);
        })
        .catch((error) => {
          console.error("Failed to load workflow:", error);
          setWorkflow(null);
        })
        .finally(() => setLoading(false));
    },
    [workflowId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSave = async () => {
    if (!workflowId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${workflowId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definition: { nodes, edges } }),
      });
      if (res.ok) {
        alert("✅ Saved!");
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      alert("❌ Save failed");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow");
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `${type.toUpperCase()} Node` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // ✅ UPDATED: START NODE FIRST
  const nodeSelector = [
    { id: "start", label: "▶ Start", type: "start" },
    { id: "webhook", label: "🌐 Webhook", type: "webhook" },
    { id: "openai", label: "🤖 OpenAI", type: "openai" },
    { id: "slack", label: "💬 Slack", type: "slack" },
    { id: "http", label: "🔗 HTTP", type: "http" },
  ];

  if (loading) return <div className="loading">Loading editor...</div>;
  if (!workflow)
    return <div className="workflow-not-found">Workflow not found</div>;

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <h1>{workflow.name}</h1>
          <span className="workflow-status">{workflow.status}</span>
        </div>
        <div className="editor-actions">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Back
          </button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </div>

      <div className="editor-main">
        <div
          className={`node-selector ${isSidebarOpen ? "open" : "collapsed"}`}
        >
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? "◀" : "▶"}
          </div>

          {isSidebarOpen && (
            <>
              <h3>Nodes</h3>
              <div className="node-types">
                {nodeSelector.map((node) => (
                  <div
                    key={node.id}
                    className="node-type-item"
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData(
                        "application/reactflow",
                        node.type
                      )
                    }
                  >
                    {node.label || node.id}
                  </div>
                ))}
              </div>
              <div className="delete-instructions">
                <strong>⌨️ Delete:</strong> Select + Backspace/Delete
                <br />
                <strong>🖱️ Edge:</strong> Double-click
              </div>
            </>
          )}
        </div>

        <div
          className="editor-canvas"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            connectionMode="loose"
            nodesConnectable={true}
            nodesDraggable={true}
            edgesConnectable={true}
            deleteKeyCode={46}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
