// Sidebar.jsx
import "./Sidebar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { authClient } from "../../utils/auth";

const Sidebar = () => {
  const { data: session, isPending } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(false);

  const userName = session?.user?.name || "Account";

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-top">
        <button
          type="button"
          className="sidebar-header"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="logo">
            <img src="/logo.svg" alt="Sky logo" className="logo-img" />
          </div>
          <span className="logo-text">sky</span>
        </button>

        <nav className="sidebar-nav">
          <SidebarItem icon="⚙️" label="Workflow" to="/dashboard/workflow" />
          <SidebarItem
            icon="🔑"
            label="Credentials"
            to="/dashboard/credential"
          />
          <SidebarItem icon="📊" label="Executions" to="/dashboard/execution" />
        </nav>
      </div>

      <div className="sidebar-footer">
        <SidebarItem icon="🚀" label="Upgrade to Pro" to="/dashboard/upgrade" />
        <SidebarItem icon="💳" label="Billing Portal" to="/dashboard/billing" />
        <SidebarItem
          icon="👤"
          label={isPending ? "Loading..." : userName}
          to="/dashboard/profile"
        />
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "sidebar-item" + (isActive ? " sidebar-item-active" : "")
      }
    >
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
    </NavLink>
  );
};

export default Sidebar;
