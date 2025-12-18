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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./EditorPage.css";

const API_BASE = "http://localhost:8000/api/workflows";

const nodeTypes = {
  webhook: ({ data }) => (
    <div className="node webhook-node">
      <div className="node-header">🌐 Webhook</div>
      <div className="node-body">{data.label}</div>
      <div className="react-flow__handle react-flow__handle__target" />
      <div className="react-flow__handle react-flow__handle__source" />
    </div>
  ),
  openai: ({ data }) => (
    <div className="node openai-node">
      <div className="node-header">🤖 OpenAI</div>
      <div className="node-body">{data.label}</div>
      <div className="react-flow__handle react-flow__handle__target" />
      <div className="react-flow__handle react-flow__handle__source" />
    </div>
  ),
  slack: ({ data }) => (
    <div className="node slack-node">
      <div className="node-header">💬 Slack</div>
      <div className="node-body">{data.label}</div>
      <div className="react-flow__handle react-flow__handle__target" />
      <div className="react-flow__handle react-flow__handle__source" />
    </div>
  ),
  http: ({ data }) => (
    <div className="node http-node">
      <div className="node-header">🔗 HTTP</div>
      <div className="node-body">{data.label}</div>
      <div className="react-flow__handle react-flow__handle__target" />
      <div className="react-flow__handle react-flow__handle__source" />
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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
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
  }, [workflowId, setNodes, setEdges]);

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
      if (res.ok) alert("✅ Saved!");
    } catch (err) {
      alert("❌ Save failed");
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

  const nodeSelector = [
    { id: "webhook", label: "Webhook", type: "webhook" },
    { id: "openai", label: "OpenAI", type: "openai" },
    { id: "slack", label: "Slack", type: "slack" },
    { id: "http", label: "HTTP", type: "http" },
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
        <div className="node-selector">
          <h3>Nodes</h3>
          <div className="node-types">
            {nodeSelector.map((node) => (
              <div
                key={node.id}
                className="node-type-item"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData("application/reactflow", node.type)
                }
              >
                {node.id}
              </div>
            ))}
          </div>
        </div>

        <div className="editor-canvas" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            connectionMode="loose" // ✅ CONNECT ANY HANDLES
            nodesConnectable={true} // ✅ ENABLE CONNECTIONS
            nodesDraggable={true} // ✅ DRAG NODES
            edgesConnectable={true} // ✅ EDIT EDGES
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
