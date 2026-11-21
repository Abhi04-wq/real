import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Layers,
  MapPin,
  KanbanSquare,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Bell,
  History,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  Mail,
  ChevronsUpDown,
  Search,
  Sparkles,
  Shield,
  CircleDot,
  Menu,
  X,
  Plus
} from "lucide-react";
import api from "../lib/adminApi";
import NotificationDrawer from "./components/NotificationDrawer";
import CommandPalette from "./components/CommandPalette";
import LuxuryAmbientParticles from "./components/LuxuryAmbientParticles";

// Real Estate Command Center navigation groups
const NAV_GROUPS = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", to: "/panel", icon: LayoutDashboard },
    ]
  },
  {
    title: "PROPERTY PORTFOLIO",
    items: [
      { label: "Properties", to: "/panel/properties", icon: Building2 },
      { label: "Property Types", to: "/panel/property-types", icon: Layers },
      // { label: "Locations", to: "/panel/properties?filter=locations", icon: MapPin },
    ]
  },
  {
    title: "SALES & CRM",
    items: [
      { label: "Leads", to: "/panel/leads", icon: KanbanSquare },
      { label: "Clients", to: "/panel/users?role=CUSTOMER", icon: Users },

      { label: "Bookings", to: "/panel/bookings", icon: CalendarDays },
    ]
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Agents & Staff", to: "/panel/agents", icon: UserCheck },
      { label: "Transactions", to: "/panel/transactions", icon: CreditCard },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Activity Logs", to: "/panel/activity", icon: History },
      { label: "Settings", to: "/panel/settings", icon: Settings },
    ]
  }
];

