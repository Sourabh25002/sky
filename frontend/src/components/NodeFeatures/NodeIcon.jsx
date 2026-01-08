import { Handle, Position } from "@xyflow/react";
import "./NodeIcon.css";

export default function NodeIcon({ data }) {
  return (
    <div className="iconNode">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <img className="iconNodeImg" src={data.icon} alt="" draggable={false} />
    </div>
  );
}
