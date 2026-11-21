import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import {
  DataTable,
  Pagination,
  Toolbar,
  Badge,
  statusTone,
  Modal,
  Field,
  inputCls,
  useConfirm,
  ConfirmDialog,
  FormSection,
  FormActions,
  filterSelectCls,
  Action3DButton,
} from "../components/ui";
import {
  Pencil,
  FileText,
  UserCheck,
  Trash2,
  User,
  KanbanSquare,
  Send,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  source: "Website",
  status: "New",
  priority: "Medium",
  notes: "",
};

// Distinct colour per lead source (type)
const sourceTone = (s) =>
  ({
    Website: "emerald",
    Phone: "blue",
    Email: "violet",
    "Social Media": "amber",
    Advertisement: "green",
    Referral: "blue",
    "Walk-in": "violet",
    Other: "gray",
  }[s] || "gray");

export default function Leads({
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canConvert = true,
  canNote = true,
}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");

  // Follow-up notes modal state
  const [noteLead, setNoteLead] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteKind, setNoteKind] = useState("note");
  const [nextDate, setNextDate] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const confirm = useConfirm();

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/leads", {
        params: { page, limit: 10, search, status },
      });
      setRows(data.data);
      setMeta(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
  }, [search, status]);

  const save = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (form._id) await api.put(`/leads/${form._id}`, form);
      else await api.post("/leads", form);
      setForm(null);
      load(meta.page);
    } catch (err) {
      const d = err.response?.data;
      const details = (d?.errors || []).map((x) => `${x.path}: ${x.message}`).join("; ");
      setFormError(details ? `${d.message} — ${details}` : d?.message || "Failed to save lead");
    }
  };

  const openNotes = async (l) => {
    setNoteLead(l);
    setNoteText("");
    setNoteKind("note");
    setNextDate(l.nextFollowUp ? String(l.nextFollowUp).slice(0, 10) : "");
    // Fetch full fresh lead with populated author details
    try {
      const { data } = await api.get(`/leads/${l._id}`);
      if (data?.lead) {
        setNoteLead(data.lead);
      }
    } catch (err) {
      console.error("Failed to load full lead details", err);
    }
  };

  const saveNote = async (e) => {
    e?.preventDefault();
    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }
    setSubmittingNote(true);
    try {
      const { data } = await api.post(`/leads/${noteLead._id}/notes`, {
        note: noteText.trim(),
        kind: noteKind,
        nextFollowUp: nextDate || undefined,
      });
      toast.success("Follow-up note saved");
      setNoteText("");
      if (data?.lead) {
        setNoteLead(data.lead);
      }
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save note");
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div>
      <Toolbar search={search} onSearch={setSearch}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={filterSelectCls}
        >
          <option value="">All statuses</option>
          {[
            "New",
            "Contacted",
            "Follow-up",
            "Interested",
            "Negotiation",
            "Showing Scheduled",
            "Under Contract",
            "Converted",
            "Closed",
            "Lost",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {canCreate && (
          <button
            onClick={() => {
              setFormError("");
              setForm({ ...EMPTY });
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#86A9D8] px-3.5 py-2 text-xs font-bold text-[#080C13] shadow-sm hover:bg-[#97b9e5] transition cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Lead</span>
          </button>
        )}
      </Toolbar>

      <DataTable
        loading={loading}
        columns={[
          {
            key: "name",
            label: "Lead",
            render: (l) => (
              <div>
                <p className="font-bold text-xs text-[#17232F]">{l.name}</p>
                <p className="text-[11px] font-medium text-[#65717B]">
                  {l.phone} · {l.email}
                </p>
              </div>
            ),
          },
          {
            key: "property",
            label: "Property",
            render: (l) => (
              <span className="text-xs font-semibold text-[#17232F]">
                {l.property?.title || "—"}
              </span>
            ),
          },
          {
            key: "assignedAgent",
            label: "Agent",
            render: (l) =>
              l.assignedAgent?.name ? (
                <div>
                  <p className="font-medium text-xs text-[#17232F]">{l.assignedAgent.name}</p>
                  {l.assignedAgent.email && (
                    <p className="text-[10px] text-[#65717B]">{l.assignedAgent.email}</p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-[#B9965B] font-medium">Unassigned</span>
              ),
          },
          {
            key: "source",
            label: "Source",
            render: (l) => <Badge value={l.source} tone={sourceTone(l.source)} />,
          },
          {
            key: "status",
            label: "Status",
            render: (l) => <Badge value={l.status} tone={statusTone(l.status)} />,
          },
          {
            key: "priority",
            label: "Priority",
            render: (l) => (
              <Badge value={l.priority} tone={l.priority === "High" ? "red" : "slate"} />
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (l) => (
              <div className="flex items-center gap-1.5">
                {canEdit && (
                  <Action3DButton
                    onClick={() =>
                      setForm({
                        ...l,
                        property: l.property?._id || "",
                        assignedAgent: l.assignedAgent?._id || "",
                      })
                    }
                    icon={Pencil}
                    title="Edit lead"
                  />
                )}
                {canNote && (
                  <Action3DButton
                    onClick={() => openNotes(l)}
                    icon={FileText}
                    title={`View & add follow-up notes (${l.followUps?.length || 0})`}
                  />
                )}
                {canConvert && l.status !== "Converted" && !l.convertedToCustomer && (
                  <Action3DButton
                    onClick={async () => {
                      try {
                        await api.post(`/leads/${l._id}/convert`);
                        toast.success(`Lead "${l.name}" converted to customer`);
                        load(meta.page);
                      } catch (err) {
                        toast.error(err.response?.data?.message || "Failed to convert lead");
                      }
                    }}
                    icon={UserCheck}
                    title="Convert lead to customer"
                    variant="success"
                  />
                )}
                {canDelete && (
                  <Action3DButton
                    onClick={() =>
                      confirm.ask(async () => {
                        await api.delete(`/leads/${l._id}`);
                        load(meta.page);
                      }, "Delete lead?")
                    }
                    icon={Trash2}
                    title="Delete lead"
                    variant="danger"
                  />
                )}
              </div>
            ),
          },
        ]}
        rows={rows}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      {/* Edit / Create Lead Modal */}
      <Modal
        open={!!form}
        onClose={() => {
          setForm(null);
          setFormError("");
        }}
        title={form?._id ? "Edit Lead Details" : "Register New Lead"}
        subtitle="Manage customer acquisition profile, property requirements and sales pipeline"
        size="md"
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <FormSection
              icon={User}
              title="Prospect Identity"
              description="Lead contact information and primary channels"
            >
              <Field label="Full Name" required>
                <input
                  required
                  className={inputCls}
                  placeholder="e.g. Suman Sen"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone Number" required>
                  <input
                    required
                    className={inputCls}
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="client@gmail.com"
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={KanbanSquare}
              title="Deal Pipeline & Priority"
              description="Acquisition status, lead origin, and closing urgency"
            >
              <div className="grid grid-cols-3 gap-3">
                <Field label="Status">
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {[
                      "New",
                      "Contacted",
                      "Follow-up",
                      "Interested",
                      "Negotiation",
                      "Showing Scheduled",
                      "Under Contract",
                      "Converted",
                      "Closed",
                      "Lost",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select
                    className={inputCls}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {["Low", "Medium", "High", "Urgent"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Source">
                  <select
                    className={inputCls}
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  >
                    {[
                      "Website",
                      "Phone",
                      "Email",
                      "Social Media",
                      "Advertisement",
                      "Referral",
                      "Walk-in",
                      "Other",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={FileText}
              title="Requirement Notes"
              description="Client budget, location preference, or special remarks"
            >
              <Field label="Notes & Remarks">
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder="Looking for 3BHK in New Town under ₹85 Lakhs with balcony..."
                  value={form.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </FormSection>

            <FormActions
              onCancel={() => {
                setForm(null);
                setFormError("");
              }}
              submitLabel={form._id ? "Update Lead" : "Save Lead"}
            />
          </form>
        )}
      </Modal>

      {/* ALL FOLLOW-UP NOTES & COMPLETE TIMELINE MODAL */}
      <Modal
        open={!!noteLead}
        onClose={() => setNoteLead(null)}
        title={`Follow-up Notes — ${noteLead?.name || "Lead"}`}
        subtitle="Complete chronological timeline of all discussions, call records, and meeting notes"
        size="lg"
      >
        {noteLead && (
          <div className="space-y-4">
            {/* Mini Lead Header Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#29374B] bg-[#172235] p-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D2A3D] border border-[#29374B] text-sm font-bold text-[#86A9D8] shadow-xs">
                  {(noteLead.name?.[0] || "L").toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F0F4FA]">{noteLead.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BA9BC]">
                    {noteLead.phone && (
                      <span className="flex items-center gap-1 font-medium text-[#F0F4FA]">
                        <Phone className="h-3 w-3 text-[#86A9D8]" /> {noteLead.phone}
                      </span>
                    )}
                    {noteLead.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-[#86A9D8]" /> {noteLead.email}
                      </span>
                    )}
                    {noteLead.property?.title && (
                      <span className="text-[11px] font-medium text-[#86A9D8] bg-[#0F1622] border border-[#29374B] px-2 py-0.5 rounded-md">
                        {noteLead.property.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge value={noteLead.status} tone={statusTone(noteLead.status)} />
                <Badge
                  value={noteLead.priority}
                  tone={noteLead.priority === "High" ? "red" : "slate"}
                />
              </div>
            </div>

            {/* Initial Requirement Note (if any) */}
            {noteLead.notes && (
              <div className="rounded-xl border border-[#E5B86B]/30 bg-[#E5B86B]/10 p-3 text-xs text-[#E5B86B] shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#E5B86B] mb-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Initial Requirement / Inquiry Remarks</span>
                </div>
                <p className="text-[#F0F4FA] whitespace-pre-wrap leading-relaxed pl-1">
                  {noteLead.notes}
                </p>
              </div>
            )}

            {/* ALL Follow-up Notes Timeline */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#29374B]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#86A9D8]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F0F4FA]">
                    Follow-up Notes History ({noteLead.followUps?.length || 0})
                  </h4>
                </div>
                {noteLead.nextFollowUp && (
                  <span className="text-[11px] font-semibold text-[#E5B86B] bg-[#E5B86B]/10 border border-[#E5B86B]/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Next Due:{" "}
                    {new Date(noteLead.nextFollowUp).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Follow-up Notes List (Scrollable) */}
              <div className="mt-3 max-h-64 overflow-y-auto pr-1 space-y-2.5">
                {!noteLead.followUps || noteLead.followUps.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#29374B] bg-[#172235]/60 p-6 text-center">
                    <MessageSquare className="mx-auto h-7 w-7 text-[#9BA9BC] mb-1.5" />
                    <p className="text-xs font-bold text-[#F0F4FA]">
                      No Follow-up Notes Recorded Yet
                    </p>
                    <p className="text-[11px] text-[#9BA9BC] mt-0.5">
                      Log your first call summary, site visit outcome, or client remark below.
                    </p>
                  </div>
                ) : (
                  [...noteLead.followUps].reverse().map((f, idx) => {
                    const kind = f.kind || "note";
                    const kindColors = {
                      call: "bg-[#86A9D8]/15 text-[#86A9D8] border-[#86A9D8]/30",
                      visit: "bg-[#70C6A5]/15 text-[#70C6A5] border-[#70C6A5]/30",
                      email: "bg-purple-500/15 text-purple-300 border-purple-500/30",
                      note: "bg-[#1D2A3D] text-[#9BA9BC] border-[#29374B]",
                    };
                    const kindIcons = {
                      call: Phone,
                      visit: MapPin,
                      email: Mail,
                      note: FileText,
                    };
                    const KindIcon = kindIcons[kind] || FileText;

                    const role = (f.by?.role || "").toUpperCase();
                    const isSuperAdmin = role === "SUPER_ADMIN";
                    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role);
                    const isAgent = role === "AGENT";
                    const authorName =
                      f.by?.name || (isAdmin ? "Administrator" : isAgent ? "Agent" : "System User");

                    return (
                      <div
                        key={f._id || idx}
                        className={`rounded-xl border p-3.5 shadow-2xs transition hover:shadow-xs bg-[#172235] ${
                          isAdmin
                            ? "border-[#29374B] border-l-4 border-l-[#86A9D8]"
                            : isAgent
                            ? "border-[#29374B] border-l-4 border-l-[#70C6A5]"
                            : "border-[#29374B] border-l-4 border-l-[#86A9D8]/50"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#29374B]/70">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Distinct badge for Admin vs Agent */}
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-2xs">
                                <ShieldCheck className="h-3 w-3 text-purple-400" />
                                {isSuperAdmin ? "Super Admin" : "Admin"}
                              </span>
                            ) : isAgent ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#86A9D8]/15 text-[#86A9D8] border border-[#86A9D8]/30 shadow-2xs">
                                <Briefcase className="h-3 w-3 text-[#86A9D8]" />
                                Agent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#1D2A3D] text-[#9BA9BC] border border-[#29374B]">
                                <User className="h-3 w-3 text-[#9BA9BC]" />
                                {role || "Staff"}
                              </span>
                            )}

                            {/* Author Name */}
                            <span className="text-xs font-bold text-[#F0F4FA]">
                              {authorName}
                            </span>

                            {f.by?.email && (
                              <span className="text-[10px] text-[#9BA9BC] font-normal">
                                · {f.by.email}
                              </span>
                            )}

                            {/* Interaction Type pill */}
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                kindColors[kind] || kindColors.note
                              }`}
                            >
                              <KindIcon className="h-2.5 w-2.5" />
                              {kind}
                            </span>
                          </div>

                          {/* Timestamp */}
                          <span className="text-[11px] text-[#9BA9BC] font-medium flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3 text-[#9BA9BC]" />
                            {new Date(f.date || f.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#F0F4FA] whitespace-pre-wrap leading-relaxed pl-0.5 font-normal">
                          {f.note}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add New Follow-up Note Form */}
            {canNote && (
              <form onSubmit={saveNote} className="pt-3 border-t border-[#29374B] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#86A9D8] flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Follow-Up Note</span>
                  </h4>
                  <span className="text-[10px] text-[#9BA9BC]">Logged permanently into timeline</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#9BA9BC] mb-1">
                      Interaction Type
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "note", label: "Note", icon: FileText },
                        { id: "call", label: "Call", icon: Phone },
                        { id: "visit", label: "Visit", icon: MapPin },
                        { id: "email", label: "Email", icon: Mail },
                      ].map((t) => {
                        const Icon = t.icon;
                        const selected = noteKind === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setNoteKind(t.id)}
                            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                              selected
                                ? "border-[#86A9D8] bg-[#86A9D8]/20 text-[#86A9D8] shadow-xs"
                                : "border-[#29374B] bg-[#172235] text-[#9BA9BC] hover:bg-[#1D2A3D] hover:text-[#F0F4FA]"
                            }`}
                          >
                            <Icon className="h-3 w-3 mb-0.5" />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#9BA9BC] mb-1">
                      Next Follow-up Due (Optional)
                    </label>
                    <input
                      type="date"
                      className={inputCls}
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#9BA9BC] mb-1">
                    Note Details <span className="text-[#E4777D]">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    className={inputCls}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g. Spoke with client regarding 3BHK apartment. Client loved floor layout and requested site visit on Saturday 11 AM."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setNoteLead(null)}
                    className="rounded-xl border border-[#29374B] bg-[#172235] px-4 py-2 text-xs font-semibold text-[#9BA9BC] hover:bg-[#1D2A3D] hover:text-[#F0F4FA] transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNote || !noteText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#86A9D8] px-5 py-2 text-xs font-bold text-[#080C13] shadow-sm hover:bg-[#97b9e5] transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingNote ? "Saving Note..." : "Save Follow-Up Note"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={confirm.close}
        onConfirm={confirm.confirm}
        message={confirm.message}
      />
    </div>
  );
}
