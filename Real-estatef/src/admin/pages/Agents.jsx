import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { DataTable, Pagination, Toolbar, Badge, statusTone, Modal, Field, inputCls, useConfirm, ConfirmDialog, FormSection, FormActions, Action3DButton, filterSelectCls } from "../components/ui";
import { Eye, Pencil, Trash2, Mail, Phone, Calendar, UserCheck, Briefcase, Percent, CheckCircle2, XCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  password: "",
  department: "Sales",
  designation: "Agent",
  commissionRate: 2.5,
  status: "active"
};

export default function Agents({ canCreate = true, canEdit = true, canDelete = true }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", department: "", designation: "" });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [view, setView] = useState(null);
  const confirm = useConfirm();

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/agents", { params: { page, limit: 10, search, ...filters } });
      setRows(data.data); setMeta(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(() => load(1), 300); return () => clearTimeout(t); }, [search, filters]);

  const save = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (form._id) await api.put(`/agents/${form._id}`, form);
      else await api.post("/agents", form);
      setForm(null); load(meta.page);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save agent");
    }
  };

  return (
    <div>
      <Toolbar search={search} onSearch={setSearch}>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={filterSelectCls} title="Filter by status">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className={filterSelectCls} title="Filter by department">
            <option value="">All departments</option>
            {["Sales", "Marketing", "Support", "Operations", "HR", "Finance", "Management"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={filters.designation} onChange={(e) => setFilters({ ...filters, designation: e.target.value })} className={filterSelectCls} title="Filter by designation">
            <option value="">All designations</option>
            {["Admin", "Agent", "Customer"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {canCreate && (
            <button
              onClick={() => {
                setFormError("");
                setForm({ ...EMPTY });
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Agent</span>
            </button>
          )}
        </div>
      </Toolbar>
      <DataTable loading={loading} columns={[
        { 
          key: "user", 
          label: "Agent", 
          render: (a) => (
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F7F6F2] border border-[#DFDED7] text-xs font-bold text-[#B9965B] shadow-xs shrink-0">
                {(a.user?.name?.[0] || a.user?.email?.[0] || "A").toUpperCase()}
              </span>
              <div className="leading-tight min-w-0">
                <p className="font-bold text-xs text-[#17232F] truncate">{a.user?.name || "Agent"}</p>
                <p className="text-[11px] font-medium text-[#65717B] truncate">{a.user?.email}</p>
              </div>
            </div>
          )
        },
        { key: "employeeId", label: "Employee ID", render: (a) => <span className="font-mono text-xs font-semibold text-[#B9965B]">{a.employeeId || "—"}</span> },
        { key: "designation", label: "Designation", render: (a) => <span className="text-xs font-semibold text-[#17232F]">{`${a.designation} · ${a.department}`}</span> },
        { key: "commissionRate", label: "Commission %", render: (a) => <span className="font-mono font-bold text-xs text-[#3E8066]">{a.commissionRate}%</span> },
        { key: "status", label: "Status", render: (a) => <Badge value={a.status} tone={statusTone(a.status)} /> },
        {
          key: "actions", label: "Actions", render: (a) => (
          <div className="flex items-center gap-1.5">
            <Action3DButton
              onClick={async () => {
                try {
                  const { data } = await api.get(`/agents/${a._id}`);
                  if (data) setView(data);
                  else toast.error("Agent details not found");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Failed to load agent details");
                }
              }}
              icon={Eye}
              title="View agent profile"
            />
            {canEdit && (
              <Action3DButton
                onClick={() => setForm({ ...a, _id: a._id, department: a.department, designation: a.designation, commissionRate: a.commissionRate, status: a.status })}
                icon={Pencil}
                title="Edit agent"
              />
            )}
            {canEdit && (
              <Action3DButton
                onClick={async () => {
                  const nextStatus = a.status === "active" ? "inactive" : "active";
                  await api.put(`/agents/${a._id}`, { status: nextStatus });
                  toast.success(`Agent status marked as ${nextStatus}`);
                  load(meta.page);
                }}
                icon={a.status === "active" ? XCircle : CheckCircle2}
                title={a.status === "active" ? "Inactivate agent" : "Activate agent"}
                variant={a.status === "active" ? "warning" : "success"}
              />
            )}
            {canDelete && (
              <Action3DButton
                onClick={() => confirm.ask(async () => { await api.delete(`/agents/${a._id}`); load(meta.page); }, "Delete agent?")}
                icon={Trash2}
                title="Delete agent"
                variant="danger"
              />
            )}
          </div>
          )
        },
      ]} rows={rows} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      <Modal
        open={!!form}
        onClose={() => { setForm(null); setFormError(""); }}
        title={form?._id ? "Edit Agent Profile" : "Register New Agent"}
        subtitle="Configure agent credentials, operational department, and commission tier"
        size="md"
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            {formError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700">
                <span className="font-bold">Error:</span> {formError}
              </div>
            )}

            {!form._id && (
              <FormSection icon={UserCheck} title="Agent Credentials" description="Basic account details and login credentials">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name" required>
                    <input
                      required
                      className={inputCls}
                      placeholder="e.g. Priya Mukherjee"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Field>
                  <Field label="Work Email" required>
                    <input
                      required
                      type="email"
                      className={inputCls}
                      placeholder="priya@primenest.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Phone Number">
                    <input
                      type="tel"
                      className={inputCls}
                      placeholder="+91 98765 43210"
                      value={form.phone || ""}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </Field>
                  <Field label="Initial Password" hint="Min 6 characters">
                    <input
                      className={inputCls}
                      value={form.password || ""}
                      placeholder="Agent@123"
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </Field>
                </div>
              </FormSection>
            )}

            <FormSection icon={Briefcase} title="Department & Role" description="Organizational placement and designation">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department" required>
                  <select
                    className={inputCls}
                    value={form.department || "Sales"}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  >
                    {["Sales", "Marketing", "Support", "Operations", "HR", "Finance", "Management"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Designation" required>
                  <select
                    className={inputCls}
                    value={["Admin", "Agent", "Customer"].includes(form.designation) ? form.designation : "Agent"}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Agent">Agent</option>
                    <option value="Customer">Customer</option>
                  </select>
                </Field>
              </div>
            </FormSection>

            <FormSection icon={Percent} title="Commission & Status" description="Commission percentage and active account status">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Commission Rate (%)" hint="Per closed deal">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className={inputCls}
                      value={form.commissionRate ?? 2}
                      onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B746F]">%</span>
                  </div>
                </Field>

                <Field label="Account Status" required>
                  <select
                    className={inputCls}
                    value={form.status || "active"}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
              </div>
            </FormSection>

            <FormActions
              onCancel={() => { setForm(null); setFormError(""); }}
              submitLabel={form._id ? "Update Agent" : "Create Agent"}
            />
          </form>
        )}
      </Modal>

      <Modal open={!!view} onClose={() => setView(null)} title="Agent profile" size="md">
        {view && (
          <div className="space-y-4 text-sm">
            {/* Header Profile Card — same light type as dashboard */}
            <div className="relative overflow-hidden rounded-2xl border border-[#DFDED7] bg-white p-4.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
              <div className="flex items-start gap-3.5">
                <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#F4EFE6] border border-[#B9965B]/30 text-lg font-bold text-[#B9965B] shadow-md">
                  {view.agent?.user?.name
                    ? view.agent.user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                    : "AG"}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#3E8066]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-[#17232F] truncate">{view.agent?.user?.name || "Agent Name"}</h4>
                    <Badge value={view.agent?.status || "active"} tone={statusTone(view.agent?.status)} />
                  </div>
                  <p className="mt-0.5 text-xs text-[#65717B] font-medium flex items-center gap-1.5 flex-wrap">
                    <span>{view.agent?.designation || "Agent"}</span>
                    <span>•</span>
                    <span>{view.agent?.department || "Sales"}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-mono font-medium text-[#B9965B] bg-[#F7F6F2] border border-[#DFDED7] px-2 py-0.5 rounded-md w-fit">
                    <span>ID: {view.agent?.employeeId || "EMP-000000"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Quick Details */}
              <div className="mt-4 pt-3 border-t border-[#DFDED7] grid grid-cols-1 gap-2 text-xs">
                {view.agent?.user?.email && (
                  <a
                    href={`mailto:${view.agent.user.email}`}
                    className="flex items-center gap-2 text-[#65717B] hover:text-[#B9965B] transition truncate group"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B] group-hover:border-[#B9965B]/50">
                      <Mail className="h-3 w-3" />
                    </div>
                    <span className="truncate">{view.agent.user.email}</span>
                  </a>
                )}
                {view.agent?.user?.phone && (
                  <a
                    href={`tel:${view.agent.user.phone}`}
                    className="flex items-center gap-2 text-[#65717B] hover:text-[#B9965B] transition truncate group"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B] group-hover:border-[#B9965B]/50">
                      <Phone className="h-3 w-3" />
                    </div>
                    <span className="text-[#17232F]">{view.agent.user.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Performance Overview */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#65717B] mb-2">Performance Overview</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 shadow-xs text-center">
                  <p className="text-[10px] font-medium text-[#65717B] uppercase">Active Leads</p>
                  <p className="mt-1 text-base font-bold font-mono text-[#17232F]">{view.stats?.activeLeads ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 shadow-xs text-center">
                  <p className="text-[10px] font-medium text-[#65717B] uppercase">Closed Sales</p>
                  <p className="mt-1 text-base font-bold font-mono text-[#3E8066]">{view.stats?.completedSales ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 shadow-xs text-center">
                  <p className="text-[10px] font-medium text-[#65717B] uppercase">Commission</p>
                  <p className="mt-1 text-xs font-bold font-mono text-[#B9965B] truncate">
                    ₹{Number(view.stats?.totalCommission || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Commission Rate Banner */}
            <div className="flex items-center justify-between rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3.5 py-2 text-xs">
              <span className="font-medium text-[#65717B]">Standard Commission Split</span>
              <span className="font-bold font-mono text-sm text-[#B9965B]">{view.agent?.commissionRate ?? 2}%</span>
            </div>

            {/* Recent Bookings Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#65717B] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#B9965B]" />
                  <span>Recent Bookings</span>
                </p>
                <span className="text-[11px] font-medium text-[#65717B]">{view.bookings?.length || 0} total</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto drawer-content-scroll pr-0.5">
                {view.bookings && view.bookings.length > 0 ? (
                  view.bookings.slice(0, 6).map((b) => (
                    <div key={b._id} className="flex items-center justify-between rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 hover:border-[#B9965B]/40 transition">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-xs text-[#17232F] truncate">{b.property?.title || "Property Visit"}</p>
                        <p className="text-[11px] text-[#65717B] font-mono mt-0.5">
                          {b.bookingId || (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Booking")}
                        </p>
                      </div>
                      <Badge value={b.status} tone={statusTone(b.status)} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-4 rounded-xl border border-dashed border-[#DFDED7] bg-white">No bookings associated yet</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-[#DFDED7] flex items-center gap-2 flex-wrap">
              {canEdit && (
              <button
                type="button"
                onClick={async () => {
                  const nextStatus = view.agent.status === "active" ? "inactive" : "active";
                  await api.put(`/agents/${view.agent._id}`, { status: nextStatus });
                  toast.success(`Agent status updated to ${nextStatus}`);
                  setView({ ...view, agent: { ...view.agent, status: nextStatus } });
                  load(meta.page);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${view.agent.status === "active"
                    ? "border border-[#B98235]/30 bg-[#FDF5E6] text-[#B98235] hover:bg-[#FCECD0]"
                    : "border border-[#71877B]/30 bg-[#EBF3EF] text-[#3E8066] hover:bg-[#DFEDE6]"
                  }`}
              >
                {view.agent.status === "active" ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {view.agent.status === "active" ? "Revoke Access" : "Grant Access"}
              </button>
              )}
              {canEdit && (
              <button
                type="button"
                onClick={() => {
                  const ag = view.agent;
                  setView(null);
                  setForm({ ...ag, _id: ag._id, department: ag.department, designation: ag.designation, commissionRate: ag.commissionRate, status: ag.status });
                }}
                className="flex-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-white py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-w-[120px]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Agent
              </button>
              )}
              <button
                type="button"
                onClick={() => setView(null)}
                className="px-4 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] hover:bg-[#F0EFE9] text-xs font-semibold text-[#65717B] hover:text-[#17232F] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={confirm.open} onClose={confirm.close} onConfirm={confirm.confirm} message={confirm.message} />
    </div>
  );
}

