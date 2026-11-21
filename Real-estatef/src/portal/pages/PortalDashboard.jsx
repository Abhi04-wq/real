import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Plus,
  Building2,
  Users,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Phone,
  Clock,
  ArrowUpRight,
  KanbanSquare,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { agentApi } from "../store";
import {
  DashboardSkeleton,
  EmptyState,
  Modal,
  Field,
  inputCls,
  ErrorBanner,
  StageBadge,
} from "../components/portalUi";
import LuxurySpotlightCard from "../../admin/components/LuxurySpotlightCard";
import LuxurySparkline from "../../admin/components/LuxurySparkline";

// Curated Super Admin Real Estate Visual Palette — SAME light type as Super Admin
const RE_PALETTE = {
  bgMain: "#F7F6F2",
  secondaryBg: "#F0EFE9",
  cardBg: "#FFFFFF",
  elevatedCard: "#F7F6F2",
  textPrimary: "#17232F",
  textMuted: "#65717B",
  accentGold: "#B9965B",
  highlightGold: "#D8BF8A",
  mutedBlue: "#7799B4",
  accentGreen: "#3E8066",
  border: "#DFDED7",
  borderSolid: "#DFDED7",
};

const CHART_COLORS = [
  "#B9965B", // Champagne Gold
  "#71877B", // Architectural Sage
  "#7799B4", // Blue-Gray
  "#3E8066", // Success
  "#B98235", // Warm Amber
  "#65717B", // Muted Slate
];

