import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Home, DollarSign, PenTool, BookOpen, Globe, User, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import PrimeNestLogo from "./PrimeNestLogo";

const NAV_MENU = [
  {
    title: "Buy",
    icon: Home,
    items: [
      { name: "Flats & Apartments", nameHi: "फ्लैट्स और अपार्टमेंट्स", filter: { type: "Apartment" } },
      { name: "Villas & Independent Houses", nameHi: "विला और स्वतंत्र घर", filter: { type: "Villa" } },
      { name: "Residential Plots", nameHi: "आवासीय भूखंड (प्लॉट्स)", filter: { type: "Land" } },
      { name: "Under Construction", nameHi: "निर्माणाधीन परियोजनाएं", filter: { status: "Under Construction" } },
      { name: "Penthouse", nameHi: "पेंटहाउस", filter: { type: "Penthouse" } },
    ],
  },
  {
    title: "Projects",
    icon: PenTool,
    items: [
      { name: "New Launches", nameHi: "नई लॉन्चिंग", filter: { projectType: "new_launches", status: "Upcoming" } },
      { name: "RERA Certified", nameHi: "रेरा प्रमाणित टाउनशिप", filter: { projectType: "rera_certified" } },
      { name: "Premium Luxury", nameHi: "प्रीमियम लक्ज़री एस्टेट्स", filter: { projectType: "premium", minPrice: "15000000" } },
      { name: "Affordable Housing", nameHi: "किफायती आवास", filter: { projectType: "affordable", minPrice: "2000000", maxPrice: "5000000" } },
      { name: "Apartments", nameHi: "अपार्टमेंट्स", filter: { type: "Apartment" } },
      { name: "Villas", nameHi: "विला", filter: { type: "Villa" } },
    ],
  },
  {
    title: "Services",
    icon: DollarSign,
    items: [
      { name: "Find an Agent", nameHi: "एजेंट खोजें", filter: null, path: "/agents" },
      { name: "Property Management", nameHi: "संपत्ति प्रबंधन", filter: { query: "managed" }, path: "/properties" },
      { name: "Luxury Properties", nameHi: "लक्ज़री संपत्तियां", filter: { projectType: "premium", minPrice: "15000000" }, path: "/properties" },
      { name: "Contact Support", nameHi: "सहायता से संपर्क करें", filter: null, path: "/contact-support" },
    ],
  },
  {
    title: "Resources",
    icon: BookOpen,
    items: [
      { name: "About Us", nameHi: "हमारे बारे में", filter: null, path: "/about-us" },
      { name: "All Properties", nameHi: "सभी संपत्तियां", filter: {}, path: "/properties" },
      { name: "Plots & Land", nameHi: "प्लॉट्स और भूमि", filter: null, path: "/plots" },
      { name: "Our Agents", nameHi: "हमारे एजेंट", filter: null, path: "/agents" },
      { name: "Privacy Policy", nameHi: "गोपनीयता नीति", filter: null, path: "/privacy-policy" },
      { name: "RERA Disclaimer", nameHi: "रेरा अस्वीकरण", filter: null, path: "/rera-disclaimer" },
    ],
  },
];

const TRANSLATIONS = {
  EN: {
    buy: "Buy",
    rent: "Rent",
    projects: "Projects",
    services: "Services",
    resources: "Resources",
    postProperty: "Post Property",
    signIn: "Sign In",
    partner: "SquareYards Partner",
    explore: "Explore",
    loginRegister: "Login / Register"
  },
  HI: {
    buy: "खरीदें",
    rent: "किराए पर",
    projects: "प्रोजेक्ट्स",
    services: "सेवाएं",
    resources: "संसाधन",
    postProperty: "प्रॉपर्टी पोस्ट करें",
    signIn: "लॉगिन करें",
    partner: "स्क्वायरयार्ड्स पार्टनर",
    explore: "खोजें",
    loginRegister: "लॉगिन / पंजीकरण"
  }
};

