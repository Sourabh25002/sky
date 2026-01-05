import "./DashboardPage.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        {/* This is where Workflow, Credentials, Executions etc. pages will be displayed */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
