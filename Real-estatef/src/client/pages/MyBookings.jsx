import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  User as UserIcon,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Receipt,
  FileText,
} from "lucide-react";
import { client, useClientStore } from "../store";
import { Skeleton, EmptyState, StatusChip, Modal, inputCls } from "../components/clientUi";
import { uploadImages } from "../../lib/upload";
import LuxuryInvoiceModal from "../../components/LuxuryInvoiceModal";
import toast from "react-hot-toast";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function getImgSrc(img) {
  if (!img) return null;
  return img.startsWith("/") ? `${BACKEND}${img}` : img;
}

export default function MyBookings() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const user = useClientStore((s) => s.user);

  const [cancel, setCancel] = useState(null);
  const [payBooking, setPayBooking] = useState(null);
  const [payForm, setPayForm] = useState({
    paymentMethod: "UPI",
    payerName: "",
    amount: 5000,
    transactionId: "",
    screenshot: "",
    notes: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [screenshotUploading, setScreenshotUploading] = useState(false);

  // Invoice modal state
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const openInvoiceModal = async (b) => {
    setInvoiceBooking(b);
    setSelectedInvoice(null);
    setInvoiceLoading(true);
    try {
      const inv = await client.bookingInvoice(b._id);
      setSelectedInvoice(inv);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to load invoice");
      setInvoiceBooking(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const { data, isLoading } = useQuery({ queryKey: ["client-bookings"], queryFn: client.myBookings });
  const rows = data?.bookings || [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["client-bookings"] });

  const doCancel = async () => {
    await client.cancelBooking(cancel._id);
    setCancel(null);
    toast.success("Tour booking cancelled");
    refresh();
  };

  const openPayModal = (b) => {
    setPayBooking(b);
    setPayForm({
      paymentMethod: b.paymentMethod || "UPI",
      payerName: b.payerName || user?.name || "",
      amount: b.amount && Number(b.amount) > 0 ? b.amount : 5000,
      transactionId: b.transactionId && b.transactionId !== "CASH-PAYMENT" ? b.transactionId : "",
      screenshot: b.paymentScreenshot || "",
      notes: b.notes || "",
    });
  };

  const handleScreenshotUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setScreenshotUploading(true);
    try {
      const urls = await uploadImages(files, "receipts");
      if (urls.length > 0) {
        setPayForm((prev) => ({ ...prev, screenshot: urls[0] }));
        toast.success("Payment receipt uploaded");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload screenshot");
    } finally {
      setScreenshotUploading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (payForm.paymentMethod !== "Cash" && !payForm.transactionId.trim()) {
      toast.error("Transaction ID / UTR is required for online payments");
      return;
    }

    setSubmittingPayment(true);
    try {
      await client.submitBookingPayment(payBooking._id, payForm);
      toast.success("Payment submitted! Awaiting Admin approval.");
      setPayBooking(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Submission failed");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>;
  if (!rows.length) return <EmptyState icon="📅" title="No bookings found" hint="Book a site-visit tour for any listing." action={<button onClick={() => nav("/properties")} className="rounded-xl bg-[#B9965B] px-4 py-2 text-sm font-bold text-white">Explore Properties</button>} />;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((b) => {
        const imgUrl = getImgSrc(b.property?.images?.[0]);
        const isPaid = b.paymentStatus === "Paid" || b.approvalStatus === "Approved";
        const isSubmitted = !isPaid && (b.approvalStatus === "Submitted" || b.paymentStatus === "Submitted");
        const isRejected = !isPaid && (b.approvalStatus === "Rejected" || b.status === "Cancelled" && b.rejectionReason);

        return (
          <div key={b._id} className="overflow-hidden rounded-2xl border border-[#DFDED7] bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex gap-3 p-4">
                {imgUrl ? (
                  <img src={imgUrl} alt={b.property?.title} className="h-20 w-28 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-20 w-28 place-items-center rounded-xl bg-[#F7F6F2] text-2xl">🏠</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="truncate font-bold text-[#17232F]">{b.property?.title || b.bookingId}</p>
                    {b.property?.propertyId && (
                      <span className="font-mono text-[10px] bg-[#F7F6F2] text-[#65717B] px-1.5 py-0.5 rounded border border-[#DFDED7] font-bold">
                        {b.property.propertyId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#65717B] mt-0.5">
                    {new Date(b.bookingDate).toLocaleString()} · {b.tourType || "In-Person"}
                  </p>
                  {b.property?.city && (
                    <p className="text-[11px] text-[#65717B] mt-0.5 truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.property.city}
                    </p>
                  )}
                  <div className="mt-2 flex gap-1.5 flex-wrap items-center">
                    <StatusChip value={b.status === "Pending" ? "Pending Approval" : b.status} />

                    {/* Rich Payment Approval Badges */}
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#71877B]/30 bg-[#EBF3EF] px-2.5 py-0.5 text-xs font-semibold text-[#3E8066]">
                        <CheckCircle2 className="w-3 h-3 text-[#3E8066]" /> Confirmed & Paid
                      </span>
                    ) : isSubmitted ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#B98235]/30 bg-[#FDF5E6] px-2.5 py-0.5 text-xs font-semibold text-[#B98235]">
                        <Clock className="w-3 h-3 text-[#B98235]" /> Awaiting Admin Approval
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#B85C56]/30 bg-[#FDF0EE] px-2.5 py-0.5 text-xs font-semibold text-[#B85C56]">
                        <XCircle className="w-3 h-3 text-[#B85C56]" /> Payment Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#DFDED7] bg-[#F7F6F2] px-2.5 py-0.5 text-xs font-semibold text-[#65717B]">
                        <AlertCircle className="w-3 h-3 text-[#65717B]" /> Payment Required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Rejection Cause Banner */}
              {isRejected && (
                <div className="mx-4 mb-2 p-3 rounded-xl bg-[#FDF0EE] border border-[#B85C56]/30 text-xs text-[#B85C56]">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-[#B85C56] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-[#B85C56]">Payment Rejected by Admin</p>
                      <p className="mt-0.5 text-[#B85C56]">
                        <b>Cause:</b> {b.rejectionReason || "Payment details could not be verified."}
                      </p>
                      <p className="mt-1 text-[11px] text-[#B85C56]">
                        Please review the cause above and re-submit your payment details.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details Banner if submitted or paid */}
              {(isSubmitted || isPaid) && (
                <div className="mx-4 mb-2 p-2.5 rounded-xl bg-[#F7F6F2] border border-[#DFDED7] text-xs text-[#65717B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#65717B]">{b.paymentMethod || "Cash"} Payment:</span>{" "}
                    <span className="font-bold text-[#17232F]">₹{Number(b.amount || 0).toLocaleString("en-IN")}</span>
                    {b.paymentMethod !== "Cash" && b.transactionId && b.transactionId !== "CASH-PAYMENT" && (
                      <span className="text-[#65717B] font-mono ml-1.5 truncate max-w-[120px] inline-block align-bottom">
                        (Ref: {b.transactionId})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isPaid && (
                      <button
                        type="button"
                        onClick={() => openInvoiceModal(b)}
                        className="text-[#B9965B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        title="View official tax invoice"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#B9965B]" />
                        <span>Tax Invoice</span>
                      </button>
                    )}
                    {b.paymentScreenshot && (
                      <a
                        href={b.paymentScreenshot.startsWith("/") ? BACKEND + b.paymentScreenshot : b.paymentScreenshot}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#65717B] font-bold hover:underline flex items-center gap-0.5"
                      >
                        Receipt <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {b.agent && (
                <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-[#F7F6F2] px-3 py-2 text-xs">
                  <UserIcon className="h-3.5 w-3.5 text-[#65717B]" />
                  <span>
                    <b>Agent:</b> {b.agent.name} · {b.agent.phone || b.agent.email}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons Footer */}
            <div className="p-4 pt-2 border-t border-[#DFDED7] flex items-center gap-2">
              {/* If Paid / Confirmed: Option for Invoice */}
              {isPaid && (
                <button
                  type="button"
                  onClick={() => openInvoiceModal(b)}
                  className="flex-1 rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-[#B9965B] hover:bg-[#a6844d] text-white shadow-xs hover:shadow-md"
                >
                  <Receipt className="w-4 h-4 text-white" />
                  <span>Download / View Invoice</span>
                </button>
              )}

              {/* Payment Button if not yet confirmed */}
              {!isPaid && (
                <button
                  type="button"
                  onClick={() => openPayModal(b)}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSubmitted
                      ? "border border-[#B98235]/30 bg-[#FDF5E6]/70 text-[#B98235] hover:bg-[#FDF5E6]"
                      : isRejected
                      ? "bg-[#B85C56] hover:bg-[#B85C56]/90 text-white shadow-sm hover:shadow"
                      : "bg-[#B9965B] hover:bg-[#a6844d] text-white shadow-sm hover:shadow"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {isSubmitted ? "Update Payment Info" : isRejected ? "Re-submit Payment" : "Book & Make Payment"}
                </button>
              )}

              {/* Cancel Button */}
              {["Pending", "Confirmed"].includes(b.status) && (
                <button
                  type="button"
                  onClick={() => setCancel(b)}
                  className="rounded-xl border border-[#B85C56]/30 px-3 py-2 text-xs font-bold text-[#B85C56] hover:bg-[#FDF0EE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Cancel Confirmation Modal */}
      <Modal open={!!cancel} onClose={() => setCancel(null)} title="Cancel this tour?">
        <p className="text-sm text-[#65717B]">This will cancel your visit to <b>{cancel?.property?.title}</b>.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setCancel(null)} className="flex-1 rounded-xl border py-2 text-sm font-semibold text-[#65717B] hover:bg-[#F7F6F2]">Keep it</button>
          <button onClick={doCancel} className="flex-1 rounded-xl bg-[#B85C56] py-2 text-sm font-bold text-white hover:bg-[#B85C56]/90">Cancel tour</button>
        </div>
      </Modal>

      {/* Payment / Booking Completion Modal */}
      <Modal
        open={!!payBooking}
        onClose={() => !submittingPayment && setPayBooking(null)}
        title="Complete Booking Payment"
      >
        {payBooking && (
          <form onSubmit={handlePaySubmit} className="space-y-4">
            {/* Property Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-[#F7F6F2] border border-[#DFDED7] rounded-xl">
              <span className="text-2xl">🏡</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#17232F] text-sm truncate">{payBooking.property?.title}</p>
                <p className="text-xs text-[#65717B]">
                  {payBooking.property?.propertyId ? `Code: ${payBooking.property.propertyId} · ` : ""}
                  {new Date(payBooking.bookingDate).toLocaleDateString()} · {payBooking.tourType || "In-Person"}
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65717B] mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "Cash", label: "Cash", icon: "💵" },
                  { id: "UPI", label: "UPI / QR", icon: "📱" },
                  { id: "Bank Transfer", label: "NetBanking", icon: "🏦" },
                  { id: "Card", label: "Card", icon: "💳" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayForm((prev) => ({ ...prev, paymentMethod: m.id }))}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      payForm.paymentMethod === m.id
                        ? "border-[#B9965B] bg-[#F4EFE6] text-[#B9965B] shadow-xs ring-1 ring-[#B9965B]"
                        : "border-[#DFDED7] bg-white text-[#65717B] hover:bg-[#F7F6F2]"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payer Name */}
            <div>
              <label className="block text-xs font-bold text-[#65717B] mb-1">
                Payer Full Name
              </label>
              <input
                type="text"
                required
                value={payForm.payerName}
                onChange={(e) => setPayForm({ ...payForm, payerName: e.target.value })}
                placeholder="Enter payer full name"
                className={inputCls}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-[#65717B] mb-1">
                Amount to Pay (₹) <span className="text-[#B85C56]">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                placeholder="e.g. 5000"
                className={inputCls}
              />
              <p className="text-[11px] text-[#65717B] mt-1">
                Advance booking / visit fee deposit to be approved by administrator.
              </p>
            </div>

            {/* Conditional Display: If CASH, hide Transaction ID and Screenshot */}
            {payForm.paymentMethod === "Cash" ? (
              <div className="p-3.5 bg-[#FDF5E6] border border-[#B98235]/30 rounded-xl text-xs text-[#B98235] leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-[#B98235]">
                  <span>💵</span> Cash Payment Option Selected
                </p>
                <p>
                  No transaction reference or screenshot is needed. Simply submit the amount of{" "}
                  <b>₹{Number(payForm.amount || 0).toLocaleString("en-IN")}</b> and pay in cash directly at our
                  PrimeNest office or to the authorized representative during your tour.
                </p>
              </div>
            ) : (
              /* If Online (UPI, Bank Transfer, Card): Show Transaction ID and Screenshot */
              <>
                <div>
                  <label className="block text-xs font-bold text-[#65717B] mb-1">
                    Transaction ID / Reference UTR <span className="text-[#B85C56]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payForm.transactionId}
                    onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })}
                    placeholder="e.g. UPI Ref / 12-digit Bank UTR / Txn No."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#65717B] mb-1">
                    Payment Receipt / Screenshot Proof
                  </label>
                  {payForm.screenshot ? (
                    <div className="relative border border-[#DFDED7] rounded-xl p-2.5 bg-[#F7F6F2] flex items-center gap-3">
                      <img
                        src={payForm.screenshot.startsWith("/") ? BACKEND + payForm.screenshot : payForm.screenshot}
                        alt="Receipt preview"
                        className="h-16 w-16 object-cover rounded-lg border border-[#DFDED7]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#65717B]">Receipt Attached</p>
                        <a
                          href={payForm.screenshot.startsWith("/") ? BACKEND + payForm.screenshot : payForm.screenshot}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#B9965B] hover:underline font-semibold"
                        >
                          View full image ↗
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPayForm({ ...payForm, screenshot: "" })}
                        className="text-[#65717B] hover:text-[#B85C56] p-1 text-xs font-bold cursor-pointer"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#DFDED7] hover:border-[#B9965B] rounded-xl p-4 cursor-pointer bg-[#F7F6F2] hover:bg-[#F4EFE6]/30 transition-all">
                      <UploadCloud className="h-6 w-6 text-[#65717B] mb-1" />
                      <span className="text-xs font-bold text-[#65717B]">
                        {screenshotUploading ? "Uploading receipt image..." : "Upload payment screenshot"}
                      </span>
                      <span className="text-[10px] text-[#65717B]">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={screenshotUploading}
                        onChange={handleScreenshotUpload}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#65717B] mb-1">
                    Additional Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={payForm.notes}
                    onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                    placeholder="e.g. Paid via GPay from SBI account"
                    className={inputCls}
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPayBooking(null)}
                disabled={submittingPayment}
                className="flex-1 rounded-xl border border-[#DFDED7] py-2.5 text-xs font-bold text-[#65717B] hover:bg-[#F7F6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPayment || screenshotUploading}
                className="flex-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] py-2.5 text-xs font-bold text-white shadow-md shadow-[#B9965B]/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submittingPayment ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>
          </form>
        )}
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
            ? `${BACKEND}/api/client/bookings/${invoiceBooking._id}/invoice?format=pdf`
            : null
        }
      />
    </div>
  );
}
