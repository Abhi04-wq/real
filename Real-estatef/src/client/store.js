import { create } from "zustand";
import axios from "axios";

export const clientApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/client`,
  withCredentials: true,
});
clientApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("admin_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
const unwrap = (p) => p.then((r) => r.data.data);

// mode: 'buying' | 'selling' (persisted soSeller stays in seller view)
export const useClientStore = create((set) => ({
  user: null,
  mode: localStorage.getItem("client_mode") || "buying",
  setUser: (user) => set({ user }),
  setMode: (mode) => { localStorage.setItem("client_mode", mode); set({ mode }); },
}));

export const client = {
  overview: () => unwrap(clientApi.get("/overview")),
  bookTour: (body) => unwrap(clientApi.post("/bookings", body)),
  myBookings: () => unwrap(clientApi.get("/bookings")),
  cancelBooking: (id) => unwrap(clientApi.post(`/bookings/${id}/cancel`)),
  submitBookingPayment: (id, body) => unwrap(clientApi.post(`/bookings/${id}/payment`, body)),
  favorites: () => unwrap(clientApi.get("/favorites")),
  toggleFavorite: (propertyId) => unwrap(clientApi.post(`/favorites/${propertyId}/toggle`)),
  offers: () => unwrap(clientApi.get("/offers")),
  createOffer: (body) => unwrap(clientApi.post("/offers", body)),
  respondOffer: (id, body) => unwrap(clientApi.post(`/offers/${id}/respond`, body)),
  submitListing: (body) => unwrap(clientApi.post("/listings", body)),
  myListings: () => unwrap(clientApi.get("/listings")),
  updateListing: (id, body) => unwrap(clientApi.put(`/listings/${id}`, body)),
  sellerLeads: () => unwrap(clientApi.get("/seller-leads")),
  transactions: () => unwrap(clientApi.get("/transactions")),
  bookingInvoice: (id) => clientApi.get(`/bookings/${id}/invoice`).then((r) => r.data.invoice || r.data.data?.invoice || r.data),
  transactionInvoice: (id) => clientApi.get(`/transactions/${id}/invoice`).then((r) => r.data.invoice || r.data.data?.invoice || r.data),
  profile: () => unwrap(clientApi.get("/profile")),
  updateProfile: (body) => unwrap(clientApi.put("/profile", body)),
  changePassword: (body) => unwrap(clientApi.post("/change-password", body)),
};
