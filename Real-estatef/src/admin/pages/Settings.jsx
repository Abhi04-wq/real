import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/adminApi";
import { uploadImages } from "../../lib/upload";
import { applyFavicon } from "../../lib/favicon";
import { inputCls } from "../components/ui";
import toast from "react-hot-toast";
import {
  Building2,
  Sparkles,
  Save,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Clock,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const TABS = [
  { id: "agency", label: "Agency Profile", icon: Building2, desc: "Company information, contacts & operational details" },
  { id: "branding", label: "Branding & Media", icon: Sparkles, desc: "Official logos, favicon & brand visual identity" },
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee (INR)" },
  { code: "USD", symbol: "$", name: "US Dollar (USD)" },
  { code: "EUR", symbol: "€", name: "Euro (EUR)" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham (AED)" },
  { code: "GBP", symbol: "£", name: "British Pound (GBP)" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar (SGD)" },
];

const TIMEZONES = [
  { code: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
  { code: "UTC", label: "UTC (Coordinated Universal Time)" },
  { code: "Asia/Dubai", label: "Asia/Dubai (GST +4:00)" },
  { code: "Europe/London", label: "Europe/London (GMT/BST)" },
  { code: "America/New_York", label: "America/New_York (EST/EDT)" },
  { code: "Asia/Singapore", label: "Asia/Singapore (SGT +8:00)" },
];

export default function Settings() {
  const [s, setS] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("agency");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/settings");
      if (data?.settings) {
        setS(data.settings);
        setInitialData(JSON.parse(JSON.stringify(data.settings)));
      }
    } catch (err) {
      toast.error("Unable to load agency settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/settings", s);
      if (data?.settings) {
        setS(data.settings);
        setInitialData(JSON.parse(JSON.stringify(data.settings)));
        if (data.settings.favicon) applyFavicon(data.settings.favicon);
        window.dispatchEvent(new CustomEvent("agency-settings-updated", { detail: data.settings }));
      }
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setS(JSON.parse(JSON.stringify(initialData)));
      window.dispatchEvent(new CustomEvent("agency-settings-updated", { detail: initialData }));
      toast.success("Settings restored to previous save state");
    }
  };

  const updateField = (key, val) => {
    setS((prev) => ({ ...prev, [key]: val }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const [url] = await uploadImages([file], "branding");
      if (url) {
        updateField("logo", url);
        // Persist immediately so sidebar & navbar reflect it right away
        const payload = { ...s, logo: url };
        const { data } = await api.put("/settings", payload);
        if (data?.settings) {
          setS(data.settings);
          setInitialData(JSON.parse(JSON.stringify(data.settings)));
          window.dispatchEvent(new CustomEvent("agency-settings-updated", { detail: data.settings }));
        }
        toast.success("Logo uploaded & sidebar updated!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload logo image");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleLogoRemove = async () => {
    updateField("logo", "");
    try {
      const payload = { ...s, logo: "" };
      const { data } = await api.put("/settings", payload);
      if (data?.settings) {
        setS(data.settings);
        setInitialData(JSON.parse(JSON.stringify(data.settings)));
        window.dispatchEvent(new CustomEvent("agency-settings-updated", { detail: data.settings }));
      }
      toast.success("Logo removed");
    } catch {
      toast.error("Failed to remove logo");
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const [url] = await uploadImages([file], "branding");
      if (url) {
        updateField("favicon", url);
        const payload = { ...s, favicon: url };
        const { data } = await api.put("/settings", payload);
        if (data?.settings) {
          setS(data.settings);
          setInitialData(JSON.parse(JSON.stringify(data.settings)));
          applyFavicon(url);
          window.dispatchEvent(new CustomEvent("agency-settings-updated", { detail: data.settings }));
        }
        toast.success("Favicon uploaded & browser tab icon updated!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload favicon");
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const handleFaviconRemove = async () => {
    updateField("favicon", "");
    try {
      const payload = { ...s, favicon: "" };
      const { data } = await api.put("/settings", payload);
      if (data?.settings) {
        setS(data.settings);
        setInitialData(JSON.parse(JSON.stringify(data.settings)));
        applyFavicon("/favicon.png");
        window.dispatchEvent(new CustomEvent("agency-settings-updated", { detail: data.settings }));
      }
      toast.success("Favicon removed & restored to default");
    } catch {
      toast.error("Failed to remove favicon");
    }
  };

  if (loading || !s) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#B9965B] border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#65717B]">
            Loading Settings…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Inputs for Logo & Favicon Upload */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoUpload}
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
        className="hidden"
      />
      <input
        type="file"
        ref={faviconInputRef}
        onChange={handleFaviconUpload}
        accept="image/x-icon,image/png,image/svg+xml,image/vnd.microsoft.icon"
        className="hidden"
      />

      {/* Top Console Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#DFDED7] bg-[#FFFFFF] p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFDED7] bg-[#F4EFE6] px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#B9965B] uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              Settings
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#3E8066]/30 bg-[#3E8066]/15 px-2 py-0.5 text-[10px] font-medium text-[#3E8066]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3E8066] animate-pulse" />
              Active
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#17232F]">
            Agency Settings
          </h1>
          <p className="mt-1 text-xs text-[#65717B]">
            Manage your company information, contact details, currency, timezone, and brand assets.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFDED7] bg-[#F4EFE6] px-3.5 py-2 text-xs font-semibold text-[#65717B] hover:bg-[#EAE8E1] hover:text-[#17232F] transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2 text-xs font-bold text-[#FFFFFF] shadow-sm hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FFFFFF] border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Tabs (Sidebar) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          <div className="rounded-2xl border border-[#DFDED7] bg-[#FFFFFF] p-2 shadow-sm space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition cursor-pointer ${
                    isActive
                      ? "bg-[#F4EFE6] text-[#17232F] font-semibold border border-[#DFDED7] shadow-xs"
                      : "text-[#65717B] hover:bg-[#F4EFE6]/40 hover:text-[#17232F] border border-transparent"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isActive ? "bg-[#B9965B] text-[#FFFFFF]" : "bg-[#F7F6F2] text-[#65717B] border border-[#DFDED7]"
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

          {/* Agency Summary Card */}
          <div className="rounded-2xl border border-[#DFDED7] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {s.logo ? (
                <img
                  src={s.logo}
                  alt={s.companyName || "Logo"}
                  className="h-10 w-10 rounded-xl object-contain border border-[#DFDED7] bg-[#F7F6F2] p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EFE6] text-[#B9965B] border border-[#DFDED7]">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#17232F] truncate">{s.companyName || "PrimeNest Realty"}</p>
                <p className="text-[11px] text-[#65717B] truncate">{s.email || "admin@primenest.com"}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DFDED7] flex items-center justify-between text-[11px] text-[#65717B]">
              <span>Currency:</span>
              <span className="font-semibold text-[#17232F]">{s.currency || "INR"}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-[#65717B]">
              <span>Timezone:</span>
              <span className="font-semibold text-[#17232F] truncate max-w-[130px]">{s.timezone || "Asia/Kolkata"}</span>
            </div>
          </div>
        </div>

        {/* Tab Form Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          <form onSubmit={handleSave} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* TAB 1: AGENCY PROFILE */}
              {activeTab === "agency" && (
                <motion.div
                  key="agency"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5"
                >
                  <div className="rounded-2xl border border-[#DFDED7] bg-[#FFFFFF] p-6 shadow-sm space-y-5">
                    <div className="border-b border-[#DFDED7] pb-4">
                      <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#B9965B]" />
                        Company & Operational Profile
                      </h3>
                      <p className="text-xs text-[#65717B] mt-0.5">
                        These details represent your agency across client communications, invoices, and booking receipts.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                          Company / Agency Name <span className="text-[#B85C56]">*</span>
                        </label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="e.g. PrimeNest Realty"
                          value={s.companyName || ""}
                          onChange={(e) => updateField("companyName", e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5">
                          Tagline / Slogan
                        </label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="e.g. Curated Luxury Estates & Residences"
                          value={s.tagline || ""}
                          onChange={(e) => updateField("tagline", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-[#B9965B]" />
                          Official Support Email <span className="text-[#B85C56]">*</span>
                        </label>
                        <input
                          type="email"
                          className={inputCls}
                          placeholder="admin@primenest.com"
                          value={s.email || ""}
                          onChange={(e) => updateField("email", e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-[#B9965B]" />
                          Hotline / Phone Number
                        </label>
                        <input
                          type="tel"
                          className={inputCls}
                          placeholder="+91 98765 43210"
                          value={s.phone || ""}
                          onChange={(e) => updateField("phone", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-[#B9965B]" />
                          Website URL
                        </label>
                        <input
                          type="url"
                          className={inputCls}
                          placeholder="https://www.primenest.com"
                          value={s.website || ""}
                          onChange={(e) => updateField("website", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-[#B9965B]" />
                          Base Currency
                        </label>
                        <select
                          className={inputCls}
                          value={s.currency || "INR"}
                          onChange={(e) => updateField("currency", e.target.value)}
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name} ({c.symbol})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#B9965B]" />
                          Operating Timezone
                        </label>
                        <select
                          className={inputCls}
                          value={s.timezone || "Asia/Kolkata"}
                          onChange={(e) => updateField("timezone", e.target.value)}
                        >
                          {TIMEZONES.map((tz) => (
                            <option key={tz.code} value={tz.code}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#65717B] mb-1.5 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#B9965B]" />
                        Corporate Office Address
                      </label>
                      <textarea
                        rows={3}
                        className={`${inputCls} resize-none`}
                        placeholder="Suite 1400, Financial District Tower, Mumbai, Maharashtra 400013"
                        value={s.address || ""}
                        onChange={(e) => updateField("address", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: BRANDING & MEDIA */}
              {activeTab === "branding" && (
                <motion.div
                  key="branding"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5"
                >
                  <div className="rounded-2xl border border-[#DFDED7] bg-[#FFFFFF] p-6 shadow-sm space-y-6">
                    <div className="border-b border-[#DFDED7] pb-4">
                      <h3 className="text-base font-bold text-[#17232F] flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#B9965B]" />
                        Logos & Visual Brand Assets
                      </h3>
                      <p className="text-xs text-[#65717B] mt-0.5">
                        Upload official brand imagery or specify direct URLs for your logo and browser favicon.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Logo Section with Direct Upload */}
                      <div className="rounded-xl border border-[#DFDED7] p-5 bg-[#F7F6F2] space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#17232F] block">Company Logo</span>
                            <span className="text-[11px] text-[#65717B]">PNG, SVG, WEBP (Recommended: 300x80px)</span>
                          </div>
                          {s.logo && (
                            <button
                              type="button"
                              onClick={handleLogoRemove}
                              title="Clear logo"
                              className="text-[#B85C56] hover:opacity-80 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Logo Preview Box */}
                        <div className="rounded-xl border border-dashed border-[#DFDED7] bg-[#FFFFFF] p-4 flex flex-col items-center justify-center min-h-[120px] transition">
                          {s.logo ? (
                            <div className="relative group">
                              <img
                                src={s.logo}
                                alt="Company Logo"
                                className="max-h-20 max-w-[220px] object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="text-center text-xs text-[#65717B]">
                              <ImageIcon className="h-8 w-8 mx-auto text-[#65717B]/40 mb-1.5" />
                              <span className="font-medium text-[#17232F] block">No custom logo uploaded</span>
                              <span className="text-[11px] text-[#65717B]">System default luxury typography active</span>
                            </div>
                          )}
                        </div>

                        {/* Upload Button + File Trigger */}
                        <div className="space-y-3">
                          <button
                            type="button"
                            disabled={uploadingLogo}
                            onClick={() => logoInputRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#B9965B] px-4 py-2.5 text-xs font-bold text-[#FFFFFF] shadow-sm hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
                          >
                            {uploadingLogo ? (
                              <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FFFFFF] border-t-transparent" />
                                <span>Uploading Logo…</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-4 w-4" />
                                <span>Upload Logo Image</span>
                              </>
                            )}
                          </button>

                          <div>
                            <span className="block text-[11px] font-semibold text-[#65717B] mb-1">
                              Or paste direct image URL
                            </span>
                            <input
                              type="url"
                              className={inputCls}
                              placeholder="https://example.com/logo.png"
                              value={s.logo || ""}
                              onChange={(e) => updateField("logo", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Favicon Section with Direct Upload */}
                      <div className="rounded-xl border border-[#DFDED7] p-5 bg-[#F7F6F2] space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#17232F] block">Browser Favicon</span>
                            <span className="text-[11px] text-[#65717B]">.ICO, .PNG, .SVG (Square: 32x32 or 64x64)</span>
                          </div>
                          {s.favicon && (
                            <button
                              type="button"
                              onClick={handleFaviconRemove}
                              title="Clear favicon"
                              className="text-[#B85C56] hover:opacity-80 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Favicon Preview Box */}
                        <div className="rounded-xl border border-dashed border-[#DFDED7] bg-[#FFFFFF] p-4 flex flex-col items-center justify-center min-h-[120px] transition">
                          {s.favicon ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={s.favicon}
                                alt="Favicon"
                                className="h-10 w-10 rounded-xl object-contain border border-[#DFDED7] bg-[#F7F6F2] p-1.5 shadow-2xs"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <div className="text-left">
                                <span className="text-xs font-bold text-[#17232F] block flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#3E8066]" /> Active Favicon
                                </span>
                                <span className="text-[11px] text-[#65717B]">Displays on browser tabs</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-[#65717B]">
                              <Sparkles className="h-8 w-8 mx-auto text-[#65717B]/40 mb-1.5" />
                              <span className="font-medium text-[#17232F] block">No custom favicon</span>
                              <span className="text-[11px] text-[#65717B]">Default browser icon active</span>
                            </div>
                          )}
                        </div>

                        {/* Upload Button + File Trigger */}
                        <div className="space-y-3">
                          <button
                            type="button"
                            disabled={uploadingFavicon}
                            onClick={() => faviconInputRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#B9965B] bg-[#F4EFE6] px-4 py-2.5 text-xs font-semibold text-[#B9965B] hover:bg-[#EAE8E1] hover:text-[#17232F] transition cursor-pointer disabled:opacity-50"
                          >
                            {uploadingFavicon ? (
                              <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#B9965B] border-t-transparent" />
                                <span>Uploading Favicon…</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-4 w-4" />
                                <span>Upload Favicon File</span>
                              </>
                            )}
                          </button>

                          <div>
                            <span className="block text-[11px] font-semibold text-[#65717B] mb-1">
                              Or paste direct favicon URL
                            </span>
                            <input
                              type="url"
                              className={inputCls}
                              placeholder="https://example.com/favicon.ico"
                              value={s.favicon || ""}
                              onChange={(e) => updateField("favicon", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Brand Colors Reference — software theme */}
                    <div className="pt-2 border-t border-[#DFDED7]">
                      <p className="text-xs font-semibold text-[#65717B] mb-2.5">
                        Brand Theme Colors
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-[#DFDED7] p-3 flex items-center gap-2.5 bg-[#F7F6F2]">
                          <div className="h-6 w-6 rounded-md bg-[#B9965B] shadow-xs" />
                          <div>
                            <span className="text-[11px] font-bold text-[#17232F] block">#B9965B</span>
                            <span className="text-[10px] text-[#65717B]">Champagne Gold</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#DFDED7] p-3 flex items-center gap-2.5 bg-[#F7F6F2]">
                          <div className="h-6 w-6 rounded-md bg-[#D8BF8A] shadow-xs" />
                          <div>
                            <span className="text-[11px] font-bold text-[#17232F] block">#D8BF8A</span>
                            <span className="text-[10px] text-[#65717B]">Light Gold</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#DFDED7] p-3 flex items-center gap-2.5 bg-[#F7F6F2]">
                          <div className="h-6 w-6 rounded-md bg-[#3E8066] shadow-xs" />
                          <div>
                            <span className="text-[11px] font-bold text-[#17232F] block">#3E8066</span>
                            <span className="text-[10px] text-[#65717B]">Success Sage</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#DFDED7] p-3 flex items-center gap-2.5 bg-[#F7F6F2]">
                          <div className="h-6 w-6 rounded-md bg-[#17232F] border border-[#DFDED7]" />
                          <div>
                            <span className="text-[11px] font-bold text-[#17232F] block">#17232F</span>
                            <span className="text-[10px] text-[#65717B]">Ink Navy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-[#DFDED7] bg-[#FFFFFF] p-4 shadow-sm">
              <span className="text-xs text-[#65717B]">
                Changes are updated immediately across the system.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2 text-xs font-bold text-[#FFFFFF] shadow-sm hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FFFFFF] border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
