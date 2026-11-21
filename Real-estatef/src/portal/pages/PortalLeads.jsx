import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Phone,
  Mail,
  Clock,
  Search,
  KanbanSquare,
  Table as TableIcon,
  Building2,
  Calendar,
  User,
  Filter,
  ArrowRight,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  MapPin,
  X,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { agentApi } from "../store";
import {
  Modal,
  Drawer,
  Field,
  inputCls,
  ErrorBanner,
  EmptyState,
  Skeleton,
  StageBadge
} from "../components/portalUi";

const STAGES = [
  "New",
  "Contacted",
  "Showing Scheduled",
  "Closed",
  "Lost"
];

const STAGE_COLORS = {
  New: "border-[#B98235]/30 bg-[#FDF5E6] text-[#B98235]",
  Contacted: "border-[#7799B4]/30 bg-[#F0F4F8] text-[#7799B4]",
  "Showing Scheduled": "border-[#B9965B]/30 bg-[#F4EFE6] text-[#B9965B]",
  Closed: "border-[#71877B]/30 bg-[#EBF3EF] text-[#3E8066]",
  Lost: "border-[#B85C56]/30 bg-[#FDF0EE] text-[#B85C56]",
};

export default function PortalLeads() {
  const qc = useQueryClient();
  const [drawer, setDrawer] = useState(null);
  const [detail, setDetail] = useState(null);
  const [quick, setQuick] = useState(false);
  const [view, setView] = useState("kanban"); // "kanban" | "table"
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [draggedOverStage, setDraggedOverStage] = useState(null);
  const [f, setF] = useState({});
  const [log, setLog] = useState({ kind: "note", note: "", nextFollowUp: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["agent-pipeline"],
    queryFn: agentApi.pipeline,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["agent-pipeline"] });

  const openDetail = async (id) => {
    setDrawer(id);
    try {
      const d = await agentApi.lead(id);
      setDetail(d);
    } catch {
      // ignore
    }
  };

  const move = async (id, status) => {
    await agentApi.moveLead(id, status);
    refresh();
    if (drawer === id) {
      const d = await agentApi.lead(id);
      setDetail(d);
    }
  };

  const saveLead = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (!f.name || !f.phone) throw new Error("Client name and phone number are required");
      await agentApi.createLead({
        name: f.name,
        phone: f.phone,
        email: f.email || "",
        source: f.source || "Website",
        priority: f.priority || "Medium",
        notes: f.notes || "",
      });
      setQuick(false);
      setF({});
      refresh();
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message);
    } finally {
      setBusy(false);
    }
  };

  const saveLog = async () => {
    if (!log.note.trim()) return;
    setBusy(true);
    try {
      await agentApi.logLeadActivity(drawer, {
        kind: log.kind,
        note: log.note,
        nextFollowUp: log.nextFollowUp || undefined,
      });
      setLog({ kind: "note", note: "", nextFollowUp: "" });
      const d = await agentApi.lead(drawer);
      setDetail(d);
      refresh();
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message);
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e, stage) => {
    e.preventDefault();
    setDraggedOverStage(null);
    const id = e.dataTransfer.getData("leadId");
    if (id) move(id, stage).catch(() => {});
  };

  const rawColumns = data?.columns || [];

  // Filter columns and leads by search and priority
  const columns = useMemo(() => {
    return rawColumns.map((col) => {
      const filteredLeads = col.leads.filter((l) => {
        const matchesSearch =
          !search ||
          l.name?.toLowerCase().includes(search.toLowerCase()) ||
          l.phone?.includes(search) ||
          l.email?.toLowerCase().includes(search.toLowerCase()) ||
          l.property?.title?.toLowerCase().includes(search.toLowerCase());
        const matchesPriority =
          priorityFilter === "all" || l.priority === priorityFilter;
        return matchesSearch && matchesPriority;
      });
      return {
        ...col,
        count: filteredLeads.length,
        leads: filteredLeads,
      };
    });
  }, [rawColumns, search, priorityFilter]);

  const allFilteredLeads = useMemo(() => {
    return columns.flatMap((c) => c.leads);
  }, [columns]);

  const totalLeadsCount = rawColumns.reduce((acc, c) => acc + (c.count || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Filter & Toolbar matching Super Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#DFDED7] shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
        {/* Search & Priority Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65717B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, phone, email, property…"
              className="w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] py-1.5 pl-8 pr-3 text-xs text-[#17232F] placeholder-[#65717B] outline-none transition focus:border-[#B9965B] focus:ring-1 focus:ring-[#B9965B]/30"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-2.5 py-1.5 text-xs font-semibold text-[#17232F] outline-none focus:border-[#B9965B]"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1">
            <button
              type="button"
              onClick={() => setView("kanban")}
              title="Kanban Board view"
              className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                view === "kanban"
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              <KanbanSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              title="Table List view"
              className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                view === "table"
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F6F2] border border-[#DFDED7] text-xs">
            <span className="h-2 w-2 rounded-full bg-[#B9965B]" />
            <span className="font-bold text-[#17232F] font-mono">{totalLeadsCount}</span>
            <span className="text-[#65717B]">Active Leads</span>
          </div>

          <button
            onClick={() => {
              setQuick(true);
              setF({});
              setErr("");
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-4 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Lead</span>
          </button>
        </div>
      </div>

      {/* Main View: Kanban Board */}
      {view === "kanban" ? (
        <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 drawer-content-scroll">
          {columns.map((col) => {
            const isDragOver = draggedOverStage === col.stage;
            return (
              <div
                key={col.stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedOverStage !== col.stage) setDraggedOverStage(col.stage);
                }}
                onDragLeave={() => setDraggedOverStage(null)}
                onDrop={(e) => onDrop(e, col.stage)}
                className={`w-72 shrink-0 rounded-2xl border transition-all duration-200 flex flex-col bg-[#F7F6F2] ${
                  isDragOver
                    ? "border-[#B9965B] bg-white shadow-lg scale-[1.01]"
                    : "border-[#DFDED7]"
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-[#DFDED7] flex items-center justify-between bg-white rounded-t-2xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        col.stage === "New" || col.stage === "Showing Scheduled"
                          ? "bg-[#B9965B]"
                          : col.stage === "Contacted"
                          ? "bg-[#7799B4]"
                          : col.stage === "Closed"
                          ? "bg-[#3E8066]"
                          : "bg-[#B85C56]"
                      }`}
                    />
                    <span className="text-xs font-bold tracking-tight text-[#17232F] truncate uppercase">
                      {col.stage}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#F7F6F2] border border-[#DFDED7] px-2 py-0.5 text-[11px] font-bold font-mono text-[#B9965B]">
                    {col.count}
                  </span>
                </div>

                {/* Column Body Cards */}
                <div className="p-2.5 space-y-2.5 flex-1 min-h-[420px] max-h-[68vh] overflow-y-auto drawer-content-scroll">
                  {col.leads.map((l) => (
                    <div
                      key={l._id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("leadId", l._id)}
                      onClick={() => openDetail(l._id)}
                      className="cursor-grab rounded-xl border border-[#DFDED7] bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#B9965B]/50 active:cursor-grabbing group"
                    >
                      {/* Lead Title & Priority */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4EFE6] border border-[#B9965B]/30 text-xs font-bold text-[#B9965B]">
                            {l.name?.charAt(0)?.toUpperCase() || "L"}
                          </div>
                          <p className="font-bold text-xs text-[#17232F] group-hover:text-[#B9965B] transition-colors truncate">
                            {l.name}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            l.priority === "Urgent" || l.priority === "High"
                              ? "bg-[#FDF5E6] text-[#B98235] border-[#B9965B]/30"
                              : "bg-[#F7F6F2] text-[#65717B] border-[#DFDED7]"
                          }`}
                        >
                          {l.priority || "Medium"}
                        </span>
                      </div>

                      {/* Phone & Contact */}
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#65717B]">
                        <Phone className="h-3 w-3 text-[#B9965B] shrink-0" />
                        <span>{l.phone}</span>
                      </p>

                      {/* Interested Property */}
                      {l.property && (
                        <div className="mt-2 rounded-lg bg-[#F7F6F2] p-2 border border-[#DFDED7]">
                          <p className="text-[11px] font-semibold text-[#17232F] truncate flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-[#B9965B] shrink-0" />
                            <span className="truncate">{l.property.title}</span>
                          </p>
                          {l.property.price && (
                            <p className="font-mono text-[10px] font-bold text-[#B9965B] mt-0.5">
                              ₹{Number(l.property.price).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Footer tags */}
                      <div className="mt-2.5 pt-2 border-t border-[#DFDED7] flex items-center justify-between text-[10px] text-[#65717B]">
                        <span className="bg-[#F7F6F2] px-1.5 py-0.5 rounded border border-[#DFDED7]">
                          {l.source || "Website"}
                        </span>
                        {l.assignedAgent?.name ? (
                          <span
                            title={l.assignedAgent.email || l.assignedAgent.name}
                            className="flex items-center gap-1 bg-[#F4EFE6] px-1.5 py-0.5 rounded border border-[#B9965B]/30 font-semibold text-[#B9965B] truncate max-w-[130px]"
                          >
                            <User className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{l.assignedAgent.name}</span>
                          </span>
                        ) : (
                          <span className="font-mono text-[#65717B]">
                            {l.createdAt
                              ? new Date(l.createdAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {!col.leads.length && (
                    <div className="h-36 rounded-xl border-2 border-dashed border-[#DFDED7] bg-white flex flex-col items-center justify-center text-center p-3">
                      <p className="text-xs font-semibold text-[#65717B]">No leads in this stage</p>
                      <p className="text-[10px] text-[#65717B]/70 mt-0.5">Drag cards here to update pipeline</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View matching Super Admin */
        <div className="relative rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
          <div className="border-b border-[#DFDED7] bg-[#F7F6F2]/80 px-5 py-3.5 flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">
              {allFilteredLeads.length} {allFilteredLeads.length === 1 ? "Lead in Pipeline" : "Leads in Pipeline"}
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#DFDED7] scrollbar-track-transparent">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#F7F6F2]/80 backdrop-blur-xl border-b border-[#DFDED7]">
                <tr>
                  <th className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">Client Lead</th>
                  <th className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">Property Interest</th>
                  <th className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">Source</th>
                  <th className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">Added By</th>
                  <th className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">Pipeline Stage</th>
                  <th className="py-3.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">Priority</th>
                  <th className="py-3.5 px-4 text-right font-mono text-[11px] font-bold uppercase tracking-wider text-[#65717B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFDED7]">
                {allFilteredLeads.map((l, i) => (
                  <tr
                    key={l._id}
                    className="group relative transition-colors duration-150 bg-white hover:bg-[#F9F8F5]"
                  >
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-2.5 relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#B9965B] opacity-0 group-hover:opacity-100 transition-opacity rounded-r" />

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F7F6F2] border border-[#DFDED7] text-xs font-bold text-[#B9965B]">
                          {l.name?.charAt(0)?.toUpperCase() || "L"}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#17232F] group-hover:text-[#B9965B] transition-colors">
                            {l.name}
                          </p>
                          <p className="text-[11px] text-[#65717B] flex items-center gap-1.5 mt-0.5">
                            <span>{l.phone}</span>
                            {l.email && <span>• {l.email}</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-middle text-xs text-[#65717B]">
                      {l.property ? (
                        <div>
                          <p className="font-semibold text-[#17232F] truncate max-w-xs">{l.property.title}</p>
                          <p className="font-mono text-[#B9965B] font-bold">
                            ₹{Number(l.property.price || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#65717B]">General Inquiry</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-middle text-xs">
                      <span className="bg-[#F7F6F2] border border-[#DFDED7] px-2 py-0.5 rounded-md text-[#65717B]">
                        {l.source || "Website"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-middle text-xs">
                      {l.assignedAgent?.name ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7F6F2] border border-[#DFDED7] text-[10px] font-bold text-[#B9965B]">
                            {l.assignedAgent.name.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#17232F] truncate max-w-[140px]">
                              {l.assignedAgent.name}
                            </p>
                            {l.assignedAgent.email && (
                              <p className="text-[11px] text-[#65717B] truncate max-w-[140px]">
                                {l.assignedAgent.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#65717B]">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <StageBadge value={l.status || "New"} />
                    </td>

                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          l.priority === "Urgent" || l.priority === "High"
                            ? "bg-[#FDF5E6] text-[#B98235] border-[#B9965B]/30"
                            : "bg-[#F7F6F2] text-[#65717B] border-[#DFDED7]"
                        }`}
                      >
                        {l.priority || "Medium"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                      <button
                        onClick={() => openDetail(l._id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#DFDED7] bg-white px-3 py-1.5 text-xs font-semibold text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#B9965B] hover:border-[#B9965B]/40 transition cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail & Activity Drawer (Compact max-w-md design) */}
      <Drawer
        open={!!drawer}
        onClose={() => {
          setDrawer(null);
          setDetail(null);
        }}
        title="Client Lead Profile"
        subtitle={detail?.lead?.name || "Inspect lead activity, stage, and call logs"}
        size="md"
      >
        {!detail ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Client Profile Card */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 text-sm font-bold text-[#B9965B] shadow-sm">
                  {detail.lead.name?.charAt(0)?.toUpperCase() || "L"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-[#17232F] truncate">{detail.lead.name}</p>
                  <p className="text-[#65717B] flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3 w-3 text-[#B9965B]" />
                    <a href={`tel:${detail.lead.phone}`} className="hover:text-[#B9965B] font-mono text-[#17232F]">
                      {detail.lead.phone}
                    </a>
                  </p>
                  {detail.lead.email && (
                    <p className="text-[#65717B] flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="h-3 w-3 text-[#B9965B]" />
                      <a href={`mailto:${detail.lead.email}`} className="hover:text-[#B9965B] truncate">
                        {detail.lead.email}
                      </a>
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <StageBadge value={detail.lead.status} />
                    <span className="rounded-full bg-[#F7F6F2] border border-[#DFDED7] px-2 py-0.5 text-[10px] font-semibold text-[#65717B]">
                      {detail.lead.source || "Website"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Move Stage Selector Bar */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] block mb-2">
                Move Pipeline Stage
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s) => {
                  const isActive = detail.lead.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => move(detail.lead._id, s)}
                      className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#B9965B] text-white shadow-sm"
                          : "border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-white hover:text-[#17232F]"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Association */}
            {detail.lead.property ? (
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1.5 mb-2">
                  <Building2 className="h-3 w-3 text-[#B9965B]" />
                  <span>Interested Property</span>
                </span>
                <p className="font-bold text-xs text-[#17232F] truncate">{detail.lead.property.title}</p>
                <div className="mt-2 pt-2 border-t border-[#DFDED7] flex items-center justify-between text-xs">
                  <span className="text-[#65717B] font-mono">{detail.lead.property.city}</span>
                  <span className="font-bold text-[#B9965B] font-mono">
                    ₹{Number(detail.lead.property.price || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ) : detail.matchedProperties?.length ? (
              <div className="rounded-2xl border border-[#B9965B]/30 bg-[#FDF5E6] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B9965B] flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3 w-3 text-[#B9965B]" />
                  <span>Available Inventory Matches</span>
                </span>
                <div className="space-y-1.5">
                  {detail.matchedProperties.map((p) => (
                    <div key={p._id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#DFDED7]">
                      <span className="font-semibold text-xs text-[#17232F] truncate">{p.title}</span>
                      <span className="font-mono font-bold text-xs text-[#B9965B] shrink-0 ml-2">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Activity Timeline & Call Logs */}
            <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1.5 mb-2.5">
                <Clock className="h-3 w-3 text-[#B9965B]" />
                <span>Call Logs & Follow-up History</span>
              </span>

              <div className="max-h-44 overflow-y-auto drawer-content-scroll space-y-2 pr-1">
                {(detail.lead.followUps || []).slice().reverse().map((x, i) => {
                  const role = (x.by?.role || "").toUpperCase();
                  const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role);
                  const isAgent = role === "AGENT";
                  const author = x.by?.name || (isAdmin ? "Admin" : isAgent ? "Agent" : "");
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border-l-3 mb-1.5 bg-[#F7F6F2] border border-[#DFDED7] ${
                        isAdmin
                          ? "border-l-[#8E6CA8]"
                          : isAgent
                          ? "border-l-[#B9965B]"
                          : "border-l-[#65717B]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isAdmin ? (
                              <span className="font-bold text-[9px] uppercase bg-[#F4EFF8] border border-[#8E6CA8]/30 text-[#8E6CA8] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <ShieldCheck className="h-2.5 w-2.5" /> Admin
                              </span>
                            ) : isAgent ? (
                              <span className="font-bold text-[9px] uppercase bg-[#F4EFE6] border border-[#B9965B]/30 text-[#B9965B] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Briefcase className="h-2.5 w-2.5" /> Agent
                              </span>
                            ) : null}
                            {author && (
                              <span className="text-[11px] font-bold text-[#17232F]">
                                {author}
                              </span>
                            )}
                            <span className="font-bold text-[9px] uppercase bg-white border border-[#DFDED7] text-[#B9965B] px-1.5 py-0.5 rounded">
                              {x.kind}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#65717B] font-mono">
                            {new Date(x.date || x.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#17232F] leading-relaxed pl-0.5">{x.note}</p>
                      </div>
                    </div>
                  );
                })}
                {!(detail.lead.followUps || []).length && (
                  <p className="text-xs text-[#65717B] py-2 text-center">No logs recorded yet. Add the first call note below.</p>
                )}
              </div>

              {/* Add Log Form */}
              <div className="mt-3 pt-3 border-t border-[#DFDED7] space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={log.kind}
                    onChange={(e) => setLog({ ...log, kind: e.target.value })}
                    className={inputCls}
                  >
                    <option value="note">Note</option>
                    <option value="call">Call</option>
                    <option value="visit">Visit</option>
                    <option value="email">Email</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={log.nextFollowUp}
                    onChange={(e) => setLog({ ...log, nextFollowUp: e.target.value })}
                    className={`${inputCls} col-span-2`}
                    title="Next follow-up date and time"
                  />
                </div>
                <textarea
                  rows={2}
                  value={log.note}
                  onChange={(e) => setLog({ ...log, note: e.target.value })}
                  placeholder="Record call summary, budget, requirements…"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={saveLog}
                  disabled={busy || !log.note.trim()}
                  className="w-full rounded-xl bg-[#B9965B] hover:bg-[#a6844d] py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {busy ? "Saving…" : "Save Log to Timeline"}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setDrawer(null);
                  setDetail(null);
                }}
                className="w-full rounded-xl border border-[#DFDED7] py-2 text-xs font-bold text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Quick Log Lead Modal */}
      <Modal open={quick} onClose={() => setQuick(false)} title="Log Client Lead" subtitle="Create new prospect record for your CRM pipeline">
        <form onSubmit={saveLead} className="space-y-3.5 text-xs">
          {err && <ErrorBanner message={err} />}
          <Field label="Client Full Name *">
            <input
              required
              className={inputCls}
              placeholder="e.g. Vikramaditya Sen"
              value={f.name || ""}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </Field>
          <Field label="Phone Number *">
            <input
              required
              className={inputCls}
              placeholder="e.g. +91 9830012345"
              value={f.phone || ""}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
            />
          </Field>
          <Field label="Email Address (Optional)">
            <input
              type="email"
              className={inputCls}
              placeholder="client@example.com"
              value={f.email || ""}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Lead Source">
              <select
                className={inputCls}
                value={f.source || "Website"}
                onChange={(e) => setF({ ...f, source: e.target.value })}
              >
                {["Website", "Walk-in", "Phone", "Referral", "Social Media", "Advertisement", "Email", "Other"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority Level">
              <select
                className={inputCls}
                value={f.priority || "Medium"}
                onChange={(e) => setF({ ...f, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </Field>
          </div>
          <Field label="Requirements & Budget Remarks">
            <textarea
              rows={2}
              className={inputCls}
              placeholder="Target BHK, preferred location, max budget…"
              value={f.notes || ""}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
            />
          </Field>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setQuick(false)}
              className="flex-1 rounded-xl border border-[#DFDED7] py-2 text-xs font-semibold text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] transition cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              {busy ? "Saving…" : "Save Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
