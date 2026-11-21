import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, getDashboardPath } from "../lib/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const data = await authApi.login({ email, password, rememberMe });
    // Store JWT for adminApi (Bearer) too — public /login otherwise leaves
    // /manage & /panel calls without a token and they 401 after redirect.
    if (data.token) localStorage.setItem("admin_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    if (data.token) localStorage.setItem("admin_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("admin_token");
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, dashboardPath: user ? getDashboardPath(user.role) : "/" }),
    [user, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
