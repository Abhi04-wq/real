import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { client, useClientStore } from "../store";
import { uploadImages } from "../../lib/upload";
import { inputCls, Skeleton } from "../components/clientUi";
import toast from "react-hot-toast";
import {
  User,
  Sliders,
  Lock,
  Camera,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Save,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  BedDouble,
  Eye,
  EyeOff,
  Sparkles,
  Building,
  Heart,
} from "lucide-react";

const TABS = [
  { id: "personal", label: "Personal Information", icon: User, desc: "Personal identity, contact details & avatar" },
  { id: "preferences", label: "Residence Preferences", icon: Sliders, desc: "Target city, budget range & preferred bedrooms" },
  { id: "security", label: "Security & Password", icon: Lock, desc: "Account credentials & authentication security" },
];

const BUDGET_PRESETS = [
  { label: "₹50 L", value: 5000000 },
  { label: "₹1 Cr", value: 10000000 },
  { label: "₹2.5 Cr", value: 25000000 },
  { label: "₹5 Cr", value: 50000000 },
  { label: "₹10 Cr+", value: 100000000 },
];

const BEDROOM_PRESETS = [1, 2, 3, 4, 5];

export default function ClientProfile() {
  const user = useClientStore((s) => s.user);
  const setUser = useClientStore((s) => s.setUser);
  const mode = useClientStore((s) => s.mode);

  const [activeTab, setActiveTab] = useState("personal");

  // Main profile form
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileImage: "",
    preferences: {
      searchMatch: {
        city: "",
        maxBudget: 10000000,
        bedrooms: 3,
      },
    },
  });

  // Password state
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const fileInputRef = useRef(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["client-profile"],
    queryFn: client.profile,
  });

  useEffect(() => {
    if (data?.user) {
      const u = data.user;
      setForm({
        name: u.name || "",
        phone: u.phone || "",
        profileImage: u.profileImage || "",
        preferences: {
          searchMatch: {
            city: u.preferences?.searchMatch?.city || "",
            maxBudget: u.preferences?.searchMatch?.maxBudget || 10000000,
            bedrooms: u.preferences?.searchMatch?.bedrooms || 3,
          },
        },
      });
    }
  }, [data]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [url] = await uploadImages([file], "profiles");
      if (url) {
        setForm((prev) => ({ ...prev, profileImage: url }));
        const updated = { ...form, profileImage: url };
        const res = await client.updateProfile(updated);
        if (res?.user) {
          setUser(res.user);
        }
        toast.success("Profile photo updated successfully!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoRemove = async () => {
    setForm((prev) => ({ ...prev, profileImage: "" }));
    try {
      const updated = { ...form, profileImage: "" };
      const res = await client.updateProfile(updated);
      if (res?.user) {
        setUser(res.user);
      }
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  // Save Profile & Preferences
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await client.updateProfile(form);
      if (res?.user) {
        setUser(res.user);
      }
      toast.success("Profile and preferences saved successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pw.currentPassword || !pw.newPassword) {
      toast.error("Please fill in current and new password");
      return;
    }
    if (pw.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPw(true);
    try {
      await client.changePassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password change failed");
    } finally {
      setChangingPw(false);
    }
  };

  const sm = form.preferences?.searchMatch || {};

  const updateSearchMatch = (key, val) => {
    setForm((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        searchMatch: {
          ...(prev.preferences?.searchMatch || {}),
          [key]: val,
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#B9965B] border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#65717B]">
            Loading Profile Details…
          </p>
        </div>
      </div>
    );
  }

  const roleLabel = user?.role === "OWNER" ? "Property Seller" : "Verified Buyer";

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Picker */}
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F4EFE6] bg-[#F4EFE6]/50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#B9965B] uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              Client Hub Console
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#71877B]/30 bg-[#EBF3EF] px-2 py-0.5 text-[10px] font-medium text-[#3E8066]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3E8066] animate-pulse" />
              Active Member
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#17232F]">
            Profile & Residence Preferences
          </h1>
          <p className="mt-1 text-xs text-[#65717B]">
            Manage your personal profile, buyer match criteria, curated investment budget, and account security.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Changes…</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Client Profile Summary + Tabs */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Identity Card */}
          <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 shadow-[0_2px_12px_rgba(23,35,47,0.03)] text-center">
            <div className="relative mx-auto h-24 w-24">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt={form.name || "Client"}
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-[#B9965B]/20 shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#B9965B] text-2xl font-bold text-white shadow-md">
                  {form.name?.[0] || user?.name?.[0] || "C"}
                </div>
              )}
              {/* Photo Upload Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload profile photo"
                className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#B9965B] text-white shadow-md hover:bg-[#a6844d] transition cursor-pointer"
              >
                {uploading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-3.5">
              <h2 className="text-base font-bold text-[#17232F]">{form.name || user?.name || "Client"}</h2>
              <p className="text-xs text-[#65717B] truncate">{user?.email || "client@primenest.com"}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-[11px] font-semibold text-[#B9965B]">
                  {roleLabel}
                </span>
                <span className="rounded-full bg-[#F7F6F2] px-2.5 py-0.5 text-[10px] font-medium text-[#65717B]">
                  {mode === "selling" ? "Seller Mode Active" : "Buyer Mode Active"}
                </span>
              </div>
            </div>

            {form.profileImage && (
              <button
                type="button"
                onClick={handlePhotoRemove}
                className="mt-3 text-[11px] font-medium text-[#B85C56] hover:text-[#B85C56] transition cursor-pointer inline-flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Remove Photo
              </button>
            )}
          </div>

          {/* Vertical Navigation Tabs */}
          <div className="rounded-2xl border border-[#DFDED7] bg-white p-2 shadow-[0_2px_12px_rgba(23,35,47,0.03)] space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition cursor-pointer ${
                    isActive
                      ? "bg-[#F4EFE6]/60 text-[#B9965B] font-semibold border border-[#B9965B]/40"
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
                    <span className="text-[11px] text-[#65717B] line-clamp-1 mt-0.5">{tab.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preferred Residence Match Overview Card */}
          <div className="rounded-2xl border border-[#DFDED7] bg-white p-4 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
            <div className="flex items-center gap-2 mb-2 text-[#B9965B]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold text-[#17232F]">Match Snapshot</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#65717B]">
              <div className="flex justify-between">
                <span>Target City:</span>
                <span className="font-semibold text-[#17232F]">{sm.city || "All Locales"}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Budget:</span>
                <span className="font-semibold font-mono-numbers text-[#B9965B]">
                  ₹{Number(sm.maxBudget || 10000000).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bedrooms:</span>
                <span className="font-semibold text-[#17232F]">{sm.bedrooms ? `${sm.bedrooms} BHK` : "Any"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] space-y-5">
                  <div className="border-b border-[#DFDED7] pb-4">
                    <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                      <User className="h-4 w-4 text-[#B9965B]" />
                      Personal Identification & Contact Details
                    </h3>
                    <p className="text-xs text-[#65717B] mt-0.5">
                      Your identity and verified contact numbers for property visit confirmations and booking receipts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#17232F] mb-1.5">
                        Full Legal Name <span className="text-[#B85C56]">*</span>
                      </label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="e.g. Ananya Roy"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#17232F] mb-1.5 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#65717B]" />
                        Direct Phone / Mobile <span className="text-[#B85C56]">*</span>
                      </label>
                      <input
                        type="tel"
                        className={inputCls}
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#17232F] mb-1.5 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#65717B]" />
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        className={`${inputCls} bg-[#F7F6F2] cursor-not-allowed text-[#65717B]`}
                        value={user?.email || ""}
                      />
                      <span className="text-[10px] text-[#65717B] mt-1 block">
                        Email is verified and associated with your account authentication.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#17232F] mb-1.5">
                        Platform Role & Membership
                      </label>
                      <div className="flex h-10 items-center px-3.5 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-xs font-medium text-[#17232F]">
                        <span className="flex h-2 w-2 rounded-full bg-[#3E8066] mr-2" />
                        {roleLabel} ({mode === "selling" ? "Seller Hub" : "Buyer Console"})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Personal Info"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: RESIDENCE PREFERENCES */}
            {activeTab === "preferences" && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] space-y-6">
                  <div className="border-b border-[#DFDED7] pb-4">
                    <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#B9965B]" />
                      Homebuyer Search & Residence Match Preferences
                    </h3>
                    <p className="text-xs text-[#65717B] mt-0.5">
                      Tailor the AI residence recommendation engine to feature prime properties matching your lifestyle and investment goals.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Preferred City / Neighborhood */}
                    <div>
                      <label className="block text-xs font-semibold text-[#17232F] mb-1.5 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#B9965B]" />
                        Target City / Neighborhood
                      </label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="e.g. Mumbai, Bandra, Worli, Bangalore, Goa"
                        value={sm.city || ""}
                        onChange={(e) => updateSearchMatch("city", e.target.value)}
                      />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {["Mumbai", "Bandra West", "Worli", "Bangalore", "Goa", "Pune"].map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => updateSearchMatch("city", city)}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                              sm.city === city
                                ? "bg-[#B9965B] text-white border-[#B9965B]"
                                : "bg-[#F7F6F2] text-[#65717B] border-[#DFDED7] hover:bg-[#F4EFE6]/50"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Maximum Investment Budget */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#17232F] flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-[#B9965B]" />
                          Maximum Investment Budget (₹)
                        </label>
                        <span className="text-xs font-bold font-mono-numbers text-[#B9965B]">
                          ₹{Number(sm.maxBudget || 10000000).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <input
                        type="number"
                        className={`${inputCls} font-mono-numbers`}
                        placeholder="10000000"
                        value={sm.maxBudget || ""}
                        onChange={(e) => updateSearchMatch("maxBudget", Number(e.target.value))}
                      />
                      {/* Budget Quick Select Pills */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {BUDGET_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => updateSearchMatch("maxBudget", p.value)}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer font-mono-numbers ${
                              Number(sm.maxBudget) === p.value
                                ? "bg-[#B9965B] text-white border-[#B9965B]"
                                : "bg-[#F7F6F2] text-[#65717B] border-[#DFDED7] hover:bg-[#F4EFE6]/50"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bedroom Count (BHK) */}
                    <div>
                      <label className="block text-xs font-semibold text-[#17232F] mb-1.5 flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5 text-[#B9965B]" />
                        Preferred Bedrooms (BHK)
                      </label>
                      <div className="grid grid-cols-5 gap-2 max-w-md">
                        {BEDROOM_PRESETS.map((bhk) => (
                          <button
                            key={bhk}
                            type="button"
                            onClick={() => updateSearchMatch("bedrooms", bhk)}
                            className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-semibold transition cursor-pointer ${
                              Number(sm.bedrooms) === bhk
                                ? "bg-[#B9965B] text-white border-[#B9965B] shadow-xs"
                                : "bg-white text-[#17232F] border-[#DFDED7] hover:bg-[#F7F6F2]"
                            }`}
                          >
                            <span className="text-sm font-bold">{bhk}</span>
                            <span className="text-[10px] opacity-80">BHK</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Intelligent Matching Banner */}
                    <div className="rounded-xl border border-[#F4EFE6] bg-[#F4EFE6]/30 p-4 flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-[#B9965B] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-[#17232F] block">Personalized Recommendation Active</span>
                        <span className="text-[#65717B]">
                          Your dashboard feed and new listing alerts will automatically prioritize residences matching your criteria.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Residence Preferences"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SECURITY & PASSWORD */}
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
                  <div className="rounded-2xl border border-[#DFDED7] bg-white p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] space-y-5">
                    <div className="border-b border-[#DFDED7] pb-4">
                      <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#B9965B]" />
                        Account Security & Password
                      </h3>
                      <p className="text-xs text-[#65717B] mt-0.5">
                        Ensure your account and financial transaction records remain secure by updating your credentials.
                      </p>
                    </div>

                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#17232F] mb-1.5">
                          Current Password <span className="text-[#B85C56]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? "text" : "password"}
                            required
                            className={`${inputCls} pr-9`}
                            placeholder="Enter existing password"
                            value={pw.currentPassword}
                            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
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
                        <label className="block text-xs font-semibold text-[#17232F] mb-1.5">
                          New Password <span className="text-[#B85C56]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPw ? "text" : "password"}
                            required
                            minLength={6}
                            className={`${inputCls} pr-9`}
                            placeholder="Minimum 6 characters"
                            value={pw.newPassword}
                            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
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
                        <label className="block text-xs font-semibold text-[#17232F] mb-1.5">
                          Confirm New Password <span className="text-[#B85C56]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? "text" : "password"}
                            required
                            className={`${inputCls} pr-9`}
                            placeholder="Repeat new password"
                            value={pw.confirm}
                            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
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
