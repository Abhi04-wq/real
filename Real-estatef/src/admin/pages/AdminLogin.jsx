import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/adminApi";

export default function AdminLogin({ redirectTo = "/panel", title = "Super Admin Login" }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      if (data.token) localStorage.setItem("admin_token", data.token);
      nav(redirectTo);
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#F7F7F2] p-4 text-[#1C2421]">
      <div className="w-full max-w-sm rounded-2xl border border-[#E4E7E5] bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(28,36,33,0.04)]">
        <div className="mb-6 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#176B5B] text-white font-bold text-lg mb-3 shadow-xs">
            P
          </div>
          <h1 className="text-xl font-bold text-[#1C2421] tracking-tight">{title}</h1>
          <p className="mt-1 text-xs text-[#6B746F]">Real Estate Enterprise Management Console</p>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-[#F8D7D7] bg-[#FDF2F2] px-3.5 py-2.5 text-xs text-[#C65353]">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B746F] mb-1.5">Work Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-[#E4E7E5] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C2421] placeholder-[#6B746F] outline-none transition focus:border-[#176B5B] focus:ring-2 focus:ring-[#176B5B]/15"
              placeholder="name@primenest.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B746F] mb-1.5">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-[#E4E7E5] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C2421] placeholder-[#6B746F] outline-none transition focus:border-[#176B5B] focus:ring-2 focus:ring-[#176B5B]/15"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-[#176B5B] py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#115044] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Authenticating…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-[#E4E7E5] bg-[#F7F7F2] p-3 text-center">
          <p className="text-[11px] text-[#6B746F]">
            Default Seed: <span className="font-mono font-medium text-[#1C2421]">superadmin@primenest.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
