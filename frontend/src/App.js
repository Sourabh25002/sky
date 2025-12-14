import "./App.css";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import Ticker from "./pages/Ticker/Ticker";
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/AuthenticationPage/LoginPage";
import Signup from "./pages/AuthenticationPage/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout component includes Navbar and renders child routes via Outlet
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />, // 🔐 Session guard
    children: [
      {
        element: <Layout />, // Navbar + Outlet
        children: [
          {
            path: "/",
            element: <LandingPage />,
          },
          {
            path: "/ticker",
            element: <Ticker />,
          },
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
