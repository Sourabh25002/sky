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
import NodeModal from "../../components/NodeModal";
import { useExecuteWorkflow } from "../../hooks/useExecuteWorkflow";
import "./EditorPage.css";

const API_BASE = "http://localhost:8000/api/workflows";

const nodeTypes = {
  start: ({ data }) => (
    <div className={`node start-node ${data.status || ""}`}>
      <div className="node-header">▶ Start</div>
      <div className="node-body">{data.label || "Workflow Entry"}</div>
      {data.status === "success" && <div className="status success">✅</div>}
      {data.status === "error" && <div className="status error">❌</div>}
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  webhook: ({ data }) => (
    <div className={`node webhook-node ${data.status || ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">🌐 Webhook</div>
      <div className="node-body">{data.label || "Configure"}</div>
      {data.result && (
        <div className="result">{data.result.slice(0, 50)}...</div>
      )}
      {data.status === "success" && <div className="status success">✅</div>}
      {data.status === "error" && <div className="status error">❌</div>}
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  openai: ({ data }) => (
    <div className={`node openai-node ${data.status || ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">🤖 OpenAI</div>
      <div className="node-body">{data.label || "Configure"}</div>
      {data.result && (
        <div className="result">{data.result.slice(0, 50)}...</div>
      )}
      {data.status === "success" && <div className="status success">✅</div>}
      {data.status === "error" && <div className="status error">❌</div>}
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  slack: ({ data }) => (
    <div className={`node slack-node ${data.status || ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">💬 Slack</div>
      <div className="node-body">{data.label || "Configure"}</div>
      {data.result && (
        <div className="result">{data.result.slice(0, 50)}...</div>
      )}
      {data.status === "success" && <div className="status success">✅</div>}
      {data.status === "error" && <div className="status error">❌</div>}
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  ),
  http: ({ data }) => (
    <div className={`node http-node ${data.status || ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <div className="node-header">🔗 HTTP</div>
      <div className="node-body">
        {data.url ? `${data.url.slice(0, 40)}...` : "Configure URL"}
        {data.result && (
          <div className="result">{data.result.slice(0, 80)}...</div>
        )}
        {data.error && (
          <div className="error">❌ {data.error.slice(0, 50)}</div>
        )}
      </div>
      {data.status === "success" && <div className="status success">✅</div>}
      {data.status === "error" && <div className="status error">❌</div>}
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
  const [selectedNode, setSelectedNode] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ STEP 5: Execute workflow hook
  const { executeWorkflow, isPending: executePending } = useExecuteWorkflow();

  // ✅ Manual trigger detection (Step 2)
  const [hasManualTrigger, setHasManualTrigger] = useState(false);

  useEffect(() => {
    const hasTrigger = nodes.some((node) => node.type === "start");
    setHasManualTrigger(hasTrigger);
  }, [nodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
    [setNodes, setEdges]
  );

  const onEdgeDoubleClick = useCallback(
    (_event, edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowModal(true);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const handleNodeSave = useCallback(
    (formData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode?.id
            ? { ...node, data: { ...node.data, ...formData } }
            : node
        )
      );
      setShowModal(false);
    },
    [selectedNode, setNodes]
  );

  // ✅ STEP 5: Execute handler
  const handleExecuteClick = async () => {
    if (!workflowId) {
      alert("No workflow ID!");
      return;
    }

    try {
      await executeWorkflow(workflowId);
      alert("✅ Workflow sent to background execution!");
    } catch (error) {
      alert("❌ Execution failed: " + error.message);
    }
  };

  // Load workflow
  const loadWorkflow = useCallback(
    async (id) => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Workflow not found");

        const data = await res.json();
        setWorkflow(data);
        setNodes(data.definition?.nodes || []);
        setEdges(data.definition?.edges || []);
      } catch (error) {
        console.error("Failed to load workflow:", error);
        setWorkflow(null);
      } finally {
        setLoading(false);
      }
    },
    [setNodes, setEdges, setWorkflow, setLoading]
  );

  useEffect(() => {
    loadWorkflow(workflowId);
  }, [workflowId, loadWorkflow]);

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
          <h1>{workflow.name || "Untitled Workflow"}</h1>
          <span className="workflow-status">{workflow.status || "Draft"}</span>
        </div>
        <div className="editor-actions">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Back
          </button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "💾 Save"}
          </button>

          {/* ✅ STEP 5: Execute Button */}
          {hasManualTrigger && (
            <button
              className={`execute-btn ${executePending ? "executing" : ""}`}
              onClick={handleExecuteClick}
              disabled={executePending || !workflowId}
            >
              {executePending ? "⏳ Sending..." : "🚀 Execute Workflow"}
            </button>
          )}
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
                    {node.label}
                  </div>
                ))}
              </div>
              <div className="delete-instructions">
                <strong>⌨️ Delete:</strong> Select + Backspace/Delete
                <br />
                <strong>🖱️ Edge:</strong> Double-click
                <br />
                <strong>⚙️ Configure:</strong> Click any node
                <br />
                <strong>🚀 Execute:</strong> Needs Start node
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
            onNodeClick={onNodeClick}
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

      <NodeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        nodeType={selectedNode?.type}
        nodeData={selectedNode?.data}
        onSave={handleNodeSave}
      />
    </div>
  );
};

export default EditorPage;
