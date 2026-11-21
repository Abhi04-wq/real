import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/adminApi";
import { Badge, statusTone, Drawer } from "../../admin/components/ui";
import { Mail, Phone, Calendar, CreditCard, Clock, FileText, Building2, MessageSquare } from "lucide-react";
import Customers from "./Customers";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/customers/${id}`)
      .then(({ data }) => setD(data))
      .finally(() => setLoading(false));
  }, [id]);

  const customer = d?.customer;
  const leads = d?.leads || [];
  const bookings = d?.bookings || [];
  const transactions = d?.transactions || [];
  const activity = d?.activity || [];
  const interestedProperties = d?.interestedProperties || [];

  return (
    <div>
      <Customers />
      <Drawer
        open={Boolean(id)}
        onClose={() => navigate("/manage/customers")}
        title={customer ? customer.name : "Customer Profile"}
        subtitle={customer ? `Customer • ID: ${customer._id?.slice(-8)}` : "Loading customer details..."}
        size="md"
      >
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 rounded-2xl bg-[#DFDED7]/50" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded-xl bg-[#DFDED7]/50" />
              <div className="h-16 rounded-xl bg-[#DFDED7]/50" />
              <div className="h-16 rounded-xl bg-[#DFDED7]/50" />
            </div>
            <div className="h-44 rounded-xl bg-[#DFDED7]/40" />
          </div>
        ) : !customer ? (
          <p className="text-center py-10 text-sm text-[#65717B]">Customer not found</p>
        ) : (
          <div className="space-y-5 text-sm">
            {/* Customer Profile Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[#DFDED7] bg-gradient-to-br from-[#F7F7F2] via-white to-[#F4EFE6]/30 p-4.5 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#B9965B] to-[#3E8066] text-lg font-bold text-white shadow-md">
                  {customer.name ? customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "C"}
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    customer.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-[#17232F] truncate">{customer.name}</h4>
                    <Badge value={customer.status || "active"} tone={statusTone(customer.status)} />
                  </div>
                  <p className="mt-1 text-[11px] text-[#65717B]">
                    Customer ID: <span className="font-mono text-[#B9965B] font-semibold">{customer._id?.slice(-8)}</span>
                  </p>
                </div>
              </div>

              {/* Quick Contact Links */}
              <div className="mt-4 pt-3 border-t border-[#DFDED7]/70 grid grid-cols-1 gap-2 text-xs">
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-[#17232F] hover:text-[#B9965B] transition truncate group">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white border border-[#DFDED7] text-[#65717B] group-hover:border-[#B9965B]/30 group-hover:text-[#B9965B]">
                      <Mail className="h-3 w-3" />
                    </div>
                    <span className="truncate">{customer.email}</span>
                  </a>
                )}
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-[#17232F] hover:text-[#B9965B] transition truncate group">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white border border-[#DFDED7] text-[#65717B] group-hover:border-[#B9965B]/30 group-hover:text-[#B9965B]">
                      <Phone className="h-3 w-3" />
                    </div>
                    <span>{customer.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[#DFDED7] bg-white p-2.5 text-center shadow-xs">
                <p className="text-[10px] font-medium uppercase text-[#65717B]">Inquiries</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-[#17232F]">{leads.length}</p>
              </div>
              <div className="rounded-xl border border-[#DFDED7] bg-white p-2.5 text-center shadow-xs">
                <p className="text-[10px] font-medium uppercase text-[#65717B]">Bookings</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-[#B9965B]">{bookings.length}</p>
              </div>
              <div className="rounded-xl border border-[#DFDED7] bg-white p-2.5 text-center shadow-xs">
                <p className="text-[10px] font-medium uppercase text-[#65717B]">Payments</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-[#3E8066]">{transactions.length}</p>
              </div>
            </div>

            {/* Inquiries */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#65717B] mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-[#B9965B]" />
                <span>Inquiry Details ({leads.length})</span>
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto drawer-content-scroll pr-1">
                {leads.length > 0 ? (
                  leads.map((l) => (
                    <div key={l._id} className="rounded-xl border border-[#DFDED7] bg-white p-2.5 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-[#17232F] truncate">{l.property?.title || l.notes?.slice(0, 40) || "General Inquiry"}</p>
                          <p className="text-[11px] text-[#65717B] mt-0.5 truncate">{l.phone}{l.email ? ` • ${l.email}` : ""}</p>
                        </div>
                        <Badge value={l.status} tone={statusTone(l.status)} />
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#DFDED7]/60 space-y-1 text-[11px] text-[#65717B]">
                        {l.property && (
                          <p className="flex items-center justify-between gap-2">
                            <span className="truncate">🏠 {l.property?.title} {l.property?.city ? `(${l.property.city})` : ""}</span>
                            {l.property?.price != null && <span className="font-mono font-bold text-[#B9965B] shrink-0">₹{Number(l.property.price).toLocaleString("en-IN")}</span>}
                          </p>
                        )}
                        <p className="flex items-center justify-between gap-2">
                          <span>Source: <b className="text-[#17232F]">{l.source || "—"}</b></span>
                          <span>Priority: <b className={l.priority === "High" || l.priority === "Urgent" ? "text-rose-600" : "text-[#17232F]"}>{l.priority || "—"}</b></span>
                        </p>
                        {l.notes && <p className="text-[#17232F] leading-relaxed line-clamp-2">📝 {l.notes}</p>}
                        <p className="flex items-center justify-between gap-2 font-mono text-[10px]">
                          <span>{l.createdAt ? new Date(l.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                          {l.nextFollowUp && <span className="text-amber-700">Follow-up: {new Date(l.nextFollowUp).toLocaleDateString()}</span>}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-3 rounded-xl border border-dashed border-[#DFDED7]">No inquiries yet</p>
                )}
              </div>
            </div>

            {/* Bookings */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#65717B] mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#B9965B]" />
                <span>Recent Bookings ({bookings.length})</span>
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto drawer-content-scroll pr-1">
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <div key={b._id} className="rounded-xl border border-[#DFDED7] bg-white p-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-xs text-[#17232F] truncate">{b.property?.title || "Property Booking"}</p>
                        <p className="text-[11px] text-[#65717B] font-mono mt-0.5">{b.bookingId || "Booking"}</p>
                      </div>
                      <Badge value={b.status} tone={statusTone(b.status)} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#65717B] text-center py-3 rounded-xl border border-dashed border-[#DFDED7]">No bookings yet</p>
                )}
              </div>
            </div>

            {/* Interested Properties */}
            {interestedProperties.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#65717B] mb-2 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#B9965B]" />
                  <span>Interested Properties ({interestedProperties.length})</span>
                </p>
                <div className="space-y-1.5">
                  {interestedProperties.map((p) => (
                    <div key={p._id} className="rounded-xl border border-[#DFDED7] bg-white p-2.5 flex items-center justify-between">
                      <p className="font-medium text-xs text-[#17232F] truncate">{p.title}</p>
                      <span className="text-xs font-mono font-bold text-[#B9965B]">₹{Number(p.price || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {customer.notes && customer.notes.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#65717B] mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#B9965B]" />
                  <span>Follow-up Notes</span>
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto drawer-content-scroll pr-1">
                  {customer.notes.map((n, i) => (
                    <div key={i} className="rounded-xl border border-[#DFDED7] bg-[#F7F7F2]/40 p-2.5 text-xs">
                      <p className="text-[#17232F]">{n.text}</p>
                      <p className="text-[10px] text-[#65717B] mt-1 font-mono">
                        {n.by?.name || "Staff"} • {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2 border-t border-[#DFDED7] flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/manage/customers")}
                className="w-full rounded-xl border border-[#DFDED7] hover:bg-[#F7F7F2] py-2 text-xs font-semibold text-[#65717B] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
