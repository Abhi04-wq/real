import { useState, useEffect, useMemo, useId } from "react";
import api from "../../lib/adminApi";
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Search,
  Calendar,
  Layers,
  Database,
  BarChart3,
  Table as TableIcon,
  Code2,
  ListFilter,
  DollarSign,
  TrendingUp,
  Hash,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import toast from "react-hot-toast";

const REPORT_TYPES = [
  { id: "revenue", label: "Revenue & Finance", icon: "💰", desc: "Transactions, revenue flow, and payment methods" },
  { id: "bookings", label: "Bookings & Tours", icon: "📅", desc: "Customer tours, payment statuses, and agent assignments" },
  { id: "properties", label: "Properties Portfolio", icon: "🏢", desc: "Listings inventory, pricing, and availability" },
  { id: "transactions", label: "Transactions Ledger", icon: "💳", desc: "Financial records, transaction IDs, and statuses" },
  { id: "sales", label: "Sales & Deals", icon: "📈", desc: "Completed bookings, closed deals, and revenue" },
  { id: "leads", label: "Leads & Enquiries", icon: "🎯", desc: "Customer enquiries, status pipeline, and agent follow-ups" },
  { id: "commissions", label: "Agent Commissions", icon: "💼", desc: "Commission records, percentages, and approval status" },
  { id: "agents", label: "Agents Performance", icon: "👥", desc: "Agent statistics, bookings closed, and volume" },
  { id: "users", label: "Users & Customers", icon: "👤", desc: "Registered buyers, contact info, and roles" },
];

const PRESETS = [
  { label: "All Time", from: "", to: "" },
  {
    label: "Today",
    getRange: () => {
      const d = new Date().toISOString().split("T")[0];
      return { from: d, to: d };
    },
  },
  {
    label: "Last 7 Days",
    getRange: () => {
      const to = new Date().toISOString().split("T")[0];
      const from = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      return { from, to };
    },
  },
  {
    label: "This Month",
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const to = now.toISOString().split("T")[0];
      return { from, to };
    },
  },
  {
    label: "Last 30 Days",
    getRange: () => {
      const to = new Date().toISOString().split("T")[0];
      const from = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
      return { from, to };
    },
  },
  {
    label: "This Year",
    getRange: () => {
      const now = new Date();
      const from = `${now.getFullYear()}-01-01`;
      const to = now.toISOString().split("T")[0];
      return { from, to };
    },
  },
];

