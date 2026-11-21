import { create } from "zustand";
import axios from "axios";

export const portalApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/agent`,
  withCredentials: true,
});
portalApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("admin_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
const unwrap = (p) => p.then((r) => r.data.data);

export const usePortalStore = create((set) => ({
  user: null,
  unread: 0,
  setUser: (user) => set({ user }),
  setUnread: (unread) => set({ unread }),
}));

export const agentApi = {
  dashboard: () => unwrap(portalApi.get("/dashboard")),
  properties: (params) => unwrap(portalApi.get("/properties", { params })),
  property: (id) => unwrap(portalApi.get(`/properties/${id}`)),
  createProperty: (body) => unwrap(portalApi.post("/properties", body)),
  updateProperty: (id, body) => unwrap(portalApi.put(`/properties/${id}`, body)),
  deleteProperty: (id) => unwrap(portalApi.delete(`/properties/${id}`)),
  submitProperty: (id) => unwrap(portalApi.post(`/properties/${id}/submit`)),
  pipeline: () => unwrap(portalApi.get("/leads/pipeline")),
  lead: (id) => unwrap(portalApi.get(`/leads/${id}`)),
  createLead: (body) => unwrap(portalApi.post("/leads", body)),
  moveLead: (id, status) => unwrap(portalApi.put(`/leads/${id}/move`, { status })),
  logLeadActivity: (id, body) => unwrap(portalApi.post(`/leads/${id}/activity`, body)),
  bookings: (params) => unwrap(portalApi.get("/bookings", { params })),
  createBooking: (body) => unwrap(portalApi.post("/bookings", body)),
  setBookingStatus: (id, status) => unwrap(portalApi.put(`/bookings/${id}/status`, { status })),
  acceptBooking: (id) => unwrap(portalApi.post(`/bookings/${id}/accept`)),
  declineBooking: (id, note) => unwrap(portalApi.post(`/bookings/${id}/decline`, { note })),
  rescheduleBooking: (id, bookingDate) => unwrap(portalApi.post(`/bookings/${id}/reschedule`, { bookingDate })),
  feedbackBooking: (id, feedback) => unwrap(portalApi.post(`/bookings/${id}/feedback`, { feedback })),
  commissions: (params) => unwrap(portalApi.get("/commissions", { params })),
  requestPayout: (id) => unwrap(portalApi.post(`/commissions/${id}/request-payout`)),
  agentProfile: () => unwrap(portalApi.get("/profile/agent")),
  updateAgentProfile: (body) => unwrap(portalApi.put("/profile/agent", body)),
  notifications: (params) => unwrap(portalApi.get("/notifications", { params })),
};
