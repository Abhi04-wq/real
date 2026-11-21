import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api`,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("admin_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
