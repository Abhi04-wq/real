import { useEffect, useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Phone,
  Mail,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageSquare,
  X,
  Building2,
  CalendarCheck,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QueryClientContext } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const schema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    countryCode: z.string().default("+91"),
    phoneNumber: z.string().min(5, "Valid phone number is required"),
    email: z.string().email("Enter a valid email address"),
    iamA: z.enum(
      [
        "Individual Buyer",
        "Property Owner / Seller",
        "Tenant / Rent Seeker",
        "Real Estate Agent",
        "Investor",
      ],
      { message: "Select who you are" }
    ),
    purpose: z.enum(
      [
        "Schedule a Site Visit",
        "Pricing & Floor Plan Inquiry",
        "Sell / List My Property",
        "Home Loan Assistance",
        "General Inquiry",
      ],
      { message: "Select inquiry purpose" }
    ),
    property: z.string().optional().or(z.literal("")),
    visitType: z.enum(["In-Person Physical Visit", "Live Video Tour"]).optional(),
    visitAt: z.string().optional(),
    budget: z.string().optional().or(z.literal("")),
    message: z.string().max(2000).optional().or(z.literal("")),
    whatsappConsent: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.purpose === "Schedule a Site Visit") {
      if (!v.visitAt) {
        ctx.addIssue({
          code: "custom",
          path: ["visitAt"],
          message: "Pick a date & time from the calendar",
        });
      } else if (Number.isNaN(Date.parse(v.visitAt)) || new Date(v.visitAt) <= new Date()) {
        ctx.addIssue({
          code: "custom",
          path: ["visitAt"],
          message: "Visit date must be in the future",
        });
      }
    }
  });

const CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+81"];
const BUDGETS = ["Under ₹30L", "₹30L - ₹50L", "₹50L - ₹1Cr", "₹1Cr - ₹2.5Cr", "Above ₹2.5Cr"];
const errCls = "mt-1 text-xs text-red-600";
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200";

function getImgSrc(img) {
  if (!img) return null;
  return img.startsWith("/") ? `${BACKEND}${img}` : img;
}

