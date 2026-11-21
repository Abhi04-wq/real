import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ReraDisclaimer() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white text-left">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              RERA Disclaimer
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-4">
              Real Estate Regulation Authority Disclaimer
            </h1>
            <p className="text-slate-400 text-xs mt-2">Last Updated: July 4, 2026</p>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <p>
              In alignment with the Real Estate (Regulation and Development) Act, 2016 (RERA), this disclaimer guides the property transaction interface of <strong>PropEstate</strong>.
            </p>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              1. Builder & Developer Responsibility
            </h3>
            <p>
              All property parameters, layouts, built-up areas, amenities, and delivery schedules shown on this platform are submitted directly by third-party builders, developers, or registered agents. They are legally responsible for updating correct RERA Registration Numbers.
            </p>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              2. Independent Verification Recommended
            </h3>
            <p>
              PropEstate aggregates and displays metadata. While we enforce RERA-number checks and verify agent identities, buyers are strongly encouraged to independently cross-check the registration status on official State RERA websites before committing to any digital payments or locking assets.
            </p>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              3. Visual Interpretations
            </h3>
            <p>
              Images, graphic renderings, animations, and sitemaps are architectural mockups meant for conceptual demonstration only. The actual site dimensions, specifications, and fixtures might vary and are governed strictly by the final bilateral developer-buyer execution documents.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
