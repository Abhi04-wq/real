import { DollarSign, Palette, ShieldCheck, HeartHandshake, ArrowUpRight, Check } from "lucide-react";

const SERVICES = [
  {
    title: "Square Capital (Home Loans)",
    icon: DollarSign,
    desc: "Compare Home Loan interest rates from 15+ top financial institutions including SBI, HDFC, and ICICI. Secure instant pre-approvals with complete waiver on broker processing fees.",
    badge: "8.4% Min Rate",
    bgImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
    themeColor: "text-blue-400 bg-blue-500/10 border-blue-400/20",
    iconBg: "bg-blue-600/90",
    cta: "Check Loan Eligibility",
  },
  {
    title: "Interior Company (Designs)",
    icon: Palette,
    desc: "End-to-end premium modular kitchens, intelligent wardrobes, bespoke false ceilings, and structural home décor solutions. Experience live 3D walkthroughs backed by an ironclad 10-year warranty.",
    badge: "Free Consultation",
    bgImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
    themeColor: "text-orange-400 bg-orange-500/10 border-orange-400/20",
    iconBg: "bg-orange-600/90",
    cta: "Book 3D Design Call",
  },
  {
    title: "Legal Title Escrow",
    icon: ShieldCheck,
    desc: "Comprehensive RERA validation, multi-decade property title exploration, professional deed drafting, and secure digital escrow to anchor your token advances with guaranteed refund protection.",
    badge: "RERA Compliant",
    bgImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80",
    themeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-400/20",
    iconBg: "bg-emerald-600/90",
    cta: "Verify Property Title",
  },
  {
    title: "Property & Rental Care",
    icon: HeartHandshake,
    desc: "Automated digital rent collection networks, secure background screening checks for incoming tenants, online rent agreement registries, and scheduled quarterly structural maintenance lookups.",
    badge: "Full Care Portfolio",
    bgImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
    themeColor: "text-purple-400 bg-purple-500/10 border-purple-400/20",
    iconBg: "bg-purple-600/90",
    cta: "Register Property Care",
  },
];

const HIGHLIGHTS = [
  { label: "15+ Financial Partners", desc: "Direct API loan eligibility checks" },
  { label: "Bespoke 3D Designs", desc: "Free immersive digital layouts" },
  { label: "Secure Legal Escrow", desc: "Total advance payment protection" },
  { label: "Digital Agreement Care", desc: "Fully paperless tenant management" }
];

export default function ServicesHub({ onServiceClick }) {
  return (
    <section className="bg-slate-900 py-20 sm:py-24 border-b border-slate-950 overflow-hidden relative">
      {/* Premium ambient light glowing accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Asymmetric Split Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Editorial Sticky narrative with Checklist details */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold tracking-wide text-orange-400 uppercase mb-4">
              Value Added Home Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              PropEstate Ecosystem Solutions
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-4 leading-relaxed">
              Real estate management stretches far beyond simply buying a physical space. Connect instantly with premier interior studios, legal title analysts, and custom asset managers via a single dashboard workspace.
            </p>
            
            {/* Divider line */}
            <div className="h-[1px] w-full bg-white/10 my-8" />

            {/* Checklist elements */}
            <div className="space-y-4">
              {HIGHLIGHTS.map((hl) => (
                <div key={hl.label} className="flex gap-3">
                  <span className="h-5.5 w-5.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide">{hl.label}</h4>
                    <p className="text-[11px] text-slate-450 font-medium mt-0.5">{hl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Visual Interactive Cards Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {SERVICES.map((serv) => {
              const Icon = serv.icon;
              return (
                <div
                  key={serv.title}
                  className="group relative h-[380px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 flex flex-col justify-between p-6 sm:p-8 cursor-pointer"
                >
                  {/* Visual Background image overlay */}
                  <img
                    src={serv.bgImage}
                    alt={serv.title}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 z-0"
                    loading="lazy"
                  />

                  {/* Dynamic Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/40 z-10 transition-all duration-500 group-hover:from-slate-950 group-hover:via-slate-900/95" />
                  
                  {/* Subtle color glow backlights on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 z-10 transition-opacity duration-500" />

                  {/* Header Row */}
                  <div className="flex items-center justify-between relative z-20">
                    <span className={`w-10 h-10 rounded-xl ${serv.iconBg} text-white flex items-center justify-center shadow-lg border border-white/10`}>
                      <Icon className="h-5 w-5 stroke-[2]" />
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${serv.themeColor} tracking-wide backdrop-blur-sm`}>
                      {serv.badge}
                    </span>
                  </div>

                  {/* Text Details & Buttons */}
                  <div className="relative z-20 mt-auto">
                    {/* Title & Description */}
                    <h3 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-orange-400 transition-colors">
                      {serv.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2.5 line-clamp-3">
                      {serv.desc}
                    </p>

                    {/* Premium full-width CTA block button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onServiceClick(serv.title);
                      }}
                      className="w-full mt-6 py-3 px-4 rounded-xl bg-white/10 hover:bg-orange-500 text-white border border-white/15 hover:border-orange-500 font-black text-xs transition-all duration-300 flex items-center justify-between tracking-tight group/btn cursor-pointer"
                    >
                      <span>{serv.cta}</span>
                      <span className="p-0.5 rounded-md bg-white/10 group-hover/btn:bg-white/20 transition-colors">
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}