function formatJsonLine(line) {
  if (!line) return "";
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-400"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-sky-300 font-semibold"; // key
        } else {
          cls = "text-emerald-300"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-purple-400 font-semibold"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-rose-400 font-semibold"; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function Reports() {
  const [type, setType] = useState("revenue");
  const [range, setRange] = useState({ from: "", to: "" });
  const [activePreset, setActivePreset] = useState("All Time");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("json"); // "json" | "table"
  const [jsonIndent, setJsonIndent] = useState(2); // 2 or 4 or 0 (compact)
  const [jsonSearch, setJsonSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [maxRecords, setMaxRecords] = useState(100);
  const [tableSearch, setTableSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const rowsPerPage = 10;

  const run = async (selectedType = type, currentRange = range) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/${selectedType}`, { params: { ...currentRange } });
      setResult(data);
      setTablePage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run(type, range);
  }, [type]);

  const handlePreset = (preset) => {
    setActivePreset(preset.label);
    const newRange = preset.getRange ? preset.getRange() : { from: preset.from, to: preset.to };
    setRange(newRange);
    run(type, newRange);
  };

  const handleCopyJson = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, jsonIndent);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast.success("Full JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, jsonIndent || 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  const downloadCsv = async () => {
    try {
      toast.loading("Exporting CSV report...", { id: "csv" });
      const res = await api.get(`/reports/${type}`, {
        params: { ...range, format: "csv" },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV report downloaded", { id: "csv" });
    } catch (err) {
      toast.error("Failed to export CSV", { id: "csv" });
    }
  };

  // Formatted JSON string for viewer
  const formattedJsonData = useMemo(() => {
    if (!result) return "";
    let dataToFormat = result;
    if (result.data && maxRecords !== "all" && result.data.length > maxRecords) {
      dataToFormat = {
        ...result,
        data: result.data.slice(0, maxRecords),
        _meta: {
          note: `Showing first ${maxRecords} of ${result.data.length} records. Toggle 'All records' above to view entire dataset.`,
          totalRecords: result.data.length,
          previewCount: maxRecords,
        },
      };
    }
    return JSON.stringify(dataToFormat, null, jsonIndent);
  }, [result, jsonIndent, maxRecords]);

  // Compute lines for line numbers
  const jsonLines = useMemo(() => {
    if (!formattedJsonData) return [];
    return formattedJsonData.split("\n");
  }, [formattedJsonData]);

  // Filtered lines if jsonSearch is active
  const filteredLineIndices = useMemo(() => {
    if (!jsonSearch.trim() || !jsonLines.length) return null;
    const query = jsonSearch.toLowerCase();
    const matched = new Set();
    jsonLines.forEach((l, idx) => {
      if (l.toLowerCase().includes(query)) matched.add(idx);
    });
    return matched;
  }, [jsonLines, jsonSearch]);

  // Table rows and columns
  const tableData = useMemo(() => {
    if (!result?.data || !Array.isArray(result.data)) return { headers: [], rows: [] };
    const rows = result.data;
    if (!rows.length) return { headers: [], rows: [] };

    // Extract headers
    const sample = rows[0];
    const headers = Object.keys(sample).filter(
      (k) => !["__v", "password", "salt", "images", "timeline"].includes(k)
    );

    let filtered = rows;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      filtered = rows.filter((r) =>
        Object.values(r).some((v) =>
          typeof v === "object" ? JSON.stringify(v).toLowerCase().includes(q) : String(v).toLowerCase().includes(q)
        )
      );
    }

    return { headers, rows: filtered };
  }, [result, tableSearch]);

  const totalTablePages = Math.ceil(tableData.rows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (tablePage - 1) * rowsPerPage;
    return tableData.rows.slice(start, start + rowsPerPage);
  }, [tableData.rows, tablePage]);

  const activeTypeObj = REPORT_TYPES.find((t) => t.id === type) || REPORT_TYPES[0];
  const jsonByteSize = formattedJsonData ? new Blob([formattedJsonData]).size : 0;
  const formattedSize =
    jsonByteSize > 1024 * 1024
      ? `${(jsonByteSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(jsonByteSize / 1024).toFixed(1)} KB`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeTypeObj.icon}</span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Analytics Engine</h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                Live MongoDB Pipeline
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Query, inspect, and export live system data in formatted JSON, table, or CSV spreadsheets.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={loading}
              onClick={() => run(type, range)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              disabled={!result || loading}
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied JSON" : "Copy JSON"}
            </button>
            <button
              type="button"
              disabled={!result || loading}
              onClick={downloadJson}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              Export JSON
            </button>
            <button
              type="button"
              disabled={!result || loading}
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-emerald-50 text-emerald-800 px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Report Types Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {REPORT_TYPES.map((t) => {
            const isSelected = t.id === type;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range & Controls Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Quick Date Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Timeframe:
          </span>
          {PRESETS.map((p) => {
            const isSelected = activePreset === p.label;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Picker */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={range.from}
              onChange={(e) => {
                setActivePreset("Custom");
                setRange({ ...range, from: e.target.value });
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none focus:border-slate-800"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => {
                setActivePreset("Custom");
                setRange({ ...range, to: e.target.value });
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none focus:border-slate-800"
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => run(type, range)}
            className="rounded-lg bg-slate-900 px-3 py-1 font-bold text-white hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Records</span>
              <span className="rounded-lg bg-slate-100 p-1.5 text-slate-700">
                <Hash className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
              {Number(result.summary?.count || 0).toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{activeTypeObj.label} entries</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Financial Sum</span>
              <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-700 tracking-tight">
              {result.summary?.totalAmount !== undefined
                ? `₹${Number(result.summary.totalAmount).toLocaleString("en-IN")}`
                : "N/A"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {result.summary?.totalAmount !== undefined ? "Aggregated revenue volume" : "Non-financial report"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payload Size</span>
              <span className="rounded-lg bg-sky-50 p-1.5 text-sky-700">
                <Database className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">{formattedSize}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{jsonLines.length.toLocaleString()} JSON lines</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Scope</span>
              <span className="rounded-lg bg-amber-50 p-1.5 text-amber-700">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900 truncate">
              {activePreset === "All Time"
                ? "Full Historical"
                : range.from && range.to
                ? `${range.from} → ${range.to}`
                : activePreset}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">Filtered timeframe</p>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* View Switcher Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("json")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  viewMode === "json"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-sky-600" />
                JSON Data View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                Table Grid View
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              /api/reports/{type}
            </span>
          </div>

          {/* JSON Controls Toolbar */}
          {viewMode === "json" && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search within JSON */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter JSON keys / values..."
                  value={jsonSearch}
                  onChange={(e) => setJsonSearch(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs outline-none focus:border-slate-800 w-44 sm:w-56"
                />
                {jsonSearch && (
                  <button
                    onClick={() => setJsonSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Indent Selector */}
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <span className="text-[11px] text-slate-400">Indent:</span>
                {[2, 4, 0].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setJsonIndent(n)}
                    className={`rounded px-1.5 py-0.5 text-[11px] font-mono cursor-pointer ${
                      jsonIndent === n ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {n === 0 ? "Min" : `${n}sp`}
                  </button>
                ))}
              </div>

              {/* Record Limit Preview */}
              {result?.data?.length > 50 && (
                <select
                  value={maxRecords}
                  onChange={(e) => setMaxRecords(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                >
                  <option value={50}>Show 50 items</option>
                  <option value={100}>Show 100 items</option>
                  <option value={200}>Show 200 items</option>
                  <option value="all">Show All ({result.data.length})</option>
                </select>
              )}
            </div>
          )}

          {/* Table Search Toolbar */}
          {viewMode === "table" && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search table rows..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setTablePage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs outline-none focus:border-slate-800 w-52"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Querying {activeTypeObj.label} data from MongoDB...</p>
            <p className="text-xs text-slate-400">Processing aggregations and population references</p>
          </div>
        ) : !result ? (
          <div className="p-12 text-center space-y-2">
            <Database className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No report generated yet</p>
            <p className="text-xs text-slate-400">Select a report type and click "Apply" or "Refresh".</p>
          </div>
        ) : viewMode === "json" ? (
          /* JSON Syntax Highlighted Terminal */
          <div className="relative bg-slate-950 font-mono text-xs text-slate-100">
            {/* Terminal bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="font-semibold text-slate-200 ml-1">{type}_report.json</span>
                <span className="text-[10px] text-slate-500">
                  ({result.summary?.count || 0} documents · {formattedSize})
                </span>
              </div>

              <div className="flex items-center gap-3">
                {jsonSearch && filteredLineIndices && (
                  <span className="text-amber-400 text-[11px] font-sans">
                    {filteredLineIndices.size} match{filteredLineIndices.size !== 1 ? "es" : ""} found
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-sans text-xs"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="max-h-[600px] overflow-auto p-4 select-text">
              <pre className="text-xs font-mono leading-relaxed">
                {jsonLines.map((line, idx) => {
                  const isMatch = filteredLineIndices ? filteredLineIndices.has(idx) : false;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start hover:bg-slate-900/60 rounded px-1 transition-colors ${
                        isMatch ? "bg-amber-950/40 text-amber-200 ring-1 ring-amber-500/30" : ""
                      }`}
                    >
                      <span className="select-none text-slate-600 text-right pr-4 w-12 shrink-0 font-mono text-[11px] pt-0.5">
                        {idx + 1}
                      </span>
                      <span
                        className="flex-1 whitespace-pre break-all"
                        dangerouslySetInnerHTML={{ __html: formatJsonLine(line) }}
                      />
                    </div>
                  );
                })}
              </pre>
            </div>
          </div>
        ) : (
          /* Table Grid View */
          <div className="p-4">
            {!tableData.rows.length ? (
              <p className="text-center py-8 text-xs text-slate-500">No matching table records found.</p>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-[#F7F6F2]/95 backdrop-blur-xl border-b border-[#DFDED7] text-[11px] font-mono font-bold uppercase tracking-wider text-[#65717B]">
                        <tr>
                          <th className="py-3.5 px-4">#</th>
                          {tableData.headers.slice(0, 7).map((h) => (
                            <th key={h} className="py-3.5 px-4 capitalize">
                              {h.replace(/([A-Z])/g, " $1")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFDED7]">
                        {paginatedRows.map((row, i) => (
                          <tr
                            key={i}
                            className="group relative transition-colors bg-white hover:bg-[#F9F8F5]"
                          >
                            <td className="py-3.5 px-4 text-[#65717B] font-mono text-xs">
                              {(tablePage - 1) * rowsPerPage + i + 1}
                            </td>
                            {tableData.headers.slice(0, 7).map((h) => {
                              const val = row[h];
                              let rendered = String(val ?? "—");
                              if (typeof val === "object" && val !== null) {
                                rendered = val.title || val.name || val.transactionId || JSON.stringify(val);
                              } else if (h.toLowerCase().includes("amount") || h.toLowerCase().includes("price")) {
                                rendered = `₹${Number(val || 0).toLocaleString("en-IN")}`;
                              } else if (h.toLowerCase().includes("date") || h === "createdAt") {
                                rendered = val ? new Date(val).toLocaleDateString() : "—";
                              }
                              return (
                                <td key={h} className="py-3.5 px-4 max-w-[200px] truncate text-[#17232F] font-medium" title={String(rendered)}>
                                  {rendered}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table Pagination */}
                <div className="flex items-center justify-between text-xs text-[#65717B] pt-2">
                  <p>
                    Showing {(tablePage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(tablePage * rowsPerPage, tableData.rows.length)} of {tableData.rows.length} rows
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={tablePage === 1}
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-[#DFDED7] bg-white hover:bg-[#F7F6F2] text-[#17232F] hover:text-[#B9965B] disabled:opacity-30 cursor-pointer font-medium transition shadow-xs"
                    >
                      Previous
                    </button>
                    <span className="px-2 font-mono font-semibold text-[#17232F]">
                      {tablePage} / {totalTablePages}
                    </span>
                    <button
                      type="button"
                      disabled={tablePage >= totalTablePages}
                      onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-[#DFDED7] bg-white hover:bg-[#F7F6F2] text-[#17232F] hover:text-[#B9965B] disabled:opacity-30 cursor-pointer font-medium transition shadow-xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
