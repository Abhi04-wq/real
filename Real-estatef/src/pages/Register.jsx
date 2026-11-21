import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../lib/authApi";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState("buyer"); // buyer | seller
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        accountType,
        customerType: accountType,
      });
      setSuccess("Account created successfully!");
      toast.success("Account created successfully!");
      setTimeout(() => {
        navigate(getDashboardPath(user.role), { replace: true });
      }, 800);
    } catch (err) {
      const data = err.response?.data;
      const details = (data?.errors || []).map((x) => `${x.path}: ${x.message}`).join("; ");
      const msg = details ? `Validation failed: ${details}` : data?.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputWrap = "flex items-center rounded-xl border border-[#E4E7E5] bg-[#FFFFFF] focus-within:border-[#176B5B] focus-within:ring-2 focus-within:ring-[#176B5B]/15 transition";
  const inputCls = "w-full bg-transparent px-3 py-2.5 text-sm text-[#1C2421] outline-none placeholder:text-[#6B746F]";

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
          <h1 className="text-4xl font-bold leading-tight tracking-tight">Create your client account.</h1>
          <p className="text-white/80 mt-4 leading-relaxed text-sm">
            Search verified properties, save favourites, schedule site visits, track transactions, and manage listings.
          </p>
        </div>
        <p className="relative text-xs text-white/50">Secure credential authentication · High encryption standard</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F7F7F2]">
        <div className="w-full max-w-md rounded-2xl border border-[#E4E7E5] bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(28,36,33,0.04)]">
          <h2 className="text-2xl font-bold tracking-tight text-[#1C2421]">Create account</h2>
          <p className="text-sm text-[#6B746F] mt-1">Join as a verified member in under a minute.</p>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-[#F8D7D7] bg-[#FDF2F2] px-4 py-3 text-sm text-[#C65353]">{error}</div>
          )}
          {success && (
            <div role="status" className="mt-4 rounded-xl border border-[#D1EADB] bg-[#EAF5F0] px-4 py-3 text-sm text-[#2E7D5B]">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">I want to join as</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                {[["buyer", "🏠 Buyer", "Search, tour & buy"], ["seller", "🏢 Seller", "List & sell property"]].map(([v, label, hint]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAccountType(v)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition cursor-pointer ${
                      accountType === v
                        ? "border-[#176B5B] bg-[#DCEBE5] text-[#176B5B]"
                        : "border-[#E4E7E5] bg-[#FFFFFF] text-[#6B746F] hover:bg-[#F7F7F2]"
                    }`}
                  >
                    <span className="block text-sm font-bold text-[#1C2421]">{label}</span>
                    <span className={`block text-[11px] ${accountType === v ? "text-[#176B5B]" : "text-[#6B746F]"}`}>{hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">Full name</label>
              <div className={`${inputWrap} mt-1.5`}>
                <User className="ml-3.5 h-4 w-4 text-[#6B746F]" />
                <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" required className={inputCls} autoComplete="name" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">Email</label>
                <div className={`${inputWrap} mt-1.5`}>
                  <Mail className="ml-3.5 h-4 w-4 text-[#6B746F]" />
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} autoComplete="email" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">Phone</label>
                <div className={`${inputWrap} mt-1.5`}>
                  <Phone className="ml-3.5 h-4 w-4 text-[#6B746F]" />
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" required className={inputCls} autoComplete="tel" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">Password</label>
                <div className={`${inputWrap} mt-1.5`}>
                  <Lock className="ml-3.5 h-4 w-4 text-[#6B746F]" />
                  <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 chars" required className={inputCls} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="mr-3 text-[#6B746F] hover:text-[#1C2421]">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-[#6B746F]">Confirm password</label>
                <div className={`${inputWrap} mt-1.5`}>
                  <Lock className="ml-3.5 h-4 w-4 text-[#6B746F]" />
                  <input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required className={inputCls} autoComplete="new-password" />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-[#6B746F] cursor-pointer">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#E4E7E5] accent-[#176B5B]" />
              <span>I agree to the <span className="font-semibold text-[#176B5B]">Terms & Conditions</span> and Privacy Policy.</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#176B5B] py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#115044] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B746F]">
            Already have an account? <Link to="/login" className="font-semibold text-[#176B5B] hover:text-[#115044] transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
