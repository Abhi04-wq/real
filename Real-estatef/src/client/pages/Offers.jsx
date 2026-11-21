import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { client } from "../store";
import { Skeleton, EmptyState, StatusChip, Modal, Field, inputCls, ErrorBanner } from "../components/clientUi";

export default function Offers() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [offerFor, setOfferFor] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["client-offers"], queryFn: client.offers });
  const rows = data?.offers || [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["client-offers"] });

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try {
      await client.createOffer({ property: offerFor, amount: Number(amount), message });
      setOfferFor(null); setAmount(""); setMessage(""); refresh();
    } catch (ex) { setErr(ex.response?.data?.message || "Offer failed"); }
  };

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>;
  return (
    <div className="space-y-3">
      {rows.map((o) => (
        <div key={o._id} className="rounded-2xl border border-[#DFDED7] bg-white p-4 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="font-bold text-[#17232F]">{o.property?.title}</p><p className="text-xs text-[#65717B]">Offer <span className="font-mono font-bold text-[#B9965B]">₹{Number(o.amount).toLocaleString("en-IN")}</span>{o.counterAmount ? (<span> · Counter <span className="font-mono font-bold text-[#B9965B]">₹{Number(o.counterAmount).toLocaleString("en-IN")}</span></span>) : ""}</p></div>
            <StatusChip value={o.status} />
          </div>
          {o.message && <p className="mt-2 text-sm text-[#65717B]">"{o.message}"</p>}
          <div className="mt-2 space-y-1">{(o.timeline || []).map((t, i) => <p key={i} className="text-xs text-[#65717B]">{t.status} — {t.note}</p>)}</div>
        </div>
      ))}
      {!rows.length && <EmptyState icon="🏷️" title="No offers yet" hint="Open any listing to make your first price offer." action={<button onClick={() => nav("/properties")} className="rounded-xl bg-[#B9965B] px-4 py-2 text-sm font-bold text-white hover:bg-[#a6844d] transition">Explore Properties</button>} />}
      <Modal open={!!offerFor} onClose={() => setOfferFor(null)} title="Make an offer">
        <form onSubmit={submit} className="space-y-3">
          <ErrorBanner message={err} />
          <Field label="Offer amount (₹)"><input required type="number" min="1" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Message to seller (optional)"><textarea rows={2} className={inputCls} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
          <button className="w-full rounded-xl bg-[#B9965B] py-2.5 text-sm font-bold text-white hover:bg-[#a6844d] transition cursor-pointer">Submit offer</button>
        </form>
      </Modal>
    </div>
  );
}
