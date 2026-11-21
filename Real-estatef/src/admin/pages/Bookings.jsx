import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { DataTable, Pagination, Toolbar, Badge, statusTone, Modal, Field, inputCls, FormSection, FormActions, filterSelectCls } from "../components/ui";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, User as UserIcon, DollarSign, Eye, Mail, Phone, Building2, User, Clock, Calendar, Receipt } from "lucide-react";
import LuxuryInvoiceModal from "../../components/LuxuryInvoiceModal";
import toast from "react-hot-toast";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const QUICK_BOOKING_REJECTION_CAUSES = [
  "Payment receipt illegible or unverified",
  "Transaction ID / UTR not found on statement",
  "Amount transferred does not match required booking fee",
  "Cash payment was not deposited at office",
  "Duplicate booking or payment reference",
];

export default function Bookings({ canAssign = true, canApprove = true }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignId, setAssignId] = useState("");
  const [assignMsg, setAssignMsg] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  // Reject with cause modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionCause, setRejectionCause] = useState("");

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  const openInvoiceModal = async (b) => {
    setInvoiceBooking(b);
    setSelectedInvoice(null);
    setInvoiceLoading(true);
    try {
      const { data } = await api.get(`/bookings/${b._id}/invoice`);
      setSelectedInvoice(data.invoice || data.data?.invoice || data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load invoice");
      setInvoiceBooking(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings", { params: { page, limit: 10, search, status } });
      setRows(data.data); setMeta(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(() => load(1), 300); return () => clearTimeout(t); }, [search, status]);

  const updateBookingStatus = async (id, s) => {
    setActionBusy(true);
    try {
      const { data } = await api.put(`/bookings/${id}`, { status: s });
      toast.success(`Booking status changed to ${s}`);
      // Keep drawer open and refresh view in place
      if (data?.booking) {
        setView(data.booking);
      } else {
        const { data: fresh } = await api.get(`/bookings/${id}`);
        if (fresh?.booking) setView(fresh.booking);
      }
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionBusy(false);
    }
  };

  const handleApprove = async () => {
    if (!view) return;
    setActionBusy(true);
    try {
      const { data } = await api.put(`/bookings/${view._id}`, { action: "approve" });
      setView(data.booking);
      toast.success("Payment approved & Agent commission allocated successfully!");
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setActionBusy(false);
    }
  };

  const openRejectModal = () => {
    setRejectionCause("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e?.preventDefault();
    if (!view) return;
    if (!rejectionCause.trim()) {
      toast.error("Please enter a cause for rejection");
      return;
    }
    setActionBusy(true);
    try {
      const { data } = await api.put(`/bookings/${view._id}`, {
        action: "reject",
        cause: rejectionCause.trim(),
      });
      setView(data.booking);
      setRejectModalOpen(false);
      setRejectionCause("");
      toast.success("Booking payment rejected and client notified of cause");
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setActionBusy(false);
    }
  };

  const openView = async (id) => {
    // Open drawer instantly with row data so it always opens, then refresh with full details
    const row = rows.find((r) => r._id === id);
    if (row) {
      setView(row);
      setAgentProfile(null);
      setAssignId(row.agent?._id || "");
      setAssignMsg("");
    }
    try {
      const { data } = await api.get(`/bookings/${id}`);
      if (data?.booking) {
        setView(data.booking);
        setAgentProfile(data.agentProfile || null);
        setAssignId(data.booking.agent?._id || "");
        setAssignMsg("");
      } else if (!row) {
        toast.error("Booking details not found");
      }
    } catch (err) {
      if (!row) setView(null);
      toast.error(err.response?.data?.message || "Failed to load full booking details");
    }
    if (canAssign && !agents.length) {
      try {
        const a = await api.get("/agents", { params: { limit: 100 } });
        setAgents(a.data.data || []);
      } catch { /* agents list unavailable */ }
    }
  };

  const assignAgent = async () => {
    if (!assignId) return;
    setAssignMsg("");
    try {
      const { data } = await api.put(`/bookings/${view._id}`, { agent: assignId });
      setView(data.booking);
      try {
        const agRes = await api.get(`/agents`);
        const matchingAgent = (agRes.data.data || []).find((a) => a.user?._id === assignId);
        if (matchingAgent) setAgentProfile(matchingAgent);
      } catch {}
      setAssignMsg("Agent assigned. It now appears in the agent's panel.");
      load(meta.page);
    } catch (ex) { setAssignMsg(ex.response?.data?.message || "Assignment failed"); }
  };

  const effectiveRate = view?.commissionRate || agentProfile?.commissionRate || 2;
  const calculatedCommission = ((Number(view?.amount || 0) * effectiveRate) / 100);

  return (
    <div>
      <Toolbar search={search} onSearch={setSearch}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={filterSelectCls}><option value="">All statuses</option>{["Pending", "Confirmed", "Cancelled", "Completed"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </Toolbar>
      <DataTable loading={loading} columns={[
        { key: "bookingId", label: "Booking ID", render: (b) => <span className="font-mono font-semibold text-xs text-[#B9965B]">{b.bookingId}</span> },
        { key: "user", label: "Customer", render: (b) => <div><p className="font-bold text-xs text-[#17232F]">{b.user?.name || "Customer"}</p><p className="text-[11px] font-medium text-[#65717B]">{b.user?.email}</p></div> },
        { key: "property", label: "Property", render: (b) => <span className="text-xs font-semibold text-[#17232F]">{b.property?.title || "—"}</span> },
        { key: "amount", label: "Amount", render: (b) => <span className="font-mono font-bold text-xs text-[#17232F]">₹{Number(b.amount || 0).toLocaleString("en-IN")}</span> },
        { key: "paymentMethod", label: "Method", render: (b) => <span className="text-xs font-medium text-[#65717B]">{b.paymentMethod || "Cash"}</span> },
        { key: "approvalStatus", label: "Approval", render: (b) => (
          <Badge
            value={b.approvalStatus || "Pending"}
            tone={b.approvalStatus === "Approved" ? "green" : b.approvalStatus === "Submitted" ? "amber" : b.approvalStatus === "Rejected" ? "red" : "gray"}
          />
        ) },
        { key: "status", label: "Booking", render: (b) => <Badge value={b.status} tone={statusTone(b.status)} /> },
        { key: "actions", label: "Actions", render: (b) => {
          const isPaid = b.approvalStatus === "Approved" || b.paymentStatus === "Paid";
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => openView(b._id)}
                title="View booking details"
                aria-label="View booking"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-[#F0EFE9] hover:text-[#17232F] hover:border-[#B9965B]/40 transition shadow-xs cursor-pointer"
              >
                <Eye className="h-4 w-4" />
              </button>
              {isPaid && (
                <button
                  type="button"
                  onClick={() => openInvoiceModal(b)}
                  title="View & print official tax invoice"
                  aria-label="View invoice"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#71877B]/30 bg-[#EBF3EF] text-[#3E8066] hover:bg-[#DFEDE6] transition shadow-xs cursor-pointer"
                >
                  <Receipt className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        } },
      ]} rows={rows} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      <Modal 
        open={!!view} 
        onClose={() => setView(null)} 
        title={view ? `Booking ${view.bookingId}` : "Booking Details"} 
        subtitle={view ? `${view.property?.title || "Property"} • ${view.user?.name || "Customer"}` : ""}
        size="md"
      >
        {view && (
          <div className="space-y-4 text-sm">
            {/* Payment & Approval Verification Card — same light type as dashboard */}
            <div className="p-4 rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4EFE6] border border-[#B9965B]/30 text-[#B9965B] text-sm">💳</span>
                  <h4 className="font-bold text-[#17232F] text-xs uppercase tracking-wider">Payment & Commission</h4>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    value={`Approval: ${view.approvalStatus || "Pending"}`}
                    tone={view.approvalStatus === "Approved" ? "success" : view.approvalStatus === "Submitted" ? "warning" : view.approvalStatus === "Rejected" ? "danger" : "neutral"}
                  />
                  <Badge value={`Payment: ${view.paymentStatus}`} tone={statusTone(view.paymentStatus)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs pt-2.5 border-t border-[#DFDED7]">
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Amount Received</p>
                  <p className="font-bold font-mono text-base text-[#3E8066] mt-0.5">
                    ₹{Number(view.amount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Payment Method</p>
                  <p className="font-bold text-[#17232F] mt-1">{view.paymentMethod || "Cash"}</p>
                </div>
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Payer Name</p>
                  <p className="font-semibold text-[#17232F] mt-1 truncate">{view.payerName || view.user?.name || "—"}</p>
                </div>
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Transaction ID / Ref</p>
                  <p className="font-mono text-xs text-[#B9965B] mt-1 truncate font-semibold">
                    {view.paymentMethod === "Cash" ? "Cash (Office)" : view.transactionId || "—"}
                  </p>
                </div>
              </div>

              {/* Screenshot Proof if uploaded */}
              {view.paymentScreenshot && (
                <div className="mt-3 pt-3 border-t border-[#DFDED7] flex items-center gap-3">
                  <img
                    src={view.paymentScreenshot.startsWith("/") ? BACKEND + view.paymentScreenshot : view.paymentScreenshot}
                    alt="Payment proof"
                    className="h-12 w-12 object-cover rounded-xl border border-[#DFDED7] shadow-xs"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#17232F]">Payment Screenshot Attached</p>
                    <a
                      href={view.paymentScreenshot.startsWith("/") ? BACKEND + view.paymentScreenshot : view.paymentScreenshot}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#B9965B] font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      View full receipt image <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Commission Calculation Preview */}
              <div className="mt-3 pt-3 border-t border-[#DFDED7] bg-[#F7F6F2] p-3 rounded-xl border border-[#DFDED7] flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Assigned Agent</p>
                  <p className="font-bold text-[#17232F] text-xs mt-0.5">
                    {view.agent ? `${view.agent.name}` : "No agent assigned"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">
                    Commission ({effectiveRate}%)
                  </p>
                  <p className="text-sm font-bold font-mono text-[#3E8066] mt-0.5">
                    ₹{calculatedCommission.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Rejection Cause Alert */}
              {view.rejectionReason && (
                <div className="mt-3 p-3 bg-[#FDF0EE] border border-[#B85C56]/30 rounded-xl text-xs text-[#B85C56] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B85C56] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#B85C56]">Rejection Cause:</p>
                    <p className="mt-0.5 font-medium text-[#17232F]">{view.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Approval Actions */}
              <div className="mt-3 pt-2 flex items-center gap-2 justify-end flex-wrap">
                {(view.approvalStatus === "Approved" || view.paymentStatus === "Paid") && (
                  <button
                    type="button"
                    onClick={() => openInvoiceModal(view)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-white" />
                    <span>View / Print Tax Invoice</span>
                  </button>
                )}
                {canApprove && view.approvalStatus !== "Approved" && (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={handleApprove}
                    className="px-3.5 py-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Payment
                  </button>
                )}
                {canApprove && view.approvalStatus !== "Rejected" && (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={openRejectModal}
                    className="px-3 py-1.5 rounded-xl border border-[#B85C56]/30 bg-[#FDF0EE] hover:bg-[#FBE4E2] text-[#B85C56] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Payment
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Property Information Cards — same light type as dashboard */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1">
                  <User className="h-3 w-3 text-[#B9965B]" />
                  <span>Customer</span>
                </p>
                <p className="mt-1.5 font-bold text-xs text-[#17232F] truncate">{view.user?.name || "Customer"}</p>
                {view.user?.email && (
                  <p className="text-[11px] text-[#65717B] truncate flex items-center gap-1 mt-1">
                    <Mail className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{view.user.email}</span>
                  </p>
                )}
                {view.user?.phone && (
                  <p className="text-[11px] text-[#65717B] truncate flex items-center gap-1 mt-0.5">
                    <Phone className="h-2.5 w-2.5 shrink-0" />
                    <span>{view.user.phone}</span>
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-[#B9965B]" />
                  <span>Property</span>
                </p>
                <p className="mt-1.5 font-bold text-xs text-[#17232F] truncate">{view.property?.title || "Property"}</p>
                <p className="text-xs font-mono font-bold text-[#B9965B] mt-1">
                  ₹{Number(view.property?.price || view.amount).toLocaleString("en-IN")}
                </p>
                <div className="mt-1">
                  <Badge value={view.status} tone={statusTone(view.status)} />
                </div>
              </div>
            </div>

            {/* Assigned Agent Card */}
            {canAssign && (
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#65717B]">Agent Assignment</p>
                  <span className="text-[11px] text-[#65717B]">
                    Current: <b className="text-[#17232F]">{view.agent?.name || "Unassigned"}</b>
                  </span>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={assignId} 
                    onChange={(e) => setAssignId(e.target.value)} 
                    className={`flex-1 ${inputCls}`}
                  >
                    <option value="">Select agent to assign…</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a.user?._id}>
                        {a.user?.name} · {a.employeeId || a.user?.email}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={assignAgent} 
                    disabled={!assignId} 
                    className="rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-3.5 py-1.5 text-xs font-bold text-white transition disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    Assign
                  </button>
                </div>
                {assignMsg && <p className="text-[11px] text-[#3E8066] mt-1.5 font-medium">{assignMsg}</p>}
              </div>
            )}

            {/* Quick Status Change */}
            {canAssign && (
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] mb-2">Quick Booking Status</p>
              <div className="flex gap-1.5">
                {["Pending", "Confirmed", "Completed", "Cancelled"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={actionBusy}
                    onClick={() => updateBookingStatus(view._id, s)}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition cursor-pointer border ${
                      view.status === s
                        ? "bg-[#B9965B] border-[#B9965B] text-white shadow-xs"
                        : "border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-[#F4EFE6] hover:text-[#17232F]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Timeline & Audit */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] mb-2.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-[#B9965B]" />
                <span>Audit & History Timeline</span>
              </p>
              <div className="max-h-40 overflow-y-auto drawer-content-scroll space-y-2 pr-1">
                {view.timeline && view.timeline.length > 0 ? (
                  view.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs pb-2 border-b border-[#DFDED7] last:border-0 last:pb-0">
                      <div className="mt-1 h-2 w-2 rounded-full bg-[#B9965B] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#17232F]">{t.status}</span>
                          <span className="text-[10px] text-[#65717B] font-mono">
                            {t.at ? new Date(t.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#65717B] mt-0.5">{t.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-2">No timeline entries</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[#DFDED7] flex justify-end">
              <button
                type="button"
                onClick={() => setView(null)}
                className="w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] hover:bg-[#F0EFE9] py-2 text-xs font-semibold text-[#65717B] hover:text-[#17232F] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Booking Modal with Cause */}
      <Modal
        open={rejectModalOpen}
        onClose={() => {
          if (!actionBusy) {
            setRejectModalOpen(false);
            setRejectionCause("");
          }
        }}
        title={view ? `Reject Booking ${view.bookingId}` : "Reject Booking"}
        subtitle="Specify official reason for booking rejection and audit trail"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <FormSection
            icon={AlertTriangle}
            title="Rejection Reason & Notification"
            description="The customer will receive an alert detailing this reason."
          >
            <div className="p-3 bg-red-50/80 rounded-xl border border-red-200/80 text-xs text-red-900 flex items-start gap-2.5 mb-3.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Action cannot be immediately reversed</p>
                <p className="text-red-700 text-[11px] mt-0.5 leading-relaxed">
                  The client will see this note in their "My Bookings" portal and may re-submit payment proof.
                </p>
              </div>
            </div>

            <Field label="Rejection Cause" required hint="Choose a suggestion below or type custom note">
              <textarea
                required
                rows={3}
                value={rejectionCause}
                onChange={(e) => setRejectionCause(e.target.value)}
                placeholder="e.g. Transaction UTR reference not matching bank records, screenshot unreadable, etc."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="mt-3.5">
              <p className="text-[11px] font-bold text-[#6B746F] uppercase tracking-wider mb-2">Preset Quick Reasons</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_BOOKING_REJECTION_CAUSES.map((cause) => {
                  const isSelected = rejectionCause === cause;
                  return (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => setRejectionCause(cause)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer border ${
                        isSelected
                          ? "bg-red-50 text-red-700 border-red-300 font-semibold shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-red-200 hover:bg-red-50/50"
                      }`}
                    >
                      {cause}
                    </button>
                  );
                })}
              </div>
            </div>
          </FormSection>

          <FormActions
            onCancel={() => {
              setRejectModalOpen(false);
              setRejectionCause("");
            }}
            submitLabel="Confirm Rejection"
            loading={actionBusy}
            cancelLabel="Cancel"
          />
        </form>
      </Modal>

      {/* Luxury Official Tax Invoice Modal */}
      <LuxuryInvoiceModal
        open={!!selectedInvoice || invoiceLoading}
        onClose={() => {
          setSelectedInvoice(null);
          setInvoiceBooking(null);
          setInvoiceLoading(false);
        }}
        invoice={selectedInvoice}
        loading={invoiceLoading}
        downloadUrl={
          invoiceBooking?._id
            ? `${BACKEND}/api/bookings/${invoiceBooking._id}/invoice?format=pdf`
            : null
        }
      />
    </div>
  );
}
