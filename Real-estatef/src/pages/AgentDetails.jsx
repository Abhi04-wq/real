import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Shield, MapPin, Mail, Phone, Award, Clock, ArrowLeft, Star, MessageSquare } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BACKEND_URL } from "../config";

export default function AgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState("EN");

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        // We use the authenticated user endpoint to fetch the agent by ID
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view detailed agent profile cards.");
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BACKEND_URL}/api/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success && res.data.user) {
          setAgent(res.data.user);
        } else {
          toast.error("Agent profile not found.");
        }
      } catch (err) {
        console.error("Failed to load agent profile details:", err);
        toast.error("Failed to load agent details. Make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgentDetails();
  }, [id, navigate]);

  const getAgentPhoto = (imageUrl) => {
    if (!imageUrl) return "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="bg-[#f3f7f8] min-h-screen font-sans flex flex-col justify-between">
        <Navbar currentLang={selectedLang} setCurrentLang={setSelectedLang} />
        <div className="py-24 text-center flex-grow">
          <div className="w-12 h-12 border-4 border-[#00a896]/20 border-t-[#00a896] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xs font-bold text-slate-455 uppercase tracking-wider animate-pulse">
            Loading consulting partner profile...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-[#f3f7f8] min-h-screen font-sans flex flex-col justify-between">
        <Navbar currentLang={selectedLang} setCurrentLang={setSelectedLang} />
        <div className="py-24 text-center flex-grow">
          <p className="text-sm font-bold text-slate-500">Agent profile not found or access denied.</p>
          <button
            onClick={() => navigate("/agents")}
            className="mt-4 px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Back to Directory
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f3f7f8] min-h-screen font-sans antialiased text-slate-800 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      <Toaster />
      <Navbar currentLang={selectedLang} setCurrentLang={setSelectedLang} />

      <main className="max-w-4xl mx-auto px-4 py-10 w-full flex-grow text-left">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to List</span>
        </button>

        {/* Profile Card Container */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          
          {/* Left Column: Photo & Badges */}
          <div className="w-full md:w-80 bg-slate-50/50 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-200/80 shrink-0">
            <div className="h-56 w-56 rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
              <img
                src={getAgentPhoto(agent.image)}
                alt={agent.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="mt-6 w-full space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-b pb-2">
                <span>RERA status:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  agent.reraId ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}>
                  {agent.reraId ? "Verified License" : "Pending Approval"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-b pb-2">
                <span>Role:</span>
                <span className="text-slate-800 font-extrabold uppercase text-[10px]">
                  {agent.role}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Specs */}
          <div className="flex-1 p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1 bg-[#00a896]/5 border border-[#00a896]/10 px-2.5 py-1 rounded-md text-[10px] font-black text-[#00a896] uppercase tracking-wide">
                <Shield className="h-3.5 w-3.5" /> Licensed consulting partner
              </div>
              <h2 className="text-2xl font-black text-slate-850 tracking-tight mt-2.5">
                {agent.name}
              </h2>
              <p className="text-xs text-slate-450 font-bold mt-1">
                {agent.specialization || "Property Valuation & Brokerage Advisor"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border text-slate-400">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    RERA Registration ID
                  </span>
                  <span className="text-xs font-bold text-slate-750 mt-0.5 font-mono">
                    {agent.reraId || "Pending Registration..."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border text-slate-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Professional Experience
                  </span>
                  <span className="text-xs font-bold text-slate-750 mt-0.5">
                    {agent.experience || 0} Years Active
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-3.5">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Advisory Service areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {agent.serviceAreas && agent.serviceAreas.length > 0 ? (
                  agent.serviceAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 border text-slate-655 text-[10px] font-extrabold rounded-lg flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3 text-orange-500" />
                      {area}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No primary areas registered.</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Direct Compliance Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{agent.phone || "—"}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const user = localStorage.getItem("user");
                  if (!user) {
                    toast.error("Please login to open secure dealings communication.");
                    navigate("/login");
                  } else {
                    // Redirect directly to buyer dashboard visits/chat
                    navigate("/dashboard?tab=visits");
                  }
                }}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-655 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Message Agent</span>
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
