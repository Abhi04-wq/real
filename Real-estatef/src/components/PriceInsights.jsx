"use client";
import { useState, useEffect, useRef } from "react";
import { Map, TrendingUp, BarChart3, Layers, ChevronRight, Info, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  { id: "bengaluru", name: "Bengaluru" },
  { id: "mumbai", name: "Mumbai MMR" },
  { id: "delhi_ncr", name: "Delhi-NCR" },
  { id: "hyderabad", name: "Hyderabad" },
  { id: "pune", name: "Pune" },
  { id: "kolkata", name: "Kolkata" },
  { id: "ahmedabad", name: "Ahmedabad" }
];

const CITY_DATA = {
  bengaluru: {
    city_name: "Bengaluru",
    insights_summary: "Fastest-growing housing market with ~24% YoY price appreciation driven by GCC and IT infrastructure corridors.",
    heatmapText: "Interactive map detailing tech-hub valuations across East and North Bengaluru.",
    explore_url: "/maps/bengaluru",
    trendPoints: [
      { label: "Q3-25", price: 8900 },
      { label: "Q4-25", price: 9500 },
      { label: "Q1-26", price: 9785 },
      { label: "Q2-26", price: 9950 }
    ],
    bars: [
      { label: "Below 6K", value: 90 },
      { label: "6K - 8K", value: 310 },
      { label: "8K - 11K", value: 1840, isMedian: true },
      { label: "11K - 14K", value: 1250 },
      { label: "14K - 17K", value: 620 },
      { label: "17K+", value: 210 }
    ],
    micromarkets: [
      { name: "Indiranagar", price: "16,800", pct: 100 },
      { name: "HSR Layout", price: "13,100", pct: 78 },
      { name: "Whitefield", price: "10,500", pct: 62 },
      { name: "Sarjapur Road", price: "9,400", pct: 56 },
      { name: "Electronic City", price: "7,100", pct: 42 }
    ]
  },
  mumbai: {
    city_name: "Mumbai MMR",
    insights_summary: "Strong premium segment price growth (~20% YoY) holding firm despite minor volume consolidation.",
    heatmapText: "Interactive map showing pricing changes near the Coastal Road and Navi Mumbai Airport infrastructure links.",
    explore_url: "/maps/mumbai",
    trendPoints: [
      { label: "Q3-25", price: 13800 },
      { label: "Q4-25", price: 14000 },
      { label: "Q1-26", price: 15120 },
      { label: "Q2-26", price: 15450 }
    ],
    bars: [
      { label: "Below 10K", value: 150 },
      { label: "10K - 15K", value: 1120 },
      { label: "15K - 22K", value: 2450, isMedian: true },
      { label: "22K - 30K", value: 1310 },
      { label: "30K - 40K", value: 890 },
      { label: "40K+", value: 530 }
    ],
    micromarkets: [
      { name: "Bandra West", price: "44,200", pct: 100 },
      { name: "Lower Parel", price: "39,500", pct: 89 },
      { name: "Andheri West", price: "27,400", pct: 62 },
      { name: "Thane Western", price: "14,200", pct: 32 },
      { name: "Navi Mumbai", price: "12,800", pct: 29 }
    ]
  },
  delhi_ncr: {
    city_name: "Delhi-NCR",
    insights_summary: "Luxury segment dominates fresh inventory supply (~61%) while overall prices register an 18% YoY rise.",
    heatmapText: "Interactive map tracking growth nodes across Dwarka Expressway, Gurugram, and Noida sectors.",
    explore_url: "/maps/delhi-ncr",
    trendPoints: [
      { label: "Q3-25", price: 8850 },
      { label: "Q4-25", price: 9167 },
      { label: "Q1-26", price: 9534 },
      { label: "Q2-26", price: 9800 }
    ],
    bars: [
      { label: "Below 6K", value: 210 },
      { label: "6K - 9K", value: 780 },
      { label: "9K - 13K", value: 1640, isMedian: true },
      { label: "13K - 18K", value: 1210 },
      { label: "18K - 24K", value: 540 },
      { label: "24K+", value: 390 }
    ],
    micromarkets: [
      { name: "Golf Course Ext Rd", price: "23,100", pct: 100 },
      { name: "Dwarka Expressway", price: "16,400", pct: 71 },
      { name: "Noida Sector 150", price: "12,250", pct: 53 },
      { name: "Noida Extension", price: "9,500", pct: 41 },
      { name: "Sohna Road", price: "8,900", pct: 38 }
    ]
  },
  hyderabad: {
    city_name: "Hyderabad",
    insights_summary: "Robust demand continues with a 2% volume rise and 11% steady price growth in west commercial boundaries.",
    heatmapText: "Interactive map detailing tech-corridor expansion across Gachibowli and Kokapet.",
    explore_url: "/maps/hyderabad",
    trendPoints: [
      { label: "Q3-25", price: 7100 },
      { label: "Q4-25", price: 7245 },
      { label: "Q1-26", price: 7910 },
      { label: "Q2-26", price: 8150 }
    ],
    bars: [
      { label: "Below 5K", value: 320 },
      { label: "5K - 7K", value: 910 },
      { label: "7K - 9K", value: 1540, isMedian: true },
      { label: "9K - 11K", value: 820 },
      { label: "11K - 14K", value: 430 },
      { label: "14K+", value: 190 }
    ],
    micromarkets: [
      { name: "Kokapet", price: "11,200", pct: 100 },
      { name: "Hitech City", price: "10,500", pct: 93 },
      { name: "Gachibowli", price: "9,800", pct: 87 },
      { name: "Narsingi", price: "7,900", pct: 70 },
      { name: "Miyapur", price: "6,100", pct: 54 }
    ]
  },
  pune: {
    city_name: "Pune",
    insights_summary: "12% price escalation logged despite a 15% reduction in transactional velocity over the last quarter.",
    heatmapText: "Interactive map outlining capital shifts near the Pune Ring Road infrastructure alignments.",
    explore_url: "/maps/pune",
    trendPoints: [
      { label: "Q3-25", price: 5350 },
      { label: "Q4-25", price: 5400 },
      { label: "Q1-26", price: 6050 },
      { label: "Q2-26", price: 6200 }
    ],
    bars: [
      { label: "Below 4.5K", value: 410 },
      { label: "4.5K - 6K", value: 1230 },
      { label: "6K - 8K", value: 1890, isMedian: true },
      { label: "8K - 10K", value: 740 },
      { label: "10K+", value: 280 }
    ],
    micromarkets: [
      { name: "Baner", price: "9,400", pct: 100 },
      { name: "Kharadi", price: "8,600", pct: 91 },
      { name: "Wakad", price: "7,800", pct: 83 },
      { name: "Hinjewadi", price: "7,100", pct: 75 },
      { name: "Hadapsar", price: "6,900", pct: 73 }
    ]
  },
  kolkata: {
    city_name: "Kolkata",
    insights_summary: "National standout with 10% annual transaction growth, fueled by fresh launch supply pricing between 80L - 2.5Cr.",
    heatmapText: "Interactive map showing rising premium trends in New Town and peripheral metro connectivity zones.",
    explore_url: "/maps/kolkata",
    trendPoints: [
      { label: "Q3-25", price: 4350 },
      { label: "Q4-25", price: 4400 },
      { label: "Q1-26", price: 4710 },
      { label: "Q2-26", price: 4950 }
    ],
    bars: [
      { label: "Below 3.5K", value: 530 },
      { label: "3.5K - 5K", value: 1420, isMedian: true },
      { label: "5K - 7K", value: 910 },
      { label: "7K - 9K", value: 640 },
      { label: "9K+", value: 180 }
    ],
    micromarkets: [
      { name: "Alipore", price: "13,300", pct: 100 },
      { name: "Tollygunge", price: "8,800", pct: 66 },
      { name: "New Town", price: "7,800", pct: 58 },
      { name: "Joka", price: "5,900", pct: 44 },
      { name: "Garia", price: "5,450", pct: 40 }
    ]
  },
  ahmedabad: {
    city_name: "Ahmedabad",
    insights_summary: "8% steady YoY baseline price shift supported by commercial expansions linked to GIFT City corridors.",
    heatmapText: "Interactive map focusing on infrastructure-led growth points and outer ring expansion areas.",
    explore_url: "/maps/ahmedabad",
    trendPoints: [
      { label: "Q3-25", price: 3800 },
      { label: "Q4-25", price: 3950 },
      { label: "Q1-26", price: 4150 },
      { label: "Q2-26", price: 4300 }
    ],
    bars: [
      { label: "Below 3K", value: 620 },
      { label: "3K - 4.5K", value: 1510, isMedian: true },
      { label: "4.5K - 6K", value: 870 },
      { label: "6K - 8K", value: 430 },
      { label: "8K+", value: 120 }
    ],
    micromarkets: [
      { name: "Bodakdev", price: "7,900", pct: 100 },
      { name: "Thaltej", price: "6,800", pct: 86 },
      { name: "Prahlad Nagar", price: "6,200", pct: 78 },
      { name: "Bopal", price: "4,700", pct: 59 },
      { name: "Chandkheda", price: "3,900", pct: 49 }
    ]
  }
};

