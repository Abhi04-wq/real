"use client";
import { useState } from "react";
import { DollarSign, Percent, Calendar, Calculator, Sparkles, Building2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const BANK_PARTNERS = [
  { name: "State Bank of India (SBI)", rate: "8.40% p.a.", tenure: "Max 30 yrs", fee: "0.25% of loan" },
  { name: "HDFC Bank Ltd", rate: "8.50% p.a.", tenure: "Max 30 yrs", fee: "Zero processing fee" },
  { name: "ICICI Bank", rate: "8.65% p.a.", tenure: "Max 30 yrs", fee: "₹1,999 flat charge" },
  { name: "Axis Bank", rate: "8.75% p.a.", tenure: "Max 30 yrs", fee: "Max ₹10,000 charge" },
];

export default function EMICalculator({ onApplyLoan }) {
  const [price, setPrice] = useState(6500000); // 65L
  const [down, setDown] = useState(20); // 20%
  const [rate, setRate] = useState(8.5); // 8.5%
  const [tenure, setTenure] = useState(20); // 20 yrs

  const loan = price * (1 - down / 100);
  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;
  const emi =
    months === 0
      ? 0
      : (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
  const total = emi * months;
  const interest = total - loan;

  const fmt = (n) =>
    n >= 10000000
      ? `₹${(n / 10000000).toFixed(2)} Cr`
      : n >= 100000
      ? `₹${(n / 100000).toFixed(2)} L`
      : `₹${Math.round(n).toLocaleString("en-IN")}`;

  const interestPercentage = total > 0 ? (interest / total) * 100 : 0;

  return (
    <section id="emi-calculator-section" className="bg-white py-24 border-b border-slate-200/60 relative overflow-hidden">
      
      {/* ACETERNITY UI: Soft Light Grid Pattern Background Primitive */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-md uppercase">
            Financial Planning Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-4">
            Calculate Home Loan EMI
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
            Estimate your monthly outgoings and review interest rate tables from major retail mortgage partners.
          </p>
        </div>

        {/* ACETERNITY UI: Dual Card Gradient Split Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* LEFT CONTAINER: Parameter Configuration Form Block */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 shadow-xl shadow-slate-100 relative overflow-hidden group">
            {/* Top decorative animated highlight rule line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 dynamic-pulse" />
            
            <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2.5">
              <span className="p-2 bg-orange-50 rounded-lg text-orange-500 border border-orange-100"><Calculator className="h-4 w-4" /></span>
              Mortgage Parameters
            </h3>

            <div className="space-y-7">
              {/* Property Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Property Price</span>
                  <span className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/60">{fmt(price)}</span>
                </div>
                <input
                  type="range" min="1000000" max="50000000" step="500000" value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Down Payment ({down}%)</span>
                  <span className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/60">{fmt(price * (down / 100))}</span>
                </div>
                <input
                  type="range" min="10" max="80" step="5" value={down}
                  onChange={(e) => setDown(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Interest Rate</span>
                  <span className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/60">{rate}% p.a.</span>
                </div>
                <input
                  type="range" min="6" max="15" step="0.1" value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Loan Tenure</span>
                  <span className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/60">{tenure} Years</span>
                </div>
                <input
                  type="range" min="5" max="30" step="1" value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER: Results & Visual Analytics Panel */}
          <div className="lg:col-span-5 bg-slate-50/60 backdrop-blur-md p-8 sm:p-10 rounded-[2rem] border border-slate-200/80 flex flex-col justify-between h-full shadow-inner relative overflow-hidden">
            <div className="w-full">
              {/* Dynamic EMI Monitor */}
              <div className="text-center pb-6 border-b border-slate-200/80">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Estimated Monthly Outgoing</span>
                <h4 className="text-3xl sm:text-4xl font-black text-slate-800 mt-2 tracking-tight leading-none">
                  {fmt(emi)}<span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">/ Month</span>
                </h4>
              </div>

              {/* FRAMER MOTION: Smooth SVG Path Ring Chart Interpolation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-8">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="10" />
                    <motion.circle
                      cx="60" cy="60" r="50" fill="transparent" stroke="#f97316" strokeWidth="10"
                      strokeDasharray="314"
                      animate={{ strokeDashoffset: 314 - (314 * interestPercentage) / 100 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-slate-800">{Math.round(100 - interestPercentage)}%</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Principal</span>
                  </div>
                </div>

                {/* Analytical Ledger Metadata */}
                <div className="space-y-3 flex-1 w-full text-xs font-bold text-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /><span>Principal Loan</span></div>
                    <span className="text-slate-800 font-black">{fmt(loan)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /><span>Interest Paid</span></div>
                    <span className="text-slate-800 font-black">{fmt(interest)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5 mt-2 text-slate-800">
                    <span className="font-extrabold">Total Payback</span>
                    <span className="font-black text-slate-900">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Check Eligibility Button */}
            <button
              onClick={() => onApplyLoan(fmt(loan))}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm shadow-md shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer text-center mt-4"
            >
              Apply Online & Check Eligibility
            </button>
          </div>

        </div>

        {/* BANK PARTNERS: Mortgage Grid Matrix Table Layout */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-8 mt-12 shadow-xl shadow-slate-100/60">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-slate-100 pb-5">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="p-1.5 bg-orange-50 rounded-lg text-orange-500"><Building2 className="h-4 w-4" /></span>
              Compare Mortgage Partner Rates
            </h4>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-50 border border-orange-100 text-[11px] font-black text-orange-600 tracking-wide uppercase">
              <Sparkles className="h-3 w-3" />
              Rates Updated Weekly
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-semibold text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-4 font-black">Bank Name</th>
                  <th className="pb-4 font-black">Interest Rate Range</th>
                  <th className="pb-4 font-black">Tenure Options</th>
                  <th className="pb-4 font-black">Processing Fee Terms</th>
                  <th className="pb-4 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {BANK_PARTNERS.map((bank) => (
                  <tr key={bank.name} className="hover:bg-slate-50/50 transition-colors group/row">
                    <td className="py-4 text-xs sm:text-sm font-black text-slate-900">{bank.name}</td>
                    <td className="py-4 text-orange-600 font-black">{bank.rate}</td>
                    <td className="py-4 text-slate-600 font-medium">{bank.tenure}</td>
                    <td className="py-4 text-slate-400 font-medium">{bank.fee}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => onApplyLoan(`${bank.name} Loan`)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-600 rounded-xl text-xs font-black transition-all cursor-pointer group-hover/row:bg-white"
                      >
                        <span>Apply Here</span>
                        <ChevronRight className="h-3.5 w-3.5 transform group-hover/row:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}