import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../lib/adminApi";
import { uploadImages } from "../../lib/upload";
import {
  Modal,
  Field,
  inputCls,
  useConfirm,
  ConfirmDialog,
  FormSection,
  FormActions,
} from "../components/ui";
import {
  Eye,
  Pencil,
  Check,
  X,
  Trash2,
  BedDouble,
  Bath,
  Maximize2,
  Sofa,
  MapPin,
  ShieldCheck,
  FileText,
  ExternalLink,
  User,
  Briefcase,
  CheckCircle2,
  Home,
  Upload,
  Plus,
  Search,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";

const EMPTY = {
  title: "",
  description: "",
  listingType: "Sale",
  price: 0,
  address: "",
  city: "",
  state: "",
  country: "India",
  zipCode: "",
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  furnishingStatus: "Unfurnished",
  status: "Pending",
  propertyType: "",
  owner: "",
  assignedAgent: "",
};

// Refined Luxury Status Badge Component
function PropertyStatusPill({ status, type = "market" }) {
  const val = String(status || "").toLowerCase();

  let dotColor = "bg-[#3E8066]";
  let pillStyle = "bg-[#EBF3EF] text-[#3E8066] border-[#71877B]/30";

  if (["available", "approved"].includes(val)) {
    dotColor = "bg-[#3E8066]";
    pillStyle = "bg-[#EBF3EF] text-[#3E8066] border-[#71877B]/30";
  } else if (["pending", "reserved"].includes(val)) {
    dotColor = "bg-[#B98235]";
    pillStyle = "bg-[#FDF5E6] text-[#B98235] border-[#B98235]/30";
  } else if (["rejected", "inactive", "failed"].includes(val)) {
    dotColor = "bg-[#B85C56]";
    pillStyle = "bg-[#FDF0EE] text-[#B85C56] border-[#B85C56]/30";
  } else if (["sold"].includes(val)) {
    dotColor = "bg-[#7799B4]";
    pillStyle = "bg-[#F0F4F8] text-[#7799B4] border-[#7799B4]/30";
  } else if (["rented", "booked"].includes(val)) {
    dotColor = "bg-[#B9965B]";
    pillStyle = "bg-[#FDF5E6] text-[#B9965B] border-[#B9965B]/30";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-semibold uppercase tracking-wider border ${pillStyle}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{status || (type === "approval" ? "Pending" : "Available")}</span>
    </span>
  );
}

export default function Properties({
  canApprove = true,
  canDelete = true,
  canCreate = true,
  canEdit = true,
}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    approvalStatus: "",
    listingType: "",
  });
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [form, setForm] = useState(null);
  const [types, setTypes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [details, setDetails] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const confirm = useConfirm();

  // Load properties with query params
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/properties", {
        params: { page, limit: 10, search, ...filters },
      });
      setRows(data.data || []);
      setMeta({
        page: data.page || page,
        totalPages: data.totalPages || 1,
        total: data.total || data.data?.length || 0,
      });
    } catch (err) {
      toast.error("Failed to load properties catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get("/property-types")
      .then(({ data }) => setTypes(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
  }, [search, filters]);

  // Sort handler
  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!rows || !rows.length || !sortKey) return rows || [];
    return [...rows].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === "propertyType") {
        aVal = a.propertyType?.name || "";
        bVal = b.propertyType?.name || "";
      }
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDirection]);

  // Image upload
  const onFiles = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await uploadImages(files, "properties");
      setForm({ ...form, images: [...(form.images || []), ...urls] });
    } catch (err) {
      setUploadError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) =>
    setForm({
      ...form,
      images: (form.images || []).filter((u) => u !== url),
    });

  // Details drawer
  const openDetails = async (p) => {
    const id = typeof p === "object" && p !== null ? p._id : p;
    setSelectedImage(null);
    if (typeof p === "object" && p !== null) setDetails(p);
    try {
      const { data } = await api.get(`/properties/${id}`);
      if (data?.property) setDetails(data.property);
      else if (typeof p !== "object") toast.error("Property details not found");
    } catch (err) {
      if (typeof p !== "object") setDetails(null);
      toast.error(err.response?.data?.message || "Failed to load property details");
    }
  };

  // Save form
  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
    };
    ["propertyType", "owner", "assignedAgent"].forEach((k) => {
      if (!payload[k]) delete payload[k];
    });

    try {
      if (form._id) {
        await api.put(`/properties/${form._id}`, payload);
        toast.success(`Property "${form.title}" updated`);
      } else {
        await api.post("/properties", payload);
        toast.success("New property published successfully");
      }
      setForm(null);
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save property");
    }
  };

  return (
    <div className="space-y-5 text-[#17232F]">
      {/* 1. SOPHISTICATED SEARCH AND FILTER TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#DFDED7] shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
        {/* Left Filter Cluster */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative w-full sm:w-64 lg:w-72">
            <Search className="w-4 h-4 text-[#B9965B] absolute left-3.5 top-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, ID, or city..."
              className="w-full h-10 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] pl-9.5 pr-3 text-xs sm:text-sm text-[#17232F] placeholder-[#929A9D] outline-none transition-all hover:border-[#B9965B]/40 focus:border-[#B9965B] focus:ring-1 focus:ring-[#B9965B]/30"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="h-10 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3 text-xs font-semibold text-[#17232F] outline-none transition-all hover:border-[#B9965B]/40 focus:border-[#B9965B] cursor-pointer"
            title="Filter by market status"
          >
            <option value="">All Statuses</option>
            {["Available", "Sold", "Rented", "Reserved", "Pending", "Inactive"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Approval Filter */}
          <select
            value={filters.approvalStatus}
            onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
            className="h-10 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3 text-xs font-semibold text-[#17232F] outline-none transition-all hover:border-[#B9965B]/40 focus:border-[#B9965B] cursor-pointer"
            title="Filter by approval status"
          >
            <option value="">All Approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Listing Type Filter */}
          <select
            value={filters.listingType}
            onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
            className="h-10 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3 text-xs font-semibold text-[#17232F] outline-none transition-all hover:border-[#B9965B]/40 focus:border-[#B9965B] cursor-pointer"
            title="Filter by listing model"
          >
            <option value="">All Models</option>
            <option value="Sale">Sale</option>
            <option value="Rent">Rent</option>
            <option value="Lease">Lease</option>
          </select>
        </div>

        {/* Right Controls: Total Records Badge + Add Button */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <div className="h-10 inline-flex items-center gap-2 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3 text-xs font-mono font-bold text-[#65717B]">
            <span className="h-2 w-2 rounded-full bg-[#3E8066] animate-pulse" />
            <span className="text-[#17232F]">{sortedRows.length}</span>
            <span className="text-[10.5px] text-[#B9965B] uppercase">
              {sortedRows.length === 1 ? "Property" : "Properties"}
            </span>
          </div>

          {canCreate && (
            <button
              onClick={() => {
                setUploadError("");
                setForm({ ...EMPTY });
              }}
              className="h-10 inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white px-4 text-xs font-bold shadow-xs active:translate-y-0.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add New Property</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. COMPLETELY REDESIGNED PROPERTIES TABLE CONTAINER */}
      <div className="relative rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#DFDED7] scrollbar-track-transparent">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header (Sticky, Uppercase, Muted Slate-Gray, Subdued Border) */}
            <thead className="sticky top-0 z-10 bg-[#F7F6F2]/95 backdrop-blur-xl border-b border-[#DFDED7]">
              <tr>
                {/* PROPERTY COLUMN */}
                <th
                  onClick={() => handleSort("title")}
                  className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B] select-none cursor-pointer hover:text-[#17232F] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>PROPERTY</span>
                    {sortKey === "title" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#B9965B]" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#B9965B]" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* TYPE COLUMN */}
                <th
                  onClick={() => handleSort("propertyType")}
                  className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B] select-none cursor-pointer hover:text-[#17232F] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>TYPE</span>
                    {sortKey === "propertyType" && (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#B9965B]" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#B9965B]" />
                      )
                    )}
                  </div>
                </th>

                {/* PRICE COLUMN */}
                <th
                  onClick={() => handleSort("price")}
                  className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B] select-none cursor-pointer hover:text-[#17232F] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>PRICE</span>
                    {sortKey === "price" && (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#B9965B]" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#B9965B]" />
                      )
                    )}
                  </div>
                </th>

                {/* STATUS COLUMN */}
                <th
                  onClick={() => handleSort("status")}
                  className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B] select-none cursor-pointer hover:text-[#17232F] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>STATUS</span>
                    {sortKey === "status" && (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#B9965B]" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#B9965B]" />
                      )
                    )}
                  </div>
                </th>

                {/* ACTIONS COLUMN */}
                <th className="py-3.5 px-4 text-right font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">
                  ACTIONS
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DFDED7]">
              {loading ? (
                // Loading Skeletons
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-14 rounded-lg bg-[#F7F6F2]" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-36 rounded bg-[#F7F6F2]" />
                          <div className="h-2.5 w-24 rounded bg-[#F7F6F2]" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 w-28 rounded bg-[#F7F6F2]" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-20 rounded bg-[#F7F6F2]" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-28 rounded-full bg-[#F7F6F2]" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <div className="h-8 w-8 rounded-xl bg-[#F7F6F2]" />
                        <div className="h-8 w-8 rounded-xl bg-[#F7F6F2]" />
                        <div className="h-8 w-8 rounded-xl bg-[#F7F6F2]" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : sortedRows.length === 0 ? (
                // Refined Empty State
                <tr>
                  <td colSpan={5} className="py-16 px-4 text-center">
                    <div className="mx-auto mb-3 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B]">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-[#17232F]">No Properties Found</p>
                    <p className="mt-1 text-xs text-[#65717B] max-w-sm mx-auto">
                      No listings match your search or active filters. Try adjusting the filter criteria above.
                    </p>
                  </td>
                </tr>
              ) : (
                // Structured Enterprise Property Rows
                sortedRows.map((p, i) => (
                  <motion.tr
                    key={p._id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="group relative transition-colors duration-150 bg-white hover:bg-[#F9F8F5]"
                  >
                    {/* PROPERTY CELL */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-3 relative">
                        {/* Thin champagne gold indicator bar on hover */}
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#B9965B] opacity-0 group-hover:opacity-100 transition-opacity rounded-r" />

                        {/* Property Thumbnail */}
                        <div className="relative h-11 w-14 rounded-lg overflow-hidden border border-[#DFDED7] bg-[#F7F6F2] shrink-0 shadow-xs">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#F7F6F2] text-[#B9965B]">
                              <Home className="h-4.5 w-4.5 opacity-70" />
                            </div>
                          )}
                        </div>

                        {/* Title, Property ID, City */}
                        <div className="min-w-0">
                          <p
                            className="font-semibold text-xs sm:text-sm text-[#17232F] truncate max-w-[200px] lg:max-w-[280px] leading-snug cursor-pointer hover:text-[#B9965B] transition-colors"
                            onClick={() => openDetails(p)}
                            title={p.title}
                          >
                            {p.title}
                          </p>
                          <p className="text-[11px] text-[#65717B] truncate mt-0.5 font-medium">
                            <span className="font-mono text-[#B9965B] font-semibold">{p.propertyId || "PRP-00"}</span>
                            <span> · </span>
                            <span>{p.city || "Metropolitan"}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PROPERTY TYPE CELL */}
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <div className="text-xs">
                        <span className="font-semibold text-[#17232F]">
                          {p.propertyType?.name || "Residential"}
                        </span>
                        <span className="text-[#DFDED7] font-medium"> · </span>
                        <span className="text-[#B9965B] font-medium text-[11.5px]">
                          {p.listingType || "Sale"}
                        </span>
                      </div>
                    </td>

                    {/* PRICE CELL */}
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#17232F]">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                        {p.listingType === "Rent" && (
                          <span className="text-[10px] text-[#65717B] font-normal font-sans"> /mo</span>
                        )}
                      </div>
                    </td>

                    {/* STATUS CELL */}
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <PropertyStatusPill status={p.status} type="market" />
                        <PropertyStatusPill
                          status={p.approvalStatus || "Pending"}
                          type="approval"
                        />
                      </div>
                    </td>

                    {/* ACTIONS CELL */}
                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => openDetails(p)}
                          title="View property details"
                          aria-label="View property details"
                          className="h-8.5 w-8.5 rounded-xl bg-[#F7F6F2] border border-[#DFDED7] text-[#65717B] hover:text-[#17232F] hover:border-[#B9965B]/50 hover:bg-[#F0EFE9] transition flex items-center justify-center cursor-pointer shadow-2xs active:translate-y-0.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit Button */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...EMPTY,
                                ...p,
                                propertyType: p.propertyType?._id || "",
                                owner: p.owner?._id || "",
                                assignedAgent: p.assignedAgent?._id || "",
                              })
                            }
                            title="Edit property listing"
                            aria-label="Edit property listing"
                            className="h-8.5 w-8.5 rounded-xl bg-[#F7F6F2] border border-[#DFDED7] text-[#65717B] hover:text-[#B9965B] hover:border-[#B9965B]/50 hover:bg-[#F0EFE9] transition flex items-center justify-center cursor-pointer shadow-2xs active:translate-y-0.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Approve Button (when pending) */}
                        {canApprove &&
                          !["approved", "rejected"].includes(
                            (p.approvalStatus || "pending").toLowerCase()
                          ) && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await api.post(`/properties/${p._id}/approve`);
                                  toast.success(`"${p.title}" approved`);
                                  load(meta.page);
                                } catch (err) {
                                  toast.error(
                                    err.response?.data?.message || "Failed to approve property"
                                  );
                                }
                              }}
                              title="Approve property"
                              aria-label="Approve property"
                              className="h-8.5 w-8.5 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 text-[#3E8066] hover:bg-[#DFEDE6] transition flex items-center justify-center cursor-pointer shadow-2xs active:translate-y-0.5"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}

                        {/* Reject Button (when pending) */}
                        {canApprove &&
                          !["approved", "rejected"].includes(
                            (p.approvalStatus || "pending").toLowerCase()
                          ) && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await api.post(`/properties/${p._id}/reject`);
                                  toast.success(`"${p.title}" rejected`);
                                  load(meta.page);
                                } catch (err) {
                                  toast.error(
                                    err.response?.data?.message || "Failed to reject property"
                                  );
                                }
                              }}
                              title="Reject property"
                              aria-label="Reject property"
                              className="h-8.5 w-8.5 rounded-xl bg-[#FDF5E6] border border-[#B98235]/30 text-[#B98235] hover:bg-[#FCECD0] transition flex items-center justify-center cursor-pointer shadow-2xs active:translate-y-0.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}

                        {/* Delete Button */}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              confirm.ask(async () => {
                                await api.delete(`/properties/${p._id}`);
                                toast.success(`Property deleted`);
                                load(meta.page);
                              }, `Permanently delete "${p.title}"? This action cannot be reversed.`)
                            }
                            title="Delete property"
                            aria-label="Delete property"
                            className="h-8.5 w-8.5 rounded-xl bg-[#FDF0EE] border border-[#B85C56]/30 text-[#B85C56] hover:bg-[#FBE4E2] transition flex items-center justify-center cursor-pointer shadow-2xs active:translate-y-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. INTEGRATED LUXURY TABLE FOOTER & PAGINATION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-[#F7F6F2]/70 border-t border-[#DFDED7] text-xs text-[#65717B]">
          <div className="flex items-center gap-2">
            <span>
              Showing Page <span className="font-bold text-[#17232F] font-mono">{meta.page}</span> of{" "}
              <span className="font-bold text-[#17232F] font-mono">{meta.totalPages}</span>
            </span>
            <span>•</span>
            <span className="text-[#B9965B]">
              <span className="font-mono font-bold text-[#17232F]">{meta.total}</span> Total Listings
            </span>
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                disabled={meta.page <= 1}
                onClick={() => load(meta.page - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-[#DFDED7] bg-white px-3 py-1.5 text-xs font-semibold text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(meta.totalPages, 5))].map((_, idx) => {
                  let pNum = idx + 1;
                  if (meta.totalPages > 5 && meta.page > 3) {
                    pNum = Math.min(meta.page - 2 + idx, meta.totalPages);
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => load(pNum)}
                      className={`h-7 w-7 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                        meta.page === pNum
                          ? "bg-[#B9965B] text-white shadow-xs"
                          : "text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F]"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => load(meta.page + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-[#DFDED7] bg-white px-3 py-1.5 text-xs font-semibold text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. ADD / EDIT PROPERTY MODAL */}
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?._id ? "Edit Property Listing" : "Add New Property"}
        subtitle="Configure listing specifications, market pricing, geographic location, and media assets"
        wide
        footer={
          form && (
            <div className="flex items-center justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-4 py-2.5 text-xs font-semibold text-[#65717B] hover:bg-[#F0EFE9] hover:text-[#17232F] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="property-form"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#a6844d] transition cursor-pointer"
              >
                <span>{form._id ? "Update Property" : "Publish Property"}</span>
              </button>
            </div>
          )
        }
      >
        {form && (
          <form id="property-form" onSubmit={save} className="space-y-4">
            <FormSection
              icon={Home}
              title="General Property Information"
              description="Property title, pricing, listing model and architectural category"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Property Title" required>
                    <input
                      required
                      className={inputCls}
                      placeholder="e.g. Luxury 3BHK Penthouse with Lake View"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Pricing (₹)" required hint="Numeric in INR">
                  <input
                    required
                    type="number"
                    min="0"
                    className={inputCls}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </Field>
                <Field label="Property Category" required>
                  <select
                    className={inputCls}
                    value={form.propertyType || ""}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {types.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Listing Model" required>
                  <select
                    className={inputCls}
                    value={form.listingType}
                    onChange={(e) => setForm({ ...form, listingType: e.target.value })}
                  >
                    <option value="Sale">Sale</option>
                    <option value="Rent">Rent</option>
                    <option value="Lease">Lease</option>
                  </select>
                </Field>
                <Field label="Market Status" required>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {["Available", "Sold", "Rented", "Reserved", "Pending", "Inactive"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={MapPin}
              title="Location & Address"
              description="Physical property address, city, state and postal PIN code"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Street / Building Address" required>
                    <input
                      className={inputCls}
                      placeholder="e.g. Tower 3, Flat 1202, Silver Spring Complex, EM Bypass"
                      value={form.address || ""}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="City" required>
                  <input
                    className={inputCls}
                    placeholder="e.g. Mumbai"
                    value={form.city || ""}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>
                <Field label="State / Province">
                  <input
                    className={inputCls}
                    placeholder="e.g. Maharashtra"
                    value={form.state || ""}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </Field>
                <Field label="Postal / ZIP Code">
                  <input
                    className={inputCls}
                    placeholder="e.g. 400001"
                    value={form.zipCode || ""}
                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={Maximize2}
              title="Specifications & Dimensions"
              description="Bedrooms, bathrooms, carpet area and furnishing status"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Bedrooms (BHK)">
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  />
                </Field>
                <Field label="Bathrooms">
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  />
                </Field>
                <Field label="Area (Sq Ft)" hint="Built-up / Carpet">
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </Field>
                <Field label="Furnishing State">
                  <select
                    className={inputCls}
                    value={form.furnishingStatus}
                    onChange={(e) => setForm({ ...form, furnishingStatus: e.target.value })}
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={Upload}
              title="Photo Gallery & Marketing"
              description="Upload high-definition photos and write an enticing description"
            >
              <Field label="Property Photos" hint={`${(form.images || []).length} photos uploaded`}>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {(form.images || []).map((u) => (
                      <span key={u} className="relative group">
                        <img
                          src={u}
                          className="h-20 w-24 rounded-xl object-cover border border-[#29374B] shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(u)}
                          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md hover:bg-rose-700 transition"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <label className="flex h-20 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#29374B] bg-[#0F1622] text-xs font-semibold text-[#9BA9BC] hover:border-[#86A9D8] hover:bg-[#1D2A3D]/40 hover:text-[#86A9D8] transition">
                      <Upload className="h-5 w-5 mb-1 text-[#86A9D8]" />
                      <span className="text-[11px]">{uploading ? "Uploading..." : "+ Add"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onFiles}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {uploadError && <p className="text-xs text-rose-400">{uploadError}</p>}
                </div>
              </Field>

              <div className="pt-2 border-t border-[#29374B]">
                <Field label="Detailed Description">
                  <textarea
                    className={inputCls}
                    rows={4}
                    placeholder="Describe amenities, nearby landmarks, security features, sunlight, and connectivity..."
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>
          </form>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirm.open}
        onClose={confirm.close}
        onConfirm={confirm.confirm}
        message={confirm.message}
      />

      {/* 5. PROPERTY DETAILS DRAWER */}
      <Modal
        open={!!details}
        onClose={() => {
          setDetails(null);
          setSelectedImage(null);
        }}
        title={details ? details.propertyId || "Property Details" : "Property Details"}
        subtitle={
          details ? `${details.propertyType?.name || "Property"} • ${details.listingType}` : ""
        }
        size="md"
      >
        {details && (
          <div className="space-y-4 text-sm text-[#17232F]">
            {/* Hero Image Showcase */}
            <div className="relative overflow-hidden rounded-2xl border border-[#DFDED7] bg-white shadow-xs">
              {(details.images || []).length > 0 ? (
                <div className="relative h-56 w-full overflow-hidden bg-[#F7F6F2]">
                  <img
                    src={selectedImage || details.images[0]}
                    alt={details.title}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Price Tag */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="rounded-xl border border-[#DFDED7] bg-white/95 backdrop-blur-md px-3.5 py-1 font-mono text-base font-bold text-[#17232F] shadow-md">
                      ₹{Number(details.price).toLocaleString("en-IN")}
                      {details.listingType === "Rent" && (
                        <span className="text-xs text-[#65717B] font-normal"> /mo</span>
                      )}
                    </span>
                  </div>

                  {/* Listing Type Tag */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="rounded-lg border border-[#DFDED7] bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider text-[#17232F] shadow-xs">
                      {details.listingType === "Rent" ? "For Rent" : "For Sale"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-44 w-full flex-col items-center justify-center bg-[#F7F6F2] text-[#65717B]">
                  <Home className="h-10 w-10 text-[#B9965B]/40 mb-1" />
                  <p className="text-xs font-medium">No images uploaded</p>
                </div>
              )}

              {/* Thumbnails Carousel */}
              {(details.images || []).length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-2.5 bg-[#F7F6F2] border-t border-[#DFDED7] scrollbar-thin">
                  {details.images.map((u, idx) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setSelectedImage(u)}
                      className={`relative h-14 w-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                        (selectedImage || details.images[0]) === u
                          ? "border-[#B9965B] shadow-xs scale-102"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={u}
                        alt={`Thumb ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Badges */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-[#17232F] leading-snug">
                    {details.title}
                  </h4>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#65717B]">
                    <MapPin className="h-3.5 w-3.5 text-[#B9965B] shrink-0" />
                    <span className="truncate">
                      {[details.address, details.city, details.state, details.zipCode]
                        .filter(Boolean)
                        .join(", ") || "Location not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Flags Row */}
              <div className="mt-3 pt-3 border-t border-[#DFDED7] flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <PropertyStatusPill status={details.status} type="market" />
                  <PropertyStatusPill
                    status={details.approvalStatus || "Pending"}
                    type="approval"
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#65717B]">
                  <span>
                    Published:{" "}
                    <b className={details.isPublished ? "text-[#3E8066]" : "text-[#65717B]"}>
                      {details.isPublished ? "Yes" : "No"}
                    </b>
                  </span>
                  <span>•</span>
                  <span>
                    Featured:{" "}
                    <b className={details.isFeatured ? "text-[#B9965B]" : "text-[#65717B]"}>
                      {details.isFeatured ? "Yes" : "No"}
                    </b>
                  </span>
                </div>
              </div>
            </div>

            {/* Key Specs 4-Box Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
                <div className="flex justify-center text-[#B9965B] mb-1">
                  <BedDouble className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-mono font-bold uppercase text-[#65717B]">Beds</p>
                <p className="mt-0.5 text-xs font-bold text-[#17232F]">{details.bedrooms ?? 0}</p>
              </div>
              <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
                <div className="flex justify-center text-[#B9965B] mb-1">
                  <Bath className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-mono font-bold uppercase text-[#65717B]">Baths</p>
                <p className="mt-0.5 text-xs font-bold text-[#17232F]">{details.bathrooms ?? 0}</p>
              </div>
              <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
                <div className="flex justify-center text-[#B9965B] mb-1">
                  <Maximize2 className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-mono font-bold uppercase text-[#65717B]">Area</p>
                <p className="mt-0.5 text-xs font-bold text-[#17232F]">
                  {details.area ? `${details.area} sqft` : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
                <div className="flex justify-center text-[#B9965B] mb-1">
                  <Sofa className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-mono font-bold uppercase text-[#65717B]">Furnishing</p>
                <p
                  className="mt-0.5 text-xs font-bold text-[#17232F] truncate"
                  title={details.furnishingStatus || "Unfurnished"}
                >
                  {details.furnishingStatus || "Unfurnished"}
                </p>
              </div>
            </div>

            {/* Description */}
            {details.description && (
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-xs">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B9965B] mb-1.5">
                  Description
                </p>
                <p className="text-xs text-[#65717B] leading-relaxed whitespace-pre-wrap">
                  {details.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {(details.amenities || []).length > 0 && (
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-xs">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B9965B] mb-2">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {details.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#71877B]/30 bg-[#EBF3EF] px-2 py-1 text-[11px] font-medium text-[#3E8066]"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{a}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts & Ownership */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-xs space-y-2.5">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B9965B]">
                Contacts & Ownership
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5">
                  <p className="text-[10px] font-medium text-[#65717B] flex items-center gap-1">
                    <User className="h-3 w-3 text-[#B9965B]" />
                    <span>Owner</span>
                  </p>
                  <p className="mt-1 font-bold text-[#17232F] truncate">
                    {details.owner?.name || "Direct / Admin"}
                  </p>
                  {details.owner?.email && (
                    <p className="text-[11px] text-[#65717B] truncate">{details.owner.email}</p>
                  )}
                </div>
                <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5">
                  <p className="text-[10px] font-medium text-[#65717B] flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-[#B9965B]" />
                    <span>Assigned Agent</span>
                  </p>
                  <p className="mt-1 font-bold text-[#17232F] truncate">
                    {details.assignedAgent?.name || "Unassigned"}
                  </p>
                  {details.assignedAgent?.email && (
                    <p className="text-[11px] text-[#65717B] truncate">{details.assignedAgent.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ownership Verification Docs (Super Admin / Admin) */}
            <div className="rounded-2xl border border-[#B98235]/30 bg-[#FDF5E6] p-3.5 shadow-xs">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-4 w-4 text-[#B98235]" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#B98235]">
                  Ownership Verification Docs
                </p>
              </div>
              {(details.documents || []).length > 0 ? (
                <div className="space-y-1.5">
                  {details.documents.map((u, i) => {
                    const fname = u.split("/").pop();
                    return (
                      <a
                        key={u || i}
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-[#29374B] bg-[#0F1622] px-3 py-2 text-xs font-medium text-[#F0F4FA] hover:border-[#86A9D8]/50 transition group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-3.5 w-3.5 text-[#E5B86B] shrink-0" />
                          <span className="truncate">{fname}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-[#86A9D8] shrink-0 opacity-70 group-hover:opacity-100" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#E5B86B]/70">
                  No verification documents uploaded for this property.
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-2 border-t border-[#29374B] flex items-center gap-2 flex-wrap">
              {canApprove &&
                !["approved", "rejected"].includes(
                  (details.approvalStatus || "pending").toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={async () => {
                      await api.post(`/properties/${details._id}/approve`);
                      toast.success("Property approved successfully");
                      setDetails(null);
                      load(meta.page);
                    }}
                    className="rounded-xl bg-[#70C6A5] hover:bg-[#5EAF90] text-[#0B0F17] font-bold px-4 py-2 text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Approve Listing
                  </button>
                )}
              {canApprove &&
                !["approved", "rejected"].includes(
                  (details.approvalStatus || "pending").toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={async () => {
                      await api.post(`/properties/${details._id}/reject`);
                      toast.success("Property marked as rejected");
                      setDetails(null);
                      load(meta.page);
                    }}
                    className="rounded-xl border border-[#E4777D]/30 bg-[#2F1A1E] text-[#E4777D] hover:bg-[#3F1F25] px-3.5 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Reject Listing
                  </button>
                )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const p = details;
                    setDetails(null);
                    setSelectedImage(null);
                    setForm({
                      ...p,
                      propertyType: p.propertyType?._id || "",
                      owner: p.owner?._id || "",
                      assignedAgent: p.assignedAgent?._id || "",
                    });
                  }}
                  className="flex-1 rounded-xl bg-[#86A9D8] hover:bg-[#7298CB] text-[#0B0F17] font-bold py-2 text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-w-[120px]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Property
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setDetails(null);
                  setSelectedImage(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#29374B] bg-[#1D2A3D] hover:bg-[#243247] text-xs font-semibold text-[#9BA9BC] hover:text-[#F0F4FA] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
