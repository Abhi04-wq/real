import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  Users,
  UserCheck,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  ArrowRight,
  X,
  Sparkles,
  Command,
  CheckCircle2,
} from "lucide-react";
import api from "../../lib/adminApi";

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [remoteResults, setRemoteResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Navigation shortcuts
  const defaultActions = [
    { id: "nav-dash", title: "Overview Dashboard", category: "Navigation", icon: BarChart3, path: "/panel" },
    { id: "nav-props", title: "Manage Properties Catalog", category: "Navigation", icon: Building2, path: "/panel/properties" },
    { id: "nav-leads", title: "Inbound Leads & Pipeline", category: "Navigation", icon: Users, path: "/panel/leads" },
    { id: "nav-agents", title: "Agents & Brokers Directory", category: "Navigation", icon: UserCheck, path: "/panel/agents" },
    { id: "nav-bookings", title: "Tour Bookings Schedule", category: "Navigation", icon: CalendarDays, path: "/panel/bookings" },
    { id: "nav-txns", title: "Transactions & Escrow Ledger", category: "Navigation", icon: CreditCard, path: "/panel/transactions" },
    { id: "nav-settings", title: "Platform & Agency Settings", category: "Navigation", icon: Settings, path: "/panel/settings" },
  ];

  // Quick fallback suggestions for properties, leads, and agents
  const sampleSuggestions = [
    { id: "p1", title: "Skyline Villa #4B", subtitle: "₹1,25,00,000 • Available", category: "Properties", icon: Building2, path: "/panel/properties" },
    { id: "p2", title: "Azure Penthouse 12", subtitle: "₹84,50,000 • Pending", category: "Properties", icon: Building2, path: "/panel/properties" },
    { id: "p3", title: "Greenwood Estate #8", subtitle: "₹2,10,00,000 • Available", category: "Properties", icon: Building2, path: "/panel/properties" },
    { id: "l1", title: "Rajesh Malhotra", subtitle: "Lead • +91 98234-11223 • High Intent", category: "Leads", icon: Users, path: "/panel/leads" },
    { id: "l2", title: "Ananya Sen", subtitle: "Lead • +91 99881-22445 • Site Visit Scheduled", category: "Leads", icon: Users, path: "/panel/leads" },
    { id: "a1", title: "Alex Rivera", subtitle: "Senior Broker • 18 active listings", category: "Agents", icon: UserCheck, path: "/panel/agents" },
    { id: "a2", title: "Vikram Malhotra", subtitle: "Managing Partner • ₹4.2 Cr closed", category: "Agents", icon: UserCheck, path: "/panel/agents" },
  ];

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setRemoteResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [propsRes, leadsRes] = await Promise.allSettled([
          api.get("/properties", { params: { search: query, limit: 3 } }),
          api.get("/leads", { params: { search: query, limit: 3 } }),
        ]);

        const results = [];
        if (propsRes.status === "fulfilled" && propsRes.value?.data?.data) {
          propsRes.value.data.data.forEach((p) => {
            results.push({
              id: `prop-${p._id}`,
              title: p.title,
              subtitle: `₹${Number(p.price || 0).toLocaleString("en-IN")} • ${p.status || "Listed"}`,
              category: "Properties",
              icon: Building2,
              path: `/panel/properties`,
            });
          });
        }

        if (leadsRes.status === "fulfilled" && leadsRes.value?.data?.data) {
          leadsRes.value.data.data.forEach((l) => {
            results.push({
              id: `lead-${l._id}`,
              title: l.name,
              subtitle: `${l.phone || l.email || "Lead"} • ${l.status || "New"}`,
              category: "Leads",
              icon: Users,
              path: `/panel/leads`,
            });
          });
        }

        setRemoteResults(results);
      } catch (e) {
        // quiet fallback
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Combined list to display
  const filteredActions = query.trim()
    ? defaultActions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : defaultActions;

  const filteredSamples = query.trim()
    ? sampleSuggestions.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase())
      )
    : sampleSuggestions;

  const allItems = query.trim()
    ? [...remoteResults, ...filteredSamples, ...filteredActions]
    : [...filteredActions.slice(0, 4), ...sampleSuggestions];

  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[#29374B] bg-[#0F1622] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Input Bar */}
        <div className="relative flex items-center border-b border-[#29374B] px-4 py-3.5 bg-[#172235]">
          <Search className="w-5 h-5 text-[#86A9D8] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search properties, leads, agents, or commands..."
            className="w-full bg-transparent text-sm text-[#F0F4FA] placeholder-[#9BA9BC]/50 outline-none font-medium"
          />
          {loading && (
            <span className="w-4 h-4 border-2 border-[#86A9D8] border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-block rounded-md border border-[#29374B] bg-[#080C13] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#86A9D8]">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#1D2A3D] text-[#9BA9BC] hover:text-[#F0F4FA] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#29374B]/40">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#9BA9BC]">
              <Command className="w-8 h-8 text-[#86A9D8]/40 mx-auto mb-2" />
              <p className="font-semibold text-[#F0F4FA]">No results found</p>
              <p className="mt-0.5">Try searching by property title, client, phone, or command name.</p>
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {allItems.map((item, idx) => {
                const Icon = item.icon || Sparkles;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1D2A3D] text-[#F0F4FA] shadow-sm font-semibold border border-[#86A9D8]/40"
                        : "hover:bg-[#172235] text-[#9BA9BC] hover:text-[#F0F4FA]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                          isSelected
                            ? "bg-[#86A9D8] text-[#080C13]"
                            : "bg-[#172235] text-[#86A9D8] border border-[#29374B]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-snug">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-[11px] text-[#9BA9BC] truncate">{item.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full bg-[#172235] border border-[#29374B] px-2 py-0.5 text-[10px] font-semibold text-[#86A9D8] uppercase tracking-wide">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#86A9D8]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="border-t border-[#29374B] bg-[#080C13] px-4 py-2.5 flex items-center justify-between text-[11px] text-[#9BA9BC]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#29374B] bg-[#172235] px-1 py-0.5 font-mono text-[9px] text-[#86A9D8]">↑</kbd>
              <kbd className="rounded border border-[#29374B] bg-[#172235] px-1 py-0.5 font-mono text-[9px] text-[#86A9D8]">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#29374B] bg-[#172235] px-1 py-0.5 font-mono text-[9px] text-[#86A9D8]">↵</kbd> to select
            </span>
          </div>
          <span className="font-semibold text-[#86A9D8]">PrimeNest Command Center</span>
        </div>
      </div>
    </div>
  );
}
