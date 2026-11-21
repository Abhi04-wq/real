import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  Table as TableIcon,
  Plus,
  Pencil,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  UploadCloud,
  FileText,
  X,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { agentApi } from "../store";
import { Modal, Field, inputCls, ErrorBanner, Skeleton, StageBadge } from "../components/portalUi";
import { uploadImages } from "../../lib/upload";
import api from "../../lib/adminApi";
import MapLocationPicker from "../../components/MapLocationPicker";

const CHIPS = [
  ["all", "All Listings"],
  ["published", "Published"],
  ["pending", "Pending Review"],
  ["contract", "Under Contract"],
  ["sold", "Sold / Rented"]
];

const STEPS = ["Basic Info", "Location", "Specifications", "Media & Docs", "Review & Submit"];

const EMPTY = {
  title: "",
  listingType: "Sale",
  price: "",
  propertyType: "",
  description: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  zipCode: "",
  latitude: "",
  longitude: "",
  bedrooms: 0,
  bathrooms: 0,
  area: "",
  furnishingStatus: "Unfurnished",
  amenities: "",
  images: [],
  videos: "",
  documents: []
};

export default function MyProperties() {
  const [params] = useSearchParams();
  const search = params.get("search") || "";
  const [chip, setChip] = useState("all");
  const [view, setView] = useState("table");
  const [wizard, setWizard] = useState(null);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [stepErr, setStepErr] = useState("");
  const [err, setErr] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agent-props", chip, search],
    queryFn: () => agentApi.properties({
      chip: chip === "all" ? undefined : chip,
      search: search || undefined,
      limit: 50
    })
  });

  const { data: types } = useQuery({
    queryKey: ["prop-types-mini"],
    queryFn: () => api.get("/property-types").then((r) => r.data.data || [])
  });

  const rows = data?.data || [];

  const openWizard = (p) => {
    setWizard(
      p
        ? {
            ...EMPTY,
            ...p,
            propertyType: p.propertyType?._id || p.propertyType || "",
            amenities: (p.amenities || []).join(", "),
            videos: (p.videos || []).join(", ")
          }
        : { ...EMPTY }
    );
    setStep(0);
    setMaxStep(p ? 4 : 0);
    setErr("");
    setStepErr("");
    setUploadError("");
  };

  const validateStep = (s) => {
    if (s === 0) {
      if (!String(wizard.title || "").trim()) return "Step 1: Property title is mandatory.";
      if (!Number(wizard.price) || Number(wizard.price) <= 0) return "Step 1: Valid price is mandatory.";
      if (!wizard.propertyType) return "Step 1: Property category is mandatory.";
    }
    if (s === 1) {
      if (!String(wizard.city || "").trim()) return "Step 2: City is mandatory.";
      if (!String(wizard.address || "").trim()) return "Step 2: Address is mandatory.";
      if (!String(wizard.zipCode || "").trim()) return "Step 2: PIN / ZIP code is mandatory.";
    }
    if (s === 2) {
      if (!Number(wizard.bedrooms) || Number(wizard.bedrooms) < 1) return "Step 3: BHK / Bedrooms count is mandatory.";
      if (!Number(wizard.area) || Number(wizard.area) <= 0) return "Step 3: Area (sqft) is mandatory.";
    }
    if (s === 3) {
      if (!(wizard.images || []).length) return "Step 4: At least one property photo is mandatory.";
      if (!(wizard.documents || []).length) return "Step 4: At least one ownership verification document is mandatory.";
    }
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

  const onFiles = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await uploadImages(files, "properties");
      setWizard((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch (err) {
      setUploadError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onDocs = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await uploadImages(files, "verification");
      setWizard((prev) => ({ ...prev, documents: [...(prev.documents || []), ...urls] }));
    } catch (err) {
      setUploadError(err.response?.data?.message || "Document upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    setErr("");
    setBusy(true);
    try {
      const payload = {
        ...wizard,
        price: Number(wizard.price),
        bedrooms: Number(wizard.bedrooms) || 0,
        bathrooms: Number(wizard.bathrooms) || 0,
        area: Number(wizard.area) || 0,
        latitude: wizard.latitude ? Number(wizard.latitude) : undefined,
        longitude: wizard.longitude ? Number(wizard.longitude) : undefined,
        amenities: String(wizard.amenities || "").split(",").map((s) => s.trim()).filter(Boolean),
        videos: String(wizard.videos || "").split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (!payload.propertyType) delete payload.propertyType;
      if (wizard._id) await agentApi.updateProperty(wizard._id, payload);
      else await agentApi.createProperty(payload);
      setWizard(null);
      qc.invalidateQueries({ queryKey: ["agent-props"] });
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Are you sure you want to delete ${p.title}?`)) return;
    try {
      await agentApi.deleteProperty(p._id);
      refetch();
    } catch (ex) {
      alert(ex.response?.data?.message || "Delete failed");
    }
  };

  const card = (p) => (
    <div
      key={p._id}
      className="group overflow-hidden rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] hover:border-[#B9965B]/50 transition-all"
    >
      <div className="relative h-48 w-full overflow-hidden bg-[#F7F6F2]">
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#65717B]">
            <Building2 className="h-10 w-10 text-[#B9965B]/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-[#17232F] border border-[#DFDED7]">
            {p.listingType || "Sale"}
          </span>
          <span className="rounded-full bg-[#FDF5E6] backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-[#B9965B] border border-[#B9965B]/30">
            {p.propertyType?.name || "Residential"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <StageBadge value={p.approvalStatus || "Pending"} />
        </div>
      </div>

      <div className="p-4.5 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-[#17232F] truncate group-hover:text-[#B9965B] transition-colors">
              {p.title}
            </h3>
            <span className="font-mono text-[10px] text-[#65717B] bg-[#F7F6F2] px-2 py-0.5 rounded-md border border-[#DFDED7]">
              {p.propertyId}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#65717B] truncate">
            <MapPin className="h-3 w-3 text-[#B9965B] shrink-0" />
            <span>{p.city}{p.address ? `, ${p.address}` : ""}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 py-2 border-y border-[#DFDED7] text-xs text-[#65717B]">
          {p.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-[#B9965B]" />
              <b className="text-[#17232F] font-mono">{p.bedrooms}</b> BHK
            </span>
          )}
          {p.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-[#B9965B]" />
              <b className="text-[#17232F] font-mono">{p.bathrooms}</b> Ba
            </span>
          )}
          {p.area > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-[#B9965B]" />
              <b className="text-[#17232F] font-mono">{p.area}</b> sqft
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#65717B] tracking-wider block">Listing Price</span>
            <p className="text-base font-bold font-mono text-[#B9965B]">
              ₹{Number(p.price).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openWizard(p)}
              className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2 text-[#65717B] hover:text-[#17232F] hover:border-[#B9965B]/50 transition shadow-xs cursor-pointer"
              title="Edit listing"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {p.approvalStatus !== "approved" && (
              <button
                onClick={() => agentApi.submitProperty(p._id).then(refetch)}
                className="rounded-xl border border-[#B9965B] bg-[#B9965B] p-2 text-white hover:bg-[#a6844d] transition shadow-xs cursor-pointer"
                title="Submit for approval"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => del(p)}
              className="rounded-xl border border-[#B85C56]/30 bg-[#FDF0EE] p-2 text-[#B85C56] hover:bg-[#FBE4E2] transition shadow-xs cursor-pointer"
              title="Delete listing"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Top Filter Chips & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#DFDED7] shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CHIPS.map(([k, label]) => {
            const active = chip === k;
            return (
              <button
                key={k}
                onClick={() => setChip(k)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[#B9965B] text-white shadow-sm font-bold"
                    : "border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:text-[#17232F] hover:bg-[#F0EFE9]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* View Switcher & Primary Action — full-width on mobile */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setView("table")}
              title="Table view"
              className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                view === "table"
                  ? "bg-[#B9965B] text-white shadow-xs font-bold"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              title="Grid card view"
              className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                view === "grid"
                  ? "bg-[#B9965B] text-white shadow-xs font-bold"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {/* Add Property Button in Champagne Gold */}
          <button
            onClick={() => openWizard(null)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer active:scale-98 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : !rows.length ? (
        <div className="rounded-2xl border border-[#DFDED7] bg-white p-12 text-center shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B] shadow-xs mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-[#17232F]">No Properties Found</h4>
          <p className="mt-1 text-xs text-[#65717B] max-w-sm mx-auto">
            {search
              ? `No property matches for "${search}". Try searching with another keyword.`
              : "Add your first real estate listing — it goes directly to the review queue for fast verification and listing."}
          </p>
          <div className="mt-5">
            <button
              onClick={() => openWizard(null)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-4 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Property</span>
            </button>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(card)}
        </div>
      ) : (
        /* Super Admin Style Table */
        <div className="relative rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
          <div className="bg-[#F7F6F2]/80 border-b border-[#DFDED7] px-5 py-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B9965B]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">
                {rows.length} {rows.length === 1 ? "Property Listing" : "Property Listings"}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#F7F6F2]/80 border-b border-[#DFDED7]">
                  <th className="px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
                    Property Information
                  </th>
                  <th className="px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
                    Configuration
                  </th>
                  <th className="px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
                    Listing Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFDED7]">
                {rows.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-[#F9F8F5] transition-colors group"
                  >
                    {/* Property info */}
                    <td className="px-4 py-3.5 text-[#17232F] align-middle">
                      <div className="flex items-center gap-3 relative">
                        {/* Gold accent bar on hover */}
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#B9965B] opacity-0 group-hover:opacity-100 transition-opacity rounded-r" />

                        <div className="relative h-11 w-14 rounded-lg overflow-hidden border border-[#DFDED7] bg-[#F7F6F2] shrink-0 shadow-xs">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#F7F6F2] text-[#B9965B]">
                              <Building2 className="h-4.5 w-4.5 opacity-70" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            onClick={() => openWizard(p)}
                            className="font-semibold text-xs sm:text-sm text-[#17232F] group-hover:text-[#B9965B] truncate max-w-[200px] lg:max-w-[320px] leading-snug cursor-pointer transition-colors"
                            title={p.title}
                          >
                            {p.title}
                          </p>
                          <p className="text-[11px] text-[#65717B] truncate mt-0.5 font-medium">
                            <span className="font-mono text-[#B9965B]">{p.propertyId}</span>
                            <span> · </span>
                            <span>{p.city}{p.address ? `, ${p.address}` : ""}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Configuration */}
                    <td className="px-4 py-3.5 text-[#17232F] align-middle whitespace-nowrap text-xs">
                      <div className="flex items-center gap-2">
                        {p.bedrooms > 0 && <span className="font-semibold text-[#17232F]">{p.bedrooms} BHK</span>}
                        {p.area > 0 && <span className="font-mono text-[#65717B]">({p.area} sqft)</span>}
                        <span className="rounded bg-[#F7F6F2] border border-[#DFDED7] px-2 py-0.5 text-[10.5px] font-medium text-[#65717B]">
                          {p.listingType || "Sale"}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 text-[#17232F] align-middle whitespace-nowrap">
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#B9965B]">
                        ₹{Number(p.price).toLocaleString("en-IN")}
                        {p.listingType === "Rent" && (
                          <span className="text-[10px] text-[#65717B] font-normal font-sans"> /mo</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-[#17232F] align-middle whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StageBadge value={p.status || "Available"} />
                        <StageBadge value={p.approvalStatus || "Pending"} />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-[#17232F] align-middle text-right whitespace-nowrap">
                      <div className="inline-flex justify-end gap-1.5">
                        <button
                          onClick={() => openWizard(p)}
                          className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2 text-[#65717B] hover:text-[#17232F] hover:border-[#B9965B]/50 transition shadow-xs cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {p.approvalStatus !== "approved" && (
                          <button
                            title="Submit for approval"
                            onClick={() => agentApi.submitProperty(p._id).then(refetch)}
                            className="rounded-xl border border-[#B9965B] bg-[#B9965B] p-2 text-white hover:bg-[#a6844d] transition shadow-xs cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => del(p)}
                          className="rounded-xl border border-[#B85C56]/30 bg-[#FDF0EE] p-2 text-[#B85C56] hover:bg-[#FBE4E2] transition shadow-xs cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Property Creation & Edit Modal */}
      <Modal
        open={!!wizard}
        onClose={() => setWizard(null)}
        title={wizard?._id ? "Edit Property Listing" : "Add Property Listing"}
        subtitle="Manage complete property details, specs, media, and verification docs"
      >
        {wizard && (
          <div className="space-y-4">
            {/* Step indicator with gold brand palette */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isPassed = i <= maxStep;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => goStep(i)}
                    className={`flex-1 rounded-xl px-2.5 py-2 text-[11px] font-bold transition-all truncate cursor-pointer ${
                      isActive
                        ? "bg-[#B9965B] text-white shadow-sm font-bold"
                        : isPassed
                        ? "bg-[#F4EFE6] text-[#B9965B] border border-[#B9965B]/30 hover:bg-[#FDF5E6]"
                        : "bg-[#F7F6F2] text-[#65717B] border border-[#DFDED7]"
                    }`}
                  >
                    {i + 1}. {s}
                  </button>
                );
              })}
            </div>

            {err && <ErrorBanner message={err} />}
            {stepErr && (
              <div className="rounded-xl bg-[#FDF0EE] border border-[#B85C56]/30 px-3.5 py-2.5 text-xs font-semibold text-[#B85C56]">
                {stepErr}
              </div>
            )}
            {uploadError && (
              <div className="rounded-xl bg-[#FDF0EE] border border-[#B85C56]/30 px-3.5 py-2.5 text-xs font-semibold text-[#B85C56]">
                {uploadError}
              </div>
            )}

            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="space-y-3">
                <Field label="Listing Title *">
                  <input
                    required
                    className={inputCls}
                    placeholder="e.g. Skyline High-Rise Penthouse"
                    value={wizard.title}
                    onChange={(e) => setWizard({ ...wizard, title: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Property Category *">
                    <select
                      className={inputCls}
                      value={wizard.propertyType}
                      onChange={(e) => setWizard({ ...wizard, propertyType: e.target.value })}
                    >
                      <option value="">Select Category…</option>
                      {(types || []).map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Listing Type">
                    <select
                      className={inputCls}
                      value={wizard.listingType}
                      onChange={(e) => setWizard({ ...wizard, listingType: e.target.value })}
                    >
                      <option>Sale</option>
                      <option>Rent</option>
                      <option>Lease</option>
                    </select>
                  </Field>
                </div>

                <Field label="Asking Price (₹) *">
                  <input
                    required
                    type="number"
                    min="1"
                    className={inputCls}
                    placeholder="e.g. 15000000"
                    value={wizard.price}
                    onChange={(e) => setWizard({ ...wizard, price: e.target.value })}
                  />
                </Field>

                <Field label="Description & Key Highlights">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Describe architectural features, view, sunlight, furnishings, and neighborhood advantages…"
                    value={wizard.description}
                    onChange={(e) => setWizard({ ...wizard, description: e.target.value })}
                  />
                </Field>
              </div>
            )}

            {/* Step 1: Location & Coordinates */}
            {step === 1 && (
              <div className="space-y-3.5">
                <MapLocationPicker
                  latitude={wizard.latitude}
                  longitude={wizard.longitude}
                  initialCity={wizard.city}
                  initialAddress={wizard.address}
                  onChange={({ latitude, longitude }) => {
                    setWizard((prev) => ({
                      ...prev,
                      latitude,
                      longitude,
                    }));
                  }}
                  onAddressFill={(loc) => {
                    setWizard((prev) => ({
                      ...prev,
                      address: loc.address || prev.address,
                      city: loc.city || prev.city,
                      state: loc.state || prev.state,
                      zipCode: loc.zipCode || prev.zipCode,
                    }));
                  }}
                />
                <Field label="Street Address *">
                  <input
                    className={inputCls}
                    value={wizard.address}
                    onChange={(e) => setWizard({ ...wizard, address: e.target.value })}
                    placeholder="Building, street, landmark"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="City *">
                    <input
                      className={inputCls}
                      value={wizard.city}
                      onChange={(e) => setWizard({ ...wizard, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                    />
                  </Field>
                  <Field label="PIN / ZIP Code *">
                    <input
                      className={inputCls}
                      value={wizard.zipCode}
                      onChange={(e) => setWizard({ ...wizard, zipCode: e.target.value })}
                      placeholder="e.g. 400001"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="State">
                    <input
                      className={inputCls}
                      value={wizard.state}
                      onChange={(e) => setWizard({ ...wizard, state: e.target.value })}
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      className={inputCls}
                      value={wizard.country}
                      onChange={(e) => setWizard({ ...wizard, country: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 2: Specifications */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Bedrooms (BHK) *">
                    <input
                      type="number"
                      min="1"
                      className={inputCls}
                      value={wizard.bedrooms}
                      onChange={(e) => setWizard({ ...wizard, bedrooms: e.target.value })}
                    />
                  </Field>
                  <Field label="Bathrooms">
                    <input
                      type="number"
                      className={inputCls}
                      value={wizard.bathrooms}
                      onChange={(e) => setWizard({ ...wizard, bathrooms: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Carpet Area (sqft) *">
                    <input
                      type="number"
                      min="1"
                      className={inputCls}
                      value={wizard.area}
                      onChange={(e) => setWizard({ ...wizard, area: e.target.value })}
                    />
                  </Field>
                  <Field label="Furnishing State">
                    <select
                      className={inputCls}
                      value={wizard.furnishingStatus}
                      onChange={(e) => setWizard({ ...wizard, furnishingStatus: e.target.value })}
                    >
                      <option>Unfurnished</option>
                      <option>Semi-Furnished</option>
                      <option>Fully-Furnished</option>
                    </select>
                  </Field>
                </div>

                <Field label="Key Amenities (Comma Separated)">
                  <input
                    className={inputCls}
                    placeholder="Infinity Pool, Gymnasium, 24/7 Security, Clubhouse"
                    value={wizard.amenities}
                    onChange={(e) => setWizard({ ...wizard, amenities: e.target.value })}
                  />
                </Field>
              </div>
            )}

            {/* Step 3: Media & Verification Documents */}
            {step === 3 && (
              <div className="space-y-3.5">
                <div>
                  <p className="text-xs font-bold uppercase text-[#65717B] mb-1.5 tracking-wider">
                    Property Photos (Mandatory, min 1)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(wizard.images || []).map((u) => (
                      <span key={u} className="relative">
                        <img src={u} alt="Upload" className="h-18 w-22 rounded-xl border border-[#DFDED7] object-cover" />
                        <button
                          type="button"
                          onClick={() => setWizard({ ...wizard, images: wizard.images.filter((x) => x !== u) })}
                          className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#B85C56] text-[10px] text-white hover:bg-[#a54c46] cursor-pointer shadow-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <label className="grid h-18 w-22 cursor-pointer place-items-center rounded-xl border border-dashed border-[#B9965B]/50 bg-[#F7F6F2] text-xs font-bold text-[#B9965B] hover:bg-[#F4EFE6] transition">
                      <div className="text-center">
                        <UploadCloud className="h-4 w-4 mx-auto mb-0.5 text-[#B9965B]" />
                        <span className="text-[10px]">{uploading ? "…" : "+ Photos"}</span>
                      </div>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <Field label="Virtual Tour / Video Links (Comma separated)">
                  <input
                    className={inputCls}
                    placeholder="https://youtube.com/…, https://vimeo.com/…"
                    value={wizard.videos}
                    onChange={(e) => setWizard({ ...wizard, videos: e.target.value })}
                  />
                </Field>

                {/* Ownership Verification Box */}
                <div className="rounded-2xl border border-[#DFDED7] bg-[#F7F6F2] p-3.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-[#B9965B]" />
                    <p className="text-xs font-bold uppercase text-[#17232F] tracking-wider">
                      Ownership Verification Docs (Mandatory, min 1)
                    </p>
                  </div>
                  <p className="text-[11px] text-[#65717B] mb-2 leading-relaxed">
                    Upload tax receipt, registered deed, mutation certificate, or porcha for admin review.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(wizard.documents || []).map((u) => (
                      <span key={u} className="relative">
                        <span className="block max-w-36 truncate rounded-lg border border-[#DFDED7] bg-white px-2 py-1 text-[11px] font-mono text-[#17232F]">
                          📄 {u.split("/").pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setWizard({ ...wizard, documents: wizard.documents.filter((x) => x !== u) })}
                          className="absolute -right-1.5 -top-1.5 grid h-4.5 w-4.5 place-items-center rounded-full bg-[#B85C56] text-[9px] text-white hover:bg-[#a54c46] cursor-pointer shadow-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <label className="cursor-pointer rounded-xl border border-dashed border-[#B9965B]/60 bg-white px-3 py-1.5 text-xs font-bold text-[#B9965B] hover:bg-[#F4EFE6] transition">
                      {uploading ? "Uploading…" : "+ Upload Document"}
                      <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={onDocs} disabled={uploading} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary & Submit */}
            {step === 4 && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#DFDED7] bg-[#F7F6F2] p-4 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B]">
                      Summary Confirmation
                    </span>
                    <span className="font-mono font-bold text-sm text-[#B9965B]">
                      ₹{Number(wizard.price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#17232F]">{wizard.title}</p>
                  <p className="text-[#65717B] mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#B9965B]" />
                    <span>{wizard.address}, {wizard.city}</span>
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#DFDED7] flex gap-4 text-[#65717B]">
                    <span><b className="text-[#17232F]">{wizard.bedrooms}</b> Bedrooms</span>
                    <span><b className="text-[#17232F]">{wizard.bathrooms}</b> Bathrooms</span>
                    <span><b className="text-[#17232F]">{wizard.area}</b> sqft</span>
                    <span><b className="text-[#17232F]">{(wizard.images || []).length}</b> Photos</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#65717B] leading-relaxed">
                  Submitting will send this listing directly to the Super Admin review queue. You can track approval state on your dashboard and table.
                </p>
              </div>
            )}

            {/* Step Navigation Bar */}
            <div className="pt-3 border-t border-[#DFDED7] flex items-center justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => goStep(step - 1)}
                className="flex items-center gap-1 rounded-xl border border-[#DFDED7] bg-white px-4 py-2 text-xs font-bold text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] transition disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-4 py-2 text-xs font-bold text-white transition cursor-pointer shadow-md"
                >
                  Next Step <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={save}
                  className="flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {busy ? "Submitting…" : wizard._id ? "Save Listing Changes" : "Submit for Approval"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
