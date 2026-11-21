import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RefundPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white text-left">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Transaction Terms
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-4">
              Refund Policies
            </h1>
            <p className="text-slate-400 text-xs mt-2">Last Updated: July 4, 2026</p>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <p>
              This document clarifies the guidelines concerning financial refunds, booking fee reversals, and security deposits managed through the <strong>PropEstate Escrow Platform</strong>.
            </p>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              1. Platform Fee & Subscriptions
            </h3>
            <p>
              PropEstate charges developer listing packages, agent membership plans, and transaction handling fees.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All platform subscription renewals are final and non-refundable.</li>
              <li>In the event of double billing due to server errors, the duplicate amount will be reversed within 5 to 7 business days to the origin bank account.</li>
            </ul>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              2. Real-Time Plot & Property Booking Fees
            </h3>
            <p>
              When locking a plot or placing a token booking deposit online:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The 2-hour locking session fee is fully refundable if the builder declines transaction processing.</li>
              <li>Once the Builder-Buyer agreement draft is digitally signed by both parties, refunds are governed strictly by the refund clauses outlined inside that specific project agreement.</li>
              <li>Booking fees for properties failing builder verification checks are instantly refunded to the buyer's digital wallet.</li>
            </ul>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              3. Processing Timeline
            </h3>
            <p>
              All approved refunds are initiated instantly. However, due to clearing cycles, the credit reflection could consume 5-10 business days depending on payment gateways (PCI-DSS protocols).
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
