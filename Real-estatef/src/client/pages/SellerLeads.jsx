import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../store";
import { Skeleton, EmptyState, StatusChip, Field, inputCls, ErrorBanner } from "../components/clientUi";

export default function SellerLeads() {
  const qc = useQueryClient();
  const [counter, setCounter] = useState({ id: null, amount: "" });
  const [err, setErr] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["seller-leads"], queryFn: client.sellerLeads });
  const refresh = () => qc.invalidateQueries({ queryKey: ["seller-leads"] });

  const respond = async (id, status) => {
    setErr("");
    try {
      await client.respondOffer(id, { status, counterAmount: status === "Countered" ? Number(counter.amount) : undefined });
      setCounter({ id: null, amount: "" }); refresh();
    } catch (ex) { setErr(ex.response?.data?.message || "Action failed"); }
  };

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>;
  const tours = data?.tours || [], offers = data?.offers || [];
  if (!tours.length && !offers.length) return <EmptyState icon="📥" title="No requests yet" hint="Tour bookings and buyer offers on your homes will appear here." />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
        <h3 className="mb-2 font-bold text-[#17232F]">Tour Requests ({tours.length})</h3>
        {tours.map((t) => (
          <div key={t._id} className="border-b border-[#DFDED7] py-2 text-sm last:border-0">
            <p className="font-bold text-[#17232F]">{t.user?.name} · {t.user?.phone}</p>
            <p className="text-[#65717B]">{t.property?.title} · {new Date(t.bookingDate).toLocaleString()}</p>
            <StatusChip value={t.status} />
          </div>))}
        {!tours.length && <p className="text-sm text-[#65717B]">No tour requests.</p>}
      </div>
      <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
        <h3 className="mb-2 font-bold text-[#17232F]">Buyer Offers ({offers.length})</h3>
        <ErrorBanner message={err} />
        {offers.map((o) => (
          <div key={o._id} className="border-b border-[#DFDED7] py-2 text-sm last:border-0">
            <p className="font-bold text-[#17232F]">{o.buyer?.name} offered <span className="font-mono text-[#B9965B]">₹{Number(o.amount).toLocaleString("en-IN")}</span></p>
            <p className="text-[#65717B]">{o.property?.title}</p>
            <div className="mt-1 flex items-center gap-1"><StatusChip value={o.status} />
              {o.status === "Pending" && <>
                <button onClick={() => respond(o._id, "Accepted")} className="rounded-lg bg-[#B9965B] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#a6844d] transition cursor-pointer">Accept</button>
                <button onClick={() => respond(o._id, "Rejected")} className="rounded-lg border border-[#DFDED7] bg-white px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer">Reject</button>
                <button onClick={() => setCounter({ id: o._id, amount: "" })} className="rounded-lg border border-[#DFDED7] bg-[#F7F6F2] px-2 py-1 text-[11px] font-semibold text-[#65717B] hover:text-[#B9965B] hover:border-[#B9965B]/40 transition cursor-pointer">Counter</button>
              </>}
            </div>
            {counter.id === o._id && <div className="mt-2 flex gap-1">
              <input type="number" placeholder="Counter amount ₹" className={inputCls} value={counter.amount} onChange={(e) => setCounter({ ...counter, amount: e.target.value })} />
              <button onClick={() => respond(o._id, "Countered")} className="rounded-xl bg-[#B9965B] px-3 text-xs font-bold text-white hover:bg-[#a6844d] transition cursor-pointer">Send</button>
            </div>}
          </div>))}
        {!offers.length && <p className="text-sm text-[#65717B]">No offers.</p>}
      </div>
    </div>
  );
}