// Animated Number Flip / CountUp Component supporting layout transitions
function AnimatedNumberFlip({ value, decimals = 1 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 800;
    const startValue = displayValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      
      setDisplayValue(startValue + easedProgress * (value - startValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{displayValue.toFixed(decimals)}</span>;
}

// Compact Skeleton Container Layout
const AssetCardSkeleton = () => (
  <div className="w-full h-full min-h-[140px] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/60 animate-pulse relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
  </div>
);

export default function PriceInsights() {
  const [activeCityKey, setActiveCityKey] = useState("bengaluru");
  const [isChanging, setIsChanging] = useState(false);
  const data = CITY_DATA[activeCityKey];

  const minPrice = Math.min(...data.trendPoints.map(p => p.price)) * 0.95;
  const maxPrice = Math.max(...data.trendPoints.map(p => p.price)) * 1.05;
  const priceRange = maxPrice - minPrice;

  const chartHeight = 120;
  const chartWidth = 330;

  const points = data.trendPoints.map((pt, i) => {
    const x = 30 + i * 90;
    const y = chartHeight - 15 - ((pt.price - minPrice) / priceRange) * (chartHeight - 35);
    return { x, y, label: pt.label, price: pt.price };
  });

  let linePath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      linePath += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
  }

  let areaPath = "";
  if (points.length > 0) {
    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - 15} L ${points[0].x} ${chartHeight - 15} Z`;
  }

  const handleCityChange = (cityKey) => {
    if (cityKey === activeCityKey) return;
    setIsChanging(true);
    setTimeout(() => {
      setActiveCityKey(cityKey);
      setIsChanging(false);
    }, 250);
  };

  const getMedianPrice = () => {
    if (activeCityKey === "bengaluru") return 9785;
    if (activeCityKey === "mumbai") return 15120;
    if (activeCityKey === "delhi_ncr") return 9534;
    if (activeCityKey === "hyderabad") return 7910;
    if (activeCityKey === "pune") return 6050;
    if (activeCityKey === "kolkata") return 4710;
    if (activeCityKey === "ahmedabad") return 4150;
    return 8000;
  };

  return (
    <section className="bg-white py-24 border-b border-slate-200/60 relative overflow-hidden">
      {/* ACETERNITY UI: Grid Pattern Background Primitive Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none z-0" />

      {/* ACETERNITY UI: Background Gradient Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gradient-to-tr from-orange-500/10 to-amber-500/5 blur-3xl rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-gradient-to-br from-sky-500/5 to-transparent blur-3xl rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-md uppercase">
            Market Analytics Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none mt-4">
            Property Price Insights in India
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
            Get accurate property price insights in India with city-wise trends, median rates, and micro-market comparisons backed by real-time benchmarks.
          </p>
        </div>

        {/* SHADCN/ACETERNITY STYLE: Sliding Segmented Tabs Selection Menu Container */}
        <div className="relative bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 max-w-4xl flex gap-1 overflow-x-auto mb-10 shadow-inner no-scrollbar">
          {CITIES.map((city) => {
            const isActive = activeCityKey === city.id;
            return (
              <button
                key={city.id}
                onClick={() => handleCityChange(city.id)}
                className={`relative px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer z-10 ${
                  isActive ? "text-slate-900 font-black bg-white shadow-xs border border-slate-200/40" : "text-slate-500 hover:text-slate-800 bg-transparent border-0"
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>

        {/* Core Content Layout Deck Wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[360px]">
          <AnimatePresence mode="wait">
            {isChanging ? (
              <>
                <AssetCardSkeleton key="s1" />
                <AssetCardSkeleton key="s2" />
                <AssetCardSkeleton key="s3" />
                <AssetCardSkeleton key="s4" />
              </>
            ) : (
              <>
                {/* 1. Property Rates Heatmap Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Property Rates Heatmap</h3>
                        <span className="text-[11px] font-bold text-slate-400">in {data.city_name}</span>
                      </div>
                      <span className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <Map className="h-4.5 w-4.5" />
                      </span>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 bg-sky-50 rounded-xl border border-sky-100/50 mb-5 text-[11px] text-sky-800 leading-relaxed font-semibold">
                      <Info className="h-3.5 w-3.5 mt-0.5 text-sky-600 flex-shrink-0" />
                      <span>{data.heatmapText}</span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] w-full border border-slate-100 bg-slate-50">
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400"
                        alt="City Heatmap Thumbnail"
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <span className="absolute inline-flex h-10 w-10 rounded-full bg-sky-400 opacity-30 animate-ping" />
                        <span className="relative rounded-full p-2 bg-sky-500 text-white shadow-lg">
                          <MapPin className="h-4.5 w-4.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`/properties?city=${data.city_name}`}
                    className="w-full py-3.5 text-center text-xs font-black text-slate-600 hover:text-orange-650 bg-slate-50 hover:bg-slate-100/70 border-t border-slate-100 transition-all duration-300 cursor-pointer block"
                  >
                    Explore Now &rarr;
                  </a>
                </motion.div>

                {/* 2. Price Trend Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Price Trend</h3>
                        <span className="text-[11px] font-bold text-slate-400">in {data.city_name}</span>
                      </div>
                      <span className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <TrendingUp className="h-4.5 w-4.5" />
                      </span>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 bg-sky-50 rounded-xl border border-sky-100/50 mb-5 text-[11px] text-sky-800 leading-relaxed font-semibold">
                      <Info className="h-3.5 w-3.5 mt-0.5 text-sky-600 flex-shrink-0" />
                      <span className="line-clamp-2">{data.insights_summary}</span>
                    </div>

                    {/* FRAMER MOTION: Smooth SVG line path interpolation transitions */}
                    <div className="w-full h-[150px] relative mt-2">
                      <div className="absolute inset-0 flex flex-col justify-between py-2 text-[9px] text-slate-400 font-bold pointer-events-none">
                        <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                          <span>{(maxPrice / 1000).toFixed(1)}K</span>
                          <span>/Sq.Ft.</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                          <span>{(((maxPrice + minPrice) / 2) / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>{(minPrice / 1000).toFixed(1)}K</span>
                        </div>
                      </div>

                      <svg className="w-full h-full absolute inset-0 z-10" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                        <defs>
                          <linearGradient id={`gradient-${activeCityKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        <motion.path
                          initial={{ d: areaPath, opacity: 0 }}
                          animate={{ d: areaPath, opacity: 1 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          fill={`url(#gradient-${activeCityKey})`}
                        />

                        <motion.path
                          initial={{ d: linePath, pathLength: 0 }}
                          animate={{ d: linePath, pathLength: 1 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {points.map((pt, i) => (
                          <g key={i} className="cursor-pointer">
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4.5"
                              fill="#0284c7"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                            <text x={pt.x} y={pt.y - 9} textAnchor="middle" className="font-sans font-black text-[9px] fill-slate-700">
                              {(pt.price / 1000).toFixed(1)}K
                            </text>
                            <text x={pt.x} y={chartHeight - 2} textAnchor="middle" className="font-sans font-bold text-[8.5px] fill-slate-400">
                              {pt.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                  <div className="w-full px-5 pb-3.5 text-right text-[8.5px] text-slate-350 font-semibold">Live Feed Index</div>
                </motion.div>

                {/* 3. Asking Price Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Asking Price Distribution</h3>
                        <span className="text-[11px] font-bold text-slate-400">in {data.city_name}</span>
                      </div>
                      <span className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <BarChart3 className="h-4.5 w-4.5" />
                      </span>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 bg-orange-50 rounded-xl border border-orange-100/50 mb-5 text-[11px] text-orange-850 leading-relaxed font-semibold">
                      <Info className="h-3.5 w-3.5 mt-0.5 text-orange-600 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {data.city_name} active listings median: {" "}
                        <span className="font-black text-orange-600">₹ <AnimatedNumberFlip value={getMedianPrice()} />/Sq.Ft.</span>
                      </span>
                    </div>

                    <div className="h-[120px] flex items-end justify-between gap-1.5 px-1 relative mt-8">
                      {data.bars.map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                          {bar.isMedian && (
                            <div className="absolute -top-7 z-15 bg-slate-900 text-white font-black text-[9px] px-2 py-1 rounded shadow-md whitespace-nowrap tracking-tight animate-bounce">
                              ₹ {getMedianPrice()}
                              <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                            </div>
                          )}

                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(bar.value / 2500) * 100}%` }}
                            transition={{ duration: 0.4, delay: i * 0.03 }}
                            className={`w-full rounded-t-sm cursor-pointer ${
                              bar.isMedian ? "bg-orange-500" : "bg-amber-500/60 hover:bg-amber-500/90"
                            }`}
                          />
                          <div className="h-5 flex items-center justify-center mt-1.5 text-[7px] font-bold text-slate-400 rotate-45 origin-left whitespace-nowrap pl-0.5">{bar.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full px-5 pb-3.5 pt-3 flex justify-between items-center text-[8.5px] text-slate-400 font-bold">
                    <span>No. of Listings</span>
                    <span>Highcharts index</span>
                  </div>
                </motion.div>

                {/* 4. Micromarket Price Comparison Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col justify-between group relative"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Micromarket Comparison</h3>
                        <span className="text-[11px] font-bold text-slate-400">in {data.city_name}</span>
                      </div>
                      <span className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <Layers className="h-4.5 w-4.5" />
                      </span>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 bg-purple-50 rounded-xl border border-purple-100/50 mb-5 text-[11px] text-purple-800 leading-relaxed font-semibold">
                      <Info className="h-3.5 w-3.5 mt-0.5 text-purple-600 flex-shrink-0" />
                      <span>{data.city_name} average micro-market indexing scales</span>
                    </div>

                    <div className="space-y-3.5">
                      {data.micromarkets.slice(0, 5).map((market, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs font-bold">
                            <span className="text-slate-700 truncate max-w-[130px]" title={market.name}>{market.name}</span>
                            <span className="text-slate-800 tracking-tight flex-shrink-0">₹ {market.price}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${market.pct}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="h-full bg-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`/properties?city=${data.city_name}`}
                    className="w-full py-3.5 text-center text-xs font-black text-slate-650 hover:text-orange-600 bg-slate-50 hover:bg-slate-100/70 border-t border-slate-100 transition-all duration-300 cursor-pointer block"
                  >
                    View More Micromarkets
                  </a>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Property Price Insights Navigation */}
        <div className="mt-10 text-left">
          <a
            href={`/properties?city=${data.city_name}`}
            className="inline-flex items-center gap-1.5 text-sm font-black text-slate-850 hover:text-orange-650 transition-colors group cursor-pointer"
          >
            <span>Detailed Property Pricing Analytics in {data.city_name}</span>
            <ChevronRight className="h-4 w-4 stroke-[2.5] transform group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}