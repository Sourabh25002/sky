// Sidebar.jsx
import "./Sidebar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { authClient } from "../../utils/auth";

const Sidebar = () => {
  const { data: session, isPending } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(true);

  const userName = session?.user?.name || "Account";

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const handleUpgrade = async (e) => {
    e.preventDefault(); // prevent any navigation
    if (!session?.user) {
      // optional: redirect to login or show message
      alert("Please sign in before upgrading.");
      return;
    }

    await authClient.checkout({
      slug: "pro", // must match slug in your backend checkout config
    });
    // This will redirect to the Polar checkout page
  };

  const handleBillingPortal = async (e) => {
    e.preventDefault();
    await authClient.customer.portal();
  };

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
        <SidebarItem
          icon="🚀"
          label="Upgrade to Pro"
          onClick={handleUpgrade}
          // to="/dashboard/upgrade"
        />
        <SidebarItem
          icon="💳"
          label="Billing Portal"
          onClick={handleBillingPortal}
        />
        <SidebarItem
          icon="👤"
          label={isPending ? "Loading..." : userName}
          to="/dashboard/profile"
        />
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to, onClick }) => {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault(); // stop NavLink navigation
      onClick(e); // run your handler (checkout / portal)
    }
  };

  return (
    <NavLink
      to={to || "#"}
      onClick={handleClick}
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
