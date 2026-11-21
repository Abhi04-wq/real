import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/adminApi";
import { uploadImages } from "../../lib/upload";
import { Field, inputCls, Badge } from "../../admin/components/ui";

export default function Profile() {
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", profileImage: "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const loginPath = "/login";

  const fetchProfile = () => {
    setLoading(true);
    setLoadError("");
    setUnauthorized(false);
    api.get("/admin/profile").then(({ data }) => {
      setP(data);
      setForm({ name: data.user.name || "", phone: data.user.phone || "", profileImage: data.user.profileImage || "" });
    }).catch((err) => {
      const status = err.response?.status;
      if (status === 401) {
        localStorage.removeItem("admin_token");
        setUnauthorized(true);
        const reason = err.response?.data?.message || "Not authenticated";
        setLoadError(`Session invalid (${reason}). Please log in again.`);
        return;
      }
      const d = err.response?.data;
      const extra = d?.stack ? `\n\nServer trace:\n${String(d.stack).split("\n").slice(0, 5).join("\n")}` : "";
      setLoadError(`${d?.message || err.message || "Failed to load profile. Check backend connection."}${extra} (HTTP ${status || "?"})`);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const save = async (e) => {
    e.preventDefault(); setMsg({ type: "", text: "" });
    try {
      const { data } = await api.put("/admin/profile", form);
      setP({ ...p, user: data.user });
      setMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (err) { setMsg({ type: "err", text: err.response?.data?.message || "Update failed" }); }
  };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [url] = await uploadImages([file], "profiles");
      setForm({ ...form, profileImage: url });
    } catch { setMsg({ type: "err", text: "Image upload failed" }); }
    finally { setUploading(false); }
  };
  const changePw = async (e) => {
    e.preventDefault(); setMsg({ type: "", text: "" });
    if (pw.newPassword !== pw.confirm) return setMsg({ type: "err", text: "New passwords do not match" });
    try {
      await api.post("/admin/profile/change-password", { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setMsg({ type: "ok", text: "Password changed successfully." });
    } catch (err) { setMsg({ type: "err", text: err.response?.data?.message || "Password change failed" }); }
  };

  if (loading) return <p className="text-slate-500">Loading profile…</p>;
  if (loadError || !p) return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
      <p className="text-sm font-bold text-rose-700">Failed to load profile</p>
      <pre className="mt-1 text-xs text-rose-600 whitespace-pre-wrap text-left max-h-48 overflow-y-auto">{loadError || "Profile not found. You may not have Admin/Manager access."}</pre>
      <div className="mt-3 flex items-center justify-center gap-2">
        {unauthorized ? (
          <button onClick={() => navigate(loginPath)} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">Go to Login</button>
        ) : (
          <button onClick={fetchProfile} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">Retry</button>
        )}
      </div>
    </div>
  );
  const { user, employee } = p;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-4">
            {form.profileImage ? <img src={form.profileImage} className="h-20 w-20 rounded-full object-cover border" /> : <span className="grid h-20 w-20 place-items-center rounded-full bg-[#F7F6F2] text-xl font-bold">{user.name?.[0]}</span>}
            <div><p className="text-lg font-bold">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p><Badge value={user.role} tone="blue" /></div>
          </div>
          {(employee?.employeeId || employee?.department) && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p><b>Employee ID:</b> {employee.employeeId || "—"}</p>
              <p><b>Department:</b> {employee.department || "—"}</p>
              <p><b>Designation:</b> {employee.designation || "—"}</p>
              <p><b>Joined:</b> {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}</p>
            </div>)}
        </div>
        <form onSubmit={save} className="rounded-2xl border bg-white p-5 space-y-3">
          <h3 className="font-semibold">Edit profile</h3>
          {msg.text && <p className={`rounded-lg px-3 py-2 text-sm ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
          <Field label="Full name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Profile image">
            <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 inline-block">
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
            </label>
          </Field>
          <button className="w-full rounded-lg bg-slate-900 py-2 text-sm text-white">Save changes</button>
        </form>
      </div>
      <form onSubmit={changePw} className="h-fit rounded-2xl border bg-white p-5 space-y-3">
        <h3 className="font-semibold">Change password</h3>
        <Field label="Current password"><input type="password" required className={inputCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password"><input type="password" required className={inputCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
        <Field label="Confirm new password"><input type="password" required className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
        <button className="w-full rounded-lg bg-slate-900 py-2 text-sm text-white">Change password</button>
      </form>
    </div>
  );
}
