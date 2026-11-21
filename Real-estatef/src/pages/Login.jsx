import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../lib/authApi";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password, rememberMe });
      toast.success(`Welcome back, ${(user.name || user.fullName || "there").split(" ")[0]}!`);
      const from = location.state?.from;
      navigate(from || getDashboardPath(user.role), { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const details = (data?.errors || []).map((x) => `${x.path}: ${x.message}`).join("; ");
      const msg = details ? `Validation failed: ${details}` : data?.message || "Invalid email or password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F7F2] text-[#1C2421]">
      <Toaster position="top-center" />

      {/* Left: branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#176B5B] via-[#115044] to-[#1C2421] text-white p-12 flex-col justify-between relative overflow-hidden">
        <img src="/hero-building-4k.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="bg-white text-[#176B5B] p-2 rounded-xl shadow-xs"><Building2 className="h-5 w-5" /></span>
            <span className="font-bold text-lg tracking-tight">PrimeNest Properties</span>
          </Link>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">Real estate, managed professionally.</h1>
          <p className="text-white/80 mt-4 leading-relaxed text-sm">
            One unified portal for buyers, sellers, agents, and administrators. Search, tour, close, and manage seamlessly.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-white/80">
            <li className="flex items-center gap-2"><span className="text-[#DCEBE5] font-bold">✓</span> Verified architectural listings and transparent transactions</li>
            <li className="flex items-center gap-2"><span className="text-[#DCEBE5] font-bold">✓</span> Role-based workflows and real-time manager approvals</li>
            <li className="flex items-center gap-2"><span className="text-[#DCEBE5] font-bold">✓</span> Secure session credentials and enterprise encryption</li>
          </ul>
        </div>
        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} PrimeNest Properties · All rights reserved</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F7F7F2]">
        <div className="w-full max-w-md rounded-2xl border border-[#E4E7E5] bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(28,36,33,0.04)]">
          <h2 className="text-2xl font-bold tracking-tight text-[#1C2421]">Welcome back</h2>
          <p className="text-sm text-[#6B746F] mt-1">Sign in to continue to your personal dashboard.</p>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-[#F8D7D7] bg-[#FDF2F2] px-4 py-3 text-sm text-[#C65353]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">Email</label>
              <div className="mt-1.5 flex items-center rounded-xl border border-[#E4E7E5] bg-[#FFFFFF] focus-within:border-[#176B5B] focus-within:ring-2 focus-within:ring-[#176B5B]/15 transition">
                <Mail className="ml-3.5 h-4 w-4 text-[#6B746F]" />
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-[#1C2421] outline-none placeholder:text-[#6B746F]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#176B5B] hover:text-[#115044] transition">Forgot password?</Link>
              </div>
              <div className="mt-1.5 flex items-center rounded-xl border border-[#E4E7E5] bg-[#FFFFFF] focus-within:border-[#176B5B] focus-within:ring-2 focus-within:ring-[#176B5B]/15 transition">
                <Lock className="ml-3.5 h-4 w-4 text-[#6B746F]" />
                <input
                  id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-[#1C2421] outline-none placeholder:text-[#6B746F]"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="mr-3 text-[#6B746F] hover:text-[#1C2421]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#6B746F] cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-[#E4E7E5] accent-[#176B5B]" />
              Remember me
            </label>

            <button
              type="submit" disabled={submitting}
              className="w-full rounded-xl bg-[#176B5B] py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#115044] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B746F]">
            Don&apos;t have an account? <Link to="/register" className="font-semibold text-[#176B5B] hover:text-[#115044] transition">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
