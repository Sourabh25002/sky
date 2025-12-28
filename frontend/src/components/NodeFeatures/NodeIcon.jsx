import { Handle, Position } from "@xyflow/react";
import "./NodeIcon.css";

export default function IconOnlyNode({ data }) {
  return (
    <div className="iconNode">
      {/* add handles so it can connect */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <img className="iconNodeImg" src={data.icon} alt="" draggable={false} />
    </div>
  );
}
