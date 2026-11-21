import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  LayoutGrid,
  AlertCircle,
  RefreshCw,
  Clock,
  Lock,
  CheckCircle,
  ShieldCheck,
  Globe,
  Mail,
  Send,
  Heart,
  Share2,
  MapPin,
  Star,
  User,
  Phone,
  X,
  Building,
  Calendar,
  Info
} from "lucide-react";


import { BACKEND_URL } from "../config";

// Timer Component to show 2-hour countdown ticking down
const ExpiryTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(expiresAt) - new Date();
      if (difference <= 0) {
        setTimeLeft("Expired");
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
      <Clock size={14} className="animate-pulse" />
      <span>Time Limit: {timeLeft}</span>
    </div>
  );
};

export default function PlotGrid() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const layoutId = searchParams.get("layoutId");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [plots, setPlots] = useState([]);
  const [selectedPlotLayout, setSelectedPlotLayout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [allAdminPlots, setAllAdminPlots] = useState([]);
  const [orientation, setOrientation] = useState("horizontal");
  const [editingPrice, setEditingPrice] = useState("");
  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");


  useEffect(() => {
    if (selectedSegment) {
      setEditingPrice(selectedSegment.basePrice || "");
    }
  }, [selectedSegment]);

  const handleUpdateSegmentPrice = async (e) => {
    e.preventDefault();
    if (!editingPrice || isNaN(editingPrice)) {
      return toast.error("Please enter a valid numeric price");
    }
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.put(
        `${BACKEND_URL}/api/plots/${selectedPlotLayout._id}/segments/${selectedSegment._id}/status`,
        { basePrice: Number(editingPrice) },
        config
      );
      toast.success("Plot segment price updated successfully!");
      setSelectedSegment(prev => prev ? { ...prev, basePrice: Number(editingPrice) } : null);
      fetchPlots(selectedProjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update segment price.");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      return toast.error("Please enter your comment");
    }
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(
        `${BACKEND_URL}/api/plots/${selectedPlotLayout._id}/segments/${selectedSegment._id}/reviews`,
        { rating: newRating, comment: newComment },
        config
      );
      toast.success("Review submitted successfully!");
      setNewComment("");
      setAddReviewOpen(false);
      setSelectedSegment(prev => prev ? { ...prev, reviews: res.data.reviews } : null);
      fetchPlots(selectedProjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    }
  };




  // Check login on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Connect to Socket.io
  useEffect(() => {
    const socketConn = io(BACKEND_URL);
    setSocket(socketConn);

    socketConn.on("segment_status_updated", ({ plotId, segmentId, segment }) => {
      setPlots((prevPlots) =>
        prevPlots.map((p) => {
          if (p._id === plotId) {
            return {
              ...p,
              segments: p.segments.map((s) => (s._id === segmentId ? segment : s))
            };
          }
          return p;
        })
      );

      setSelectedPlotLayout((prevLayout) => {
        if (prevLayout && prevLayout._id === plotId) {
          return {
            ...prevLayout,
            segments: prevLayout.segments.map((s) => (s._id === segmentId ? segment : s))
          };
        }
        return prevLayout;
      });

      toast.success(`Plot #${segment.plotNumber} has been updated in real-time!`, {
        icon: "🔄",
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          fontWeight: "600",
          fontSize: "12px"
        }
      });
    });

    socketConn.on("plot_approved", (approvedPlot) => {
      setPlots((prevPlots) => {
        if (prevPlots.some((p) => p._id === approvedPlot._id)) {
          return prevPlots.map((p) => p._id === approvedPlot._id ? approvedPlot : p);
        }
        if (approvedPlot.projectId === selectedProjectId || approvedPlot.projectId?._id === selectedProjectId) {
          return [...prevPlots, approvedPlot].sort((a, b) => a.name.localeCompare(b.name));
        }
        return prevPlots;
      });

      toast.success(`Layout "${approvedPlot.name}" Approved and Visible!`, {
        icon: "✅",
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          fontWeight: "600",
          fontSize: "12px"
        }
      });
    });

    return () => {
      socketConn.disconnect();
    };
  }, []);

  // Fetch plots on load
  useEffect(() => {
    fetchPlots();
  }, []);

  useEffect(() => {
    if (showAdminConsole) {
      fetchAdminPlots();
    }
  }, [showAdminConsole]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/properties/projects`);
      const plotProjects = res.data.projects.filter(p => p.type === "plot");
      setProjects(plotProjects);
      if (plotProjects.length > 0) {
        setSelectedProjectId(plotProjects[0]._id);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const fetchPlots = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/plots/all/approved`);
      setPlots(res.data.plots);
      if (res.data.plots.length > 0) {
        const targetLayout = layoutId ? res.data.plots.find(p => p._id === layoutId) : null;
        setSelectedPlotLayout(targetLayout || res.data.plots[0]);
      } else {
        setSelectedPlotLayout(null);
      }
    } catch (err) {
      console.error("Failed to load plots", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminPlots = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(`${BACKEND_URL}/api/plots/admin/all`, config);
      setAllAdminPlots(res.data.plots);
    } catch (err) {
      console.error("Failed to load admin plots list", err);
    }
  };

  const handleUpdateSegmentStatus = async (segmentId, newStatus) => {
    if (!currentUser) {
      toast.error("Please login to reserve or book a plot.");
      navigate("/login");
      return;
    }

    if (!selectedPlotLayout) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${BACKEND_URL}/api/plots/${selectedPlotLayout._id}/segments/${segmentId}/status`,
        { status: newStatus },
        { headers }
      );
      setSelectedSegment(null);
    } catch (err) {
      console.error("Failed to update segment status", err);
      toast.error(err.response?.data?.message || "Failed to update segment status.");
    }
  };

  const handleApproveLayout = async (plotId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.put(
        `${BACKEND_URL}/api/plots/${plotId}/approve`,
        {},
        { headers }
      );
      toast.success(res.data.message);
      fetchAdminPlots();
      fetchPlots();
    } catch (err) {
      console.error("Failed to approve layout", err);
      toast.error(err.response?.data?.message || "Failed to approve plot layout.");
    }
  };

  const minSqft = selectedPlotLayout && selectedPlotLayout.segments?.length > 0
    ? Math.min(...selectedPlotLayout.segments.map((s) => s.totalSqft))
    : 1500;

  const isStaffOrAdmin = currentUser && (currentUser.role === "staff" || currentUser.role === "admin");

  return (
    <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 md:p-10 my-6 mx-auto shadow-xl text-slate-800 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold tracking-wider rounded-full uppercase">
            Live Booking Console
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Interactive Plot Booking Grid
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time segment visual widths scale dynamically based on total square footage (Sqft).
          </p>
        </div>

        {/* Project Select & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Plot Layout selector */}
          <select
            value={selectedPlotLayout?._id || ""}
            onChange={(e) => {
              const layout = plots.find((p) => p._id === e.target.value);
              if (layout) setSelectedPlotLayout(layout);
            }}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {plots.length === 0 ? (
              <option value="">No Approved Plots Available</option>
            ) : (
              plots.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.address || "Individual"})
                </option>
              ))
            )}
          </select>

          {/* Orientation Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setOrientation("horizontal")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                orientation === "horizontal"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-450 hover:text-slate-800"
              }`}
            >
              Horizontal
            </button>
            <button
              onClick={() => setOrientation("vertical")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                orientation === "vertical"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-450 hover:text-slate-800"
              }`}
            >
              Vertical
            </button>
          </div>

          <button
            onClick={() => fetchPlots()}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-250 rounded-xl transition shrink-0"
            title="Refresh Grid"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>


      {/* Select Main Plot Layout Block */}
      {plots.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {plots.map((layout) => (
            <button
              key={layout._id}
              onClick={() => setSelectedPlotLayout(layout)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                selectedPlotLayout?._id === layout._id
                  ? "bg-slate-900 text-white border-slate-950"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-350"
              }`}
            >
              <LayoutGrid size={14} />
              {layout.name} Layout ({projects.find(p => p._id === selectedProjectId)?.name || "Plot Project"})
            </button>

          ))}
        </div>
      )}

      {/* Seating Map Grid Matrix */}
      <div className="mt-8 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Syncing matrix coordinates...</p>
          </div>
        ) : !selectedPlotLayout ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl">
            <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-slate-500 text-sm">No approved plot layout active.</p>
          </div>
        ) : (
          <div 
            className={`flex flex-wrap gap-3 ${orientation === "vertical" ? "flex-col max-h-[600px] overflow-y-auto" : "flex-row"}`} 
            style={{ width: "100%" }}
          >
            {selectedPlotLayout.segments?.map((segment) => {
              let cellClass = "";
              
              if (segment.status === "vacant") {
                cellClass = "bg-emerald-50 border-emerald-250 hover:bg-emerald-100/50 text-emerald-700 hover:shadow-sm";
              } else if (segment.status === "locked") {
                cellClass = "bg-amber-50 border-amber-250 hover:bg-amber-100/50 text-amber-700 hover:shadow-sm";
              } else if (segment.status === "booked") {
                cellClass = "bg-rose-50 border-rose-250 hover:bg-rose-100/50 text-rose-700 hover:shadow-sm";
              }


              const boxWidthScale = (segment.totalSqft / minSqft) * 140;

              return (
                <div
                  key={segment._id}
                  onClick={() => setSelectedSegment(segment)}
                  className={`border cursor-pointer rounded-xl py-8 px-4 transition-all duration-200 flex flex-col items-center justify-center font-bold text-lg select-none relative ${cellClass}`}
                  style={{
                    flexGrow: segment.totalSqft,
                    flexShrink: 1,
                    flexBasis: `${boxWidthScale}px`,
                    maxWidth: "100%",
                    minHeight: "110px"
                  }}
                >
                  <span>{segment.plotNumber}</span>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider block">
                    {segment.totalSqft} Sqft
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <span>👆</span>
          <span>Updates instantly for every team member</span>
        </div>
      </div>

      {/* Legend & Admin Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100/70 border border-slate-200/80 rounded-2xl">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300"></span>
            <span>Vacant (Available)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-200 border border-amber-300"></span>
            <span>Locked (Site Visit Scheduled)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-200 border border-rose-300"></span>
            <span>Booked (2h Deadline)</span>
          </div>

        </div>

        {isStaffOrAdmin && (
          <button
            onClick={() => setShowAdminConsole(!showAdminConsole)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-slate-350 transition text-slate-700"
          >
            <ShieldCheck size={14} className="text-blue-500" />
            SuperAdmin Panel
          </button>
        )}
      </div>

      {/* Admin Approvals Guard List */}
      {showAdminConsole && isStaffOrAdmin && (
        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl text-xs">
          <h4 className="font-bold text-slate-800 mb-2">Approvals Pending List</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-2">Layout</th>
                  <th className="py-2">Overall Size</th>
                  <th className="py-2">Approval</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allAdminPlots.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400">No layout logs found.</td>
                  </tr>
                ) : (
                  allAdminPlots.map((layout) => (
                    <tr key={layout._id}>
                      <td className="py-2.5 font-bold text-slate-700">{layout.name}</td>
                      <td className="py-2.5">{layout.totalSqft} Sqft</td>
                      <td className="py-2.5">
                        {layout.isApproved ? (
                          <span className="text-emerald-600 font-bold">Approved</span>
                        ) : (
                          <span className="text-amber-600 font-bold">Pending Approval</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {!layout.isApproved && (
                          <button
                            onClick={() => handleApproveLayout(layout._id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Segment action simulation modal */}
      {selectedSegment && selectedPlotLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 relative text-xs text-slate-600">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSegment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full cursor-pointer transition z-50 border-0 outline-none"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Agent & Actions */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Agent Card */}
                <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs text-center flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-orange-100 text-orange-600 font-black text-xl uppercase flex items-center justify-center border-2 border-orange-200 mb-3">
                    R
                  </div>
                  <h4 className="font-black text-sm text-slate-800">Rajesh Agent</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mt-0.5">Premium Villas & Plots Specialist</p>
                  
                  <div className="flex gap-4 mt-4 text-slate-400">
                    <button className="hover:text-orange-500 transition cursor-pointer border-0 bg-transparent"><Globe size={14} /></button>
                    <button className="hover:text-orange-500 transition cursor-pointer border-0 bg-transparent"><Mail size={14} /></button>
                    <button className="hover:text-orange-500 transition cursor-pointer border-0 bg-transparent"><Phone size={14} /></button>
                    <button className="hover:text-orange-500 transition cursor-pointer border-0 bg-transparent"><Send size={14} /></button>
                  </div>
                </div>

                {/* Property Lock & Book Console */}
                <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs text-left space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
                    <Lock size={15} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Property Lock Escrow</span>
                  </div>
                  
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    Lock this plot segment to get an exclusive agent assigned. Once your agent accepts, a direct chat channel opens.
                  </p>

                  <div className="space-y-2 text-[10px] font-bold text-slate-650">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle size={12} />
                      <span>You submit lock or book request</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle size={12} />
                      <span>Admin reviews & assigns agent</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle size={12} />
                      <span>Agent accepts → Chat unlocks</span>
                    </div>
                  </div>

                  {selectedSegment.status === "booked" && selectedSegment.expiresAt && (
                    <div className="pt-2 border-t flex flex-col gap-2 text-[10px] font-bold text-rose-600">
                      <span>Booking Expiry Timer:</span>
                      <ExpiryTimer 
                        expiresAt={selectedSegment.expiresAt} 
                        onExpire={() => {
                          fetchPlots(selectedProjectId);
                          setSelectedSegment(null);
                        }} 
                      />
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    {selectedSegment.status === "vacant" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            toast.error("Please lock this plot segment first to schedule a site visit.");
                          }}
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-400 font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition cursor-pointer border-0"
                        >
                          Schedule Site Visit
                        </button>
                        <button
                          onClick={() => handleUpdateSegmentStatus(selectedSegment._id, "locked")}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider shadow-sm transition cursor-pointer border-0"
                        >
                          Lock Plot for Site Visit
                        </button>
                        <button
                          onClick={() => handleUpdateSegmentStatus(selectedSegment._id, "booked")}
                          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider shadow-md transition cursor-pointer border-0"
                        >
                          Book Plot (48h Deadline)
                        </button>
                      </div>
                    )}

                    {selectedSegment.status === "locked" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            window.location.href = "/dashboard?tab=visits";
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider shadow-sm transition cursor-pointer border-0"
                        >
                          Schedule Site Visit
                        </button>
                      </div>
                    )}

                    {selectedSegment.status !== "vacant" && (currentUser?.role === "staff" || currentUser?.role === "admin") && (
                      <button
                        onClick={() => handleUpdateSegmentStatus(selectedSegment._id, "vacant")}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition cursor-pointer border-0"
                      >
                        Release Segment to Vacant
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Reviews Section */}
                <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs text-left space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Customer Reviews</span>
                    <span 
                      onClick={() => setAddReviewOpen(!addReviewOpen)}
                      className="text-orange-500 font-extrabold text-[9px] cursor-pointer hover:underline"
                    >
                      {addReviewOpen ? "CANCEL" : "+ ADD REVIEW"}
                    </span>
                  </div>

                  {addReviewOpen && (
                    <form onSubmit={handleAddReview} className="space-y-3 bg-slate-50 p-3 rounded-xl border mt-2 text-[10px]">
                      <div className="flex items-center gap-2">
                        <label className="font-black text-slate-400 uppercase">Rating:</label>
                        <select 
                          value={newRating} 
                          onChange={(e) => setNewRating(Number(e.target.value))}
                          className="p-1 bg-white border rounded font-bold"
                        >
                          <option value={5}>5 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={3}>3 Stars</option>
                          <option value={2}>2 Stars</option>
                          <option value={1}>1 Star</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-black text-slate-400 uppercase">Comment:</label>
                        <textarea 
                          value={newComment} 
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts about this plot segment..."
                          rows={2} 
                          className="p-2 border rounded bg-white text-xs"
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-655 text-white font-extrabold text-[9px] rounded uppercase cursor-pointer border-0"
                      >
                        Submit Review
                      </button>
                    </form>
                  )}

                  {selectedSegment.reviews && selectedSegment.reviews.length > 0 ? (
                    <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                      {selectedSegment.reviews.map((rev, idx) => (
                        <div key={rev._id || idx} className="border-b border-slate-100 pb-2 text-[10px]">
                          <div className="flex justify-between items-center font-bold text-slate-700">
                            <span>{rev.name}</span>
                            <span className="text-amber-500 font-mono">{"★".repeat(rev.rating)}</span>
                          </div>
                          <p className="text-slate-500 mt-1 font-medium leading-normal">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No feedback reviews logged yet. Be the first to share details!</p>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Detail Info */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Cover Image */}
                <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-100 rounded-3xl relative">
                  <img
                    src={
                      selectedPlotLayout.highlightedImageUrl
                        ? (selectedPlotLayout.highlightedImageUrl.startsWith("http")
                            ? selectedPlotLayout.highlightedImageUrl
                            : `${BACKEND_URL}/${selectedPlotLayout.highlightedImageUrl.startsWith("/") ? selectedPlotLayout.highlightedImageUrl.slice(1) : selectedPlotLayout.highlightedImageUrl}`)
                        : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000"
                    }
                    alt="Plot Cover"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm">
                    {selectedSegment.status === "vacant" ? "AVAILABLE FOR SALE" : selectedSegment.status.toUpperCase()}
                  </span>
                </div>

                {/* Specs Info */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs text-left space-y-4">
                  
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                        Plot Segment #{selectedSegment.plotNumber}
                      </h2>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold mt-1.5">
                        <span className="flex items-center gap-1"><Calendar size={12} /> POSTED: TODAY</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><User size={12} /> AGENT: RAJESH AGENT</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 border rounded-xl hover:bg-slate-50 text-slate-550 transition cursor-pointer bg-white"><Share2 size={14} /></button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wide">Base Value</span>
                      <span className="text-2xl font-black text-slate-900">₹{selectedSegment.basePrice?.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-slate-450 font-bold ml-1">Escrow Listing Price</span>
                    </div>

                    {(currentUser?.role === "staff" || currentUser?.role === "admin" || currentUser?.role === "agent") && (
                      <form onSubmit={handleUpdateSegmentPrice} className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase pl-1">Modify Price (₹)</label>
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-slate-800 focus:ring-0 p-1 w-28 outline-none"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[9px] rounded-xl uppercase tracking-wider cursor-pointer border-0"
                        >
                          Update
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Spec Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-650 bg-slate-50/50">
                      <MapPin size={12} className="text-orange-500" />
                      {selectedPlotLayout.address || "Premium Township"}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-650 bg-slate-50/50">
                      <LayoutGrid size={12} className="text-orange-500" />
                      {selectedSegment.totalSqft} Sq. Ft Area
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-650 bg-slate-50/50">
                      <Building size={12} className="text-orange-500" />
                      Residential Plot
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-650 bg-slate-50/50">
                      <Star size={12} className="text-amber-500 fill-amber-400" />
                      4.9 Rating
                    </span>
                  </div>

                  {/* Description */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Description Details</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      This exclusive plot segment forms part of the master layout partition in {selectedPlotLayout.name}. It has been symmetrically divided to match proportional visual layout guidelines. Equipped with 24/7 boundary monitoring, digital registration deeds, and fully integrated water and power pipelines. Lock or book now to start your custom construction setup.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
