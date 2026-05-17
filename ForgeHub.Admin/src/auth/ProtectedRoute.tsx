import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (session.user.role === "Member") {
    return <Navigate to="/access-denied" replace />;
  }
  return <Outlet />;
}
