import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import api from "../lib/adminApi";
import { useClientStore } from "./store";

export const ClientContext = createContext(null);
export const useClient = () => useContext(ClientContext);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function Guard({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });
  const setUser = useClientStore((s) => s.setUser);
  const loc = useLocation();
  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => {
        if (["CUSTOMER", "OWNER", "SUPER_ADMIN"].includes(data.user.role)) {
          setUser(data.user);
          setState({ loading: false, ok: true });
        } else setState({ loading: false, ok: false, forbidden: true });
      })
      .catch(() => setState({ loading: false, ok: false }));
  }, [setUser]);
  if (state.loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">Loading your space…</div>;
  if (state.forbidden) return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">This portal is for buyers and sellers. <a className="underline" href="/login">Sign in with a customer account</a>.</div>;
  if (!state.ok) return <Navigate to="/login" state={{ from: "/home/dashboard" }} replace />;
  return children;
}

export default function RequireClient({ children }) {
  return <QueryClientProvider client={queryClient}><Guard>{children}</Guard></QueryClientProvider>;
}
