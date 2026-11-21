import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../lib/adminApi";

const ManageContext = createContext({ user: null, permissions: [], has: () => false });
export const useManage = () => useContext(ManageContext);

export default function RequireManager({ children }) {
  const [state, setState] = useState({ loading: true, user: null, permissions: [] });
  const loc = useLocation();
  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => setState({ loading: false, user: data.user, permissions: data.permissions || [] }))
      .catch(() => setState({ loading: false, user: null, permissions: [] }));
  }, []);
  if (state.loading) return <div className="min-h-screen grid place-items-center text-slate-500">Verifying session…</div>;
  if (!state.user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(state.user.role))
    return <div className="min-h-screen grid place-items-center text-slate-500">Forbidden: Admin/Manager access only.</div>;
  const has = (perm) =>
    state.user.role === "SUPER_ADMIN" || state.permissions.includes("*") || state.permissions.includes(perm);
  return (
    <ManageContext.Provider value={{ user: state.user, permissions: state.permissions, has }}>
      {children}
    </ManageContext.Provider>
  );
}
