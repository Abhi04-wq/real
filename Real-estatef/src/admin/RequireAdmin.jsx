import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../lib/adminApi";

export default function RequireAdmin({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });
  const loc = useLocation();
  useEffect(() => {
    api.get("/auth/me")
      .then(() => setState({ loading: false, ok: true }))
      .catch(() => setState({ loading: false, ok: false }));
  }, []);
  if (state.loading) return <div className="min-h-screen grid place-items-center text-slate-500">Verifying session…</div>;
  if (!state.ok) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

