import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "./pages/DashboardPage/DashboardPage";
// import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/AuthenticationPage/LoginPage";
import Signup from "./pages/AuthenticationPage/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkflowPage from "./pages/WorkflowPage/WorkflowPage";
import CredentialPage from "./pages/CredentialsPage/CredentialPage";
import ExecutionPage from "./pages/ExecutionsPage/ExecutionPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

// Layout component includes Navbar and renders child routes via Outlet
// function Layout() {
//   return (
//     <>
//       <Navbar />
//       <Outlet />
//     </>
//   );
// }

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />, // 🔐 Session guard
    children: [
      {
        path: "/", // parent dashboard layout
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <WorkflowPage />, // default right-side page
          },
          { path: "dashboard/workflow", element: <WorkflowPage /> },
          { path: "dashboard/credential", element: <CredentialPage /> },
          { path: "dashboard/execution", element: <ExecutionPage /> },
          { path: "dashboard/profile", element: <ProfilePage /> },
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
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
