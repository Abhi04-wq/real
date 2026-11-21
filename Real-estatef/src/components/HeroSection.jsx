import SmartSearch from "./SmartSearch";
import { Star } from "lucide-react";

export default function HeroSection({ onSearch }) {
  return (
    <section className="relative min-h-[640px] bg-slate-950 flex flex-col justify-center overflow-hidden py-16 sm:py-20 lg:py-30">

      {/* Background Visual Effects */}
      <div className="absolute inset-0 z-10 absolute"> {/* Added z-0 to explicitly stack behind text */}
        <div
          className="absolute inset-0 bg-cover bg-[position:80%_center] lg:bg-center opacity-100"
          style={{ backgroundImage: "url('/buildings1.jpg')" }}
        />
        {/* Desktop: tight left gradient only — right side fully clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent hidden md:block z-10" />
        {/* Mobile: lighter overlay so image still shows */}
        <div className="absolute inset-0 bg-black/50 md:hidden z-10" />
      </div>

      {/* Hero Content Area */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20"> {/* Elevated z-index */}
        <div className="w-full lg:max-w-3xl text-left flex flex-col items-start">

          {/* Trust Rating Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-slate-200 mb-6">
            <span className="text-amber-400 flex items-center gap-0.5 font-extrabold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.7
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">18k Google reviews</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-semibold text-white tracking-wide leading-[1.15] mb-4 drop-shadow-lg">
            India's Largest <br />
            Real Estate Platform
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base text-slate-200 font-extrabold leading-relaxed mb-10 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="drop-shadow">From Search to Keys, we've got you covered</span>
            <span className="hidden sm:inline text-slate-500 font-normal">•</span>
            <span className="text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded border border-yellow-400/20">1Mn+ Active Property Listings</span>
          </p>

          {/* Smart Search Console Widget */}
          <div className="w-full">
            <SmartSearch onSearch={onSearch} />
          </div>

        </div>
      </div>
    </section>
  );
}