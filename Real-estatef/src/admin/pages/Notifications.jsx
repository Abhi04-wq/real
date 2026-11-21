import { useEffect, useState, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Send,
  Plus,
  Search,
  RefreshCw,
  Calendar,
  CreditCard,
  Building,
  UserCheck,
  AlertCircle
} from "lucide-react";
import api from "../../lib/adminApi";
import { DataTable, Pagination, Badge, Drawer, Field, inputCls, FormSection, FormActions } from "../components/ui";

export default function Notifications({ canSend = true }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "system",
    broadcast: true,
  });
  const [sending, setSending] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sort: "createdAt:desc" };
      if (filter === "unread") params.isRead = false;
      if (filter === "read") params.isRead = true;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/notifications", { params });
      setRows(data.data || []);
      setMeta({ page: data.page, totalPages: data.totalPages });
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [filter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(1);
  };

  const toggleReadStatus = async (item, targetStatus) => {
    const newStatus = targetStatus !== undefined ? targetStatus : !item.isRead;
    // Optimistic update
    setRows((prev) =>
      prev.map((r) => (r._id === item._id ? { ...r, isRead: newStatus } : r))
    );
    try {
      await api.patch(`/notifications/${item._id}/read`, { isRead: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
      load(meta.page);
    }
  };

  const markAllRead = async () => {
    setRows((prev) => prev.map((r) => ({ ...r, isRead: true })));
    try {
      await api.patch("/notifications/read-all");
      load(meta.page);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      load(meta.page);
    }
  };

  const removeNotification = async (id) => {
    setRows((prev) => prev.filter((r) => r._id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      load(meta.page);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/notifications", form);
      setDrawerOpen(false);
      setForm({ title: "", message: "", type: "system", broadcast: true });
      load(1);
    } catch (err) {
      console.error("Failed to send notification:", err);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = useMemo(() => rows.filter((r) => !r.isRead).length, [rows]);

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#172235] rounded-xl border border-[#29374B]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === "all"
                  ? "bg-[#1D2A3D] text-[#86A9D8] font-bold shadow-xs border border-[#86A9D8]/30"
                  : "text-[#9BA9BC] hover:text-[#F0F4FA]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                filter === "unread"
                  ? "bg-[#1D2A3D] text-[#86A9D8] font-bold shadow-xs border border-[#86A9D8]/30"
                  : "text-[#9BA9BC] hover:text-[#F0F4FA]"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    filter === "unread" ? "bg-[#1A283D] text-[#86A9D8]" : "bg-[#1D2A3D] text-[#86A9D8]"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter("read")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === "read"
                  ? "bg-[#1D2A3D] text-[#86A9D8] font-bold shadow-xs border border-[#86A9D8]/30"
                  : "text-[#9BA9BC] hover:text-[#F0F4FA]"
              }`}
            >
              Read
            </button>
          </div>

          <button
            type="button"
            onClick={() => load(meta.page)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#29374B] bg-[#172235] text-[#9BA9BC] hover:bg-[#1D2A3D] hover:text-[#F0F4FA] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#86A9D8]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#29374B] bg-[#172235] px-3 py-2 text-xs font-semibold text-[#86A9D8] hover:bg-[#1D2A3D] hover:text-[#F0F4FA] transition cursor-pointer"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86A9D8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-48 sm:w-60 rounded-xl border border-[#29374B] bg-[#0F1622] pl-8 pr-3 py-1.5 text-xs text-[#F0F4FA] placeholder:text-[#9BA9BC]/50 focus:border-[#86A9D8] focus:outline-none focus:ring-1 focus:ring-[#86A9D8]/30"
            />
          </form>

          {canSend && (
            <button
              type="button"
              onClick={() => {
                setForm({ title: "", message: "", type: "system", broadcast: true });
                setDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#86A9D8] px-3.5 py-2 text-xs font-bold text-[#080C13] shadow-xs hover:bg-[#97b9e5] transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Notification</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Notifications Table */}
      <DataTable
        loading={loading}
        columns={[
          {
            key: "title",
            label: "Notification & Content",
            render: (n) => (
              <div className="flex items-start gap-3 py-1">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    !n.isRead ? "bg-[#F7F6F2] text-[#B9965B] border border-[#DFDED7]" : "bg-white text-[#929A9D] border border-[#DFDED7]/60"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        !n.isRead ? "text-[#17232F]" : "text-[#65717B]"
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#B9965B] inline-block shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#65717B] line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "type",
            label: "Category",
            render: (n) => (
              <span className="inline-flex items-center rounded-lg bg-[#F7F6F2] border border-[#DFDED7] px-2 py-0.5 text-[11px] font-medium text-[#17232F]">
                {n.type?.replace(/_/g, " ")}
              </span>
            ),
          },
          {
            key: "recipient",
            label: "Audience",
            render: (n) => (
              <span className="text-xs text-[#65717B]">
                {n.recipient?.email ? n.recipient.email : "Broadcast (All Users)"}
              </span>
            ),
          },
          {
            key: "isRead",
            label: "Status",
            render: (n) => (
              <Badge
                value={n.isRead ? "Read" : "Unread"}
                tone={n.isRead ? "green" : "amber"}
              />
            ),
          },
          {
            key: "createdAt",
            label: "Date & Time",
            render: (n) => (
              <span className="text-xs text-[#65717B] whitespace-nowrap font-mono">
                {new Date(n.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (n) => (
              <div className="flex items-center gap-1.5">
                {/* Option for Mark as Read only on unread messages */}
                {!n.isRead ? (
                  <button
                    type="button"
                    onClick={() => toggleReadStatus(n, true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#71877B]/30 bg-[#EBF3EF] px-2 py-1 text-xs font-semibold text-[#3E8066] hover:bg-[#DFEDE6] transition cursor-pointer shadow-2xs"
                    title="Mark as Read"
                  >
                    <Check className="h-3 w-3" />
                    <span>Mark Read</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => removeNotification(n._id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-[#65717B] hover:border-[#B85C56]/30 hover:bg-[#FDF0EE] hover:text-[#B85C56] transition cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          },
        ]}
        rows={rows}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      {/* Drawer for sending new notification */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Compose Notification"
        subtitle="Broadcast an announcement or alert to your team and clients"
        size="md"
      >
        <form onSubmit={send} className="space-y-4">
          <FormSection
            icon={Bell}
            title="Notification Content"
            description="Clear subject headline and comprehensive message body."
          >
            <div className="space-y-3.5">
              <Field label="Notification Title" required hint="Max 100 characters">
                <input
                  required
                  className={inputCls}
                  placeholder="e.g. Scheduled System Maintenance / New Exclusive Listing"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Field>

              <Field label="Message Body" required hint="Rich message content">
                <textarea
                  required
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Enter the full notification message details..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={Send}
            title="Classification & Target Audience"
            description="Categorize notification priority and recipients."
          >
            <div className="space-y-3.5">
              <Field label="Event Type">
                <select
                  className={inputCls}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {[
                    "system",
                    "new_property",
                    "property_approved",
                    "property_rejected",
                    "new_booking",
                    "booking_confirmation",
                    "payment_received",
                    "payment_failed",
                    "new_lead",
                    "lead_assigned",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="rounded-xl border border-[#29374B] bg-[#0F1622] p-3 hover:border-[#86A9D8]/30 transition">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-[#F0F4FA] cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-[#86A9D8] cursor-pointer"
                    checked={form.broadcast}
                    onChange={(e) => setForm({ ...form, broadcast: e.target.checked })}
                  />
                  <div>
                    <p className="font-semibold text-xs text-[#F0F4FA]">Broadcast to all platform users</p>
                    <p className="text-[11px] text-[#9BA9BC] font-normal mt-0.5">
                      All registered agents, customers, and staff will receive this alert.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </FormSection>

          <FormActions
            onCancel={() => setDrawerOpen(false)}
            submitLabel="Send Notification"
            loading={sending}
            cancelLabel="Cancel"
          />
        </form>
      </Drawer>
    </div>
  );
}
