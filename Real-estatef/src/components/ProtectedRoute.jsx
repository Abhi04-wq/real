import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../lib/authApi";

// allowedRoles: exact roles permitted. SUPER_ADMIN bypasses every check.
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
          Checking your session…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== "SUPER_ADMIN" && !allowedRoles.includes(user.role)) {
    // Authenticated but wrong dashboard → send them to their own dashboard (never leak other roles).
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}
