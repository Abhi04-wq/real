import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Heart,
  Calendar,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import SparkleNavbar from "../lightswind/sparkle-navbar";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const getTabFromLocation = (pathname, hash) => {
  if (pathname === "/properties" || pathname.startsWith("/property/")) return "Properties";
  if (pathname === "/about-us") return "About";
  if (pathname === "/contact-support") return "Contact";
  if (pathname === "/") {
    if (hash === "#about") return "About";
    if (hash === "#why-us") return "Why Us";
    if (hash === "#projects") return "Projects";
    if (hash === "#properties") return "Properties";
    if (hash === "#testimonials") return "Testimonials";
    if (hash === "#contact") return "Contact";
    return "Home";
  }
  return "Home";
};

export default function EditorialHeader({ onOpenEnquiry }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => getTabFromLocation(location.pathname, location.hash));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isClickingRef = useRef(false);
  const clickTimeoutRef = useRef(null);

  const { user, logout, dashboardPath } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Why Us", href: "/#why-us" },
    { name: "Projects", href: "/#projects" },
    { name: "Properties", href: "/#properties" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Contact", href: "/#contact" },
  ];

  // Dynamically sync activeTab with current route & hash
  useEffect(() => {
    const tab = getTabFromLocation(location.pathname, location.hash);
    setActiveTab(tab);
  }, [location.pathname, location.hash]);

  // Clean scroll spy on landing page ("/")
  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      if (isClickingRef.current) return;
      const scrollY = window.scrollY;

      const sections = [
        { id: "hero", name: "Home" },
        { id: "about", name: "About" },
        { id: "why-us", name: "Why Us" },
        { id: "projects", name: "Projects" },
        { id: "properties", name: "Properties" },
        { id: "testimonials", name: "Testimonials" },
        { id: "contact", name: "Contact" },
      ];

      const navOffset = 120;
      let matched = "Home";

      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop - navOffset;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            matched = sec.name;
          }
        }
      }

      setActiveTab((prev) => (prev !== matched ? matched : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleNavClick = (itemName) => {
    isClickingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickingRef.current = false;
    }, 900);

    setActiveTab(itemName);
    setMobileMenuOpen(false);

    if (itemName === "Home") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    if (itemName === "About") {
      if (location.pathname === "/") {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.location.hash = "about";
      } else {
        navigate("/#about");
      }
      return;
    }

    if (itemName === "Why Us") {
      if (location.pathname === "/") {
        const el = document.getElementById("why-us");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.location.hash = "why-us";
      } else {
        navigate("/#why-us");
      }
      return;
    }

    if (itemName === "Projects") {
      if (location.pathname === "/") {
        const el = document.getElementById("projects");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.location.hash = "projects";
      } else {
        navigate("/#projects");
      }
      return;
    }

    if (itemName === "Properties") {
      if (location.pathname === "/") {
        const el = document.getElementById("properties");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.location.hash = "properties";
      } else {
        navigate("/#properties");
      }
      return;
    }

    if (itemName === "Testimonials") {
      if (location.pathname === "/") {
        const el = document.getElementById("testimonials");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.location.hash = "testimonials";
      } else {
        navigate("/#testimonials");
      }
      return;
    }

    if (itemName === "Contact") {
      if (location.pathname === "/") {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.location.hash = "contact";
      } else {
        navigate("/#contact");
      }
      return;
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const userInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F5EBE1]/90 backdrop-blur-2xl backdrop-saturate-180 border-b border-white/60 shadow-[0_8px_32px_0_rgba(28,36,33,0.08),inset_0_1px_0_0_rgba(255,255,255,0.7)]"
            : "bg-[#F5EBE1]/65 backdrop-blur-xl backdrop-saturate-150 border-b border-white/40 shadow-[0_4px_20px_0_rgba(0,0,0,0.02),inset_0_1px_0_0_rgba(255,255,255,0.5)]"
        }`}
      >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between">
        {/* Left: PrimeNest Brand Logo */}
        <Link
          to="/"
          id="brand-logo-link"
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-3 group focus:outline-none shrink-0"
        >
          <div className="relative shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <img
              src="/primenest-emblem-clean.png"
              alt="Prime Nest Properties Emblem"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
            />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span className="font-sans font-extrabold uppercase text-base sm:text-lg tracking-[0.10em] text-[#0C294A]">
              Prime Nest
            </span>
            <span className="font-sans font-semibold text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-[#B87314] mt-0.5">
              Properties
            </span>
          </div>
        </Link>

        {/* Center: Sparkle Animated Navigation Links in Frosted Glass Capsule */}
        <div
          className="hidden md:flex items-center shrink-0 px-4 py-1.5 rounded-full bg-white/45 border border-white/70 shadow-[0_2px_12px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.8)] backdrop-blur-lg"
          aria-label="Main Navigation"
        >
          <SparkleNavbar
            items={navLinks.map((l) => l.name)}
            color="#E05A2B"
            activeItem={activeTab}
            onItemClick={handleNavClick}
          />
        </div>

        {/* Right: Auth Avatar / Login & Contact Us Button */}
        <div className="hidden sm:flex items-center space-x-3 shrink-0">
          {user ? (
            /* Logged-In User Avatar & Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                id="header-user-avatar-btn"
                className="h-10 inline-flex items-center gap-2 pl-1.5 pr-3 rounded-full bg-white/50 hover:bg-white/80 transition-all border border-white/70 shadow-xs backdrop-blur-md cursor-pointer shrink-0"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/80 overflow-hidden shrink-0">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="text-left hidden lg:block leading-none">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                    {(user.name || "User").split(" ")[0]}
                  </p>
                  <p className="text-[9.5px] text-slate-500 capitalize mt-0.5">
                    {user.role === "SUPER_ADMIN" ? "Admin" : user.role?.toLowerCase() || "Member"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Avatar Dropdown Card */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 py-2.5 z-50 animate-scale-up text-left">
                  {/* User Profile Summary Header */}
                  <div className="px-4 py-2 border-b border-slate-100/80">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#DCEBE5] text-[10px] font-semibold uppercase tracking-wider text-[#176B5B]">
                      {user.role || "CUSTOMER"}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to={dashboardPath || "/home/dashboard"}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-black transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>User Panel / Dashboard</span>
                    </Link>

                    <Link
                      to="/home/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-black transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>My Wishlist & Favorites</span>
                    </Link>

                    <Link
                      to="/home/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-black transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>My Bookings & Tours</span>
                    </Link>

                    <Link
                      to="/home/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-black transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100/80 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Log in Button if NOT Logged In */
            <Link
              to="/login"
              id="header-login-btn"
              className="h-10 inline-flex items-center justify-center text-xs uppercase tracking-[0.14em] text-[#1C2421] hover:text-black font-semibold transition-all px-5 rounded-full bg-white/45 hover:bg-white/80 border border-white/70 shadow-xs backdrop-blur-md shrink-0 cursor-pointer"
            >
              Log in
            </Link>
          )}

          {/* Contact Us Modal Trigger Button */}
          <button
            onClick={() =>
              onOpenEnquiry ? onOpenEnquiry("General Advisory") : navigate("/contact-support")
            }
            id="header-contact-btn"
            className="h-10 inline-flex items-center justify-center bg-[#176B5B]/90 hover:bg-[#176B5B] text-white text-xs uppercase tracking-[0.14em] font-semibold px-5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(23,107,91,0.25)] border border-[#176B5B]/30 backdrop-blur-md active:scale-98 cursor-pointer shrink-0"
          >
            Contact Us
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="mobile-menu-toggle"
          aria-label="Toggle menu"
          className="md:hidden p-2 rounded-xl bg-white/50 border border-white/70 backdrop-blur-md text-slate-800 hover:bg-white/80 transition-colors focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu with Glassmorphism */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F5EBE1]/90 backdrop-blur-2xl border-b border-white/60 px-6 py-4 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => handleNavClick(link.name)}
                className={`text-left text-[14px] py-2 font-medium transition-colors cursor-pointer ${
                  activeTab === link.name ? "text-[#E05A2B] font-semibold" : "text-gray-700 hover:text-black"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-white/40 flex flex-col gap-2.5">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/60">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  to={dashboardPath || "/home/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-xs py-2 bg-slate-900 text-white font-bold rounded-lg"
                >
                  Go to User Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-xs py-2 text-rose-600 font-bold border border-rose-200/80 bg-white/50 rounded-lg hover:bg-rose-50"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-[13px] py-2 font-semibold text-gray-800 bg-white/50 border border-white/70 rounded-full"
              >
                Log in
              </Link>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenEnquiry) onOpenEnquiry("General Advisory");
                else navigate("/contact-support");
              }}
              className="w-full text-center bg-[#176B5B] hover:bg-[#0F5143] text-white text-[13px] py-2.5 font-semibold rounded-full shadow-md transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </header>
    {/* Spacer so page content remains correctly positioned and never covered by fixed header */}
    <div className="h-16 sm:h-[68px] w-full shrink-0 pointer-events-none" aria-hidden="true" />
  </>
  );
}
