import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../lib/adminApi";
import { Badge, statusTone } from "../../admin/components/ui";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Activity,
  Sparkles,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  Compass,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import LuxurySpotlightCard from "../../admin/components/LuxurySpotlightCard";
import LuxurySparkline from "../../admin/components/LuxurySparkline";

const PRESETS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

const monthName = (m) =>
  ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] || `M${m}`;

const CustomChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#DFDED7] bg-[#FFFFFF] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(28,36,33,0.08)] text-xs">
        <p className="font-semibold text-[#17232F] mb-1">{label}</p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
              style={{ backgroundColor: p.color || p.fill || p.stroke || "#B9965B" }}
            />
            <span className="text-[#65717B] font-medium capitalize">{p.name || "Value"}:</span>
            <span className="font-bold text-[#17232F] font-mono-numbers">
              {prefix}
              {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ManageDashboard() {
  const [preset, setPreset] = useState("all");
  const [granularity, setGranularity] = useState("monthly");
  const [range, setRange] = useState({ from: "", to: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState("revenue"); // "revenue" | "sales" | "growth"
  const [recentTab, setRecentTab] = useState("activity"); // "activity" | "properties" | "bookings" | "customers"

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        granularity,
        ...(range.from || range.to ? { from: range.from, to: range.to } : { preset }),
      };
      const res = await api.get("/admin/dashboard/stats", { params });
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load operations metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [preset, granularity]);

  const cards = data?.cards || {};

  // Formatted revenue series
  const revData = useMemo(() => {
    const formatPeriod = (id) => {
      if (!id) return "Period";
      if (/^\d{4}-\d{2}$/.test(id)) {
        const [y, m] = id.split("-");
        const mNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${mNames[parseInt(m, 10)] || m} ${y}`;
      }
      return id;
    };
    return (data?.charts?.revenueSeries || []).map((r) => ({
      name: formatPeriod(r._id),
      Revenue: r.total || 0,
      Count: r.count || 0,
    }));
  }, [data]);

  // Lead status distribution
  const leadsStatusData = useMemo(() => {
    return (data?.charts?.leadsByStatus || []).map((l) => ({
      status: l._id || "Unclassified",
      count: l.count || 0,
    }));
  }, [data]);

  const totalLeadsCount = leadsStatusData.reduce((acc, curr) => acc + curr.count, 0) || 1;

  // Booking status distribution for Deals Closed chart
  const bookingStatusData = useMemo(() => {
    return (data?.charts?.bookingsByStatus || []).map((b) => ({
      name: b._id || "Pending",
      Deals: b.count || 0,
    }));
  }, [data]);

  // Property status distribution for Growth chart
  const propGrowthData = useMemo(() => {
    return (data?.charts?.propertyByStatus || []).map((p) => ({
      name: p._id || "Available",
      Properties: p.count || 0,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Interactive Controls Bar */}
      <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#B9965B] ring-4 ring-[#F4EFE6]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#65717B]">
              Admin Operations Console
            </span>
            <span className="rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-[11px] font-semibold text-[#B9965B]">
              Live Health
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold text-[#17232F] tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
            Executive Overview & Operations
          </h1>
          <p className="text-xs text-[#65717B] mt-0.5">
            Real-time portfolio management, tour bookings, revenue flow, and lead conversions.
          </p>
        </div>

        {/* Timeframe selector & Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Preset Buttons */}
          <div className="inline-flex rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs font-semibold shadow-2xs">
            {PRESETS.map((p) => {
              const active = preset === p.id && !range.from;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPreset(p.id);
                    setRange({ from: "", to: "" });
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                    active
                      ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                      : "text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Date Range inputs */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-2.5 py-1.5 text-xs text-[#17232F] outline-none focus:border-[#B9965B]"
            />
            <span className="text-[#65717B]">→</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              className="rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-2.5 py-1.5 text-xs text-[#17232F] outline-none focus:border-[#B9965B]"
            />
            {(range.from || range.to) && (
              <button
                onClick={load}
                className="rounded-xl bg-[#B9965B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#a6844d] cursor-pointer shadow-xs transition-colors"
              >
                Apply
              </button>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={load}
            disabled={loading}
            title="Refresh metrics"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-white hover:text-[#B9965B] shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B9965B]" : ""}`} />
          </button>
        </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.02 }}
        >
          <LuxurySpotlightCard tilt={true} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">Card 01 • Revenue</span>
                <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">GROSS REVENUE</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">{`₹${Number(cards.totalRevenue || 0).toLocaleString("en-IN")}`}</h2>
              <span className="text-xs font-bold text-[#3E8066] font-mono">+14.2%</span>
            </div>
            <p className="text-[11px] text-[#65717B] mt-1">from bookings • Settlement: 100% Escrow</p>
            <div className="mt-3"><LuxurySparkline data={[35, 42, 38, 45, 55, 60, cards.totalRevenue ? 75 : 40]} color="#B9965B" height={26} /></div>
          </LuxurySpotlightCard>
        </motion.div>

        {/* Metric 2: Properties Portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          <LuxurySpotlightCard tilt={true} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">Card 02 • Portfolio</span>
                <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">TOTAL LISTINGS</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">{cards.totalProperties || 0}</h2>
              <span className="text-xs font-bold text-[#3E8066] font-mono">{cards.availableProperties ? `${cards.availableProperties} Active` : "+4.1%"}</span>
            </div>
            <p className="text-[11px] text-[#65717B] mt-1">in market • {cards.soldProperties || 0} Deals Completed</p>
            <div className="mt-3"><LuxurySparkline data={[12, 14, 15, 17, 19, 21, cards.totalProperties || 24]} color="#B9965B" height={26} /></div>
          </LuxurySpotlightCard>
        </motion.div>

        {/* Metric 3: Tour Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <LuxurySpotlightCard tilt={true} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">Card 03 • Tours</span>
                <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">TOUR BOOKINGS</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">{Number(cards.pendingBookings || 0) + Number(cards.completedBookings || 0)}</h2>
              <span className="text-xs font-bold text-[#3E8066] font-mono">{`${cards.completedBookings || 0} done`}</span>
            </div>
            <p className="text-[11px] text-[#65717B] mt-1">visits • {cards.pendingBookings || 0} scheduled pending</p>
            <div className="mt-3"><LuxurySparkline data={[10, 15, 12, 18, 20, 24, 28]} color="#3E8066" height={26} /></div>
          </LuxurySpotlightCard>
        </motion.div>

        {/* Metric 4: Inbound Leads */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
        >
          <LuxurySpotlightCard tilt={true} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">Card 04 • Leads</span>
                <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">INBOUND LEADS</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#FDF5E6] border border-[#B98235]/30 flex items-center justify-center text-[#B98235] shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">{cards.activeLeads || 0}</h2>
              <span className="text-xs font-bold text-[#3E8066] font-mono">{`+${cards.newLeads || 0} new`}</span>
            </div>
            <p className="text-[11px] text-[#65717B] mt-1">needs action • Response SLA: &lt; 15m</p>
            <div className="mt-3"><LuxurySparkline data={[8, 12, 10, 16, 19, 22, cards.activeLeads || 25]} color="#B98235" height={26} /></div>
          </LuxurySpotlightCard>
        </motion.div>

        {/* Metric 5: Agents & Staff */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          <LuxurySpotlightCard tilt={true} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">Card 05 • Team</span>
                <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">AGENTS NETWORK</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">{cards.totalAgents || 0}</h2>
              <span className="text-xs font-bold text-[#3E8066] font-mono">{`${cards.totalCustomers || 0} clients`}</span>
            </div>
            <p className="text-[11px] text-[#65717B] mt-1">assigned • Active Roster: Online</p>
            <div className="mt-3"><LuxurySparkline data={[5, 6, 8, 9, 11, 12, cards.totalAgents || 14]} color="#B9965B" height={26} /></div>
          </LuxurySpotlightCard>
        </motion.div>

        {/* Metric 6: Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.22 }}
        >
          <LuxurySpotlightCard tilt={true} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">Card 06 • Ledger</span>
                <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">LEDGER TRANSACTIONS</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">{cards.pendingPayments ? `${cards.pendingPayments} Pending` : "Settled"}</h2>
              <span className="text-xs font-bold text-[#3E8066] font-mono">+18.5%</span>
            </div>
            <p className="text-[11px] text-[#65717B] mt-1">this month • Reconciliation: Live</p>
            <div className="mt-3"><LuxurySparkline data={[22, 28, 26, 34, 38, 42, 48]} color="#17232F" height={26} /></div>
          </LuxurySpotlightCard>
        </motion.div>
      </div>

      {/* Main Charts & Visualizations Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Animated Interactive Chart */}
        <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#17232F] text-base">Growth & Financial Trajectory</h3>
                <span className="rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-[10px] font-semibold text-[#B9965B]">
                  Live Data
                </span>
              </div>
              <p className="text-xs text-[#65717B] mt-0.5">
                Multi-view analysis of monthly gross revenue, completed deals, and property acquisitions.
              </p>
            </div>

            {/* Chart Mode Toggle */}
            <div className="inline-flex rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs font-semibold shadow-2xs self-start sm:self-auto">
              <button
                onClick={() => setChartView("revenue")}
                className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  chartView === "revenue"
                    ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                    : "text-[#65717B] hover:text-[#17232F]"
                }`}
              >
                Revenue Flow (₹)
              </button>
              <button
                onClick={() => setChartView("sales")}
                className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  chartView === "sales"
                    ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                    : "text-[#65717B] hover:text-[#17232F]"
                }`}
              >
                Deals Closed
              </button>
              <button
                onClick={() => setChartView("growth")}
                className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  chartView === "growth"
                    ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                    : "text-[#65717B] hover:text-[#17232F]"
                }`}
              >
                Property Status
              </button>
            </div>
          </div>

          {/* Chart Rendering Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "revenue" ? (
                <AreaChart data={revData.length ? revData : [{ name: "Current", Revenue: cards.totalRevenue || 0 }]} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="manageRevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B9965B" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#B9965B" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFDED7" />
                  <XAxis dataKey="name" stroke="#65717B" fontSize={11} tickLine={false} axisLine={{ stroke: "#DFDED7" }} />
                  <YAxis
                    stroke="#65717B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 10000000
                        ? `₹${(v / 10000000).toFixed(1)}Cr`
                        : v >= 100000
                          ? `₹${(v / 100000).toFixed(0)}L`
                          : `₹${v}`
                    }
                  />
                  <Tooltip content={<CustomChartTooltip prefix="₹" />} />
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke="#B9965B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#manageRevGradient)"
                    dot={{ r: 3.5, stroke: "#B9965B", strokeWidth: 2, fill: "#FFFFFF" }}
                    activeDot={{ r: 6.5, fill: "#17232F", stroke: "#FFFFFF", strokeWidth: 2.5 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </AreaChart>
              ) : chartView === "sales" ? (
                <BarChart data={bookingStatusData.length ? bookingStatusData : [{ name: "Completed", Deals: cards.completedBookings || 0 }]} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFDED7" />
                  <XAxis dataKey="name" stroke="#65717B" fontSize={11} tickLine={false} axisLine={{ stroke: "#DFDED7" }} />
                  <YAxis stroke="#65717B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip suffix=" Bookings" />} />
                  <Bar
                    dataKey="Deals"
                    fill="#B9965B"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </BarChart>
              ) : (
                <LineChart data={propGrowthData.length ? propGrowthData : [{ name: "Available", Properties: cards.availableProperties || 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFDED7" />
                  <XAxis dataKey="name" stroke="#65717B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#65717B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomChartTooltip suffix=" Units" />} />
                  <Line
                    type="monotone"
                    dataKey="Properties"
                    stroke="#B9965B"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: "#B9965B", strokeWidth: 2, fill: "#FFFFFF" }}
                    activeDot={{ r: 6, fill: "#a6844d" }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Key Highlights & Quick Stats */}
        <div className="flex flex-col gap-6">
          {/* Top Broker / Leaderboard Card */}
          <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F4EFE6] text-[#B9965B]">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#17232F] text-sm">Top Agents Performance</h4>
              </div>
              <Link to="/manage/agents" className="text-xs text-[#B9965B] font-semibold hover:underline">
                View all
              </Link>
            </div>

            <div className="divide-y divide-[#DFDED7]">
              {(data?.agentPerformance || []).slice(0, 3).map((agent, i) => (
                <div key={agent._id || i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F7F7F2] font-mono font-bold text-[#B9965B] text-[11px] border border-[#DFDED7]">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[#17232F] truncate max-w-[120px]">{agent.name}</p>
                      <p className="text-[10px] text-[#65717B]">{agent.assignedLeads || 0} leads assigned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#17232F] font-mono-numbers">
                      ₹{Number(agent.sales || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-[#3E8066] font-semibold">{agent.conversionRate || 0}% conv.</p>
                  </div>
                </div>
              ))}
              {(!data?.agentPerformance || !data.agentPerformance.length) && (
                <p className="text-center py-5 text-xs text-[#65717B]">No agent performance data recorded yet.</p>
              )}
            </div>
          </div>

          {/* Leads Pipeline Breakdown */}
          <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F4EFE6] text-[#B9965B]">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#17232F] text-sm">Leads Pipeline</h4>
              </div>
              <Link to="/manage/leads" className="text-xs text-[#B9965B] font-semibold hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {leadsStatusData.map((item, idx) => {
                const pct = Math.round((item.count / totalLeadsCount) * 100);
                const tone = statusTone(item.status);
                const barColor =
                  tone === "green"
                    ? "bg-[#3E8066]"
                    : tone === "amber"
                      ? "bg-[#B98235]"
                      : tone === "red"
                        ? "bg-[#B85C56]"
                        : "bg-[#B9965B]";

                return (
                  <div key={item.status || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#17232F]">{item.status}</span>
                      <span className="font-mono-numbers font-bold text-[#17232F]">{item.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#DFDED7] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {!leadsStatusData.length && (
                <p className="text-center py-5 text-xs text-[#65717B]">No leads recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity & Records Feed Tabs */}
      <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#DFDED7]">
          <div>
            <h3 className="font-bold text-[#17232F] text-base">Live Activity & Records Feed</h3>
            <p className="text-xs text-[#65717B] mt-0.5">
              Chronological log of events, bookings, properties, and customers.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setRecentTab("activity")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                recentTab === "activity"
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Activity Logs
            </button>
            <button
              onClick={() => setRecentTab("properties")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                recentTab === "properties"
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Recent Properties
            </button>
            <button
              onClick={() => setRecentTab("bookings")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                recentTab === "bookings"
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Recent Bookings
            </button>
            <button
              onClick={() => setRecentTab("customers")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                recentTab === "customers"
                  ? "bg-white text-[#B9965B] border border-[#DFDED7] font-bold shadow-xs"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Recent Customers
            </button>
          </div>
        </div>

        {/* Tab 1: Activity Logs */}
        {recentTab === "activity" && (
          <div className="divide-y divide-[#DFDED7]">
            {(data?.recent?.recentActivity || []).map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4EFE6] text-[#B9965B]">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#17232F] truncate">{item.action || "Action executed"}</p>
                    <p className="text-[11px] text-[#65717B] truncate">
                      {item.module} · by <b className="text-[#17232F]">{item.user?.name || "System"}</b>
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-[#65717B] shrink-0 font-mono-numbers">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
            {(!data?.recent?.recentActivity || !data.recent.recentActivity.length) && (
              <p className="py-6 text-center text-xs text-[#65717B]">No activity logs recorded yet.</p>
            )}
          </div>
        )}

        {/* Tab 2: Recent Properties */}
        {recentTab === "properties" && (
          <div className="divide-y divide-[#DFDED7]">
            {(data?.recent?.recentProperties || []).map((p) => (
              <div key={p._id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4EFE6] text-[#B9965B] font-bold">
                    🏠
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#17232F] truncate">{p.title}</p>
                    <p className="text-[11px] text-[#65717B]">
                      ID: <span className="font-mono-numbers font-semibold text-[#17232F]">{p.propertyId}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold text-[#17232F] font-mono-numbers">
                    ₹{Number(p.price || 0).toLocaleString("en-IN")}
                  </span>
                  <Badge value={p.status} tone={statusTone(p.status)} />
                </div>
              </div>
            ))}
            {(!data?.recent?.recentProperties || !data.recent.recentProperties.length) && (
              <p className="py-6 text-center text-xs text-[#65717B]">No properties recorded yet.</p>
            )}
          </div>
        )}

        {/* Tab 3: Recent Bookings */}
        {recentTab === "bookings" && (
          <div className="divide-y divide-[#DFDED7]">
            {(data?.recent?.recentBookings || []).map((b) => (
              <div key={b._id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4EFE6] text-[#B9965B] font-bold">
                    📅
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#17232F] truncate">
                      {b.property?.title || b.bookingId || "Property Visit Tour"}
                    </p>
                    <p className="text-[11px] text-[#65717B]">
                      Client: <b className="text-[#17232F]">{b.user?.name || "Client"}</b>
                    </p>
                  </div>
                </div>
                <Link
                  to="/manage/bookings"
                  className="rounded-lg border border-[#DFDED7] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#B9965B] hover:bg-[#F7F7F2] transition"
                >
                  View Details
                </Link>
              </div>
            ))}
            {(!data?.recent?.recentBookings || !data.recent.recentBookings.length) && (
              <p className="py-6 text-center text-xs text-[#65717B]">No bookings recorded yet.</p>
            )}
          </div>
        )}

        {/* Tab 4: Recent Customers */}
        {recentTab === "customers" && (
          <div className="divide-y divide-[#DFDED7]">
            {(data?.recent?.recentCustomers || []).map((u) => (
              <div key={u._id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4EFE6] font-bold text-[#B9965B] uppercase">
                    {u.name?.charAt(0) || "C"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#17232F] truncate">{u.name}</p>
                    <p className="text-[11px] text-[#65717B] truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-[10px] font-semibold text-[#B9965B]">
                    Client
                  </span>
                  <span className="text-[10px] text-[#65717B] font-mono-numbers">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {(!data?.recent?.recentCustomers || !data.recent.recentCustomers.length) && (
              <p className="py-6 text-center text-xs text-[#65717B]">No customers recorded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
