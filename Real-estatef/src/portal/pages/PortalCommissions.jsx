import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Clock, CheckCircle } from "lucide-react";
import { agentApi } from "../store";
import { MetricCard, Skeleton, EmptyState, StageBadge } from "../components/portalUi";

export default function PortalCommissions() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["agent-commissions", status], queryFn: () => agentApi.commissions({ status: status || undefined, limit: 50 }) });

  const payout = async (id) => {
    try { await agentApi.requestPayout(id); qc.invalidateQueries({ queryKey: ["agent-commissions"] }); }
    catch (ex) { alert(ex.response?.data?.message || "Request failed"); }
  };

  if (isLoading) return <div className="grid grid-cols-3 gap-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  const s = data.summary;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={<Wallet className="h-5 w-5 text-emerald-600" />} label="Total Earned (Paid)" value={`₹${Number(s.paid).toLocaleString("en-IN")}`} />
        <MetricCard icon={<Clock className="h-5 w-5 text-amber-600" />} label="Pending Approval" value={`₹${Number(s.pendingApproval).toLocaleString("en-IN")}`} />
        <MetricCard icon={<CheckCircle className="h-5 w-5 text-blue-600" />} label="My Split Rate" value={s.splitRate != null ? `${s.splitRate}%` : "—"} sub="Commission = Deal × Split ÷ 100" />
      </div>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[#DFDED7] bg-white text-[#17232F] px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#B9965B]"
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {!data.data.length ? <EmptyState icon="💰" title="No deals yet" hint="Closed deals appear here with your split automatically calculated." />
        : <div className="relative rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
            <div className="bg-[#F7F6F2]/80 border-b border-[#DFDED7] px-5 py-3.5 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B9965B]"></span>
                {data.data.length} {data.data.length === 1 ? "Commission Record" : "Commission Records"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F7F6F2]/80 backdrop-blur-xl border-b border-[#DFDED7] text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
                  <tr>
                    <th className="py-3.5 px-4">Property</th>
                    <th className="py-3.5 px-4">Deal Value</th>
                    <th className="py-3.5 px-4">Split</th>
                    <th className="py-3.5 px-4">Commission</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFDED7]">
                  {data.data.map((c, i) => (
                    <tr
                      key={c._id}
                      className={`group relative transition-colors bg-white hover:bg-[#F9F8F5]`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-xs sm:text-sm text-[#17232F] group-hover:text-[#B9965B] transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#B9965B]/60 group-hover:bg-[#B9965B] transition-colors"></div>
                          <span>{c.property?.title || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#17232F]">
                        ₹{Number(c.transaction?.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#7799B4]">
                        {c.percentage}%
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs sm:text-sm text-[#B9965B]">
                        ₹{Number(c.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <StageBadge value={c.status} />
                          {c.payoutRequested && c.status !== "Paid" && (
                            <span className="rounded-full bg-[#FDF5E6] border border-[#B9965B]/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#B9965B]">
                              Requested
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {c.status !== "Paid" && !c.payoutRequested ? (
                          <button
                            onClick={() => payout(c._id)}
                            className="rounded-xl bg-[#B9965B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#a6844d] transition shadow-md cursor-pointer"
                          >
                            Request Payout
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-[#65717B]">
                            {c.paidDate ? `Paid ${new Date(c.paidDate).toLocaleDateString()}` : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}
    </div>
  );
}
