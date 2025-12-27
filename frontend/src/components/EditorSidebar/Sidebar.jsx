import { useState } from "react";
import "./Sidebar.css";
import { NODE_TEMPLATES } from "../../utils/nodeCatalog";

export default function EditorSidebar() {
  const [collapsed, setCollapsed] = useState(true);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className={`editorSidebar ${collapsed ? "isCollapsed" : ""}`}>
      <div className="editorSidebarTop">
        <div className="editorSidebarTitle">Nodes</div>

        <button
          type="button"
          className="editorSidebarToggle"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <div className="editorSidebarList">
        {NODE_TEMPLATES.map((n) => (
          <div
            key={n.type}
            className="editorSidebarItem"
            draggable
            onDragStart={(e) => onDragStart(e, n.type)}
            title={n.label}
          >
            <img className="editorSidebarIcon" src={n.icon} alt="" />
            <span className="editorSidebarLabel">{n.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
