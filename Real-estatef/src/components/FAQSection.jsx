import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    question: "What is RERA compliance, and why is it important?",
    answer: "RERA (Real Estate Regulatory Authority) compliance ensures that a developer registers their projects, provides accurate completion timelines, maintains a dedicated escrow account for funds, and shares certified plans. It protects buyers against builder delays and structural defects.",
  },
  {
    question: "How long does the digital KYC verification take?",
    answer: "KYC verification is typically processed in under 24 hours. Once you register with your mobile OTP and upload scanned copies of your PAN and Aadhaar, our validation desk cross-checks records to approve your portal file.",
  },
  {
    question: "Is the token booking fee refundable if I cancel?",
    answer: "Yes, under our platform standard guidelines, token amounts are 100% refundable inside the first 7 days, provided the formal agreement is not signed. Refund requests can be raised directly from your buyer dashboard.",
  },
  {
    question: "How are payment milestones calculated?",
    answer: "Milestone payments are linked to concrete construction stages approved by independent architects (e.g. excavation completed, plinth beam laid, slab casting). Developers raise demands only after RERA milestone approval.",
  },
  {
    question: "Can I get home loan eligibility estimates for multiple banks?",
    answer: "Absolutely. Our custom EMI tool integrates with major lenders like SBI, HDFC, and ICICI. You can submit a single eligibility form on our portal and receive loan quotes from multiple banks simultaneously.",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-100 font-sans">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight mt-2">
            Got Questions? We Have Answers
          </h2>
          <p className="text-sm text-slate-400 font-semibold mt-3">
            Understand how our paperless listings registry, loan comparisons, and milestone escrows function.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: FAQs Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-150 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-350"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-extrabold text-slate-800 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 ${
                      openIdx === idx ? "rotate-180 text-orange-500" : ""
                    }`}
                  />
                </button>

                {/* Collapsible Answer */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openIdx === idx ? "max-h-40 border-t border-slate-100" : "max-h-0"
                  }`}
                >
                  <div className="p-5 text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed bg-slate-50/50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Custom Animated Visual */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-6">
            {/* Background glowing gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-gradient-to-tr from-orange-500/10 to-amber-500/10 blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-blue-500/5 blur-2xl animate-pulse delay-75" />

            {/* Main floating card illustration */}
            <div className="relative bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl max-w-sm w-full space-y-6 text-left animate-float-slow">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Still Have Doubts?</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">24/7 Digital Assistant Desk</p>
                </div>
              </div>

              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                Our advisors are online to walk you through documentation lockers, secure transaction vaults, and plot bookings.
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Advisors Active Online
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
