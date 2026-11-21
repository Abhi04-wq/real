import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, FileText, CheckCircle2 } from "lucide-react";
import { client } from "../store";
import { Skeleton, EmptyState, StatusChip } from "../components/clientUi";
import LuxuryInvoiceModal from "../../components/LuxuryInvoiceModal";
import toast from "react-hot-toast";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Transactions() {
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["client-transactions"], queryFn: client.transactions });
  const rows = data?.transactions || [];

  const handleOpenInvoice = async (t) => {
    setSelectedTxn(t);
    setSelectedInvoice(null);
    setInvoiceLoading(true);
    try {
      const inv = await client.transactionInvoice(t._id);
      setSelectedInvoice(inv);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to load invoice");
      setSelectedTxn(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>;
  if (!rows.length) return <EmptyState icon="🧾" title="No transactions yet" hint="Token deposits and fee receipts will appear here with unique IDs." />;

  return (
    <div className="relative rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
      <div className="border-b border-[#DFDED7] bg-[#F7F6F2]/80 px-5 py-3.5 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B9965B]"></span>
          {rows.length} {rows.length === 1 ? "Payment Record" : "Payment Records"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#F7F6F2]/80 backdrop-blur-xl border-b border-[#DFDED7] text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
            <tr>
              <th className="py-3.5 px-4">Transaction ID</th>
              <th className="py-3.5 px-4">Property</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Tax Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFDED7]">
            {rows.map((t) => {
              const isPaid = t.status === "Paid";
              return (
                <tr
                  key={t._id}
                  className="group relative transition-colors bg-white hover:bg-[#F9F8F5]"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#B9965B]">{t.transactionId}</td>
                  <td className="py-3.5 px-4 font-semibold text-xs sm:text-sm text-[#17232F]">{t.property?.title || "—"}</td>
                  <td className="py-3.5 px-4 font-bold font-mono text-xs sm:text-sm text-[#17232F]">₹{Number(t.amount).toLocaleString("en-IN")}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#65717B]">{t.paymentMethod}</td>
                  <td className="py-3.5 px-4"><StatusChip value={t.status === "Paid" ? "completed" : t.status} /></td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#65717B]">{new Date(t.transactionDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    {isPaid ? (
                      <button
                        onClick={() => handleOpenInvoice(t)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3 py-1.5 text-xs font-bold text-[#7799B4] hover:text-[#B9965B] hover:border-[#B9965B]/40 transition shadow-xs cursor-pointer"
                        title="View official verified tax invoice"
                      >
                        <Receipt className="h-3.5 w-3.5 text-[#B9965B]" />
                        <span>View Invoice</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#65717B] font-mono italic">
                        Pending Approval
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Luxury Official Tax Invoice Modal */}
      <LuxuryInvoiceModal
        open={!!selectedInvoice || invoiceLoading}
        onClose={() => {
          setSelectedInvoice(null);
          setSelectedTxn(null);
          setInvoiceLoading(false);
        }}
        invoice={selectedInvoice}
        loading={invoiceLoading}
        downloadUrl={
          selectedTxn?._id
            ? `${BACKEND}/api/client/transactions/${selectedTxn._id}/invoice?format=pdf`
            : null
        }
      />
    </div>
  );
}
