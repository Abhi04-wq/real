import { useEffect, useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  Search,
  Calendar,
  CreditCard,
  Building,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Filter,
  Check,
  Inbox
} from "lucide-react";
import api from "../../lib/adminApi";
import { Drawer, Badge, Modal, Field, inputCls, FormSection, FormActions } from "./ui";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type) {
  switch (type) {
    case "new_booking":
    case "booking_confirmation":
      return { icon: Calendar, bg: "bg-[#DCEBE5]", color: "text-[#176B5B]" };
    case "payment_received":
      return { icon: CreditCard, bg: "bg-emerald-100", color: "text-emerald-700" };
    case "payment_failed":
      return { icon: AlertCircle, bg: "bg-rose-100", color: "text-rose-700" };
    case "new_property":
      return { icon: Building, bg: "bg-blue-100", color: "text-blue-700" };
    case "property_approved":
      return { icon: CheckCircle2, bg: "bg-teal-100", color: "text-teal-700" };
    case "property_rejected":
      return { icon: XCircle, bg: "bg-rose-100", color: "text-rose-700" };
    case "new_lead":
    case "lead_assigned":
      return { icon: UserCheck, bg: "bg-indigo-100", color: "text-indigo-700" };
    default:
      return { icon: Bell, bg: "bg-[#F7F7F2]", color: "text-[#176B5B]" };
  }
}

