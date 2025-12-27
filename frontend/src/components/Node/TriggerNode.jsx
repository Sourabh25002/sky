import { Handle, Position } from "@xyflow/react";
import "./TriggerNode.css";

export default function TriggerNode({ data }) {
  return (
    <div className="triggerNode">
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="triggerHandle"
      />

      <img className="triggerIcon" src={data.icon} alt="" draggable={false} />
    </div>
  );
}
