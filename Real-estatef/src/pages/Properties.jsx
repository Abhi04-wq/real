import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  Sparkles,
  Building2,
  RotateCcw,
  Check,
  Calendar,
  Share2,
  Tag,
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import EditorialHeader from "../components/editorial/EditorialHeader";
import EditorialFooter from "../components/editorial/EditorialFooter";
import EditorialEnquiryModal from "../components/editorial/EditorialEnquiryModal";
import TiltCard from "../components/ui/TiltCard";
import AuthRequiredModal from "../components/ui/AuthRequiredModal";
import { useWishlist } from "../lib/wishlist";
import { useAuth } from "../context/AuthContext";
import { CURATED_PROPERTIES } from "../components/editorial/SelectedProperties";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const LISTING_TYPES = [
  { id: "all", label: "All Properties" },
  { id: "Sale", label: "For Sale" },
  { id: "Rent", label: "For Rent" },
  { id: "Lease", label: "Commercial Lease" },
];

const BHK_OPTIONS = [
  { value: "all", label: "All Bedrooms" },
  { value: "1", label: "1 BHK / Studio" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4+ BHK" },
];

const PRICE_RANGES = [
  { value: "all", label: "All Prices" },
  { value: "under_50l", label: "Under ₹50 Lakhs", min: 0, max: 5000000 },
  { value: "50l_1.5cr", label: "₹50 L – ₹1.5 Cr", min: 5000000, max: 15000000 },
  { value: "1.5cr_5cr", label: "₹1.5 Cr – ₹5 Cr", min: 15000000, max: 50000000 },
  { value: "above_5cr", label: "Above ₹5 Cr", min: 50000000, max: null },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Listings" },
];

const POPULAR_CITIES = [
  "All",
  "Bardhaman",
  "Mumbai",
  "Gurugram",
  "Bangalore",
  "Hyderabad",
  "Kolkata",
  "Alibaug Coast, Maharashtra",
];

function formatPrice(val, listingType) {
  if (!val) return "Price on Request";
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L${listingType === "Rent" ? " / mo" : ""}`;
  }
  return `₹${num.toLocaleString("en-IN")}${listingType === "Rent" ? " / mo" : ""}`;
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, toggleWishlist, isWishlisted, count: wishlistCount } = useWishlist();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPropTitle, setSelectedPropTitle] = useState("");

  // Search & Filter State (synced with URL)
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [listingType, setListingType] = useState(searchParams.get("type") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "All");
  const [bhk, setBhk] = useState(searchParams.get("bhk") || "all");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [showWishlistOnly, setShowWishlistOnly] = useState(searchParams.get("wishlist") === "true");

  // Data State
  const [backendProperties, setBackendProperties] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [inquirySubject, setInquirySubject] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Close search suggestions on outside click or ESC key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSearchFocused(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleOpenEnquiry = (propertyOrSubject = "General Inquiry") => {
    if (propertyOrSubject && typeof propertyOrSubject === "object") {
      setSelectedProperty(propertyOrSubject);
      setInquirySubject(propertyOrSubject.title || "");
    } else {
      setSelectedProperty(null);
      setInquirySubject(propertyOrSubject || "");
    }
    setModalOpen(true);
  };

  // Fetch Property Types for filter dropdown
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/property-types`)
      .then((res) => {
        const list = res.data.data || res.data || [];
        setCategoriesList(list);
      })
      .catch(() => { });
  }, []);

  // Fetch properties from backend
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/properties/public?limit=100`);
      const list = res.data.data || res.data.properties || [];
      setBackendProperties(list);
    } catch (err) {
      console.warn("Could not reach backend properties endpoint, falling back to catalog:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Sync state to URL params
  const updateUrlParams = useCallback(
    (newParams) => {
      const p = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([k, v]) => {
        if (!v || v === "all" || v === "All" || v === false) {
          p.delete(k);
        } else {
          p.set(k, String(v));
        }
      });
      setSearchParams(p, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleQueryChange = (val) => {
    setQuery(val);
    updateUrlParams({ query: val });
  };

  const handleListingTypeChange = (val) => {
    setListingType(val);
    updateUrlParams({ type: val });
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    updateUrlParams({ category: val });
  };

  const handleCityChange = (val) => {
    setCity(val);
    updateUrlParams({ city: val });
  };

  const handleBhkChange = (val) => {
    setBhk(val);
    updateUrlParams({ bhk: val });
  };

  const handlePriceChange = (val) => {
    setPriceRange(val);
    updateUrlParams({ price: val });
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    updateUrlParams({ sort: val });
  };

  const handleWishlistToggleFilter = () => {
    const nextVal = !showWishlistOnly;
    setShowWishlistOnly(nextVal);
    updateUrlParams({ wishlist: nextVal ? "true" : undefined });
  };

  const handleResetFilters = () => {
    setQuery("");
    setListingType("all");
    setCategory("all");
    setCity("All");
    setBhk("all");
    setPriceRange("all");
    setSortBy("featured");
    setShowWishlistOnly(false);
    setSearchParams({}, { replace: true });
    toast.success("Filters cleared");
  };

  // Harmonize backend properties + curated demo properties
  const allAvailableProperties = useMemo(() => {
    const formattedBackend = backendProperties.map((p) => {
      const typeName = p.propertyType?.name || (p.listingType === "Rent" ? "Apartment" : "House");
      return {
        _id: p._id,
        id: p._id,
        propertyId: p.propertyId || ("PROP-" + String(p._id).slice(-6).toUpperCase()),
        title: p.title || "Exclusive Residence",
        category: typeName,
        listingType: p.listingType || "Sale",
        city: p.city || "Bardhaman",
        state: p.state || "West Bengal",
        address: p.address || "",
        price: Number(p.price) || 0,
        formattedPrice: formatPrice(p.price, p.listingType),
        bedrooms: Number(p.bedrooms) || 2,
        bathrooms: Number(p.bathrooms) || 2,
        area: Number(p.area) || 1200,
        images:
          p.images && p.images.length > 0
            ? p.images.map((img) => (img.startsWith("/") ? `${BACKEND_URL}${img}` : img))
            : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85"],
        description: p.description || "Premium property crafted with modern architectural detailing.",
        badge: p.isFeatured ? "Featured" : p.listingType === "Rent" ? "For Rent" : "For Sale",
        isLive: true,
        createdAt: p.createdAt || new Date().toISOString(),
      };
    });

    const combined = [...formattedBackend, ...CURATED_PROPERTIES];
    const map = new Map();
    combined.forEach((item) => {
      const key = item.id || item._id;
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  }, [backendProperties]);

  // Live intelligent suggestions for search bar
  const searchSuggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    // 1. Matching Properties (title, property code, city, address)
    const matchingProps = trimmed
      ? allAvailableProperties
        .filter(
          (p) =>
            p.title?.toLowerCase().includes(trimmed) ||
            (p.propertyId && p.propertyId.toLowerCase().includes(trimmed)) ||
            p.address?.toLowerCase().includes(trimmed)
        )
        .slice(0, 4)
      : [];

    // 2. City count mapping
    const cityCountMap = {};
    allAvailableProperties.forEach((p) => {
      if (p.city) {
        cityCountMap[p.city] = (cityCountMap[p.city] || 0) + 1;
      }
    });

    const matchingCities = trimmed
      ? Object.entries(cityCountMap)
        .filter(([c]) => c.toLowerCase().includes(trimmed))
        .slice(0, 4)
        .map(([c, count]) => ({ city: c, count }))
      : [];

    // 3. Matching Categories
    const catSet = new Set(allAvailableProperties.map((p) => p.category).filter(Boolean));
    const matchingCategories = trimmed
      ? Array.from(catSet)
        .filter((cat) => cat.toLowerCase().includes(trimmed))
        .slice(0, 3)
      : [];

    // Popular destinations when input is empty
    const popularCities = Object.entries(cityCountMap)
      .slice(0, 6)
      .map(([c, count]) => ({ city: c, count }));

    return {
      matchingProps,
      matchingCities,
      matchingCategories,
      popularCities,
      hasMatches:
        matchingProps.length > 0 ||
        matchingCities.length > 0 ||
        matchingCategories.length > 0,
    };
  }, [query, allAvailableProperties]);

  const handleSelectPropertySuggestion = (prop) => {
    handleQueryChange(prop.title);
    setSearchFocused(false);
  };

  const handleSelectCitySuggestion = (cityName) => {
    handleCityChange(cityName);
    handleQueryChange("");
    setSearchFocused(false);
  };

  const handleSelectCategorySuggestion = (catName) => {
    handleCategoryChange(catName);
    handleQueryChange("");
    setSearchFocused(false);
  };

  // Apply filters & search client-side for lightning fast responsiveness
  const filteredProperties = useMemo(() => {
    let result = [...allAvailableProperties];

    // 1. Wishlist Only filter
    if (showWishlistOnly) {
      result = result.filter((p) => isWishlisted(p.id || p._id));
    }

    // 2. Search Query filter (title, city, address, description, category)
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // 3. Listing Type filter (Sale, Rent, Lease)
    if (listingType && listingType !== "all") {
      result = result.filter((p) => p.listingType?.toLowerCase() === listingType.toLowerCase());
    }

    // 4. Category filter
    if (category && category !== "all") {
      result = result.filter((p) => {
        const cat = p.category?.toLowerCase() || "";
        const target = category.toLowerCase();
        return cat.includes(target) || target.includes(cat);
      });
    }

    // 5. City filter
    if (city && city !== "All" && city !== "all") {
      result = result.filter((p) => p.city?.toLowerCase().includes(city.toLowerCase()));
    }

    // 6. BHK filter
    if (bhk && bhk !== "all") {
      const numBhk = parseInt(bhk, 10);
      result = result.filter((p) => {
        const beds = Number(p.bedrooms) || 0;
        if (numBhk >= 4) return beds >= 4;
        return beds === numBhk;
      });
    }

    // 7. Price Range filter
    if (priceRange && priceRange !== "all") {
      const config = PRICE_RANGES.find((r) => r.value === priceRange);
      if (config) {
        result = result.filter((p) => {
          const pVal = Number(p.price) || 0;
          if (config.min !== null && pVal < config.min) return false;
          if (config.max !== null && pVal > config.max) return false;
          return true;
        });
      }
    }

    // 8. Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      // "featured" default
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [allAvailableProperties, query, listingType, category, city, bhk, priceRange, sortBy, showWishlistOnly, isWishlisted]);

  const hasActiveFilters =
    query ||
    listingType !== "all" ||
    category !== "all" ||
    city !== "All" ||
    bhk !== "all" ||
    priceRange !== "all" ||
    showWishlistOnly;

  const handleToggleWishlistWithToast = (id, title, e) => {
    e.stopPropagation();
    if (!user) {
      setSelectedPropTitle(title);
      setAuthModalOpen(true);
      return;
    }
    toggleWishlist(id).then((added) => {
      if (added) {
        toast.success(`"${title}" saved to your wishlist & user panel!`, {
          icon: "❤️",
          style: { borderRadius: "10px", background: "#111", color: "#fff", fontSize: "13px" },
        });
      } else {
        toast(`Removed from wishlist`, {
          icon: "🤍",
          style: { borderRadius: "10px", background: "#333", color: "#fff", fontSize: "13px" },
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111111] antialiased flex flex-col justify-between selection:bg-[#111111] selection:text-white">
      <Toaster position="top-right" />
      <EditorialHeader onOpenEnquiry={handleOpenEnquiry} />

      <main className="flex-1 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {/* Breadcrumb & Subtitle */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#111111] font-medium">Properties Directory</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 text-[#111111] text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">
                <Sparkles className="w-3 h-3 text-[#E05A2B]" />
                <span>Prime Nest Monograph</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal text-[#111111] leading-tight">
                All Property Listings
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                Discover residences, private villas, duplex penthouses, and commercial plots curated for modern living and high appreciation.
              </p>
            </div>

            {/* Wishlist Quick Toggle Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleWishlistToggleFilter}
                id="wishlist-filter-toggle"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all border shadow-xs ${showWishlistOnly
                  ? "bg-rose-500 text-white border-rose-500 shadow-md"
                  : "bg-white text-slate-700 hover:text-black border-slate-300 hover:border-slate-400"
                  }`}
              >
                <Heart className={`w-4 h-4 ${showWishlistOnly ? "fill-white" : "text-rose-500"}`} />
                <span>{showWishlistOnly ? "Showing Wishlist" : "My Wishlist"}</span>
                {/* <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${showWishlistOnly ? "bg-white text-rose-600" : "bg-slate-100 text-slate-800"
                    }`}
                >
                  {wishlistCount}
                </span> */}
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8 space-y-4">
          {/* Top Row: Search Input + Listing Type Tabs */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input with Live Suggestions Dropdown */}
            <div ref={searchRef} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                id="property-search-input"
                value={query}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  handleQueryChange(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search by title, property code (PROP-000001), city or locality…"
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all bg-slate-50/50"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    handleQueryChange("");
                    setSearchFocused(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl p-3 space-y-3 animate-fade-in max-h-[420px] overflow-y-auto">
                  {query.trim() ? (
                    searchSuggestions.hasMatches ? (
                      <>
                        {/* Matching Properties */}
                        {searchSuggestions.matchingProps.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              <span>Matching Properties</span>
                              <span>{searchSuggestions.matchingProps.length} found</span>
                            </div>
                            <div className="space-y-1">
                              {searchSuggestions.matchingProps.map((p) => (
                                <button
                                  key={p.id || p._id}
                                  type="button"
                                  onClick={() => handleSelectPropertySuggestion(p)}
                                  className="w-full flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 text-left transition group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {p.images?.[0] ? (
                                      <img
                                        src={p.images[0]}
                                        alt={p.title}
                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                                        {p.title}
                                      </p>
                                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{p.city}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-bold text-slate-900 block">
                                      {p.formattedPrice}
                                    </span>
                                    {p.propertyId && (
                                      <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded">
                                        {p.propertyId}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matching Cities */}
                        {searchSuggestions.matchingCities.length > 0 && (
                          <div className="border-t border-slate-100 pt-2">
                            <span className="block px-2 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              Locations & Cities
                            </span>
                            <div className="flex flex-wrap gap-1.5 px-1">
                              {searchSuggestions.matchingCities.map(({ city: c, count }) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleSelectCitySuggestion(c)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-xs font-semibold text-slate-700 border border-slate-200/80 transition cursor-pointer"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{c}</span>
                                  <span className="text-[10px] opacity-60 font-normal">({count})</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matching Categories */}
                        {searchSuggestions.matchingCategories.length > 0 && (
                          <div className="border-t border-slate-100 pt-2">
                            <span className="block px-2 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              Categories & Types
                            </span>
                            <div className="flex flex-wrap gap-1.5 px-1">
                              {searchSuggestions.matchingCategories.map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => handleSelectCategorySuggestion(cat)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-xs font-medium text-slate-700 border border-slate-200/80 transition cursor-pointer"
                                >
                                  <Tag className="w-3 h-3 text-slate-400" />
                                  <span>{cat}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-slate-600 font-medium">No direct matches for "{query}".</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try one of the popular cities below:</p>
                        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                          {searchSuggestions.popularCities.map(({ city: c }) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleSelectCitySuggestion(c)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-xs text-slate-700 transition cursor-pointer"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  ) : (
                    /* Default Suggestions when input is focused with no query typed */
                    <div>
                      <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Popular City Destinations</span>
                      </div>
                      <div className="flex flex-wrap gap-2 px-1">
                        {searchSuggestions.popularCities.map(({ city: c, count }) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleSelectCitySuggestion(c)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-xs font-semibold text-slate-700 border border-slate-200 transition cursor-pointer"
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{c}</span>
                            <span className="text-[10px] opacity-60 font-normal">({count})</span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between px-2 text-[11px] text-slate-400">
                        <span>Tip: Type property title, code (e.g. PROP-000001), or city</span>
                        <span className="font-mono text-[10px]">ESC to close</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Listing Type Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {LISTING_TYPES.map((t) => {
                const isActive = listingType === t.id;
                return (
                  <button
                    key={t.id}
                    id={`type-filter-${t.id}`}
                    onClick={() => handleListingTypeChange(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                      ? "bg-[#111111] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-black"
                      }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Detailed Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
            {/* Category Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Category
              </label>
              <select
                id="category-filter-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa / Estate</option>
                <option value="House">House</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Land">Land / Plot</option>
                <option value="Commercial">Commercial</option>
                <option value="Office">Office</option>
                {categoriesList
                  .filter(
                    (c) =>
                      !["Apartment", "Villa", "House", "Penthouse", "Land", "Commercial", "Office"].some(
                        (existing) => existing.toLowerCase() === c.name.toLowerCase()
                      )
                  )
                  .map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Location
              </label>
              <select
                id="city-filter-select"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Locations" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* BHK Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Bedrooms (BHK)
              </label>
              <select
                id="bhk-filter-select"
                value={bhk}
                onChange={(e) => handleBhkChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                {BHK_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Price Budget
              </label>
              <select
                id="price-filter-select"
                value={priceRange}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.value} value={pr.value}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Sort By
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#111111] cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Tags & Reset */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-medium">Active:</span>
                {query && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                    Query: "{query}"
                    <button onClick={() => handleQueryChange("")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {listingType !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                    {listingType === "Sale" ? "For Sale" : listingType === "Rent" ? "For Rent" : "Lease"}
                    <button onClick={() => handleListingTypeChange("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {category !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                    {category}
                    <button onClick={() => handleCategoryChange("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {city !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                    {city}
                    <button onClick={() => handleCityChange("All")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {bhk !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                    {bhk}+ BHK
                    <button onClick={() => handleBhkChange("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {showWishlistOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold">
                    Saved in Wishlist
                    <button onClick={() => setShowWishlistOnly(false)} className="hover:text-rose-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <p className="text-slate-600">
            Showing <strong className="text-[#111111] font-semibold">{filteredProperties.length}</strong>{" "}
            {filteredProperties.length === 1 ? "residence" : "residences"} matching your criteria
          </p>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop) => {
              const pid = prop.id || prop._id;
              const wishlisted = isWishlisted(pid);

              return (
                <TiltCard
                  key={pid}
                  id={`prop-card-${pid}`}
                  maxTilt={6}
                  scale={1.01}
                  speed={350}
                  className="group bg-white border border-[#E5E5E5] rounded-[18px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] cursor-pointer flex flex-col justify-between transition-all duration-300"
                  onClick={() => navigate(`/property/${pid}`)}
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={prop.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85"}
                      alt={prop.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                      <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md text-[10px] uppercase tracking-[0.16em] font-semibold text-[#111111] border border-white/60 shadow-xs">
                        {prop.listingType === "Rent" ? "For Rent" : "For Sale"}
                      </span>
                      {prop.propertyId && (
                        <span className="bg-[#111111]/90 backdrop-blur-sm px-2 py-0.5 rounded-md font-mono text-[9px] font-bold text-amber-300 tracking-wider">
                          {prop.propertyId}
                        </span>
                      )}
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      id={`wishlist-heart-${pid}`}
                      onClick={(e) => handleToggleWishlistWithToast(pid, prop.title, e)}
                      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${wishlisted
                        ? "bg-rose-500 text-white scale-110"
                        : "bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 hover:bg-white"
                        }`}
                    >
                      <Heart className={`w-4 h-4 transition-transform ${wishlisted ? "fill-current scale-105" : ""}`} />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Location Pin */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#E05A2B] shrink-0" />
                        <span className="truncate">{prop.city}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-editorial text-xl font-medium text-[#111111] group-hover:text-[#E05A2B] transition-colors line-clamp-1">
                        {prop.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {prop.description}
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          {prop.bedrooms} {prop.bedrooms === 1 ? "Bed" : "Beds"}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          {prop.bathrooms} {prop.bathrooms === 1 ? "Bath" : "Baths"}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          {prop.area ? `${Number(prop.area).toLocaleString("en-IN")} sq.ft` : "Spacious"}
                        </span>
                      </div>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                          Valuation
                        </span>
                        <span className="text-lg font-bold text-[#111111] tracking-tight">
                          {prop.formattedPrice}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id={`enquire-btn-${pid}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEnquiry(prop);
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#111111] hover:bg-[#111111] hover:text-white text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          Direct Enquiry
                        </button>
                        <div
                          className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-[#111111] group-hover:bg-[#111111] group-hover:text-white flex items-center justify-center text-[#111111] transition-all duration-300"
                          title="Open property details"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="font-editorial text-2xl font-normal text-[#111111]">
              {showWishlistOnly ? "Your Wishlist is Empty" : "No Properties Match Your Search"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {showWishlistOnly
                ? "Tap the heart icon on any property card to save your favourite homes and return to them anytime."
                : "Try loosening your search terms, changing the location, or resetting the price filters to view available listings."}
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </main>

      <EditorialFooter />

      {/* Booking / Enquiry Consultation Modal */}
      <EditorialEnquiryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProperty(null);
          setInquirySubject("");
        }}
        property={selectedProperty}
        defaultSubject={inquirySubject}
      />

      {/* Sign-In Required Modal if visitor clicks Wishlist */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        propertyTitle={selectedPropTitle}
      />
    </div>
  );
}