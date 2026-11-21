import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  KanbanSquare,
  CalendarDays,
  User,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  PanelLeft,
  Menu,
  X,
  ChevronsUpDown,
} from "lucide-react";
import api from "../lib/adminApi";
import { usePortalStore, agentApi } from "./store";
import LuxuryAmbientParticles from "../admin/components/LuxuryAmbientParticles";

const LINKS = [
  { label: "Dashboard", to: "/agent", icon: LayoutDashboard },
  { label: "My Properties", to: "/agent/properties", icon: Building2 },
  { label: "Leads & CRM", to: "/agent/leads", icon: KanbanSquare },
  { label: "Visits & Bookings", to: "/agent/bookings", icon: CalendarDays },
  { label: "Commissions", to: "/agent/commissions", icon: CalendarDays },
  { label: "Profile & Settings", to: "/agent/profile", icon: User },
];

export default function PortalLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const user = usePortalStore((s) => s.user);
  const unread = usePortalStore((s) => s.unread);
  const setUnread = usePortalStore((s) => s.setUnread);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("agent_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("agent_sidebar_collapsed", String(next));
      } catch { }
      return next;
    });
  };

  const [q, setQ] = useState("");
  const [showBell, setShowBell] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const { data: countData } = useQuery({
    queryKey: ["agent-notif-count"],
    queryFn: agentApi.notifications,
    refetchInterval: 60000,
  });
  useEffect(() => {
    if (countData) setUnread(countData.unread || 0);
  }, [countData, setUnread]);

  const { data: notifData } = useQuery({
    queryKey: ["agent-notif"],
    queryFn: () => agentApi.notifications({}),
    enabled: showBell,
  });

  const [settings, setSettings] = useState(null);

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

  const logout = async () => {
    await api.post("/auth/logout").catch(() => { });
    localStorage.removeItem("admin_token");
    nav("/login");
  };

  const rawCrumbs = loc.pathname.split("/").filter(Boolean).slice(1);
  const pageTitle = rawCrumbs.length ? rawCrumbs[rawCrumbs.length - 1].replace(/-/g, " ") : "Dashboard";

  return (
    <div className="relative min-h-screen bg-[#F7F6F2] text-[#17232F] font-sans selection:bg-[#B9965B]/20 selection:text-[#17232F]">
      {/* Same ambient particles as SuperAdmin */}
      <LuxuryAmbientParticles count={30} />

      <div className="relative z-10 flex min-h-screen">
        {/* DESKTOP SIDEBAR — same type as SuperAdmin */}
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
              onClick={() => nav("/agent")}
              className={`flex items-center rounded-xl p-1.5 hover:bg-black/[0.03] transition cursor-pointer select-none ${collapsed ? "justify-center" : "gap-2.5 justify-between"
                }`}
              title="PrimeNest Agent Console"
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
                        Agent
                      </span>
                    </div>
                    <p className="truncate text-[10.5px] font-medium text-[#65717B]">
                      Partner Portal
                    </p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <ChevronsUpDown className="h-3.5 w-3.5 text-[#929A9D] shrink-0" />
              )}
            </div>
          </div>

          {/* Navigation — grouped like SuperAdmin */}
          <div className="flex-1 overflow-y-auto py-3 space-y-5 scrollbar-none">
            <div>
              {!collapsed && (
                <p className="px-3 text-[11px] font-mono font-bold tracking-wider text-[#929A9D] uppercase mb-1.5">
                  Agent Console
                </p>
              )}
              {LINKS.map(({ label, to, icon: Icon }) => {
                const isActive = to === "/agent" ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/agent"}
                    title={collapsed ? label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer overflow-hidden ${isActive
                      ? "bg-transparent text-[#17232F] font-bold border border-[#17232F] shadow-xs"
                      : "border border-transparent text-[#65717B] hover:bg-black/[0.04] hover:text-[#17232F] font-medium"
                      } ${collapsed ? "justify-center px-0 py-2.5" : ""}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="agentActiveNavNotch"
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
                      <span className={`truncate tracking-normal text-sm ${isActive ? "text-[#17232F] font-bold" : "font-medium"}`}>
                        {label}
                      </span>
                    )}
                    {collapsed && isActive && (
                      <div className="absolute right-1.5 h-1.5 w-1.5 rounded-full bg-[#B9965B] shadow-[0_0_6px_rgba(185,150,91,0.8)]" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Footer profile */}
          <div className="space-y-2 pt-2.5 border-t border-[#DFDED7]/70">
            {user && (
              <div
                className={`flex items-center rounded-xl p-1.5 transition ${collapsed ? "justify-center" : "justify-between gap-2 hover:bg-black/[0.03]"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#17232F] text-xs font-semibold text-white">
                    {(user.name?.[0] || user.email?.[0] || "A").toUpperCase()}
                  </div>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#17232F]" title={user.name || user.email}>
                        {user.name || user.email}
                      </p>
                      <p className="truncate text-[10px] text-[#929A9D] font-mono">
                        {user.role || "AGENT"}
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

        {/* FLOATING WORKSPACE — same as SuperAdmin inset card */}
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

            <div className="hidden lg:flex items-center flex-1 max-w-md mx-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#B9965B]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && q.trim())
                      nav(`/agent/properties?search=${encodeURIComponent(q.trim())}`);
                  }}
                  placeholder="Search listings, clients, bookings…"
                  className="w-full rounded-xl border border-[#DFDED7] bg-[#F7F6F2] py-1.5 pl-9 pr-3 text-xs text-[#17232F] placeholder-[#929A9D] outline-none transition hover:border-[#B9965B]/60 focus:border-[#B9965B] focus:ring-2 focus:ring-[#B9965B]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#71877B]/30 bg-[#EBF3EF] px-2.5 py-1 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3E8066] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3E8066]"></span>
                </span>
                <span className="font-semibold font-mono text-[#3E8066] text-[10px] tracking-tight">
                  LIVE • AGENT
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
                    {(notifData?.data || []).slice(0, 8).map((n) => (
                      <div key={n._id} className="rounded-xl px-3 py-2 hover:bg-[#F7F6F2] transition">
                        <p className="text-xs font-semibold text-[#17232F]">{n.title}</p>
                        <p className="text-[11px] text-[#65717B] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                    {!(notifData?.data || []).length && (
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#B9965B] to-[#17232F] text-[10px] font-bold text-white">
                      {user.name?.[0] || user.email?.[0] || "A"}
                    </div>
                    <span className="text-xs font-semibold text-[#17232F] max-w-[110px] truncate">
                      {user.name || user.email}
                    </span>
                    <span className="rounded bg-[#F4EFE6] px-1 py-0.2 text-[9px] font-mono font-bold text-[#B9965B] border border-[#B9965B]/30">
                      AGENT
                    </span>
                  </button>
                  {showUser && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#DFDED7] bg-white p-2 shadow-[0_12px_32px_rgba(23,35,47,0.12)] z-30">
                      <button
                        onClick={() => {
                          setShowUser(false);
                          nav("/agent/profile");
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[#17232F] hover:bg-[#F7F6F2] hover:text-[#B9965B] cursor-pointer"
                      >
                        Profile & Settings
                      </button>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#B85C56] hover:bg-[#FDF0EF] cursor-pointer"
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

      {/* MOBILE DRAWER — same light type as SuperAdmin */}
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
                      <p className="font-bold text-sm text-[#17232F]">PrimeNest Agent</p>
                      <p className="text-[10px] text-[#65717B]">Partner Portal</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-[#65717B] hover:text-[#17232F]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-2 overflow-y-auto max-h-[70vh]">
                  {LINKS.map(({ label, to, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/agent"}
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
                          <span className={isActive ? "text-[#17232F] font-bold" : "font-medium"}>{label}</span>
                        </>
                      )}
                    </NavLink>
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

      <Toaster position="top-center" />
    </div>
  );
}
