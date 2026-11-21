import React, { useRef, useState } from "react";
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LuxuryInvoiceModal({
  open,
  onClose,
  invoice,
  loading = false,
  downloadUrl = null,
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    const ref = invoice?.payment?.transactionId || invoice?.invoiceNumber || "";
    if (ref) {
      navigator.clipboard.writeText(ref);
      setCopied(true);
      toast.success("Transaction reference copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    if (!downloadUrl) {
      handlePrint();
      return;
    }
    setDownloading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice?.invoiceNumber || "Invoice"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF invoice downloaded");
    } catch (err) {
      toast.error("Opening browser print window...");
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-md transition-all">
      {/* Print isolation styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-printable-sheet, #invoice-printable-sheet * {
            visibility: visible !important;
          }
          #invoice-printable-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: 1px solid #E2E8F0 !important;
            background: #FFFFFF !important;
            color: #0F172A !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#0F1622] shadow-2xl border border-[#29374B] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (no-print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-[#080C13] border-b border-[#29374B] text-[#F0F4FA] shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#172235] text-[#86A9D8] border border-[#29374B]">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#86A9D8]">
                  Verified Official Receipt
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#172E24] px-2 py-0.2 text-[10px] font-bold text-[#70C6A5] border border-[#70C6A5]/30">
                  <ShieldCheck className="h-3 w-3" /> Confirmed
                </span>
              </div>
              <h2 className="text-sm font-bold text-[#F0F4FA] font-mono">
                {invoice?.invoiceNumber || "Tax Invoice & Receipt"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D2A3D] px-3 py-1.5 text-xs font-bold text-[#F0F4FA] hover:bg-[#243247] transition cursor-pointer border border-[#29374B] shadow-2xs"
              title="Print official invoice"
            >
              <Printer className="h-3.5 w-3.5 text-[#86A9D8]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#86A9D8] px-3 py-1.5 text-xs font-bold text-[#0B0F17] hover:bg-[#86A9D8]/90 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="Download official PDF copy"
            >
              <Download className="h-3.5 w-3.5 text-[#0B0F17]" />
              <span className="hidden sm:inline">{downloading ? "Preparing..." : "PDF"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#9BA9BC] hover:bg-[#1D2A3D] hover:text-[#F0F4FA] transition cursor-pointer"
              title="Close invoice"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-[#0B0F17]/80 flex-1">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-[#86A9D8] border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-[#9BA9BC]">Generating verified invoice...</p>
            </div>
          ) : !invoice ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Invoice data could not be loaded. Please ensure the payment is approved.
            </div>
          ) : (
            /* The Printable Luxury Sheet */
            <div
              id="invoice-printable-sheet"
              className="relative mx-auto rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/90 text-slate-900 overflow-hidden"
            >
              {/* Decorative Watermark Seal */}
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 rounded-full border-12 border-emerald-500/5 bg-emerald-500/5 flex items-center justify-center select-none rotate-12">
                <span className="text-emerald-900/10 font-black text-3xl tracking-widest uppercase">
                  VERIFIED
                </span>
              </div>

              {/* Header: Company & Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏛️</span>
                    <h1 className="text-xl font-extrabold tracking-tight text-[#176B5B]">
                      {invoice.company?.name || "PRIMENEST REALTY"}
                    </h1>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
                    {invoice.company?.tagline || "Luxury Estates & Curated Residences"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    RERA: {invoice.company?.reraNumber || "RERA/PRM/2026/0891"} · GSTIN: {invoice.company?.taxNumber || "27AABCU9603R1ZX"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {invoice.company?.address || "PrimeNest Tower, BKC Financial District, Mumbai"} · {invoice.company?.phone || "+91 (022) 8800-NEST"}
                  </p>
                </div>

                <div className="sm:text-right flex flex-col sm:items-end">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 border border-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Official Tax Invoice & Receipt</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-slate-900">
                    Inv No: <span className="text-[#176B5B]">{invoice.invoiceNumber}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Date: <b>{new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</b>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Ref: {invoice.booking?.bookingId || invoice.payment?.transactionId || "—"}
                  </p>
                </div>
              </div>

              {/* Status & Confirmation Banner */}
              <div className="my-5 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white p-3.5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Payment Confirmed & Verified by Super Admin
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Funds successfully reconciled and credited to client account
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-black font-mono text-emerald-700 border border-emerald-300 shadow-2xs">
                    ● {invoice.status}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="no-print inline-flex items-center gap-1 rounded-lg bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                    title="Copy payment reference"
                  >
                    {copied ? <Check className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
                    <span>{copied ? "Copied" : "Copy UTR"}</span>
                  </button>
                </div>
              </div>

              {/* Two-Column Details (Billed To & Payment Meta) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Billed To (Customer)
                  </span>
                  <p className="text-sm font-bold text-slate-900">{invoice.customer?.name}</p>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{invoice.customer?.email || "—"}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{invoice.customer?.phone || "—"}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{invoice.customer?.address || "Registered Client Profile"}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Payment & Settlement Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Payment Method</p>
                      <p className="font-bold text-slate-900 mt-0.5">{invoice.payment?.method}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Settlement Date</p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {new Date(invoice.paymentDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 uppercase">Transaction ID / UTR</p>
                      <p className="font-mono text-xs font-bold text-slate-900 mt-0.5 truncate bg-white p-1 rounded border border-slate-200">
                        {invoice.payment?.transactionId || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-[#176B5B] text-white text-[10px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Service / Particulars</th>
                      <th className="py-2.5 px-3">Property ID</th>
                      <th className="py-2.5 px-3">SAC Code</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Taxable Value</th>
                      <th className="py-2.5 px-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{invoice.serviceDescription}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{invoice.property?.title}</p>
                        {invoice.property?.city && (
                          <span className="text-[10px] text-slate-400">
                            Location: {invoice.property.city}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {invoice.property?.propertyId || "PRM-EST"}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">997222</td>
                      <td className="py-3 px-3 text-center font-bold">1</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{invoice.payment?.baseAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{invoice.payment?.amount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation & Amount in Words */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="max-w-xs space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Amount in Words
                  </p>
                  <p className="text-xs font-semibold text-slate-800 italic leading-relaxed">
                    {invoice.amountInWords}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-2">
                    Tax Applied: 18% GST (9% CGST + 9% SGST included)
                  </p>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Taxable Base Value:</span>
                    <span className="font-mono">₹{invoice.payment?.baseAmount?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (9%):</span>
                    <span className="font-mono">
                      ₹{(Math.round((invoice.payment?.gstAmount || 0) / 2)).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9%):</span>
                    <span className="font-mono">
                      ₹{(Math.round((invoice.payment?.gstAmount || 0) / 2)).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-black text-[#176B5B]">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono text-base text-emerald-700">
                      ₹{invoice.payment?.amount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Seal & Signature Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-2xs font-bold text-[9px] text-center p-1 leading-tight">
                    OFFICIAL SEAL
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {invoice.company?.name || "PrimeNest Luxury Realty"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Verified by: <b>{invoice.verifiedBy || "Super Admin (Finance)"}</b>
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Digitally signed & authorized under Indian IT Act 2000
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="h-9 flex items-end justify-center sm:justify-end">
                    <span className="font-serif italic text-sm text-[#176B5B] font-bold">
                      PrimeNest Superadmin Signatory
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider border-t border-slate-300 pt-1 mt-1">
                    Authorized Signatory
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-[9px] text-slate-400">
                  This is a computer-generated tax invoice. No physical signature is required. For any inquiries, please contact {invoice.company?.email || "billing@primenest.com"}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close (no-print) */}
        <div className="no-print p-3 px-5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Click <b>Print</b> to save as PDF or print paper copy.</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
