import "./EditorPage.css";
import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import EditorSidebar from "../../components/EditorSidebar/Sidebar";
import { NODE_TEMPLATES } from "../../utils/nodeCatalog";
import IconOnlyNode from "../../components/Node/NodeIcon";
import TriggerNode from "../../components/Node/TriggerNode";

let id = 0;
const getId = () => `node_${id++}`;

function EditorCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  const nodeTypes = useMemo(
    () => ({ trigger: TriggerNode, icon: IconOnlyNode }),
    []
  );
  const templateByType = new Map(NODE_TEMPLATES.map((t) => [t.type, t]));
  const isTrigger = (t) => t.startsWith("trigger.");

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const { getNodes, getEdges } = useReactFlow();

  const onNodesChange = useCallback(
    (changes) => setNodes((ns) => applyNodeChanges(changes, ns)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((es) => addEdge(params, es)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const isValidConnection = useCallback(
    (connection) => {
      const nodes = getNodes();
      const edges = getEdges();

      const source = nodes.find((n) => n.id === connection.source);
      const target = nodes.find((n) => n.id === connection.target);
      if (!source || !target) return false;

      // 1) no self-connection
      if (source.id === target.id) return false;

      // 2) triggers cannot have incoming edges
      if (target.type === "trigger") return false;

      // 3) trigger can connect only to non-trigger (optional but common)
      if (source.type === "trigger" && target.type === "trigger") return false;

      // 4) prevent direct reverse edge (A->B and B->A)
      const reverseExists = edges.some(
        (e) => e.source === target.id && e.target === source.id
      );
      if (reverseExists) return false;

      return true;
    },
    [getNodes, getEdges]
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

      setNodes((ns) =>
        ns.concat({
          id: getId(),
          type: isTrigger(droppedType) ? "trigger" : "icon", // ✅ key change
          position,
          data: {
            icon: tpl?.icon,
            originalType: droppedType,
            label: tpl?.label,
          },
        })
      );
    },
    [screenToFlowPosition]
  );

  return (
    <div className="editorLayout">
      <EditorSidebar />

      <div className="editorCanvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
        </ReactFlow>
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
