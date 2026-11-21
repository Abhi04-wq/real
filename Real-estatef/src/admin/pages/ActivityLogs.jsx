import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { DataTable, Pagination, Toolbar, Badge, filterSelectCls } from "../components/ui";

export default function ActivityLogs() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/activity-logs", { params: { page, limit: 15, search, module } });
      setRows(data.data); setMeta(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(() => load(1), 300); return () => clearTimeout(t); }, [search, module]);
  return (
    <div>
      <Toolbar search={search} onSearch={setSearch}>
        <select value={module} onChange={(e) => setModule(e.target.value)} className={filterSelectCls}><option value="">All modules</option>{["users", "agents", "properties", "property-types", "leads", "bookings", "transactions", "commissions", "roles", "settings"].map((m) => <option key={m} value={m}>{m}</option>)}</select>
      </Toolbar>
      <DataTable loading={loading} columns={[
        { key: "user", label: "User", render: (a) => <div><p className="font-semibold text-xs text-[#17232F]">{a.user?.name || "system"}</p><p className="text-[11px] font-medium text-[#65717B]">{a.user?.email || ""}</p></div> },
        { key: "action", label: "Action", render: (a) => <span className="font-semibold text-xs text-[#17232F]">{a.action}</span> },
        { key: "module", label: "Module", render: (a) => <Badge value={a.module} tone="gold" /> },
        { key: "description", label: "Description", render: (a) => <span className="text-xs text-[#65717B]">{a.description?.slice(0, 80)}</span> },
        { key: "ipAddress", label: "IP", render: (a) => <span className="font-mono text-xs text-[#B9965B]">{a.ipAddress || "—"}</span> },
        { key: "createdAt", label: "Date", render: (a) => <span className="text-xs text-[#65717B] font-mono">{new Date(a.createdAt).toLocaleString()}</span> },
      ]} rows={rows} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />
    </div>
  );
}

