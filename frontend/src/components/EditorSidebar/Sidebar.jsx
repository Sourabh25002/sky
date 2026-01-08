import "./Sidebar.css";
import { useState, memo } from "react";
import { NODE_TEMPLATES } from "../../utils/nodeCatalog";

// Drag start handler to set data for the dragged node
const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

// Sidebar component for the editor
const EditorSidebar = memo(function EditorSidebar() {
  const [collapsed, setCollapsed] = useState(true);

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
          {collapsed ? (
            <svg width="10" height="10" viewBox="0 0 24 24">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
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
            <img className="editorSidebarIcon" src={n.icon} alt={n.label} />
            <span className="editorSidebarLabel">{n.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
});

export default EditorSidebar;
