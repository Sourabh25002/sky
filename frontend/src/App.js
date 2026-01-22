import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import DashboardLayout from "./pages/DashboardPage/DashboardPage";
import Login from "./pages/AuthenticationPage/LoginPage";
import Signup from "./pages/AuthenticationPage/SignupPage";
import LandingPage from "./pages/LandingPage/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkflowPage from "./pages/WorkflowPage/WorkflowPage";
import CredentialPage from "./pages/CredentialsPage/CredentialPage";
import ExecutionPage from "./pages/ExecutionsPage/ExecutionPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import EditorPage from "./pages/EditorPage/EditorPage";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <WorkflowPage />,
          },
          { path: "dashboard/workflow", element: <WorkflowPage /> },
          { path: "dashboard/credential", element: <CredentialPage /> },
          { path: "dashboard/execution", element: <ExecutionPage /> },
          { path: "dashboard/profile", element: <ProfilePage /> },
          { path: "editor/:workflowId", element: <EditorPage /> },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <LandingPage />,
  },
]);

function App() {
  return (
    <ReactFlowProvider>
      <RouterProvider router={router} />
    </ReactFlowProvider>
  );
}

export default App;
