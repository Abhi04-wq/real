import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Shield,
  UploadCloud,
  CheckCircle,
  XCircle,
  Building,
  Calendar,
  Clock,
  Download,
  Eye,
  Plus,
  Lock,
  MessageSquare,
  Search,
  FileText,
  MapPin,
  Heart,
  Star,
  FileCheck,
  Send,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { io } from "socket.io-client";
import { LayoutGrid } from "lucide-react";
import PlotGrid from "../components/PlotGrid";

import BuyerOverviewTab from "../components/buyer/BuyerOverviewTab";
import BuyerLocksTab from "../components/buyer/BuyerLocksTab";
import BuyerKycTab from "../components/buyer/BuyerKycTab";
import BuyerPropertiesTab from "../components/buyer/BuyerPropertiesTab";
import BuyerBookingsTab from "../components/buyer/BuyerBookingsTab";
import BuyerVisitsTab from "../components/buyer/BuyerVisitsTab";
import BuyerChatWidget from "../components/buyer/BuyerChatWidget";
import BuyerModals from "../components/buyer/BuyerModals";
import { BACKEND_URL } from "../config";

// Leaflet Map CDN wrapper component
const LeafletMap = ({ lat, lng, popupText }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (window.L && mapRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      try {
        const map = window.L.map(mapRef.current).setView([lat, lng], 13);
        mapInstanceRef.current = map;

        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
          },
        ).addTo(map);

        window.L.marker([lat, lng])
          .addTo(map)
          .bindPopup(popupText || "Location Coordinate")
          .openPopup();
      } catch (e) {
        console.warn("Leaflet rendering error:", e);
      }
    }
  }, [lat, lng, popupText]);

  return (
    <div
      ref={mapRef}
      className="h-96 w-full rounded-2xl border border-slate-100 shadow-sm overflow-hidden z-10"
      style={{ minHeight: "380px" }}
    />
  );
};