export default function AdminLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch { }
      return next;
    });
  };

  const fetchUnreadCount = () => {
    api.get("/notifications", { params: { limit: 1 } })
      .then(({ data }) => {
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        } else if (Array.isArray(data.data)) {
          setUnreadCount(data.data.filter((n) => !n.isRead).length);
        }
      })
      .catch(() => { });
  };

  const [settings, setSettings] = useState(null);

  const fetchSettings = () => {
    api
      .get("/settings")
      .then(({ data }) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => { });
  };

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setMe(data.user)).catch(() => { });
    fetchUnreadCount();
    fetchSettings();

    const handleSettingsUpdated = (e) => {
      if (e?.detail) setSettings(e.detail);
      else fetchSettings();
    };
    const timer = setInterval(fetchUnreadCount, 30000);

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener("agency-settings-updated", handleSettingsUpdated);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Format breadcrumb title
  const rawCrumbs = loc.pathname.split("/").filter(Boolean);
  const currentSection = rawCrumbs[rawCrumbs.length - 1]?.replace(/-/g, " ") || "Overview";

  const logout = async () => {
    await api.post("/auth/logout").catch(() => { });
    localStorage.removeItem("admin_token");
    nav("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#F7F6F2] text-[#17232F] font-sans selection:bg-[#B9965B]/20 selection:text-[#17232F]">
      {/* Ambient subtle champagne gold & architectural particles */}
      <LuxuryAmbientParticles count={30} />

      <div className="relative z-10 flex min-h-screen">
        {/* DESKTOP SHADCN-STYLE FLOATING SIDEBAR */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`sticky top-0 hidden h-screen shrink-0 flex-col justify-between py-3 pl-3 pr-1 md:py-3.5 md:pl-4 md:pr-1.5 transition-all duration-300 ease-in-out md:flex z-30 ${collapsed ? "w-[72px]" : "w-64"
            }`}
        >
          {/* Top Section: Brand + Quick Create Row */}
          <div className="space-y-3">
            {/* Top Workspace / Brand Switcher (shadcn SidebarHeader style) */}
            <div
              onClick={() => nav("/panel")}
              className={`flex items-center rounded-xl p-1.5 hover:bg-black/[0.03] transition cursor-pointer select-none ${collapsed ? "justify-center" : "gap-2.5 justify-between"
                }`}
              title="PrimeNest Command Center"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Brand Emblem */}
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

                {/* Brand Text Header */}
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold tracking-tight text-[#17232F]">
                        {settings?.companyName || "PrimeNest"}
                      </p>
                      <span className="rounded bg-[#F4EFE6] px-1 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider text-[#B9965B] border border-[#B9965B]/30">
                        SUPER
                      </span>
                    </div>
                    <p className="truncate text-[10.5px] font-medium text-[#65717B]">
                      {settings?.tagline || "Real Estate Operations"}
                    </p>
                  </div>
                )}
              </div>

              {!collapsed && (
                <ChevronsUpDown className="h-3.5 w-3.5 text-[#929A9D] shrink-0" />
              )}
            </div>

            {/* Quick Create + Inbox Action Row (Exact match to reference screenshot) */}
            <div className="relative">
              <div className={`flex items-center gap-1.5 ${collapsed ? "justify-center" : ""}`}>
                {/* Quick Create Dark Pill Button */}



              </div>

              {/* Quick Create Dropdown Menu */}
              <AnimatePresence>
                {quickCreateOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setQuickCreateOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      className={`absolute top-11 z-50 rounded-xl border border-[#DFDED7] bg-white p-1.5 shadow-[0_12px_32px_rgba(23,35,47,0.12)] space-y-0.5 ${collapsed ? "left-12 w-52" : "left-0 right-0"
                        }`}
                    >
                      <button
                        onClick={() => {
                          setQuickCreateOpen(false);
                          nav("/panel/properties");
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] transition text-left cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#B9965B]" />
                        <span>Add New Property</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickCreateOpen(false);
                          nav("/panel/leads");
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] transition text-left cursor-pointer"
                      >
                        <KanbanSquare className="w-3.5 h-3.5 text-[#B9965B]" />
                        <span>New CRM Lead</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickCreateOpen(false);
                          nav("/panel/bookings");
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] transition text-left cursor-pointer"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-[#B9965B]" />
                        <span>Record Site Tour</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuickCreateOpen(false);
                          nav("/panel/agents");
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] transition text-left cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#B9965B]" />
                        <span>Add Broker Agent</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Items (Grouped with logical headers - shadcn SidebarContent) */}
          <div className="flex-1 overflow-y-auto py-3 space-y-5 scrollbar-none">
            {NAV_GROUPS.map((group, gIdx) => (
              <div key={gIdx}>
                {!collapsed && (
                  <p className="px-3 text-[11px] font-mono font-bold tracking-wider text-[#929A9D] uppercase mb-1.5">
                    {group.title}
                  </p>
                )}
                {group.items.map(({ label, to, icon: Icon }) => {
                  const isActive = loc.pathname === to || (to !== "/panel" && loc.pathname.startsWith(to));
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/panel"}
                      title={collapsed ? label : undefined}
                      className={({ isActive: exactActive }) => {
                        const active = to === "/panel" ? exactActive : isActive;
                        return `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer overflow-hidden ${
                          active
                            ? "bg-transparent text-[#17232F] font-bold border border-[#17232F] shadow-xs"
                            : "border border-transparent text-[#65717B] hover:bg-black/[0.04] hover:text-[#17232F] font-medium"
                        } ${collapsed ? "justify-center px-0 py-2.5" : ""}`;
                      }}
                    >
                      {({ isActive: exactActive }) => {
                        const active = to === "/panel" ? exactActive : isActive;
                        return (
                          <>
                            {/* Left Glowing Gold Indicator Bar (from reference) */}
                            {active && (
                              <motion.div
                                layoutId="activeSideBarNotch"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-md bg-gradient-to-b from-[#E6C687] via-[#B9965B] to-[#99773E] shadow-[0_0_10px_rgba(230,198,135,0.85)]"
                                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                              />
                            )}

                            <Icon
                              className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                                active
                                  ? "text-[#B9965B] scale-105"
                                  : "text-[#65717B] group-hover:text-[#17232F] group-hover:scale-105"
                              }`}
                            />

                            {!collapsed && (
                              <span className={`truncate tracking-normal text-sm ${active ? "text-[#17232F] font-bold" : "font-medium"}`}>
                                {label}
                              </span>
                            )}

                            {/* Active dot when collapsed */}
                            {collapsed && active && (
                              <div className="absolute right-1.5 h-1.5 w-1.5 rounded-full bg-[#B9965B] shadow-[0_0_6px_rgba(185,150,91,0.8)]" />
                            )}
                          </>
                        );
                      }}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Sidebar Footer: Settings & Administrator Profile (shadcn SidebarFooter) */}
          <div className="space-y-2 pt-2.5 border-t border-[#DFDED7]/70">
            {/* Settings Quick Nav */}
            <NavLink
              to="/panel/settings"
              title={collapsed ? "Settings" : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer overflow-hidden ${
                  isActive
                    ? "bg-transparent text-[#17232F] font-bold border border-[#17232F] shadow-xs"
                    : "border border-transparent text-[#65717B] hover:bg-black/[0.04] hover:text-[#17232F] font-medium"
                } ${collapsed ? "justify-center px-0 py-2.5" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeSideBarNotchSettings"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-md bg-gradient-to-b from-[#E6C687] via-[#B9965B] to-[#99773E] shadow-[0_0_10px_rgba(230,198,135,0.85)]"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Settings
                    className={`h-5 w-5 shrink-0 transition-transform ${
                      isActive ? "text-[#B9965B] scale-105" : "text-[#65717B] group-hover:text-[#17232F]"
                    }`}
                  />
                  {!collapsed && (
                    <span className={`text-sm ${isActive ? "text-[#17232F] font-bold" : "font-medium"}`}>
                      Settings
                    </span>
                  )}
                  {collapsed && isActive && (
                    <div className="absolute right-1.5 h-1.5 w-1.5 rounded-full bg-[#B9965B]" />
                  )}
                </>
              )}
            </NavLink>

            {/* Profile & Logout Row */}
            {me && (
              <div
                className={`flex items-center rounded-xl p-1.5 transition ${collapsed ? "justify-center" : "justify-between gap-2 hover:bg-black/[0.03]"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#17232F] text-xs font-semibold text-white">
                    {(me.name?.[0] || me.email?.[0] || "A").toUpperCase()}
                  </div>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#17232F]" title={me.name || me.email}>
                        {me.name || me.email}
                      </p>
                      <p className="truncate text-[10px] text-[#929A9D] font-mono">
                        {me.role}
                      </p>
                    </div>
                  )}
                </div>

                {!collapsed && (
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1 rounded-lg text-[#929A9D] hover:text-[#B85C56] hover:bg-[#FDF0EF] transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.aside>

        {/* SHADCN-STYLE INSET FLOATING WORKSPACE CONTAINER (SidebarInset) */}
        <div className="flex-1 min-w-0 my-2 mr-2 md:my-3 md:mr-3.5 ml-1 md:ml-0 rounded-2xl md:rounded-[22px] border border-[#DFDED7] bg-white shadow-[0_4px_24px_rgba(23,35,47,0.03)] flex flex-col overflow-hidden min-h-[calc(100vh-16px)] md:min-h-[calc(100vh-24px)]">
          {/* FLOATING HEADER (INSIDE INSET CARD) */}
          <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="sticky top-0 z-20 border-b border-[#DFDED7] bg-white/95 backdrop-blur-md px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4 h-14"
          >
            {/* Left: Sidebar Toggle, Vertical Separator, Breadcrumb */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Desktop Sidebar Toggle Button (shadcn SidebarTrigger icon matching reference screenshot) */}
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

              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex md:hidden rounded-lg p-1.5 text-[#65717B] hover:bg-[#F7F6F2] hover:text-[#17232F] border border-[#DFDED7] cursor-pointer"
                aria-label="Open mobile navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              {/* Breadcrumb Title */}
              <div className="flex items-center gap-1.5 text-xs text-[#65717B] font-medium min-w-0">
                <span className="capitalize text-[#17232F] font-semibold text-sm truncate">{currentSection}</span>
              </div>
            </div>

            {/* Center Global Search / Command Palette Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-3">
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl border border-[#DFDED7] bg-[#F7F6F2] hover:bg-white hover:border-[#B9965B]/60 text-[#65717B] text-xs transition-all shadow-xs group cursor-pointer"
                title="Search platform or press Ctrl+K"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="w-3.5 h-3.5 text-[#B9965B] group-hover:scale-105 transition-transform shrink-0" />
                  <span className="truncate font-medium text-[11.5px]">Search properties, leads, agents, or transactions...</span>
                </div>
                <kbd className="inline-flex items-center gap-0.5 rounded-md border border-[#DFDED7] bg-white px-1.5 py-0.5 text-[9.5px] font-mono font-semibold text-[#65717B] shadow-2xs">
                  <span>Ctrl</span>+<span>K</span>
                </kbd>
              </button>
            </div>

            {/* Right Controls: Live Status, Notifications, User Chip */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Live System Health Indicator */}
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#71877B]/30 bg-[#EBF3EF] px-2.5 py-1 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3E8066] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3E8066]"></span>
                </span>
                <span className="font-semibold font-mono text-[#3E8066] text-[10px] tracking-tight">
                  LIVE • 99.98%
                </span>
              </div>

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="flex lg:hidden h-8.5 w-8.5 items-center justify-center rounded-xl border border-[#DFDED7] bg-white text-[#65717B] hover:text-[#B9965B] hover:border-[#B9965B]/40 transition cursor-pointer"
                title="Search (Ctrl + K)"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Notification Bell Button */}
              <button
                type="button"
                onClick={() => setNotifDrawerOpen(true)}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-[#DFDED7] bg-white text-[#65717B] shadow-xs transition hover:bg-[#F7F6F2] hover:text-[#B9965B] hover:border-[#B9965B]/40 cursor-pointer"
                title={
                  unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "Notifications"
                }
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#B9965B] text-[9.5px] font-bold text-white shadow-xs font-mono">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] rounded-full bg-[#B9965B] opacity-75 animate-ping" />
                  </>
                )}
              </button>

              {/* Administrator Profile Chip */}
              {me && (
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#DFDED7] bg-[#F7F6F2] pl-1 pr-2.5 py-0.5 shadow-2xs">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#B9965B] to-[#17232F] text-[10px] font-bold text-white">
                    {(me.name?.[0] || me.email?.[0] || "A").toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-[#17232F] max-w-[95px] truncate">
                    {me.name || me.email}
                  </span>
                  <span className="rounded bg-[#F4EFE6] px-1 py-0.2 text-[9px] font-mono font-bold text-[#B9965B] border border-[#B9965B]/30">
                    SUPER
                  </span>
                </div>
              )}
            </div>
          </motion.header>

          {/* MAIN PAGE OUTLET (Inside the floating card) */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#FAF9F5]/40 scrollbar-thin scrollbar-thumb-[#DFDED7]">
            <Outlet />
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION */}
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
                      <p className="font-bold text-sm text-[#17232F]">PrimeNest Admin</p>
                      <p className="text-[10px] text-[#65717B]">Command Center</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-[#65717B] hover:text-[#17232F]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-4 overflow-y-auto max-h-[70vh]">
                  {NAV_GROUPS.map((grp, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-[10px] font-mono font-bold text-[#929A9D] px-2.5 uppercase">
                        {grp.title}
                      </p>
                      {grp.items.map(({ label, to, icon: Icon }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={to === "/panel"}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition overflow-hidden ${
                              isActive
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
                              <span className={isActive ? "text-[#17232F] font-bold" : "font-medium"}>{label}</span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#DFDED7]">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F7F6F2] text-[#B85C56] border border-[#DFDED7] text-xs font-semibold cursor-pointer hover:bg-[#FDF0EF]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        open={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onCountChange={(count) => setUnreadCount(count)}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
