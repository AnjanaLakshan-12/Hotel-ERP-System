import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredUser } from "../services/userService";
import { canAccess, getDefaultPathForRole, routePermissions } from "../utils/roleAccess";

function ProtectedRoute() {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = routePermissions[location.pathname];

  if (!allowedRoles) {
    return <Outlet />;
  }

  if (!canAccess(user.role, allowedRoles)) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;