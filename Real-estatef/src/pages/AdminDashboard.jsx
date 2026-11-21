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
  CreditCard,
  Briefcase,
  ShieldAlert,
  Award,
  ChevronRight,
  LayoutGrid,
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

export default function AdminDashboard({ user, handleLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);
  const [activeStaffRole, setActiveStaffRole] = useState(
    ["CRM Executive", "KYC Verifier", "Accounts Staff", "Documentation Staff", "Operations Manager"].includes(user?.staffDept)
      ? user.staffDept
      : "Super Admin"
  );
  const [activeTab, setActiveTab] = useState("stats"); // stats, analytics, roster, crm, kyc_queue, accounts, docs_locker, visits_manager, construction, property_list, lock_requests, agents_explorer, agent_chat, chat_monitor, support_queries
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || "");
  const [profileImage, setProfileImage] = useState(currentUser?.image || "");

  // States
  const [supportQueries, setSupportQueries] = useState([]);
  const [supportReplyText, setSupportReplyText] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [allPropertyLocks, setAllPropertyLocks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [rosterPage, setRosterPage] = useState(1);
  const [propertyIndexPage, setPropertyIndexPage] = useState(1);
  const [propertySearchQuery, setPropertySearchQuery] = useState("");
  const [agentsList, setAgentsList] = useState([]);
  const [buyersList, setBuyersList] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [allSiteVisits, setAllSiteVisits] = useState([]);
  const [chatMonitorsList, setChatMonitorsList] = useState([]);
  const [selectedAgentChat, setSelectedAgentChat] = useState(null);
  const [agentChatMessages, setAgentChatMessages] = useState([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [selectedVisitForOtp, setSelectedVisitForOtp] = useState(null);
  const [selectedAuditChat, setSelectedAuditChat] = useState(null);
  const [auditChatMessages, setAuditChatMessages] = useState([]);
  const [socketConn, setSocketConn] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({
    "Analytics & Reports": false,
    "Operations & Leads": false,
    "Inventory & Content": false,
    "Roster & Comms": false
  });
  const [mockBookings, setMockBookings] = useState([]);
  const chatEndRef = useRef(null);
  const gpsAuditSectionRef = useRef(null);

  useEffect(() => {
    if (selectedVisitForOtp) {
      setTimeout(() => {
        gpsAuditSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [selectedVisitForOtp]);

  const [adminPropModalOpen, setAdminPropModalOpen] = useState(false);
  const [adminPlotModalOpen, setAdminPlotModalOpen] = useState(false);

  useEffect(() => {
    if (adminPropModalOpen || adminPlotModalOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [adminPropModalOpen, adminPlotModalOpen]);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [adminPropForm, setAdminPropForm] = useState({
    name: "",
    type: "Apartment",
    status: "For Sale",
    price: "",
    area: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    description: "",
    image: "",
    style: "Building",
    uploadedBy: ""
  });
  const [adminPlotForm, setAdminPlotForm] = useState({
    name: "",
    projectId: "",
    totalSqft: "",
    address: "",
    lat: 28.4595,
    lng: 77.0266,
    plotNumber: "P-1",
    segmentSqft: "1200",
    basePrice: "1500000"
  });

  const handlePropImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploadingField("propImage");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/properties/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.url) {
        setAdminPropForm((prev) => ({ ...prev, image: res.data.url }));
        toast.success("Property photo uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload photo.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleAdminCreateProperty = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const payload = {
        ...adminPropForm,
        price: Number(adminPropForm.price),
        area: Number(adminPropForm.area),
        uploadedBy: adminPropForm.uploadedBy || user.id || user._id
      };

      if (editingPropertyId) {
        await axios.put(`${BACKEND_URL}/api/properties/${editingPropertyId}`, payload, config);
        toast.success("Property updated successfully!");
      } else {
        await axios.post(`${BACKEND_URL}/api/properties/add`, payload, config);
        toast.success("Property listed successfully!");
      }

      setAdminPropModalOpen(false);
      setEditingPropertyId(null);
      setAdminPropForm({
        name: "",
        type: "Apartment",
        status: "For Sale",
        price: "",
        area: "",
        streetAddress: "",
        city: "",
        state: "",
        country: "India",
        zipCode: "",
        description: "",
        image: "",
        style: "Building",
        uploadedBy: ""
      });
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit property listing.");
    }
  };

  const handleAdminStartEditProperty = (prop) => {
    setEditingPropertyId(prop._id);
    setAdminPropForm({
      name: prop.name || "",
      type: prop.type || "Apartment",
      status: prop.status || "For Sale",
      price: prop.price || "",
      area: prop.area || "",
      streetAddress: prop.streetAddress || "",
      city: prop.city || "",
      state: prop.state || "",
      country: prop.country || "India",
      zipCode: prop.zipCode || "",
      description: prop.description || "",
      image: prop.image || "",
      style: prop.style || "Building",
      uploadedBy: prop.uploadedBy?._id || prop.uploadedBy || ""
    });
    setAdminPropModalOpen(true);
  };

  const handleAdminDeleteProperty = async (propId) => {
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`${BACKEND_URL}/api/properties/${propId}`, config);
      toast.success("Property deleted successfully!");
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete property.");
    }
  };

  const handleAdminMarkAsBooked = async (propId) => {
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.put(`${BACKEND_URL}/api/properties/${propId}`, { status: "Booked" }, config);
      toast.success("Property marked as Booked!");
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update property status.");
    }
  };

  const handleAdminCreatePlot = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const payload = {
        name: adminPlotForm.name,
        projectId: adminPlotForm.projectId || undefined,
        totalSqft: Number(adminPlotForm.totalSqft),
        address: adminPlotForm.address,
        lat: Number(adminPlotForm.lat),
        lng: Number(adminPlotForm.lng),
        segments: [
          {
            plotNumber: adminPlotForm.plotNumber,
            totalSqft: Number(adminPlotForm.segmentSqft),
            basePrice: Number(adminPlotForm.basePrice),
            status: "vacant"
          }
        ]
      };
      await axios.post(`${BACKEND_URL}/api/plots/add`, payload, config);
      toast.success("Plot Layout listing created successfully!");
      setAdminPlotModalOpen(false);
      setAdminPlotForm({
        name: "",
        projectId: "",
        totalSqft: "",
        address: "",
        lat: 28.4595,
        lng: 77.0266,
        plotNumber: "P-1",
        segmentSqft: "1200",
        basePrice: "1500000"
      });
      fetchAdminPlotsList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create plot layout.");
    }
  };
  const filteredPropertiesIndex = allProperties.filter((p) => {
    if (!propertySearchQuery) return true;
    const query = propertySearchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.city?.toLowerCase().includes(query) ||
      p.type?.toLowerCase().includes(query) ||
      p.status?.toLowerCase().includes(query) ||
      p._id?.toLowerCase().includes(query)
    );
  });

  const paginatedPropertiesIndex = filteredPropertiesIndex.slice(
    (propertyIndexPage - 1) * 10,
    propertyIndexPage * 10
  );

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

  // Lock request state modifiers
  const [lockAssignAgentId, setLockAssignAgentId] = useState("");
  const [lockRejectReason, setLockRejectReason] = useState("");

  // Plot Approval states
  const [adminPlots, setAdminPlots] = useState([]);

  const fetchAdminPlotsList = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(`${BACKEND_URL}/api/plots/admin/all`, config);
      setAdminPlots(res.data.plots || []);
    } catch (err) {
      console.error("Failed to load admin plots list:", err);
    }
  };

  const handleApprovePlotLayout = async (plotId) => {
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.put(`${BACKEND_URL}/api/plots/${plotId}/approve`, {}, config);
      toast.success(res.data.message);
      fetchAdminPlotsList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve plot layout.");
    }
  };


  // KYC Verification modal states
  const [selectedKycForVerify, setSelectedKycForVerify] = useState(null);
  const [kycVerifyNote, setKycVerifyNote] = useState("");

  // Projects creation states
  const [projectForm, setProjectForm] = useState({
    name: "",
    type: "Residential",
    location: "",
    reraNumber: "",
    description: "",
    image: "",
    coordinates: { lat: 28.4595, lng: 77.0266 },
    assignedAgent: ""
  });
  const [uploadingField, setUploadingField] = useState(null);

  const [provisionForm, setProvisionForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "agent",
    staffDept: "",
    reraId: "",
    experience: "",
    specialization: "",
    serviceAreas: "",
    image: ""
  });

  const handleAgentPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingField("agentPhoto");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${BACKEND_URL}/api/properties/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });
      setProvisionForm((prev) => ({ ...prev, image: res.data.url }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload agent photo.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${BACKEND_URL}/api/admin/users/create`, provisionForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      setProvisionForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "agent",
        staffDept: "",
        reraId: "",
        experience: "",
        specialization: "",
        serviceAreas: "",
        image: ""
      });
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to provision user.");
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  useEffect(() => {
    // Initial activeTab based on staff Dept
    const role = ["CRM Executive", "KYC Verifier", "Accounts Staff", "Documentation Staff", "Operations Manager"].includes(user?.staffDept)
      ? user.staffDept
      : "Super Admin";
    setActiveStaffRole(role);
    if (role === "Super Admin") {
      setActiveTab("stats");
    } else if (role === "KYC Verifier") {
      setActiveTab("kyc_queue");
    } else if (role === "CRM Executive") {
      setActiveTab("crm");
    } else if (role === "Accounts Staff") {
      setActiveTab("accounts");
    } else if (role === "Documentation Staff") {
      setActiveTab("docs_locker");
    } else if (role === "Operations Manager") {
      setActiveTab("construction");
    }
    fetchAdminData();

    // Live update polling for real-time dashboard data synchronization
    const pollInterval = setInterval(() => {
      fetchAdminData();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [activeStaffRole]);

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get(`${BACKEND_URL}/api/admin/stats`);
      setAdminStats(statsRes.data.stats);

      const buyersRes = await axios.get(`${BACKEND_URL}/api/admin/buyers`);
      setBuyersList(buyersRes.data.buyers || []);

      const agentsRes = await axios.get(`${BACKEND_URL}/api/admin/agents`);
      setAgentsList(agentsRes.data.agents || []);

      const bookingsRes = await axios.get(`${BACKEND_URL}/api/admin/bookings`);
      setAllBookings(bookingsRes.data.bookings || []);

      const visitsRes = await axios.get(`${BACKEND_URL}/api/admin/visits`);
      setAllSiteVisits(visitsRes.data.visits || []);

      const chatsRes = await axios.get(`${BACKEND_URL}/api/admin/chats`);
      setChatMonitorsList(chatsRes.data.chats || []);

      const logsRes = await axios.get(`${BACKEND_URL}/api/admin/audit-logs`);
      setAuditLogs(logsRes.data.logs || []);

      const propLocksRes = await axios.get(`${BACKEND_URL}/api/properties/admin/locks`);
      setAllPropertyLocks(propLocksRes.data.locks || []);

      const usersRes = await axios.get(`${BACKEND_URL}/api/admin/users`);
      setUsersList(usersRes.data.users || []);

      const projectsRes = await axios.get(`${BACKEND_URL}/api/properties/projects`);
      setProjects(projectsRes.data.projects || []);

      const propertiesRes = await axios.get(`${BACKEND_URL}/api/properties/all`);
      setAllProperties(propertiesRes.data.properties || []);

      try {
        const supportRes = await axios.get(`${BACKEND_URL}/api/admin/support/all`);
        setSupportQueries(supportRes.data.queries || []);
      } catch (err) {
        console.warn("Could not retrieve support queries:", err.message);
      }

      fetchAdminPlotsList();
      fetchMockBookings();
    } catch (e) {
      console.warn("Could not retrieve admin dashboard stats:", e.message);
    }
  };

  const fetchMockBookings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/bookings/mock/list`);
      setMockBookings(res.data.bookings || []);
    } catch (err) {
      console.warn("Failed to load mock bookings:", err.message);
    }
  };

  const handleApproveMockDocument = async (bookingId) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/bookings/mock/approve/${bookingId}`);
      toast.success(res.data.message || "Booking document approved successfully!");
      fetchMockBookings();
      socketConn?.emit("mock_booking_updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve document.");
    }
  };

  const handleRejectMockDocument = async (bookingId) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/bookings/mock/reject/${bookingId}`);
      toast.success(res.data.message || "Booking request rejected successfully!");
      fetchMockBookings();
      socketConn?.emit("mock_booking_updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject document.");
    }
  };

  const handleResolveSupportQuery = async (queryId) => {
    try {
      const reply = supportReplyText[queryId] || "";
      const res = await axios.put(`${BACKEND_URL}/api/admin/support/resolve/${queryId}`, { reply });
      toast.success(res.data.message || "Query resolved successfully.");

      const supportRes = await axios.get(`${BACKEND_URL}/api/admin/support/all`);
      setSupportQueries(supportRes.data.queries || []);
      setSupportReplyText(prev => ({ ...prev, [queryId]: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve query.");
    }
  };

  // Socket connection for Admin chat monitoring
  useEffect(() => {
    if (user) {
      const socket = io(BACKEND_URL);
      setSocketConn(socket);

      // Join standard admin room
      socket.emit("join_room", { userId: user.id || user._id });

      socket.on("receive_message", (msg) => {
        if (selectedAgentChat) {
          const contactId = selectedAgentChat._id || selectedAgentChat;
          const senderId = msg.sender?._id || msg.sender;
          const receiverId = msg.receiver?._id || msg.receiver || msg.recipient?._id || msg.recipient;
          const isRelevant = senderId === contactId || receiverId === contactId;
          if (isRelevant) {
            setAgentChatMessages((prev) => {
              if (prev.some((m) => m._id === msg._id)) return prev;
              return [...prev, msg];
            });
          }
        }
      });

      socket.on("adminMonitorChat", (msg) => {
        // Update general monitor listing
        fetchAdminData();

        // If the admin currently has this decrypted conversation open, append it
        if (selectedAuditChat) {
          const buyerId = selectedAuditChat.buyer?._id || selectedAuditChat.buyer;
          const agentId = selectedAuditChat.agent?._id || selectedAuditChat.agent;
          const senderId = msg.sender?._id || msg.sender;
          const receiverId = msg.receiver?._id || msg.receiver || msg.recipient?._id || msg.recipient;

          const match = (senderId === buyerId && receiverId === agentId) ||
            (senderId === agentId && receiverId === buyerId);
          if (match) {
            setAuditChatMessages((prev) => {
              if (prev.some((m) => m._id === msg._id)) return prev;
              return [...prev, msg];
            });
          }
        }
      });

      socket.on("receive_mock_booking_update", () => {
        fetchMockBookings();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, selectedAuditChat, selectedAgentChat]);

  const handleOpenAgentChat = async (agent) => {
    if (!agent) return;
    setSelectedAgentChat(agent);
    try {
      const contactId = agent._id || agent;
      const res = await axios.get(`${BACKEND_URL}/api/chats/history/${contactId}`);
      setAgentChatMessages(res.data.messages || []);
      setActiveTab("agent_chat");
    } catch (err) {
      console.warn("Could not load agent chat history:", err.message);
      toast.error("Failed to load agent conversation.");
    }
  };

  const handleSendAgentChat = async (e) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedAgentChat) return;

    const recipientId = selectedAgentChat._id || selectedAgentChat;
    const msgData = {
      sender: user.id || user._id,
      recipient: recipientId,
      message: adminChatInput.trim(),
    };

    try {
      setAdminChatInput("");
      await axios.post(`${BACKEND_URL}/api/chats/send`, msgData);
    } catch (err) {
      toast.error("Failed to send message to agent.");
    }
  };

  const handleDecryptChatLogs = async (chatSession) => {
    if (!chatSession) return;
    const buyerId = chatSession.buyer?._id || chatSession.buyer;
    const agentId = chatSession.agent?._id || chatSession.agent;

    setSelectedAuditChat(chatSession);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/chats/history/${buyerId}/${agentId}`);
      setAuditChatMessages(res.data.messages || []);
      toast.success("Telemetry logs decrypted successfully.");
    } catch (err) {
      toast.error("Failed to decrypt secure telemetry logs.");
    }
  };

  const handleAdminApproveLock = async (lockId) => {
    if (!lockAssignAgentId) {
      toast.error("Please select an agent to assign.");
      return;
    }
    try {
      const res = await axios.put(`${BACKEND_URL}/api/properties/admin/lock/${lockId}/approve`, {
        agentId: lockAssignAgentId,
      });
      toast.success(res.data.message);
      setLockAssignAgentId("");
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve lock.");
    }
  };

  const handleAdminRejectLock = async (lockId) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/properties/admin/lock/${lockId}/reject`, {
        rejectionReason: lockRejectReason || "Rejected by admin.",
      });
      toast.success(res.data.message);
      setLockRejectReason("");
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject lock.");
    }
  };

  const handleAssignAgent = async (visitId, agentId) => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/site-visits/${visitId}/assign`,
        { agentId: agentId || null },
      );
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign representative.");
    }
  };

  const handleVerifyKyc = async (kycId, status) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/admin/kyc-verify/${kycId}`, {
        decision: status,
        rejectionReason: kycVerifyNote || "Documents did not match standard requirements.",
      });
      toast.success(res.data.message);
      setSelectedKycForVerify(null);
      setKycVerifyNote("");
      fetchAdminData();
      socketConn?.emit("kyc_updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed KYC verification action.");
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...projectForm,
        assignedAgent: projectForm.assignedAgent || undefined
      };
      const res = await axios.post(`${BACKEND_URL}/api/properties/projects`, payload);
      toast.success(res.data.message || "Project created successfully.");
      setProjectForm({
        name: "",
        type: "Residential",
        location: "",
        reraNumber: "",
        description: "",
        image: "",
        coordinates: { lat: 28.4595, lng: 77.0266 },
        assignedAgent: ""
      });
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project.");
    }
  };

  const handleSeedData = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/properties/seed`);
      toast.success(res.data.message || "Database successfully seeded.");
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to run seed script.");
    }
  };

  const getSidebarTabs = () => {
    let tabs = [];
    if (activeStaffRole === "Super Admin" || !["CRM Executive", "KYC Verifier", "Accounts Staff", "Documentation Staff", "Operations Manager"].includes(activeStaffRole)) {
      tabs = [
        { id: "stats", label: "Executive Dashboard", icon: TrendingUp },
        { id: "analytics", label: "Analytics Dashboard", icon: TrendingUp },
        { id: "roster", label: "User Roster", icon: User },
        { id: "crm", label: "CRM Lead Board", icon: Building },
        { id: "kyc_queue", label: "KYC Verification", icon: ShieldAlert },
        { id: "accounts", label: "Accounts Ledger", icon: CreditCard },
        { id: "docs_locker", label: "Documents Locker", icon: FileText },
        { id: "visits_manager", label: "Site Visits Manager", icon: Calendar },
        { id: "construction", label: "Construction Manager", icon: Building },
        { id: "property_list", label: "Property Listings", icon: Building },
        { id: "lock_requests", label: "Lock Requests", icon: Lock },
        { id: "plot_approvals", label: "Plot Approvals", icon: LayoutGrid },
        { id: "agents_explorer", label: "Agents Directory", icon: Award },
        { id: "chat_monitor", label: "Live Chat Monitor", icon: ShieldAlert },
        { id: "news_manager", label: "Manage News", icon: FileText },
        { id: "agent_chat", label: "Agent Communications", icon: MessageSquare },
        { id: "support_queries", label: "Support Tickets", icon: MessageSquare },
        { id: "mock_bookings", label: "Mock Bookings", icon: FileText }
      ];
    } else if (activeStaffRole === "CRM Executive") {
      tabs = [{ id: "crm", label: "CRM Lead Board", icon: Building }];
    } else if (activeStaffRole === "KYC Verifier") {
      tabs = [{ id: "kyc_queue", label: "KYC Verification", icon: ShieldAlert }];
    } else if (activeStaffRole === "Accounts Staff") {
      tabs = [{ id: "accounts", label: "Accounts Ledger", icon: CreditCard }];
    } else if (activeStaffRole === "Documentation Staff") {
      tabs = [{ id: "docs_locker", label: "Documents Locker", icon: FileText }];
    } else if (activeStaffRole === "Operations Manager") {
      tabs = [
        { id: "visits_manager", label: "Site Visits Manager", icon: Calendar },
        { id: "construction", label: "Construction Manager", icon: Building },
      ];
    }
    tabs.push({ id: "profile", label: "Edit Profile", icon: User });
    return tabs;
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
              {`Super Admin Console (${activeStaffRole})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === "staff" && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
                CONSOLE SIMULATOR:
              </span>
              <select
                value={activeStaffRole}
                onChange={(e) => setActiveStaffRole(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-orange-600 focus:ring-0 cursor-pointer p-0 select-none outline-none font-sans"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="CRM Executive">CRM Executive</option>
                <option value="KYC Verifier">KYC Verifier</option>
                <option value="Accounts Staff">Accounts Staff</option>
                <option value="Documentation Staff">Documentation Staff</option>
                <option value="Operations Manager">Operations Manager</option>
              </select>
            </div>
          )}



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
              <div className="mt-6 flex flex-col gap-4 text-left font-sans">
                {(() => {
                  const availableTabs = getSidebarTabs();
                  const SIDEBAR_GROUPS = [
                    {
                      title: "Analytics & Reports",
                      tabs: ["stats", "analytics"]
                    },
                    {
                      title: "Operations & Leads",
                      tabs: ["crm", "kyc_queue", "lock_requests", "plot_approvals", "visits_manager", "construction"]
                    },
                    {
                      title: "Inventory & Content",
                      tabs: ["property_list", "news_manager"]
                    },
                    {
                      title: "Roster & Comms",
                      tabs: ["roster", "agents_explorer", "chat_monitor", "agent_chat", "support_queries", "mock_bookings"]
                    }
                  ];

                  const groupedSidebar = SIDEBAR_GROUPS.map(group => {
                    const groupTabs = availableTabs.filter(tab => group.tabs.includes(tab.id));
                    return {
                      title: group.title,
                      tabs: groupTabs
                    };
                  }).filter(group => group.tabs.length > 0);

                  return groupedSidebar.map(group => {
                    const isCollapsed = collapsedGroups[group.title];
                    return (
                      <div key={group.title} className="flex flex-col gap-1.5">
                        {/* Group Header Button */}
                        <button
                          onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.title]: !prev[group.title] }))}
                          className="flex items-center justify-between px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors cursor-pointer border-none bg-transparent outline-none w-full text-left"
                        >
                          <span>{group.title}</span>
                          <span className={`transform transition-transform duration-200 text-[8px] ${isCollapsed ? "-rotate-90 text-slate-350" : "text-slate-400"}`}>▼</span>
                        </button>

                        {/* Collapsible Tabs Container */}
                        <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[500px] opacity-100"}`}>
                          {group.tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                              <SidebarLink
                                key={tab.id}
                                link={{
                                  label: tab.label,
                                  href: "#",
                                  icon: (
                                    <Icon
                                      className={`h-4.5 w-4.5 shrink-0 ${activeTab === tab.id ? "text-black font-black" : "text-slate-700"}`}
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
                    );
                  });
                })()}
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
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl" />
            <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />

            <div className="relative z-10 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm">
                  {activeStaffRole} Portal
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-500 font-extrabold uppercase">
                  Staff Console
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                Ecosystem Operational Management
              </h2>
              <p className="text-xs text-slate-450 mt-1 max-w-lg leading-relaxed font-semibold">
                Monitor system metrics, review buyer locks, assign active broker relationships, and audit secure chat protocols.
              </p>
            </div>
          </div>

          {/* TAB: EXECUTIVE OPERATIONAL DASHBOARD (REF IMAGE 1 & 2 Style) */}
          {activeTab === "stats" && (activeStaffRole === "Super Admin" || activeStaffRole === "CRM Executive" || activeStaffRole === "Operations Manager" || activeStaffRole === "Accounts Staff" || activeStaffRole === "KYC Verifier" || activeStaffRole === "Documentation Staff") && (
            <div className="space-y-8 animate-fade-in">
              {/* WELCOME HOME HERO (Image 1 Style) */}
              <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-cyan-950 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center shadow-lg border border-emerald-700/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
                <div className="relative z-10 space-y-2 text-left max-w-xl">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">👋 Hello, {user?.name || "Robert Brown"}</h3>
                  <p className="text-xs text-teal-100 leading-relaxed font-sans font-semibold">
                    Track all property performance, availability, pricing trends, and occupancy easily. Build operations, verify site walkthrough metrics, and optimize buyer conversions.
                  </p>
                  <div className="flex gap-6 mt-4 pt-2 border-t border-teal-600/30 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] text-teal-200 block uppercase font-bold tracking-wider">Total Properties</span>
                      <span className="text-base font-black font-sans">{allProperties.length || "1,245"} <span className="text-[10px] text-emerald-300 font-bold ml-1">+8%</span></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block uppercase font-bold tracking-wider">Sold Properties</span>
                      <span className="text-base font-black font-sans">{allBookings.filter(b => b.status === 'confirmed').length || "1,324"} <span className="text-[10px] text-emerald-300 font-bold ml-1">+2.3%</span></span>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-56 shrink-0 relative mt-4 lg:mt-0">
                  <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500" alt="Executive Home" className="rounded-2xl h-36 w-full object-cover shadow-md border-2 border-white/20" />
                </div>
              </div>

              {/* ANIMATED METRICS CARDS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Card 1: Total Sales */}
                <div className="border border-slate-250 bg-white rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                        <CreditCard className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                          Total Sales
                        </span>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                          <span className="text-xs font-black text-slate-400 mr-0.5">₹</span>{((adminStats?.totalTokenCollected || 3457830) / 100000).toFixed(2)}L
                        </h4>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("accounts")} className="text-[8px] font-extrabold text-slate-500 border border-slate-200/80 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 uppercase tracking-wide cursor-pointer transition-colors shrink-0">
                      Report
                    </button>
                  </div>

                  <p className="text-[9px] mt-2 font-bold text-emerald-600 flex items-center gap-1">
                    <span>↑ 12.5%</span><span className="text-slate-400 font-semibold">vs last month</span>
                  </p>

                  {/* Animated area SVG chart */}
                  <div className="h-10 w-full mt-2 relative overflow-hidden">
                    <svg viewBox="0 0 200 50" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="sg1-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="sg1-fill2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Yesterday line */}
                      <path d="M0,40 L25,32 L50,38 L75,22 L100,30 L125,18 L150,25 L175,12 L200,20" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                      <path d="M0,40 L25,32 L50,38 L75,22 L100,30 L125,18 L150,25 L175,12 L200,20 L200,50 L0,50 Z" fill="url(#sg1-fill)" />
                      {/* Today line */}
                      <path d="M0,42 L25,36 L50,28 L75,32 L100,15 L125,22 L150,10 L175,6 L200,8" fill="none" stroke="#f97316" strokeWidth="2" className="animated-svg-path" />
                      <path d="M0,42 L25,36 L50,28 L75,32 L100,15 L125,22 L150,10 L175,6 L200,8 L200,50 L0,50 Z" fill="url(#sg1-fill2)" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[7px] text-slate-350 font-bold px-1 mt-1">
                    <span>12 AM</span><span>8 AM</span><span>4 PM</span><span>12 AM</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[7px] font-bold text-slate-400 mt-1 px-1">
                    <span className="flex items-center gap-0.5"><span className="h-0.5 w-3 bg-slate-300 rounded block"></span> Yesterday</span>
                    <span className="flex items-center gap-0.5"><span className="h-0.5 w-3 rounded block" style={{ background: "#f97316" }}></span> Today</span>
                  </div>
                </div>

                {/* Card 2: Repeat Rate / Buyer Conversion */}
                <div className="border border-slate-250 bg-white rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <Award className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                          Buyer Conversion
                        </span>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                          {allPropertyLocks.filter(l => l.status === "agent_accepted").length || 6}.<span className="text-sm font-black text-slate-500">75</span>%
                        </h4>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("lock_requests")} className="text-[8px] font-extrabold text-slate-500 border border-slate-200/80 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 uppercase tracking-wide cursor-pointer transition-colors shrink-0">
                      Report
                    </button>
                  </div>

                  <p className="text-[9px] mt-2 font-bold text-emerald-600 flex items-center gap-1">
                    <span>↑ 3.5%</span><span className="text-slate-400 font-semibold">vs last month</span>
                  </p>

                  {/* Animated area SVG chart - filled orange style from image */}
                  <div className="h-10 w-full mt-2 relative overflow-hidden">
                    <svg viewBox="0 0 200 50" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="sg2-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                        </linearGradient>
                        <linearGradient id="sg2-fill2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* First time area */}
                      <path d="M0,45 L25,38 L50,42 L75,30 L100,35 L125,25 L150,30 L175,20 L200,28 L200,50 L0,50 Z" fill="url(#sg2-fill)" />
                      <path d="M0,45 L25,38 L50,42 L75,30 L100,35 L125,25 L150,30 L175,20 L200,28" fill="none" stroke="#f97316" strokeWidth="2" className="animated-svg-path" />
                      {/* Repeat area */}
                      <path d="M0,48 L25,43 L50,46 L75,40 L100,44 L125,36 L150,40 L175,32 L200,38 L200,50 L0,50 Z" fill="url(#sg2-fill2)" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[7px] text-slate-350 font-bold px-1 mt-1">
                    <span>12 AM</span><span>8 AM</span><span>4 PM</span><span>12 AM</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[7px] font-bold text-slate-400 mt-1 px-1">
                    <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#f97316" }}></span> First</span>
                    <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#fbbf24" }}></span> Repeat</span>
                  </div>
                </div>

                {/* Card 3: Active Agents */}
                <div className="border border-slate-250 bg-white rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                          Active Agents
                        </span>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                          {agentsList.length || 24}
                          <span className="text-xs font-black text-red-500 ml-1.5">-5%</span>
                        </h4>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("roster")} className="text-[8px] font-extrabold text-slate-500 border border-slate-200/80 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 uppercase tracking-wide cursor-pointer transition-colors shrink-0">
                      Roster
                    </button>
                  </div>

                  <p className="text-[9px] mt-2 font-semibold text-slate-400">Registered & Available</p>

                  {/* Animated column bars */}
                  <div className="flex items-end justify-between gap-0.5 h-10 w-full mt-2 px-1">
                    {[28, 42, 35, 55, 48, 62, 52, 70, 60, 75, 65, 80].map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${(val / 80) * 100}%`,
                          background: idx === 11 ? "#f97316" : "#e2e8f0",
                          animation: `barGrow 0.6s ease-out ${idx * 0.05}s both`
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[7px] text-slate-350 font-bold px-1 mt-1">
                    <span>Jan</span><span>Apr</span><span>Jul</span><span>Dec</span>
                  </div>
                </div>

                {/* Card 4: Site Visits */}
                <div className="border border-slate-250 bg-white rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                        <Calendar className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                          Site Visits
                        </span>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                          {allSiteVisits.length || 157}
                          <span className="text-xs font-black text-emerald-500 ml-1.5">+8%</span>
                        </h4>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("visits_manager")} className="text-[8px] font-extrabold text-slate-500 border border-slate-200/80 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 uppercase tracking-wide cursor-pointer transition-colors shrink-0">
                      Visits
                    </button>
                  </div>

                  {/* Donut circle indicator */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative h-10 w-10 shrink-0">
                      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f97316" strokeWidth="3.5"
                          strokeDasharray="72 28"
                          strokeLinecap="round">
                          <animate attributeName="stroke-dasharray" from="0 100" to="72 28" dur="1.2s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" />
                        </circle>
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="3.5"
                          strokeDasharray="18 82"
                          strokeDashoffset="-72"
                          strokeLinecap="round">
                          <animate attributeName="stroke-dasharray" from="0 100" to="18 82" dur="1.4s" fill="freeze" />
                        </circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[7px] font-black text-slate-700">72%</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-[7px] font-bold leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-orange-500 shrink-0" />
                        <span className="text-slate-600">Done ({allSiteVisits.filter(v => v.status === "completed").length || 113})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-slate-600">Active ({allSiteVisits.filter(v => v.status === "in_progress").length || 28})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Property Sales Performance - Area Chart */}
                <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm text-left">
                  <div className="flex justify-between items-start pb-4 border-b">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Property Sales Performance</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Monthly closed booking value analytics</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-800 tracking-tight">{formatINR(adminStats?.totalTokenCollected || 34578300)}</span>
                      <span className="text-[10px] text-emerald-500 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-lg">+12.34%</span>
                    </div>
                  </div>

                  <div className="mt-4 text-[9px] font-bold text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Residential</span><span className="text-emerald-600">₹40.32L ↑ 2.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commercial</span><span className="text-emerald-600">₹32.13L ↑ 7.2%</span>
                    </div>
                  </div>

                  <div className="h-44 mt-4 w-full relative">
                    <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart1-today" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="chart1-yest" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Y-axis grid */}
                      {[40, 80, 120].map(y => (
                        <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      ))}
                      {/* Yesterday filled */}
                      <path d="M0,130 C60,115 100,130 150,110 C200,95 250,118 300,100 C350,85 400,95 500,80 L500,160 L0,160 Z" fill="url(#chart1-yest)" />
                      <path d="M0,130 C60,115 100,130 150,110 C200,95 250,118 300,100 C350,85 400,95 500,80" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
                      {/* Today filled */}
                      <path d="M0,140 C60,120 100,100 150,90 C200,75 250,85 300,65 C350,50 420,40 500,30 L500,160 L0,160 Z" fill="url(#chart1-today)">
                        <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze" />
                      </path>
                      <path d="M0,140 C60,120 100,100 150,90 C200,75 250,85 300,65 C350,50 420,40 500,30" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round">
                        <animate attributeName="stroke-dasharray" from="0 2000" to="2000 0" dur="1.8s" ease="ease-out" fill="freeze" />
                      </path>
                      {/* Highlight dots */}
                      <circle cx="300" cy="65" r="4.5" fill="#f97316" stroke="white" strokeWidth="2">
                        <animate attributeName="opacity" from="0" to="1" begin="1.5s" dur="0.3s" fill="freeze" />
                      </circle>
                      <circle cx="500" cy="30" r="4.5" fill="#f97316" stroke="white" strokeWidth="2">
                        <animate attributeName="opacity" from="0" to="1" begin="1.7s" dur="0.3s" fill="freeze" />
                      </circle>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-350 font-bold mt-1 px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[9px] font-bold text-slate-400 border-t pt-3">
                    <span className="flex items-center gap-1.5"><span className="block h-px w-5 border-t-2 border-dashed border-slate-350"></span> Yesterday</span>
                    <span className="flex items-center gap-1.5"><span className="block h-0.5 w-5 bg-orange-500 rounded"></span> Today</span>
                  </div>
                </div>

                {/* Revenue Overview - Animated Column Chart */}
                <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm text-left">
                  <div className="flex justify-between items-start pb-4 border-b">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Revenue Overview</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Monthly cash inflow &amp; expenses</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-800 tracking-tight">{formatINR(adminStats?.totalTokenCollected || 0)}</span>
                      <span className="text-[10px] text-emerald-500 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-lg">Live</span>
                    </div>
                  </div>

                  <div className="mt-4 text-[9px] font-bold text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Total Bookings Capital</span><span className="text-emerald-600">{formatINR(adminStats?.totalTokenCollected || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marketplace Listings</span><span className="text-blue-500">{allProperties.length} Published</span>
                    </div>
                  </div>

                  <div className="h-44 mt-4 w-full flex items-end justify-between gap-1 px-1 border-b border-slate-100 relative">
                    {[
                      { r: 35, e: 12 }, { r: 18, e: 22 }, { r: 28, e: 15 }, { r: 42, e: 30 }, { r: 15, e: 12 },
                      { r: 48, e: 22 }, { r: 25, e: 30 }, { r: 30, e: 32 }, { r: 36, e: 12 }, { r: 42, e: 18 }, { r: 45, e: 20 },
                      { r: Math.min(60, 10 + (adminStats?.totalTokenCollected ? Math.round(adminStats.totalTokenCollected / 200000) : 0)), e: 25 }
                    ].map((m, idx) => (
                      <div key={idx} className="flex gap-0.5 items-end flex-1" style={{ height: "100%" }}>
                        <div
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${(m.r / 60) * 100}%`,
                            background: idx === 11 ? "#f97316" : "#e2e8f0",
                            animation: `barGrow 0.5s ease-out ${idx * 0.06}s both`
                          }}
                          title="Revenue"
                        />
                        <div
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${(m.e / 60) * 100}%`,
                            background: idx === 11 ? "#fbbf24" : "#cbd5e1",
                            animation: `barGrow 0.5s ease-out ${idx * 0.06 + 0.1}s both`
                          }}
                          title="Expenses"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-350 font-bold mt-1 px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                  <div className="flex items-center gap-5 mt-3 text-[9px] font-bold text-slate-400 border-t pt-3">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-slate-200"></span> Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-slate-300"></span> Expenses</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-orange-500"></span> This Month</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Sales Distribution + Live Feedback */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sales Distribution — Left */}
                <div className="lg:col-span-7 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm text-left flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Regional Sales Distribution</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Highest conversion markets by city &amp; segment</p>
                    </div>
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide">Q3 2026</span>
                  </div>

                  {/* Map visual */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/80 rounded-2xl p-4 h-40 relative overflow-hidden">
                    <svg viewBox="0 0 320 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      {/* India stylized landmass */}
                      <path d="M60,15 Q80,5 110,10 T160,8 T200,15 T230,12 T255,25 L260,35 Q255,50 250,65 T240,85 T220,100 T190,110 T160,112 T130,108 T105,95 T85,78 T70,60 T60,40 Z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
                      {/* State outline hints */}
                      <path d="M120,40 Q140,35 155,45 T175,55 T165,70 T145,65 T125,55 Z" fill="#e2e8f0" opacity="0.5" />
                      <path d="M165,30 Q185,25 205,38 T215,55 T195,60 T175,50 Z" fill="#e2e8f0" opacity="0.5" />

                      {/* Bengaluru */}
                      <circle cx="155" cy="88" r="10" fill="#f97316" opacity="0.18">
                        <animate attributeName="r" values="8;13;8" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="155" cy="88" r="5" fill="#f97316" />
                      <text x="162" y="86" fontSize="6" fontWeight="800" fill="#1e293b">Bengaluru</text>
                      <text x="162" y="93" fontSize="5" fill="#f97316">
                        {allProperties.filter(p => p.city?.toLowerCase() === 'bengaluru').length > 0 ? "100%" : "0%"}
                      </text>

                      {/* Kolkata */}
                      <circle cx="210" cy="52" r="8" fill="#f59e0b" opacity="0.2">
                        <animate attributeName="r" values="6;11;6" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="210" cy="52" r="4" fill="#f59e0b" />
                      <text x="216" y="50" fontSize="6" fontWeight="800" fill="#1e293b">Kolkata</text>
                      <text x="216" y="57" fontSize="5" fill="#f59e0b">
                        {allProperties.filter(p => p.city?.toLowerCase() === 'kolkata').length > 0 ? "100%" : "0%"}
                      </text>

                      {/* Mumbai */}
                      <circle cx="105" cy="72" r="7" fill="#10b981" opacity="0.2">
                        <animate attributeName="r" values="5;10;5" dur="2.8s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="105" cy="72" r="3.5" fill="#10b981" />
                      <text x="112" y="70" fontSize="6" fontWeight="800" fill="#1e293b">Mumbai</text>
                      <text x="112" y="77" fontSize="5" fill="#10b981">
                        {allProperties.filter(p => p.city?.toLowerCase() === 'mumbai').length > 0 ? "100%" : "0%"}
                      </text>

                      {/* Delhi/Gurgaon */}
                      <circle cx="138" cy="28" r="6" fill="#3b82f6" opacity="0.2">
                        <animate attributeName="r" values="4;9;4" dur="3.2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="138" cy="28" r="3" fill="#3b82f6" />
                      <text x="145" y="26" fontSize="6" fontWeight="800" fill="#1e293b">Delhi-NCR</text>
                      <text x="145" y="33" fontSize="5" fill="#3b82f6">
                        {allProperties.filter(p => p.city?.toLowerCase() === 'delhi_ncr' || p.city?.toLowerCase() === 'delhi').length > 0 ? "100%" : "0%"}
                      </text>
                    </svg>
                    <span className="absolute bottom-2 left-3 px-2 py-0.5 bg-slate-900/85 backdrop-blur-xs text-white rounded text-[8px] font-black uppercase tracking-wider">
                      Live Telemetry Map
                    </span>
                  </div>

                  {/* Animated Progress Bars */}
                  <div className="space-y-3.5">
                    {[
                      { city: "Bengaluru", type: "Plots", pct: allProperties.filter(p => p.city?.toLowerCase() === 'bengaluru').length > 0 ? 100 : 0, color: "#f97316", bg: "bg-orange-500", delay: "0s" },
                      { city: "Kolkata, WB", type: "Residential", pct: allProperties.filter(p => p.city?.toLowerCase() === 'kolkata').length > 0 ? 100 : 0, color: "#f59e0b", bg: "bg-amber-500", delay: "0.1s" },
                      { city: "Mumbai, MH", type: "Premium High-Rise", pct: allProperties.filter(p => p.city?.toLowerCase() === 'mumbai').length > 0 ? 100 : 0, color: "#10b981", bg: "bg-emerald-500", delay: "0.2s" },
                      { city: "Delhi-NCR", type: "Commercial", pct: allProperties.filter(p => p.city?.toLowerCase() === 'delhi_ncr' || p.city?.toLowerCase() === 'delhi').length > 0 ? 100 : 0, color: "#3b82f6", bg: "bg-blue-500", delay: "0.3s" },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: item.color }} />
                            <span className="text-[11px] font-extrabold text-slate-700">{item.city}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">({item.type})</span>
                          </div>
                          <span className="text-[11px] font-black text-slate-800">{item.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.bg}`}
                            style={{
                              width: `${item.pct}%`,
                              animation: `progressFill 1s ease-out ${item.delay} both`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Reviews — Right */}
                <div className="lg:col-span-5 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm text-left flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Site Visit Feedback</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Verified buyer walkthrough ratings</p>
                    </div>
                    {/* Average rating pill */}
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                      <span className="text-amber-500 text-sm">★</span>
                      <span className="text-xs font-black text-slate-800">{adminStats?.avgRating || "4.8"}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">avg</span>
                    </div>
                  </div>

                  {/* Rating breakdown bars */}
                  <div className="space-y-1.5">
                    {[{ stars: 5, pct: allSiteVisits.filter(v => v.buyerRating === 5).length > 0 ? Math.round((allSiteVisits.filter(v => v.buyerRating === 5).length / allSiteVisits.filter(v => v.buyerRating).length) * 100) : 60 },
                    { stars: 4, pct: allSiteVisits.filter(v => v.buyerRating === 4).length > 0 ? Math.round((allSiteVisits.filter(v => v.buyerRating === 4).length / allSiteVisits.filter(v => v.buyerRating).length) * 100) : 25 },
                    { stars: 3, pct: allSiteVisits.filter(v => v.buyerRating === 3).length > 0 ? Math.round((allSiteVisits.filter(v => v.buyerRating === 3).length / allSiteVisits.filter(v => v.buyerRating).length) * 100) : 10 },
                    { stars: 2, pct: allSiteVisits.filter(v => v.buyerRating === 2).length > 0 ? Math.round((allSiteVisits.filter(v => v.buyerRating === 2).length / allSiteVisits.filter(v => v.buyerRating).length) * 100) : 3 },
                    { stars: 1, pct: allSiteVisits.filter(v => v.buyerRating === 1).length > 0 ? Math.round((allSiteVisits.filter(v => v.buyerRating === 1).length / allSiteVisits.filter(v => v.buyerRating).length) * 100) : 2 }
                    ].map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[9px] font-bold">
                        <span className="w-4 text-right text-slate-500">{r.stars}</span>
                        <span className="text-amber-400">★</span>
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{
                              width: `${r.pct}%`,
                              animation: `progressFill 0.8s ease-out ${idx * 0.1}s both`
                            }}
                          />
                        </div>
                        <span className="w-6 text-slate-400">{r.pct}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Live feedback cards */}
                  <div className="space-y-3 overflow-y-auto max-h-[210px] pr-0.5 mt-1">
                    {allSiteVisits.filter(v => v.buyerRating).length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic py-6 text-center">No client feedback reviews logged yet.</div>
                    ) : (
                      allSiteVisits.filter(v => v.buyerRating).map((rev, idx) => (
                        <div
                          key={rev._id}
                          className="flex gap-3 p-3 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all duration-200 items-start text-xs font-sans animate-fade-in"
                        >
                          <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs uppercase shrink-0 border">{rev.fullName?.charAt(0)}</div>
                          <div className="flex-1 space-y-1 text-left min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-black text-slate-800 text-[11px] truncate">{rev.fullName}</span>
                              <span className="text-[8px] text-slate-400 font-bold shrink-0">{rev.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center text-amber-400 text-[10px] font-extrabold gap-0.5">
                                {"★".repeat(rev.buyerRating)}
                              </div>
                              <span className="text-[8px] text-slate-400 font-bold">({rev.buyerRating})</span>
                              <span className="ml-auto text-[7px] font-black px-1.5 py-0.5 rounded uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">{rev.status}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{rev.completionRemarks || "Walkthrough tour with designated broker representative."}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* PREMIUM LISTINGS SHOWCASE */}
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Premium Catalog Showcase</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Latest listed properties across all segments</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("property_list")}
                    className="text-[9px] font-black text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl uppercase tracking-wide cursor-pointer transition-colors"
                  >
                    View All
                  </button>
                </div>

                {allProperties.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Building className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold">No properties listed yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {allProperties.slice(0, 4).map((prop, idx) => (
                      <div
                        key={prop._id}
                        className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.1}s both` }}
                      >
                        <div className="h-36 bg-slate-100 relative overflow-hidden">
                          <img
                            src={prop.image
                              ? (prop.image.startsWith("http") ? prop.image : `${BACKEND_URL}${prop.image.startsWith("/") ? "" : "/"}${prop.image}`)
                              : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"}
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white rounded-lg text-[8px] font-black uppercase tracking-wider">
                            {prop.type}
                          </span>
                          <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${prop.status === "Sold"
                              ? "bg-red-50/90 text-red-700 border-red-200"
                              : "bg-emerald-50/90 text-emerald-700 border-emerald-200"
                            }`}>
                            {prop.status}
                          </span>
                        </div>

                        <div className="p-4 flex flex-col gap-2 flex-1">
                          <h4 className="font-extrabold text-slate-800 text-[13px] truncate leading-snug">{prop.name}</h4>
                          <p className="text-[9px] text-slate-400 truncate flex items-center gap-1 font-semibold">
                            <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                            {prop.streetAddress}, {prop.city}
                          </p>
                          <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                            <div>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Price</p>
                              <span className="font-black text-slate-900 text-[13px]">{formatINR(prop.price)}</span>
                            </div>
                            <button
                              onClick={() => setActiveTab("property_list")}
                              className="text-[9px] font-black text-[#00a896] border border-[#00a896]/20 bg-[#00a896]/5 hover:bg-[#00a896]/10 px-2.5 py-1 rounded-xl uppercase cursor-pointer transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS DASHBOARD (REF IMAGE 5 Style) */}
          {activeTab === "analytics" && activeStaffRole === "Super Admin" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Ecosystem Performance Analytics</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Monitor targets progress, revenue indexes, and operational metrics.</p>
              </div>

              {/* TARGET METRICS ROW WITH CIRCULAR PROGRESS (Image 5 Style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Properties For Sale */}
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Properties For Sale</span>
                    <h4 className="text-2xl font-black text-slate-800">
                      {allProperties.filter((p) => p.status !== "Sold").length}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block font-sans">Active Marketplace Listings</span>
                  </div>
                  <div className="h-16 w-16 relative flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#14b8a6" strokeWidth="3"
                        strokeDasharray={`${Math.min(100, Math.round((allProperties.filter((p) => p.status !== "Sold").length / Math.max(1, allProperties.length)) * 100))} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-800">
                      {Math.min(100, Math.round((allProperties.filter((p) => p.status !== "Sold").length / Math.max(1, allProperties.length)) * 100))}%
                    </span>
                  </div>
                </div>

                {/* Properties For Rent */}
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Properties Sold</span>
                    <h4 className="text-2xl font-black text-slate-800">
                      {allProperties.filter((p) => p.status === "Sold").length}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block font-sans">Closed Marketplace Deals</span>
                  </div>
                  <div className="h-16 w-16 relative flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f97316" strokeWidth="3"
                        strokeDasharray={`${Math.min(100, Math.round((allProperties.filter((p) => p.status === "Sold").length / Math.max(1, allProperties.length)) * 100))} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-800">
                      {Math.min(100, Math.round((allProperties.filter((p) => p.status === "Sold").length / Math.max(1, allProperties.length)) * 100))}%
                    </span>
                  </div>
                </div>

                {/* Active Agents */}
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Active Agents</span>
                    <h4 className="text-2xl font-black text-slate-800">{agentsList.length}</h4>
                    <span className="text-[9px] text-slate-400 font-bold block font-sans">Staff Registered Roster</span>
                  </div>
                  <div className="h-16 w-16 relative flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3"
                        strokeDasharray="100 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-800">100%</span>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Conversion Rate</span>
                    <h4 className="text-2xl font-black text-slate-800">
                      {adminStats?.agentConversionRate || 0}%
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block font-sans">Site Visits Success</span>
                  </div>
                  <div className="h-16 w-16 relative flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="3"
                        strokeDasharray={`${adminStats?.agentConversionRate || 0} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-800">{adminStats?.agentConversionRate || 0}%</span>
                  </div>
                </div>
              </div>

              {/* DOUBLE CHARTS (Image 5 Style) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Property Revenue Stacked Column Bar */}
                <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm text-left">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase">Property Revenue</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Ledger capital flows indices</p>
                    </div>
                    <select className="p-1.5 border rounded-xl text-[10px] font-bold bg-slate-50 cursor-pointer outline-none">
                      <option>Real-Time Dynamic</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-xs font-bold text-slate-700 font-sans">
                    <span className="flex flex-col">Gross Escrow Receipts<span className="text-base font-black text-slate-900">{formatINR(adminStats?.totalTokenCollected || 0)}</span></span>
                    <span className="flex flex-col">Active Units Sold<span className="text-base font-black text-slate-900">{allProperties.filter((p) => p.status === "Sold").length} Units</span></span>
                    <span className="flex flex-col">System Locks Accepted<span className="text-base font-black text-slate-900">{allPropertyLocks.filter(l => l.status === "agent_accepted").length} Locks</span></span>
                  </div>
                  {/* Stacked bar visualization mapping properties dynamically */}
                  <div className="h-48 mt-6 w-full flex items-end justify-between px-2 pt-2 border-b">
                    {[
                      { inc: 40, exp: 30, pr: 10 },
                      { inc: 45, exp: 25, pr: 20 },
                      { inc: 35, exp: 30, pr: 15 },
                      { inc: 55, exp: 20, pr: 35 },
                      { inc: 32, exp: 28, pr: 18 },
                      { inc: 48, exp: 22, pr: 26 },
                      { inc: 50, exp: 25, pr: 25 },
                      { inc: 40, exp: 30, pr: 15 },
                      { inc: 38, exp: 32, pr: 12 },
                      { inc: 42, exp: 28, pr: 20 },
                      { inc: 45, exp: 25, pr: 28 },
                      { inc: 50 + (allProperties.filter((p) => p.status === "Sold").length * 5), exp: 30, pr: 20 + (allPropertyLocks.length * 2) },
                    ].map((val, idx) => (
                      <div key={idx} className="flex flex-col justify-end w-3 h-full gap-0.5">
                        <div className="w-full bg-blue-400 rounded-t-xs" style={{ height: `${(val.pr / 105) * 100}%` }} />
                        <div className="w-full bg-red-400" style={{ height: `${(val.exp / 105) * 100}%` }} />
                        <div className="w-full bg-teal-500" style={{ height: `${(val.inc / 105) * 100}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-2 px-2 font-sans">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                </div>

                {/* Sales Statistic Curved Area Line */}
                <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm text-left">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase">Sales Statistics</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Growth trends line visualization</p>
                    </div>
                    <select className="p-1.5 border rounded-xl text-[10px] font-bold bg-slate-50 cursor-pointer outline-none">
                      <option>Real-Time Dynamic</option>
                    </select>
                  </div>
                  <div className="pt-4 font-mono text-xs font-black text-slate-800 flex items-baseline gap-2">
                    <span className="text-2xl font-black">{formatINR(adminStats?.totalTokenCollected || 0)}</span>
                    <span className="text-emerald-500 text-xs font-bold font-sans">Total Collected</span>
                  </div>
                  {/* Custom SVG line curve using dynamics */}
                  <div className="h-48 mt-6 w-full relative">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      <path d={`M0,130 C50,110 100,120 150,90 C200,60 250,75 300,50 C350,30 400,20 450,${Math.max(10, 100 - allProperties.filter((p) => p.status === "Sold").length * 15)} L500,${Math.max(5, 80 - allPropertyLocks.length * 10)}`} fill="none" stroke="#0ea5e9" strokeWidth="3" />
                      <path d={`M0,130 C50,110 100,120 150,90 C200,60 250,75 300,50 C350,30 400,20 450,${Math.max(10, 100 - allProperties.filter((p) => p.status === "Sold").length * 15)} L500,${Math.max(5, 80 - allPropertyLocks.length * 10)} L500,150 L0,150 Z`} fill="url(#stats-grad)" opacity="0.1" />
                      <circle cx="500" cy={Math.max(5, 80 - allPropertyLocks.length * 10)} r="4.5" fill="#0ea5e9" stroke="#fff" strokeWidth="1.5" />
                      <defs>
                        <linearGradient id="stats-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-2 font-sans">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                  </div>
                </div>
              </div>

              {/* Master Property Listing Table */}
              <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-xs text-left font-sans">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h3 className="font-black text-sm text-slate-800 uppercase">Property Performance Index</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={propertySearchQuery}
                      onChange={(e) => { setPropertySearchQuery(e.target.value); setPropertyIndexPage(1); }}
                      placeholder="Search Property..."
                      className="p-2 border rounded-xl bg-slate-50 text-[10px] font-semibold text-slate-700 outline-none"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto mt-4 font-semibold text-slate-700">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-5 py-3">Property ID</th>
                        <th className="px-5 py-3">Property Name</th>
                        <th className="px-5 py-3">Location</th>
                        <th className="px-5 py-3 font-mono">Type</th>
                        <th className="px-5 py-3 text-right">Price</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 font-mono">ROI</th>
                        <th className="px-5 py-3 text-right">Occupancy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-750">
                      {paginatedPropertiesIndex.map((p, idx) => {
                        const globalIdx = (propertyIndexPage - 1) * 10 + idx;
                        return (
                          <tr key={p._id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3.5 font-mono text-[10px] text-slate-450">#{p._id?.slice(-6)}</td>
                            <td className="px-5 py-3.5 text-slate-800 font-bold">{p.name}</td>
                            <td className="px-5 py-3.5">{p.city}</td>
                            <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">{p.type}</td>
                            <td className="px-5 py-3.5 text-right text-slate-900">{formatINR(p.price)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.status === 'Sold' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{p.status}</span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[10px] text-emerald-600">+{8.2 + (globalIdx % 3)}%</td>
                            <td className="px-5 py-3.5 text-right font-mono text-[10px]">{85 + (globalIdx % 10)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {filteredPropertiesIndex.length > 10 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50 text-slate-500 font-semibold select-none mt-4 rounded-b-2xl">
                    <span className="text-[10px] text-slate-450 uppercase tracking-wider">
                      Showing {(propertyIndexPage - 1) * 10 + 1} - {Math.min(propertyIndexPage * 10, filteredPropertiesIndex.length)} of {filteredPropertiesIndex.length} properties
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={propertyIndexPage === 1}
                        onClick={() => setPropertyIndexPage((prev) => Math.max(prev - 1, 1))}
                        className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 text-[10px] uppercase font-black cursor-pointer transition-all"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={propertyIndexPage * 10 >= filteredPropertiesIndex.length}
                        onClick={() => setPropertyIndexPage((prev) => prev + 1)}
                        className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 text-[10px] uppercase font-black cursor-pointer transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CRM LEAD BOARD KANBAN */}
          {activeTab === "crm" && (activeStaffRole === "Super Admin" || activeStaffRole === "CRM Executive") && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Interactive CRM Leads Board</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Track client operational states, locks, and sales conversions.</p>
              </div>

              {/* Kanban Columns - Horizontally Scrollable Section */}
              <div className="flex gap-6 items-start mt-6 text-xs overflow-x-auto pb-4 scrollbar-thin select-none">
                {/* 1. Inquiries / Registrations */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-4 space-y-4 w-[280px] sm:w-[320px] shrink-0">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-[10px] uppercase text-slate-500 tracking-wider">Inquiries ({buyersList.length})</span>
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {buyersList.map((buyer) => (
                      <div key={buyer._id} className="bg-white border p-3 rounded-2xl shadow-xs space-y-1.5 text-left font-sans">
                        <div className="font-bold text-slate-900">{buyer.name}</div>
                        <div className="text-[9px] font-mono text-slate-400">{buyer.email}</div>
                        <div className="flex justify-between items-center pt-1.5 border-t text-[8px] font-black uppercase">
                          <span className={buyer.kycStatus === 'verified' ? 'text-emerald-600' : 'text-amber-600'}>KYC: {buyer.kycStatus}</span>
                          <span className="text-slate-400">Joined 2026</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Lock Requests */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-4 space-y-4 w-[280px] sm:w-[320px] shrink-0">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-[10px] uppercase text-slate-500 tracking-wider">Locks Queue ({allPropertyLocks.filter(l => l.status === 'pending_admin').length})</span>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {allPropertyLocks.filter(l => l.status === "pending_admin").map((lock) => (
                      <div key={lock._id} className="bg-white border p-3 rounded-2xl shadow-xs space-y-2 text-left font-sans">
                        <div className="font-bold text-slate-900 truncate">{lock.property?.name}</div>
                        <div className="text-[10px] text-slate-500">Buyer: {lock.buyer?.name}</div>
                        <button onClick={() => { setActiveTab("lock_requests"); }} className="w-full py-1 border border-orange-200 text-orange-600 rounded-lg text-[9px] font-black uppercase hover:bg-orange-50 cursor-pointer">Assign Agent</button>
                      </div>
                    ))}
                    {allPropertyLocks.filter(l => l.status === "pending_admin").length === 0 && (
                      <div className="py-8 text-center text-[10px] text-slate-400 italic">No locks pending assignment.</div>
                    )}
                  </div>
                </div>

                {/* 3. Representative Tours */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-4 space-y-4 w-[280px] sm:w-[320px] shrink-0">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-[10px] uppercase text-slate-500 tracking-wider">Representative Tours ({allSiteVisits.length})</span>
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                  </div>
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {allSiteVisits.map((visit) => (
                      <div key={visit._id} className="bg-white border p-3 rounded-2xl shadow-xs space-y-1.5 text-left font-sans">
                        <div className="font-bold text-slate-900">{visit.fullName}</div>
                        <div className="text-[10px] text-slate-500 truncate font-semibold">Project: {visit.project?.name || "Unit Site"}</div>
                        <div className="flex justify-between items-center pt-1.5 border-t text-[8px] font-black uppercase mt-1">
                          <span className="text-slate-400">{visit.date}</span>
                          <span className={`px-1.5 rounded ${visit.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700 animate-pulse'}`}>{visit.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Closed Bookings */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-4 space-y-4 w-[280px] sm:w-[320px] shrink-0">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-[10px] uppercase text-slate-500 tracking-wider">Closed Bookings ({allBookings.length})</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {allBookings.map((b) => (
                      <div key={b._id} className="bg-white border p-3 rounded-2xl shadow-xs space-y-1.5 text-left font-sans">
                        <div className="font-bold text-slate-900">Unit {b.unit?.unitNumber}</div>
                        <div className="text-[10px] text-slate-500 truncate font-semibold">{b.unit?.project?.name}</div>
                        <div className="font-mono text-slate-700 text-[10px] font-semibold">{formatINR(b.tokenAmountPaid || 100000)} paid</div>
                        <div className="flex justify-between items-center pt-1.5 border-t text-[8px] font-black uppercase mt-1">
                          <span className="text-slate-400">Buyer: {b.buyer?.name}</span>
                          <span className="text-emerald-600">Escrow Confirmed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS LOCKER */}
          {activeTab === "docs_locker" && (activeStaffRole === "Super Admin" || activeStaffRole === "Documentation Staff") && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Documents Locker & Contract templates</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Draft, review, and template builder-buyer contracts and sale deed parameters.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 pb-2 border-b">Active Contract Template Builder</h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400">Agreement Title</label>
                      <input type="text" defaultValue="Standard Builder-Buyer Agreement" className="p-2.5 bg-slate-50 border rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1 font-sans">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400">Contract Content Template</label>
                      <textarea rows={8} defaultValue="This Builder-Buyer Agreement is made and executed on this day between Developer (PropEstate Builders) and Purchaser {buyerName} for the allocation of Unit {unitNumber} in Project {projectName}. The total escrow token value received is {tokenAmount}..." className="p-2.5 bg-slate-50 border rounded-xl text-[11px] leading-relaxed font-mono focus:outline-none" />
                    </div>
                    <button onClick={() => toast.success("Template parameters saved and cached.")} className="w-full py-3 bg-slate-900 text-white font-extrabold rounded-xl uppercase hover:bg-slate-800 cursor-pointer">Save Agreement Template</button>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4 text-xs font-semibold text-slate-705 font-sans">
                  <h3 className="font-black text-sm text-slate-800 pb-2 border-b text-left">Active Purchaser Contract Audits</h3>
                  <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        <tr>
                          <th className="px-5 py-3">Purchaser</th>
                          <th className="px-5 py-3">Inventory</th>
                          <th className="px-5 py-3">Legal Template</th>
                          <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {allBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3 font-bold text-slate-800">{b.buyer?.name}</td>
                            <td className="px-5 py-3">Unit {b.unit?.unitNumber}</td>
                            <td className="px-5 py-3 font-mono text-[10px]">Standard BBA v1.2</td>
                            <td className="px-5 py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'}`}>{b.status === 'confirmed' ? 'Ready to Sign' : 'Drafting'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AGENTS EXPLORER DIRECTORY (REF IMAGE 3 & 4 inspiration) */}
          {activeTab === "agents_explorer" && activeStaffRole === "Super Admin" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Licensed Brokers Directory</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Inspect and audit agent credentials, sales performance, and active ratings.</p>
              </div>

              {/* KPI metrics row for agents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400">Total Commissions Paid</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">{formatINR(846380)}</h4>
                  <span className="text-[9px] text-emerald-500 font-bold block mt-1">+22.3% Revenue Growth</span>
                </div>
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400">Agent Conversion Rate</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">{adminStats?.agentConversionRate || "67.25"}%</h4>
                  <span className="text-[9px] text-slate-400 font-bold block mt-1 font-sans">Average closed site visits</span>
                </div>
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400">Roster Strength</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">{agentsList.length || 5} Active</h4>
                  <span className="text-[9px] text-slate-400 font-bold block mt-1 font-sans">Representatives across India</span>
                </div>
                <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400">Average Agent Rating</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">4.6 / 5.0</h4>
                  <span className="text-[9px] text-orange-500 font-bold block mt-1">★ ★ ★ ★ ☆ Verified</span>
                </div>
              </div>

              {/* Best Performing & Meet New (Side-by-Side - Image 3 Style) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Best Performing Agents */}
                <div className="lg:col-span-6 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase pb-2 border-b">Best Performing Agents</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Top converting representatives this quarter</p>
                  </div>
                  <div className="space-y-4 mt-6">
                    {(() => {
                      const getAgentStats = (agentId) => {
                        const visits = allSiteVisits.filter(v => v.assignedAgent?._id === agentId);
                        const completed = visits.filter(v => v.status === "completed" || v.status === "follow_up").length;
                        const ratings = visits.filter(v => v.buyerRating);
                        const avgRating = ratings.length > 0
                          ? (ratings.reduce((acc, curr) => acc + curr.buyerRating, 0) / ratings.length).toFixed(1)
                          : "0.0";
                        return { completed, avgRating, reviewsCount: ratings.length };
                      };

                      const rankedAgents = [...agentsList].sort((a, b) => {
                        const statsA = getAgentStats(a._id);
                        const statsB = getAgentStats(b._id);
                        return Number(statsB.avgRating) - Number(statsA.avgRating) || statsB.completed - statsA.completed;
                      });

                      if (rankedAgents.length === 0) {
                        return <div className="py-8 text-center text-slate-400 italic">No agents registered in directory.</div>;
                      }

                      return rankedAgents.slice(0, 3).map((agent) => {
                        const stats = getAgentStats(agent._id);
                        return (
                          <div key={agent._id} className="flex justify-between items-center text-xs font-semibold">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs uppercase border border-orange-200">{agent.name?.charAt(0)}</div>
                              <div className="text-left">
                                <div className="font-bold text-slate-900">{agent.name}</div>
                                <div className="text-[10px] text-slate-400 font-semibold">{agent.phone}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-800 block">{stats.completed} Completed Tours</span>
                              <span className="text-[9px] text-orange-500 font-bold">★ {stats.avgRating} ({stats.reviewsCount} reviews)</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Meet New Agents */}
                <div className="lg:col-span-6 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase pb-2 border-b">Ecosystem Representative Roster</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Full registry database lookup</p>
                  </div>
                  <div className="space-y-4 mt-6 overflow-y-auto max-h-[160px] pr-1 font-semibold">
                    {agentsList.map((agent) => (
                      <div key={agent._id} className="flex justify-between items-center text-xs">
                        <div className="text-left font-sans">
                          <div className="font-bold text-slate-900">{agent.name}</div>
                          <div className="text-[10px] text-slate-400">{agent.email}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-black rounded uppercase">Representative</span>
                      </div>
                    ))}
                    {agentsList.length === 0 && (
                      <div className="py-8 text-center text-slate-400 italic">No agents registered in database.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LOCK REQUESTS */}
          {activeTab === "lock_requests" && activeStaffRole === "Super Admin" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Property Lock Requests</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Review buyer lock requests, assign agents, approve or reject each request.</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase">
                    Pending: {allPropertyLocks.filter(l => l.status === "pending_admin").length}
                  </span>
                  <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase">
                    Accepted: {allPropertyLocks.filter(l => l.status === "agent_accepted").length}
                  </span>
                </div>
              </div>

              {allPropertyLocks.length === 0 ? (
                <div className="py-16 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50 text-slate-400">
                  <Lock className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-bold mt-2">No property lock requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allPropertyLocks.map((lock) => (
                    <div key={lock._id} className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-start gap-4">
                          {lock.property?.image ? (
                            <img src={lock.property.image.startsWith("http") ? lock.property.image : `${BACKEND_URL}/${lock.property.image.startsWith("/") ? lock.property.image.slice(1) : lock.property.image}`} alt="" className="h-14 w-20 object-cover rounded-xl border shrink-0" />
                          ) : lock.plot?.highlightedImageUrl ? (
                            <img src={lock.plot.highlightedImageUrl.startsWith("http") ? lock.plot.highlightedImageUrl : `${BACKEND_URL}/${lock.plot.highlightedImageUrl.startsWith("/") ? lock.plot.highlightedImageUrl.slice(1) : lock.plot.highlightedImageUrl}`} alt="" className="h-14 w-20 object-cover rounded-xl border shrink-0" />
                          ) : (
                            <div className="h-14 w-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border"><Building size={16} className="text-slate-400" /></div>
                          )}
                          <div className="text-left">
                            {lock.property ? (
                              <>
                                <h4 className="font-black text-sm text-slate-800">{lock.property?.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{[lock.property?.streetAddress, lock.property?.city, lock.property?.state].filter(Boolean).join(", ")}</p>
                                <p className="text-[11px] font-bold text-orange-606 mt-1">{formatINR(lock.property?.price || 0)}</p>
                              </>
                            ) : (
                              <>
                                <h4 className="font-black text-sm text-slate-800">
                                  {lock.plot?.name} - Segment #{lock.plot?.segments?.find(s => s._id === lock.plotSegmentId)?.plotNumber || "Plot"}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{lock.plot?.address || "Premium Township"}</p>
                                <p className="text-[11px] font-bold text-orange-606 mt-1">
                                  {formatINR(lock.plot?.segments?.find(s => s._id === lock.plotSegmentId)?.basePrice || 0)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${lock.status === "pending_admin" ? "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                            : lock.status === "agent_assigned" ? "bg-blue-100 text-blue-700 border-blue-200"
                              : lock.status === "agent_accepted" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : lock.status === "agent_rejected" ? "bg-orange-100 text-orange-700 border-orange-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                          }`}>{lock.status?.replace(/_/g, " ")}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-left">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Buyer</span>
                          <span className="font-extrabold text-slate-800 block mt-0.5">{lock.buyer?.name}</span>
                          <span className="text-[10px] text-slate-400">{lock.buyer?.email}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Assigned Agent</span>
                          <span className="font-extrabold text-slate-800 block mt-0.5">{lock.assignedAgent?.name || "—"}</span>
                          <span className="text-[10px] text-slate-400">{lock.assignedAgent?.phone || ""}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Requested On</span>
                          <span className="font-extrabold text-slate-800 block mt-0.5 font-mono">{new Date(lock.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {lock.status === "pending_admin" && (
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <select
                              value={lockAssignAgentId}
                              onChange={(e) => setLockAssignAgentId(e.target.value)}
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-400 cursor-pointer text-slate-700"
                            >
                              <option value="">-- Select Agent to Assign --</option>
                              {agentsList.map((a) => (
                                <option key={a._id} value={a._id}>{a.name} ({a.specialization || "Agent"})</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAdminApproveLock(lock._id)}
                              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] rounded-xl uppercase cursor-pointer shrink-0"
                            >
                              Approve & Assign
                            </button>
                          </div>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={lockRejectReason}
                              onChange={(e) => setLockRejectReason(e.target.value)}
                              placeholder="Rejection reason (optional)"
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-400 text-slate-700"
                            />
                            <button
                              onClick={() => handleAdminRejectLock(lock._id)}
                              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[10px] rounded-xl uppercase cursor-pointer border border-red-200 shrink-0"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {lock.status === "agent_rejected" && (
                        <div className="border-t border-slate-100 pt-4">
                          <p className="text-[10px] text-orange-600 font-bold mb-2">Agent declined — reassign to another agent:</p>
                          <div className="flex gap-3">
                            <select
                              value={lockAssignAgentId}
                              onChange={(e) => setLockAssignAgentId(e.target.value)}
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer text-slate-700"
                            >
                              <option value="">-- Select New Agent --</option>
                              {agentsList.map((a) => (
                                <option key={a._id} value={a._id}>{a.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAdminApproveLock(lock._id)}
                              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[10px] rounded-xl uppercase cursor-pointer shrink-0"
                            >
                              Reassign Agent
                            </button>
                          </div>
                        </div>
                      )}

                      {lock.adminNote && (
                        <p className="text-[10px] text-slate-500 font-medium bg-slate-50 rounded-xl px-3 py-2 text-left">Admin Note: {lock.adminNote}</p>
                      )}
                      {lock.rejectionReason && (
                        <p className="text-[10px] text-red-500 font-medium bg-red-50 rounded-xl px-3 py-2 text-left">Rejection Reason: {lock.rejectionReason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: USER ROSTER MANAGEMENT */}
          {activeTab === "roster" && activeStaffRole === "Super Admin" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase font-sans">Ecosystem Users Roster</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Inspect registered buyer profiles, active agents, and operations staff.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Roster Table */}
                <div className="lg:col-span-7 border border-slate-200/80 rounded-3xl overflow-hidden bg-white shadow-sm text-xs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest text-left">
                        <tr>
                          <th className="px-5 py-3.5">Name</th>
                          <th className="px-5 py-3.5">Email / Phone</th>
                          <th className="px-5 py-3.5">Role</th>
                          <th className="px-5 py-3.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-left">
                        {usersList.slice((rosterPage - 1) * 10, rosterPage * 10).map((usr) => (
                          <tr key={usr._id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                {usr.image && (
                                  <img
                                    src={usr.image.startsWith("http") ? usr.image : `${BACKEND_URL}${usr.image}`}
                                    alt=""
                                    className="h-7 w-7 rounded-full object-cover border"
                                  />
                                )}
                                <span>{usr.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div>{usr.email}</div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">{usr.phone || "—"}</div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${usr.role === "buyer" ? "bg-blue-50 text-blue-700"
                                  : usr.role === "agent" ? "bg-orange-50 text-orange-700"
                                    : "bg-purple-50 text-purple-700"
                                }`}>{usr.role}</span>
                            </td>
                            <td className="px-5 py-4">
                              {usr.role === "agent" && (
                                <button
                                  onClick={() => window.location.href = `/agent/${usr._id}`}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-extrabold text-[9px] uppercase cursor-pointer"
                                >
                                  Profile Page
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {usersList.length > 10 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50 text-slate-500 font-semibold select-none">
                      <span className="text-[10px] text-slate-450 uppercase tracking-wider">
                        Showing {(rosterPage - 1) * 10 + 1} - {Math.min(rosterPage * 10, usersList.length)} of {usersList.length} users
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={rosterPage === 1}
                          onClick={() => setRosterPage((prev) => Math.max(prev - 1, 1))}
                          className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 text-[10px] uppercase font-black cursor-pointer transition-all"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={rosterPage * 10 >= usersList.length}
                          onClick={() => setRosterPage((prev) => prev + 1)}
                          className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 text-[10px] uppercase font-black cursor-pointer transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Provision Form */}
                <form onSubmit={handleProvisionUser} className="lg:col-span-5 lg:sticky lg:top-6 self-start border border-slate-200/80 rounded-3xl p-5 bg-white shadow-sm space-y-4 text-xs font-semibold text-left">
                  <h3 className="text-sm font-black text-slate-800 pb-2 border-b">Provision Ecosystem Account</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        value={provisionForm.name}
                        onChange={(e) => setProvisionForm({ ...provisionForm, name: e.target.value })}
                        placeholder="e.g. John Carter"
                        className="p-2.5 bg-slate-50 border rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Phone Number</label>
                      <input
                        type="text"
                        value={provisionForm.phone}
                        onChange={(e) => setProvisionForm({ ...provisionForm, phone: e.target.value })}
                        placeholder="e.g. +91 98765"
                        className="p-2.5 bg-slate-50 border rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Email Address</label>
                      <input
                        type="email"
                        value={provisionForm.email}
                        onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                        placeholder="e.g. john@domain.com"
                        className="p-2.5 bg-slate-50 border rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Password</label>
                      <input
                        type="password"
                        value={provisionForm.password}
                        onChange={(e) => setProvisionForm({ ...provisionForm, password: e.target.value })}
                        placeholder="Password"
                        className="p-2.5 bg-slate-50 border rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Profile Role</label>
                    <select
                      value={provisionForm.role}
                      onChange={(e) => setProvisionForm({ ...provisionForm, role: e.target.value, staffDept: "", reraId: "", experience: "", specialization: "", serviceAreas: "" })}
                      className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer text-slate-700"
                    >
                      <option value="agent">Brokerage Agent</option>
                      <option value="buyer">Direct Buyer</option>
                      <option value="staff">Internal Operations Staff</option>
                    </select>
                  </div>

                  {provisionForm.role === "staff" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Staff Department</label>
                      <select
                        value={provisionForm.staffDept}
                        onChange={(e) => setProvisionForm({ ...provisionForm, staffDept: e.target.value })}
                        className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer text-slate-700"
                        required
                      >
                        <option value="">-- Choose Department --</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="KYC Verifier">KYC Verifier</option>
                        <option value="CRM Executive">CRM Executive</option>
                        <option value="Accounts Staff">Accounts Staff</option>
                        <option value="Documentation Staff">Documentation Staff</option>
                        <option value="Operations Manager">Operations Manager</option>
                      </select>
                    </div>
                  )}

                  {provisionForm.role === "agent" && (
                    <div className="space-y-4 border-t pt-3 mt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">RERA License Number</label>
                          <input
                            type="text"
                            value={provisionForm.reraId}
                            onChange={(e) => setProvisionForm({ ...provisionForm, reraId: e.target.value })}
                            placeholder="e.g. HARERA/1202"
                            className="p-2.5 bg-slate-50 border rounded-xl"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Experience (Years)</label>
                          <input
                            type="number"
                            value={provisionForm.experience}
                            onChange={(e) => setProvisionForm({ ...provisionForm, experience: e.target.value })}
                            placeholder="e.g. 5"
                            className="p-2.5 bg-slate-50 border rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Specialization Tag</label>
                        <input
                          type="text"
                          value={provisionForm.specialization}
                          onChange={(e) => setProvisionForm({ ...provisionForm, specialization: e.target.value })}
                          placeholder="e.g. High-Rise Luxury Penthouses"
                          className="p-2.5 bg-slate-50 border rounded-xl"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Service Areas (Comma separated)</label>
                        <input
                          type="text"
                          value={provisionForm.serviceAreas}
                          onChange={(e) => setProvisionForm({ ...provisionForm, serviceAreas: e.target.value })}
                          placeholder="e.g. Kolkata, Gurugram"
                          className="p-2.5 bg-slate-50 border rounded-xl"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Profile Photograph</label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2 border-2 border-dashed border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl cursor-pointer text-[10px] font-bold text-orange-500 uppercase transition-all">
                            {uploadingField === "agentPhoto" ? "Uploading..." : "Select File"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAgentPhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {provisionForm.image && (
                            <span className="text-[10px] text-green-600 font-extrabold">✓ Photo Uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs uppercase shadow-sm cursor-pointer active:scale-98 transition-all"
                  >
                    Provision Account
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: KYC VERIFICATION QUEUE */}
          {activeTab === "kyc_queue" && (activeStaffRole === "Super Admin" || activeStaffRole === "KYC Verifier") && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase font-sans">KYC Verifier Queue</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Audit uploaded documents and Pan/Aadhaar credentials to approve accounts.</p>
              </div>

              {buyersList.filter(b => b.kycStatus === "pending").length === 0 ? (
                <div className="py-16 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50 text-slate-400">
                  <Shield className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-bold mt-2">No pending KYC files awaiting review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {buyersList.filter(b => b.kycStatus === "pending").map((buyer) => (
                    <div key={buyer._id} className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold">
                      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800">{buyer.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{buyer.email}</span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase animate-pulse border border-amber-205">Pending Review</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-450 block">PAN ID</span>
                          <span className="font-mono text-slate-800">{buyer.kycDetails?.panNumber || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-450 block">Aadhaar UID</span>
                          <span className="font-mono text-slate-800">{buyer.kycDetails?.aadhaarNumber || "—"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100">
                        {buyer.kycDocs?.panCardUrl && (
                          <a href={buyer.kycDocs.panCardUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" /> PAN File
                          </a>
                        )}
                        {buyer.kycDocs?.aadhaarFrontUrl && (
                          <a href={buyer.kycDocs.aadhaarFrontUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" /> Aadhaar Front
                          </a>
                        )}
                        {buyer.kycDocs?.aadhaarBackUrl && (
                          <a href={buyer.kycDocs.aadhaarBackUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" /> Aadhaar Back
                          </a>
                        )}
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-slate-100">
                        <button onClick={() => { setSelectedKycForVerify(buyer); handleVerifyKyc(buyer._id, "verified"); }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-lg uppercase">Verify & Pass</button>
                        <button onClick={() => { setSelectedKycForVerify(buyer); handleVerifyKyc(buyer._id, "rejected"); }} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold rounded-lg uppercase border border-red-200">Reject File</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SITE VISITS MANAGER */}
          {activeTab === "visits_manager" && (activeStaffRole === "Super Admin" || activeStaffRole === "Operations Manager") && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Site Visits & GPS Auditing</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Audit tour coordinates, verify OTP, and assign representatives.</p>
                </div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold text-slate-600">Active Visits: {allSiteVisits.filter(v => v.status === "in_progress").length}</div>
              </div>

              <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-5 py-3.5">Client & Contact</th>
                        <th className="px-5 py-3.5">Target Site</th>
                        <th className="px-5 py-3.5">Date & Slot</th>
                        <th className="px-5 py-3.5">Representative</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {allSiteVisits.map((v) => (
                        <tr key={v._id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{v.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{v.mobileNumber}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800">{v.property?.name || v.project?.name || "Project Site"}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{v.property?.city || v.project?.location}</div>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold">
                            <div>{v.date}</div>
                            <div className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">{v.timeSlot}</div>
                          </td>
                          <td className="px-5 py-4">
                            {v.assignedAgent ? (
                              <span className="font-bold text-slate-800">{v.assignedAgent.name}</span>
                            ) : (
                              <select
                                onChange={(e) => handleAssignAgent(v._id, e.target.value)}
                                className="p-2 border rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 cursor-pointer"
                              >
                                <option value="">-- Assign Agent --</option>
                                {agentsList.map((a) => (
                                  <option key={a._id} value={a._id}>{a.name}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${v.status === "completed" ? "bg-emerald-50 text-emerald-700"
                                : v.status === "cancelled" ? "bg-red-50 text-red-700"
                                  : "bg-orange-50 text-orange-700 animate-pulse"
                              }`}>{v.status}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {(v.checkInLocation?.lat || v.checkOutLocation?.lat) ? (
                              <button onClick={() => setSelectedVisitForOtp(v)} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-slate-800">Audit GPS</button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 italic">No GPS Log</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedVisitForOtp && (
                <div ref={gpsAuditSectionRef} className="mt-8 border border-slate-200 bg-white rounded-3xl p-5 space-y-4">
                  <h3 className="text-sm font-black text-slate-800">📍 Visual GPS Audit: {selectedVisitForOtp.fullName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-xs font-semibold">
                    {/* Column 1: GPS Coordinates */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Check-In Coordinates</span>
                        <span className="font-mono text-slate-700 block mt-0.5">Lat {selectedVisitForOtp.checkInLocation?.lat?.toFixed(4)}, Lng {selectedVisitForOtp.checkInLocation?.lng?.toFixed(4)}</span>
                        {selectedVisitForOtp.checkInLocation?.timestamp && (
                          <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(selectedVisitForOtp.checkInLocation.timestamp).toLocaleString()}</span>
                        )}
                      </div>
                      {selectedVisitForOtp.checkOutLocation?.lat && (
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Check-Out Coordinates</span>
                          <span className="font-mono text-slate-700 block mt-0.5">Lat {selectedVisitForOtp.checkOutLocation?.lat?.toFixed(4)}, Lng {selectedVisitForOtp.checkOutLocation?.lng?.toFixed(4)}</span>
                          {selectedVisitForOtp.checkOutLocation?.timestamp && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(selectedVisitForOtp.checkOutLocation.timestamp).toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Column 2: Targeted Inventory Details */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 flex flex-col gap-3">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">
                        Target Tour Inventory
                      </span>
                      {selectedVisitForOtp.property ? (
                        <>
                          <div className="h-28 overflow-hidden rounded-xl bg-slate-200 shrink-0">
                            <img
                              src={selectedVisitForOtp.property.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"}
                              alt={selectedVisitForOtp.property.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-800 text-xs">{selectedVisitForOtp.property.name}</h4>
                            <p className="text-[10px] text-slate-450 font-bold">📍 {selectedVisitForOtp.property.streetAddress || selectedVisitForOtp.property.city}</p>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 mt-1">
                              <span className="text-[8px] uppercase text-slate-400 font-bold">Price Value</span>
                              <span className="text-xs font-black text-slate-800">{formatINR(selectedVisitForOtp.property.price)}</span>
                            </div>
                          </div>
                        </>
                      ) : selectedVisitForOtp.project ? (
                        <>
                          <div className="h-28 overflow-hidden rounded-xl bg-slate-200 shrink-0">
                            <img
                              src={selectedVisitForOtp.project.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"}
                              alt={selectedVisitForOtp.project.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-800 text-xs">{selectedVisitForOtp.project.name}</h4>
                            <p className="text-[10px] text-slate-455 font-bold">📍 {selectedVisitForOtp.project.location}</p>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 mt-1">
                              <span className="text-[8px] uppercase text-slate-400 font-bold">RERA Number</span>
                              <span className="text-[10px] font-mono font-bold text-slate-800">{selectedVisitForOtp.project.reraNumber || "Approved"}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 italic py-8 text-center">No inventory linked.</div>
                      )}
                    </div>

                    {/* Column 3: Leaflet GPS Map */}
                    <div className="flex flex-col h-full">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold mb-2">Check-in GPS Map</span>
                      <div className="flex-1 min-h-[140px] rounded-xl overflow-hidden border">
                        <LeafletMap
                          lat={selectedVisitForOtp.checkInLocation?.lat ?? selectedVisitForOtp.checkOutLocation?.lat}
                          lng={selectedVisitForOtp.checkInLocation?.lng ?? selectedVisitForOtp.checkOutLocation?.lng}
                          popupText={`Audit Check: ${selectedVisitForOtp.fullName}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ACCOUNTS MANAGEMENT */}
          {activeTab === "accounts" && (activeStaffRole === "Super Admin" || activeStaffRole === "Accounts Staff") && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Accounts & Escrow Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Verify token escrow deposits and download sales reports.</p>
              </div>

              <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-5 py-3.5">Purchaser</th>
                        <th className="px-5 py-3.5">Inventory</th>
                        <th className="px-5 py-3.5">Milestone Status</th>
                        <th className="px-5 py-3.5 text-right font-mono">UTR Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {allBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{b.buyer?.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{b.buyer?.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800">Unit {b.unit?.unitNumber}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{b.unit?.project?.name}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${b.status === "confirmed" ? "bg-green-50 text-green-700 border-green-150"
                                : "bg-amber-50 text-amber-705 border-amber-100 animate-pulse"
                              }`}>{b.status?.replace("_", " ")}</span>
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-[10px] text-slate-500">{b.paymentLedger?.[0]?.utr || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONSTRUCTION CONSOLE */}
          {activeTab === "construction" && (activeStaffRole === "Super Admin" || activeStaffRole === "Operations Manager") && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase font-sans">Construction updates & project setup</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Set up projects, define latitude/longitude coordinates, and register RERA papers.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleCreateProject} className="lg:col-span-5 border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm space-y-4 text-xs font-semibold text-left">
                  <h3 className="text-sm font-black text-slate-800 pb-2 border-b">Initialize Project Pipeline</h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Project Name</label>
                    <input type="text" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="e.g. DLF Magnolias Phase 2" className="p-2.5 bg-slate-50 border rounded-xl focus:outline-none" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Development Type</label>
                      <select value={projectForm.type} onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })} className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer text-slate-700 focus:outline-none">
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Plotting</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">RERA Registration No</label>
                      <input type="text" value={projectForm.reraNumber} onChange={(e) => setProjectForm({ ...projectForm, reraNumber: e.target.value })} placeholder="e.g. RERA-HR-2025-019" className="p-2.5 bg-slate-50 border rounded-xl focus:outline-none" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Geographical Location</label>
                    <input type="text" value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} placeholder="e.g. Sector 54, Gurugram, Haryana" className="p-2.5 bg-slate-50 border rounded-xl focus:outline-none" required />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Assign Agent for Communication</label>
                    <select
                      value={projectForm.assignedAgent}
                      onChange={(e) => setProjectForm({ ...projectForm, assignedAgent: e.target.value })}
                      className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer text-slate-700 focus:outline-none"
                    >
                      <option value="">Self — Admin Handles Communication</option>
                      {agentsList.map((a) => (
                        <option key={a._id} value={a._id}>{a.name} ({a.specialization || a.email})</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-400 mt-0.5">If no agent is selected, the Super Admin directly manages buyer queries for this project.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Latitude</label>
                      <input type="number" step="any" value={projectForm.coordinates.lat} onChange={(e) => setProjectForm({ ...projectForm, coordinates: { ...projectForm.coordinates, lat: Number(e.target.value) } })} className="p-2.5 bg-slate-50 border rounded-xl font-mono focus:outline-none" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Longitude</label>
                      <input type="number" step="any" value={projectForm.coordinates.lng} onChange={(e) => setProjectForm({ ...projectForm, coordinates: { ...projectForm.coordinates, lng: Number(e.target.value) } })} className="p-2.5 bg-slate-50 border rounded-xl font-mono focus:outline-none" required />
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

                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl uppercase cursor-pointer border-none">Create Project</button>
                </form>

                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-black text-sm text-slate-800 pb-2 border-b text-left">Ecosystem Projects Pipeline</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {projects.map((proj) => (
                      <div key={proj._id} className="border border-slate-200 bg-white rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                        <div className="text-left">
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] rounded uppercase font-black">{proj.type}</span>
                            {proj.assignedAgent ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] rounded font-bold truncate max-w-[120px]">🤝 {proj.assignedAgent?.name || "Agent"}</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] rounded font-bold">👤 Admin-Managed</span>
                            )}
                          </div>
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

          {/* TAB: PROPERTIES INDEX VIEW */}
          {activeTab === "property_list" && activeStaffRole === "Super Admin" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Ecosystem Property Catalog</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Monitor all properties published in the platform marketplace.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => setAdminPropModalOpen(true)}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm border-none"
                  >
                    Add Property Listing
                  </button>
                  <button
                    onClick={() => setAdminPlotModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm border-none"
                  >
                    Add Plot Layout
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allProperties.map((prop) => (
                  <div key={prop._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="h-40 overflow-hidden bg-slate-100">
                      <img src={prop.image ? (prop.image.startsWith("http") ? prop.image : `${BACKEND_URL}/${prop.image.startsWith("/") ? prop.image.slice(1) : prop.image}`) : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-800 truncate">{prop.name}</h4>
                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] rounded uppercase font-bold">{prop.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-450 truncate">{prop.streetAddress}, {prop.city}</p>
                      <div className="font-bold text-slate-800 pt-1 border-t border-slate-50">{formatINR(prop.price)}</div>
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleAdminStartEditProperty(prop)}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-850 font-extrabold text-[9px] rounded-lg uppercase cursor-pointer transition border-none"
                        >
                          Edit
                        </button>
                        {prop.status !== "Booked" && (
                          <button
                            onClick={() => handleAdminMarkAsBooked(prop._id)}
                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[9px] rounded-lg uppercase cursor-pointer transition border border-emerald-250"
                          >
                            Mark Booked
                          </button>
                        )}
                        <button
                          onClick={() => handleAdminDeleteProperty(prop._id)}
                          className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[9px] rounded-lg uppercase cursor-pointer transition border border-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Property Form Modal */}
              {adminPropModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl animate-fade-in border border-slate-100 flex flex-col max-h-[90vh]">
                    <button
                      onClick={() => {
                        setAdminPropModalOpen(false);
                        setEditingPropertyId(null);
                        setAdminPropForm({
                          name: "",
                          type: "Apartment",
                          status: "For Sale",
                          price: "",
                          area: "",
                          streetAddress: "",
                          city: "",
                          state: "",
                          country: "India",
                          zipCode: "",
                          description: "",
                          image: "",
                          style: "Building",
                          uploadedBy: ""
                        });
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent outline-none"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                    <div className="border-b pb-3 mb-4 text-left font-sans">
                      <h3 className="text-base font-black text-slate-800 uppercase">
                        🏢 {editingPropertyId ? "Edit Property Listing" : "Add New Property Listing"}
                      </h3>
                      <p className="text-[10px] text-slate-450 mt-0.5">
                        {editingPropertyId ? "Modify existing apartment, villa, flat, or commercial space details." : "Publish a new apartment, villa, flat, or commercial space into the ecosystem."}
                      </p>
                    </div>

                    <form onSubmit={handleAdminCreateProperty} className="flex-1 overflow-y-auto space-y-4 text-xs font-semibold p-1 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Property Title/Name</label>
                          <input type="text" value={adminPropForm.name} onChange={(e) => setAdminPropForm({ ...adminPropForm, name: e.target.value })} placeholder="e.g. DLF Magnolias Apartment" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Assign Representative Agent</label>
                          <select value={adminPropForm.uploadedBy} onChange={(e) => setAdminPropForm({ ...adminPropForm, uploadedBy: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer focus:outline-none text-slate-700">
                            <option value="">Self - Handle by Super Admin</option>
                            {agentsList.map((a) => (
                              <option key={a._id} value={a._id}>{a.name} ({a.specialization || "Agent"})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Property Type</label>
                          <select value={adminPropForm.type} onChange={(e) => setAdminPropForm({ ...adminPropForm, type: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700">
                            <option value="Apartment">Apartment</option>
                            <option value="Villa">Villa</option>
                            <option value="Penthouse">Penthouse</option>
                            <option value="Flat">Flat</option>
                            <option value="House">House</option>
                            <option value="Land">Land</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Listing Status</label>
                          <select value={adminPropForm.status} onChange={(e) => setAdminPropForm({ ...adminPropForm, status: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700">
                            <option value="For Sale">For Sale</option>
                            <option value="For Rent">For Rent</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Price (INR)</label>
                          <input type="number" value={adminPropForm.price} onChange={(e) => setAdminPropForm({ ...adminPropForm, price: e.target.value })} placeholder="e.g. 7500000" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Area (Sq. Ft.)</label>
                          <input type="number" value={adminPropForm.area} onChange={(e) => setAdminPropForm({ ...adminPropForm, area: e.target.value })} placeholder="1500" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Beds</label>
                          <input type="number" value={adminPropForm.beds} onChange={(e) => setAdminPropForm({ ...adminPropForm, beds: Number(e.target.value) })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Baths</label>
                          <input type="number" value={adminPropForm.baths} onChange={(e) => setAdminPropForm({ ...adminPropForm, baths: Number(e.target.value) })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Visual Style</label>
                          <select value={adminPropForm.style} onChange={(e) => setAdminPropForm({ ...adminPropForm, style: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700">
                            <option value="Building">Building</option>
                            <option value="Office">Office</option>
                            <option value="Shop">Shop</option>
                            <option value="A-Frame">A-Frame</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Street Address</label>
                          <input type="text" value={adminPropForm.streetAddress} onChange={(e) => setAdminPropForm({ ...adminPropForm, streetAddress: e.target.value })} placeholder="Sector 45" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                          <input type="text" value={adminPropForm.city} onChange={(e) => setAdminPropForm({ ...adminPropForm, city: e.target.value })} placeholder="Gurgaon" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Zip Code</label>
                          <input type="text" value={adminPropForm.zipCode} onChange={(e) => setAdminPropForm({ ...adminPropForm, zipCode: e.target.value })} placeholder="122001" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">State</label>
                          <input type="text" value={adminPropForm.state} onChange={(e) => setAdminPropForm({ ...adminPropForm, state: e.target.value })} placeholder="Haryana" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Country</label>
                          <input type="text" value={adminPropForm.country} onChange={(e) => setAdminPropForm({ ...adminPropForm, country: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                        <textarea value={adminPropForm.description} onChange={(e) => setAdminPropForm({ ...adminPropForm, description: e.target.value })} placeholder="Describe amenities, location context, pricing details..." rows={3} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                      </div>

                      <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 relative hover:bg-slate-100/50 transition-colors">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Property Photo Banner</span>
                        {adminPropForm.image ? (
                          <div className="mt-3 flex flex-col items-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                            <span className="text-[9px] text-slate-500 font-mono mt-1 truncate max-w-xs">{adminPropForm.image}</span>
                          </div>
                        ) : (
                          <div className="mt-3 flex flex-col items-center">
                            <UploadCloud className="h-8 w-8 text-slate-400" />
                            <label className="cursor-pointer mt-2 text-[10px] font-extrabold text-orange-500 hover:underline">
                              {uploadingField === "propImage" ? "Uploading..." : "Choose File"}
                              <input type="file" accept="image/*" onChange={handlePropImageUpload} className="hidden" />
                            </label>
                          </div>
                        )}
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 cursor-pointer mt-4 border-none">
                        {editingPropertyId ? "Update Listing" : "Publish Listing"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Plot Form Modal */}
              {adminPlotModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl animate-fade-in border border-slate-100 flex flex-col max-h-[90vh]">
                    <button
                      onClick={() => setAdminPlotModalOpen(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent outline-none"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                    <div className="border-b pb-3 mb-4 text-left font-sans">
                      <h3 className="text-base font-black text-slate-800 uppercase">📍 Add New Plot Layout</h3>
                      <p className="text-[10px] text-slate-450 mt-0.5">Define a new block layout pipeline with customizable segments/sub-plots.</p>
                    </div>

                    <form onSubmit={handleAdminCreatePlot} className="flex-1 overflow-y-auto space-y-4 text-xs font-semibold p-1 text-left">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Layout/Block Name</label>
                        <input type="text" value={adminPlotForm.name} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, name: e.target.value })} placeholder="e.g. Greenwood Enclave Extension" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Link Project (Optional)</label>
                          <select value={adminPlotForm.projectId} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, projectId: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer focus:outline-none text-slate-700">
                            <option value="">-- Select Project --</option>
                            {projects.map((proj) => (
                              <option key={proj._id} value={proj._id}>{proj.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Total Layout Area (Sq. Ft.)</label>
                          <input type="number" value={adminPlotForm.totalSqft} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, totalSqft: e.target.value })} placeholder="e.g. 50000" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Address Location</label>
                        <input type="text" value={adminPlotForm.address} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, address: e.target.value })} placeholder="e.g. Sector 82, Gurgaon" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase">Latitude</label>
                          <input type="number" step="any" value={adminPlotForm.lat} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, lat: Number(e.target.value) })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none" required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-455 uppercase">Longitude</label>
                          <input type="number" step="any" value={adminPlotForm.lng} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, lng: Number(e.target.value) })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none" required />
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3">Define First Sub-plot Segment:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Plot Number</label>
                            <input type="text" value={adminPlotForm.plotNumber} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, plotNumber: e.target.value })} placeholder="P-1" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none" required />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Plot Area (Sqft)</label>
                            <input type="number" value={adminPlotForm.segmentSqft} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, segmentSqft: Number(e.target.value) })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Base Price (INR)</label>
                            <input type="number" value={adminPlotForm.basePrice} onChange={(e) => setAdminPlotForm({ ...adminPlotForm, basePrice: Number(e.target.value) })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" required />
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 cursor-pointer mt-4 border-none">Create Layout Listing</button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: CHAT MONITOR (AUDIT LOGS) */}
          {activeTab === "agent_chat" && activeStaffRole === "Super Admin" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Agent Messaging Console</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Chat directly with agents for escalations, approvals, and lock coordination.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1 border border-slate-200 bg-white rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Agent Directory</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Select an agent to open a private chat.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {agentsList.length === 0 ? (
                      <div className="text-slate-400 text-[11px] italic">No active agents available.</div>
                    ) : (
                      agentsList.map((agent) => (
                        <button
                          key={agent._id}
                          onClick={() => handleOpenAgentChat(agent)}
                          className={`w-full text-left p-3 rounded-2xl border ${selectedAgentChat?._id === agent._id ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white hover:bg-slate-50"} transition-colors duration-200`}
                        >
                          <div className="flex justify-between items-center gap-3">
                            <div>
                              <p className="font-bold text-slate-900 text-sm truncate">{agent.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{agent.email}</p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agent</span>
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
                      <p className="text-[10px] text-slate-400 mt-1">Secure message stream with selected agent.</p>
                    </div>
                    {selectedAgentChat && (
                      <button
                        onClick={() => {
                          setSelectedAgentChat(null);
                          setAgentChatMessages([]);
                          setAdminChatInput("");
                        }}
                        className="text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                      >
                        Close
                      </button>
                    )}
                  </div>

                  {selectedAgentChat ? (
                    <div className="flex-1 flex flex-col mt-5 overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-base">{selectedAgentChat.name?.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{selectedAgentChat.name}</p>
                          <p className="text-[10px] text-slate-400">{selectedAgentChat.email}</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-3xl space-y-3 border border-slate-100">
                        {agentChatMessages.length === 0 ? (
                          <div className="text-[11px] text-slate-500 italic">No messages yet. Send the first note to begin the conversation.</div>
                        ) : (
                          agentChatMessages.map((msg, idx) => {
                            const isMe = (msg.sender?._id || msg.sender) === (user?.id || user?._id);
                            return (
                              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[78%] rounded-3xl p-3 text-[11px] ${isMe ? "bg-orange-500 text-white rounded-br-none" : "bg-white text-slate-800 rounded-bl-none border border-slate-200"}`}>
                                  <p className="leading-relaxed">{msg.message}</p>
                                  <div className="text-[8px] text-slate-400 mt-2 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendAgentChat} className="mt-4 flex items-center gap-3 bg-white pt-4 border-t border-slate-100">
                        <input
                          value={adminChatInput}
                          onChange={(e) => setAdminChatInput(e.target.value)}
                          placeholder="Write your message..."
                          className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <button type="submit" className="px-4 py-3 bg-orange-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-wide hover:bg-orange-600">
                          Send
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400 px-6">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <MessageSquare className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="font-bold text-slate-800">Select an agent to chat with</p>
                      <p className="text-[11px] mt-2">Conversations are encrypted and staff-level bypass rules grant instant access.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat_monitor" && activeStaffRole === "Super Admin" && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase font-sans">Live Chat Audit Monitor</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold font-sans">Audit encrypted agent-buyer chat session logs for compliance and escrow bypass prevention.</p>
              </div>

              <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-5 py-3.5">Session Initiator</th>
                        <th className="px-5 py-3.5">Assigned Agent</th>
                        <th className="px-5 py-3.5">Last Communication</th>
                        <th className="px-5 py-3.5 text-right">Audit Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {chatMonitorsList.map((chat) => (
                        <tr key={chat._id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{chat.buyer?.name}</div>
                            <div className="text-[10px] text-slate-400">{chat.buyer?.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800">{chat.agent?.name}</div>
                            <div className="text-[10px] text-slate-400">{chat.agent?.email}</div>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-[10px]">
                            {new Date(chat.updatedAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => handleDecryptChatLogs(chat)} className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase hover:bg-slate-800 cursor-pointer">Decrypt Logs</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* TAB: NEWS MANAGER */}
          {activeTab === "news_manager" && activeStaffRole === "Super Admin" && (
            <NewsManagerSection BACKEND_URL={BACKEND_URL} />
          )}

          {/* TAB: PLOT LAYOUT APPROVALS */}
          {activeTab === "plot_approvals" && activeStaffRole === "Super Admin" && (
            <div className="space-y-6 text-left animate-fade-in font-sans">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Plot Layout Approvals</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Review and approve agent-submitted plot layouts for marketplace listing.</p>
              </div>

              <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm text-xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-5 py-3.5">Layout Name</th>
                        <th className="px-5 py-3.5">Associated Project</th>
                        <th className="px-5 py-3.5">Total Size</th>
                        <th className="px-5 py-3.5">Sub-plots</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {adminPlots.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">No plot layouts pending or uploaded.</td>
                        </tr>
                      ) : (
                        adminPlots.map((plot) => (
                          <tr key={plot._id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-4 font-bold text-slate-900">{plot.name}</td>
                            <td className="px-5 py-4">{plot.projectId?.name || "Premium Township"}</td>
                            <td className="px-5 py-4 font-mono">{plot.totalSqft} Sqft</td>
                            <td className="px-5 py-4">{plot.segments?.length || 0} segments</td>
                            <td className="px-5 py-4">
                              {plot.isApproved ? (
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-black uppercase">Approved</span>
                              ) : (
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-black uppercase animate-pulse">Pending Approval</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {!plot.isApproved ? (
                                <button
                                  onClick={() => handleApprovePlotLayout(plot._id)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-bold uppercase cursor-pointer"
                                >
                                  Approve
                                </button>
                              ) : (
                                <span className="text-slate-400 font-bold uppercase text-[9px]">Market Active</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
                      <p className="text-[10px] text-slate-400 font-mono">{currentUser?.email} • {currentUser?.role?.toUpperCase()} ({currentUser?.staffDept || "Staff"})</p>
                      <p className="text-[10px] text-slate-500 font-medium">Click the upload icon on your avatar to modify your display picture.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">Full Name</label>
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

          {activeTab === "support_queries" && (
            <div className="space-y-6 text-left animate-fade-in font-sans">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Customer Support Tickets</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Review user queries, technical complaints, and post resolutions directly.</p>
              </div>

              <div className="border border-slate-200/80 rounded-3xl bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold text-slate-750">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left">Date</th>
                        <th className="px-6 py-4 text-left">User Details</th>
                        <th className="px-6 py-4 text-left">Subject</th>
                        <th className="px-6 py-4 text-left">Message</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-left">Resolution Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supportQueries.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                            No support queries found in database.
                          </td>
                        </tr>
                      ) : (
                        supportQueries.map((query) => (
                          <tr key={query._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">
                              {new Date(query.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div>{query.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold">{query.email}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-900 font-bold">
                              {query.subject}
                            </td>
                            <td className="px-6 py-4 text-slate-500 max-w-xs break-words font-sans">
                              {query.message}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${query.status === "Resolved"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                                }`}>
                                {query.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {query.status === "Resolved" ? (
                                <div className="text-[10px] text-slate-400 italic">
                                  <strong>Replied:</strong> {query.reply || "No reply body needed"}
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Type response..."
                                    value={supportReplyText[query._id] || ""}
                                    onChange={(e) => setSupportReplyText({
                                      ...supportReplyText,
                                      [query._id]: e.target.value
                                    })}
                                    className="p-2 border rounded-lg bg-slate-50 text-[11px] focus:outline-none focus:border-orange-500 w-full"
                                  />
                                  <button
                                    onClick={() => handleResolveSupportQuery(query._id)}
                                    className="px-3 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wide cursor-pointer transition-colors"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mock_bookings" && (
            <div className="space-y-6 text-left animate-fade-in font-sans">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Mock Bookings & Documents Locker</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Review mock bookings, verify submitted text documents, and trigger mock escrow payments.</p>
              </div>

              <div className="border border-slate-200/80 rounded-3xl p-6 bg-white shadow-sm space-y-6">
                {mockBookings.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-xs font-bold">No mock bookings found.</p>
                    <p className="text-[10px] mt-1">Dispatched bookings will show up here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                          <th className="py-3 px-4">Client</th>
                          <th className="py-3 px-4">Agent</th>
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Submitted Data</th>
                          <th className="py-3 px-4">Installment Matrix / Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockBookings.map((b) => (
                          <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-4 px-4 font-bold text-slate-800">
                              <div>{b.buyer?.name}</div>
                              <div className="text-[10px] text-slate-455 font-normal">{b.buyer?.email}</div>
                            </td>
                            <td className="py-4 px-4 text-slate-700 font-semibold">
                              <div>{b.agent?.name}</div>
                              <div className="text-[9px] text-slate-400 font-mono">Agent ID: {b.agent?._id}</div>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-700">{b.propertyName}</td>
                            <td className="py-4 px-4 font-bold font-mono">INR {b.propertyPrice.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${b.status === "Booked" ? "bg-green-100 text-green-700" :
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
                              {b.status === "form_submitted" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveMockDocument(b._id)}
                                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border-none shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectMockDocument(b._id)}
                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-650 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border-none shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : b.paymentMatrix && b.paymentMatrix.length > 0 ? (
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
                                <span className="text-slate-400 italic text-[10px]">Awaiting {b.status === "approved" ? "Buyer Payment" : "Submission"}</span>
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
        </main>
      </div>

      {/* SECURE DECRYPTED TELEMETRY MONITOR MODAL */}
      {selectedAuditChat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl animate-fade-in border border-slate-100 flex flex-col max-h-[80vh] text-xs">
            <button
              onClick={() => {
                setSelectedAuditChat(null);
                setAuditChatMessages([]);
              }}
              className="absolute top-4 right-4 text-slate-450 hover:text-slate-700 cursor-pointer border-0 bg-transparent outline-none"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <div className="border-b pb-3 mb-4 text-left font-sans">
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] rounded uppercase font-black tracking-wider">Secure Audit Telemetry Log</span>
              <h3 className="text-base font-black text-slate-800 uppercase mt-1">
                💬 Decrypted Session Logs
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">
                Audit Trail between Buyer <span className="font-bold text-slate-700">{selectedAuditChat.buyer?.name}</span> and Broker <span className="font-bold text-slate-700">{selectedAuditChat.agent?.name}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 border rounded-2xl flex flex-col min-h-[300px]">
              {auditChatMessages.map((msg, idx) => {
                const isBuyer = (msg.sender?._id || msg.sender) === (selectedAuditChat.buyer?._id || selectedAuditChat.buyer);
                return (
                  <div
                    key={idx}
                    className={`flex ${isBuyer ? "justify-start" : "justify-end"} items-start gap-2`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[80%] text-[11px] font-semibold text-left shadow-xs ${isBuyer
                          ? "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                          : "bg-emerald-600 text-white rounded-tr-none"
                        }`}
                    >
                      <div className="text-[7px] uppercase font-black tracking-wider text-slate-400 mb-1">
                        {isBuyer ? "Buyer" : "Agent/Broker"}
                      </div>
                      <p className="leading-relaxed break-words font-sans">{msg.message}</p>
                      <span
                        className={`text-[7px] block mt-1 font-mono text-right ${isBuyer ? "text-slate-400" : "text-emerald-200"}`}
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
              {auditChatMessages.length === 0 && (
                <div className="my-auto text-center text-slate-400 italic font-semibold">No decrypted text log data transmitted in this session yet.</div>
              )}
            </div>

            <div className="border-t pt-3 mt-4 flex justify-between items-center text-[10px] text-slate-400 font-sans font-bold">
              <span>Compliance Status: Locked</span>
              <button
                onClick={() => {
                  setSelectedAuditChat(null);
                  setAuditChatMessages([]);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer transition-all"
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsManagerSection({ BACKEND_URL }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    author: "",
    role: "",
    avatar: "",
    img: "",
    type: "feature-left",
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/news`);
      if (res.data.success) {
        setArticles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load news:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploadingField("newsCover");

    try {
      const token = localStorage.getItem("token");
      const uploadRes = await axios.post(`${BACKEND_URL}/api/properties/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      setForm((prev) => ({ ...prev, img: uploadRes.data.url }));
      toast.success("Cover image uploaded successfully!");
    } catch (err) {
      console.error("News cover upload error:", err);
      toast.error("Failed to upload cover image.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleNewsAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploadingField("newsAvatar");

    try {
      const token = localStorage.getItem("token");
      const uploadRes = await axios.post(`${BACKEND_URL}/api/properties/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      setForm((prev) => ({ ...prev, avatar: uploadRes.data.url }));
      toast.success("Author avatar uploaded successfully!");
    } catch (err) {
      console.error("News avatar upload error:", err);
      toast.error("Failed to upload avatar.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${BACKEND_URL}/api/news`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("News article published successfully!");
        setForm({
          title: "",
          desc: "",
          author: "",
          role: "",
          avatar: "",
          img: "",
          type: "feature-left",
        });
        fetchNews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish news.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${BACKEND_URL}/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Article deleted successfully.");
        fetchNews();
      }
    } catch (err) {
      toast.error("Failed to delete article.");
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-poppins">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">Editorial Updates & News Manager</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-semibold">Publish new articles, guides, or market insights to the homepage editorial board layout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* News Creation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase pb-2 border-b">Publish New Article</h3>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Article Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Real Estate bubble Appreciations..."
              className="w-full p-3 border rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description / Content *</label>
            <textarea
              required
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Write article details here..."
              rows={4}
              className="w-full p-3 border rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Author Name</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="e.g. Marina Sherof"
                className="w-full p-3 border rounded-xl text-xs font-semibold bg-slate-50 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Author Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Reporter"
                className="w-full p-3 border rounded-xl text-xs font-semibold bg-slate-50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Layout Placement *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full p-3 border rounded-xl text-xs font-bold bg-slate-50 outline-none"
              >
                <option value="feature-left">Left Column (Text Highlight)</option>
                <option value="feature-mid">Central Column (Feature Cover Card)</option>
                <option value="feature-right-top">Right Column - Top Row</option>
                <option value="feature-right-mid">Right Column - Middle Row</option>
                <option value="feature-right-bottom">Right Column - Bottom Row</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Author Avatar</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="newsAvatarInput"
                  accept="image/*"
                  onChange={handleNewsAvatarUpload}
                  className="hidden"
                />
                <label
                  htmlFor="newsAvatarInput"
                  className="px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-xl cursor-pointer transition-colors border-none"
                >
                  {uploadingField === "newsAvatar" ? "Uploading..." : "Upload Avatar"}
                </label>
                {form.avatar && (
                  <img
                    src={form.avatar.startsWith("http") || form.avatar.startsWith("data:") ? form.avatar : `${BACKEND_URL}/${form.avatar.startsWith("/") ? form.avatar.slice(1) : form.avatar}`}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Cover Image (Required for Mid/Right Top)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="newsCoverInput"
                accept="image/*"
                onChange={handleNewsImageUpload}
                className="hidden"
              />
              <label
                htmlFor="newsCoverInput"
                className="px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-xl cursor-pointer transition-colors border-none"
              >
                {uploadingField === "newsCover" ? "Uploading..." : "Upload Cover Image"}
              </label>
              {form.img && (
                <img
                  src={form.img.startsWith("http") || form.img.startsWith("data:") ? form.img : `${BACKEND_URL}/${form.img.startsWith("/") ? form.img.slice(1) : form.img}`}
                  alt="Cover"
                  className="h-10 w-16 object-cover rounded-lg border"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl uppercase tracking-wider text-xs hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? "Publishing..." : "Publish Article"}
          </button>
        </form>

        {/* Existing Articles List */}
        <div className="lg:col-span-7 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase pb-2 border-b">Live Editorial Articles ({articles.length})</h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-bold">Loading editorial board...</div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold italic">No custom articles published yet. Homepage is rendering default updates.</div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[480px]">
              {articles.map((art) => (
                <div key={art._id} className="flex gap-4 p-4 bg-gradient-to-r from-amber-200 to-indigo-200/30 border border-slate-100 rounded-2xl items-center text-xs font-sans hover:from-white hover:to-indigo-55/20 hover:shadow-xs transition-all duration-300">
                  {art.img && (
                    <img src={art.img.startsWith("http") || art.img.startsWith("data:") ? art.img : `${BACKEND_URL}/${art.img.startsWith("/") ? art.img.slice(1) : art.img}`} alt="" className="h-12 w-16 object-cover rounded-lg shrink-0 border" />
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] rounded uppercase font-black tracking-wider">
                      {art.type}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1 truncate">{art.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">By {art.author || "Staff Writer"} · {art.date}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(art._id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-lg uppercase text-[9px] cursor-pointer transition-colors shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

