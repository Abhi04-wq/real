import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import api from "../lib/adminApi";
import { usePortalStore } from "./store";

const AgentContext = createContext(null);
export const useAgent = () => useContext(AgentContext);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function Guard({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });
  const setUser = usePortalStore((s) => s.setUser);
  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => {
        if (["AGENT", "SUPER_ADMIN"].includes(data.user.role)) {
          setUser(data.user);
          setState({ loading: false, ok: true });
        } else setState({ loading: false, ok: false, forbidden: true });
      })
      .catch(() => setState({ loading: false, ok: false }));
  }, [setUser]);
  if (state.loading) return <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-500">Verifying agent session…</div>;
  if (state.forbidden) return <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-500">Forbidden: agent access only.</div>;
  if (!state.ok) return <Navigate to="/login" state={{ from: "/agent" }} replace />;
  return children;
}

export default function RequireAgent({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Guard>{children}</Guard>
    </QueryClientProvider>
  );
}
