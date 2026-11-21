import React, { useState, useEffect } from "react";
import { Search, MapPin, Star, ShieldCheck, Mail, Phone, MessageSquare, Award } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BACKEND_URL } from "../config";

// High-quality mock agents matching the second image layout precisely
const MOCK_AGENTS = [
  {
    _id: "mock1",
    name: "John Carter",
    role: "Senior Agent",
    phone: "+91 98765 43210",
    email: "john.carter@propestate.com",
    propertiesCount: 32,
    soldCount: 18,
    rating: 4.8,
    city: "Gurugram",
    pincode: "122002",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
  },
  {
    _id: "mock2",
    name: "Emily Johnson",
    role: "Property Consultant",
    phone: "+91 98765 43211",
    email: "emily.johnson@propestate.com",
    propertiesCount: 28,
    soldCount: 15,
    rating: 4.6,
    city: "Kolkata",
    pincode: "700091",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80"
  },
  {
    _id: "mock3",
    name: "Michael Brown",
    role: "Sales Executive",
    phone: "+91 98765 43212",
    email: "michael.brown@propestate.com",
    propertiesCount: 40,
    soldCount: 25,
    rating: 4.9,
    city: "Mumbai",
    pincode: "400051",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80"
  },
  {
    _id: "mock4",
    name: "Sophia Davis",
    role: "Luxury Property Expert",
    phone: "+91 98765 43213",
    email: "sophia.davis@propestate.com",
    propertiesCount: 22,
    soldCount: 14,
    rating: 4.7,
    city: "Bangalore",
    pincode: "560001",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80"
  },
  {
    _id: "mock5",
    name: "Daniel Wilson",
    role: "Real Estate Broker",
    phone: "+91 98765 43214",
    email: "daniel.wilson@propestate.com",
    propertiesCount: 45,
    soldCount: 30,
    rating: 4.9,
    city: "Noida",
    pincode: "201301",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
  },
  {
    _id: "mock6",
    name: "Olivia Taylor",
    role: "Commercial Agent",
    phone: "+91 98765 43215",
    email: "olivia.taylor@propestate.com",
    propertiesCount: 20,
    soldCount: 10,
    rating: 4.5,
    city: "Delhi NCR",
    pincode: "110001",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
  }
];

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("EN");

  const getAgentPhoto = (imageUrl) => {
    if (!imageUrl) return "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/auth/agents`);
        if (res.data.success && res.data.agents) {
          setAgents(res.data.agents);
        } else {
          setAgents([]);
        }
      } catch (err) {
        console.warn("Failed to fetch backend agents:", err.message);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((a) => {
    const q = filterQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q)) ||
      (a.pincode && a.pincode.toLowerCase().includes(q)) ||
      (a.role && a.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-[#f3f7f8] min-h-screen font-sans antialiased text-slate-800 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      <Toaster />
      <Navbar currentLang={selectedLang} setCurrentLang={setSelectedLang} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow text-left">
        {/* Header Ranks */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5 mb-2">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              All Agents
            </h1>
            {/* <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mt-1">
              <span>Home</span>
              <span>&gt;</span>
              <span className="text-slate-500">All Agents</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <button className="px-4 py-2 bg-[#00a896] hover:bg-[#008f80] text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer">
              + All Agents
            </button>
          </div> */}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by city, pincode, specialty or name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="text-xs text-slate-400 font-bold shrink-0">
            Showing {filteredAgents.length} Expert Consulting Partners
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#00a896]/20 border-t-[#00a896] rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-xs font-bold text-slate-450 uppercase tracking-wider animate-pulse">
              Locating licensed advisory RERA profiles...
            </p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white border border-slate-200/60 rounded-3xl border-dashed">
            No expert advisors found. Register new agent profiles inside the Admin dashboard roster.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {filteredAgents.map((agent) => (
              <div
                key={agent._id}
                className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 relative">
                    <img
                      src={getAgentPhoto(agent.image)}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/85 backdrop-blur-xs text-[7px] font-black text-white uppercase rounded shadow-xs tracking-widest">
                      {agent.serviceAreas?.[0] || "Pan India"}
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1">
                    <h3 className="font-extrabold text-[15px] text-slate-800 tracking-tight truncate">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] text-slate-450 font-bold truncate">
                      {agent.specialization || "Licensed Consultant"}
                    </p>
                  </div>

                  {/* Properties & Rating parameters */}
                  <div className="mt-4 space-y-1.5 text-[10px] font-semibold text-slate-500">
                    <div className="flex gap-2">
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 truncate">
                        Exp: {agent.experience || 0} Yrs
                      </span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 truncate">
                        RERA: {agent.reraId ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="font-bold text-slate-700">RERA:</span>
                      <span className="font-mono text-[9px] text-slate-500 truncate max-w-[80px]">
                        {agent.reraId || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      window.location.href = `/agent/${agent._id}`;
                    }}
                    className="py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-[10px] text-[#00a896] font-black rounded-lg cursor-pointer transition-colors text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      const user = localStorage.getItem("user");
                      if (!user) {
                        toast.error("Please login to initiate secure chat sessions.");
                        window.location.href = "/login";
                      } else {
                        window.location.href = "/dashboard";
                      }
                    }}
                    className="py-2 bg-white hover:bg-orange-50 border border-orange-200 hover:border-orange-300 text-[10px] text-orange-600 font-black rounded-lg cursor-pointer transition-colors text-center"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
