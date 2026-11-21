import { useState, useMemo, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox, ChevronLeft, ChevronRight, X } from "lucide-react";

export function StatCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 shadow-[0_2px_12px_rgba(23,35,47,0.03)] transition-all hover:border-[#B9965B]/50 hover:shadow-[0_4px_16px_rgba(23,35,47,0.06)] hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#65717B]">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F6F2] text-[#B9965B] border border-[#DFDED7]">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold font-mono text-[#17232F] tracking-tight">{value ?? "—"}</p>
      {sub && <p className="mt-1.5 text-xs text-[#65717B] flex items-center gap-1.5">{sub}</p>}
    </div>
  );
}

export function Badge({ value, tone }) {
  const tones = {
    blue: "bg-[#F0F4F8] text-[#7799B4] border border-[#7799B4]/30 shadow-xs",
    green: "bg-[#EBF3EF] text-[#3E8066] border border-[#71877B]/30 shadow-xs",
    emerald: "bg-[#EBF3EF] text-[#3E8066] border border-[#71877B]/30 shadow-xs",
    gold: "bg-[#FDF5E6] text-[#B9965B] border border-[#B9965B]/30 shadow-xs",
    red: "bg-[#FDF0EE] text-[#B85C56] border border-[#B85C56]/30 shadow-xs",
    amber: "bg-[#FDF5E6] text-[#B98235] border border-[#B98235]/30 shadow-xs",
    violet: "bg-[#F4EFF8] text-[#8E6CA8] border border-[#8E6CA8]/30 shadow-xs",
    gray: "bg-[#F7F6F2] text-[#65717B] border border-[#DFDED7] shadow-xs",
    slate: "bg-[#F7F6F2] text-[#65717B] border border-[#DFDED7] shadow-xs",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase select-none transition-all ${tones[tone] || tones.gray}`}>
      {String(value)}
    </span>
  );
}

export function statusTone(s) {
  const v = String(s || "").toLowerCase();
  if (["available", "active", "approved", "completed", "confirmed"].includes(v)) return "green";
  if (["rented", "booked"].includes(v)) return "gold";
  if (["pending", "reserved", "new", "follow-up", "contacted"].includes(v)) return "amber";
  if (["failed", "cancelled", "rejected", "lost", "inactive", "suspended"].includes(v)) return "red";
  if (["sold"].includes(v)) return "blue";
  return "green";
}

export function DataTable({ columns, rows, loading, empty = "No records found.", sortable = true }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (key) => {
    if (!sortable || !key) return;
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!rows || !rows.length || !sortKey) return rows || [];
    return [...rows].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDirection]);

  if (loading) {
    return (
      <div className="space-y-3.5">
        <div className="inline-flex items-center gap-2 rounded-2xl p-[2px] bg-white border border-[#DFDED7]">
          <div className="flex items-center gap-2.5 rounded-[14px] bg-[#F7F6F2] px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#B9965B] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#65717B]">Loading Data...</span>
          </div>
        </div>
        <div className="relative rounded-2xl p-4 bg-white border border-[#DFDED7] shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-[#F7F6F2] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="relative rounded-2xl p-8 bg-white border border-[#DFDED7] shadow-[0_2px_12px_rgba(23,35,47,0.03)] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B] shadow-xs mb-3">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold text-[#17232F]">No Records Available</h4>
        <p className="mt-1 text-xs text-[#65717B] max-w-sm mx-auto">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Top Capsule Counter & Reset Sort */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-xl p-[2px] bg-white border border-[#DFDED7] shadow-xs">
          <div className="flex items-center gap-2 rounded-[10px] bg-[#F7F6F2] px-3.5 py-1.5 border border-[#DFDED7]/60">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3E8066] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3E8066]"></span>
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#17232F]">
              {sortedRows.length} {sortedRows.length === 1 ? "RECORD" : "RECORDS"}
            </span>
          </div>
        </div>

        {sortKey && (
          <button
            type="button"
            onClick={() => { setSortKey(null); setSortDirection("asc"); }}
            className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#B9965B] bg-white hover:bg-[#F7F6F2] border border-[#DFDED7] shadow-xs transition cursor-pointer"
          >
            Reset Sort
          </button>
        )}
      </div>

      {/* Main Luxury Light Table Chassis */}
      <div className="relative rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F6F2]/80 border-b border-[#DFDED7]">
                {columns.map((c, colIdx) => {
                  const isCurrentSort = sortKey === c.key;
                  return (
                    <th
                      key={c.key || colIdx}
                      onClick={() => c.key && handleSort(c.key)}
                      className={`px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B] select-none border-r border-[#DFDED7]/50 last:border-r-0 ${
                        c.key ? "cursor-pointer hover:text-[#17232F] transition-colors" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{c.label}</span>
                        {c.key && (
                          <span className="text-[#B9965B]">
                            {isCurrentSort ? (
                              sortDirection === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[#B9965B]" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5 text-[#B9965B]" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 hover:opacity-100 transition-opacity" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDED7]">
              {sortedRows.map((r, i) => (
                <tr
                  key={r._id || i}
                  className="hover:bg-[#F9F8F5] transition-colors group"
                >
                  {columns.map((c, colIdx) => (
                    <td
                      key={c.key || colIdx}
                      className="px-4 py-3.5 align-middle text-[#17232F] border-r border-[#DFDED7]/30 last:border-r-0"
                    >
                      {c.render ? c.render(r) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Action3DButton({ onClick, icon: Icon, title, variant = "default", className = "" }) {
  let colorCls = "bg-[#F7F6F2] border border-[#DFDED7] text-[#65717B] hover:text-[#17232F] hover:border-[#B9965B]/50 hover:bg-[#F0EFE9] shadow-xs";
  if (variant === "danger") {
    colorCls = "bg-[#FDF0EE] border border-[#B85C56]/30 text-[#B85C56] hover:bg-[#FBE4E2] shadow-xs";
  } else if (variant === "success") {
    colorCls = "bg-[#EBF3EF] border border-[#71877B]/30 text-[#3E8066] hover:bg-[#DFEDE6] shadow-xs";
  } else if (variant === "warning") {
    colorCls = "bg-[#FDF5E6] border border-[#B98235]/30 text-[#B98235] hover:bg-[#FCECD0] shadow-xs";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-xl transition-all cursor-pointer active:translate-y-[1px] select-none ${colorCls} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between border-t border-[#DFDED7] pt-4 px-1 text-xs text-[#65717B]">
      <p className="font-medium">
        Page <span className="font-bold font-mono text-[#17232F]">{page}</span> of{" "}
        <span className="font-bold font-mono text-[#17232F]">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button 
          disabled={page <= 1} 
          onClick={() => onChange(page - 1)} 
          className="inline-flex items-center gap-1 rounded-xl border border-[#DFDED7] bg-white px-3 py-1.5 text-xs font-semibold text-[#65717B] shadow-xs transition hover:bg-[#F7F6F2] hover:text-[#17232F] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>
        <div className="hidden sm:flex items-center gap-1 px-1">
          {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
            let pageNum = idx + 1;
            if (totalPages > 5 && page > 3) {
              pageNum = Math.min(page - 2 + idx, totalPages);
            }
            return (
              <button
                key={pageNum}
                onClick={() => onChange(pageNum)}
                className={`h-7 w-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                  page === pageNum
                    ? "bg-[#B9965B] text-white shadow-xs"
                    : "text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button 
          disabled={page >= totalPages} 
          onClick={() => onChange(page + 1)} 
          className="inline-flex items-center gap-1 rounded-xl border border-[#DFDED7] bg-white px-3 py-1.5 text-xs font-semibold text-[#65717B] shadow-xs transition hover:bg-[#F7F6F2] hover:text-[#17232F] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, subtitle, children, footer, wide, size }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKey = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  let widthCls = "max-w-md";
  if (size === "sm") widthCls = "max-w-sm";
  else if (size === "md") widthCls = "max-w-md";
  else if (size === "lg" || wide) widthCls = "max-w-md sm:max-w-lg lg:max-w-2xl";
  else if (size === "xl") widthCls = "max-w-lg sm:max-w-xl lg:max-w-3xl";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-[#17232F]/50 backdrop-blur-xs transition-opacity drawer-backdrop-animate cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-8 pointer-events-none">
        <div 
          onClick={(e) => e.stopPropagation()} 
          className={`pointer-events-auto flex h-full w-screen ${widthCls} flex-col border-l border-[#DFDED7] bg-white text-[#17232F] shadow-[0_20px_50px_rgba(23,35,47,0.18)] drawer-animate-in overflow-hidden`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-[#DFDED7] px-5 sm:px-6 py-4 bg-[#F7F6F2] shrink-0 z-10">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#17232F] tracking-tight">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-[#65717B]">{subtitle}</p>}
            </div>
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close drawer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFDED7] bg-white text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#B9965B] hover:border-[#B9965B]/40 transition shadow-xs cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 drawer-content-scroll bg-white text-[#17232F] min-h-0">
            {children}
          </div>

          {/* Drawer Pinned Footer (Permanent bottom dock with zero gap) */}
          {footer && (
            <div className="shrink-0 border-t border-[#DFDED7] bg-white px-4 sm:px-6 py-3.5 flex items-center justify-end gap-2.5 z-20 shadow-[0_-4px_16px_rgba(23,35,47,0.04)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Modal = Drawer;

export function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", message }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[#65717B] leading-relaxed">{message}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button 
          onClick={onClose} 
          className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-4 py-2 text-xs font-semibold text-[#65717B] hover:bg-[#F0EFE9] hover:text-[#17232F] transition cursor-pointer"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm} 
          className="rounded-xl border border-[#B85C56]/30 bg-[#B85C56] text-white px-4 py-2 text-xs font-semibold hover:bg-[#a54c46] transition cursor-pointer shadow-xs"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}

export function Toolbar({ search, onSearch, children, onExport }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2.5">
      <input 
        value={search} 
        onChange={(e) => onSearch(e.target.value)} 
        placeholder="Search…"
        className="w-64 rounded-xl border border-[#DFDED7] bg-white px-3.5 py-2 text-sm text-[#17232F] placeholder-[#929A9D] shadow-xs outline-none transition hover:border-[#B9965B]/60 focus:border-[#B9965B] focus:ring-2 focus:ring-[#B9965B]/20" 
      />
      {children}
      <div className="ml-auto flex gap-2">{onExport}</div>
    </div>
  );
}

export const filterSelectCls = "rounded-xl border border-[#DFDED7] bg-white px-3 py-2 text-xs font-semibold text-[#17232F] shadow-xs outline-none transition hover:border-[#B9965B]/50 focus:border-[#B9965B] focus:ring-2 focus:ring-[#B9965B]/20 cursor-pointer";

export function FormSection({ icon: Icon, title, description, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-[#DFDED7] bg-white p-4 shadow-xs transition hover:border-[#B9965B]/35 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-start gap-2.5 mb-3.5 pb-2.5 border-b border-[#DFDED7]">
          {Icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F7F6F2] text-[#B9965B] border border-[#DFDED7]">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            {title && <h4 className="text-xs font-bold text-[#17232F] uppercase tracking-wider">{title}</h4>}
            {description && <p className="text-[11px] text-[#65717B] mt-0.5">{description}</p>}
          </div>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function FormActions({ onCancel, submitLabel = "Save Changes", loading = false, cancelLabel = "Cancel", form, className = "" }) {
  return (
    <div className={`sticky bottom-0 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 mt-6 flex items-center justify-end gap-2.5 border-t border-[#DFDED7] bg-white px-4 sm:px-6 py-3.5 shadow-[0_-4px_16px_rgba(23,35,47,0.06)] z-20 ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-4 py-2 text-xs font-semibold text-[#65717B] hover:bg-[#F0EFE9] hover:text-[#17232F] transition cursor-pointer disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        form={form}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#a6844d] transition cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Saving...</span>
          </>
        ) : (
          <span>{submitLabel}</span>
        )}
      </button>
    </div>
  );
}

export function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#17232F]">
          {label} {required && <span className="text-[#B85C56] font-bold">*</span>}
        </span>
        {hint && <span className="text-[10px] text-[#B9965B]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export const inputCls = "w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3.5 py-2 text-sm text-[#17232F] placeholder-[#929A9D] outline-none transition hover:border-[#B9965B]/40 focus:border-[#B9965B] focus:ring-1 focus:ring-[#B9965B]/30 shadow-xs";

export function useConfirm() {
  const [state, setState] = useState({ open: false, action: null, message: "" });
  const ask = (action, message) => setState({ open: true, action, message });
  const close = () => setState({ open: false, action: null, message: "" });
  const confirm = async () => { if (state.action) await state.action(); close(); };
  return { ...state, ask, close, confirm };
}
