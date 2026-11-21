import api from "./adminApi";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function uploadImages(files, folder = "primenest") {
  const fd = new FormData();
  [...files].forEach((f) => fd.append("images", f));
  fd.append("folder", folder);
  const { data } = await api.post("/uploads", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return (data.urls || []).map((u) => (u.startsWith("/") ? BACKEND + u : u));
}
