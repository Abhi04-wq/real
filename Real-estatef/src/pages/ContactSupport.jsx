import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import axios from "axios";
import { BACKEND_URL } from "../config";

export default function ContactSupport() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/support/create`, form);
      if (res.data.success) {
        toast.success("Support ticket created! Our team will contact you within 24 hours.", {
          duration: 4000,
          position: "top-center"
        });
        setForm({ name: "", email: "", subject: "", message: "" });
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Support submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit support ticket.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white text-left">
      <Toaster />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Help Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-4">
            Contact Support & Customer Care
          </h1>
          <p className="text-slate-500 text-xs mt-3 leading-relaxed">
            Have questions about a property listing, escrow milestones, RERA clearances, or technical issues? Our support desk is here to guide you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Support Channels Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
                Direct Channels
              </h3>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Toll-Free Customer Care</h4>
                  <p className="text-sm font-bold text-slate-700 mt-1">1800-419-7566</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Quickest connection for instant help</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Email Correspondence</h4>
                  <p className="text-sm font-bold text-slate-700 mt-1">care@propestate.in</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">For formal documentation & ticket updates</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Support Hours</h4>
                  <p className="text-sm font-bold text-slate-700 mt-1">Mon-Sat, 9:00 AM - 7:00 PM</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Excluding national holidays</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                <MessageSquare className="h-44 w-44" />
              </div>
              <h3 className="text-sm font-black tracking-tight">Need Escrow & Legal Help?</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                Our in-house RERA legal executives and payment transaction operators are available to resolve documentation blockages.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Legal Desk Online</span>
              </div>
            </div>
          </div>

          {/* Ticket Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Ticket Submitted Successfully</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    We have generated Support ID <strong>#PE-{Math.floor(100000 + Math.random() * 900000)}</strong>. A confirmation email has been dispatched to your address.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
                    Raise a Support Ticket
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Subject / Query Category
                    </label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Escrow Deposit Delay / Plot KYC Blockage"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Detailed Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please elaborate on your inquiry with transaction hashes or RERA registration numbers if applicable..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Dispatch Support Ticket</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
