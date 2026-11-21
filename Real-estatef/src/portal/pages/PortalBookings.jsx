import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock 
} from "lucide-react";
import { agentApi } from "../store";
import { Modal, Field, ErrorBanner, EmptyState, Skeleton, StageBadge } from "../components/portalUi";

const MODES = ["Month", "Week", "Day"];
const visitStage = (s) => (s === "Confirmed" ? "Ongoing" : s === "Completed" ? "Done" : s === "Cancelled" ? "Cancelled" : "Pending");

export default function PortalBookings() {
  const qc = useQueryClient();
  const [mode, setMode] = useState("Month");
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const [sel, setSel] = useState(null);
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState("");

  const startEnd = () => {
    const s = new Date(cursor);
    if (mode === "Month") { s.setDate(1); const e = new Date(s); e.setMonth(s.getMonth() + 1); return [s, e]; }
    if (mode === "Week") { const e = new Date(s); e.setDate(s.getDate() + 7); return [s, e]; }
    const e = new Date(s); e.setDate(s.getDate() + 1); return [s, e];
  };
  const [from, to] = startEnd();
  const shift = (dir) => { const d = new Date(cursor); d.setMonth(d.getMonth() + (mode === "Month" ? dir : 0)); d.setDate(d.getDate() + (mode === "Month" ? 0 : dir * (mode === "Week" ? 7 : 1))); setCursor(d); };

  const { data, isLoading } = useQuery({ queryKey: ["agent-bookings", from.toISOString(), to.toISOString()], queryFn: () => agentApi.bookings({ from: from.toISOString(), to: to.toISOString(), limit: 100 }) });
  const rows = data?.data || [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["agent-bookings"] });

  const openDetail = async (id) => {
    setSel(id);
    setDetail(rows.find((r) => r._id === id) || null);
    setErr("");
  };
  const changeStatus = async (stage) => {
    setErr("");
    try {
      const { booking } = await agentApi.setBookingStatus(sel, stage);
      setDetail(booking);
      refresh();
    } catch (ex) { setErr(ex.response?.data?.message || ex.message); }
  };

  const days = [];
  if (mode === "Month") {
    const first = new Date(from);
    const startDay = first.getDay();
    for (let i = 0; i < 42; i++) { const d = new Date(first); d.setDate(first.getDate() + (i - startDay)); days.push(d); }
  } else { const n = mode === "Week" ? 7 : 1; for (let i = 0; i < n; i++) { const d = new Date(from); d.setDate(from.getDate() + i); days.push(d); } }
  const sameDay = (a, b) => a.toDateString() === b.toDateString();

  return (
    <div className="space-y-4">
      {/* Calendar Navigation Bar — responsive: controls row + full-width mode switch on mobile */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-[#DFDED7] shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1">
          <button
            onClick={() => shift(-1)}
            className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2 text-[#65717B] hover:text-[#17232F] hover:bg-[#F0EFE9] transition cursor-pointer shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="flex-1 text-center font-bold text-xs sm:text-sm text-[#17232F] truncate">
            {from.toLocaleDateString([], { month: "long", year: "numeric", ...(mode !== "Month" ? { day: "numeric" } : {}) })}
          </p>
          <button
            onClick={() => shift(1)}
            className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2 text-[#65717B] hover:text-[#17232F] hover:bg-[#F0EFE9] transition cursor-pointer shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:flex gap-1 w-full sm:w-auto sm:ml-auto">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer text-center ${
                mode === m
                  ? "bg-[#B9965B] text-white font-bold shadow-sm"
                  : "border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:text-[#17232F] hover:bg-[#F0EFE9]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
        <div className={`grid gap-1 sm:gap-1.5 min-w-[600px] sm:min-w-0 ${mode === "Month" ? "grid-cols-7" : mode === "Week" ? "grid-cols-7" : "grid-cols-1"}`}>
          {(mode === "Month" ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : []).map((d) => (
            <p key={d} className="py-1 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#65717B]">
              {d}
            </p>
          ))}
          {days.map((d, i) => {
            const items = rows.filter((r) => sameDay(new Date(r.bookingDate), d));
            const isToday = sameDay(d, new Date());
            const dim = mode === "Month" && d.getMonth() !== from.getMonth();
            return (
              <div
                key={i}
                className={`min-h-24 rounded-xl border p-2 transition-colors ${
                  isToday
                    ? "border-[#B9965B] bg-[#FDF5E6] shadow-sm"
                    : dim
                    ? "border-[#DFDED7] bg-[#F7F6F2] opacity-70"
                    : "border-[#DFDED7] bg-white"
                }`}
              >
                <p
                  className={`text-xs font-bold font-mono ${
                    isToday ? "text-[#B9965B]" : dim ? "text-[#929A9D]" : "text-[#17232F]"
                  }`}
                >
                  {d.getDate()}
                </p>
                {items.slice(0, 3).map((b) => (
                  <button
                    key={b._id}
                    onClick={() => openDetail(b._id)}
                    className="mt-1 block w-full truncate rounded-lg bg-[#F7F6F2] border border-[#DFDED7] px-1.5 py-1 text-left text-[11px] font-semibold text-[#B9965B] hover:bg-white hover:border-[#B9965B]/50 transition cursor-pointer"
                  >
                    {new Date(b.bookingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {b.property?.title || b.bookingId}
                  </button>
                ))}
                {items.length > 3 && (
                  <p className="mt-0.5 text-[10px] text-[#65717B] font-mono">+{items.length - 3} more</p>
                )}
              </div>
            );
          })}
        </div>
        </div>
      )}
      {!isLoading && !rows.length && (
        <EmptyState
          icon="📅"
          title="No visits in this range"
          hint="Bookings assigned to you by admin will appear here with full customer details."
        />
      )}

      <Modal
        open={!!sel}
        onClose={() => {
          setSel(null);
          setDetail(null);
        }}
        title={detail ? `Visit ${detail.bookingId}` : "Visit Details"}
        subtitle={detail?.property?.title || "Site inspection & client schedule"}
      >
        {detail && (
          <div className="space-y-3.5 text-sm">
            {err && <ErrorBanner message={err} />}

            {/* Visit Status Switcher */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B]">Visit Status</span>
                <span className="text-xs font-semibold text-[#17232F]">
                  Current: <span className="font-bold text-[#B9965B]">{visitStage(detail.status)}</span>
                </span>
              </div>
              <div className="flex gap-1.5 p-1 bg-[#F7F6F2] rounded-xl border border-[#DFDED7]">
                {["Pending", "Ongoing", "Done"].map((s) => {
                  const isActive = visitStage(detail.status) === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => changeStatus(s)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#B9965B] text-white shadow-sm"
                          : "text-[#65717B] hover:text-[#17232F] hover:bg-white"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#B9965B]" />
                  <span>Customer Details</span>
                </span>
                <span className="rounded-full bg-[#FDF5E6] border border-[#B9965B]/30 px-2 py-0.5 text-[10px] font-semibold text-[#B9965B]">
                  Client
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDF5E6] border border-[#B9965B]/30 text-xs font-bold text-[#B9965B] shadow-sm">
                  {detail.user?.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-[#17232F] truncate">{detail.user?.name || "Client"}</p>
                  {detail.user?.email && (
                    <a
                      href={`mailto:${detail.user.email}`}
                      className="text-[11px] text-[#65717B] hover:text-[#B9965B] flex items-center gap-1 mt-0.5 truncate transition"
                    >
                      <Mail className="w-3 h-3 shrink-0 text-[#B9965B]" />
                      <span className="truncate">{detail.user.email}</span>
                    </a>
                  )}
                  {detail.user?.phone && (
                    <a
                      href={`tel:${detail.user.phone}`}
                      className="text-[11px] text-[#65717B] hover:text-[#B9965B] flex items-center gap-1 mt-0.5 transition font-mono"
                    >
                      <Phone className="w-3 h-3 shrink-0 text-[#B9965B]" />
                      <span>{detail.user.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Target Property Card */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-[#B9965B]" />
                  <span>Target Property</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#65717B] bg-[#F7F6F2] px-2 py-0.5 rounded-md border border-[#DFDED7]">
                  {detail.property?.propertyId || "PROP-ID"}
                </span>
              </div>
              <p className="font-bold text-xs text-[#17232F] truncate">{detail.property?.title || "Property"}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DFDED7] text-xs">
                <span className="text-[11px] text-[#65717B] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#B9965B]" />
                  <span>{detail.property?.city || "Location"}</span>
                </span>
                <span className="font-bold text-xs text-[#B9965B] font-mono">
                  ₹{Number(detail.property?.price ?? detail.amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Schedule & Booking Details */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#B9965B]" />
                  <span>Schedule & Booking</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#B9965B] bg-[#FDF5E6] border border-[#B9965B]/30 px-2 py-0.5 rounded-md">
                  {detail.bookingId}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                <div className="p-2.5 rounded-xl bg-[#F7F6F2] border border-[#DFDED7]">
                  <p className="text-[10px] text-[#65717B] uppercase font-bold tracking-wider">Scheduled</p>
                  <p className="font-bold text-xs text-[#17232F] mt-0.5">
                    {new Date(detail.bookingDate).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[10px] text-[#65717B] font-mono mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#B9965B]" />
                    {new Date(detail.bookingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F6F2] border border-[#DFDED7]">
                  <p className="text-[10px] text-[#65717B] uppercase font-bold tracking-wider">Payment Status</p>
                  <div className="mt-1">
                    <StageBadge value={detail.paymentStatus || "Pending"} />
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[#B9965B] mt-1">
                    ₹{Number(detail.amount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {detail.notes && (
                <div className="rounded-xl bg-[#FDF5E6] border border-[#B9965B]/30 p-2.5 text-xs text-[#17232F]">
                  <p className="text-[10px] font-bold uppercase text-[#B9965B] tracking-wider mb-0.5">Visit Remarks & Budget</p>
                  <p className="text-[#65717B] text-[11px] leading-relaxed">{detail.notes}</p>
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#B9965B]" />
                <span>Audit Timeline</span>
              </p>
              <div className="max-h-40 overflow-y-auto drawer-content-scroll space-y-2 pr-1">
                {(detail.timeline || []).slice().reverse().map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs pb-2 border-b border-[#DFDED7] last:border-0 last:pb-0">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[#B9965B] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#17232F]">{t.status}</span>
                        <span className="text-[10px] text-[#65717B] font-mono">
                          {t.at
                            ? new Date(t.at).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#65717B] mt-0.5">{t.note}</p>
                    </div>
                  </div>
                ))}
                {!(detail.timeline || []).length && (
                  <p className="text-xs text-[#65717B] text-center py-2">No timeline entries yet.</p>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 border-t border-[#DFDED7]">
              <button
                type="button"
                onClick={() => {
                  setSel(null);
                  setDetail(null);
                }}
                className="w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] hover:bg-[#F0EFE9] py-2 text-xs font-bold text-[#65717B] hover:text-[#17232F] transition cursor-pointer"
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