export default function Navbar({ onOpenEnquiry, onOpenPostProperty, currentLang = "EN", setCurrentLang }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    if (axios.defaults.headers.common["Authorization"]) {
      delete axios.defaults.headers.common["Authorization"];
    }
    setUser(null);
    toast.success(currentLang === "EN" ? "Logged out successfully" : "सफलतापूर्वक लॉगआउट किया गया", {
      duration: 3000,
      style: {
        background: "#0f172a",
        color: "#fff",
        borderRadius: "16px",
      }
    });
    navigate("/");
  };

  const t = TRANSLATIONS[currentLang];
  // reference optional callback to avoid unused-var lint when not provided
  void onOpenEnquiry;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuSelect = (item) => {
    const path = item.path || "/properties";
    if (!item.filter) {
      navigate(path);
      return;
    }
    const qs = new URLSearchParams(item.filter).toString();
    navigate(qs ? `${path}?${qs}` : path);
  };

  const getTranslatedMenuTitle = (title) => {
    switch (title) {
      case "Buy": return t.buy;
      case "Rent": return t.rent;
      case "Projects": return t.projects;
      case "Services": return t.services;
      case "Resources": return t.resources;
      default: return title;
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/97 backdrop-blur-md shadow-md border-b border-slate-100 py-3"
          : "bg-white py-4 border-b border-slate-100"
          }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group bg-transparent border-0 p-0 text-left cursor-pointer">
            <PrimeNestLogo variant="inline" size="md" />
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_MENU.map((menu, idx) => (
              <div
                key={menu.title}
                className="relative"
                onMouseEnter={() => setActiveDropdown(idx)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    if (menu.title === "Buy") navigate("/properties");
                    else if (menu.title === "Projects") navigate("/properties?projectType=new_launches");
                    else if (menu.title === "Services") navigate("/agents");
                    else if (menu.title === "Resources") navigate("/about-us");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-650 hover:text-orange-500 rounded-lg hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                >
                  {getTranslatedMenuTitle(menu.title)}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === idx ? "rotate-180 text-orange-500" : ""
                    }`} />
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === idx && (
                  <div className="absolute left-0 mt-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <span className="text-[11px] font-bold tracking-wider text-slate-450 uppercase">
                        {t.explore} {getTranslatedMenuTitle(menu.title)}
                      </span>
                    </div>
                    {menu.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setActiveDropdown(null);
                          handleMenuSelect(item);
                        }}
                        className="w-full text-left block px-4 py-2.5 text-sm text-slate-600 hover:text-orange-650 hover:bg-orange-50/50 font-semibold transition-all duration-150"
                      >
                        {currentLang === "HI" ? item.nameHi : item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language Switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                onBlur={() => setTimeout(() => setLangDropdownOpen(false), 200)}
                className="p-2.5 text-slate-500 hover:text-orange-500 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1"
              >
                <Globe className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase">{currentLang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  <button
                    onClick={() => {
                      setCurrentLang("EN");
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold ${currentLang === "EN" ? "text-orange-500 bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLang("HI");
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold ${currentLang === "HI" ? "text-orange-500 bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    हिन्दी (HI)
                  </button>
                </div>
              )}
            </div>

            {/* wishlist removed per request */}

            {!user && (
              <button
                onClick={onOpenPostProperty ? onOpenPostProperty : () => navigate("/home/add-property")}
                className="px-4 py-2.5 border-2 border-slate-200 text-slate-700 hover:border-slate-800 hover:text-slate-900 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer"
              >
                {t.postProperty}
              </button>
            )}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer">
                  <User className="h-4.5 w-4.5 text-orange-500" />
                  <span>{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1.5">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{user.role}</p>
                    <p className="text-xs font-semibold text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50/50 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <User className="h-4 w-4 text-orange-500" />
                    <span>{currentLang === "EN" ? "My Dashboard" : "मेरा डैशबोर्ड"}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50/50 flex items-center gap-1.5 cursor-pointer transition-colors border-t border-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{currentLang === "EN" ? "Logout" : "लॉगआउट"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {t.signIn}
              </button>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <div className="flex items-center lg:hidden gap-3">
            {/* Quick Lang Switcher inside mobile navbar */}
            <button
              onClick={() => setCurrentLang(currentLang === "EN" ? "HI" : "EN")}
              className="p-2 text-slate-500 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              <span className="text-[10px] font-bold">{currentLang}</span>
            </button>

            {user ? (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md border border-orange-400 cursor-pointer"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
              >
                {t.signIn}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="lg:hidden animate-fade-in border-t border-slate-100 mt-3">
          <div className="px-4 pt-2 pb-6 space-y-3 bg-white">
            {NAV_MENU.map((menu) => (
              <div key={menu.title} className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
                  {getTranslatedMenuTitle(menu.title)}
                </span>
                <div className="grid grid-cols-2 gap-1.5 px-2">
                  {menu.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setIsOpen(false);
                        handleMenuSelect(item);
                      }}
                      className="text-sm font-medium text-slate-650 hover:text-orange-500 py-1.5 transition-colors text-left"
                    >
                      {currentLang === "HI" ? item.nameHi : item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 flex flex-col gap-2.5">
              {!user && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenPostProperty) onOpenPostProperty();
                    else navigate("/home/add-property");
                  }}
                  className="w-full py-3 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl text-center hover:bg-slate-50 cursor-pointer"
                >
                  {t.postProperty}
                </button>
              )}
              {user ? (
                <div className="py-2 border-t border-slate-100 mt-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-slate-800">{user.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full py-2.5 border border-orange-200 text-orange-650 hover:bg-orange-50/50 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <User className="h-4.5 w-4.5" />
                    <span>{currentLang === "EN" ? "Go to Dashboard" : "डैशबोर्ड पर जाएं"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100/50 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>{currentLang === "EN" ? "Logout" : "लॉगआउट"}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/login");
                  }}
                  className="w-full py-3 bg-orange-500 text-white text-sm font-bold rounded-xl text-center hover:bg-orange-600 shadow-md cursor-pointer"
                >
                  {t.loginRegister}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    <div className="h-16 sm:h-[72px] w-full shrink-0 pointer-events-none" aria-hidden="true" />
  </>
  );
}
