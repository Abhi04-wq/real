import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { DataTable, Pagination, Badge, statusTone, filterSelectCls } from "../components/ui";
import { Check, CheckCheck } from "lucide-react";

export default function Commissions({ canManage = true }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/commissions", { params: { page, limit: 10, status } });
      setRows(data.data); setMeta(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(1); }, [status]);
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={filterSelectCls}><option value="">All statuses</option>{["Pending", "Approved", "Paid", "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      <DataTable loading={loading} columns={[
        { key: "agent", label: "Agent", render: (c) => <span className="font-semibold text-xs text-[#17232F]">{c.agent?.name || "—"}</span> },
        { key: "property", label: "Property", render: (c) => <span className="text-xs text-[#65717B]">{c.property?.title || "—"}</span> },
        { key: "transaction", label: "Sale", render: (c) => <span className="font-mono text-xs text-[#17232F]">₹{Number(c.transaction?.amount || 0).toLocaleString("en-IN")}</span> },
        { key: "percentage", label: "%", render: (c) => <span className="font-mono text-xs font-semibold text-[#B9965B]">{c.percentage}%</span> },
        { key: "amount", label: "Commission", render: (c) => <span className="font-mono font-bold text-xs text-[#3E8066]">₹{Number(c.amount).toLocaleString("en-IN")}</span> },
        { key: "status", label: "Status", render: (c) => <Badge value={c.status} tone={statusTone(c.status)} /> },
        { key: "actions", label: "Actions", render: (c) => (
          canManage ? (
            <div className="flex items-center gap-1.5">
              {c.status !== "Approved" && c.status !== "Paid" && (
                <button
                  onClick={() => api.put(`/commissions/${c._id}`, { status: "Approved" }).then(() => load(meta.page))}
                  title="Approve commission"
                  aria-label="Approve commission"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#71877B]/30 bg-[#EBF3EF] text-[#3E8066] hover:bg-[#DFEDE6] transition shadow-xs cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              {c.status !== "Paid" && (
                <button
                  onClick={() => api.put(`/commissions/${c._id}`, { status: "Paid" }).then(() => load(meta.page))}
                  title="Mark commission as paid"
                  aria-label="Mark paid"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#B9965B] bg-[#B9965B] text-white hover:bg-[#a6844d] transition shadow-xs cursor-pointer"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : <span className="text-xs text-[#65717B]">View only</span>
        ) },
      ]} rows={rows} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />
    </div>
  );
}

