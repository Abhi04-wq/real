import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white text-left">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Legal Document
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-4">
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-xs mt-2">Last Updated: July 4, 2026</p>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <p>
              At <strong>PropEstate</strong>, we prioritize the protection and confidentiality of our users' personal, financial, and real estate transaction data. This Privacy Policy details the metrics we compile, the security layers we execute, and how your data matches our RERA compliances.
            </p>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              1. Information We Collect
            </h3>
            <p>
              We collect user inputs when registering accounts, performing KYC verification, posting property portfolios, or starting escrow transaction processes. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identity verification credentials (PAN, Aadhaar details, RERA Registration IDs).</li>
              <li>Contact endpoints (legal names, telephone numbers, emails).</li>
              <li>Financial records (bank details, UPI credentials for transaction escrow validation).</li>
              <li>Device parameters (IP address, location coordinates for geo-tagging property coordinates).</li>
            </ul>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              2. How We Utilize Your Information
            </h3>
            <p>
              The datasets acquired are restricted exclusively to operational usage:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Processing real-time plot locking and digital builder-buyer agreements.</li>
              <li>Executing verification and compliance checkups under regional RERA protocols.</li>
              <li>Notifying builders, buyers, and agents of real-time negotiation milestones.</li>
              <li>Improving our search queries and digital journey walkthrough animations.</li>
            </ul>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              3. Data Protection and Cybersecurity
            </h3>
            <p>
              Our database layers leverage state-of-the-art PCI-DSS security patterns, AES-256 database encryption, and active SSL validation tunnels. User access tokens are securely managed through hashed sessions, preventing unsolicited read and write actions.
            </p>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pt-2">
              4. Contact Support and Grievance Officer
            </h3>
            <p>
              For queries related to your information deletion requests or to challenge a KYC flag, please reach out to our grievance department at <strong>care@propestate.in</strong>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