export default function BuyerDashboard({ user, handleLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview"); // overview, kyc, properties, bookings, visits
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // KYC States
  const [kycDetails, setKycDetails] = useState({
    occupation: "",
    annualIncome: "",
    panNumber: "",
    aadhaarNumber: "",
    coApplicantName: "",
    coApplicantPhone: "",
  });
  const [kycDocs, setKycDocs] = useState({
    panCardUrl: "",
    aadhaarFrontUrl: "",
    aadhaarBackUrl: "",
    addressProofUrl: "",
    photographUrl: "",
    incomeProofUrl: "",
    bankStatementUrl: "",
  });
  const [uploadingField, setUploadingField] = useState(null);

  // Property & Booking States
  const [projects, setProjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    coApplicantName: "",
    coApplicantPhone: "",
    coApplicantRelation: "",
    financingType: "self-funded",
    paymentPlan: "construction-linked",
    tokenAmount: 100000,
    paymentMode: "UPI",
    utr: "",
  });
  const [activeLockUnit, setActiveLockUnit] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // Lock timer in seconds
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const topFormRef = useRef(null);

  // Buyer bookings & visits
  const [bookings, setBookings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [myLocks, setMyLocks] = useState([]);
  const [myLocksLoading, setMyLocksLoading] = useState(false);
  const [visitForm, setVisitForm] = useState({
    projectId: "",
    propertyId: "",
    fullName: "",
    mobileNumber: "",
    email: "",
    date: "",
    timeSlot: "10:00 AM - 12:00 PM",
    visitType: "physical",
    visitorsCount: 1,
    remarks: "",
  });

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedVisitForReschedule, setSelectedVisitForReschedule] =
    useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    timeSlot: "10:00 AM - 12:00 PM",
  });

  const [selectedVisitForFeedback, setSelectedVisitForFeedback] =
    useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comments: "",
    wasVisitCompleted: true,
    buyerInterest: "Interested",
  });

  // Property Listings explore states
  const [allProperties, setAllProperties] = useState([]);
  const [selectedVisitProperty, setSelectedVisitProperty] = useState(null);
  const [propertyFilters, setPropertyFilters] = useState({
    query: "",
    location: "",
    type: "all",
    status: "",
    style: "",
    features: [],
    bhk: "",
    pincode: "",
    address: "",
    minPrice: "",
    maxPrice: "",
    minSize: "",
    maxSize: "",
  });

  const [visitPropertyFilters, setVisitPropertyFilters] = useState({
    query: "",
    location: "",
    type: "all",
    pincode: "",
  });

  const [exploreProjectsOpen, setExploreProjectsOpen] = useState(false);

  // Secure Chat Box states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [socketConn, setSocketConn] = useState(null);

  // Agreement Signing Mockup states
  const [agreementPreviewModalOpen, setAgreementPreviewModalOpen] =
    useState(false);
  const [selectedBookingForAgreement, setSelectedBookingForAgreement] =
    useState(null);

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Run on mount to fetch properties, user KYC, bookings, and tours
  useEffect(() => {
    fetchKycDetails();
    fetchBookings();
    fetchVisits();
    fetchAllProperties();
    fetchProjects();
    fetchMyLocks();
    fetchMockBookings();
  }, []);

  const [mockBookings, setMockBookings] = useState([]);
  const [mockBookingModalOpen, setMockBookingModalOpen] = useState(false);
  const [mockBookingText, setMockBookingText] = useState("");
  const [submittingMockBookingId, setSubmittingMockBookingId] = useState(null);
  const [fakePaymentModalOpen, setFakePaymentModalOpen] = useState(false);
  const [payingMockBookingId, setPayingMockBookingId] = useState(null);

  const fetchMockBookings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/bookings/mock/list`);
      setMockBookings(res.data.bookings || []);
    } catch (err) {
      console.warn("Failed to load mock bookings:", err.message);
    }
  };

  const handleOpenMockSubmitModal = (booking) => {
    setSubmittingMockBookingId(booking._id);
    setMockBookingText(`I, ${user?.name || "Buyer Name"}, wish to proceed with booking the property "${booking.propertyName}" for INR ${booking.propertyPrice.toLocaleString()}. My registered contact is ${user?.phone || "N/A"}.`);
    setMockBookingModalOpen(true);
  };

  const handleSubmitMockBookingForm = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/bookings/mock/submit/${submittingMockBookingId}`, {
        buyerTextData: mockBookingText
      });
      toast.success(res.data.message || "Mock booking form submitted to Admin!");
      setMockBookingModalOpen(false);
      setSubmittingMockBookingId(null);
      fetchMockBookings();
      socketConn?.emit("mock_booking_updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit booking form.");
    }
  };

  const handleOpenFakePaymentGateway = (booking) => {
    setPayingMockBookingId(booking._id);
    setFakePaymentModalOpen(true);
  };

  const handleFakePaymentSuccess = async () => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/bookings/mock/pay/${payingMockBookingId}`);
      toast.success(res.data.message || "Payment processed successfully! Property status set to Booked.");
      setFakePaymentModalOpen(false);
      setPayingMockBookingId(null);
      fetchMockBookings();
      socketConn?.emit("mock_booking_updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process payment.");
    }
  };

  const handleDownloadMockPDF = async (booking) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/bookings/mock/invoice/${booking._id}`, {
        responseType: "blob"
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${booking.propertyName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF Invoice downloaded successfully!");
      fetchMockBookings();
    } catch (err) {
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const parsed = JSON.parse(text);
          toast.error(parsed.message || "Failed to download invoice.");
        } catch (e) {
          toast.error("Failed to download invoice. Maximum limit might have been exceeded.");
        }
      } else {
        toast.error(err.response?.data?.message || "Failed to download invoice.");
      }
    }
  };

  const fetchKycDetails = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/me`);
      if (res.data.success && res.data.user) {
        setCurrentUser(res.data.user);
        setKycDetails(res.data.user.kycDetails || {
          occupation: "",
          annualIncome: "",
          panNumber: "",
          aadhaarNumber: "",
          coApplicantName: "",
          coApplicantPhone: "",
        });
        setKycDocs(res.data.user.kycDocs || {
          panCardUrl: "",
          aadhaarFrontUrl: "",
          aadhaarBackUrl: "",
          addressProofUrl: "",
          photographUrl: "",
          incomeProofUrl: "",
          bankStatementUrl: "",
        });
      }
    } catch (e) {
      console.warn("Could not retrieve KYC:", e.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/bookings/my-bookings`);
      setBookings(res.data.bookings || []);
    } catch (e) {
      console.warn("Could not retrieve bookings ledger:", e.message);
    }
  };

  const fetchVisits = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/site-visits/my-visits`);
      setVisits(res.data.visits || []);
    } catch (e) {
      console.warn("Could not retrieve visits roster:", e.message);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/properties/projects`);
      setProjects(res.data.projects || []);
    } catch (e) {
      console.warn("Could not retrieve projects list:", e.message);
    }
  };

  const fetchAllProperties = async (filtersObj = {}) => {
    try {
      const qParams = new URLSearchParams();
      Object.keys(filtersObj).forEach((key) => {
        if (filtersObj[key]) {
          if (Array.isArray(filtersObj[key])) {
            if (filtersObj[key].length > 0) {
              qParams.append(key, filtersObj[key].join(","));
            }
          } else {
            qParams.append(key, filtersObj[key]);
          }
        }
      });
      const res = await axios.get(
        `${BACKEND_URL}/api/properties/all?${qParams.toString()}`,
      );
      setAllProperties(res.data.properties || []);
    } catch (e) {
      console.warn("Could not retrieve properties catalog:", e.message);
    }
  };

  const checkActiveLock = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/properties/my-active-lock`);
      if (res.data.success && res.data.unit) {
        setActiveLockUnit(res.data.unit);
        setTimeLeft(res.data.timeLeft);
      } else {
        setActiveLockUnit(null);
        setTimeLeft(0);
      }
    } catch (e) {
      console.warn("Could not check active lock:", e.message);
    }
  };

  const fetchMyLocks = async () => {
    try {
      setMyLocksLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BACKEND_URL}/api/properties/my-locks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyLocks(res.data.locks || []);
    } catch (e) {
      console.warn("Could not retrieve lock list:", e.message);
    } finally {
      setMyLocksLoading(false);
    }
  };

  useEffect(() => {
    checkActiveLock();
    if (activeTab === "visits") {
      fetchMyLocks();
    }

    if (activeTab === "locks") {
      fetchMyLocks();
    }
  }, [activeTab]);

  // Lock timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setActiveLockUnit(null);
            checkActiveLock();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  // Socket Connection for Buyer messaging
  useEffect(() => {
    if (user) {
      const socket = io(BACKEND_URL);
      setSocketConn(socket);

      socket.emit("join_room", { userId: user.id || user._id });

      socket.on("receive_message", (msg) => {
        setChatMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });

      socket.on("receive_mock_booking_update", () => {
        fetchMockBookings();
      });

      socket.on("receive_kyc_update", () => {
        fetchKycDetails();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  // Fetch messages with specific agent
  const handleOpenChat = async (agent) => {
    if (!agent) return;

    let resolvedAgent = agent;
    if (typeof agent === "string") {
      const lock = myLocks.find(l => l.assignedAgent?._id === agent);
      if (lock && lock.assignedAgent) {
        resolvedAgent = lock.assignedAgent;
      } else {
        resolvedAgent = { _id: agent, name: "Assigned Agent" };
      }
    }

    setChatRecipient(resolvedAgent);
    setChatOpen(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/chats/history/${resolvedAgent._id || resolvedAgent}`);
      setChatMessages(res.data.messages || []);
    } catch (e) {
      console.warn("Could not fetch chat logs:", e.message);
      if (e.response?.status === 403) {
        toast.error("🔒 Chat is locked. You must lock a property and have it approved and accepted before chatting.", {
          duration: 5000
        });
        setChatOpen(false);
        setChatRecipient(null);
      } else {
        toast.error("Could not load chat history.");
      }
    }
  };

  useEffect(() => {
    const chatWith = searchParams.get("chatWith");
    if (chatWith && myLocks.length > 0) {
      handleOpenChat(chatWith);
    }
  }, [searchParams, myLocks]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatRecipient) return;

    const recipientId = chatRecipient._id || chatRecipient;
    const msgData = {
      sender: user.id || user._id,
      recipient: recipientId,
      message: chatInput.trim(),
    };

    try {
      setChatInput(""); // Clear immediately for snappier feedback
      await axios.post(`${BACKEND_URL}/api/chats/send`, msgData);
    } catch (err) {
      toast.error("Failed to transmit message securely.");
    }
  };

  // Scroll chat messages to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField(fieldName);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await axios.post(
        `${BACKEND_URL}/api/properties/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (uploadRes.data.success) {
        setKycDocs((prev) => ({
          ...prev,
          [fieldName]: uploadRes.data.url,
        }));
        toast.success(`Successfully uploaded ${fieldName.replace("Url", "")}`);
      }
    } catch (err) {
      toast.error("Failed to complete server upload.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${BACKEND_URL}/api/kyc/submit`, {
        kycDetails,
        kycDocs,
      });
      toast.success(res.data.message);
      fetchKycDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit KYC.");
    }
  };

  const handleBookVisit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/site-visits/book`, visitForm);
      toast.success(res.data.message);
      setVisitForm({
        projectId: "",
        propertyId: "",
        fullName: "",
        mobileNumber: "",
        email: "",
        date: "",
        timeSlot: "10:00 AM - 12:00 PM",
        visitType: "physical",
        visitorsCount: 1,
        remarks: "",
      });
      setSelectedVisitProperty(null);
      fetchVisits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule visit.");
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedVisitForReschedule) return;
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/site-visits/${selectedVisitForReschedule._id}/reschedule`,
        rescheduleForm,
      );
      toast.success(res.data.message);
      setRescheduleModalOpen(false);
      setSelectedVisitForReschedule(null);
      fetchVisits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reschedule.");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitForFeedback) return;
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/site-visits/${selectedVisitForFeedback._id}/feedback`,
        feedbackForm,
      );
      toast.success(res.data.message);
      setSelectedVisitForFeedback(null);
      setFeedbackForm({
        rating: 5,
        comments: "",
        wasVisitCompleted: true,
        buyerInterest: "Interested",
      });
      fetchVisits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback.");
    }
  };

  const handleSeedData = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/properties/seed`);
      toast.success(res.data.message || "Database successfully seeded.");
      fetchKycDetails();
      fetchBookings();
      fetchVisits();
      fetchAllProperties();
      fetchProjects();
    } catch (err) {
      toast.error("Failed to run seed script.");
    }
  };

  const getSidebarTabs = () => {
    return [
      { id: "overview", label: "Overview", icon: Building },
      { id: "kyc", label: "KYC Document Locker", icon: Shield },
      { id: "locks", label: "My Locked Properties", icon: Lock },
      { id: "properties", label: "Explore Properties", icon: Search },
      { id: "explore_plots", label: "Explore Plots", icon: LayoutGrid },
      { id: "bookings", label: "Purchases & BCL", icon: FileText },
      { id: "visits", label: "Site Visits", icon: Calendar },
      { id: "mock_bookings", label: "Mock Bookings", icon: FileCheck },
    ];

  };

  // Formats seconds to MM:SS for display
  const formatTimer = (secs) => {
    if (!secs || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none overflow-hidden text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      <Toaster />

      {/* HEADER NAVBAR */}
      <header className="bg-white border-b border-slate-200/80 py-4 px-6 sm:px-8 flex justify-between items-center shadow-sm relative z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md animate-pulse">
            <span className="text-white font-black text-sm">PE</span>
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-sm font-black text-slate-850 tracking-wider uppercase">
              PropEstate
            </h1>
            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider mt-0.5">
              Buyer Control Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md cursor-pointer"
          >
            Marketplace
          </button>
        </div>
      </header>

      {/* BODY WITH SIDEBAR */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <div className="flex items-center gap-2 px-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase truncate">
                  Portal Navigation
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-1.5">
                {getSidebarTabs().map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <SidebarLink
                      key={tab.id}
                      link={{
                        label: tab.label,
                        href: "#",
                        icon: (
                          <Icon
                            className={`h-4.5 w-4.5 shrink-0 ${activeTab === tab.id ? "text-orange-500" : "text-slate-500"}`}
                          />
                        ),
                      }}
                      onClick={() => setActiveTab(tab.id)}
                      className={
                        activeTab === tab.id
                          ? "bg-slate-200/60 text-slate-950 font-bold"
                          : ""
                      }
                    />
                  );
                })}
              </div>
            </div>

            {/* Profile Avatar Info & Logout */}
            <div className="border-t border-slate-200 pt-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-2 overflow-hidden truncate">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs uppercase shrink-0">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {user?.name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
              <SidebarLink
                link={{
                  label: "Logout Profile",
                  href: "#",
                  icon: (
                    <XCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  ),
                }}
                onClick={handleLogout}
                className="hover:bg-red-50/50"
              />
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Content Box */}
        <main className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-73px)] border-l border-slate-200/80 text-left">
          {/* WELCOME HERO */}
          <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-orange-50/20 border border-orange-100/60 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl" />
            <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />

            <div className="relative z-10 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm">
                  Buyer Profile
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-500 font-extrabold uppercase">
                  Secure Escrow Ledger
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-xs text-slate-450 mt-1 max-w-lg leading-relaxed font-semibold">
                Explore premium project units, lock inventory slots with validated anti-fraud OTP, and track your escrow ledger.
              </p>
            </div>
          </div>

          {/* TAB 1: BUYER OVERVIEW */}
          {activeTab === "overview" && (
            <BuyerOverviewTab bookings={bookings} visits={visits} user={user} />
          )}

          {/* TAB X: MY LOCKED PROPERTIES */}
          {activeTab === "locks" && (
            <BuyerLocksTab
              myLocks={myLocks}
              myLocksLoading={myLocksLoading}
              fetchMyLocks={fetchMyLocks}
              formatTimer={formatTimer}
              formatINR={formatINR}
              navigate={navigate}
            />
          )}

          {/* TAB 2: KYC DOCUMENT LOCKER */}
          {activeTab === "kyc" && (
            <BuyerKycTab
              user={currentUser}
              kycDetails={kycDetails}
              setKycDetails={setKycDetails}
              kycDocs={kycDocs}
              uploadingField={uploadingField}
              handleFileUpload={handleFileUpload}
              handleKycSubmit={handleKycSubmit}
            />
          )}

          {/* TAB 3: EXPLORE & FILTER PROPERTIES */}
          {activeTab === "properties" && (
            <BuyerPropertiesTab
              projects={projects}
              propertyFilters={propertyFilters}
              setPropertyFilters={setPropertyFilters}
              fetchAllProperties={fetchAllProperties}
              allProperties={allProperties}
              formatINR={formatINR}
              navigate={navigate}
            />
          )}

          {/* TAB 4: MY BOOKINGS & DOCUMENTS */}
          {activeTab === "bookings" && (
            <BuyerBookingsTab
              bookings={bookings}
              setActiveTab={setActiveTab}
              formatINR={formatINR}
              setSelectedBookingForAgreement={setSelectedBookingForAgreement}
              setAgreementPreviewModalOpen={setAgreementPreviewModalOpen}
            />
          )}

          {/* TAB 5: SITE VISITS SCHEDULER */}
          {activeTab === "visits" && (
            <BuyerVisitsTab
              topFormRef={topFormRef}
              handleBookVisit={handleBookVisit}
              visitForm={visitForm}
              setVisitForm={setVisitForm}
              user={user}
              myLocks={myLocks}
              visits={visits}
              setSelectedVisitForFeedback={setSelectedVisitForFeedback}
              handleOpenChat={handleOpenChat}
              setSelectedVisitForReschedule={setSelectedVisitForReschedule}
              setRescheduleForm={setRescheduleForm}
              setRescheduleModalOpen={setRescheduleModalOpen}
              exploreProjectsOpen={exploreProjectsOpen}
              setExploreProjectsOpen={setExploreProjectsOpen}
              formatINR={formatINR}
            />
          )}

          {/* TAB 6: EXPLORE PLOTS GRID */}
          {activeTab === "explore_plots" && (
            <div className="space-y-6 animate-fade-in">
              <PlotGrid />
            </div>
          )}

          {activeTab === "mock_bookings" && (
            <div className="space-y-6 text-left animate-fade-in font-sans">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">My Mock Bookings & Agreements</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Submit purchase text details, process payments via fake gateway, and review installment plans.</p>
              </div>

              <div className="border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm space-y-6">
                {mockBookings.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-xs font-bold">No active mock bookings dispatched by your agent.</p>
                    <p className="text-[10px] mt-1">Please ask your agent to click "Send Mock Booking Form" in your chat panel.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Representative</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Submitted Form</th>
                          <th className="py-3 px-4">Actions / Installments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockBookings.map((b) => (
                          <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-4 px-4 font-bold text-slate-800">{b.propertyName}</td>
                            <td className="py-4 px-4 font-bold font-mono">INR {b.propertyPrice.toLocaleString()}</td>
                            <td className="py-4 px-4 text-slate-700 font-semibold">
                              <div>{b.agent?.name}</div>
                              <div className="text-[9px] text-slate-400 font-mono">{b.agent?.email}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                                b.status === "Booked" ? "bg-green-100 text-green-700 animate-pulse" :
                                b.status === "approved" ? "bg-blue-100 text-blue-700" :
                                b.status === "form_submitted" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 max-w-xs truncate text-[10px] text-slate-500 font-semibold">
                              {b.buyerTextData || "N/A"}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-2">
                                {b.status === "form_sent" && (
                                  <button
                                    onClick={() => handleOpenMockSubmitModal(b)}
                                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border-none shadow-sm"
                                  >
                                    Submit Pre-filled Form
                                  </button>
                                )}

                                {b.status === "form_submitted" && (
                                  <span className="text-slate-400 italic text-[10px]">Awaiting Admin Approval</span>
                                )}

                                {b.status === "approved" && (
                                  <button
                                    onClick={() => handleOpenFakePaymentGateway(b)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white transition-all   rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border-none shadow-sm"
                                  >
                                    Proceed to Payment Gateway
                                  </button>
                                )}

                                {b.status === "Booked" && (
                                  <div className="space-y-3">
                                    {/* Action button */}
                                    <button
                                      onClick={() => handleDownloadMockPDF(b)}
                                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border-none shadow-sm"
                                    >
                                      <Download className="h-3.5 w-3.5" /> PDF Invoice ({b.downloadCount || 0}/2 downloads)
                                    </button>

                                    {/* Installments table */}
                                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 text-[10px]">
                                      <span className="font-black text-[9px] uppercase tracking-wider text-slate-550 block mb-2 border-b pb-1">Payment Schedule Matrix</span>
                                      <div className="space-y-1 font-mono">
                                        {b.paymentMatrix.map((inst) => (
                                          <div key={inst._id} className="flex justify-between border-b pb-0.5">
                                            <span>Installment {inst.installmentNo}:</span>
                                            <span className="font-bold">INR {inst.amount.toLocaleString()}</span>
                                            <span className={`font-bold ${inst.status === "Paid" ? "text-green-600" : "text-amber-500"}`}>{inst.status}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CHAT LOGS SIDE PANEL */}
      <BuyerChatWidget
        chatOpen={chatOpen}
        chatRecipient={chatRecipient}
        setChatOpen={setChatOpen}
        setChatRecipient={setChatRecipient}
        chatMessages={chatMessages}
        user={user}
        chatEndRef={chatEndRef}
        handleSendChat={handleSendChat}
        chatInput={chatInput}
        setChatInput={setChatInput}
      />

      {/* MODALS */}
      <BuyerModals
        agreementPreviewModalOpen={agreementPreviewModalOpen}
        setAgreementPreviewModalOpen={setAgreementPreviewModalOpen}
        selectedBookingForAgreement={selectedBookingForAgreement}
        setSelectedBookingForAgreement={setSelectedBookingForAgreement}
        formatINR={formatINR}
        selectedVisitForFeedback={selectedVisitForFeedback}
        setSelectedVisitForFeedback={setSelectedVisitForFeedback}
        feedbackForm={feedbackForm}
        setFeedbackForm={setFeedbackForm}
        handleFeedbackSubmit={handleFeedbackSubmit}
        rescheduleModalOpen={rescheduleModalOpen}
        setRescheduleModalOpen={setRescheduleModalOpen}
        selectedVisitForReschedule={selectedVisitForReschedule}
        setSelectedVisitForReschedule={setSelectedVisitForReschedule}
        rescheduleForm={rescheduleForm}
        setRescheduleForm={setRescheduleForm}
        handleReschedule={handleReschedule}
      />
      {/* SUBMIT PRE-FILLED FORM MODAL */}
      {mockBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-left border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Submit Mock Booking Details</h3>
            <form onSubmit={handleSubmitMockBookingForm} className="space-y-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Pre-filled Text Document Data</label>
                <textarea
                  value={mockBookingText}
                  onChange={(e) => setMockBookingText(e.target.value)}
                  rows={4}
                  className="p-3 bg-slate-50 border rounded-xl w-full focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMockBookingModalOpen(false);
                    setSubmittingMockBookingId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer border-none"
                >
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAKE PAYMENT GATEWAY MODAL */}
      {fakePaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 relative shadow-2xl animate-fade-in text-center border border-slate-100 space-y-6 text-left">
            <div className="h-16 w-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="h-8 w-8" />
            </div>
            
            <div className="space-y-2 text-center">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">PropEstate Escrow Gateway</h3>
              <p className="text-xs text-slate-455">
                You are initiating a mock payment for token inventory allocation. This is a local demo transaction sandbox.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-mono flex justify-between items-center">
              <span className="text-slate-450 uppercase font-black text-[9px]">Transaction Status</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wider animate-pulse">SANDBOX READY</span>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setFakePaymentModalOpen(false);
                  setPayingMockBookingId(null);
                  toast.error("Transaction cancelled by user.");
                }}
                className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFakePaymentSuccess}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold cursor-pointer border-none shadow-md shadow-emerald-500/20"
              >
                Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