export default function ScheduleVisitForm({
  onClose,
  isModal = false,
  defaultPurpose = "General Inquiry",
  defaultProperty = "",
  defaultMessage = "",
  property = null,
}) {
  const navigate = useNavigate();
  const queryClient = useContext(QueryClientContext);
  const { user } = useAuth();

  const [props, setProps] = useState([]);
  const [propSearch, setPropSearch] = useState("");
  const [result, setResult] = useState(null); // { bookingId } | { leadId }
  const [showPropSelector, setShowPropSelector] = useState(false);

  // Initialize selected property object
  const [selectedProp, setSelectedProp] = useState(() => {
    if (property && typeof property === "object") return property;
    return null;
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      countryCode: "+91",
      phoneNumber: "",
      email: "",
      whatsappConsent: false,
      visitType: "In-Person Physical Visit",
      budget: "",
      message: defaultMessage || "",
      property: defaultProperty || (property?._id || property?.id || ""),
      purpose: property ? "Schedule a Site Visit" : defaultPurpose || "General Inquiry",
      iamA: "Individual Buyer",
    },
  });

  const purpose = watch("purpose");
  const isVisit = purpose === "Schedule a Site Visit";
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // Auto-populate logged-in user credentials
  useEffect(() => {
    if (user) {
      if (user.name) setValue("fullName", user.name);
      if (user.email) setValue("email", user.email);
      if (user.phone) {
        const match = user.phone.match(/^(\+\d{1,4})\s*(.*)$/);
        if (match) {
          setValue("countryCode", match[1]);
          setValue("phoneNumber", match[2]);
        } else {
          setValue("phoneNumber", user.phone);
        }
      }
      if (user.role === "OWNER") {
        setValue("iamA", "Property Owner / Seller");
      }
    }
  }, [user, setValue]);

  // Auto-populate property details when property prop changes
  useEffect(() => {
    if (property) {
      if (typeof property === "object") {
        setSelectedProp(property);
        setValue("property", property._id || property.id || "");
        setValue("purpose", "Schedule a Site Visit");
        if (!watch("message")) {
          const codeStr = property.propertyId ? ` [${property.propertyId}]` : "";
          setValue("message", `Inquiring about ${property.title}${codeStr}`);
        }
      } else if (typeof property === "string" && property.trim()) {
        setValue("purpose", "Schedule a Site Visit");
        setValue("property", property);
      }
    }
  }, [property, setValue, watch]);

  // Fetch approved available properties for dropdown search
  useEffect(() => {
    const t = setTimeout(() => {
      axios
        .get(`${BACKEND}/api/inquiries/properties`, {
          params: { search: propSearch || undefined },
        })
        .then((r) => setProps(r.data?.data?.properties || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [propSearch]);

  const onSubmit = async (v) => {
    const payload = {
      fullName: v.fullName.trim(),
      phone: `${v.countryCode} ${v.phoneNumber.trim()}`,
      email: v.email.trim(),
      iamA: v.iamA,
      purpose: v.purpose,
      property: selectedProp?._id || selectedProp?.id || v.property || undefined,
      propertyCode: selectedProp?.propertyId || undefined,
      visitType: v.visitType,
      visitAt: isVisit ? v.visitAt : undefined,
      budget: v.budget || undefined,
      message: v.message?.trim() || undefined,
      whatsappConsent: v.whatsappConsent,
    };

    const authToken =
      localStorage.getItem("admin_token") || localStorage.getItem("token");

    const { data } = await axios.post(`${BACKEND}/api/inquiries/submit`, payload, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      withCredentials: true,
    });

    // Invalidate client bookings cache so it immediately appears in User Panel
    if (queryClient) {
      try {
        queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      } catch {}
    }

    setResult(data);
  };

  return (
    <div
      className={`mx-auto w-full max-w-2xl bg-white p-6 sm:p-8 relative ${
        isModal
          ? "rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200"
          : "rounded-2xl border border-slate-200 shadow-sm"
      }`}
    >
      {/* Optional Top Close Button for Modal display */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-600" />
            PrimeNest Concierge
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-editorial mt-1.5">
          {selectedProp ? "Schedule a Property Site Visit" : "Contact Us & Schedule a Visit"}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Book a private guided tour or consultation. Our channel advisors respond promptly within 24 hours.
        </p>
      </div>

      {/* User Login Credential Status Banner */}
      <div className="mt-4">
        {user ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 text-white px-4 py-3 text-xs shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="truncate">
                <span className="text-slate-300">Logged in as: </span>
                <b className="text-white">{user.name}</b>
                <span className="text-slate-400 font-mono ml-1.5 hidden sm:inline">({user.email})</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Saves to My Bookings</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Booking as <b>Guest</b>. Want this tour tracked in your User Panel?
              </span>
            </div>
            <a
              href="/login"
              className="font-bold underline text-amber-950 hover:text-black shrink-0"
            >
              Sign In
            </a>
          </div>
        )}
      </div>

      {/* Selected Property Preview Banner */}
      {selectedProp && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Selected Property
            </span>
            <div className="flex items-center gap-2">
              {selectedProp.propertyId && (
                <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md tracking-wider">
                  Code: {selectedProp.propertyId}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowPropSelector(!showPropSelector)}
                className="text-[11px] text-slate-500 hover:text-slate-900 underline font-medium"
              >
                {showPropSelector ? "Hide list" : "Change"}
              </button>
            </div>
          </div>

          <div className="flex gap-3.5 items-center">
            {selectedProp.images?.[0] ? (
              <img
                src={getImgSrc(selectedProp.images[0])}
                alt={selectedProp.title}
                className="h-16 w-20 sm:h-20 sm:w-24 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="h-16 w-20 sm:h-20 sm:w-24 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-editorial text-base sm:text-lg font-bold text-slate-900 truncate">
                {selectedProp.title}
              </h4>
              {(selectedProp.city || selectedProp.address) && (
                <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{selectedProp.city || selectedProp.address}</span>
                </p>
              )}
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {selectedProp.formattedPrice ||
                    (selectedProp.price
                      ? `₹${Number(selectedProp.price).toLocaleString("en-IN")}`
                      : "Price on Request")}
                </span>
                {selectedProp.listingType && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {selectedProp.listingType === "Rent" ? "For Rent" : "For Sale"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
        {/* User Credentials (Name & Phone) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <User className="h-3.5 w-3.5 text-slate-400" /> Full Name *
            </label>
            <input
              {...register("fullName")}
              placeholder="e.g. Rahul Sharma"
              className={inputCls}
            />
            {errors.fullName && <p className={errCls}>{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number *
            </label>
            <div className="flex gap-2">
              <select
                {...register("countryCode")}
                className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm outline-none focus:border-slate-900"
              >
                {CODES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                {...register("phoneNumber")}
                placeholder="98765 43210"
                className={inputCls}
              />
            </div>
            {errors.phoneNumber && <p className={errCls}>{errors.phoneNumber.message}</p>}
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address *
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className={inputCls}
          />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>

        {/* Role & Purpose */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">I Am A *</label>
            <select {...register("iamA")} className={inputCls}>
              {[
                "Individual Buyer",
                "Property Owner / Seller",
                "Tenant / Rent Seeker",
                "Real Estate Agent",
                "Investor",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            {errors.iamA && <p className={errCls}>{errors.iamA.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Inquiry Purpose *
            </label>
            <select {...register("purpose")} className={inputCls}>
              {[
                "Schedule a Site Visit",
                "Pricing & Floor Plan Inquiry",
                "Sell / List My Property",
                "Home Loan Assistance",
                "General Inquiry",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            {errors.purpose && <p className={errCls}>{errors.purpose.message}</p>}
          </div>
        </div>

        {/* Property Selector (if user clicked change or no property initially) */}
        {(!selectedProp || showPropSelector) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Browse / Choose Property of Interest
            </label>
            <input
              value={propSearch}
              onChange={(e) => setPropSearch(e.target.value)}
              placeholder="Search by title, property code (PROP-000001) or city…"
              className={`${inputCls} bg-white`}
            />
            <select
              {...register("property")}
              onChange={(e) => {
                const found = props.find((p) => p._id === e.target.value);
                if (found) {
                  setSelectedProp(found);
                }
              }}
              className={`${inputCls} bg-white`}
            >
              <option value="">Any / General Consultation</option>
              {props.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} · {p.propertyId} · ₹{Number(p.price).toLocaleString("en-IN")} ({p.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dynamic Section for "Schedule a Site Visit" */}
        {isVisit && (
          <div className="space-y-4 rounded-2xl border border-amber-200/90 bg-amber-50/50 p-4.5 transition-all">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-bold text-amber-950">
                <CalendarDays className="h-4 w-4 text-amber-700" />
                <span>Visit Schedule Preferences</span>
              </p>
              {selectedProp?.propertyId && (
                <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                  {selectedProp.propertyId}
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Tour Format
                </label>
                <select {...register("visitType")} className={`${inputCls} bg-white`}>
                  <option>In-Person Physical Visit</option>
                  <option>Live Video Tour</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Preferred Date & Time *
                </label>
                <Controller
                  name="visitAt"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="datetime-local"
                      min={minDateTime}
                      {...field}
                      value={field.value || ""}
                      className={`${inputCls} bg-white`}
                    />
                  )}
                />
                {errors.visitAt && <p className={errCls}>{errors.visitAt.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Budget Range */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Budget Range (optional)
          </label>
          <select {...register("budget")} className={inputCls}>
            <option value="">Select…</option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Message / Special Instructions */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Additional Notes / Requirements
          </label>
          <textarea
            {...register("message")}
            rows={2}
            placeholder="e.g. Best time to call, specific questions about the floor plan, or accessibility needs…"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-md cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? "Submitting Request…"
              : isVisit
              ? "Confirm & Request Site Visit"
              : "Send Contact Inquiry"}
          </button>
        </div>
      </form>

      {/* Success Dialog Modal */}
      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => {
            setResult(null);
            if (onClose) onClose();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl border border-slate-100"
          >
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h3 className="mt-3 text-xl font-bold font-editorial text-slate-900">
              Site Visit Requested!
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              {result.bookingId ? (
                <>Your appointment request is saved. Your reference booking code:</>
              ) : (
                <>Thank you! An advisor has been notified and will contact you shortly.</>
              )}
            </p>

            {result.bookingId && (
              <p className="mx-auto mt-3 w-fit rounded-xl bg-slate-100 px-4 py-2 font-mono text-base font-bold text-slate-900 tracking-wider border border-slate-200">
                {result.bookingId}
              </p>
            )}

            {selectedProp && (
              <div className="mt-3.5 rounded-xl bg-slate-50 p-2.5 text-left border border-slate-200 text-xs">
                <p className="font-semibold text-slate-900 truncate">{selectedProp.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{selectedProp.city}</span>
                  {selectedProp.propertyId && (
                    <span className="font-mono font-bold text-slate-700">
                      {selectedProp.propertyId}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  if (onClose) onClose();
                  navigate("/home/my-bookings");
                }}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs uppercase tracking-wider font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>View in My Bookings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  if (onClose) onClose();
                }}
                className="w-full rounded-xl border border-slate-200 hover:bg-slate-50 py-2.5 text-xs uppercase tracking-wider font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