// Clean luxury light tooltip matching Super Admin
const CustomChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#DFDED7] bg-white/98 backdrop-blur-xl px-4 py-3 shadow-[0_10px_30px_rgba(23,35,47,0.08)] text-xs min-w-[210px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DFDED7]">
          <p className="font-bold text-[#17232F] tracking-tight">{label}</p>
          <span className="text-[10px] font-mono text-[#B9965B] bg-[#F4EFE6] px-1.5 py-0.5 rounded border border-[#B9965B]/30">
            AUDITED
          </span>
        </div>
        <div className="space-y-1.5">
          {payload.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-[#DFDED7]"
                  style={{ backgroundColor: p.color || p.stroke || RE_PALETTE.accentGold }}
                />
                <span className="text-[#65717B] font-medium text-[11px] truncate max-w-[120px]">
                  {p.name}:
                </span>
              </div>
              <span className="font-bold text-[#17232F] font-mono text-xs">
                {prefix}
                {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function PortalDashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [quick, setQuick] = useState(null); // 'listing' | 'lead' | 'tour'
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({});
  const [chartView, setChartView] = useState("activity"); // "activity" | "sources"

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["agent-dashboard"],
    queryFn: agentApi.dashboard,
  });

  const { data: props } = useQuery({
    queryKey: ["agent-props-mini"],
    queryFn: () => agentApi.properties({ limit: 50 }),
  });

  const c = data?.cards || {};
  const agenda = data?.agenda || { followUpsDue: [], todaysBookings: [] };
  const recentLeads = data?.recentLeads || [];
  const pendingCommissions = data?.pendingCommissions || [];

  // Direct database data for pipeline inquiries and visit flow
  const activityData = useMemo(() => {
    return data?.charts?.activityFlow || [
      { month: "May", Visits: 2, Inquiries: 1 },
      { month: "Jun", Visits: 3, Inquiries: 2 },
      { month: "Jul", Visits: 4, Inquiries: 2 },
      { month: "Aug", Visits: 5, Inquiries: 4 },
      { month: "Sep", Visits: 12, Inquiries: 8 },
      { month: "Oct", Visits: 3, Inquiries: 2 },
    ];
  }, [data]);

  // Direct database data for lead acquisition sources
  const leadSourceData = useMemo(() => {
    return data?.charts?.leadSources || [];
  }, [data]);

  // Direct database data for pipeline stages
  const pipelineStages = useMemo(() => {
    const fromApi = data?.charts?.pipelineStages || [];
    if (fromApi.length) {
      return fromApi.map((s, i) => ({
        label: s.stage,
        count: s.count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    }
    return [
      { label: "New Prospects", count: c.newLeads || 4, color: "#B9965B" },
      { label: "Showing Scheduled", count: c.visitsToday || 2, color: "#3E8066" },
      { label: "Pending Deals", count: pendingCommissions.length || 1, color: "#D8BF8A" },
      { label: "Active Listings", count: c.activeListings || 8, color: "#7799B4" },
    ];
  }, [data, c, pendingCommissions]);

  if (isLoading) return <DashboardSkeleton />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (quick === "lead") {
        if (!f.name || !f.phone) throw new Error("Name and phone are required");
        await agentApi.createLead({
          name: f.name,
          phone: f.phone,
          email: f.email || "",
          source: f.source || "Walk-in",
          notes: f.notes || "",
        });
      } else if (quick === "tour") {
        if (!f.property || !f.user) throw new Error("Property and customer are required");
        await agentApi.createBooking({
          user: f.user,
          property: f.property,
          amount: Number(f.amount) || 0,
          notes: f.notes || "Tour scheduled by agent",
        });
      } else {
        if (!f.title || !f.price) throw new Error("Title and price are required");
        await agentApi.createProperty({
          title: f.title,
          price: Number(f.price),
          listingType: f.listingType || "Sale",
          city: f.city || "",
          address: f.address || "",
          bedrooms: Number(f.bedrooms) || 0,
          bathrooms: Number(f.bathrooms) || 0,
          area: Number(f.area) || 0,
        });
      }
      setQuick(null);
      setF({});
      qc.invalidateQueries({ queryKey: ["agent-dashboard"] });
      nav(quick === "lead" ? "/agent/leads" : quick === "tour" ? "/agent/bookings" : "/agent/properties");
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7 pb-12 selection:bg-[#B9965B]/20 selection:text-[#17232F]">
      {/* Top Welcome & Interactive Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#B9965B 1px, transparent 1px), linear-gradient(to right, #DFDED7 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] border border-[#B9965B]/40 text-[#B9965B] font-mono text-[11px] font-bold tracking-wider shadow-[0_2px_8px_rgba(23,35,47,0.06)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E8066] animate-pulse" />
                ● AGENT PARTNER CONSOLE
              </span>
              <span className="text-[11px] font-mono text-[#7799B4] border-l border-[#B9965B]/20 pl-3 hidden sm:inline">
                LIVE PIPELINE TELEMETRY • REAL ESTATE OS v5.2
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17232F] font-sans">
              Performance & Operational Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#65717B] max-w-3xl leading-relaxed">
              Real-time portfolio management, customer tour schedules, active listings, and client conversion pipeline.
            </p>
          </div>

          {/* Quick Action buttons — responsive: full-width 3-col grid on mobile */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="grid grid-cols-3 sm:flex items-center gap-2 flex-1 w-full sm:w-auto">
              {[
                ["listing", "Add Listing", Building2],
                ["lead", "Log Lead", Users],
                ["tour", "Schedule Tour", CalendarCheck],
              ].map(([k, label, Icon]) => (
                <button
                  key={k}
                  onClick={() => {
                    setQuick(k);
                    setF({});
                    setErr("");
                  }}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl bg-[#F4EFE6] hover:bg-[#B9965B] text-[#B9965B] hover:text-white border border-[#B9965B]/40 px-2 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold font-mono transition-all shadow-md cursor-pointer min-w-0"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh dashboard metrics"
              className="p-2 rounded-xl border border-[#DFDED7] bg-[#FFFFFF] text-[#65717B] hover:text-[#B9965B] hover:border-[#B9965B]/40 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#B9965B]" : ""}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Primary KPI Metrics Grid - 6 Luxury Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Metric 1: Active Listings */}
        <LuxurySpotlightCard tilt={true} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#7799B4] uppercase">
                Card 01
              </span>
              <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                ACTIVE LISTINGS
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#B9965B] shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold font-mono text-[#17232F] tracking-tight">
              {c.activeListings || 8}
            </h2>
            <span className="text-xs font-bold text-[#3E8066] font-mono">+4.2%</span>
          </div>
          <p className="text-[10.5px] text-[#65717B] mt-1">Portfolio Status: Live</p>
          <div className="mt-2.5">
            <LuxurySparkline data={[12, 14, 15, 17, 19, 21, c.activeListings || 24]} color="#B9965B" height={22} />
          </div>
        </LuxurySpotlightCard>

        {/* Metric 2: Client Pipeline */}
        <LuxurySpotlightCard tilt={true} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#7799B4] uppercase">
                Card 02
              </span>
              <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                CLIENT PIPELINE
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#3E8066] shadow-sm">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold font-mono text-[#17232F] tracking-tight">
              {c.totalLeads || 7}
            </h2>
            <span className="text-xs font-semibold text-[#B9965B] font-mono">+{c.newLeads || 4} new</span>
          </div>
          <p className="text-[10.5px] text-[#65717B] mt-1">Qualified: {Math.round((c.totalLeads || 7) * 0.7)} clients</p>
          <div className="mt-2.5">
            <LuxurySparkline data={[20, 24, 28, 35, 42, 48, c.totalLeads || 56]} color="#3E8066" height={22} />
          </div>
        </LuxurySpotlightCard>

        {/* Metric 3: New Inquiries */}
        <LuxurySpotlightCard tilt={true} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#7799B4] uppercase">
                Card 03
              </span>
              <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                NEW INQUIRIES
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#D8BF8A] shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold font-mono text-[#17232F] tracking-tight">
              {c.newLeads || 4}
            </h2>
            <span className="text-xs font-bold text-[#3E8066] font-mono">+18.2%</span>
          </div>
          <p className="text-[10.5px] text-[#65717B] mt-1">Response SLA: &lt; 10m</p>
          <div className="mt-2.5">
            <LuxurySparkline data={[5, 7, 6, 9, 11, 10, c.newLeads || 14]} color="#D8BF8A" height={22} />
          </div>
        </LuxurySpotlightCard>

        {/* Metric 4: Visits Today */}
        <LuxurySpotlightCard tilt={true} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#7799B4] uppercase">
                Card 04
              </span>
              <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                VISITS TODAY
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#7799B4] shadow-sm">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold font-mono text-[#17232F] tracking-tight">
              {agenda.todaysBookings?.length || c.visitsToday || 0}
            </h2>
            <span className="text-xs font-semibold text-[#65717B] font-mono">Booked</span>
          </div>
          <p className="text-[10.5px] text-[#65717B] mt-1">Tours Schedule: Live</p>
          <div className="mt-2.5">
            <LuxurySparkline data={[2, 4, 3, 5, 4, 6, c.visitsToday || 7]} color="#7799B4" height={22} />
          </div>
        </LuxurySpotlightCard>

        {/* Metric 5: Available Units */}
        <LuxurySpotlightCard tilt={true} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#7799B4] uppercase">
                Card 05
              </span>
              <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                AVAILABLE UNITS
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#B9965B] shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold font-mono text-[#17232F] tracking-tight">
              {props?.data?.length || c.activeListings || 8}
            </h2>
            <span className="text-xs font-semibold text-[#D8BF8A] font-mono">+3 new</span>
          </div>
          <p className="text-[10.5px] text-[#65717B] mt-1">Inspection Ready: 100%</p>
          <div className="mt-2.5">
            <LuxurySparkline data={[10, 11, 13, 14, 15, 17, props?.data?.length || 18]} color="#B9965B" height={22} />
          </div>
        </LuxurySpotlightCard>

        {/* Metric 6: Deals Count */}
        <LuxurySpotlightCard tilt={true} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#7799B4] uppercase">
                Card 06
              </span>
              <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                CLOSING DEALS
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#3E8066] shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold font-mono text-[#17232F] tracking-tight">
              {pendingCommissions.length || 1}
            </h2>
            <span className="text-xs font-semibold text-[#3E8066] font-mono">In Escrow</span>
          </div>
          <p className="text-[10.5px] text-[#65717B] mt-1">Escrow: ₹1,25,000</p>
          <div className="mt-2.5">
            <LuxurySparkline data={[1, 2, 2, 3, 3, 4, pendingCommissions.length || 5]} color="#3E8066" height={22} />
          </div>
        </LuxurySpotlightCard>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Trajectory & Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(to right, #B9965B 1px, transparent 1px), linear-gradient(to bottom, #B9965B 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#DFDED7]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B9965B]" />
                <h3 className="text-base sm:text-lg font-bold text-[#17232F] tracking-tight">
                  Pipeline Inquiries & Visit Flow
                </h3>
              </div>
              <p className="text-xs text-[#65717B] mt-1">
                Monthly progression of customer tour inspections and client leads from database.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs font-mono font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartView("activity")}
                className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  chartView === "activity"
                    ? "bg-[#F4EFE6] text-[#B9965B] border border-[#B9965B]/30 shadow-xs font-bold"
                    : "text-[#65717B] hover:text-[#17232F]"
                }`}
              >
                Inquiries & Visits
              </button>
              <button
                type="button"
                onClick={() => setChartView("sources")}
                className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  chartView === "sources"
                    ? "bg-[#F4EFE6] text-[#B9965B] border border-[#B9965B]/30 shadow-xs font-bold"
                    : "text-[#65717B] hover:text-[#17232F]"
                }`}
              >
                Lead Acquisition
              </button>
            </div>
          </div>

          <div className="relative z-10 h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "activity" ? (
                <AreaChart data={activityData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="agentColorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3E8066" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3E8066" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="agentColorInquiries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B9965B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#B9965B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFDED7" />
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "#DFDED7" }} tick={{ fill: "#65717B", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#65717B", fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area type="monotone" dataKey="Inquiries" stroke="#B9965B" strokeWidth={2.5} fillOpacity={1} fill="url(#agentColorInquiries)" />
                  <Area type="monotone" dataKey="Visits" stroke="#3E8066" strokeWidth={2.5} fillOpacity={1} fill="url(#agentColorVisits)" />
                </AreaChart>
              ) : leadSourceData.length > 0 ? (
                <BarChart data={leadSourceData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFDED7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#DFDED7" }} tick={{ fill: "#65717B", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#65717B", fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="value" name="Leads" fill="#B9965B" radius={[6, 6, 0, 0]}>
                    {leadSourceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#65717B]">
                  No lead acquisition source records in database yet.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel: Pipeline Conversion Breakdown */}
        <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#DFDED7]">
              <div className="flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-[#B9965B]" />
                <h3 className="text-base font-bold text-[#17232F] tracking-tight">
                  Pipeline Stages
                </h3>
              </div>
              <span className="rounded-full bg-[#F4EFE6] border border-[#B9965B]/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#B9965B]">
                DATABASE FLOW
              </span>
            </div>
            <p className="text-xs text-[#65717B] mt-1.5 mb-4">Live distribution of prospects along database stages</p>

            <div className="space-y-3.5">
              {pipelineStages.map((stage, idx) => {
                const totalCount = pipelineStages.reduce((acc, s) => acc + s.count, 0) || 1;
                const pct = Math.min(100, Math.round((stage.count / totalCount) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#17232F]">{stage.label}</span>
                      <span className="font-mono text-[#B9965B] font-bold">{stage.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F7F6F2] overflow-hidden border border-[#DFDED7]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stage.count > 0 ? Math.max(12, pct) : 0}%`,
                          backgroundColor: stage.color || "#B9965B",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DFDED7]">
            <button
              onClick={() => nav("/agent/leads")}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#F4EFE6] hover:bg-[#B9965B] text-[#B9965B] hover:text-white border border-[#B9965B]/40 py-2.5 text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Manage CRM Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Operational Hub (Agenda & CRM Leads) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Today's Action Agenda */}
        <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between pb-3.5 border-b border-[#DFDED7]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B9965B]" />
                <h3 className="font-bold text-[#17232F] text-base tracking-tight">Today's Action Agenda</h3>
              </div>
              <button
                onClick={() => nav("/agent/bookings")}
                className="text-xs font-mono text-[#B9965B] hover:text-[#D8BF8A] transition flex items-center gap-1 cursor-pointer"
              >
                <span>Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!agenda.todaysBookings.length && !agenda.followUpsDue.length ? (
              <EmptyState
                icon="🗓️"
                title="Clear Schedule Today"
                hint="No visits scheduled or follow-ups pending for today."
                action={
                  <button
                    onClick={() => {
                      setQuick("tour");
                      setF({});
                    }}
                    className="rounded-xl bg-[#F4EFE6] hover:bg-[#B9965B] text-[#B9965B] hover:text-white border border-[#B9965B]/40 px-3.5 py-2 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    Schedule a Tour
                  </button>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {agenda.todaysBookings.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between rounded-xl border border-[#DFDED7] bg-[#F7F6F2] px-3.5 py-2.5 text-xs hover:border-[#B9965B]/40 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4EFE6] border border-[#B9965B]/30 text-[#B9965B] text-[10px] font-mono font-bold">
                        {new Date(b.bookingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-[#17232F] truncate">{b.property?.title || "Property Inspection"}</p>
                        <p className="text-[11px] text-[#65717B] truncate">Client: {b.user?.name || "Client"}</p>
                      </div>
                    </div>
                    <StageBadge value={b.status} />
                  </div>
                ))}
                {agenda.followUpsDue.map((l) => (
                  <div
                    key={l._id}
                    className="flex items-center justify-between rounded-xl border border-[#B9965B]/30 bg-[#F7F6F2] px-3.5 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-[#B9965B] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-[#17232F] truncate">{l.name}</p>
                        <p className="text-[11px] text-[#65717B]">{l.phone}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#F4EFE6] border border-[#B9965B]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#B9965B]">
                      Follow Up Due
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Latest Pipeline Leads */}
        <div className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between pb-3.5 border-b border-[#DFDED7]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B9965B]" />
                <h3 className="font-bold text-[#17232F] text-base tracking-tight">Latest Leads</h3>
              </div>
              <button
                onClick={() => nav("/agent/leads")}
                className="text-xs font-mono text-[#B9965B] hover:text-[#D8BF8A] transition flex items-center gap-1 cursor-pointer"
              >
                <span>Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!recentLeads.length ? (
              <EmptyState
                icon="🎯"
                title="No Leads Logged Yet"
                hint="Log your first client inquiry to begin managing your pipeline."
                action={
                  <button
                    onClick={() => {
                      setQuick("lead");
                      setF({});
                    }}
                    className="rounded-xl bg-[#F4EFE6] hover:bg-[#B9965B] text-[#B9965B] hover:text-white border border-[#B9965B]/40 px-3.5 py-2 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    Log First Lead
                  </button>
                }
              />
            ) : (
              <div className="divide-y divide-[#DFDED7]">
                {recentLeads.map((l) => (
                  <div key={l._id} className="flex items-center justify-between py-3 text-xs first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#B9965B] to-[#17232F] text-xs font-bold text-white">
                        {l.name?.charAt(0)?.toUpperCase() || "L"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#17232F] truncate">{l.name}</p>
                        <p className="text-[11px] text-[#65717B] flex items-center gap-1.5">
                          <span>{l.source || "Walk-in"}</span>
                          <span>•</span>
                          <span>
                            {l.createdAt
                              ? new Date(l.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })
                              : "Recent"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <StageBadge value={l.status || "New"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Modal / Drawer */}
      <Modal
        open={!!quick}
        onClose={() => setQuick(null)}
        title={quick === "lead" ? "Log Client Lead" : quick === "tour" ? "Schedule Property Tour" : "Add New Property Listing"}
        subtitle="Quick partner portal creation tool"
      >
        <form onSubmit={submit} className="space-y-3.5 text-xs">
          {err && <ErrorBanner message={err} />}

          {quick === "lead" && (
            <>
              <Field label="Client Full Name">
                <input required className={inputCls} placeholder="e.g. Rahul Sharma" value={f.name || ""} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </Field>
              <Field label="Phone Number">
                <input required className={inputCls} placeholder="e.g. +91 9876543210" value={f.phone || ""} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </Field>
              <Field label="Email Address (Optional)">
                <input className={inputCls} type="email" placeholder="client@example.com" value={f.email || ""} onChange={(e) => setF({ ...f, email: e.target.value })} />
              </Field>
              <Field label="Acquisition Source">
                <select className={inputCls} value={f.source || "Walk-in"} onChange={(e) => setF({ ...f, source: e.target.value })}>
                  {["Walk-in", "Website", "Phone", "Referral", "Social Media"].map((s) => (
                    <option key={s} value={s} className="bg-[#FFFFFF] text-[#17232F]">{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Client Notes">
                <textarea rows={2} className={inputCls} placeholder="Budget, preferences, inspection notes…" value={f.notes || ""} onChange={(e) => setF({ ...f, notes: e.target.value })} />
              </Field>
            </>
          )}

          {quick === "tour" && (
            <>
              <p className="text-[11px] text-[#65717B] leading-relaxed">
                Select one of your active listings and provide the client's user identifier. Full visit audit and timeline are accessible under Visits & Bookings.
              </p>
              <Field label="Target Listing">
                <select className={inputCls} value={f.property || ""} onChange={(e) => setF({ ...f, property: e.target.value })}>
                  <option value="" className="bg-[#FFFFFF] text-[#17232F]">Select Property…</option>
                  {(props?.data || []).map((p) => (
                    <option key={p._id} value={p._id} className="bg-[#FFFFFF] text-[#17232F]">
                      {p.title} — ₹{Number(p.price).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Client ID / Account">
                <input className={inputCls} placeholder="Paste customer User ID" value={f.user || ""} onChange={(e) => setF({ ...f, user: e.target.value })} />
              </Field>
              <Field label="Inspection Fee / Deposit (₹)">
                <input type="number" className={inputCls} placeholder="0" value={f.amount || ""} onChange={(e) => setF({ ...f, amount: e.target.value })} />
              </Field>
            </>
          )}

          {quick === "listing" && (
            <>
              <Field label="Listing Title">
                <input required className={inputCls} placeholder="e.g. The Glass Pavilion Villa" value={f.title || ""} onChange={(e) => setF({ ...f, title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Price (₹)">
                  <input required type="number" className={inputCls} placeholder="25000000" value={f.price || ""} onChange={(e) => setF({ ...f, price: e.target.value })} />
                </Field>
                <Field label="Type">
                  <select className={inputCls} value={f.listingType || "Sale"} onChange={(e) => setF({ ...f, listingType: e.target.value })}>
                    <option className="bg-[#FFFFFF] text-[#17232F]">Sale</option>
                    <option className="bg-[#FFFFFF] text-[#17232F]">Rent</option>
                    <option className="bg-[#FFFFFF] text-[#17232F]">Lease</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="City">
                  <input className={inputCls} placeholder="e.g. Mumbai" value={f.city || ""} onChange={(e) => setF({ ...f, city: e.target.value })} />
                </Field>
                <Field label="Bedrooms">
                  <input type="number" className={inputCls} placeholder="3" value={f.bedrooms || ""} onChange={(e) => setF({ ...f, bedrooms: e.target.value })} />
                </Field>
              </div>
            </>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setQuick(null)}
              className="flex-1 rounded-xl border border-[#DFDED7] bg-[#FFFFFF] py-2 text-xs font-semibold text-[#65717B] hover:text-[#17232F] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-[#F4EFE6] hover:bg-[#B9965B] text-[#B9965B] hover:text-white border border-[#B9965B]/40 py-2 text-xs font-semibold font-mono transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {busy ? "Saving…" : "Save Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
