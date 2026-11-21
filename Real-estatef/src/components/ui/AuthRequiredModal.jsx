import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Lock, X, ArrowRight, Sparkles } from "lucide-react";

export default function AuthRequiredModal({ isOpen, onClose, propertyTitle }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    onClose();
    navigate("/login");
  };

  const handleRegisterRedirect = () => {
    onClose();
    navigate("/register");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Heart & Lock Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-500 shadow-xs">
          <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Lock className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-editorial text-2xl font-bold text-slate-900">
          Sign In to Save Favorites
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
          {propertyTitle ? (
            <>
              Sign in to save <strong className="text-slate-800">"{propertyTitle}"</strong> to your wishlist and manage it directly from your user panel.
            </>
          ) : (
            "Sign in to build your personal real estate wishlist, compare properties, and sync saved residences across your devices."
          )}
        </p>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={handleLoginRedirect}
            id="auth-modal-login-btn"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs uppercase tracking-wider font-bold transition-all shadow-md active:scale-98"
          >
            <span>Log In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleRegisterRedirect}
            id="auth-modal-register-btn"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all hover:bg-slate-50"
          >
            Don't have an account? Sign Up Free
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
