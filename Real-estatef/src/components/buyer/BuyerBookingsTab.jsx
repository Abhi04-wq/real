import React from "react";
import { Building } from "lucide-react";

export default function BuyerBookingsTab({
  bookings,
  setActiveTab,
  formatINR,
  setSelectedBookingForAgreement,
  setAgreementPreviewModalOpen
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h2 className="text-xl font-black tracking-tight">
          Your Purchases Ledger
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-semibold">
          Track booking approvals, download sale agreements, and view payment schedules.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="py-12 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50 text-slate-400">
          <Building className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold mt-2">
            No properties purchased yet.
          </p>
          <button
            onClick={() => setActiveTab("properties")}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow"
          >
            Explore Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm space-y-4 text-xs font-semibold"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-sm text-slate-800">
                    Unit {booking.unit?.unitNumber} • {booking.unit?.project?.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Project location: {booking.unit?.project?.location}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                    booking.status === "confirmed"
                      ? "bg-green-50 text-green-700 border-green-150"
                      : "bg-amber-55 text-amber-700 border-amber-100"
                  }`}
                >
                  {booking.status?.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 font-semibold block">
                    Token Deposited
                  </span>
                  <span className="font-bold text-slate-850 mt-0.5 block">
                    {formatINR(booking.tokenAmountPaid)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">
                    Status
                  </span>
                  <span className="font-bold text-slate-700 mt-0.5 block capitalize">
                    {booking.status?.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">
                    Financing Type
                  </span>
                  <span className="font-bold text-slate-700 mt-0.5 block capitalize">
                    {booking.financingType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">
                    Payment Plan
                  </span>
                  <span className="font-bold text-slate-700 mt-0.5 block capitalize">
                    {booking.paymentPlan?.replace("-", " ")}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-455 tracking-wider">
                  Payment Ledger History
                </span>
                <div className="divide-y divide-slate-200 text-xs">
                  {booking.paymentLedger?.map((tx, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {tx.mode} Payment (Token)
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block font-mono">
                          {tx.utr}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-855 block">
                          {formatINR(tx.amount)}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase text-emerald-600">
                          Success
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {booking.status === "confirmed" && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedBookingForAgreement(booking);
                      setAgreementPreviewModalOpen(true);
                    }}
                    className="px-4 py-2 border rounded-xl bg-orange-50 text-orange-600 font-extrabold uppercase text-[10px] tracking-wider transition-all cursor-pointer shadow-sm hover:bg-orange-100"
                  >
                    📝 View Builder-Buyer Contract
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
