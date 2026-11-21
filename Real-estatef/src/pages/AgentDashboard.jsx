import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  TrendingUp,
  Tag,
  Star,
  FileCheck,
  AlertCircle,
  Send,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { io } from "socket.io-client";
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

export default function AgentDashboard({ user, handleLogout }) {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState("agent"); // agent, agent_locks, add_property, property_list, properties, visits, customers
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Agent Locks, Visits, and Properties states
  const [agentPropertyLocks, setAgentPropertyLocks] = useState([]);
  const [visits, setVisits] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [selectedVisitProperty, setSelectedVisitProperty] = useState(null);
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || "");
  const [profileImage, setProfileImage] = useState(currentUser?.image || "");

  // Property upload state
  const [propertyForm, setPropertyForm] = useState({
    name: "",
    description: "",
    price: "",
    area: "",
    beds: 3,
    baths: 2,
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    coordinates: { lat: 28.4595, lng: 77.0266 },
    type: "Apartment",
    status: "For Sale",
    additionalFeatures: "",
    image: "",
  });
  const [uploadingField, setUploadingField] = useState(null);

  // Plot Layout Upload states
  const [addMode, setAddMode] = useState("property"); // property or plot
  const [plotName, setPlotName] = useState("");
  const [plotSqft, setPlotSqft] = useState("");
  const [plotAddress, setPlotAddress] = useState("Greenwood Enclave, Sector 82, Gurgaon");
  const [plotLat, setPlotLat] = useState(28.4595);
  const [plotLng, setPlotLng] = useState(77.0266);
  const [plotProjectId, setPlotProjectId] = useState("");
  const [plotSegmentsInput, setPlotSegmentsInput] = useState(
    "101: 1500\n102: 1500\n103: 3000\n104: 1500\n105: 1500\n106: 2500"
  );
  const [plotImage, setPlotImage] = useState("");

  const [projectForm, setProjectForm] = useState({
    name: "",
    type: "Residential",
    location: "",
    reraNumber: "",
    description: "",
    image: "",
    coordinates: { lat: 28.4595, lng: 77.0266 },
  });



  // Filters for Explore
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

  // Secure Chat Box states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [selectedSuperAdminChat, setSelectedSuperAdminChat] = useState(null);
  const [superAdminChatMessages, setSuperAdminChatMessages] = useState([]);
  const [superAdminChatInput, setSuperAdminChatInput] = useState("");
  const [socketConn, setSocketConn] = useState(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // Site Tour Check-In & Check-Out States
  const [otpVerifyModalOpen, setOtpVerifyModalOpen] = useState(false);
  const [selectedVisitForOtpVerify, setSelectedVisitForOtpVerify] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedVisitForCheckout, setSelectedVisitForCheckout] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    visitSummary: "",
    buyerInterestLevel: "Interested",
    completionRemarks: ""
  });

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${BACKEND_URL}/${url.startsWith("/") ? url.slice(1) : url}`;
  };


  useEffect(() => {
    fetchAgentLocks();
    fetchAgentVisits();
    fetchMyProperties();
    fetchCustomers();
    fetchAllProperties();
    fetchProjects();
    fetchSuperAdmins();
    fetchMockBookings();
  }, []);

  const [mockBookings, setMockBookings] = useState([]);
  const [sendFormModalOpen, setSendFormModalOpen] = useState(false);
  const [sendFormRecipient, setSendFormRecipient] = useState(null);
  const [sendFormPropName, setSendFormPropName] = useState("Premium Villa - Sector 54");
  const [sendFormPropPrice, setSendFormPropPrice] = useState("5000000");

  const fetchMockBookings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/bookings/mock/list`);
      setMockBookings(res.data.bookings || []);
    } catch (err) {
      console.warn("Failed to load mock bookings:", err.message);
    }
  };

  const handleOpenSendFormModal = (recipient) => {
    setSendFormRecipient(recipient);
    setSendFormPropName("Premium Villa - Sector 54");
    setSendFormPropPrice("5000000");
    setSendFormModalOpen(true);
  };

  const handleSendMockBookingFormSubmit = async (e) => {
    e.preventDefault();
    if (!sendFormPropName) return;
    if (!sendFormPropPrice || isNaN(sendFormPropPrice)) return;
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(`${BACKEND_URL}/api/bookings/mock/send`, {
        buyerId: sendFormRecipient._id || sendFormRecipient,
        propertyName: sendFormPropName,
        propertyPrice: Number(sendFormPropPrice)
      }, config);
      toast.success(res.data.message || "Mock Booking Form dispatched successfully!");
      setSendFormModalOpen(false);
      fetchMockBookings();
      socketConn?.emit("mock_booking_updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch booking form.");
    }
  };

  const fetchAgentLocks = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/properties/agent/my-locks`);
      setAgentPropertyLocks(res.data.locks || []);
    } catch (e) {
      console.warn("Could not retrieve agent locks:", e.message);
    }
  };

  const fetchAgentVisits = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/site-visits/agent-visits`);
      setVisits(res.data.visits || []);
    } catch (e) {
      console.warn("Could not retrieve agent visits:", e.message);
    }
  };

  const fetchMyProperties = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/properties/all`);
      const filtered = (res.data.properties || []).filter(
        (p) => p.uploadedBy?._id === (user?.id || user?._id),
      );
      setMyProperties(filtered);
    } catch (e) {
      console.warn("Could not retrieve agent listings:", e.message);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/site-visits/agent-customers`);
      setCustomers(res.data.customers || []);
    } catch (e) {
      console.warn("Could not retrieve customers list:", e.message);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/properties/projects`);
      const projList = res.data.projects || [];
      setProjects(projList);
      const plotProjs = projList.filter(p => p.type === "plot");
      if (plotProjs.length > 0) {
        setPlotProjectId(plotProjs[0]._id);
      }
    } catch (e) {
      console.warn("Could not retrieve projects list:", e.message);
    }
  };

  const handlePlotImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField("plotImage");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await axios.post(
        `${BACKEND_URL}/api/properties/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (uploadRes.data.success) {
        setPlotImage(uploadRes.data.url);
        toast.success("Successfully uploaded plot overview image.");
      }
    } catch (err) {
      toast.error("Failed to upload plot image.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/properties/projects`, projectForm);
      toast.success(res.data.message || "Project created successfully.");
      setProjectForm({
        name: "",
        type: "Residential",
        location: "",
        reraNumber: "",
        description: "",
        image: "",
        coordinates: { lat: 28.4595, lng: 77.0266 },
      });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project.");
    }
  };

  const handleProjectFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField("projectImage");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await axios.post(
        `${BACKEND_URL}/api/properties/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (uploadRes.data.success) {
        setProjectForm((prev) => ({
          ...prev,
          image: uploadRes.data.url,
        }));
        toast.success("Successfully uploaded project logo.");
      }
    } catch (err) {
      toast.error("Failed to upload project logo.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleCreatePlotLayout = async (e) => {
    e.preventDefault();
    if (!plotName || !plotSqft) {
      return toast.error("Please fill in all required fields (Name, Sqft)");
    }
    try {
      const basePricePerSqft = 350;
      const splitSegments = plotSegmentsInput.split("\n").map((line) => {
        const parts = line.split(":");
        const name = parts[0]?.trim();
        const sqftVal = Number(parts[1]?.trim()) || 1500;
        const priceVal = parts[2] ? Number(parts[2]?.trim()) : (sqftVal * basePricePerSqft);
        return {
          plotNumber: name,
          totalSqft: sqftVal,
          basePrice: priceVal,
          status: "vacant"
        };
      }).filter(s => s.plotNumber);

      const payload = {
        projectId: plotProjectId || undefined,
        name: plotName,
        totalSqft: Number(plotSqft),
        address: plotAddress,
        lat: Number(plotLat),
        lng: Number(plotLng),
        highlightedImageUrl: plotImage || "",
        segments: splitSegments
      };
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(`${BACKEND_URL}/api/plots/add`, payload, config);
      toast.success(res.data.message);
      setPlotName("");
      setPlotSqft("");
      setPlotImage("");
      setAddMode("property");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload plot layout.");
    }
  };



  const fetchSuperAdmins = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/super-admins`);
      setSuperAdmins(res.data.superAdmins || []);
    } catch (e) {
      console.warn("Could not retrieve super admin contacts:", e.message);
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

  const chatRecipientRef = useRef(null);
  const selectedSuperAdminChatRef = useRef(null);

  useEffect(() => {
    chatRecipientRef.current = chatRecipient;
  }, [chatRecipient]);

  useEffect(() => {
    selectedSuperAdminChatRef.current = selectedSuperAdminChat;
  }, [selectedSuperAdminChat]);

  // Socket Connection for Chat
  useEffect(() => {
    if (user) {
      const socket = io(BACKEND_URL);
      setSocketConn(socket);

      socket.emit("join_room", { userId: user.id || user._id });

      socket.on("receive_message", (msg) => {
        const senderId = msg.sender?._id || msg.sender;
        const receiverId = msg.receiver?._id || msg.receiver || msg.recipient?._id || msg.recipient;

        const activeSuperAdmin = selectedSuperAdminChatRef.current;
        const activeRecipient = chatRecipientRef.current;

        if (activeSuperAdmin) {
          const contactId = activeSuperAdmin._id || activeSuperAdmin;
          if (senderId === contactId || receiverId === contactId) {
            setSuperAdminChatMessages((prev) => {
              if (prev.some((m) => m._id === msg._id)) return prev;
              return [...prev, msg];
            });
          }
        }

        if (activeRecipient) {
          const contactId = activeRecipient._id || activeRecipient;
          if (senderId === contactId || receiverId === contactId) {
            setChatMessages((prev) => {
              if (prev.some((m) => m._id === msg._id)) return prev;
              return [...prev, msg];
            });
          }
        }

        // Increment unread if chat window is closed
        if (!chatOpen && !activeSuperAdmin) {
          setUnreadMsgCount((prev) => prev + 1);
        }
      });

      socket.on("receive_mock_booking_update", () => {
        fetchMockBookings();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const handleOpenChat = async (recipient) => {
    if (!recipient) return;
    setChatRecipient(recipient);
    setSelectedSuperAdminChat(null);
    setSuperAdminChatMessages([]);
    setChatOpen(true);
    setUnreadMsgCount(0);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/chats/history/${recipient._id || recipient}`);
      setChatMessages(res.data.messages || []);
    } catch (e) {
      console.warn("Could not fetch chat logs:", e.message);
      if (e.response?.status === 403) {
        toast.error("🔒 Chat is locked. You must accept the lock request before chatting with this client.", {
          duration: 5000
        });
        setChatOpen(false);
        setChatRecipient(null);
      } else {
        toast.error("Could not load chat history.");
      }
    }
  };

  const handleOpenSuperAdminChat = async (superAdmin) => {
    if (!superAdmin) return;
    setSelectedSuperAdminChat(superAdmin);
    setChatOpen(false);
    setChatRecipient(null);
    setChatMessages([]);
    try {
      const contactId = superAdmin._id || superAdmin;
      const res = await axios.get(`${BACKEND_URL}/api/chats/history/${contactId}`);
      setSuperAdminChatMessages(res.data.messages || []);
      setActiveTab("super_admin_chat");
    } catch (err) {
      console.warn("Could not load super admin chat history:", err.message);
      toast.error("Failed to load super admin chat history.");
    }
  };

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

  const handleSendSuperAdminChat = async (e) => {
    e.preventDefault();
    if (!superAdminChatInput.trim() || !selectedSuperAdminChat) return;

    const recipientId = selectedSuperAdminChat._id || selectedSuperAdminChat;
    const msgData = {
      sender: user.id || user._id,
      recipient: recipientId,
      message: superAdminChatInput.trim(),
    };

    try {
      setSuperAdminChatInput("");
      await axios.post(`${BACKEND_URL}/api/chats/send`, msgData);
    } catch (err) {
      toast.error("Failed to send message to super admin.");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, superAdminChatMessages]);

  const handleAgentRespondToLock = async (lockId, decision) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/properties/agent/lock/${lockId}/respond`, { decision });
      toast.success(res.data.message);
      fetchAgentLocks();
      if (decision === "accept" && res.data.lock?.buyer) {
        handleOpenChat(res.data.lock.buyer);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to respond to lock request.");
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField("profileImage");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await axios.post(
        `${BACKEND_URL}/api/properties/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (uploadRes.data.success) {
        setProfileImage(uploadRes.data.url);
        toast.success("Successfully uploaded profile photo.");
      }
    } catch (err) {
      toast.error("Failed to upload profile photo.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/auth/update-profile`,
        { name: profileName, phone: profilePhone, image: profileImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleAddPropertyUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField("image");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await axios.post(
        `${BACKEND_URL}/api/properties/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (uploadRes.data.success) {
        setPropertyForm((prev) => ({
          ...prev,
          image: uploadRes.data.url,
        }));
        toast.success("Successfully uploaded listing banner image.");
      }
    } catch (err) {
      toast.error("Failed to upload image banner.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(`${BACKEND_URL}/api/properties/add`, {
        ...propertyForm,
        additionalFeatures: propertyForm.additionalFeatures
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      }, config);
      toast.success(res.data.message);
      setPropertyForm({
        name: "",
        description: "",
        price: "",
        area: "",
        beds: 3,
        baths: 2,
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        coordinates: { lat: 28.4595, lng: 77.0266 },
        type: "Apartment",
        status: "For Sale",
        additionalFeatures: "",
        image: "",
      });
      setActiveTab("property_list");
      fetchMyProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create property.");
    }
  };

  const handleAcceptVisit = async (visitId) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/site-visits/${visitId}/accept`);
      toast.success(res.data.message);
      fetchAgentVisits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept site visit.");
    }
  };

  const handleRejectVisit = async (visitId) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/site-visits/${visitId}/reject`);
      toast.success(res.data.message);
      fetchAgentVisits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject site visit.");
    }
  };

  const handleStartVisit = async (visitId) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/site-visits/${visitId}/start`);
      toast.success(res.data.message);
      fetchAgentVisits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start visit & generate OTP.");
    }
  };

  // OTP checkin triggers GPS logging
  const handleCheckInOtpVerify = async (e) => {
    e.preventDefault();
    if (!selectedVisitForOtpVerify || !otpInput.trim()) return;

    const submitOtpVerify = async (lat, lng) => {
      try {
        const res = await axios.put(
          `${BACKEND_URL}/api/site-visits/${selectedVisitForOtpVerify._id}/verify-otp`,
          {
            otp: otpInput.trim(),
            lat,
            lng,
          },
        );
        toast.success(res.data.message);
        setOtpVerifyModalOpen(false);
        setSelectedVisitForOtpVerify(null);
        setOtpInput("");
        fetchAgentVisits();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed OTP verification.");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await submitOtpVerify(position.coords.latitude, position.coords.longitude);
        },
        async (err) => {
          console.warn("Geolocation failed, using fallback GPS:", err.message);
          const mockLat = 28.4595 + (Math.random() - 0.5) * 0.01;
          const mockLng = 77.0266 + (Math.random() - 0.5) * 0.01;
          await submitOtpVerify(mockLat, mockLng);
        }
      );
    } else {
      const mockLat = 28.4595 + (Math.random() - 0.5) * 0.01;
      const mockLng = 77.0266 + (Math.random() - 0.5) * 0.01;
      await submitOtpVerify(mockLat, mockLng);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitForCheckout) return;

    const submitCheckout = async (lat, lng) => {
      try {
        const res = await axios.put(
          `${BACKEND_URL}/api/site-visits/${selectedVisitForCheckout._id}/complete`,
          {
            ...checkoutForm,
            lat,
            lng,
          },
        );
        toast.success(res.data.message);
        setCheckoutModalOpen(false);
        setSelectedVisitForCheckout(null);
        setCheckoutForm({ visitSummary: "", buyerInterestLevel: "Interested", completionRemarks: "" });
        fetchAgentVisits();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed checkout completion.");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await submitCheckout(position.coords.latitude, position.coords.longitude);
        },
        async (err) => {
          console.warn("Geolocation failed, using fallback GPS:", err.message);
          const mockLat = 28.4595 + (Math.random() - 0.5) * 0.01;
          const mockLng = 77.0266 + (Math.random() - 0.5) * 0.01;
          await submitCheckout(mockLat, mockLng);
        }
      );
    } else {
      const mockLat = 28.4595 + (Math.random() - 0.5) * 0.01;
      const mockLng = 77.0266 + (Math.random() - 0.5) * 0.01;
      await submitCheckout(mockLat, mockLng);
    }
  };

  const handleSeedData = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/properties/seed`);
      toast.success(res.data.message || "Database successfully seeded.");
      fetchAgentLocks();
      fetchAgentVisits();
      fetchMyProperties();
      fetchCustomers();
      fetchAllProperties();
      fetchProjects();
    } catch (err) {
      toast.error("Failed to run seed script.");
    }
  };

  const getSidebarTabs = () => {
    return [
      { id: "agent", label: "Agent CRM Portal", icon: TrendingUp },
      { id: "agent_locks", label: "Property Lock Requests", icon: Lock },
      { id: "add_project", label: "Add Project", icon: Plus },
      { id: "add_property", label: "Add Property", icon: Plus },
      { id: "property_list", label: "My Listings", icon: Building },
      { id: "properties", label: "Explore Projects", icon: Search },
      { id: "visits", label: "Book Client Visits", icon: Calendar },
      { id: "customers", label: "My Customers", icon: User },
      { id: "super_admin_chat", label: "Super Admin Chat", icon: ShieldAlert },
      { id: "mock_bookings", label: "Mock Bookings", icon: FileText },
      { id: "profile", label: "Edit Profile", icon: User },
    ];
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
              Agent Control Panel
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
                  const isChatTab = tab.id === "super_admin_chat" || tab.id === "customers";
                  return (
                    <div key={tab.id} className="relative">
                      <SidebarLink
                        link={{
                          label: tab.label,
                          href: "#",
                          icon: (
                            <div className="relative">
                              <Icon
                                className={`h-4.5 w-4.5 shrink-0 ${activeTab === tab.id ? "text-black font-black" : "text-slate-700"}`}
                              />
                              {isChatTab && unreadMsgCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-rose-500 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                                  <span className="text-[7px] font-black text-white leading-none">{unreadMsgCount > 9 ? "9+" : unreadMsgCount}</span>
                                </span>
                              )}
                            </div>
                          ),
                        }}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (isChatTab) setUnreadMsgCount(0);
                        }}
                        className={
                          activeTab === tab.id
                            ? "bg-slate-200/60 text-slate-950 font-bold"
                            : ""
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profile Avatar Info & Logout */}
            <div className="border-t border-slate-200 pt-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-2 overflow-hidden truncate">
                {currentUser?.image ? (
                  <img 
                    src={currentUser.image.startsWith("http") ? currentUser.image : `${BACKEND_URL}${currentUser.image}`} 
                    alt="" 
                    className="h-8 w-8 rounded-full object-cover border shrink-0" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs uppercase shrink-0">
                    {currentUser?.name?.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {currentUser?.name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">
                    {currentUser?.email}
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
                  Agent Profile
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-500 font-extrabold uppercase">
                  Licensed Representative
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-xs text-slate-450 mt-1 max-w-lg leading-relaxed font-semibold">
                Manage assigned property locks, schedule walkthrough tours, and communicate securely with buyers.
              </p>
            </div>
          </div>

          {/* TAB 1: AGENT CRM PORTAL OVERVIEW (REF IMAGE 3 & 4 Style) */}
          {activeTab === "agent" && (
            <div className="space-y-8 animate-fade-in text-left font-sans">
              {/* KPI metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-orange-100/70 bg-gradient-to-tr from-orange-50/60 to-amber-50/30 rounded-3xl p-5 shadow-sm text-left flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Total Listings</span>
                    <h4 className="text-2xl font-black text-slate-800 mt-1">{myProperties.length} <span className="text-[10px] text-emerald-600 font-bold ml-1">Live</span></h4>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0">
                    <Building className="h-5 w-5" />
                  </div>
                </div>

                <div className="border border-rose-100/70 bg-gradient-to-tr from-rose-50/60 to-orange-50/30 rounded-3xl p-5 shadow-sm text-left flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">Total Visits</span>
                    <h4 className="text-2xl font-black text-slate-800 mt-1">{visits.length} <span className="text-[10px] text-rose-600 font-bold ml-1">Booked</span></h4>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                <div className="border border-teal-100/70 bg-gradient-to-tr from-teal-50/60 to-emerald-50/30 rounded-3xl p-5 shadow-sm text-left flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">Conversion Rate</span>
                    <h4 className="text-2xl font-black text-slate-800 mt-1">
                      {visits.filter(v=>v.status==='completed').length > 0 ? Math.round((visits.filter(v=>v.status==='completed').length / Math.max(1, visits.length)) * 100) : 0}%
                    </h4>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-teal-100/80 text-teal-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>

                <div className="border border-blue-100/70 bg-gradient-to-tr from-blue-50/60 to-indigo-50/30 rounded-3xl p-5 shadow-sm text-left flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">Approved Locks</span>
                    <h4 className="text-2xl font-black text-slate-800 mt-1">
                      {agentPropertyLocks.filter(l=>l.status==='agent_accepted').length}
                    </h4>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* DOUBLE CHARTS ROW (Image 3 Style) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                {/* Sales Performance stacked bar chart (Left) */}
                <div className="xl:col-span-7 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase">Sales Performance</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Monthly commission parameters tracking</p>
                    </div>
                    <select className="p-1.5 border rounded-xl text-[10px] font-bold bg-slate-50 cursor-pointer outline-none">
                      <option>Real-Time Dynamic</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-[10px] font-bold text-slate-500">
                    <span>Visits: <span className="font-black text-slate-850 text-xs">{visits.length}</span></span>
                    <span>Completed: <span className="font-black text-slate-850 text-xs">{visits.filter(v=>v.status==='completed').length}</span></span>
                    <span>Pending: <span className="font-black text-slate-850 text-xs">{visits.filter(v=>v.status==='scheduled').length}</span></span>
                    <span>Lock Requests: <span className="font-black text-slate-850 text-xs">{agentPropertyLocks.length}</span></span>
                  </div>
                  {/* Monthly column charts */}
                  <div className="h-48 mt-6 w-full flex items-end justify-between px-2 pt-2 border-b">
                    {[
                      { g: 60, n: 40, t: 15 },
                      { g: 75, n: 55, t: 12 },
                      { g: 70, n: 50, t: 18 },
                      { g: 45, n: 35, t: 10 },
                      { g: 72, n: 52, t: 15 },
                      { g: 82, n: 60, t: 20 },
                      { g: 78, n: 58, t: 18 },
                      { g: 65, n: 45, t: 12 },
                      { g: 80, n: 55, t: 22 },
                      { g: 88, n: 65, t: 24 },
                      { g: 82, n: 60, t: 18 },
                      { g: Math.min(100, 30 + (visits.length * 10)), n: Math.min(100, 20 + (visits.filter(v=>v.status==='completed').length * 15)), t: Math.min(100, 10 + (agentPropertyLocks.length * 5)) },
                    ].map((val, idx) => (
                      <div key={idx} className="flex gap-0.5 items-end h-full w-4">
                        <div className="w-1 bg-teal-500 rounded-t-xs hover:opacity-90" style={{ height: `${(val.g / 100) * 100}%`, backgroundColor: "#14b8a6" }} title="Visits" />
                        <div className="w-1 bg-coral-coral rounded-t-xs hover:opacity-90" style={{ height: `${(val.n / 100) * 100}%`, backgroundColor: "#f87171" }} title="Completed Tours" />
                        <div className="w-1 bg-slate-900 rounded-t-xs hover:opacity-90" style={{ height: `${(val.t / 100) * 100}%` }} title="Escrow Locks" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-2 px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-[9px] font-black uppercase tracking-wider text-slate-450 pt-2 border-t">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-500" style={{ backgroundColor: "#14b8a6" }} /> Total Tours</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Completed Tours</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-900" /> Escrow Locks</span>
                  </div>
                </div>

                {/* Recent Agent Status line chart (Right) */}
                <div className="xl:col-span-5 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase">Recent Agent Status</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Walkthrough completion tracker</p>
                    </div>
                    <select className="p-1.5 border rounded-xl text-[10px] font-bold bg-slate-50 cursor-pointer outline-none">
                      <option>Real-Time Dynamic</option>
                    </select>
                  </div>
                  <div className="pt-4 font-mono text-xs font-black text-slate-800 flex items-baseline gap-2">
                    <span className="text-2xl font-black">{visits.filter(v=>v.status==='completed').length} Tours</span>
                    <span className="text-emerald-500 text-xs font-bold font-sans">Walkthroughs Completed</span>
                  </div>
                  {/* SVG line chart */}
                  <div className="h-44 mt-4 w-full relative">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      <path d={`M0,100 Q100,20 200,90 T400,${Math.max(10, 100 - visits.length * 12)} T500,${Math.max(5, 80 - visits.filter(v=>v.status==='completed').length * 15)}`} fill="none" stroke="#0ea5e9" strokeWidth="3" />
                      <path d="M0,70 Q100,120 200,60 T400,100 T500,85" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3" />
                      <circle cx="500" cy={Math.max(5, 80 - visits.filter(v=>v.status==='completed').length * 15)} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-2 font-sans px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-[9px] font-black uppercase tracking-wider text-slate-450 pt-2 border-t">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" /> Walkthroughs</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" /> Pending</span>
                  </div>
                </div>
              </div>

              {/* AGENT PERFORMANCE & TARGET PROGRESS ROW (Image 3 & 4 Style) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Best Performing Agents */}
                <div className="lg:col-span-5 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase pb-2 border-b">Active Agent Info</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Licensed representative details</p>
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs uppercase border border-orange-200">{user?.name?.charAt(0)}</div>
                        <div className="text-left">
                          <div className="font-bold text-slate-900">{user?.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">Experience: {user?.experience || 5} Years</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-800 font-bold block">{myProperties.length} Managed Listings</span>
                        <span className="text-[9px] text-orange-500 font-bold">RERA: {user?.reraId || "RERA-VERIFIED"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Progress & Revenue Donut Chart */}
                <div className="lg:col-span-7 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Rent progress */}
                  <div className="space-y-4 text-left">
                    <div>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] rounded uppercase font-black">Walkthrough Goal</span>
                      <h4 className="text-sm font-black text-slate-850 mt-1 uppercase">Client site visits progress</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-slate-800">10 Walkthroughs Goal</span>
                        <span className="text-orange-600">
                          {Math.min(100, Math.round((visits.filter(v=>v.status==='completed').length / 10) * 100))}% Achieved
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((visits.filter(v=>v.status==='completed').length / 10) * 100))}%` }} />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">Target updates continuously as client tours are completed and verified by GPS coordinates.</div>
                  </div>

                  {/* Revenue Donut Chart */}
                  <div className="flex flex-col justify-between items-center h-full">
                    <div className="h-32 w-32 relative flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        {/* segments mapping dynamically */}
                        <circle className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <circle className="text-teal-500" strokeDasharray="50, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <circle className="text-orange-500" strokeDasharray="30, 100" strokeDashoffset="-50" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <circle className="text-blue-500" strokeDasharray="20, 100" strokeDashoffset="-80" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-[14px] font-black text-slate-800">{myProperties.length} Units</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Managed</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-bold text-slate-500 mt-3 w-full">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Listings ({myProperties.length})</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Visits ({visits.length})</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Locks ({agentPropertyLocks.length})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DYNAMIC LISTINGS TABLE */}
              <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-xs text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b gap-3">
                  <div>
                    <h3 className="font-black text-sm text-slate-800 uppercase">My Managed Listings</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Inspect your published catalog and review status</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search managed properties..."
                      className="p-2 border rounded-xl bg-slate-50 text-[10px] font-semibold text-slate-700 outline-none w-full sm:w-48"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto mt-4 font-semibold text-slate-700">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-5 py-3">Property</th>
                        <th className="px-5 py-3 font-mono">Type</th>
                        <th className="px-5 py-3">Location</th>
                        <th className="px-5 py-3 text-right">Price</th>
                        <th className="px-5 py-3 text-right font-mono">Views</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {myProperties.map((p, idx) => (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img src={getImageUrl(p.image) || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100"} alt="" className="h-10 w-14 object-cover rounded-lg border shrink-0" />
                              <span className="font-bold text-slate-900">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-[10px] text-slate-500">{p.type}</td>
                          <td className="px-5 py-4">{p.city}</td>
                          <td className="px-5 py-4 text-right text-slate-900">{formatINR(p.price)}</td>
                          <td className="px-5 py-4 text-right font-mono text-[10px] text-slate-500">{1450 + (idx * 120)}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.status === 'Sold' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{p.status}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => navigate(`/property/${p._id}`)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-bold uppercase transition-all shadow-xs cursor-pointer">View</button>
                          </td>
                        </tr>
                      ))}
                      {myProperties.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 italic">No listings uploaded under your account yet. Use the 'Add Property' tab to register one.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENT PROPERTY LOCK REQUESTS */}
          {activeTab === "agent_locks" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                  Property Lock Requests
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  Review properties assigned to you by admin. Accept to open a chat channel with the buyer.
                </p>
              </div>

              {agentPropertyLocks.length === 0 ? (
                <div className="py-16 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50 text-slate-400">
                  <Lock className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-bold mt-2">
                    No property lock requests assigned yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agentPropertyLocks.map((lock) => (
                    <div
                      key={lock._id}
                      className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm space-y-3.5 text-xs font-semibold flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100">
                        <div className="text-left">
                          {lock.property ? (
                            <>
                              <h4 className="font-black text-sm text-slate-800">
                                {lock.property?.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {[
                                  lock.property?.streetAddress,
                                  lock.property?.city,
                                  lock.property?.state,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                              <p className="text-[11px] font-bold text-orange-605 mt-1">
                                {formatINR(lock.property?.price || 0)}
                              </p>
                            </>
                          ) : (
                            <>
                              <h4 className="font-black text-sm text-slate-800">
                                {lock.plot?.name} - Segment #{lock.plot?.segments?.find(s => s._id === lock.plotSegmentId)?.plotNumber || "Plot"}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {lock.plot?.address || "Premium Township"}
                              </p>
                              <p className="text-[11px] font-bold text-orange-605 mt-1">
                                {formatINR(lock.plot?.segments?.find(s => s._id === lock.plotSegmentId)?.basePrice || 0)}
                              </p>
                            </>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            lock.status === "agent_accepted"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : lock.status === "agent_rejected"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                          }`}
                        >
                          {lock.status?.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                            Buyer
                          </span>
                          <span className="font-extrabold text-slate-800 block mt-0.5">
                            {lock.buyer?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {lock.buyer?.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                            Assigned On
                          </span>
                          <span className="font-extrabold text-slate-800 block mt-0.5 font-mono">
                            {lock.agentAssignedAt
                              ? new Date(lock.agentAssignedAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>

                      {lock.status === "agent_assigned" && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleAgentRespondToLock(lock._id, "accept")}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] rounded-xl uppercase cursor-pointer"
                          >
                            Accept & Open Chat
                          </button>
                          <button
                            onClick={() => handleAgentRespondToLock(lock._id, "reject")}
                            className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[10px] rounded-xl uppercase cursor-pointer border border-red-200"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {lock.status === "agent_accepted" && (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleOpenChat(lock.buyer)}
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[10px] rounded-xl uppercase cursor-pointer flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Chat with Buyer
                          </button>
                          <button
                            onClick={() => {
                              if (lock.property) {
                                navigate(`/property/${lock.property._id}`);
                              } else if (lock.plot) {
                                navigate(`/plots?layoutId=${lock.plot._id}`);
                              }
                            }}
                            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] rounded-xl uppercase cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            Explore Details
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AGENT SITE VISITS */}
          {activeTab === "visits" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                  Client Walkthrough Site Visits
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  Manage tour requests, verify client check-in OTP codes, and log check-out locations.
                </p>
              </div>

              {visits.length === 0 ? (
                <div className="py-16 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50 text-slate-400">
                  <Calendar className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-bold mt-2">
                    No site visits scheduled yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                  {visits.map((v) => (
                    <div key={v._id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Client Walkthrough</span>
                            <h4 className="font-extrabold text-sm text-slate-800 mt-1">{v.buyer?.name || "Anonymous Client"}</h4>
                            <p className="text-[10px] text-slate-450 mt-0.5">{v.buyer?.email} • {v.buyer?.phone}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                            v.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            v.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                            v.status === "in_progress" ? "bg-teal-50 text-teal-700 border-teal-200 animate-pulse" :
                            "bg-orange-50 text-orange-700 border-orange-200 animate-pulse"
                          }`}>
                            {v.status}
                          </span>
                        </div>

                        <div className="border-t border-b border-slate-100/80 py-3 space-y-2 text-[11px]">
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-slate-400">🏠</span>
                            <span className="font-bold">{v.property?.name || v.project?.name || "Site Complex"}</span>
                            <span className="text-slate-400 font-medium font-sans">({v.property?.city || v.project?.location})</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-505 font-mono">
                            <span className="text-slate-400">📅</span>
                            <span>{v.date}</span>
                            <span className="text-slate-350">•</span>
                            <span className="font-sans font-medium">{v.timeSlot}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 justify-end">
                        {v.buyer && (
                          <button
                            onClick={() => handleOpenChat(v.buyer)}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-extrabold text-[10px] uppercase cursor-pointer"
                          >
                            Chat
                          </button>
                        )}
                        {v.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAcceptVisit(v._id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold text-[10px] uppercase cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectVisit(v._id)}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-extrabold text-[10px] uppercase cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {v.status === "confirmed" && !v.otp && (
                          <button
                            onClick={() => handleStartVisit(v._id)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-extrabold text-[10px] uppercase cursor-pointer"
                          >
                            Start & Generate OTP
                          </button>
                        )}
                        {v.status === "confirmed" && v.otp && (
                          <button
                            onClick={() => {
                              setSelectedVisitForOtpVerify(v);
                              setOtpVerifyModalOpen(true);
                            }}
                            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-extrabold text-[10px] uppercase cursor-pointer"
                          >
                            Verify OTP Check-In
                          </button>
                        )}
                        {v.status === "in_progress" && (
                          <button
                            onClick={() => {
                              setSelectedVisitForCheckout(v);
                              setCheckoutModalOpen(true);
                            }}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-[10px] uppercase cursor-pointer"
                          >
                            Complete Check-Out
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

            {activeTab === "add_project" && (
                <div className="space-y-6 text-left animate-fade-in font-sans">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Initialize Project Pipeline</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">Set up development projects, define coordinates, and input description details.</p>
                  </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleCreateProject} className="lg:col-span-6 lg:sticky lg:top-4 border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm space-y-4 text-xs font-semibold text-left">
                  <h3 className="text-sm font-black text-slate-800 pb-2 border-b">Project Creation Console</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Project Name</label>
                    <input type="text" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="e.g. DLF Magnolias Phase 2" className="p-2.5 bg-slate-50 border rounded-xl" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Development Type</label>
                      <select value={projectForm.type} onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })} className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer text-slate-700">
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Plotting</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">RERA Registration No</label>
                      <input type="text" value={projectForm.reraNumber} onChange={(e) => setProjectForm({ ...projectForm, reraNumber: e.target.value })} placeholder="e.g. RERA-HR-2025-019" className="p-2.5 bg-slate-50 border rounded-xl" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Geographical location</label>
                    <input type="text" value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} placeholder="e.g. Sector 54, Gurugram, Haryana" className="p-2.5 bg-slate-50 border rounded-xl" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Latitude</label>
                      <input type="number" step="any" value={projectForm.coordinates.lat} onChange={(e) => setProjectForm({ ...projectForm, coordinates: { ...projectForm.coordinates, lat: Number(e.target.value) } })} className="p-2.5 bg-slate-50 border rounded-xl font-mono" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Longitude</label>
                      <input type="number" step="any" value={projectForm.coordinates.lng} onChange={(e) => setProjectForm({ ...projectForm, coordinates: { ...projectForm.coordinates, lng: Number(e.target.value) } })} className="p-2.5 bg-slate-50 border rounded-xl font-mono" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Description</label>
                    <textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Project details, timeline milestones, construction progress..." rows={3} className="p-2.5 bg-slate-50 border rounded-xl focus:outline-none" required />
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 relative hover:bg-slate-100/50 transition-colors">
                    <span className="text-[9px] font-extrabold uppercase text-slate-455 tracking-wider">Project Image Banner</span>
                    {projectForm.image ? (
                      <div className="mt-3 flex flex-col items-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <span className="text-[9px] text-slate-500 font-mono mt-1 truncate max-w-xs">{projectForm.image}</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-col items-center">
                        <UploadCloud className="h-8 w-8 text-slate-400" />
                        <label className="cursor-pointer mt-2 text-[9px] font-extrabold text-orange-500 hover:underline">
                          {uploadingField === "projectImage" ? "Uploading..." : "Choose File"}
                          <input type="file" accept="image/*" onChange={handleProjectFileUpload} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl uppercase">Create Project</button>
                </form>

                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-black text-sm text-slate-800 pb-2 border-b text-left">📍 Project Location Preview</h3>
                    <LeafletMap 
                      lat={projectForm.coordinates.lat || 28.4595} 
                      lng={projectForm.coordinates.lng || 77.0266} 
                      popupText={projectForm.name || "Target Location"} 
                    />
                  </div>

                  <h3 className="font-black text-sm text-slate-800 pb-2 border-b text-left">Active Pipeline Projects</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {projects.map((proj) => (
                      <div key={proj._id} className="border border-slate-200 bg-white rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                        <div className="text-left">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] rounded uppercase font-black">{proj.type}</span>
                          <h4 className="font-bold text-sm text-slate-800 mt-2 truncate">{proj.name}</h4>
                          <p className="text-[10px] text-slate-450 mt-0.5 truncate">{proj.location}</p>
                        </div>
                        <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center text-[10px] text-slate-400">
                          <span>RERA Verified</span>
                          <span className="font-mono font-bold text-slate-700">{proj.reraNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "add_property" && (
            <div className="space-y-6 text-left animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                    {addMode === "property" ? "List New Property Record" : "Upload Plot Layout Split"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                    {addMode === "property" 
                      ? "Publish a new real estate inventory catalog record to the public marketplace search index."
                      : "Create a parent plot layout block divided into custom segments with real-time status matrix."
                    }
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border self-start sm:self-center">
                  <button
                    onClick={() => setAddMode("property")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                      addMode === "property"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Property Listing
                  </button>
                  <button
                    onClick={() => setAddMode("plot")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                      addMode === "plot"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Plot Split Layout
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  {addMode === "plot" ? (
                    <form
                      onSubmit={handleCreatePlotLayout}
                      className="border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm space-y-6 text-xs font-semibold text-left"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                              Target Plot Project
                            </label>
                            <select
                              value={plotProjectId}
                              onChange={(e) => setPlotProjectId(e.target.value)}
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
                            >
                              <option value="">Individual Plot (No Project Mapping)...</option>
                              {projects.filter(p => p.type === "plot" || p.type === "Plotting").map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} ({p.location})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                              Layout Name / Code
                            </label>
                            <input
                              type="text"
                              value={plotName}
                              onChange={(e) => setPlotName(e.target.value)}
                              placeholder="e.g. Block-B Layout"
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                              Overall Sqft Area
                            </label>
                            <input
                              type="number"
                              value={plotSqft}
                              onChange={(e) => setPlotSqft(e.target.value)}
                              placeholder="e.g. 10000"
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                              Plot Address / Site Location
                            </label>
                            <input
                              type="text"
                              value={plotAddress}
                              onChange={(e) => setPlotAddress(e.target.value)}
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                Latitude
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={plotLat}
                                onChange={(e) => setPlotLat(Number(e.target.value))}
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                Longitude
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={plotLng}
                                onChange={(e) => setPlotLng(Number(e.target.value))}
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                              Layout Overview Image
                            </label>
                            {plotImage ? (
                              <div className="mt-1 flex items-center gap-2">
                                <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{plotImage}</span>
                              </div>
                            ) : (
                              <div className="mt-1">
                                <label className="cursor-pointer text-[10px] font-extrabold text-orange-500 hover:underline">
                                  {uploadingField === "plotImage" ? "Uploading..." : "Choose Image File"}
                                  <input type="file" accept="image/*" onChange={handlePlotImageUpload} className="hidden" />
                                </label>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                              Segments Splitting Setup (Format: Name: Sqft: OptionalPrice)
                            </label>
                            <textarea
                              rows={4}
                              value={plotSegmentsInput}
                              onChange={(e) => setPlotSegmentsInput(e.target.value)}
                              placeholder="101: 1500: 525000&#10;102: 1500: 525000&#10;103: 3000: 1050000"
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-orange-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 border border-dashed border-slate-200 rounded-2xl leading-normal text-slate-500">
                        💡 This plot layout will be uploaded as <b>Pending Super Admin Approval</b> (isApproved: false). It will remain completely hidden from buyers until approved by a Super Admin in their panel.
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        Submit Plot layout for approval
                      </button>
                    </form>
                  ) : (
                    <form
                      onSubmit={handleCreateProperty}
                      className="border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm space-y-6 text-xs font-semibold text-left"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                              Associated Project
                            </label>
                            <select
                              value={propertyForm.project || ""}
                              onChange={(e) =>
                                setPropertyForm({ ...propertyForm, project: e.target.value })
                              }
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
                            >
                              <option value="">Individual Property Listing (No Project Mapping)...</option>
                              {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} ({p.location})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                              Property / Listing Name
                            </label>
                            <input
                              type="text"
                              value={propertyForm.name}
                              onChange={(e) =>
                                setPropertyForm({ ...propertyForm, name: e.target.value })
                              }
                              placeholder="e.g. DLF Magnolias 3BHK Penthouse"
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                              Description Spec Sheet
                            </label>
                            <textarea
                              rows={3}
                              value={propertyForm.description}
                              onChange={(e) =>
                                setPropertyForm({ ...propertyForm, description: e.target.value })
                              }
                              placeholder="Describe internal floor layouts, balconies, ventilation, builder warranties..."
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                                Base Price (INR)
                              </label>
                              <input
                                type="number"
                                value={propertyForm.price}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, price: e.target.value })
                                }
                                placeholder="e.g. 7500000"
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                                Total Area (Sq. Ft.)
                              </label>
                              <input
                                type="number"
                                value={propertyForm.area}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, area: e.target.value })
                                }
                                placeholder="e.g. 1850"
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                                BHK configurations
                              </label>
                              <input
                                type="number"
                                value={propertyForm.beds}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, beds: Number(e.target.value) })
                                }
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                Bathrooms quantity
                              </label>
                              <input
                                type="number"
                                value={propertyForm.baths}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, baths: Number(e.target.value) })
                                }
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={propertyForm.streetAddress}
                              onChange={(e) =>
                                setPropertyForm({ ...propertyForm, streetAddress: e.target.value })
                              }
                              placeholder="e.g. Flat 104, Block C, Phase 2"
                              className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                City
                              </label>
                              <input
                                type="text"
                                value={propertyForm.city}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, city: e.target.value })
                                }
                                placeholder="e.g. Gurugram"
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                State
                              </label>
                              <input
                                type="text"
                                value={propertyForm.state}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, state: e.target.value })
                                }
                                placeholder="e.g. Haryana"
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                Zip / Postal Code
                              </label>
                              <input
                                type="text"
                                value={propertyForm.zipCode}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, zipCode: e.target.value })
                                }
                                placeholder="e.g. 122002"
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                                Country
                              </label>
                              <input
                                type="text"
                                value={propertyForm.country}
                                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-not-allowed"
                                disabled
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                GPS Latitude
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={propertyForm.coordinates.lat}
                                onChange={(e) =>
                                  setPropertyForm({
                                    ...propertyForm,
                                    coordinates: {
                                      ...propertyForm.coordinates,
                                      lat: Number(e.target.value),
                                    },
                                  })
                                }
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                GPS Longitude
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={propertyForm.coordinates.lng}
                                onChange={(e) =>
                                  setPropertyForm({
                                    ...propertyForm,
                                    coordinates: {
                                      ...propertyForm.coordinates,
                                      lng: Number(e.target.value),
                                    },
                                  })
                                }
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                Structural Design Type
                              </label>
                              <select
                                value={propertyForm.type}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, type: e.target.value })
                                }
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm cursor-pointer"
                              >
                                <option>Apartment</option>
                                <option>Penthouse</option>
                                <option>House</option>
                                <option>Land</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                                Listing Tag Status
                              </label>
                              <select
                                value={propertyForm.status}
                                onChange={(e) =>
                                  setPropertyForm({ ...propertyForm, status: e.target.value })
                                }
                                className="p-3 bg-white border border-slate-200 rounded-xl text-sm cursor-pointer"
                              >
                                <option>For Sale</option>
                                <option>For Rent</option>
                                <option>Seeded</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-6 space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                            Lifestyle Features & Amenities (Comma-separated)
                          </label>
                          <input
                            type="text"
                            value={propertyForm.additionalFeatures}
                            onChange={(e) =>
                              setPropertyForm({ ...propertyForm, additionalFeatures: e.target.value })
                            }
                            placeholder="e.g. 24/7 Security, Private Pool, Gymnasium, Power Backup"
                            className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                          />
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-250 rounded-2xl bg-slate-50 relative hover:bg-slate-100/50 transition-colors">
                          <span className="text-[9px] font-extrabold uppercase text-slate-455 tracking-wider">
                            Upload Listing Banner Image
                          </span>
                          {propertyForm.image ? (
                            <div className="mt-3 flex flex-col items-center">
                              <CheckCircle className="h-8 w-8 text-green-500" />
                              <span className="text-[10px] text-slate-500 font-mono mt-1 truncate max-w-xs">{propertyForm.image}</span>
                            </div>
                          ) : (
                            <div className="mt-3 flex flex-col items-center">
                              <UploadCloud className="h-8 w-8 text-slate-400" />
                              <label className="cursor-pointer mt-2 text-[10px] font-extrabold text-orange-500 hover:underline">
                                {uploadingField === "image" ? "Uploading..." : "Choose Image File"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAddPropertyUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        Publish Property Listing
                      </button>
                    </form>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-6">
                  {/* Dynamic map preview */}
                  <div className="space-y-2">
                    <h3 className="font-black text-sm text-slate-800 pb-2 border-b text-left">📍 Geographical Location Map</h3>
                    <LeafletMap 
                      lat={addMode === "plot" ? plotLat : (propertyForm.coordinates.lat || 28.4595)} 
                      lng={addMode === "plot" ? plotLng : (propertyForm.coordinates.lng || 77.0266)} 
                      popupText={addMode === "plot" ? (plotName || "Plot Location") : (propertyForm.name || "Property Location")} 
                    />
                  </div>

                  {/* Listings Preview */}
                  <div className="space-y-4">
                    <h3 className="font-black text-sm text-slate-800 pb-2 border-b text-left">🏠 Your Listing Pipeline</h3>
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {myProperties.length === 0 ? (
                        <p className="text-slate-400 italic text-[10px] text-left">No listings added yet under your account.</p>
                      ) : (
                        myProperties.map((p) => (
                          <div key={p._id} className="flex gap-3 bg-white p-3 border border-slate-100 rounded-2xl shadow-xs text-left text-xs items-center">
                            <img 
                              src={getImageUrl(p.image) || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100"} 
                              alt="" 
                              className="h-10 w-14 object-cover rounded-lg border shrink-0 bg-slate-50" 
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-850 truncate">{p.name}</h4>
                              <p className="text-[10px] text-slate-450 mt-0.5 truncate">{p.city}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 shrink-0">{formatINR(p.price)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 5: MY PROPERTY LISTINGS */}
          {activeTab === "property_list" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                  My Uploaded Listings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  Inspect and manage real estate listings uploaded under your representative credentials.
                </p>
              </div>

              {myProperties.length === 0 ? (
                <div className="py-16 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50 text-slate-400">
                  <Building className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-bold mt-2">
                    You have not uploaded any property listings yet.
                  </p>
                  <button
                    onClick={() => setActiveTab("add_property")}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    Add Property Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myProperties.map((prop) => (
                    <div
                      key={prop._id}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="h-44 overflow-hidden bg-slate-100">
                        <img
                          src={
                            getImageUrl(prop.image) ||
                            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"
                          }
                          alt={prop.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-black text-slate-800 truncate">
                            {prop.name}
                          </h4>
                          <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] rounded uppercase font-bold">
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {[prop.streetAddress, prop.city, prop.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <div className="text-[11px] font-bold text-slate-800">
                          {formatINR(prop.price)}
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between pt-2 border-t border-slate-50">
                          <span>{prop.beds} BHK • {prop.area} Sq. Ft.</span>
                          <span className="text-[9px] uppercase font-bold text-slate-400">
                            {prop.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EXPLORE PROJECTS */}
          {activeTab === "properties" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                    Browse Ecosystem Listings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                    Explore properties uploaded by other licensed agents and developers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {allProperties.map((prop) => (
                  <div
                    key={prop._id}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="h-44 overflow-hidden">
                      <img
                        src={
                          prop.image
                            ? prop.image.startsWith("http")
                              ? prop.image
                              : `${BACKEND_URL}/${prop.image.replace(/^\/+/, "").replace(/\\/g, "/")}`
                            : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"
                        }
                        alt={prop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-slate-800 truncate">
                          {prop.name}
                        </h4>
                        <span className="text-[10px] uppercase font-black tracking-widest text-white bg-slate-800 px-2 py-1 rounded-xl">
                          {prop.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {[prop.streetAddress, prop.city, prop.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <div className="text-[11px] font-bold text-slate-800">
                        {formatINR(prop.price)}
                      </div>
                      <div className="text-[10px] text-slate-500 flex flex-wrap gap-1">
                        <span>{prop.type}</span>
                        <span>•</span>
                        <span>{prop.beds} BHK</span>
                        <span>•</span>
                        <span>{prop.area} sq.ft</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MY ENGAGED CUSTOMERS */}
          {activeTab === "customers" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                  My Engaged Customers
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  Review buyers who scheduled site visits or locked listings under your portfolio assignment.
                </p>
              </div>

              {customers.length === 0 ? (
                <div className="py-16 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50 text-slate-400">
                  <User className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-bold mt-2">
                    No customers assigned to you yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {customers.map((c) => (
                    <div
                      key={c._id}
                      className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm uppercase">
                          {c.name?.charAt(0)}
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800">{c.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {c.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                        <span className="text-[10px] text-slate-500 font-bold">
                          {c.phone || "No Phone"}
                        </span>
                        <button
                          onClick={() => handleOpenChat(c)}
                          className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "super_admin_chat" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Super Admin Chat</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Connect with super admin for compliance approvals and escalation support.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1 border border-slate-200 bg-white rounded-3xl p-5 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800">Super Admins</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Choose a super admin to message.</p>
                  <div className="mt-4 space-y-3">
                    {superAdmins.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No super admins found.</div>
                    ) : (
                      superAdmins.map((admin) => (
                        <button
                          key={admin._id}
                          onClick={() => handleOpenSuperAdminChat(admin)}
                          className={`w-full text-left p-3 rounded-2xl border ${selectedSuperAdminChat?._id === admin._id ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white hover:bg-slate-50"} transition-colors duration-200`}
                        >
                          <div className="flex justify-between items-center gap-3">
                            <div>
                              <p className="font-bold text-slate-900 text-sm truncate">{admin.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{admin.email}</p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admin</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="xl:col-span-3 border border-slate-200 bg-white rounded-3xl p-5 shadow-sm flex flex-col min-h-[520px]">
                  <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Active Conversation</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Direct secure chat with selected super admin.</p>
                    </div>
                    {selectedSuperAdminChat && (
                      <button
                        onClick={() => {
                          setSelectedSuperAdminChat(null);
                          setSuperAdminChatMessages([]);
                          setSuperAdminChatInput("");
                        }}
                        className="text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                      >
                        Close
                      </button>
                    )}
                  </div>

                  {selectedSuperAdminChat ? (
                    <div className="flex-1 flex flex-col mt-5 overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-base">{selectedSuperAdminChat.name?.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{selectedSuperAdminChat.name}</p>
                          <p className="text-[10px] text-slate-400">{selectedSuperAdminChat.email}</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-3xl space-y-3 border border-slate-100">
                        {superAdminChatMessages.length === 0 ? (
                          <div className="text-[11px] text-slate-500 italic">No conversation yet. Send the first message to open the channel.</div>
                        ) : (
                          superAdminChatMessages.map((msg, idx) => {
                            const isMe = (msg.sender?._id || msg.sender) === (user?.id || user?._id);
                            return (
                              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[78%] rounded-3xl p-3 text-[11px] ${isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-800 rounded-bl-none border border-slate-200"}`}>
                                  <p className="leading-relaxed">{msg.message}</p>
                                  <div className="text-[8px] text-slate-400 mt-2 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendSuperAdminChat} className="mt-4 flex items-center gap-3 bg-white pt-4 border-t border-slate-100">
                        <input
                          value={superAdminChatInput}
                          onChange={(e) => setSuperAdminChatInput(e.target.value)}
                          placeholder="Write your message..."
                          className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                        <button type="submit" className="px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-wide hover:bg-slate-800">
                          Send
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400 px-6">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <ShieldAlert className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="font-bold text-slate-800">Select a super admin to chat with</p>
                      <p className="text-[11px] mt-2">Use this channel for admin approvals and urgent escalations.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "mock_bookings" && (
            <div className="space-y-6 text-left animate-fade-in font-sans">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Mock Bookings & Purchasing Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Track dispatched booking forms, client text submissions, and 3-installment matrices.</p>
              </div>

              <div className="border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm space-y-6">
                {mockBookings.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-xs font-bold">No mock bookings found.</p>
                    <p className="text-[10px] mt-1">Dispatched forms will show up here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                          <th className="py-3 px-4">Client</th>
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Submitted Data</th>
                          <th className="py-3 px-4">Installment Matrix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockBookings.map((b) => (
                          <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-4 px-4 font-bold text-slate-800">
                              <div>{b.buyer?.name}</div>
                              <div className="text-[10px] text-slate-450 font-normal">{b.buyer?.email}</div>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-700">{b.propertyName}</td>
                            <td className="py-4 px-4 font-bold font-mono">INR {b.propertyPrice.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                                b.status === "Booked" ? "bg-green-100 text-green-700" :
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
                              {b.paymentMatrix && b.paymentMatrix.length > 0 ? (
                                <div className="space-y-1">
                                  {b.paymentMatrix.map((inst) => (
                                    <div key={inst._id} className="flex justify-between gap-4 text-[9px] font-mono border-b pb-0.5">
                                      <span>Inst {inst.installmentNo}:</span>
                                      <span className="font-bold">INR {inst.amount.toLocaleString()}</span>
                                      <span className={`font-bold uppercase ${inst.status === "Paid" ? "text-green-600" : "text-amber-500"}`}>{inst.status}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[10px]">Awaiting Payment</span>
                              )}
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

          {activeTab === "profile" && (
            <div className="space-y-6 text-left animate-fade-in font-sans max-w-2xl">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">My Profile Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Update your account name, mobile contact number, and professional display photo.</p>
              </div>

              <div className="border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm">
                <form onSubmit={handleProfileUpdate} className="space-y-6 text-xs font-semibold text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="relative">
                      {profileImage ? (
                        <img 
                          src={profileImage.startsWith("http") ? profileImage : `${BACKEND_URL}${profileImage}`} 
                          alt="Profile Avatar" 
                          className="h-24 w-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-3xl uppercase border-4 border-slate-100 shadow-md">
                          {currentUser?.name?.charAt(0)}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full shadow-lg cursor-pointer hover:bg-slate-800 transition-colors">
                        <UploadCloud className="h-4 w-4" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProfileImageUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    <div className="text-left space-y-1">
                      <h4 className="text-sm font-black text-slate-800">{currentUser?.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{currentUser?.email} • {currentUser?.role?.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Click the upload icon on your avatar to modify your display picture.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)} 
                        placeholder="Your Name" 
                        className="p-3 bg-slate-50 border rounded-xl text-xs font-semibold"
                        required 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Mobile Number</label>
                      <input 
                        type="text" 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)} 
                        placeholder="Mobile Contact" 
                        className="p-3 bg-slate-50 border rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SECURE CHAT SESSION */}
      {chatOpen && chatRecipient && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white/95 backdrop-blur-md shadow-[-10px_0_30px_rgba(0,0,0,0.08)] border-l border-slate-100 flex flex-col animate-slide-in">
          <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center shrink-0 text-left border-b border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300">
                  <User className="h-5 w-5" />
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] tracking-wider text-indigo-300 uppercase font-black font-mono">
                  Secure Chat Session
                </span>
                <span className="text-sm font-bold truncate max-w-[180px]">
                  {chatRecipient.name || "Client"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenSendFormModal(chatRecipient)}
                className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none shadow-sm"
              >
                Send Mock Booking Form
              </button>
              <button
                onClick={() => {
                  setChatOpen(false);
                  setChatRecipient(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer border-0 bg-transparent outline-none transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 flex flex-col">
            {chatMessages.map((msg, idx) => {
              const isMe = (msg.sender?._id || msg.sender) === (user?.id || user?._id);
              return (
                <div
                  key={idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-2`}
                >
                  <div
                    className={`p-3.5 px-4 rounded-2xl max-w-[82%] text-xs font-medium hover:scale-[1.01] transition-transform duration-200 ${
                      isMe
                        ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-tr-none text-left shadow-[0_4px_12px_rgba(249,115,22,0.15)]"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    }`}
                  >
                    <p className="leading-relaxed break-words">{msg.message}</p>
                    <span
                      className={`text-[8px] block mt-1.5 text-right font-mono ${isMe ? "text-orange-100" : "text-slate-400"}`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSendChat}
            className="p-4 border-t border-slate-100 bg-white flex gap-2.5 items-center shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type secure message..."
              className="flex-1 px-4 py-2.5 bg-slate-100/70 border border-transparent rounded-full text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder-slate-400"
            />
            <button
              type="submit"
              className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full transition-all shadow-[0_4px_10px_rgba(249,115,22,0.2)] hover:shadow-[0_4px_15px_rgba(249,115,22,0.35)] hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-none outline-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* VERIFY CHECK-IN OTP MODAL */}
      {otpVerifyModalOpen && selectedVisitForOtpVerify && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-left border border-slate-100">
            <button
              onClick={() => {
                setOtpVerifyModalOpen(false);
                setSelectedVisitForOtpVerify(null);
                setOtpInput("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer border-0 bg-transparent outline-none"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-base font-black text-slate-800 border-b pb-2 border-slate-100 uppercase">
              🔑 Verify Site Check-In OTP
            </h3>
            <form onSubmit={handleCheckInOtpVerify} className="space-y-4 mt-4 text-xs font-semibold">
              <p className="text-[11px] text-slate-500 font-medium">
                Enter the secure 6-digit OTP code provided by client to verify physical presence and log check-in GPS coordinates.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                  OTP Code (6 Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 123456"
                  className="p-2.5 bg-slate-50 border rounded-xl font-mono text-lg tracking-widest text-center"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Validate OTP & Log Check-In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE VISIT & CHECKOUT FEEDBACK MODAL */}
      {checkoutModalOpen && selectedVisitForCheckout && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-left border border-slate-100">
            <button
              onClick={() => {
                setCheckoutModalOpen(false);
                setSelectedVisitForCheckout(null);
                setCheckoutForm({ visitSummary: "", buyerInterestLevel: "Interested", completionRemarks: "" });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer border-0 bg-transparent outline-none"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-base font-black text-slate-800 border-b pb-2 border-slate-100 uppercase">
              🏢 Complete Site Visit & Checkout
            </h3>
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 mt-4 text-xs font-semibold">
              <p className="text-[11px] text-slate-500 font-medium">
                Submit client feedback and capture agent GPS checkout to officially complete this site visit.
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                  Client Interest Level
                </label>
                <select
                  value={checkoutForm.buyerInterestLevel}
                  onChange={(e) => setCheckoutForm(prev => ({ ...prev, buyerInterestLevel: e.target.value }))}
                  className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer"
                  required
                >
                  <option value="Interested">Interested</option>
                  <option value="Need Follow-up">Need Follow-up</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                  Visit Summary & Discussion Notes
                </label>
                <textarea
                  value={checkoutForm.visitSummary}
                  onChange={(e) => setCheckoutForm(prev => ({ ...prev, visitSummary: e.target.value }))}
                  placeholder="Summarize the client walk-through..."
                  rows={3}
                  className="p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                  Completion Remarks
                </label>
                <textarea
                  value={checkoutForm.completionRemarks}
                  onChange={(e) => setCheckoutForm(prev => ({ ...prev, completionRemarks: e.target.value }))}
                  placeholder="Any final notes or next steps..."
                  rows={2}
                  className="p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Complete Tour & Log Checkout
              </button>
            </form>
          </div>
        </div>
      )}
      {sendFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-left border border-slate-100">
            <button
              onClick={() => setSendFormModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent outline-none"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Send Mock Booking Form</h3>
            <form onSubmit={handleSendMockBookingFormSubmit} className="space-y-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Property Name</label>
                <input
                  type="text"
                  value={sendFormPropName}
                  onChange={(e) => setSendFormPropName(e.target.value)}
                  className="p-3 bg-slate-50 border rounded-xl w-full focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Property Price (INR)</label>
                <input
                  type="number"
                  value={sendFormPropPrice}
                  onChange={(e) => setSendFormPropPrice(e.target.value)}
                  className="p-3 bg-slate-50 border rounded-xl w-full focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSendFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer border-none"
                >
                  Send Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
