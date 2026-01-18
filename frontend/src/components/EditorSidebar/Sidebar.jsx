import "./Sidebar.css";
import { useState, memo } from "react";
import { NODE_TEMPLATES } from "../../utils/nodeCatalog";
import { PanelLeftClose, PanelLeftOpen, GripVertical } from "lucide-react";

// Drag start handler to set data for the dragged node
const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

// Sidebar component for the editor
const EditorSidebar = memo(function EditorSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`editorSidebar ${collapsed ? "isCollapsed" : ""}`}>
      <div className="editorSidebarTop">
        <div className="editorSidebarTitle">Toolbox</div>

        <button
          type="button"
          className="editorSidebarToggle"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
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
            {/* Grip icon for visual cue (hidden when collapsed) */}
            <div className="drag-handle">
              <GripVertical size={14} />
            </div>

            <img className="editorSidebarIcon" src={n.icon} alt={n.label} />
            <span className="editorSidebarLabel">{n.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
});

export default EditorSidebar;
