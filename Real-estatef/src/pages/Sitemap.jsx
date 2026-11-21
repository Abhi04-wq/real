import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Map, Layers, HelpCircle, Shield, Globe } from "lucide-react";

export default function Sitemap() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white text-left">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Site Index
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-4">
              Website Sitemap
            </h1>
            <p className="text-slate-500 text-xs mt-2">Structured mapping of the entire PropEstate web ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Main Navigation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-850 font-black text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Globe className="h-4 w-4 text-orange-500" />
                <span>Primary Portals</span>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li><Link to="/" className="hover:text-orange-500 transition-colors">PropEstate Home / Landing Page</Link></li>
                <li><Link to="/properties" className="hover:text-orange-500 transition-colors">Property Listings Directory</Link></li>
                <li><Link to="/plots" className="hover:text-orange-500 transition-colors">Real-Time Plot Grid Booking</Link></li>
                <li><Link to="/agents" className="hover:text-orange-500 transition-colors">Verified Agent Showcase</Link></li>
              </ul>
            </div>

            {/* Dashboards & Access */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-850 font-black text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Layers className="h-4 w-4 text-orange-500" />
                <span>Client Hubs</span>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Secure User Authentication (Login)</Link></li>
                <li><Link to="/register" className="hover:text-orange-500 transition-colors">Create Partner Account (Register)</Link></li>
                <li><Link to="/dashboard" className="hover:text-orange-500 transition-colors">Generic User Dashboard</Link></li>
              </ul>
            </div>

            {/* Legal and Support */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-850 font-black text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Shield className="h-4 w-4 text-orange-500" />
                <span>Support & Terms</span>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li><Link to="/contact-support" className="hover:text-orange-500 transition-colors">Contact Support Help Desk</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy Agreement</Link></li>
                <li><Link to="/refund-policy" className="hover:text-orange-500 transition-colors">Transaction Refund Policies</Link></li>
                <li><Link to="/rera-disclaimer" className="hover:text-orange-500 transition-colors">RERA Compliance Disclaimer</Link></li>
                <li><Link to="/sitemap" className="hover:text-orange-500 transition-colors text-orange-500 font-bold">Sitemap Index</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
