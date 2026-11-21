import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PlotGrid from "../components/PlotGrid";
import { Toaster } from "react-hot-toast";

export default function Plots() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-800">
      <Toaster />
      <Navbar />
      
      <main className="py-8">
        <PlotGrid />
      </main>

      <Footer />
    </div>
  );
}
