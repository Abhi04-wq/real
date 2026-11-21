import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { Drawer, Badge, statusTone } from "./ui";
import { 
  Mail, Phone, Calendar, KeyRound, Clock, 
  CreditCard, CheckCircle2, AlertCircle, 
  User as UserIcon, Shield, Receipt, Activity,
  ChevronRight, RefreshCw, Pencil, MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

export default function UserProfileDrawer({ userId, open, onClose, onEdit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!open || !userId) {
      setData(null);
      return;
    }
    setActiveTab("overview");
    let isMounted = true;
    setLoading(true);
    api.get(`/users/${userId}`)
      .then(({ data: res }) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to load user details");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, open]);

  const handleResetPassword = async () => {
    if (!data?.user?._id) return;
    setResetting(true);
    try {
      await api.post("/auth/reset-password", { 
        userId: data.user._id, 
        newPassword: "Reset@123" 
      });
      toast.success("Password reset to 'Reset@123'");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const user = data?.user;
  const bookings = data?.bookings || [];
  const transactions = data?.transactions || [];
  const activity = data?.activity || [];
  const inquiries = data?.leads || [];

  const totalSpent = transactions
    .filter((t) => t.status === "Paid" || t.status === "Completed")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <Drawer 
      open={open} 
      onClose={onClose} 
      title={user ? user.name : "User Profile"} 
      subtitle={user ? `${user.role || "User"} • ID: ${user._id?.slice(-8)}` : "Loading user details..."}
      size="md"
    >
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-[#EAE8E1]" />
          <div className="grid grid-cols-4 gap-2">
            <div className="h-16 rounded-xl bg-[#EAE8E1]" />
            <div className="h-16 rounded-xl bg-[#EAE8E1]" />
            <div className="h-16 rounded-xl bg-[#EAE8E1]" />
            <div className="h-16 rounded-xl bg-[#EAE8E1]" />
          </div>
          <div className="h-44 rounded-xl bg-[#EAE8E1]" />
        </div>
      ) : !user ? (
        <div className="py-12 text-center text-sm text-[#65717B]">
          <p>No user details available</p>
        </div>
      ) : (
        <div className="space-y-5 text-sm">
          {/* Profile Header Banner — same light type as dashboard */}
          <div className="relative overflow-hidden rounded-2xl border border-[#DFDED7] bg-white p-4.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
            <div className="flex items-start gap-3.5">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4EFE6] border border-[#B9965B]/30 text-lg font-bold text-[#B9965B] shadow-md">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <span>{user.name ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "U"}</span>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  user.status === "active" ? "bg-[#3E8066]" : user.status === "suspended" ? "bg-[#B85C56]" : "bg-slate-400"
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-[#17232F] truncate">{user.name}</h4>
                  <Badge value={user.role} tone="blue" />
                  <Badge value={user.status || "active"} tone={statusTone(user.status)} />
                </div>
                <p className="mt-1 text-[11px] text-[#65717B]">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>

            {/* Quick Contact Row */}
            <div className="mt-4 pt-3 border-t border-[#DFDED7] grid grid-cols-1 gap-2 text-xs">
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-2 text-[#65717B] hover:text-[#B9965B] transition truncate group"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B] group-hover:border-[#B9965B]/50">
                    <Mail className="h-3 w-3" />
                  </div>
                  <span className="truncate">{user.email}</span>
                </a>
              )}
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-2 text-[#65717B] hover:text-[#B9965B] transition truncate group"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B] group-hover:border-[#B9965B]/50">
                    <Phone className="h-3 w-3" />
                  </div>
                  <span className="text-[#17232F]">{user.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
              <p className="text-[10px] font-medium uppercase text-[#65717B]">Inquiries</p>
              <p className="mt-0.5 text-lg font-bold font-mono text-[#17232F]">{inquiries.length}</p>
            </div>
            <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
              <p className="text-[10px] font-medium uppercase text-[#65717B]">Bookings</p>
              <p className="mt-0.5 text-lg font-bold font-mono text-[#17232F]">{bookings.length}</p>
            </div>
            <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
              <p className="text-[10px] font-medium uppercase text-[#65717B]">Payments</p>
              <p className="mt-0.5 text-lg font-bold font-mono text-[#B9965B]">{transactions.length}</p>
            </div>
            <div className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-2.5 text-center shadow-xs">
              <p className="text-[10px] font-medium uppercase text-[#65717B]">Total Spent</p>
              <p className="mt-0.5 text-xs font-bold font-mono text-[#3E8066] truncate">
                ₹{totalSpent.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex-1 rounded-lg py-1.5 font-medium transition cursor-pointer ${
                activeTab === "overview" 
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-semibold" 
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("inquiries")}
              className={`flex-1 rounded-lg py-1.5 font-medium transition cursor-pointer ${
                activeTab === "inquiries" 
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-semibold" 
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Inquiries ({inquiries.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 rounded-lg py-1.5 font-medium transition cursor-pointer ${
                activeTab === "bookings" 
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-semibold" 
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 rounded-lg py-1.5 font-medium transition cursor-pointer ${
                activeTab === "transactions" 
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-semibold" 
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Txns ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`flex-1 rounded-lg py-1.5 font-medium transition cursor-pointer ${
                activeTab === "activity" 
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-semibold" 
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[220px]">
            {activeTab === "overview" && (
              <div className="space-y-3">
                {/* Security & Password Reset */}
                <div className="rounded-xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-xs text-[#17232F] flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-[#B9965B]" />
                        <span>Security & Access</span>
                      </h5>
                      <p className="mt-0.5 text-[11px] text-[#65717B]">Reset account password to temporary defaults</p>
                    </div>
                    <button
                      type="button"
                      disabled={resetting}
                      onClick={handleResetPassword}
                      className="rounded-lg border border-[#B9965B]/40 bg-[#F4EFE6] px-2.5 py-1 text-xs font-semibold text-[#B9965B] hover:bg-[#B9965B] hover:text-white transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {resetting ? "Resetting..." : "Reset password"}
                    </button>
                  </div>
                </div>

                {/* Recent Inquiry Snippet */}
                <div className="rounded-xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                  <h5 className="font-semibold text-xs text-[#17232F] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-[#B9965B]" />
                      <span>Latest Inquiry</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("inquiries")}
                      className="text-[11px] text-[#B9965B] hover:underline cursor-pointer"
                    >
                      View all ({inquiries.length})
                    </button>
                  </h5>
                  {inquiries.length > 0 ? (
                    <div className="rounded-lg border border-[#DFDED7] bg-[#F7F6F2] p-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-xs text-[#17232F] truncate">{inquiries[0].property?.title || inquiries[0].notes?.slice(0, 40) || "General Inquiry"}</p>
                        <p className="text-[11px] text-[#65717B] font-mono mt-0.5">
                          {inquiries[0].createdAt ? new Date(inquiries[0].createdAt).toLocaleDateString() : ""} • {inquiries[0].source || ""}
                        </p>
                      </div>
                      <Badge value={inquiries[0].status} tone={statusTone(inquiries[0].status)} />
                    </div>
                  ) : (
                    <p className="text-xs text-[#65717B] text-center py-2">No inquiries recorded yet</p>
                  )}
                </div>

                {/* Recent Booking Snippet */}
                <div className="rounded-xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                  <h5 className="font-semibold text-xs text-[#17232F] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#B9965B]" />
                      <span>Latest Booking</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("bookings")}
                      className="text-[11px] text-[#B9965B] hover:underline cursor-pointer"
                    >
                      View all ({bookings.length})
                    </button>
                  </h5>
                  {bookings.length > 0 ? (
                    <div className="rounded-lg border border-[#DFDED7] bg-[#F7F6F2] p-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-xs text-[#17232F] truncate">{bookings[0].property?.title || "Property Booking"}</p>
                        <p className="text-[11px] text-[#65717B] font-mono mt-0.5">
                          {bookings[0].bookingId || (bookings[0].createdAt ? new Date(bookings[0].createdAt).toLocaleDateString() : "")}
                        </p>
                      </div>
                      <Badge value={bookings[0].status} tone={statusTone(bookings[0].status)} />
                    </div>
                  ) : (
                    <p className="text-xs text-[#65717B] text-center py-2">No bookings recorded yet</p>
                  )}
                </div>

                {/* Latest Transaction Snippet */}
                <div className="rounded-xl border border-[#DFDED7] bg-white p-3.5 shadow-[0_2px_12px_rgba(23,35,47,0.03)]">
                  <h5 className="font-semibold text-xs text-[#17232F] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-[#B9965B]" />
                      <span>Latest Transaction</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("transactions")}
                      className="text-[11px] text-[#B9965B] hover:underline cursor-pointer"
                    >
                      View all ({transactions.length})
                    </button>
                  </h5>
                  {transactions.length > 0 ? (
                    <div className="rounded-lg border border-[#DFDED7] bg-[#F7F6F2] p-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold font-mono text-xs text-[#B9965B]">
                          ₹{Number(transactions[0].amount).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-[#65717B] font-mono mt-0.5">
                          {transactions[0].transactionId || transactions[0].paymentMethod || "Payment"}
                        </p>
                      </div>
                      <Badge value={transactions[0].status} tone={statusTone(transactions[0].status)} />
                    </div>
                  ) : (
                    <p className="text-xs text-[#65717B] text-center py-2">No transactions recorded yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "inquiries" && (
              <div className="space-y-2 max-h-72 overflow-y-auto drawer-content-scroll pr-1">
                {inquiries.length > 0 ? (
                  inquiries.map((l) => (
                    <div key={l._id} className="rounded-xl border border-[#DFDED7] bg-white p-3 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-[#17232F] truncate flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3 text-[#B9965B] shrink-0" />
                            <span className="truncate">{l.property?.title || l.notes?.slice(0, 40) || "General Inquiry"}</span>
                          </p>
                          <p className="text-[11px] text-[#65717B] mt-0.5 truncate">{l.phone}{l.email ? ` • ${l.email}` : ""}</p>
                        </div>
                        <Badge value={l.status} tone={statusTone(l.status)} />
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#DFDED7] space-y-1 text-[11px] text-[#65717B]">
                        <p className="flex items-center justify-between gap-2">
                          <span>Source: <b className="text-[#17232F]">{l.source || "—"}</b></span>
                          <span>Priority: <b className={l.priority === "High" || l.priority === "Urgent" ? "text-[#B85C56]" : "text-[#17232F]"}>{l.priority || "—"}</b></span>
                        </p>
                        {l.property?.price != null && (
                          <p>Price: <span className="font-mono font-bold text-[#B9965B]">₹{Number(l.property.price).toLocaleString("en-IN")}</span></p>
                        )}
                        {l.notes && <p className="text-[#17232F] leading-relaxed line-clamp-2">📝 {l.notes}</p>}
                        <p className="font-mono text-[10px] text-[#65717B]">{l.createdAt ? new Date(l.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-8 rounded-xl border border-dashed border-[#DFDED7]">No inquiries found</p>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-2 max-h-72 overflow-y-auto drawer-content-scroll pr-1">
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <div key={b._id} className="rounded-xl border border-[#DFDED7] bg-white p-3 shadow-xs hover:border-[#B9965B]/40 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-[#17232F] truncate">{b.property?.title || "Property Visit"}</p>
                          <p className="text-[11px] font-mono text-[#65717B] mt-0.5">ID: {b.bookingId || b._id?.slice(-8)}</p>
                        </div>
                        <Badge value={b.status} tone={statusTone(b.status)} />
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#DFDED7] flex items-center justify-between text-[11px] text-[#65717B]">
                        <span>{b.createdAt ? new Date(b.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                        {b.amount && <span className="font-semibold text-[#B9965B]">₹{Number(b.amount).toLocaleString("en-IN")}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-8 rounded-xl border border-dashed border-[#DFDED7]">No bookings found</p>
                )}
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="space-y-2 max-h-72 overflow-y-auto drawer-content-scroll pr-1">
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <div key={t._id} className="rounded-xl border border-[#DFDED7] bg-white p-3 shadow-xs hover:border-[#B9965B]/40 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold font-mono text-[#B9965B]">₹{Number(t.amount).toLocaleString("en-IN")}</p>
                          <p className="text-[11px] font-mono text-[#65717B] mt-0.5">{t.transactionId || "—"}</p>
                        </div>
                        <Badge value={t.status} tone={statusTone(t.status)} />
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#DFDED7] flex items-center justify-between text-[11px] text-[#65717B]">
                        <span>{t.paymentMethod || "Online"}</span>
                        <span>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-8 rounded-xl border border-dashed border-[#DFDED7]">No transactions found</p>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-2 max-h-72 overflow-y-auto drawer-content-scroll pr-1">
                {activity.length > 0 ? (
                  activity.map((a) => (
                    <div key={a._id} className="rounded-xl border border-[#DFDED7] bg-white p-2.5 shadow-xs flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F7F6F2] text-[#B9965B] border border-[#DFDED7]">
                        <Clock className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-[#17232F]">{a.action}</p>
                        {a.description && <p className="text-[11px] text-[#65717B] mt-0.5">{a.description}</p>}
                        <p className="text-[10px] text-[#65717B]/80 mt-1 font-mono">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-8 rounded-xl border border-dashed border-[#DFDED7]">No recent activity logs</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Footer */}
          <div className="pt-2 border-t border-[#DFDED7] flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="flex-1 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-[#FFFFFF] py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit User
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] hover:bg-[#F0EFE9] text-xs font-semibold text-[#65717B] hover:text-[#17232F] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
