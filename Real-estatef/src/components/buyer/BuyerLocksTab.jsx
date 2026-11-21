import React from "react";
import { Lock, Timer, MapPin, Building, ChevronRight, Image as ImageIcon } from "lucide-react";
import { BACKEND_URL } from "../../config";

export default function BuyerLocksTab({ myLocks, myLocksLoading, fetchMyLocks, formatTimer, formatINR, navigate }) {
  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-5">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
            My Locked Properties
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Track all property escrow reservations, timers, and designated coordinator statuses.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchMyLocks}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Refresh
          </button>
          <div className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-2xs">
            Total Locks: {myLocks.length}
          </div>
        </div>
      </div>

      {myLocksLoading ? (
        <div className="py-16 text-center text-slate-400 bg-slate-50 border border-dashed rounded-3xl">
          <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Loading secure escrow locks...</p>
        </div>
      ) : myLocks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-50 border border-dashed rounded-3xl flex flex-col items-center">
          <Lock className="h-10 w-10 text-slate-350 mb-2 animate-bounce" />
          <p className="text-xs font-black text-slate-500">NO SECURE PROPERTY LOCKS LOGGED YET</p>
          <p className="text-[10px] text-slate-450 mt-1 max-w-xs font-semibold">Lock any active unit from the marketplace catalogue to secure it instantly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {myLocks.map((l) => {
            const isPlot = !!l.plot;
            const segmentObj = l.plot?.segments?.find(s => s._id === l.plotSegmentId);
            
            const propImage = isPlot
              ? (l.plot.highlightedImageUrl 
                  ? (l.plot.highlightedImageUrl.startsWith("http") ? l.plot.highlightedImageUrl : `${BACKEND_URL}/${l.plot.highlightedImageUrl.startsWith("/") ? l.plot.highlightedImageUrl.slice(1) : l.plot.highlightedImageUrl}`)
                  : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400")
              : (l.property?.image 
                  ? (l.property.image.startsWith("http") ? l.property.image : `${BACKEND_URL}/${l.property.image.startsWith("/") ? l.property.image.slice(1) : l.property.image}`)
                  : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400");
            
            const title = isPlot
              ? `${l.plot.name} - Segment #${segmentObj?.plotNumber || "Plot"}`
              : (l.property?.name || "Premium Property");
              
            const subtitle = isPlot
              ? (l.plot.address || "Plot Location")
              : (l.property?.city || "Listing Address");
              
            const typeLabel = isPlot
              ? `Plot Segment`
              : (l.property?.type || "Unit Listing");

            const navigateUrl = isPlot
              ? `/plots?layoutId=${l.plot._id}`
              : `/property/${l.property?._id || l.propertyId}`;

            return (
              <div 
                key={l._id || l.id} 
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-44 h-40 bg-slate-100 relative shrink-0">
                  <img 
                    src={propImage} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white rounded text-[8px] font-black uppercase tracking-wider">
                    {typeLabel}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between min-w-0 text-left">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-800 text-sm truncate leading-snug">
                        {title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                        l.status === "pending_admin" || l.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        l.status === "admin_approved" || l.status === "agent_accepted" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        l.status === "rejected" ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-50 text-slate-700 border border-slate-100"
                      }`}>
                        {l.status?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-semibold">
                      <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                      {subtitle}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
                      <span>Escrow Token: <span className="font-bold text-slate-900">{formatINR(l.tokenAmount || 0)}</span></span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                    {l.timeLeft && l.timeLeft > 0 ? (
                      <div className="flex items-center gap-1 text-[9px] font-black text-orange-600 bg-orange-50/50 px-2 py-0.5 rounded-lg border border-orange-100 font-mono animate-pulse">
                        <Timer className="h-3 w-3 shrink-0" /> {formatTimer(l.timeLeft)}
                      </div>
                    ) : (
                      <div className="text-[9px] font-bold text-slate-400">Lock Active</div>
                    )}
                    <button
                      onClick={() => navigate(navigateUrl)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[9px] font-bold uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      Explore <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
