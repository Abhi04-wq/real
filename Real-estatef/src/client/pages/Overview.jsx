import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { client, useClientStore } from "../store";
import { StatusChip, Skeleton, EmptyState } from "../components/clientUi";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Building2,
  CalendarCheck,
  Heart,
  CreditCard,
  Sparkles,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  UserCheck,
  FileText,
  Compass,
  DollarSign,
  Clock,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Tag,
} from "lucide-react";
import LuxurySpotlightCard from "../../admin/components/LuxurySpotlightCard";
import LuxurySparkline from "../../admin/components/LuxurySparkline";

// Curated palette strictly adhering to the SuperAdmin gold light theme
const BRAND_PALETTE = [
  "#B9965B", // SuperAdmin gold
  "#71877B", // Sage
  "#7799B4", // Steel blue
  "#3E8066", // Success green
  "#B98235", // Warm amber
  "#65717B", // Muted slate
];

// Clean custom tooltip matching SuperAdmin gold light styling
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#DFDED7] bg-[#FFFFFF] px-3.5 py-2.5 shadow-[0_10px_30px_rgba(23,35,47,0.08)] text-xs">
        <p className="font-semibold text-[#17232F] mb-1">{label}</p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white bg-[#F4EFE6] text-[#B9965B]"
              style={{ backgroundColor: p.color || p.fill || p.stroke || "#B9965B" }}
            />
            <span className="text-[#65717B] font-medium capitalize">{p.name || "Value"}:</span>
            <span className="font-bold text-[#17232F] font-mono-numbers">
              {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const nav = useNavigate();
  const mode = useClientStore((s) => s.mode);
  const setMode = useClientStore((s) => s.setMode);
  const user = useClientStore((s) => s.user);

  const [recentTab, setRecentTab] = useState("bookings"); // "bookings" | "favorites" | "offers" | "transactions" | "listings"
  const [chartView, setChartView] = useState("Activity"); // "Activity" | "Tours" | "Saved"

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["client-overview"],
    queryFn: client.overview,
    retry: false,
  });

  const b = data?.buyer || { bookings: [], upcoming: 0, offers: [], activeOffers: 0, favorites: [] };
  const s = data?.seller || { listings: [], byStatus: [], pendingReview: 0 };
  const txList = data?.transactions || [];

  // Monthly activity trend (Last 6 Months)
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];

      const bookingsCount = (b?.bookings || []).filter((item) => {
        const itemDate = new Date(item.bookingDate || item.createdAt);
        return itemDate.getMonth() === d.getMonth();
      }).length;

      const favsCount = (b?.favorites || []).filter((item) => {
        const itemDate = new Date(item.createdAt || Date.now());
        return itemDate.getMonth() === d.getMonth();
      }).length;

      const listingsCount = (s?.listings || []).filter((item) => {
        const itemDate = new Date(item.createdAt || Date.now());
        return itemDate.getMonth() === d.getMonth();
      }).length;

      result.push({
        name: mName,
        Tours: bookingsCount,
        Saved: favsCount,
        Listings: listingsCount,
        Activity: bookingsCount + favsCount + listingsCount,
      });
    }
    return result;
  }, [b, s]);

  // Distribution chart data
  const statusPieData = useMemo(() => {
    if (mode === "buying") {
      const confirmed = (b?.bookings || []).filter((x) => x.status === "Confirmed").length;
      const pending = (b?.bookings || []).filter((x) => x.status === "Pending").length;
      const completed = (b?.bookings || []).filter((x) => x.status === "Completed").length;
      const saved = (b?.favorites || []).length;

      const res = [
        { name: "Confirmed Tours", value: confirmed },
        { name: "Pending Tours", value: pending },
        { name: "Completed Tours", value: completed },
        { name: "Saved Residences", value: saved },
      ].filter((x) => x.value > 0);

      return res.length > 0
        ? res
        : [
            { name: "Saved Residences", value: Math.max(saved, 1) },
            { name: "Scheduled Visits", value: 1 },
          ];
    } else {
      const available = (s?.listings || []).filter((x) => x.status === "Available").length;
      const pendingReview = s?.pendingReview || 0;
      const closed = (s?.listings || []).filter((x) => ["Sold", "Rented"].includes(x.status)).length;
      const res = [
        { name: "Active Available", value: available },
        { name: "Pending Review", value: pendingReview },
        { name: "Sold / Rented", value: closed },
      ].filter((x) => x.value > 0);

      return res.length > 0 ? res : [{ name: "Inventory", value: 1 }];
    }
  }, [mode, b, s]);

  // Valuation computations
  const favoritesValuation = useMemo(() => {
    return (b?.favorites || []).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  }, [b]);

  const listingsValuation = useMemo(() => {
    return (s?.listings || []).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  }, [s]);

  const uniqueCitiesCount = useMemo(() => {
    const set = new Set();
    (b?.favorites || []).forEach((f) => f.city && set.add(f.city));
    (b?.bookings || []).forEach((bk) => bk.property?.city && set.add(bk.property.city));
    return set.size || 1;
  }, [b]);

  const totalSpent = useMemo(() => {
    return txList.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
  }, [txList]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-80" />
          <Skeleton className="lg:col-span-4 h-80" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon="⚠️"
        title="Couldn't load client overview"
        hint="The client service encountered a connection issue. Please make sure you are logged in and retry."
        action={
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-[#B9965B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a6844d] transition cursor-pointer shadow-sm"
          >
            Retry Connection
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 text-left selection:bg-[#B9965B]/20 selection:text-[#17232F]">
      {/* Top Welcome & Interactive Controls Bar — same white header type as Super Admin dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden"
      >
        {/* Subtle Architectural Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#17232F 1px, transparent 1px), linear-gradient(to right, #DFDED7 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EF] border border-[#71877B]/30 text-[#3E8066] font-mono text-[11px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E8066] animate-pulse" />
              ● CLIENT HUB CONSOLE
            </span>
            <span className="text-[11px] font-mono text-[#65717B] border-l border-[#DFDED7] pl-3 hidden sm:inline">
              ACTIVE SESSION • REAL ESTATE OS v5.2
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17232F]">
            {mode === "selling" ? "Seller Hub Portfolio & Inquiries" : "Buyer Hub Portfolio & Scheduled Visits"}
          </h1>
          <p className="text-xs sm:text-sm text-[#65717B] mt-0.5 max-w-3xl leading-relaxed">
            Real-time tracking of saved residences, architectural tour visits, offer negotiations, and deposits.
          </p>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setMode("buying")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                mode === "buying"
                  ? "bg-white text-[#B9965B] font-bold shadow-xs border border-[#DFDED7]"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => setMode("selling")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                mode === "selling"
                  ? "bg-white text-[#B9965B] font-bold shadow-xs border border-[#DFDED7]"
                  : "text-[#65717B] hover:text-[#17232F]"
              }`}
            >
              Seller Hub
            </button>
          </div>

          {/* Quick Explore Link */}
          <button
            onClick={() => nav("/properties")}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#a6844d] transition shadow-xs cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" /> Explore Properties
          </button>

          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh metrics"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-white hover:text-[#B9965B] hover:border-[#B9965B]/40 shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#B9965B]" : ""}`} />
          </button>
        </div>
        </div>
      </motion.div>

      {/* Primary KPI Metrics Grid - 6 3D Skeuomorphic & Transparent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {mode === "buying" ? (
          <>
            {/* Metric 1: Saved Properties */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.02 }}
              onClick={() => nav("/home/favorites")}
              className="cursor-pointer"
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 01 • Wishlist
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      SAVED WISHLIST
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#B9965B] shadow-2xs">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {b.favorites.length}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    {favoritesValuation > 0 ? `₹${(favoritesValuation / 10000000).toFixed(1)} Cr` : "Active"}
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Valuation • Curated Residences</p>
                <div className="mt-3">
                  <LuxurySparkline data={[5, 8, 7, 10, 12, 14, b.favorites.length || 15]} color="#B9965B" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Metric 2: Scheduled Tours */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 }}
              onClick={() => nav("/home/my-bookings")}
              className="cursor-pointer"
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 02 • Tours
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      TOUR VISITS
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#B9965B] shadow-2xs">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {b.bookings.length}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    {b.upcoming || 0} upcoming
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Scheduled • Site Walkthroughs</p>
                <div className="mt-3">
                  <LuxurySparkline data={[2, 3, 5, 4, 6, 7, b.bookings.length || 8]} color="#B9965B" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Metric 3: Active Offers */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 03 • Proposals
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      OFFERS & BIDS
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#FDF5E6] border border-[#B98235]/30 flex items-center justify-center text-[#B98235] shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {b.offers?.length || 0}
                  </h2>
                  <span className="text-xs font-bold text-[#B98235] font-mono">
                    {b.activeOffers || 0} active
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Proposals • Deal Negotiations</p>
                <div className="mt-3">
                  <LuxurySparkline data={[1, 2, 2, 3, 4, 3, b.offers?.length || 4]} color="#B98235" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Metric 4: Transactions & Deposits */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.14 }}
              onClick={() => nav("/home/transactions")}
              className="cursor-pointer"
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 04 • Ledger
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      DEPOSITS LEDGER
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#F7F6F2] border border-[#DFDED7] flex items-center justify-center text-[#17232F] shadow-2xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    ₹{Number(totalSpent || 0).toLocaleString("en-IN")}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    {txList.length} entries
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Settled • Escrow Protected</p>
                <div className="mt-3">
                  <LuxurySparkline data={[15, 20, 25, 30, 35, 40, 48]} color="#17232F" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Metric 5: Explored Locales */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 05 • Locales
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      EXPLORED LOCALES
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#EEF3F7] border border-[#7799B4]/30 flex items-center justify-center text-[#7799B4] shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {uniqueCitiesCount}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    Top Tier
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Corridors • Verified Sub-Markets</p>
                <div className="mt-3">
                  <LuxurySparkline data={[2, 3, 4, 4, 5, 6, uniqueCitiesCount || 7]} color="#7799B4" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Metric 6: Client Tier */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.22 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 06 • Tier
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      CLIENT STATUS
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    Verified
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    Priority
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">VIP tier • Full Access Pass</p>
                <div className="mt-3">
                  <LuxurySparkline data={[10, 12, 14, 16, 18, 20, 22]} color="#3E8066" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>
          </>
        ) : (
          <>
            {/* Seller Metric 1: My Listings */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.02 }}
              onClick={() => nav("/home/my-properties")}
              className="cursor-pointer"
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 01 • Inventory
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      MY PROPERTIES
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#B9965B] shadow-2xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {s.listings.length}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Inventory • Total Portfolio</p>
                <div className="mt-3">
                  <LuxurySparkline data={[1, 2, 3, 4, 5, 6, s.listings.length || 7]} color="#B9965B" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Seller Metric 2: Live Available */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 02 • Market
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      ACTIVE ON MARKET
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {s.listings.filter((p) => p.status === "Available").length}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    Public
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Visible • Inspection Ready</p>
                <div className="mt-3">
                  <LuxurySparkline data={[1, 1, 2, 3, 3, 4, 5]} color="#3E8066" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Seller Metric 3: Pending Review */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 03 • Queue
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      PENDING REVIEW
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#FDF5E6] border border-[#B98235]/30 flex items-center justify-center text-[#B98235] shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {s.pendingReview || 0}
                  </h2>
                  <span className="text-xs font-bold text-[#B98235] font-mono">
                    Moderation
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">In queue • Compliance SLA &lt; 24h</p>
                <div className="mt-3">
                  <LuxurySparkline data={[0, 1, 1, 2, 1, 2, s.pendingReview || 2]} color="#B98235" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Seller Metric 4: Portfolio Valuation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.14 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 04 • Valuation
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      COMBINED VALUE
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#B9965B]/30 flex items-center justify-center text-[#B9965B] shadow-2xs">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#B9965B] tracking-tight">
                    {listingsValuation > 0 ? `₹${(listingsValuation / 10000000).toFixed(1)} Cr` : "0"}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    +5.4%
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Market app. • Asking Valuation</p>
                <div className="mt-3">
                  <LuxurySparkline data={[20, 25, 30, 35, 40, 45, 50]} color="#B9965B" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Seller Metric 5: Deals Completed */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 05 • Exits
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      SOLD / LEASED
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    {s.listings.filter((p) => ["Sold", "Rented"].includes(p.status)).length}
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    Closed
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Deals • Successful Exits</p>
                <div className="mt-3">
                  <LuxurySparkline data={[0, 1, 1, 2, 2, 3, 4]} color="#3E8066" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>

            {/* Seller Metric 6: Seller Role */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.22 }}
            >
              <LuxurySpotlightCard tilt={true} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65717B] uppercase">
                      Card 06 • Role
                    </span>
                    <p className="text-xs font-bold font-mono tracking-wider text-[#65717B] uppercase mt-0.5">
                      SELLER STATUS
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] border border-[#71877B]/30 flex items-center justify-center text-[#3E8066] shadow-2xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17232F] tracking-tight">
                    Direct Owner
                  </h2>
                  <span className="text-xs font-bold text-[#3E8066] font-mono">
                    KYC Done
                  </span>
                </div>
                <p className="text-[11px] text-[#65717B] mt-1">Verified • Direct Representation</p>
                <div className="mt-3">
                  <LuxurySparkline data={[8, 10, 12, 14, 16, 18, 20]} color="#3E8066" height={26} />
                </div>
              </LuxurySpotlightCard>
            </motion.div>
          </>
        )}
      </div>

      {/* Interactive Visual Analytics Grid (AreaChart & Distribution Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Engagement Trend AreaChart — same white panel type as Super Admin */}
        <div className="lg:col-span-8 rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B9965B]" />
                <h2 className="text-base font-bold text-[#17232F]">
                  {mode === "buying" ? "Tour & Wishlist Activity Timeline" : "Portfolio Listing & Inquiries Timeline"}
                </h2>
              </div>
              <p className="text-xs text-[#65717B] mt-0.5">
                Visual analysis of interaction volume and monthly schedule cadence.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs font-semibold shadow-2xs">
              {["Activity", "Tours", "Saved"].map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                    chartView === v
                      ? "bg-white text-[#B9965B] font-bold shadow-xs border border-[#DFDED7]"
                      : "text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B9965B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#B9965B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFDED7" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#65717B" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#65717B" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey={chartView}
                  stroke="#B9965B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Portfolio Breakdown PieChart — same white panel type as Super Admin */}
        <div className="lg:col-span-4 rounded-2xl border border-[#DFDED7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,35,47,0.03)] flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B9965B]" />
              <h2 className="text-base font-bold text-[#17232F]">
                {mode === "buying" ? "Engagement Breakdown" : "Listing Status Distribution"}
              </h2>
            </div>
            <p className="text-xs text-[#65717B] mt-0.5">
              Portfolio dispersion across categories and booking statuses.
            </p>

            <div className="h-52 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_PALETTE[index % BRAND_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 border-t border-[#DFDED7] pt-3.5 space-y-1.5">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#65717B]">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: BRAND_PALETTE[idx % BRAND_PALETTE.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-bold text-[#17232F] font-mono-numbers">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Tabs Card — same white panel type as Super Admin */}
      <div className="rounded-2xl border border-[#DFDED7] bg-white shadow-[0_2px_12px_rgba(23,35,47,0.03)] overflow-hidden">
        {/* Tab Navigation Bar */}
        <div className="border-b border-[#DFDED7] bg-[#F7F6F2] px-6 pt-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto pb-px">
            {mode === "buying" ? (
              <>
                <button
                  onClick={() => setRecentTab("bookings")}
                  className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    recentTab === "bookings"
                      ? "border-[#B9965B] text-[#B9965B]"
                      : "border-transparent text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  📅 Upcoming Tours ({b.bookings.length})
                </button>
                <button
                  onClick={() => setRecentTab("favorites")}
                  className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    recentTab === "favorites"
                      ? "border-[#B9965B] text-[#B9965B]"
                      : "border-transparent text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  ❤️ Saved Properties ({b.favorites.length})
                </button>
                <button
                  onClick={() => setRecentTab("offers")}
                  className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    recentTab === "offers"
                      ? "border-[#B9965B] text-[#B9965B]"
                      : "border-transparent text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  💼 My Offers ({b.offers?.length || 0})
                </button>
                <button
                  onClick={() => setRecentTab("transactions")}
                  className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    recentTab === "transactions"
                      ? "border-[#B9965B] text-[#B9965B]"
                      : "border-transparent text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  💳 Transactions ({txList.length})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setRecentTab("listings")}
                  className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    recentTab === "listings"
                      ? "border-[#B9965B] text-[#B9965B]"
                      : "border-transparent text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  🏢 My Listed Inventory ({s.listings.length})
                </button>
                <button
                  onClick={() => setRecentTab("transactions")}
                  className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    recentTab === "transactions"
                      ? "border-[#B9965B] text-[#B9965B]"
                      : "border-transparent text-[#65717B] hover:text-[#17232F]"
                  }`}
                >
                  💳 Settlement Ledger ({txList.length})
                </button>
              </>
            )}
          </div>

          <div className="pb-3">
            {recentTab === "bookings" && (
              <button
                onClick={() => nav("/home/my-bookings")}
                className="text-xs font-semibold text-[#B9965B] hover:text-[#a6844d] transition flex items-center gap-1"
              >
                View all tours <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            {recentTab === "favorites" && (
              <button
                onClick={() => nav("/home/favorites")}
                className="text-xs font-semibold text-[#B9965B] hover:text-[#a6844d] transition flex items-center gap-1"
              >
                View all saved <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            {recentTab === "listings" && (
              <button
                onClick={() => nav("/home/my-properties")}
                className="text-xs font-semibold text-[#B9965B] hover:text-[#a6844d] transition flex items-center gap-1"
              >
                Manage all listings <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-6">
          {recentTab === "bookings" && (
            <div className="space-y-3">
              {b.bookings.slice(0, 5).map((bk) => (
                <div
                  key={bk._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#DFDED7] hover:border-[#B9965B]/40 hover:bg-[#F9F8F5] bg-white transition-all shadow-2xs gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={
                        bk.property?.images?.[0] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={bk.property?.title}
                      className="w-14 h-14 rounded-lg object-cover border shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#17232F] truncate">
                        {bk.property?.title || "Signature Residence Tour"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#65717B]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#B9965B]" /> {bk.property?.city || "Location Pending"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono-numbers">
                          <Clock className="w-3 h-3 text-[#65717B]" />{" "}
                          {new Date(bk.bookingDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {bk.agent?.name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#B9965B] font-medium">
                              <UserCheck className="w-3 h-3" /> Agent: {bk.agent.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <StatusChip value={bk.status === "Pending" ? "Pending Approval" : bk.status} />
                    {bk.property?._id && (
                      <Link
                        to={`/property/${bk.property._id}`}
                        className="p-2 rounded-lg border border-[#DFDED7] hover:bg-[#F9F8F5] text-[#17232F] transition"
                        title="View Property Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {!b.bookings.length && (
                <EmptyState
                  icon="📅"
                  title="No tour bookings yet"
                  hint="Schedule private architectural walkthroughs with our senior portfolio advisors."
                  action={
                    <button
                      onClick={() => nav("/properties")}
                      className="rounded-xl bg-[#B9965B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a6844d] transition cursor-pointer shadow-xs"
                    >
                      Browse Residences
                    </button>
                  }
                />
              )}
            </div>
          )}

          {recentTab === "favorites" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {b.favorites.slice(0, 6).map((fav) => (
                <div
                  key={fav._id || fav.id}
                  onClick={() => nav(`/property/${fav._id || fav.id}`)}
                  className="group rounded-xl border border-[#DFDED7] hover:border-[#B9965B] bg-white overflow-hidden transition-all shadow-2xs cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F6F2]">
                    <img
                      src={
                        fav.images?.[0] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={fav.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold uppercase text-[#17232F]">
                        {fav.status || "Available"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#65717B] flex items-center gap-1 font-medium mb-1">
                      <MapPin className="w-3 h-3 text-[#B9965B]" /> {fav.city || "Prime Location"}
                    </p>
                    <h4 className="font-bold text-sm text-[#17232F] line-clamp-1 group-hover:text-[#B9965B] transition">
                      {fav.title}
                    </h4>
                    <div className="mt-3 pt-2.5 border-t border-[#DFDED7] flex items-center justify-between">
                      <span className="text-sm font-bold text-[#B9965B] font-mono-numbers">
                        {fav.price ? `₹${Number(fav.price).toLocaleString("en-IN")}` : "Price Upon Request"}
                      </span>
                      <span className="text-xs font-semibold text-[#65717B] flex items-center gap-1 group-hover:text-[#17232F]">
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {!b.favorites.length && (
                <div className="col-span-full">
                  <EmptyState
                    icon="❤️"
                    title="No saved properties"
                    hint="Explore available properties and tap the heart icon to save your preferred residences."
                    action={
                      <button
                        onClick={() => nav("/properties")}
                        className="rounded-xl bg-[#B9965B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a6844d] transition cursor-pointer shadow-xs"
                      >
                        Explore Catalog
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          )}

          {recentTab === "offers" && (
            <div className="space-y-3">
              {(b.offers || []).slice(0, 5).map((off) => (
                <div
                  key={off._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#DFDED7] bg-white text-xs"
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#17232F]">
                      {off.property?.title || "Property Offer"}
                    </h4>
                    <p className="text-[#65717B] mt-0.5">
                      Submitted Offer: <strong className="text-[#B9965B] font-mono-numbers">₹{Number(off.offerAmount || 0).toLocaleString("en-IN")}</strong>
                    </p>
                  </div>
                  <StatusChip value={off.status} />
                </div>
              ))}

              {(!b.offers || !b.offers.length) && (
                <EmptyState
                  icon="💼"
                  title="No active offers submitted"
                  hint="When you negotiate or submit offers on listed residences, their status will appear here."
                  action={
                    <button
                      onClick={() => nav("/properties")}
                      className="rounded-xl bg-[#B9965B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a6844d] transition cursor-pointer shadow-xs"
                    >
                      Find Residences
                    </button>
                  }
                />
              )}
            </div>
          )}

          {recentTab === "transactions" && (
            <div className="space-y-3">
              {txList.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#DFDED7] bg-white text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F4EFE6] text-[#B9965B] flex items-center justify-center font-bold">
                      ₹
                    </div>
                    <div>
                      <h4 className="font-bold text-[#17232F] capitalize">
                        {tx._id || "Settled"} Transaction
                      </h4>
                      <p className="text-[#65717B]">{tx.count} payments logged</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#17232F] font-mono-numbers block">
                      ₹{Number(tx.total || 0).toLocaleString("en-IN")}
                    </span>
                    <StatusChip value={tx._id || "Paid"} />
                  </div>
                </div>
              ))}

              {!txList.length && (
                <EmptyState
                  icon="💳"
                  title="No payments or deposits on record"
                  hint="Token booking deposits and ledger transactions will be securely logged here."
                />
              )}
            </div>
          )}

          {recentTab === "listings" && (
            <div className="space-y-3">
              {s.listings.slice(0, 6).map((p) => (
                <div
                  key={p._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#DFDED7] bg-white text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        p.images?.[0] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={p.title}
                      className="w-12 h-12 rounded-lg object-cover border shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#17232F] truncate">{p.title}</h4>
                      <p className="text-[#65717B] mt-0.5">
                        {p.city} • <span className="font-mono-numbers font-semibold text-[#B9965B]">₹{Number(p.price || 0).toLocaleString("en-IN")}</span>
                        {p.propertyId && ` • Code: ${p.propertyId}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusChip value={p.approvalStatus === "pending" ? "Pending Review" : p.status} />
                    <button
                      onClick={() => nav(`/home/my-properties`)}
                      className="p-1.5 rounded-lg border border-[#DFDED7] hover:bg-[#F9F8F5] text-[#17232F]"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {!s.listings.length && (
                <EmptyState
                  icon="🏢"
                  title="No properties listed yet"
                  hint="List your residence for sale or lease to reach pre-verified buyers."
                  action={
                    <button
                      onClick={() => nav("/home/my-properties")}
                      className="rounded-xl bg-[#B9965B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a6844d] transition cursor-pointer shadow-xs"
                    >
                      Post New Listing
                    </button>
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Navigation Grid (Executive Portal Dock - 3D Frosted Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div
          onClick={() => nav("/properties")}
          className="rounded-[22px] p-[2px] bg-gradient-to-b from-white/90 via-white/50 to-black/15 shadow-[0_12px_28px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer group"
        >
          <div className="rounded-[20px] bg-gradient-to-b from-white/80 via-white/55 to-white/35 backdrop-blur-xl p-5 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#F4EFE6] text-[#B9965B] shadow-2xs">
                <Compass className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#65717B] group-hover:text-[#B9965B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17232F]">Explore Residences</h3>
              <p className="text-xs text-[#65717B] mt-1 leading-relaxed">
                Search our curated architectural monographs and luxury inventory.
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => nav("/home/my-bookings")}
          className="rounded-[22px] p-[2px] bg-gradient-to-b from-white/90 via-white/50 to-black/15 shadow-[0_12px_28px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer group"
        >
          <div className="rounded-[20px] bg-gradient-to-b from-white/80 via-white/55 to-white/35 backdrop-blur-xl p-5 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#F4EFE6] text-[#B9965B] shadow-2xs">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#65717B] group-hover:text-[#B9965B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17232F]">My Scheduled Tours</h3>
              <p className="text-xs text-[#65717B] mt-1 leading-relaxed">
                Manage your scheduled walkthroughs, dates, and assigned agent contacts.
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => nav("/home/favorites")}
          className="rounded-[22px] p-[2px] bg-gradient-to-b from-white/90 via-white/50 to-black/15 shadow-[0_12px_28px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer group"
        >
          <div className="rounded-[20px] bg-gradient-to-b from-white/80 via-white/55 to-white/35 backdrop-blur-xl p-5 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#F4EFE6] text-[#B9965B] shadow-2xs">
                <Heart className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#65717B] group-hover:text-[#B9965B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17232F]">Saved Wishlist</h3>
              <p className="text-xs text-[#65717B] mt-1 leading-relaxed">
                Review and compare residences saved across your desktop and mobile devices.
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => nav("/home/profile")}
          className="rounded-[22px] p-[2px] bg-gradient-to-b from-white/90 via-white/50 to-black/15 shadow-[0_12px_28px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer group"
        >
          <div className="rounded-[20px] bg-gradient-to-b from-white/80 via-white/55 to-white/35 backdrop-blur-xl p-5 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#F4EFE6] text-[#B9965B] shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#65717B] group-hover:text-[#B9965B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17232F]">Preferences & Profile</h3>
              <p className="text-xs text-[#65717B] mt-1 leading-relaxed">
                Configure matching criteria, notification channels, and account security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
