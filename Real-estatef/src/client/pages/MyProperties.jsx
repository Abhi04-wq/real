import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2,
  PlusCircle,
  Search,
  MapPin,
  Bed,
  Maximize2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UploadCloud,
  X,
  Sparkles,
} from "lucide-react";
import { client } from "../store";
import { Skeleton, EmptyState, StatusChip, Field, inputCls, ErrorBanner } from "../components/clientUi";
import { uploadImages } from "../../lib/upload";
import api from "../../lib/adminApi";
import MapLocationPicker from "../../components/MapLocationPicker";
import toast from "react-hot-toast";

const STEPS = ["Basic Details", "Location & Map", "Property Photos", "Verification Docs", "Review & Submit"];

export default function MyProperties() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  // Drawer state: open if ?tab=post on initial load
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => params.get("tab") === "post");

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setParams({ tab: "post" });
  };

  const closeDrawer = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDrawerOpen(false);
    nav("/home/my-properties", { replace: true });
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  // Listings data
  const { data, isLoading } = useQuery({
    queryKey: ["client-listings"],
    queryFn: client.myListings,
  });
  const rows = data?.listings || [];

  // Filter & Search states for the list
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Post Property Form State
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [stepErr, setStepErr] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    title: "",
    listingType: "Sale",
    price: "",
    bedrooms: "",
    area: "",
    propertyType: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    latitude: "",
    longitude: "",
    images: [],
    description: "",
    documents: [],
  };
  const [f, setF] = useState(initialForm);

  const { data: types } = useQuery({
    queryKey: ["prop-types-mini"],
    queryFn: () => api.get("/property-types").then((r) => r.data.data || []),
  });

  // Mandatory fields per step
  const validateStep = (s) => {
    if (s === 0) {
      if (!String(f.title || "").trim()) return "Step 1: Property title is mandatory.";
      if (!Number(f.price) || Number(f.price) <= 0) return "Step 1: Valid price is mandatory.";
      if (!f.propertyType) return "Step 1: Property category / type is mandatory.";
      if (!Number(f.bedrooms) || Number(f.bedrooms) < 1) return "Step 1: BHK / Bedrooms is mandatory.";
      if (!Number(f.area) || Number(f.area) <= 0) return "Step 1: Carpet area is mandatory.";
    }
    if (s === 1) {
      if (!String(f.city || "").trim()) return "Step 2: City is mandatory.";
      if (!String(f.address || "").trim()) return "Step 2: Address is mandatory.";
      if (!String(f.zipCode || "").trim()) return "Step 2: ZIP / PIN code is mandatory.";
    }
    if (s === 2 && !(f.images || []).length) return "Step 3: At least one property photo is mandatory.";
    if (s === 3 && !(f.documents || []).length)
      return "Step 4: At least one ownership verification document is mandatory.";
    return "";
  };

  const goStep = (i) => {
    if (i <= maxStep) {
      setStep(i);
      setStepErr("");
      return;
    }
    const problem = validateStep(step);
    if (problem) {
      setStepErr(problem);
      return;
    }
    setStepErr("");
    setMaxStep(i);
    setStep(i);
  };

  const nextStep = () => {
    const problem = validateStep(step);
    if (problem) {
      setStepErr(problem);
      return;
    }
    setStepErr("");
    setMaxStep(Math.max(maxStep, step + 1));
    setStep(step + 1);
  };

  const onFiles = (key, folder) => async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setErr("");
    try {
      const urls = await uploadImages(files, folder);
      setF({ ...f, [key]: [...(f[key] || []), ...urls] });
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch {
      setErr("Upload failed. Try smaller images.");
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submitProperty = async () => {
    setErr("");
    setBusy(true);
    try {
      if (!f.title || !f.price) throw new Error("Title and price are required");
      await client.submitListing({
        title: f.title,
        listingType: f.listingType,
        price: Number(f.price),
        propertyType: f.propertyType || undefined,
        bedrooms: Number(f.bedrooms) || 0,
        area: Number(f.area) || 0,
        address: f.address,
        city: f.city,
        state: f.state,
        country: f.country,
        zipCode: f.zipCode,
        latitude: f.latitude ? Number(f.latitude) : undefined,
        longitude: f.longitude ? Number(f.longitude) : undefined,
        images: f.images,
        documents: f.documents,
        description: f.description,
      });

      toast.success("Property listing submitted! Awaiting admin review.");
      qc.invalidateQueries({ queryKey: ["client-listings"] });

      // Reset form and close drawer
      setF(initialForm);
      setStep(0);
      setMaxStep(0);
      closeDrawer();
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message);
      toast.error(ex.response?.data?.message || "Failed to submit property");
    } finally {
      setBusy(false);
    }
  };

  // Filtered rows for listing view
  const filteredRows = rows.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.propertyId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && p.approvalStatus === "pending") ||
      (statusFilter === "approved" && p.approvalStatus === "approved") ||
      (statusFilter === "rejected" && p.approvalStatus === "rejected");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#DFDED7] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F4EFE6] text-[#B9965B]">
              <Building2 className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-[#17232F] tracking-tight">My Properties</h1>
            <span className="rounded-full bg-[#F7F6F2] px-2.5 py-0.5 text-xs font-bold text-[#65717B] border border-[#DFDED7]">
              {rows.length} Listed
            </span>
          </div>
          <p className="mt-1 text-xs text-[#65717B]">
            Manage your active and pending real estate listings, or open the drawer to post a new property.
          </p>
        </div>

        {/* Action Button: Opens Drawer */}
        <button
          type="button"
          onClick={openDrawer}
          className="rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Property
        </button>
      </div>

      {/* Main Listings Workspace */}
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        {rows.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#DFDED7] bg-white p-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#65717B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, city, or property ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#B9965B] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-[#DFDED7] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#B9965B]"
              >
                <option value="all">All Approval Statuses</option>
                <option value="approved">Active / Approved</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={openDrawer}
                className="rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + New Listing
              </button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : !rows.length ? (
          <EmptyState
            icon="🏢"
            title="No properties listed yet"
            hint="Post your first residential, commercial, or plot listing for Super Admin review."
            action={
              <button
                type="button"
                onClick={openDrawer}
                className="rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
              >
                <PlusCircle className="w-4 h-4" /> Open Post Property Drawer
              </button>
            }
          />
        ) : !filteredRows.length ? (
          <p className="text-center py-12 text-xs text-[#65717B]">No properties matching your search filter.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((p) => {
              const cover = p.images?.[0];
              return (
                <div
                  key={p._id}
                  className="overflow-hidden rounded-2xl border border-[#DFDED7] bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {cover ? (
                      <div className="relative h-44 w-full overflow-hidden bg-[#F7F6F2]">
                        <img
                          src={cover}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-lg bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                          {p.propertyId || "ID"}
                        </span>
                      </div>
                    ) : (
                      <div className="grid h-44 place-items-center bg-[#F7F6F2] text-3xl">🏠</div>
                    )}

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-[#17232F] text-sm truncate">{p.title}</p>
                        <span className="text-xs font-bold text-[#B9965B] font-mono shrink-0">
                          ₹{Number(p.price || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {p.city && (
                        <p className="text-xs text-[#65717B] mt-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#65717B] shrink-0" />
                          {p.address ? `${p.address}, ` : ""}
                          {p.city}
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center gap-3 text-xs text-[#65717B] border-t border-[#DFDED7] pt-2">
                        {p.bedrooms ? (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-[#65717B]" /> {p.bedrooms} BHK
                          </span>
                        ) : null}
                        {p.area ? (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5 text-[#65717B]" /> {p.area} sqft
                          </span>
                        ) : null}
                        <span className="ml-auto text-[11px] font-semibold text-[#65717B] capitalize">
                          {p.listingType || "Sale"}
                        </span>
                      </div>

                      {/* Approval & Availability Status Chips */}
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <StatusChip
                          value={
                            p.approvalStatus === "pending"
                              ? "Pending Review"
                              : p.approvalStatus === "approved"
                              ? "Active / Approved"
                              : p.approvalStatus === "rejected"
                              ? "Rejected"
                              : p.approvalStatus
                          }
                        />

                        {p.approvalStatus === "approved" && ["Reserved", "Sold", "Rented"].includes(p.status) && (
                          <StatusChip value={p.status === "Reserved" ? "Under Contract" : p.status} />
                        )}
                      </div>

                      {/* Rejection Cause alert if rejected */}
                      {p.approvalStatus === "rejected" && p.rejectionReason && (
                        <div className="mt-2.5 p-2 bg-[#FDF0EE] border border-[#B85C56]/30 rounded-lg text-xs text-[#B85C56]">
                          <p className="font-bold">Admin Review Note:</p>
                          <p className="mt-0.5 text-[11px]">{p.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-Over Drawer for Posting Property */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-[#17232F]/50 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer container from right */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 pointer-events-none">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-screen max-w-lg bg-white shadow-[0_20px_50px_rgba(23,35,47,0.18)] flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#DFDED7] px-5 py-4 bg-[#F7F6F2]/90 shrink-0">
                <div className="min-w-0 pr-2">
                  <h2 className="text-base font-bold text-[#17232F] flex items-center gap-2 truncate">
                    <PlusCircle className="w-5 h-5 text-[#B9965B] shrink-0" />
                    Post New Property
                  </h2>
                  <p className="text-xs text-[#65717B] mt-0.5">
                    Step {step + 1} of 5: {STEPS[step]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-xl border border-[#DFDED7] bg-white p-2 text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] transition-colors cursor-pointer shadow-xs shrink-0"
                  aria-label="Close drawer"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress step indicators */}
              <div className="flex gap-1 px-6 pt-3 pb-2 border-b border-[#DFDED7] bg-[#F7F6F2]/50 overflow-x-auto">
                {STEPS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => goStep(i)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      i === step
                        ? "bg-[#B9965B] text-white shadow-xs"
                        : i <= maxStep
                        ? "bg-[#F4EFE6] text-[#B9965B] border border-[#B9965B]/30"
                        : "bg-white text-[#65717B] border border-[#DFDED7]"
                    }`}
                  >
                    {i + 1}. {s}
                  </button>
                ))}
              </div>

              {/* Drawer Body (Scrollable form content) */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {stepErr && (
                  <p className="rounded-xl bg-[#FDF0EE] px-3 py-2 text-xs font-bold text-[#B85C56] border border-[#B85C56]/30">
                    {stepErr} — please complete required fields (*) before continuing.
                  </p>
                )}

                <ErrorBanner message={err} />

                {/* Step 0: Basic Details */}
                {step === 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Property Title *">
                        <input
                          className={inputCls}
                          value={f.title}
                          onChange={(e) => setF({ ...f, title: e.target.value })}
                          placeholder="e.g. Luxurious 3BHK Penthouse with Terrace"
                        />
                      </Field>
                    </div>
                    <Field label="Listing Type">
                      <select
                        className={inputCls}
                        value={f.listingType}
                        onChange={(e) => setF({ ...f, listingType: e.target.value })}
                      >
                        <option>Sale</option>
                        <option>Rent</option>
                        <option>Lease</option>
                      </select>
                    </Field>
                    <Field label="Property Category *">
                      <select
                        className={inputCls}
                        value={f.propertyType || ""}
                        onChange={(e) => setF({ ...f, propertyType: e.target.value })}
                      >
                        <option value="">Select category…</option>
                        {(types || []).map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="BHK / Bedrooms *">
                      <input
                        type="number"
                        min="1"
                        className={inputCls}
                        value={f.bedrooms}
                        onChange={(e) => setF({ ...f, bedrooms: e.target.value })}
                        placeholder="3"
                      />
                    </Field>
                    <Field label="Price (₹) *">
                      <input
                        type="number"
                        min="1"
                        className={inputCls}
                        value={f.price}
                        onChange={(e) => setF({ ...f, price: e.target.value })}
                        placeholder="7500000"
                      />
                    </Field>
                    <Field label="Carpet Area (sqft) *">
                      <input
                        type="number"
                        min="1"
                        className={inputCls}
                        value={f.area}
                        onChange={(e) => setF({ ...f, area: e.target.value })}
                        placeholder="1850"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Property Description">
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={f.description}
                          onChange={(e) => setF({ ...f, description: e.target.value })}
                          placeholder="Highlight architectural finishes, views, neighborhood, and amenities..."
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Step 1: Location & Interactive Map Pin */}
                {step === 1 && (
                  <div className="space-y-4">
                    <MapLocationPicker
                      latitude={f.latitude}
                      longitude={f.longitude}
                      initialCity={f.city}
                      initialAddress={f.address}
                      onChange={({ latitude, longitude }) => {
                        setF((prev) => ({
                          ...prev,
                          latitude,
                          longitude,
                        }));
                      }}
                      onAddressFill={(loc) => {
                        setF((prev) => ({
                          ...prev,
                          address: loc.address || prev.address,
                          city: loc.city || prev.city,
                          state: loc.state || prev.state,
                          zipCode: loc.zipCode || prev.zipCode,
                        }));
                      }}
                    />

                    <div className="grid gap-3 sm:grid-cols-2 pt-1">
                      <div className="sm:col-span-2">
                        <Field label="Address *">
                          <input
                            className={inputCls}
                            value={f.address}
                            onChange={(e) => setF({ ...f, address: e.target.value })}
                            placeholder="e.g. Flat 302, Green Valley Apartments"
                          />
                        </Field>
                      </div>
                      <Field label="City *">
                        <input
                          className={inputCls}
                          value={f.city}
                          onChange={(e) => setF({ ...f, city: e.target.value })}
                          placeholder="e.g. Bardhaman / Kolkata"
                        />
                      </Field>
                      <Field label="State">
                        <input
                          className={inputCls}
                          value={f.state}
                          onChange={(e) => setF({ ...f, state: e.target.value })}
                          placeholder="e.g. West Bengal"
                        />
                      </Field>
                      <Field label="ZIP / PIN Code *">
                        <input
                          className={inputCls}
                          value={f.zipCode}
                          onChange={(e) => setF({ ...f, zipCode: e.target.value })}
                          placeholder="e.g. 713101"
                        />
                      </Field>
                      <Field label="Country">
                        <input
                          className={inputCls}
                          value={f.country}
                          onChange={(e) => setF({ ...f, country: e.target.value })}
                        />
                      </Field>

                      <Field label="Latitude (Auto-filled from map pin)">
                        <input
                          type="number"
                          step="any"
                          className={`${inputCls} bg-[#F7F6F2] font-mono text-[#B9965B] font-semibold`}
                          value={f.latitude}
                          onChange={(e) => setF({ ...f, latitude: e.target.value })}
                          placeholder="Drop pin on map"
                        />
                      </Field>
                      <Field label="Longitude (Auto-filled from map pin)">
                        <input
                          type="number"
                          step="any"
                          className={`${inputCls} bg-[#F7F6F2] font-mono text-[#B9965B] font-semibold`}
                          value={f.longitude}
                          onChange={(e) => setF({ ...f, longitude: e.target.value })}
                          placeholder="Drop pin on map"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Step 2: Property Photos */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2.5">
                      {f.images.map((u, idx) => (
                        <div key={u} className="relative group">
                          <img src={u} className="h-24 w-28 rounded-xl border object-cover shadow-xs" alt="Property" />
                          <button
                            type="button"
                            onClick={() => setF({ ...f, images: f.images.filter((_, i) => i !== idx) })}
                            className="absolute -top-1.5 -right-1.5 rounded-full bg-[#B85C56] text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-xs hover:bg-[#B85C56]/90"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <label className="grid h-24 w-28 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-[#DFDED7] text-xs text-[#65717B] hover:border-[#B9965B] hover:text-[#B9965B] transition-colors">
                        <span className="text-center p-2">
                          <UploadCloud className="w-5 h-5 mx-auto mb-1 text-[#65717B]" />
                          {uploading ? "Uploading…" : "+ Photos"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={onFiles("images", "properties")}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-[#65717B]">
                      Upload high-res photos and floor plans (mandatory, min 1 photo). The first photo will act as the
                      cover.
                    </p>
                  </div>
                )}

                {/* Step 3: Verification Docs */}
                {step === 3 && (
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 rounded-xl bg-[#FDF5E6] px-3 py-2 text-xs text-[#B98235] border border-[#B98235]/30">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[#B98235]" />
                      Mandatory (min 1 document). Visible only to Super Admin for ownership verification. Never displayed
                      publicly.
                    </p>

                    <label className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-[#DFDED7] px-4 py-8 text-sm text-[#65717B] hover:border-[#B9965B] hover:text-[#B9965B] transition-colors">
                      <span className="text-center">
                        <UploadCloud className="w-8 h-8 mx-auto mb-2 text-[#65717B]" />
                        {uploading ? "Uploading proof…" : "+ Upload Tax Receipt / Porcha / Title Deed (images)"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onFiles("documents", "verification")}
                        disabled={uploading}
                      />
                    </label>

                    {f.documents.map((u, idx) => (
                      <div
                        key={u}
                        className="flex items-center justify-between text-xs text-[#B9965B] p-2 bg-[#F4EFE6] rounded-lg border border-[#B9965B]/30"
                      >
                        <span>✓ {u.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => setF({ ...f, documents: f.documents.filter((_, i) => i !== idx) })}
                          className="text-[#B85C56] font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 4: Review & Submit */}
                {step === 4 && (
                  <div className="rounded-xl bg-[#F7F6F2] p-4 text-sm space-y-2 border border-[#DFDED7]">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#17232F] text-base">{f.title || "Untitled Property"}</p>
                      <p className="font-bold text-[#B9965B] font-mono text-base">
                        ₹{Number(f.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-xs text-[#65717B]">
                      {f.address}, {f.city} · {f.bedrooms} BHK · {f.area} sqft
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#65717B] pt-2 border-t border-[#DFDED7]">
                      <span>📸 {f.images.length} photo(s) attached</span>
                      <span>📄 {f.documents.length} verification doc(s)</span>
                    </div>
                    <p className="pt-2 text-[11px] text-[#65717B]">
                      Upon submission, your listing will enter the Super Admin approval queue. It will be published live
                      once title verification is complete.
                    </p>
                  </div>
                )}
              </div>

              {/* Drawer Footer Controls */}
              <div className="border-t border-[#DFDED7] px-6 py-4 bg-[#F7F6F2]/90 flex items-center justify-between">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => goStep(step - 1)}
                  className="flex items-center gap-1 rounded-xl border border-[#DFDED7] bg-white px-4 py-2 text-xs font-semibold text-[#65717B] hover:bg-[#F7F6F2] disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="rounded-xl border border-[#DFDED7] bg-white px-3.5 py-2 text-xs font-semibold text-[#65717B] hover:bg-[#F7F6F2] cursor-pointer"
                  >
                    Cancel
                  </button>

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={submitProperty}
                      className="rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-6 py-2 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {busy ? "Submitting for Review…" : "Submit Property Listing"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
