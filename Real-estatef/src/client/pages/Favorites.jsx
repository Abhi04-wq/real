import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Heart, CalendarPlus } from "lucide-react";
import { client } from "../store";
import { Skeleton, EmptyState, StatusChip } from "../components/clientUi";

export default function Favorites() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["client-favorites"], queryFn: client.favorites });
  const rows = data?.favorites || [];

  const unsave = async (id) => { await client.toggleFavorite(id); qc.invalidateQueries({ queryKey: ["client-favorites"] }); };

  if (isLoading) return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}</div>;
  if (!rows.length) return <EmptyState icon="❤️" title="No saved properties" hint="Tap the heart on any listing to build your wishlist." action={<button onClick={() => nav("/properties")} className="rounded-xl bg-[#B9965B] px-4 py-2 text-sm font-bold text-white hover:bg-[#a6844d] transition">Explore Properties</button>} />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((p) => (
        <div key={p._id} className="overflow-hidden rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] transition hover:border-[#B9965B]/50 hover:shadow-[0_4px_16px_rgba(23,35,47,0.06)]">
          {p.images?.[0] ? <img src={p.images[0]} className="h-44 w-full object-cover" /> : <div className="grid h-44 place-items-center bg-[#F7F6F2] text-4xl">🏠</div>}
          <div className="p-4">
            <p className="font-bold text-[#17232F]">{p.title}</p>
            <p className="text-xs text-[#65717B]">{p.city} · {p.propertyId}</p>
            <p className="mt-1 font-mono font-bold text-[#B9965B]">₹{Number(p.price).toLocaleString("en-IN")}</p>
            <div className="mt-2"><StatusChip value={p.status} /></div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => nav(`/property/${p._id}`)} className="flex-1 rounded-xl bg-[#B9965B] py-2 text-xs font-bold text-white hover:bg-[#a6844d] transition cursor-pointer">View</button>
              <button onClick={() => nav(`/home/my-bookings`)} title="Schedule visit" className="rounded-xl border border-[#DFDED7] bg-white px-3 py-2 text-[#65717B] hover:text-[#B9965B] hover:border-[#B9965B]/40 hover:bg-[#F7F6F2] transition cursor-pointer"><CalendarPlus className="h-4 w-4" /></button>
              <button onClick={() => unsave(p._id)} title="Remove" className="rounded-xl border border-[#DFDED7] bg-white px-3 py-2 text-red-500 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"><Heart className="h-4 w-4 fill-current" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
