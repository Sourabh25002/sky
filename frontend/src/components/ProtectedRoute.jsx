import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "../utils/auth";

const ProtectedRoute = () => {
  const { data: session, isPending } = authClient.useSession();

  // ⏳ Still checking session
  if (isPending) {
    return <div>Loading...</div>;
  }

  // ❌ Not logged in
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in → allow access
  return <Outlet />;
};

export default ProtectedRoute;
