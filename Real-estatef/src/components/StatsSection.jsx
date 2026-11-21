"use client";
import { useState, useEffect, useRef } from "react";
import { Users, FileText, Activity, Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Smooth CountUp triggered by IntersectionObserver ─── */
function CountUp({ target, decimals = 0, speed = 1800 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = null;
    const raf = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / speed, 1);
      const eased = p * (2 - p);
      setCount(eased * target);
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [started, target, speed]);

  return <span ref={ref}>{count.toFixed(decimals)}</span>;
}

/* ─── Animated SVG Sparkline with area gradient fill ─── */
function Sparkline({ data = [], color = "#f97316", height = 52 }) {
  const W = 200, H = height;
  if (!data.length) return <div style={{ height: H }} />;
  const max = Math.max(...data), min = Math.min(...data);
  const xs = data.map((_, i) => (i / (data.length - 1)) * W);
  const ys = data.map(d => H - ((d - min) / (max - min || 1)) * (H - 6) - 3);
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const areaD = `M ${pts} L ${W},${H} L 0,${H} Z`;
  const gradId = `spfill${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 700,
          strokeDashoffset: 700,
          animation: "sparkDraw 1.6s ease-out forwards"
        }}
      />
    </svg>
  );
}

/* ─── Animated ring/donut gauge ─── */
function MiniRing({ pct = 72, color = "#f97316", size = 54 }) {
  const r = 15, cx = 18, cy = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round">
        <animate attributeName="stroke-dasharray" from={`0 ${circ}`} to={`${dash} ${circ}`} dur="1.3s" fill="freeze" />
      </circle>
    </svg>
  );
}

/* ─── Trend badge ─── */
function ChangeBadge({ change, label }) {
  const up = change >= 0;
  return (
    <div className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${up ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-500 border border-red-100"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{(change * 100).toFixed(1)}%
      <span className="text-slate-400 font-semibold ml-0.5">{label}</span>
    </div>
  );
}

/* ─── Data definitions ─── */
const STATS = [
  {
    target: 2.4, decimals: 1, suffix: "M+", prefix: "",
    label: "Trusted Buyers",
    icon: Users,
    iconBg: "from-orange-500 to-amber-500",
    color: "#f97316",
    change: 0.082,
    ring: 78,
    desc: "Successful portal signups & verified KYC profiles",
    sparkData: [80, 100, 90, 130, 110, 160, 145, 200, 185, 240],
    yesterdayData: [60, 80, 70, 110, 90, 130, 125, 170, 155, 200],
    meta: [{ label: "KYC Verified", val: "1.87M" }, { label: "Active Today", val: "48.2K" }],
  },
  {
    target: 1.2, decimals: 1, suffix: "M+", prefix: "",
    label: "Active Listings",
    icon: FileText,
    iconBg: "from-blue-500 to-cyan-500",
    color: "#3b82f6",
    change: 0.034,
    ring: 62,
    desc: "RERA verified residential plots, commercial offices & premium homes",
    sparkData: [40, 60, 55, 80, 70, 95, 88, 110, 105, 120],
    yesterdayData: [30, 50, 48, 68, 60, 78, 72, 95, 90, 105],
    meta: [{ label: "Residential", val: "820K" }, { label: "Commercial", val: "380K" }],
  },
  {
    target: 8.5, decimals: 1, suffix: "M+", prefix: "",
    label: "Monthly Seekers",
    icon: Activity,
    iconBg: "from-violet-500 to-purple-600",
    color: "#8b5cf6",
    change: 0.127,
    ring: 85,
    desc: "Active property lookups, organic site searches & EMI loan calculations",
    sparkData: [200, 280, 260, 350, 320, 420, 400, 500, 480, 560],
    yesterdayData: [160, 230, 210, 290, 265, 350, 325, 420, 400, 480],
    meta: [{ label: "Searches/day", val: "283K" }, { label: "New users", val: "12.4K" }],
  },
  {
    target: 8.4, decimals: 1, suffix: " Bn", prefix: "₹",
    label: "Properties Sold",
    icon: Landmark,
    iconBg: "from-emerald-500 to-teal-600",
    color: "#10b981",
    change: 0.054,
    ring: 91,
    desc: "Cumulative asset transactional valuation securely closed on platform",
    sparkData: [120, 170, 150, 220, 195, 260, 245, 310, 290, 340],
    yesterdayData: [100, 140, 125, 185, 165, 220, 205, 265, 248, 295],
    meta: [{ label: "Avg deal size", val: "₹42L" }, { label: "This month", val: "₹1.2Bn" }],
  },
];

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function StatsSection() {
  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-slate-50/60 py-24 border-b border-slate-200/60 relative overflow-hidden"
    >
      {/* Subtle grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-35 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            Live Platform Metrics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Numbers That Define{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Our Scale
            </span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto leading-relaxed">
            Real-time analytics powering India's fastest growing property marketplace
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
        >
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            const isHov = hovered === idx;

            return (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 36, scale: 0.96 },
                  visible: {
                    opacity: 1, y: 0, scale: 1,
                    transition: { type: "spring", stiffness: 78, damping: 13 }
                  }
                }}
                className="relative group"
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Hover radial glow */}
                <AnimatePresence>
                  {isHov && (
                    <motion.span
                      className="absolute inset-0 rounded-[2rem] pointer-events-none z-0"
                      layoutId="statsHoverGlow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        background: `radial-gradient(ellipse at 55% 38%, ${stat.color}1a, transparent 68%)`
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Card body */}
                <div
                  className={`relative z-10 bg-white rounded-[2rem] border p-7 shadow-sm flex flex-col gap-5 overflow-hidden transition-all duration-300 ${
                    isHov
                      ? "border-slate-300 shadow-xl shadow-slate-200/50"
                      : "border-slate-200/90"
                  }`}
                >
                  {/* ── TOP: Icon | Number | Ring ── */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Gradient icon block */}
                      <div
                        className={`p-4 rounded-2xl bg-gradient-to-br ${stat.iconBg} text-white shadow-md shrink-0 transition-transform duration-300 ${isHov ? "scale-110" : ""}`}
                      >
                        <Icon className="h-6 w-6 stroke-[2]" />
                      </div>

                      {/* Number + label + badge */}
                      <div className="min-w-0">
                        <h3 className="text-[2.6rem] sm:text-5xl font-black tracking-tight leading-none text-slate-900 flex items-baseline gap-0.5">
                          {stat.prefix && (
                            <span className="text-2xl font-black text-slate-600">{stat.prefix}</span>
                          )}
                          {visible
                            ? <CountUp target={stat.target} decimals={stat.decimals} speed={1700} />
                            : <span>{stat.target.toFixed(stat.decimals)}</span>
                          }
                          <span className="text-2xl font-black text-slate-400">{stat.suffix}</span>
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                          {stat.label}
                        </p>
                        <div className="mt-2.5">
                          <ChangeBadge change={stat.change} label="vs last month" />
                        </div>
                      </div>
                    </div>

                    {/* Ring gauge + % label */}
                    <div className="relative shrink-0">
                      <MiniRing pct={stat.ring} color={stat.color} size={54} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-black text-slate-700">{stat.ring}%</span>
                      </div>
                    </div>
                  </div>

                  {/* ── MIDDLE: Two mini meta KPIs ── */}
                  <div className="flex items-stretch gap-4 bg-slate-50/70 rounded-2xl px-4 py-3 border border-slate-100">
                    {stat.meta.map((m, i) => (
                      <div
                        key={i}
                        className={`flex-1 ${i === 0 ? "border-r border-slate-200 pr-4" : ""}`}
                      >
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">{m.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── CHART: Today vs Yesterday ── */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        10-day trend
                      </p>
                      <div className="flex items-center gap-3 text-[8px] font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="block h-px w-4 border-t border-dashed border-slate-400" />
                          Yesterday
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className="block h-0.5 w-4 rounded"
                            style={{ background: stat.color }}
                          />
                          Today
                        </span>
                      </div>
                    </div>

                    <div className="relative h-14 w-full">
                      {/* Yesterday dashed line overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg
                          viewBox="0 0 200 52"
                          className="w-full h-full"
                          preserveAspectRatio="none"
                        >
                          {(() => {
                            const W = 200, H = 52;
                            const d = stat.yesterdayData;
                            const max = Math.max(...d), min = Math.min(...d);
                            const pts = d
                              .map((v, i) => {
                                const x = (i / (d.length - 1)) * W;
                                const y = H - ((v - min) / (max - min || 1)) * (H - 6) - 3;
                                return `${x},${y}`;
                              })
                              .join(" ");
                            return (
                              <polyline
                                points={pts}
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="1.5"
                                strokeDasharray="4 3"
                                strokeLinecap="round"
                              />
                            );
                          })()}
                        </svg>
                      </div>
                      {/* Today animated sparkline */}
                      <Sparkline data={stat.sparkData} color={stat.color} height={52} />
                    </div>

                    <div className="flex justify-between text-[8px] text-slate-300 font-bold mt-1 px-0.5">
                      <span>D-9</span><span>D-6</span><span>D-3</span><span>Today</span>
                    </div>
                  </div>

                  {/* ── FOOTER DESC ── */}
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-4">
                    {stat.desc}
                  </p>

                  {/* Background accent blob */}
                  <div
                    className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-2xl pointer-events-none transition-opacity duration-500"
                    style={{ background: stat.color, opacity: isHov ? 0.09 : 0.04 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── BOTTOM SUMMARY BAR ── */}
        <motion.div
          className="mt-8 bg-white rounded-3xl border border-slate-200/80 px-6 py-5 flex flex-wrap justify-between items-center gap-5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {[
            { label: "Platform Uptime", val: "99.98%", color: "#10b981" },
            { label: "Avg Closing Time", val: "18 Days", color: "#f97316" },
            { label: "RERA Compliant",  val: "100%",   color: "#3b82f6" },
            { label: "Cities Covered",  val: "340+",   color: "#8b5cf6" },
            { label: "Happy Families",  val: "1.4M+",  color: "#f59e0b" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-left">
              <span className="h-6 w-1 rounded-full shrink-0" style={{ background: item.color }} />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-black text-slate-800">{item.val}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Inline keyframes for sparkline + ring animations */}
      <style>{`
        @keyframes sparkDraw {
          from { stroke-dashoffset: 700; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
}