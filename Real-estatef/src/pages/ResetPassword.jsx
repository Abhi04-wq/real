import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { authApi } from "../lib/authApi";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const token = params.get("token") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
      toast.success("Password reset! Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Reset link is invalid or has expired.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 px-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a strong password (min. 8 characters).</p>
        {error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">New password</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:border-gray-900 focus-within:bg-white">
              <Lock className="ml-3 h-4 w-4 text-gray-400" />
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent px-3 py-3 text-sm outline-none" autoComplete="new-password" />
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Confirm password</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:border-gray-900 focus-within:bg-white">
              <Lock className="ml-3 h-4 w-4 text-gray-400" />
              <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent px-3 py-3 text-sm outline-none" autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" disabled={submitting || !token} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">
            {submitting ? "Resetting…" : "Reset password"}
          </button>
          {!token && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Missing reset token. Open the link from your email.</p>}
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="font-semibold text-gray-900 underline underline-offset-2">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
