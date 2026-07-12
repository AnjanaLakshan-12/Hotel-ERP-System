import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "../services/userService";

function ProtectedRoute() {
  const user = getStoredUser();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
