"use client";
import { useState } from "react";
import { CheckCircle2, ShieldCheck, CreditCard, PenTool, BarChart3, Key, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, label: "Booking Stage", done: true, title: "Booking Amount Received", desc: "Token payment of ₹1.5L processed online. Booking slot reserved instantly within the ledger.", date: "Completed on Jun 10" },
  { id: 2, label: "Verification Stage", done: true, title: "KYC & Document Check", desc: "Identity, PAN card, and verified corporate income credentials processed safely. Developer booking documentation issued.", date: "Completed on Jun 12" },
  { id: 3, label: "Contract Stage", done: true, title: "e-Agreement Signing", desc: "RERA approved builder-buyer agreement executed digitally via secure cryptographic OTP verification protocols.", date: "Completed on Jun 15" },
  { id: 4, label: "Installment Stage", done: false, title: "Payment Milestones", desc: "Milestone installment #2 of ₹8L is currently due. Foundation milestone structural authorization cleared by designated RERA compliance officer.", date: "Due by Jul 25" },
  { id: 5, label: "Possession Stage", done: false, title: "Registry & Keys Handover", desc: "Final site handover inspections, occupation certificate checks, and structural deed registry assistance.", date: "Target Dec 2026" },
];

export default function DigitalJourney() {
  const [activeStep, setActiveStep] = useState(4); // Default on step 4 action card

  return (
    <section className="bg-white py-24 border-b border-slate-200/60 relative overflow-hidden">
      
      {/* ACETERNITY UI: Soft Light Canvas Grid Background Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Layout Split Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          
          {/* LEFT SIDE: Onboarding Track Steps Controller Block */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-md uppercase">
                Paperless Digital Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none mt-4">
                Complete Digital Buyer Journey
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-4 leading-relaxed">
                Track live construction milestones, view auto-generated demand letters, manage payments, and execute builder-buyer agreements through a unified RERA-aligned dashboard.
              </p>
            </div>

            {/* ACETERNITY STYLE: Smooth Layout-Swapping Selector Group */}
            <div className="space-y-2.5 pt-4 relative">
              {STEPS.map((s) => {
                const isActive = activeStep === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStep(s.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-300 relative cursor-pointer group ${
                      isActive 
                        ? "text-slate-900 border-slate-200" 
                        : "bg-transparent border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {/* ACETERNITY ANIMATION: Sliding layout background anchor panel */}
                    {isActive && (
                      <motion.span
                        layoutId="activeJourneyTab"
                        className="absolute inset-0 bg-slate-50 border border-slate-100 shadow-sm rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center gap-3.5 z-10">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        s.done 
                          ? "bg-emerald-500 text-white" 
                          : isActive 
                            ? "bg-orange-500 text-white" 
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                      }`}>
                        {s.done ? "✓" : s.id}
                      </span>
                      <span className="text-xs sm:text-sm font-black tracking-tight">{s.label}</span>
                    </div>

                    {s.id === 4 && (
                      <span className="text-[9px] font-black uppercase bg-orange-100 text-orange-600 border border-orange-200/60 px-2 py-0.5 rounded z-10 tracking-wider animate-pulse">
                        Current Stage
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Software Dashboard Terminal Frame */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 text-slate-800 border border-slate-200/80 shadow-xl shadow-slate-100 relative overflow-hidden">
              {/* Internal absolute decorative accent lines */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-orange-500 to-amber-500" />

              {/* Console Banner Title Header */}
              <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6 flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">Metro Heights — Unit 804</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Application File: #PE-80411</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-black border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Escrow Flow
                </span>
              </div>

              {/* DYNAMIC TRANSITION CONTAINER: Animation deck for chosen active metadata */}
              <div className="min-h-[160px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-full flex-1"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h5 className="text-sm font-black text-slate-800 leading-tight">
                          {STEPS[activeStep - 1].title}
                        </h5>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          STEPS[activeStep - 1].done 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-orange-50 text-orange-700 border-orange-100"
                        }`}>
                          {STEPS[activeStep - 1].done ? "Verified" : "Action Required"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-3">
                        {STEPS[activeStep - 1].desc}
                      </p>
                    </div>
                    
                    <span className="text-[10px] text-slate-400 font-bold tracking-wide mt-4 block">
                      Timeline Status: {STEPS[activeStep - 1].date}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Financial Progress Matrix Meter */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    <span>Payment Milestones Met</span>
                    <span className="text-orange-600 font-black">62% Disbursed</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "62%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" 
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Ledger Value</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 leading-none tracking-tight">₹24.8L / ₹40L</span>
                </div>
              </div>

              {/* Action Trigger Deck */}
              <div className="mt-8 pt-2 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>View Document Vault</span>
                </button>
                <button className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10">
                  <span>Pay Installment (₹8L)</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}