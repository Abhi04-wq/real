import React from "react";
import { Lock, Timer, Calendar, CheckCircle, TrendingUp, Sparkles } from "lucide-react";

export default function BuyerOverviewTab({ bookings, visits, user }) {
  // Calculate dynamic metrics
  const totalLockedCount = bookings.length;
  const scheduledToursCount = visits.length;
  const kycState = user?.kycStatus || "Not Submitted";
  const kycPercentage = kycState === "verified" ? 100 : kycState === "pending" ? 65 : 15;

  return (
    <div className="space-y-8 animate-fade-in text-left font-sans">
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Locked Escrows */}
        <div className="border border-slate-200/85 rounded-3xl p-6 bg-white shadow-xs text-left flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Escrow Reservations
            </span>
            <h4 className="text-2xl font-black text-slate-800 mt-1">
              {totalLockedCount} Units
            </h4>
            <span className="text-[9px] text-slate-400 font-semibold block mt-1">Locked in Secure Ledger</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
            <Lock className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Site Visits Tours */}
        <div className="border border-slate-200/85 rounded-3xl p-6 bg-white shadow-xs text-left flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Scheduled Walkthroughs
            </span>
            <h4 className="text-2xl font-black text-slate-800 mt-1">
              {scheduledToursCount} Tours
            </h4>
            <span className="text-[9px] text-slate-400 font-semibold block mt-1">Assigned Representative Agents</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: KYC Status */}
        <div className="border border-slate-200/85 rounded-3xl p-6 bg-white shadow-xs text-left flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              KYC Compliance Verification
            </span>
            <div className="mt-1">
              <span
                className={`text-[9px] font-black uppercase inline-block px-2.5 py-1 rounded-lg border ${
                  kycState === "verified"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : kycState === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                      : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {kycState}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold block mt-1.5">Compliance Clearance Index</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 2. Inspired "User Activity" Charts Row (Fire&Burn visual layout match) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Card: Lock Interactions Bar Chart (Amplify for cognify style) */}
        <div className="lg:col-span-7 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase">Unit Locks Activity</h3>
              <p className="text-[10px] text-slate-400 font-bold">Lock reservations timeline activity</p>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-100">Weekly</span>
          </div>
          <div className="pt-4 font-mono text-xs font-black text-slate-800 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalLockedCount}</span>
            <span className="text-slate-400 text-[10px] font-bold font-sans">Active Reserve Units</span>
          </div>

          {/* SVG column bars */}
          <div className="h-44 mt-6 w-full flex items-end justify-between px-2 pt-2 border-b">
            {[
              { val: 20, active: false },
              { val: 15, active: false },
              { val: 45, active: true },
              { val: 25, active: false },
              { val: 32, active: false },
              { val: 28, active: false },
              { val: 35 + (totalLockedCount * 5), active: true },
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col justify-end w-6 h-full gap-1 items-center">
                <div 
                  className={`w-4 rounded-t-sm transition-all duration-300 ${bar.active ? "bg-orange-500 shadow-sm" : "bg-slate-200"}`} 
                  style={{ height: `${(bar.val / 65) * 100}%` }}
                />
                <span className="text-[8px] text-slate-400 font-bold font-sans">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Accuracy / KYC Completion Gauge */}
        <div className="lg:col-span-5 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase">KYC Verification Completeness</h3>
              <p className="text-[10px] text-slate-400 font-bold">Accuracy & verification compliance</p>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-100">Live</span>
          </div>

          <div className="my-4">
            <div className="flex justify-between text-xs font-black text-slate-800 mb-2">
              <span>Overall Accuracy</span>
              <span className="text-teal-600">{kycPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full" style={{ width: `${kycPercentage}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mt-3 pt-3 border-t">
            <div className="space-y-1">
              <div className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-[10px] font-black">✓</div>
              <span className="text-[9px] text-slate-400 font-bold block">Locks Submitted</span>
              <span className="text-xs font-black text-slate-800">{totalLockedCount}</span>
            </div>
            <div className="space-y-1">
              <div className="h-6 w-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto text-[10px] font-black">✓</div>
              <span className="text-[9px] text-slate-400 font-bold block">Tours Verified</span>
              <span className="text-xs font-black text-slate-800">{visits.filter(v=>v.status==='completed').length}</span>
            </div>
            <div className="space-y-1">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-[10px] font-black">★</div>
              <span className="text-[9px] text-slate-400 font-bold block">Rating Score</span>
              <span className="text-xs font-black text-slate-800">4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Quick shortcuts */}
      <div className="border border-slate-200/80 bg-slate-50/50 rounded-3xl p-6 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl" />
        <div className="relative z-10 text-left space-y-1">
          <h4 className="text-sm font-black text-slate-850 uppercase tracking-tight flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-orange-500 shrink-0" /> Unlock Premium Portals
          </h4>
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed max-w-xl">
            Verify your identity documents inside the compliance panel to unlock direct checkout and agreement signing immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
