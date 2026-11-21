import { useEffect, useState, useMemo } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Heart,
  CalendarCheck,
  Building2,
  Inbox,
  Receipt,
  User,
  Bell,
  Search,
  LogOut,
  PanelLeft,
  Menu,
  X,
  ChevronsUpDown,
  Sparkles,
  ArrowUpRight,
  Compass,
  Plus,
} from "lucide-react";
import api from "../lib/adminApi";
import { client, useClientStore } from "./store";
import LuxuryAmbientParticles from "../admin/components/LuxuryAmbientParticles";

export default function ClientLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const user = useClientStore((s) => s.user);
  const mode = useClientStore((s) => s.mode);
  const setMode = useClientStore((s) => s.setMode);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("client_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("client_sidebar_collapsed", String(next));
      } catch { }
      return next;
    });
  };

  const [q, setQ] = useState("");
  const [showBell, setShowBell] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [settings, setSettings] = useState(null);

  // Settings sync for dynamic agency logo & name
  useEffect(() => {
    const fetchSettings = () => {
      api
        .get("/settings")
        .then(({ data }) => {
          if (data?.settings) setSettings(data.settings);
        })
        .catch(() => { });
    };
    fetchSettings();

    const handleSettingsUpdated = (e) => {
      if (e?.detail) setSettings(e.detail);
      else fetchSettings();
    };
    window.addEventListener("agency-settings-updated", handleSettingsUpdated);
    return () => window.removeEventListener("agency-settings-updated", handleSettingsUpdated);
  }, []);

  // Notifications query
  const { data: notifData } = useQuery({
    queryKey: ["client-notifs"],
    queryFn: () => api.get("/notifications?limit=8").then((r) => r.data).catch(() => ({ docs: [], unreadCount: 0 })),
    refetchInterval: 60000,
  });
  const unread = notifData?.unreadCount || 0;

  // Live client overview stats to power sidebar badges & snapshots
  const { data: overviewData } = useQuery({
    queryKey: ["client-sidebar-overview"],
    queryFn: client.overview,
    staleTime: 30000,
    retry: false,
  });

  const buyerData = overviewData?.buyer || { bookings: [], upcoming: 0, offers: [], activeOffers: 0, favorites: [] };
  const sellerData = overviewData?.seller || { listings: [], byStatus: [], pendingReview: 0 };

  const savedCount = buyerData.favorites?.length || 0;
  const toursCount = buyerData.upcoming || buyerData.bookings?.length || 0;
  const listingsCount = sellerData.listings?.length || 0;
  const leadsCount = sellerData.pendingReview || 0;

  const BUYER_LINKS = useMemo(() => [
    { label: "Dashboard", to: "/home/dashboard", icon: LayoutDashboard },
    { label: "Saved Properties", to: "/home/favorites", icon: Heart, badge: savedCount > 0 ? savedCount : null },
    { label: "My Bookings", to: "/home/my-bookings", icon: CalendarCheck, badge: toursCount > 0 ? toursCount : null },
    { label: "Transactions", to: "/home/transactions", icon: Receipt },
    { label: "Profile & Settings", to: "/home/profile", icon: User },
  ], [savedCount, toursCount]);

  const SELLER_LINKS = useMemo(() => [
    { label: "Dashboard", to: "/home/dashboard", icon: LayoutDashboard },
    { label: "My Properties", to: "/home/my-properties", icon: Building2, badge: listingsCount > 0 ? listingsCount : null },
    { label: "Visit Requests", to: "/home/seller-leads", icon: Inbox, badge: leadsCount > 0 ? leadsCount : null },
    { label: "Transactions", to: "/home/transactions", icon: Receipt },
    { label: "Profile & Settings", to: "/home/profile", icon: User },
  ], [listingsCount, leadsCount]);

  const activeLinks = mode === "selling" ? SELLER_LINKS : BUYER_LINKS;

  const logout = async () => {
    await api.post("/auth/logout").catch(() => { });
    localStorage.removeItem("admin_token");
    nav("/login");
  };

  const go = (m) => {
    setMode(m);
    nav("/home/dashboard");
  };

  const crumbs = loc.pathname.split("/").filter(Boolean).slice(1);
  const pageTitle = crumbs.length ? crumbs[crumbs.length - 1].replace(/-/g, " ") : "Dashboard";

  const handleSearchSubmit = () => {
    if (!q.trim()) return;
    if (mode === "selling") nav(`/home/my-properties?search=${encodeURIComponent(q.trim())}`);
    else nav(`/properties?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="relative min-h-screen bg-[#F7F6F2] text-[#17232F] font-sans selection:bg-[#B9965B]/20 selection:text-[#17232F]">
      <LuxuryAmbientParticles count={30} />

      <div className="relative z-10 flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`sticky top-0 hidden h-screen shrink-0 flex-col justify-between py-3 pl-3 pr-1 md:py-3.5 md:pl-4 md:pr-1.5 transition-all duration-300 ease-in-out md:flex z-30 ${collapsed ? "w-[72px]" : "w-64"
            }`}
        >
          {/* Brand */}
          <div className="space-y-3">
            <div
              onClick={() => nav("/home/dashboard")}
              className={`flex items-center rounded-xl p-1.5 hover:bg-black/[0.03] transition cursor-pointer select-none ${collapsed ? "justify-center" : "gap-2.5 justify-between"
                }`}
              title="PrimeNest Client Console"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#17232F] text-white shadow-xs">
                  {settings?.logo ? (
                    <img
                      src={settings.logo}
                      alt={settings.companyName || "Logo"}
                      className="h-5 w-5 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 className="h-4.5 w-4.5 text-[#D8BF8A]" />
                  )}
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold tracking-tight text-[#17232F]">
                        {settings?.companyName || "PrimeNest"}
                      </p>
                      <span className="rounded bg-[#F4EFE6] px-1 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider text-[#B9965B] border border-[#B9965B]/30">
                        {mode === "selling" ? "Seller" : "Buyer"}
                      </span>
                    </div>
                    <p className="truncate text-[10.5px] font-medium text-[#65717B]">
                      Customer Workspace
                    </p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <ChevronsUpDown className="h-3.5 w-3.5 text-[#929A9D] shrink-0" />
              )}
            </div>

            {/* Buyer Hub / Seller Hub switcher — SuperAdmin light segmented type */}
            {!collapsed ? (
              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B]">Active Workspace</span>
                  <span className="text-[10px] font-bold text-[#B9965B] capitalize">{mode} Mode</span>
                </div>
                <div className="flex items-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1">
                  <button
                    type="button"
                    onClick={() => go("buying")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${mode === "buying"
                      ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold"
                      : "text-[#65717B] hover:text-[#17232F] border border-transparent"
                      }`}
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Buyer Hub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go("selling")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${mode === "selling"
                      ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold"
                      : "text-[#65717B] hover:text-[#17232F] border border-transparent"
                      }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Seller Hub</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => go(mode === "buying" ? "selling" : "buying")}
                  title={`Active: ${mode === "buying" ? "Buyer Hub" : "Seller Hub"} (Click to switch)`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-xs font-bold text-[#B9965B] shadow-xs hover:border-[#B9965B]/50 hover:bg-white transition cursor-pointer"
                >
                  {mode === "buying" ? "B" : "S"}
                </button>
              </div>
            )}
          </div>

          {/* Scrollable: snapshot + navigation + concierge */}
          <div className="flex-1 overflow-y-auto py-3 space-y-5 scrollbar-none">
            {/* Portfolio snapshot widget — light */}
            {!collapsed && (
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#65717B]">
                    {mode === "selling" ? "Portfolio Metrics" : "Engagement Stats"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#B9965B] bg-[#F4EFE6] border border-[#B9965B]/30 px-1.5 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B9965B] animate-pulse" />
                    Live Sync
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {mode === "selling" ? (
                    <>
                      <div className="rounded-xl border border-[#DFDED7] bg-white p-2">
                        <p className="text-[10px] text-[#65717B] font-medium">Properties</p>
                        <p className="text-base font-bold text-[#17232F]">{listingsCount}</p>
                      </div>
                      <div className="rounded-xl border border-[#DFDED7] bg-white p-2">
                        <p className="text-[10px] text-[#65717B] font-medium">Inquiries</p>
                        <p className="text-base font-bold text-[#17232F]">{leadsCount}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-[#DFDED7] bg-white p-2">
                        <p className="text-[10px] text-[#65717B] font-medium">Saved Homes</p>
                        <p className="text-base font-bold text-[#17232F]">{savedCount}</p>
                      </div>
                      <div className="rounded-xl border border-[#DFDED7] bg-white p-2">
                        <p className="text-[10px] text-[#65717B] font-medium">Tour Visits</p>
                        <p className="text-base font-bold text-[#17232F]">{toursCount}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation — standard single-NavLink-per-item pattern */}
            <div>
              {!collapsed && (
                <p className="px-3 text-[11px] font-mono font-bold tracking-wider text-[#929A9D] uppercase mb-1.5">
                  Workspace Controls
                </p>
              )}
              {activeLinks.map(({ label, to, icon: Icon, badge }) => {
                const isActive = to === "/home/dashboard" ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/home/dashboard"}
                    title={collapsed ? label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer overflow-hidden ${isActive
                      ? "bg-transparent text-[#17232F] font-bold border border-[#17232F] shadow-xs"
                      : "border border-transparent text-[#65717B] hover:bg-black/[0.04] hover:text-[#17232F] font-medium"
                      } ${collapsed ? "justify-center px-0 py-2.5" : ""}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="clientActiveNavNotch"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-md bg-gradient-to-b from-[#E6C687] via-[#B9965B] to-[#99773E] shadow-[0_0_10px_rgba(230,198,135,0.85)]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                        ? "text-[#B9965B] scale-105"
                        : "text-[#65717B] group-hover:text-[#17232F] group-hover:scale-105"
                        }`}
                    />
                    {!collapsed && (
                      <span className={`truncate tracking-normal text-sm flex-1 ${isActive ? "text-[#17232F] font-bold" : "font-medium"}`}>
                        {label}
                      </span>
                    )}
                    {!collapsed && badge ? (
                      <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-[#B9965B] text-[10px] font-bold text-white shadow-2xs font-mono">
                        {badge}
                      </span>
                    ) : null}
                    {collapsed && badge ? (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#B9965B] text-[9px] font-bold text-white shadow-xs font-mono">
                        {badge}
                      </span>
                    ) : null}
                    {collapsed && isActive && !badge && (
                      <div className="absolute right-1.5 h-1.5 w-1.5 rounded-full bg-[#B9965B] shadow-[0_0_6px_rgba(185,150,91,0.8)]" />
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Concierge card — SuperAdmin light type */}
            {!collapsed && (
              <div className="rounded-2xl border border-[#DFDED7] bg-white p-3.5 shadow-xs relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-6 w-6 rounded-lg bg-[#F7F6F2] flex items-center justify-center border border-[#DFDED7]">
                    <Sparkles className="h-3.5 w-3.5 text-[#B9965B]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B9965B]">Prime Concierge</span>
                </div>
                <p className="text-xs font-semibold text-[#17232F]">Dedicated Real Estate Advisory</p>
                <p className="text-[10.5px] text-[#65717B] mt-0.5">Need customized assistance with listings or offers?</p>
                <button
                  type="button"
                  onClick={() => nav("/home/profile")}
                  className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Client Settings</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Footer profile */}
          <div className="space-y-2 pt-2.5 border-t border-[#DFDED7]/70">
            {user && (
              <div
                className={`flex items-center rounded-xl p-1.5 transition ${collapsed ? "justify-center" : "justify-between gap-2 hover:bg-black/[0.03]"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || "Client"}
                      className="h-7 w-7 shrink-0 rounded-lg object-cover border border-[#DFDED7]"
                    />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#17232F] text-xs font-semibold text-white">
                      {(user.name?.[0] || user.email?.[0] || "C").toUpperCase()}
                    </div>
                  )}
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#17232F]" title={user.name || user.email}>
                        {user.name || user.email}
                      </p>
                      <p className="truncate text-[10px] text-[#929A9D] font-mono uppercase">
                        {mode === "selling" ? "Seller" : "Buyer"}
                      </p>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1 rounded-lg text-[#929A9D] hover:text-[#B85C56] hover:bg-[#FDF0EE] transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.aside>

        {/* FLOATING WORKSPACE */}
        <div className="flex-1 min-w-0 my-2 mr-2 md:my-3 md:mr-3.5 ml-1 md:ml-0 rounded-2xl md:rounded-[22px] border border-[#DFDED7] bg-white shadow-[0_4px_24px_rgba(23,35,47,0.03)] flex flex-col overflow-hidden min-h-[calc(100vh-16px)] md:min-h-[calc(100vh-24px)]">
          <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="sticky top-0 z-20 border-b border-[#DFDED7] bg-white/95 backdrop-blur-md px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4 h-14"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden md:inline-flex rounded-lg p-1.5 text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] transition cursor-pointer"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <div className="hidden md:block h-4 w-px bg-[#DFDED7]" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex md:hidden rounded-lg p-1.5 text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] border border-[#DFDED7] cursor-pointer"
                aria-label="Open mobile navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-[#65717B] font-medium min-w-0">
                <span className="capitalize text-[#17232F] font-semibold text-sm truncate">{pageTitle}</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl mx-3">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#B9965B]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  placeholder={mode === "selling" ? "Search my properties…" : "Search listings, bookings…"}
                  className="w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] py-1.5 pl-9 pr-3 text-xs text-[#17232F] placeholder-[#929A9D] outline-none transition hover:border-[#B9965B]/60 focus:border-[#B9965B] focus:ring-2 focus:ring-[#B9965B]/20"
                />
              </div>
              <div className="hidden xl:flex items-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1 text-xs font-semibold shrink-0">
                <button
                  onClick={() => go("buying")}
                  className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${mode === "buying"
                    ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold"
                    : "text-[#65717B] hover:text-[#17232F] border border-transparent"
                    }`}
                >
                  Buying Hub
                </button>
                <button
                  onClick={() => go("selling")}
                  className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${mode === "selling"
                    ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold"
                    : "text-[#65717B] hover:text-[#17232F] border border-transparent"
                    }`}
                >
                  Selling Hub
                </button>
              </div>
              {mode === "selling" ? (
                <button
                  onClick={() => nav("/home/my-properties?tab=post")}
                  className="hidden xl:flex items-center gap-1.5 rounded-xl bg-[#B9965B] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#a6844d] transition cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>List Property</span>
                </button>
              ) : (
                <button
                  onClick={() => nav("/properties")}
                  className="hidden xl:flex items-center gap-1.5 rounded-xl border border-[#DFDED7] bg-white px-3.5 py-1.5 text-xs font-bold text-[#B9965B] shadow-2xs hover:bg-[#F7F6F2] hover:border-[#B9965B]/40 transition cursor-pointer shrink-0"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Browse Listings</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#71877B]/30 bg-[#EBF3EF] px-2.5 py-1 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3E8066] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3E8066]"></span>
                </span>
                <span className="font-semibold font-mono text-[#3E8066] text-[10px] tracking-tight">
                  LIVE • {mode === "selling" ? "SELLER" : "BUYER"}
                </span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBell((s) => !s)}
                  className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-[#DFDED7] bg-white text-[#65717B] shadow-xs transition hover:bg-[#F7F6F2] hover:text-[#B9965B] hover:border-[#B9965B]/40 cursor-pointer"
                  title={unread > 0 ? `${unread} unread notifications` : "Notifications"}
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#B9965B] text-[9.5px] font-bold text-white shadow-xs font-mono">
                        {unread > 99 ? "99+" : unread}
                      </span>
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] rounded-full bg-[#B9965B] opacity-75 animate-ping" />
                    </>
                  )}
                </button>
                {showBell && (
                  <div className="absolute right-0 mt-2 max-h-80 w-80 overflow-y-auto rounded-2xl border border-[#DFDED7] bg-white p-2.5 shadow-[0_12px_32px_rgba(23,35,47,0.12)] z-30 divide-y divide-[#DFDED7]">
                    <div className="px-3 py-2 mb-1 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#17232F]">Notifications</p>
                      <span className="rounded-full bg-[#F4EFE6] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#B9965B] border border-[#B9965B]/30">
                        {unread} unread
                      </span>
                    </div>
                    {(notifData?.docs || []).slice(0, 8).map((n) => (
                      <div key={n._id} className="rounded-xl px-3 py-2 hover:bg-[#F7F6F2] transition">
                        <p className="text-xs font-semibold text-[#17232F]">{n.title}</p>
                        <p className="text-[11px] text-[#65717B] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                    {!(notifData?.docs || []).length && (
                      <p className="px-3 py-4 text-center text-xs text-[#65717B]">No new notifications</p>
                    )}
                  </div>
                )}
              </div>

              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUser((s) => !s)}
                    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#DFDED7] bg-[#F7F6F2] pl-1 pr-2.5 py-0.5 shadow-2xs hover:border-[#B9965B]/50 transition cursor-pointer"
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name || "Client"}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#B9965B] to-[#17232F] text-[10px] font-bold text-white">
                        {user.name?.[0] || user.email?.[0] || "C"}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-[#17232F] max-w-[110px] truncate">
                      {user.name || user.email}
                    </span>
                    <span className="rounded bg-[#F4EFE6] px-1 py-0.2 text-[9px] font-mono font-bold text-[#B9965B] border border-[#B9965B]/30">
                      {mode === "selling" ? "SELLER" : "BUYER"}
                    </span>
                  </button>
                  {showUser && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#DFDED7] bg-white p-2 shadow-[0_12px_32px_rgba(23,35,47,0.12)] z-30">
                      <div className="px-3 py-2 border-b border-[#DFDED7]/70 mb-1">
                        <p className="text-xs font-bold text-[#17232F] truncate">{user.name || "Customer"}</p>
                        <p className="text-[10.5px] text-[#65717B] truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUser(false);
                          nav("/home/profile");
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] cursor-pointer"
                      >
                        Profile & Preferences
                      </button>
                      <button
                        onClick={() => {
                          setShowUser(false);
                          nav(mode === "selling" ? "/home/my-properties" : "/home/favorites");
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] cursor-pointer"
                      >
                        {mode === "selling" ? "My Properties" : "Saved Properties"}
                      </button>
                      <button
                        onClick={() => {
                          setShowUser(false);
                          nav("/home/transactions");
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] cursor-pointer"
                      >
                        Payments & Transactions
                      </button>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#B85C56] hover:bg-[#FDF0EE] cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#FAF9F5]/40 scrollbar-thin scrollbar-thumb-[#DFDED7]">
            <Outlet />
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#17232F]/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-[#DFDED7] p-5 flex flex-col justify-between shadow-2xl z-50"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#DFDED7]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[#F7F6F2] border border-[#DFDED7] text-[#B9965B]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#17232F]">PrimeNest Client</p>
                      <p className="text-[10px] text-[#65717B]">Customer Workspace</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-[#65717B] hover:text-[#17232F]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] p-1">
                  <button
                    onClick={() => go("buying")}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition ${mode === "buying" ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold" : "text-[#65717B] border border-transparent"
                      }`}
                  >
                    Buying
                  </button>
                  <button
                    onClick={() => go("selling")}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition ${mode === "selling" ? "bg-white text-[#B9965B] border border-[#DFDED7] shadow-xs font-bold" : "text-[#65717B] border border-transparent"
                      }`}
                  >
                    Selling
                  </button>
                </div>
                <div className="mt-4 space-y-2 overflow-y-auto max-h-[60vh]">
                  {activeLinks.map(({ label, to, icon: Icon, badge }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/home/dashboard"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition overflow-hidden ${isActive
                          ? "bg-transparent text-[#17232F] font-bold border border-[#17232F] shadow-xs"
                          : "border border-transparent text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] font-medium"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-md bg-gradient-to-b from-[#E6C687] via-[#B9965B] to-[#99773E] shadow-[0_0_8px_rgba(230,198,135,0.85)]" />
                          )}
                          <Icon className={`w-5 h-5 ${isActive ? "text-[#B9965B]" : "text-[#65717B]"}`} />
                          <span className={`flex-1 ${isActive ? "text-[#17232F] font-bold" : "font-medium"}`}>{label}</span>
                          {badge ? (
                            <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-[#B9965B] text-[10px] font-bold text-white font-mono">
                              {badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-[#DFDED7]">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F7F6F2] text-[#B85C56] border border-[#DFDED7] text-xs font-semibold cursor-pointer hover:bg-[#FDF0EE]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Renders toast notifications for all customer panel actions (password change, bookings, etc.) */}
      <Toaster position="top-center" />
    </div>
  );
}
