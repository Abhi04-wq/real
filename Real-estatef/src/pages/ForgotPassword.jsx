import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { authApi } from "../lib/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
    } finally {
      setDone(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your account email. If it exists, we&apos;ll send a reset link (valid 30 minutes).</p>
        {done ? (
          <div role="status" className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            If an account exists for that email, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</label>
              <div className="mt-1.5 flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:border-gray-900 focus-within:bg-white">
                <Mail className="ml-3 h-4 w-4 text-gray-400" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-transparent px-3 py-3 text-sm outline-none" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="font-semibold text-gray-900 underline underline-offset-2">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
