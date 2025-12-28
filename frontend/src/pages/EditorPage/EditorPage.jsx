import "./EditorPage.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import EditorSidebar from "../../components/EditorSidebar/Sidebar";
import { NODE_TEMPLATES } from "../../utils/nodeCatalog";
import IconOnlyNode from "../../components/NodeFeatures/NodeIcon";
import TriggerNodeIcon from "../../components/NodeFeatures/TriggerNodeIcon";
import { NodeSettings } from "../../components/NodeFeatures/NodeSettings";

const makeNodeId = (originalType) => `${originalType}-${Date.now()}`;
const makeEdgeId = (source, target) => `${source}-${target}-${Date.now()}`;

function EditorCanvas() {
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({ trigger: TriggerNodeIcon, icon: IconOnlyNode }),
    []
  );

  const templateByType = useMemo(
    () => new Map(NODE_TEMPLATES.map((t) => [t.type, t])),
    []
  );

  const isTrigger = useCallback((t) => t.startsWith("trigger."), []);

  const { workflowId } = useParams();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nodeMenu, setNodeMenu] = useState(null);
  const [hasTriggerNode, setHasTriggerNode] = useState(false);

  const loadFromDb = useCallback(async () => {
    if (!workflowId) return;

    const res = await fetch(
      `http://localhost:8000/api/workflows/${workflowId}`,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!res.ok) throw new Error("Failed to load workflow");
    const wf = await res.json();

    const dbNodes = wf.definition?.nodes ?? [];
    const dbEdges = (wf.definition?.edges ?? []).map((e) => ({
      ...e,
      id: e.id ?? makeEdgeId(e.source, e.target),
    }));

    setNodes(dbNodes);
    setEdges(dbEdges);
  }, [workflowId, setNodes, setEdges]);

  useEffect(() => {
    loadFromDb().catch(console.error);
  }, [loadFromDb]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: params.id ?? makeEdgeId(params.source, params.target),
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const droppedType = event.dataTransfer.getData("application/reactflow");
      if (!droppedType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const tpl = templateByType.get(droppedType);

      const newNode = {
        id: makeNodeId(droppedType), // ✅ like old editor style
        type: isTrigger(droppedType) ? "trigger" : "icon",
        position,
        data: {
          icon: tpl?.icon,
          originalType: droppedType,
          label: tpl?.label,
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, templateByType, isTrigger, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeClick = useCallback((_event, node) => {
    setActiveNodeId(node.id);
    setIsDialogOpen(true);
  }, []);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setNodeMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
  }, []);

  const isValidConnection = useCallback(
    (connection) => {
      const ns = getNodes();
      const es = getEdges();

      const source = ns.find((n) => n.id === connection.source);
      const target = ns.find((n) => n.id === connection.target);
      if (!source || !target) return false;

      if (source.id === target.id) return false;
      if (target.type === "trigger") return false;
      if (source.type === "trigger" && target.type === "trigger") return false;

      const reverseExists = es.some(
        (e) => e.source === target.id && e.target === source.id
      );
      if (reverseExists) return false;

      return true;
    },
    [getNodes, getEdges]
  );

  const deleteNodeAndEdges = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );

      setNodeMenu(null);
      setIsDialogOpen(false);
      setActiveNodeId(null);
    },
    [setNodes, setEdges]
  );

  const onEdgeDoubleClick = useCallback(
    (_event, edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const onSave = useCallback(async () => {
    if (!workflowId) return;

    const res = await fetch(
      `http://localhost:8000/api/workflows/${workflowId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ definition: { nodes, edges } }),
      }
    );

    if (!res.ok) throw new Error("Save failed");

    // ✅ reload so UI matches DB exactly
    await loadFromDb();
  }, [workflowId, nodes, edges, loadFromDb]);

  useEffect(() => {
    const has = nodes.some(
      (n) =>
        n.type === "trigger" || n.data?.originalType?.startsWith("trigger.")
    );
    setHasTriggerNode(has);
  }, [nodes]);

  const onExecute = useCallback(async () => {
    if (!workflowId) return;

    const res = await fetch(
      `http://localhost:8000/api/workflows/${workflowId}/execute`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!res.ok) throw new Error("Execute failed");
  }, [workflowId]);

  return (
    <div className="editorLayout">
      <EditorSidebar />

      <div className="editorCanvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={() => setNodeMenu(null)}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          isValidConnection={isValidConnection}
          fitView
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Dots} gap={30} size={1} />
          <MiniMap />
          <Controls />

          <Panel position="top-right">
            <div className="topButtons">
              <button type="button" className="saveBtn" onClick={onSave}>
                Save
              </button>

              {hasTriggerNode && (
                <button
                  type="button"
                  className="executeBtn"
                  onClick={onExecute}
                >
                  Execute
                </button>
              )}
            </div>
          </Panel>
        </ReactFlow>

        <NodeSettings
          open={isDialogOpen}
          node={nodes.find((n) => n.id === activeNodeId)}
          onClose={() => setIsDialogOpen(false)}
          setNodes={setNodes}
        />

        {nodeMenu && (
          <div
            className="nodeContextMenu"
            style={{ left: nodeMenu.x, top: nodeMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => deleteNodeAndEdges(nodeMenu.nodeId)}
            >
              Delete node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  );
}