export default function NotificationDrawer({ open, onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    title: "",
    message: "",
    type: "system",
    broadcast: true,
  });
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications", {
        params: { limit: 100, sort: "createdAt:desc" },
      });
      const items = data.data || [];
      setNotifications(items);
      const unread = items.filter((n) => !n.isRead).length;
      onCountChange?.(unread);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Toggle read/unread status for a specific notification
  const handleToggleRead = async (notif, targetStatus) => {
    const newReadStatus = targetStatus !== undefined ? targetStatus : !notif.isRead;
    const prevItems = [...notifications];

    // Optimistic update
    const updated = notifications.map((n) =>
      n._id === notif._id ? { ...n, isRead: newReadStatus } : n
    );
    setNotifications(updated);
    const unread = updated.filter((n) => !n.isRead).length;
    onCountChange?.(unread);

    setActionLoadingId(notif._id);
    try {
      await api.patch(`/notifications/${notif._id}/read`, { isRead: newReadStatus });
    } catch (err) {
      // Revert if error
      console.error("Failed to update notification read status:", err);
      setNotifications(prevItems);
      const prevUnread = prevItems.filter((n) => !n.isRead).length;
      onCountChange?.(prevUnread);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const prevItems = [...notifications];
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    onCountChange?.(0);

    try {
      await api.patch("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setNotifications(prevItems);
      const prevUnread = prevItems.filter((n) => !n.isRead).length;
      onCountChange?.(prevUnread);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    const prevItems = [...notifications];
    const updated = notifications.filter((n) => n._id !== id);
    setNotifications(updated);
    const unread = updated.filter((n) => !n.isRead).length;
    onCountChange?.(unread);

    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setNotifications(prevItems);
      const prevUnread = prevItems.filter((n) => !n.isRead).length;
      onCountChange?.(prevUnread);
    }
  };

  // Send new notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/notifications", sendForm);
      setShowSendModal(false);
      setSendForm({ title: "", message: "", type: "system", broadcast: true });
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to send notification:", err);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );
  const readCount = useMemo(
    () => notifications.filter((n) => n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread" && n.isRead) return false;
      if (filter === "read" && !n.isRead) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(q);
        const matchesMsg = n.message?.toLowerCase().includes(q);
        const matchesType = n.type?.toLowerCase().includes(q);
        const matchesRecipient = n.recipient?.email?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesType && !matchesRecipient) return false;
      }
      return true;
    });
  }, [notifications, filter, search]);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#DCEBE5] text-[#176B5B]">
              <Bell className="h-4 w-4" />
            </div>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#176B5B] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                {unreadCount} new
              </span>
            )}
          </div>
        }
        subtitle="Live platform alerts, bookings, inquiries and status updates"
        size="md"
      >
        <div className="flex flex-col h-full space-y-4">
          {/* Top Actions & Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-[#F7F7F2] rounded-xl border border-[#E4E7E5]">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filter === "all"
                      ? "bg-[#FFFFFF] text-[#1C2421] shadow-xs"
                      : "text-[#6B746F] hover:text-[#1C2421]"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    filter === "unread"
                      ? "bg-[#176B5B] text-white shadow-xs"
                      : "text-[#6B746F] hover:text-[#1C2421]"
                  }`}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span
                      className={`h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        filter === "unread" ? "bg-white/20 text-white" : "bg-[#DCEBE5] text-[#176B5B]"
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("read")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filter === "read"
                      ? "bg-[#FFFFFF] text-[#1C2421] shadow-xs"
                      : "text-[#6B746F] hover:text-[#1C2421]"
                  }`}
                >
                  Read ({readCount})
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  title="Refresh notifications"
                  disabled={loading}
                  className="rounded-lg border border-[#E4E7E5] bg-[#FFFFFF] p-1.5 text-[#6B746F] hover:bg-[#F7F7F2] hover:text-[#1C2421] transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#176B5B]" : ""}`} />
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEBE5] bg-[#DCEBE5]/40 px-2.5 py-1.5 text-xs font-semibold text-[#176B5B] hover:bg-[#DCEBE5] transition cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSendModal(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#176B5B] px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#12584B] transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B746F]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-[#E4E7E5] bg-[#FFFFFF] pl-8 pr-3 py-1.5 text-xs text-[#1C2421] placeholder:text-[#6B746F] focus:border-[#176B5B] focus:outline-none focus:ring-1 focus:ring-[#176B5B]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#6B746F] hover:text-[#1C2421]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
            {loading && notifications.length === 0 ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-[#E4E7E5] bg-[#FFFFFF] p-4 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-gray-200" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                        <div className="h-2 w-1/4 rounded bg-gray-100" />
                      </div>
                    </div>
                    <div className="h-3 w-4/5 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-[#E4E7E5] bg-[#FFFFFF] p-10 text-center my-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCEBE5]/40 text-[#176B5B] mb-3">
                  <Inbox className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1C2421]">No Notifications Found</h4>
                <p className="mt-1 text-xs text-[#6B746F] max-w-xs mx-auto">
                  {search
                    ? `No notifications matching "${search}"`
                    : filter === "unread"
                    ? "Great job! You have read all notifications."
                    : filter === "read"
                    ? "No read notifications yet."
                    : "No notifications have been recorded yet."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const iconMeta = getNotificationIcon(notif.type);
                const IconComponent = iconMeta.icon;
                const isItemLoading = actionLoadingId === notif._id;

                return (
                  <div
                    key={notif._id}
                    className={`group relative rounded-2xl border transition-all duration-200 p-4 ${
                      !notif.isRead
                        ? "border-[#176B5B]/30 bg-gradient-to-br from-[#FFFFFF] to-[#DCEBE5]/20 shadow-xs"
                        : "border-[#E4E7E5] bg-[#FFFFFF] hover:border-[#D1D6D3]"
                    }`}
                  >
                    {/* Unread Accent Pill */}
                    {!notif.isRead && (
                      <span className="absolute top-4 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#176B5B] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#176B5B]" />
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Category Icon */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconMeta.bg} ${iconMeta.color}`}
                      >
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4
                            className={`text-xs font-bold leading-tight ${
                              !notif.isRead ? "text-[#1C2421]" : "text-[#4A5550]"
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <span className="rounded-full bg-[#F7F7F2] border border-[#E4E7E5] px-2 py-0.5 text-[10px] font-medium text-[#6B746F]">
                            {notif.type?.replace(/_/g, " ")}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[#525E57] leading-relaxed break-words">
                          {notif.message}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-[#6B746F]">
                          <span title={new Date(notif.createdAt).toLocaleString()}>
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">
                            {notif.recipient?.email ? `To: ${notif.recipient.email}` : "Broadcast to all"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar for Each Message */}
                    <div className="mt-3.5 pt-2.5 border-t border-[#E4E7E5]/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Option for Mark as Read only on unread messages */}
                        {!notif.isRead ? (
                          <button
                            type="button"
                            disabled={isItemLoading}
                            onClick={() => handleToggleRead(notif, true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#176B5B]/30 bg-[#DCEBE5] px-2.5 py-1 text-xs font-semibold text-[#176B5B] hover:bg-[#176B5B] hover:text-white transition cursor-pointer shadow-2xs disabled:opacity-50"
                            title="Mark as Read"
                          >
                            <Check className="h-3 w-3" />
                            <span>Mark as read</span>
                          </button>
                        ) : null}

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            !notif.isRead
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {!notif.isRead ? "Unread" : "Read"}
                        </span>
                      </div>

                      {/* Delete notification */}
                      <button
                        type="button"
                        onClick={() => handleDelete(notif._id)}
                        className="rounded-lg p-1.5 text-[#6B746F] hover:bg-[#FDF2F2] hover:text-[#C65353] transition cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Drawer>

      {/* Send Notification Modal */}
      <Modal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Platform Notification"
        subtitle="Broadcast an immediate alert or update across platform channels"
      >
        <form onSubmit={handleSendNotification} className="space-y-4">
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
                  placeholder="e.g. Scheduled Maintenance / New Property Live"
                  value={sendForm.title}
                  onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                />
              </Field>

              <Field label="Message Body" required hint="Rich message content">
                <textarea
                  required
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Write the full notification message here..."
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
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
              <Field label="Type / Category">
                <select
                  className={inputCls}
                  value={sendForm.type}
                  onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                >
                  <option value="system">System Announcement</option>
                  <option value="new_property">New Property</option>
                  <option value="property_approved">Property Approved</option>
                  <option value="property_rejected">Property Rejected</option>
                  <option value="new_booking">New Booking</option>
                  <option value="booking_confirmation">Booking Confirmation</option>
                  <option value="payment_received">Payment Received</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="new_lead">New Lead</option>
                  <option value="lead_assigned">Lead Assigned</option>
                </select>
              </Field>

              <div className="rounded-xl border border-[#E4E7E5] bg-[#F7F7F2]/60 p-3 hover:bg-[#F7F7F2] transition">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-[#1C2421] cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-[#176B5B] cursor-pointer"
                    checked={sendForm.broadcast}
                    onChange={(e) =>
                      setSendForm({ ...sendForm, broadcast: e.target.checked })
                    }
                  />
                  <div>
                    <p className="font-semibold text-xs text-[#1C2421]">Broadcast to all platform users</p>
                    <p className="text-[11px] text-[#6B746F] font-normal mt-0.5">
                      All registered clients and agents will receive this push notification.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </FormSection>

          <FormActions
            onCancel={() => setShowSendModal(false)}
            submitLabel="Send Notification"
            loading={sending}
            cancelLabel="Cancel"
          />
        </form>
      </Modal>
    </>
  );
}
