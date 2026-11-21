import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { DataTable, Pagination, Toolbar, Badge, statusTone, Modal, Field, inputCls, FormSection, FormActions, filterSelectCls } from "../components/ui";
import { CheckCircle2, XCircle, AlertTriangle, Eye, Mail, Phone, Building2, User, Clock, CreditCard, Receipt } from "lucide-react";
import LuxuryInvoiceModal from "../../components/LuxuryInvoiceModal";
import toast from "react-hot-toast";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const QUICK_REJECTION_CAUSES = [
  "Payment receipt illegible or unverified",
  "Transaction ID / UTR not found on statement",
  "Amount transferred does not match required booking fee",
  "Cash deposit not completed at branch/office",
  "Duplicate transaction reference submitted",
];

export default function Transactions({ canManage = true }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", paymentMethod: "" });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceTxn, setInvoiceTxn] = useState(null);

  const openInvoiceModal = async (txn) => {
    setInvoiceTxn(txn);
    setSelectedInvoice(null);
    setInvoiceLoading(true);
    try {
      const { data } = await api.get(`/transactions/${txn._id}/invoice`);
      setSelectedInvoice(data.invoice || data.data?.invoice || data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load invoice");
      setInvoiceTxn(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Reject modal state
  const [rejectTxn, setRejectTxn] = useState(null);
  const [rejectionCause, setRejectionCause] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/transactions", { params: { page, limit: 10, search, ...filters } });
      setRows(data.data);
      setMeta(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
  }, [search, filters]);

  const handleApprove = async (txn) => {
    if (!txn) return;
    setIsSubmitting(true);
    try {
      await api.put(`/transactions/${txn._id}`, { action: "approve" });
      toast.success(`Transaction ${txn.transactionId} approved successfully`);
      if (view?._id === txn._id) {
        const { data } = await api.get(`/transactions/${txn._id}`);
        setView(data.transaction);
      }
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectModal = (txn) => {
    setRejectTxn(txn);
    setRejectionCause("");
  };

  const handleConfirmReject = async (e) => {
    e?.preventDefault();
    if (!rejectTxn) return;
    if (!rejectionCause.trim()) {
      toast.error("Please enter a cause for rejection");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/transactions/${rejectTxn._id}`, {
        action: "reject",
        cause: rejectionCause.trim(),
      });
      toast.success(`Transaction ${rejectTxn.transactionId} rejected`);
      if (view?._id === rejectTxn._id) {
        const { data } = await api.get(`/transactions/${rejectTxn._id}`);
        setView(data.transaction);
      }
      setRejectTxn(null);
      setRejectionCause("");
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Toolbar search={search} onSearch={setSearch}>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className={filterSelectCls}
        >
          <option value="">All statuses</option>
          {["Pending", "Paid", "Failed", "Cancelled"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.paymentMethod}
          onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
          className={filterSelectCls}
        >
          <option value="">All methods</option>
          {["Cash", "Bank Transfer", "Card", "UPI", "Online Payment"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <a
          href={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/reports/transactions?format=csv`}
          className="rounded-xl border border-[#DFDED7] bg-white hover:bg-[#F7F6F2] text-xs font-semibold text-[#17232F] px-3.5 py-2 shadow-xs transition"
        >
          Export CSV
        </a>
      </Toolbar>

      <DataTable
        loading={loading}
        columns={[
          { key: "transactionId", label: "Txn ID", render: (t) => <span className="font-medium font-mono text-xs text-[#B9965B]">{t.transactionId}</span> },
          { key: "user", label: "Customer", render: (t) => <span className="font-semibold text-[#17232F]">{t.user?.name || "—"}</span> },
          { key: "property", label: "Property", render: (t) => <span className="text-[#17232F]">{t.property?.title || "—"}</span> },
          { key: "amount", label: "Amount", render: (t) => <span className="font-mono font-bold text-[#17232F]">₹{Number(t.amount).toLocaleString("en-IN")}</span> },
          { key: "paymentMethod", label: "Method", render: (t) => <span className="font-mono text-xs text-[#65717B]">{t.paymentMethod || "—"}</span> },
          {
            key: "status",
            label: "Status",
            render: (t) => (
              <div>
                <Badge value={t.status} tone={statusTone(t.status)} />
                {t.rejectionReason && (
                  <p className="text-[10px] text-[#B85C56] truncate max-w-[120px] mt-0.5" title={t.rejectionReason}>
                    Cause: {t.rejectionReason}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (t) => (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    setView(t); // open instantly with row data, then refresh full details
                    try {
                      const { data } = await api.get(`/transactions/${t._id}`);
                      if (data?.transaction) setView(data.transaction);
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to load full transaction details");
                    }
                  }}
                  title="View transaction details"
                  aria-label="View transaction"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-[#F0EFE9] hover:text-[#17232F] hover:border-[#B9965B]/40 transition shadow-xs cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {canManage && (
                  <>
                    {t.status === "Paid" && (
                      <button
                        type="button"
                        onClick={() => openInvoiceModal(t)}
                        title="View & print official tax invoice"
                        aria-label="View invoice"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#71877B]/30 bg-[#EBF3EF] text-[#3E8066] hover:bg-[#DFEDE6] transition shadow-xs cursor-pointer"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                    )}
                    {t.status !== "Paid" && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleApprove(t)}
                        title="Approve transaction and sync booking"
                        aria-label="Approve transaction"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#71877B]/30 bg-[#EBF3EF] text-[#3E8066] hover:bg-[#DFEDE6] transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    {t.status !== "Cancelled" && t.status !== "Failed" && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => openRejectModal(t)}
                        title="Reject transaction with cause"
                        aria-label="Reject transaction"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#B85C56]/30 bg-[#FDF0EE] text-[#B85C56] hover:bg-[#FBE4E2] transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ),
          },
        ]}
        rows={rows}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      {/* Transaction Details Modal */}
      <Modal 
        open={!!view} 
        onClose={() => setView(null)} 
        title={view ? `Transaction ${view.transactionId}` : "Transaction Details"}
        subtitle={view ? `${view.paymentMethod || "Payment"} • ${new Date(view.transactionDate || view.createdAt).toLocaleDateString()}` : ""}
        size="md"
      >
        {view && (
          <div className="text-sm space-y-4">
            {/* Digital Receipt Hero Card — same light type as dashboard */}
            <div className="relative overflow-hidden rounded-2xl border border-[#DFDED7] bg-white p-4.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4EFE6] text-[#B9965B] border border-[#B9965B]/30 shadow-xs">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B]">Total Amount</span>
                    <h3 className="text-2xl font-bold font-mono text-[#B9965B]">
                      ₹{Number(view.amount).toLocaleString("en-IN")}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge value={view.status} tone={statusTone(view.status)} />
                  <span className="text-[10px] font-medium text-[#65717B]">{view.paymentMethod || "Online"}</span>
                </div>
              </div>

              {/* Transaction Key Meta Grid */}
              <div className="mt-4 pt-3.5 border-t border-[#DFDED7] grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Transaction ID</p>
                  <p className="font-mono text-xs font-bold text-[#17232F] mt-0.5 truncate">{view.transactionId}</p>
                </div>
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Gateway / Ref</p>
                  <p className="font-mono text-xs font-bold text-[#17232F] mt-0.5 truncate">
                    {view.gatewayTransactionId || view.transactionId || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Date & Time</p>
                  <p className="text-xs font-medium text-[#17232F] mt-0.5 truncate">
                    {new Date(view.transactionDate || view.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F7F6F2] p-2.5 border border-[#DFDED7] shadow-xs">
                  <p className="text-[10px] text-[#65717B] font-medium uppercase">Payment Channel</p>
                  <p className="text-xs font-semibold text-[#17232F] mt-0.5 truncate">
                    {view.paymentGateway || view.paymentMethod || "Direct"}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer & Property Association Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1">
                  <User className="h-3 w-3 text-[#B9965B]" />
                  <span>Customer</span>
                </p>
                <p className="mt-1.5 font-bold text-xs text-[#17232F] truncate">{view.user?.name || "Customer"}</p>
                {view.user?.email && (
                  <p className="text-[11px] text-[#65717B] truncate flex items-center gap-1 mt-1">
                    <Mail className="h-2.5 w-2.5 shrink-0 text-[#B9965B]" />
                    <span className="truncate">{view.user.email}</span>
                  </p>
                )}
                {view.user?.phone && (
                  <p className="text-[11px] text-[#65717B] truncate flex items-center gap-1 mt-0.5">
                    <Phone className="h-2.5 w-2.5 shrink-0 text-[#B9965B]" />
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
                {view.property?.price && (
                  <p className="text-xs font-mono font-bold text-[#B9965B] mt-1">
                    ₹{Number(view.property.price).toLocaleString("en-IN")}
                  </p>
                )}
                {view.booking && (
                  <p className="text-[10px] text-[#65717B] font-mono mt-0.5">
                    Booking: {typeof view.booking === "object" ? (view.booking?.bookingId || view.booking?._id) : view.booking}
                  </p>
                )}
              </div>
            </div>

            {/* Rejection Cause alert in view modal */}
            {view.rejectionReason && (
              <div className="p-3.5 bg-[#FDF0EE] border border-[#B85C56]/30 rounded-2xl text-[#B85C56] text-xs shadow-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#B85C56] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#B85C56]">Rejection Cause:</p>
                    <p className="mt-0.5 font-medium text-[#17232F]">{view.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-[#DFDED7] flex gap-2">
              {view.status === "Paid" && (
                <button
                  type="button"
                  onClick={() => openInvoiceModal(view)}
                  className="flex-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white text-xs font-bold py-2 flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5 text-white" />
                  <span>View / Print Tax Invoice</span>
                </button>
              )}
              {canManage && view.status !== "Paid" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleApprove(view)}
                  className="flex-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white text-xs font-bold py-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve Transaction
                </button>
              )}
              {canManage && view.status !== "Cancelled" && view.status !== "Failed" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => openRejectModal(view)}
                  className="flex-1 rounded-xl border border-[#B85C56]/30 bg-[#FDF0EE] hover:bg-[#FBE4E2] text-[#B85C56] text-xs font-bold py-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Transaction
                </button>
              )}
              <button
                type="button"
                onClick={() => setView(null)}
                className="px-4 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] hover:bg-[#F0EFE9] text-xs font-semibold text-[#65717B] hover:text-[#17232F] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason / Cause Modal */}
      <Modal
        open={!!rejectTxn}
        onClose={() => {
          if (!isSubmitting) {
            setRejectTxn(null);
            setRejectionCause("");
          }
        }}
        title={rejectTxn ? `Reject Transaction ${rejectTxn.transactionId}` : "Reject Transaction"}
        subtitle="Log reason for payment rejection and trigger customer alert"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <FormSection
            icon={AlertTriangle}
            title="Rejection Reason & Notification"
            description="The customer will see this reason in their portal and notification."
          >
            <div className="p-3 bg-[#FDF0EE] rounded-xl border border-[#B85C56]/30 text-xs text-[#B85C56] flex items-start gap-2.5 mb-3.5">
              <AlertTriangle className="w-4 h-4 text-[#B85C56] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#B85C56]">Payment status will be marked as Rejected</p>
                <p className="text-[#B85C56]/80 text-[11px] mt-0.5 leading-relaxed">
                  The client will be advised to verify bank statement details or re-upload the correct receipt.
                </p>
              </div>
            </div>

            <Field label="Cause for Rejection" required hint="Select a suggestion below or write custom reason">
              <textarea
                required
                rows={3}
                value={rejectionCause}
                onChange={(e) => setRejectionCause(e.target.value)}
                placeholder="e.g. Transaction ID could not be verified on bank records..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="mt-3.5">
              <p className="text-[11px] font-bold text-[#65717B] uppercase tracking-wider mb-2">Preset Quick Reasons</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REJECTION_CAUSES.map((cause) => {
                  const isSelected = rejectionCause === cause;
                  return (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => setRejectionCause(cause)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer border ${
                        isSelected
                          ? "bg-[#FDF0EE] text-[#B85C56] border-[#B85C56]/40 font-semibold shadow-xs"
                          : "bg-[#F7F6F2] text-[#65717B] border-[#DFDED7] hover:border-[#B9965B]/40 hover:text-[#17232F]"
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
              setRejectTxn(null);
              setRejectionCause("");
            }}
            submitLabel="Confirm Rejection"
            loading={isSubmitting}
            cancelLabel="Cancel"
          />
        </form>
      </Modal>

      {/* Luxury Official Tax Invoice Modal */}
      <LuxuryInvoiceModal
        open={!!selectedInvoice || invoiceLoading}
        onClose={() => {
          setSelectedInvoice(null);
          setInvoiceTxn(null);
          setInvoiceLoading(false);
        }}
        invoice={selectedInvoice}
        loading={invoiceLoading}
        downloadUrl={
          invoiceTxn?._id
            ? `${BACKEND}/api/transactions/${invoiceTxn._id}/invoice?format=pdf`
            : null
        }
      />
    </div>
  );
}
