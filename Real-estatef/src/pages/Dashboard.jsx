import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import BuyerDashboard from "./BuyerDashboard";
import AgentDashboard from "./AgentDashboard";
import AdminDashboard from "./AdminDashboard";
import { BACKEND_URL } from "../config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      toast.error("Please login to access the dashboard.");
      navigate("/login");
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      setUser(u);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Refresh user details from database
      axios.get(`${BACKEND_URL}/api/auth/me`)
        .then((res) => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        })
        .catch((err) => {
          console.warn("Could not sync user profile:", err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error("Failed to parse stored user profile:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Successfully logged out");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-sans">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="mt-3 font-extrabold text-xs text-slate-400 uppercase tracking-widest animate-pulse">
          Loading Secure Control Center...
        </p>
      </div>
    );
  }

  // Render correct dashboard based on role
  if (user?.role === "buyer") {
    return <BuyerDashboard user={user} handleLogout={handleLogout} />;
  } else if (user?.role === "agent") {
    return <AgentDashboard user={user} handleLogout={handleLogout} />;
  } else if (user?.role === "staff") {
    return <AdminDashboard user={user} handleLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h3 className="font-black text-lg text-slate-700">Invalid Role Assigned</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
        Your user credentials do not have a recognized control role assigned by admin. Please contact support.
      </p>
      <button
        onClick={handleLogout}
        className="mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md"
      >
        Logout Profile
      </button>
    </div>
  );
}
