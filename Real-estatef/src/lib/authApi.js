import axios from "axios";
import { BACKEND_URL } from "../config";

// Cookie-based session: never store JWT in localStorage.
export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const DASHBOARD_PATHS = {
  SUPER_ADMIN: "/panel",
  ADMIN: "/manage",
  MANAGER: "/manage",
  AGENT: "/agent",
  OWNER: "/home/dashboard",
  CUSTOMER: "/home/dashboard",
};

export const getDashboardPath = (role) => DASHBOARD_PATHS[role] || "/customer";

export const authApi = {
  register: (payload) => api.post("/api/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/api/auth/login", payload).then((r) => r.data),
  logout: () => api.post("/api/auth/logout").then((r) => r.data),
  me: () => api.get("/api/auth/me").then((r) => r.data),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (payload) => api.post("/api/auth/reset-password", payload).then((r) => r.data),
};
