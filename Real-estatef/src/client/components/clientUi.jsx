import { X } from "lucide-react";

export function MetricCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 shadow-[0_2px_12px_rgba(23,35,47,0.03)] transition-all hover:border-[#B9965B]/50 hover:shadow-[0_4px_16px_rgba(23,35,47,0.06)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#65717B]">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B] text-base">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#17232F]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#65717B]">{sub}</p>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-[#EAE8E1] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
    </div>
  );
}

export function EmptyState({ icon = "📭", title = "Nothing here yet", hint = "", action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DFDED7] bg-white px-6 py-12 text-center shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
      <span className="text-4xl">{icon}</span>
      <p className="mt-3 font-semibold text-[#17232F]">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-[#65717B]">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17232F]/50 backdrop-blur-xs p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[#DFDED7] bg-white shadow-[0_20px_50px_rgba(23,35,47,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-[#DFDED7] bg-[#F7F6F2] px-6 py-4">
          <h3 className="text-lg font-bold text-[#17232F] tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFDED7] bg-white text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#B9965B] hover:border-[#B9965B]/40 transition shadow-xs cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 bg-white text-[#17232F]">{children}</div>
      </div>
    </div>
  );
}

export function StatusChip({ value }) {
  const v = String(value || "").toLowerCase().trim();
  let tone = "bg-[#F7F6F2] text-[#65717B] border-[#DFDED7]";
  if (
    ["new", "pending", "pending approval", "pending review", "countered", "reserved", "contacted", "negotiation", "under contract", "showing scheduled"].includes(v)
  ) {
    tone = "bg-[#FDF5E6] text-[#B98235] border-[#B98235]/30";
  } else if (
    ["active", "paid", "completed", "confirmed", "accepted", "available", "approved", "closed", "converted", "done", "success"].includes(v)
  ) {
    tone = "bg-[#EBF3EF] text-[#3E8066] border-[#71877B]/30";
  } else if (["rented", "ongoing", "sold / rented"].includes(v)) {
    tone = "bg-[#F4EFE6] text-[#B9965B] border-[#B9965B]/30";
  } else if (["cancelled", "rejected", "lost", "failed"].includes(v)) {
    tone = "bg-[#FDF0EE] text-[#B85C56] border-[#B85C56]/30";
  } else if (["sold"].includes(v)) {
    tone = "bg-[#F7F6F2] text-[#65717B] border-[#DFDED7]";
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs ${tone}`}
    >
      {value}
    </span>
  );
}

export const inputCls = "w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3.5 py-2 text-sm text-[#17232F] placeholder-[#929A9D] outline-none transition hover:border-[#B9965B]/40 focus:border-[#B9965B] focus:ring-1 focus:ring-[#B9965B]/30 shadow-xs";

export function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#17232F]">{label}</span>{children}</label>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div role="alert" className="rounded-xl border border-[#B85C56]/30 bg-[#FDF0EE] px-3.5 py-2.5 text-sm text-[#B85C56]">{message}</div>;
}

export const mapsUrl = (lat, lng, label) =>
  lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label || "")}`;
