// Sidebar.jsx
import "./Sidebar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { authClient } from "../../utils/auth";
import {
  Workflow,
  Key,
  Activity,
  Zap,
  CreditCard,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const Sidebar = () => {
  const { data: session, isPending } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(true);
  const userName = session?.user?.name || "Account";

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!session?.user) {
      alert("Please sign in before upgrading.");
      return;
    }
    await authClient.checkout({ slug: "pro" });
  };

  const handleBillingPortal = async (e) => {
    e.preventDefault();
    await authClient.customer.portal();
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Glow div removed for matte look */}

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

          <div className="collapse-icon">
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </div>
        </button>

        <nav className="sidebar-nav">
          <SidebarItem
            icon={<Workflow size={18} />}
            label="Workflow"
            to="/dashboard/workflow"
          />
          <SidebarItem
            icon={<Key size={18} />}
            label="Credentials"
            to="/dashboard/credential"
          />
          <SidebarItem
            icon={<Activity size={18} />}
            label="Executions"
            to="/dashboard/execution"
          />
        </nav>
      </div>

      <div className="sidebar-footer">
        <SidebarItem
          icon={<Zap size={18} />}
          label="Upgrade to Pro"
          onClick={handleUpgrade}
          className="upgrade-item"
        />
        <SidebarItem
          icon={<CreditCard size={18} />}
          label="Billing Portal"
          onClick={handleBillingPortal}
        />
        <div className="separator"></div>
        <SidebarItem
          icon={<User size={18} />}
          label={isPending ? "Loading..." : userName}
          to="/dashboard/profile"
        />
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to, onClick, className = "" }) => {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <NavLink
      to={to || "#"}
      onClick={handleClick}
      className={({ isActive }) =>
        `sidebar-item ${isActive ? "sidebar-item-active" : ""} ${className}`
      }
    >
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
      {/* Removed active-indicator div */}
    </NavLink>
  );
};

export default Sidebar;
