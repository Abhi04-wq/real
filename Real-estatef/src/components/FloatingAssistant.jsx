import { useState } from "react";
import { MessageSquare, PhoneCall, Check, X, ShieldCheck, HelpCircle } from "lucide-react";

export default function FloatingAssistant({ onOpenEnquiry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Actions Panel */}
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-150 p-4 mb-4 w-72 text-slate-800 transition-all duration-350 transform origin-bottom-right ${
        expanded 
          ? "opacity-100 scale-100 translate-y-0 visible" 
          : "opacity-0 scale-90 translate-y-8 invisible pointer-events-none"
      }`}>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Advisors Online Now</span>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {/* WhatsApp */}
          <a
            href="https://wa.me/911234567890"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-emerald-800 text-xs sm:text-sm font-extrabold transition-all group"
          >
            <span className="p-2 bg-emerald-500 text-white rounded-xl">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="leading-tight">Chat on WhatsApp</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5 leading-none">Instant response</p>
            </div>
          </a>

          {/* Request Callback */}
          <button
            onClick={() => {
              setExpanded(false);
              onOpenEnquiry("Instant Callback Requested");
            }}
            className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-2xl text-orange-850 text-xs sm:text-sm font-extrabold text-left transition-all group cursor-pointer"
          >
            <span className="p-2 bg-orange-500 text-white rounded-xl">
              <PhoneCall className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="leading-tight">Request Callback</p>
              <p className="text-[10px] text-orange-600 font-bold mt-0.5 leading-none">Callback in 15 mins</p>
            </div>
          </button>
        </div>

        {/* Guarantee */}
        <div className="flex items-center gap-1.5 justify-center mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>RERA Licensed Consultants Only</span>
        </div>
      </div>

      {/* Pulsing Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-500/25 active:scale-95 transition-all cursor-pointer relative group"
      >
        {!expanded && (
          <span className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping pointer-events-none" />
        )}
        {expanded ? <X className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
