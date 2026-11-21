import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/adminApi";
import { agentApi, usePortalStore, portalApi } from "../store";
import { uploadImages } from "../../lib/upload";
import { inputCls } from "../components/portalUi";
import toast from "react-hot-toast";
import {
  User,
  Briefcase,
  Globe,
  Lock,
  Camera,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Save,
  RotateCcw,
  Mail,
  Phone,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  Share2,
} from "lucide-react";

const TABS = [
  { id: "personal", label: "Personal & Contact", icon: User, desc: "Personal identity, phone & avatar photo" },
  { id: "professional", label: "Bio & Accreditation", icon: Briefcase, desc: "Public bio, RERA license & advisory credentials" },
  { id: "social", label: "Social Media & Web", icon: Globe, desc: "Public network profiles & channels" },
  { id: "security", label: "Security & Password", icon: Lock, desc: "Account authentication & access credentials" },
];

export default function PortalProfile() {
  const user = usePortalStore((s) => s.user);
  const setUser = usePortalStore((s) => s.setUser);

  const [activeTab, setActiveTab] = useState("personal");
  const [agent, setAgent] = useState(null);

  // Form states
  const [basicForm, setBasicForm] = useState({ name: "", phone: "", profileImage: "" });
  const [extForm, setExtForm] = useState({ bio: "", licenseNumber: "", socials: {}, notificationPrefs: {} });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Password visibility toggles
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const fileInputRef = useRef(null);

  const { isLoading, refetch } = useQuery({
    queryKey: ["agent-profile-full"],
    queryFn: async () => {
      const d = await agentApi.agentProfile();
      if (d?.agent) {
        setAgent(d.agent);
        const u = d.agent.user || {};
        const pImg = u.profileImage || d.agent.profileImage || "";
        setBasicForm({
          name: u.name || "",
          phone: u.phone || "",
          profileImage: pImg,
        });
        setExtForm({
          bio: d.agent.bio || "",
          licenseNumber: d.agent.licenseNumber || "",
          socials: d.agent.socials || {},
          notificationPrefs: d.agent.notificationPrefs || { email: true, sms: true },
        });
      }
      return d;
    },
  });

  useEffect(() => {
    if (user && !basicForm.name) {
      setBasicForm((prev) => ({
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        profileImage: prev.profileImage || user.profileImage || "",
      }));
    }
  }, [user]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const [url] = await uploadImages([file], "profiles");
      if (url) {
        setBasicForm((prev) => ({ ...prev, profileImage: url }));
        // 1. Save to User model via portalApi (/api/agent/profile) and adminApi
        await portalApi.put("/profile", { ...basicForm, profileImage: url }).catch(() => null);
        await api.put("/admin/profile", { ...basicForm, profileImage: url }).catch(() => null);
        // 2. Save to Agent model via agentApi (/api/agent/profile/agent)
        const resAgent = await agentApi.updateAgentProfile({
          ...extForm,
          profileImage: url,
        });
        if (resAgent?.agent) {
          setAgent(resAgent.agent);
          if (resAgent.agent.user) setUser(resAgent.agent.user);
        } else {
          setUser({ ...(user || {}), profileImage: url });
        }
        toast.success("Profile photo saved to database!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoRemove = async () => {
    setBasicForm((prev) => ({ ...prev, profileImage: "" }));
    try {
      await portalApi.put("/profile", { ...basicForm, profileImage: "" }).catch(() => null);
      await api.put("/admin/profile", { ...basicForm, profileImage: "" }).catch(() => null);
      const resAgent = await agentApi.updateAgentProfile({
        ...extForm,
        profileImage: "",
      });
      if (resAgent?.agent) {
        setAgent(resAgent.agent);
        if (resAgent.agent.user) setUser(resAgent.agent.user);
      } else {
        setUser({ ...(user || {}), profileImage: "" });
      }
      toast.success("Profile photo removed from database");
    } catch {
      toast.error("Failed to remove profile photo");
    }
  };

  // Save All Profile & Extended Info
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      // 1. Update basic user profile in MongoDB
      await portalApi.put("/profile", basicForm).catch(() => null);
      await api.put("/admin/profile", basicForm).catch(() => null);

      // 2. Update agent specific profile in MongoDB
      const resAgent = await agentApi.updateAgentProfile({
        ...extForm,
        profileImage: basicForm.profileImage,
        name: basicForm.name,
        phone: basicForm.phone,
      });
      if (resAgent?.agent) {
        setAgent(resAgent.agent);
        if (resAgent.agent.user) setUser(resAgent.agent.user);
      }

      toast.success("Agent profile and photo saved successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error("Please fill in current and new password");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPw(true);
    try {
      await api.post("/admin/profile/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#B9965B] border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#65717B]">
            Loading Agent Profile…
          </p>
        </div>
      </div>
    );
  }

  const publicLink = agent?._id ? `/agent/${agent._id}` : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B9965B]/30 bg-[#F4EFE6] px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#B9965B] uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              Agent Partner Console
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#71877B]/30 bg-[#EBF3EF] px-2 py-0.5 text-[10px] font-medium text-[#3E8066]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3E8066] animate-pulse" />
              Verified Partner
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#17232F]">
            Agent Profile & Settings
          </h1>
          <p className="mt-1 text-xs text-[#65717B]">
            Configure your professional biography, RERA accreditation, client contacts, and security credentials.
          </p>
        </div>

        {/* Global Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {publicLink && (
            <a
              href={publicLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3.5 py-2 text-xs font-semibold text-[#65717B] hover:text-[#17232F] transition shadow-xs"
            >
              <span>Public Showcase Page</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#B9965B]" />
            </a>
          )}
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2 text-xs font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Profile Summary Card + Tabs Navigation */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Agent Identity Card */}
          <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 shadow-sm text-center">
            <div className="relative mx-auto h-24 w-24">
              {basicForm.profileImage ? (
                <img
                  src={basicForm.profileImage}
                  alt={basicForm.name || "Agent"}
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-[#B9965B]/40 shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#F4EFE6] border border-[#B9965B]/30 text-2xl font-bold text-[#B9965B] shadow-md">
                  {basicForm.name?.[0] || user?.name?.[0] || "A"}
                </div>
              )}
              {/* Photo Upload Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Upload profile photo"
                className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white shadow-md transition cursor-pointer"
              >
                {uploadingPhoto ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-3.5">
              <h2 className="text-base font-bold text-[#17232F]">{basicForm.name || user?.name || "Agent Partner"}</h2>
              <p className="text-xs text-[#65717B] truncate">{user?.email || "agent@primenest.com"}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="rounded-full bg-[#F4EFE6] border border-[#B9965B]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#B9965B]">
                  Certified Agent
                </span>
                {extForm.licenseNumber && (
                  <span className="rounded-full bg-[#F7F6F2] border border-[#DFDED7] px-2.5 py-0.5 text-[10px] font-medium text-[#65717B]">
                    {extForm.licenseNumber}
                  </span>
                )}
              </div>
            </div>

            {basicForm.profileImage && (
              <button
                type="button"
                onClick={handlePhotoRemove}
                className="mt-3 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition cursor-pointer inline-flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Remove Photo
              </button>
            )}
          </div>

          {/* Clean Vertical Tabs */}
          <div className="rounded-2xl border border-[#DFDED7] bg-white p-2 shadow-sm space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition cursor-pointer ${
                    isActive
                      ? "bg-[#F4EFE6] text-[#B9965B] font-semibold border border-[#B9965B]/40 shadow-xs"
                      : "text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] border border-transparent"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isActive ? "bg-[#B9965B] text-white" : "bg-[#F7F6F2] text-[#65717B]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium block leading-tight">{tab.label}</span>
                    <span className="text-[11px] text-[#65717B]/80 line-clamp-1 mt-0.5">{tab.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            {/* TAB 1: PERSONAL & CONTACT */}
            {activeTab === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-sm space-y-5">
                  <div className="border-b border-[#DFDED7] pb-4">
                    <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                      <User className="h-4 w-4 text-[#B9965B]" />
                      Personal Identification & Direct Contacts
                    </h3>
                    <p className="text-xs text-[#65717B] mt-0.5">
                      Your identity and contact numbers shared with assigned clients and visit leads.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        className={inputCls}
                        value={basicForm.name}
                        onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#B9965B]" />
                        Direct Phone / Mobile <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        className={inputCls}
                        value={basicForm.phone}
                        onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#B9965B]" />
                        Official Account Email
                      </label>
                      <input
                        type="email"
                        disabled
                        className={`${inputCls} bg-[#F7F6F2] cursor-not-allowed text-[#65717B]`}
                        value={user?.email || ""}
                      />
                      <span className="text-[10px] text-[#65717B] mt-1 block">
                        Account email is managed by the Super Admin.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                        Role & Access Level
                      </label>
                      <div className="flex h-10 items-center px-3.5 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-xs font-medium text-[#17232F]">
                        <span className="flex h-2 w-2 rounded-full bg-[#3E8066] mr-2" />
                        Licensed Real Estate Agent (Partner Access)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Contact Info"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: PROFESSIONAL & BIO */}
            {activeTab === "professional" && (
              <motion.div
                key="professional"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-sm space-y-5">
                  <div className="border-b border-[#DFDED7] pb-4">
                    <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[#B9965B]" />
                      Professional Biography & Licensing
                    </h3>
                    <p className="text-xs text-[#65717B] mt-0.5">
                      This information is displayed prominently on your public advisor showcase page.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#B9965B]" />
                        RERA License / Registration Number
                      </label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="e.g. MAHARERA/AGT/2026/0412"
                        value={extForm.licenseNumber}
                        onChange={(e) => setExtForm({ ...extForm, licenseNumber: e.target.value })}
                      />
                      <p className="mt-1 text-[11px] text-[#65717B]">
                        Ensures verified credibility when prospective homebuyers review your property portfolio.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                        Professional Biography & Statement
                      </label>
                      <textarea
                        rows={4}
                        className={`${inputCls} resize-none`}
                        placeholder="Over 8+ years specializing in premium South Mumbai & Bandra sea-facing luxury residences. Passionate about architectural integrity, transparent escrow transactions, and bespoke concierge property tours."
                        value={extForm.bio}
                        onChange={(e) => setExtForm({ ...extForm, bio: e.target.value })}
                      />
                      <p className="mt-1 text-[11px] text-[#65717B]">
                        Summarize your advisory focus, years of experience, and prime neighborhoods covered.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Professional Bio"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SOCIAL MEDIA & WEB */}
            {activeTab === "social" && (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-sm space-y-5">
                  <div className="border-b border-[#DFDED7] pb-4">
                    <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[#B9965B]" />
                      Social Media & Public Channels
                    </h3>
                    <p className="text-xs text-[#65717B] mt-0.5">
                      Links displayed on your public advisor profile to build digital trust with clients.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["linkedin", "instagram", "facebook", "twitter"].map((network) => (
                      <div key={network}>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5 capitalize flex items-center gap-1.5">
                          <Share2 className="h-3.5 w-3.5 text-[#B9965B]" />
                          {network === "twitter" ? "X (Twitter)" : network} Profile
                        </label>
                        <input
                          type="url"
                          className={inputCls}
                          placeholder={`https://${network}.com/yourhandle`}
                          value={extForm.socials?.[network] || ""}
                          onChange={(e) =>
                            setExtForm({
                              ...extForm,
                              socials: { ...extForm.socials, [network]: e.target.value },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Social Links"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SECURITY & PASSWORD */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-sm space-y-5">
                    <div className="border-b border-[#DFDED7] pb-4">
                      <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#B9965B]" />
                        Account Security & Password
                      </h3>
                      <p className="text-xs text-[#65717B] mt-0.5">
                        Ensure your account remains safe by regularly refreshing your password.
                      </p>
                    </div>

                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                          Current Password <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? "text" : "password"}
                            required
                            className={`${inputCls} pr-9`}
                            placeholder="Enter existing password"
                            value={pwForm.currentPassword}
                            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65717B] hover:text-[#17232F] p-1 cursor-pointer"
                          >
                            {showCurrentPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                          New Password <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPw ? "text" : "password"}
                            required
                            minLength={6}
                            className={`${inputCls} pr-9`}
                            placeholder="Minimum 6 characters"
                            value={pwForm.newPassword}
                            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65717B] hover:text-[#17232F] p-1 cursor-pointer"
                          >
                            {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                          Confirm New Password <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? "text" : "password"}
                            required
                            className={`${inputCls} pr-9`}
                            placeholder="Repeat new password"
                            value={pwForm.confirm}
                            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65717B] hover:text-[#17232F] p-1 cursor-pointer"
                          >
                            {showConfirmPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={changingPw}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {changingPw ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Updating Password…</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
