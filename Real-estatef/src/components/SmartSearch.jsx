import { useState, useRef, useEffect } from "react";
import { Search, MapPin, ChevronDown, Check, Sparkles, Building } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_URL } from "../config";

const CITIES = [
  { name: "Kolkata", code: "CCU", regions: ["New Town", "Salt Lake Sector V", "Rajarhat", "EM Bypass", "Garia", "Tollygunge", "Dum Dum"] },
  { name: "Mumbai", code: "BOM", regions: ["Andheri West", "Bandra Kurla Complex", "Thane West", "Navi Mumbai", "Borivali", "Worli", "Juhu"] },
  { name: "Delhi NCR", code: "DEL", regions: ["Noida Sector 62", "Gurugram Phase 3", "Connaught Place", "Dwarka", "Vasant Kunj", "South Ext"] },
  { name: "Bangalore", code: "BLR", regions: ["Whitefield", "Indiranagar", "Koramangala", "HSR Layout", "Electronic City", "Jayanagar"] },
  { name: "Pune", code: "PNQ", regions: ["Hinjewadi", "Kharadi", "Viman Nagar", "Baner", "Hadapsar", "Kothrud"] },
  { name: "Hyderabad", code: "HYD", regions: ["Gachibowli", "Hitec City", "Madhapur", "Jubilee Hills", "Kondapur", "Secunderabad"] },
  { name: "Chennai", code: "MAA", regions: ["Adyar", "OMR", "Velachery", "T Nagar", "Anna Nagar", "Guindy", "Tambaram"] },
  { name: "Ahmedabad", code: "AMD", regions: ["SG Highway", "Bopal", "Prahlad Nagar", "Satellite", "Ghatlodia", "C G Road"] },
  { name: "Gurugram", code: "DEL", regions: ["DLF Phase 3", "Golf Course Road", "Sohna Road", "Sector 48", "Sector 56", "Sector 29"] },
  { name: "Noida", code: "DEL", regions: ["Sector 62", "Sector 150", "Sector 50", "Sector 18", "Sector 137", "Greater Noida"] },
  { name: "Chandigarh", code: "IXC", regions: ["Sector 17", "Sector 35", "Mohali", "Panchkula", "Zirakpur", "Sector 22"] },
  { name: "Jaipur", code: "JAI", regions: ["Malviya Nagar", "Vaishali Nagar", "C Scheme", "Jagatpura", "Mansarovar", "Tonk Road"] },
];

export default function SmartSearch({ onSearch }) {
  const [activeTab, setActiveTab] = useState("Buy");
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [searchVal, setSearchVal] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showSuggestDropdown, setShowSuggestDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const cityRef = useRef(null);
  const suggestRef = useRef(null);
  const [dbProjects, setDbProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/properties/projects`);
        setDbProjects(res.data.projects);
      } catch (err) {
        console.warn("Could not load projects for autocomplete:", err.message);
      }
    };
    loadProjects();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (suggestRef.current && !suggestRef.current.contains(event.target)) {
        setShowSuggestDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute suggestions when typing
  useEffect(() => {
    if (searchVal.trim() === "") {
      // Show default region suggestions for selected city when input empty
      const defaultSuggests = selectedCity.regions.map(r => ({
        isProject: false,
        text: `${r}, ${selectedCity.name}`,
        value: `${r}, ${selectedCity.name}`
      }));
      setSuggestions(defaultSuggests);
    } else {
      const match = [];
      const query = searchVal.toLowerCase();

      // Match listed projects name, location details, or pincode
      dbProjects.forEach((p) => {
        if (
          p.name.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          (p.pincode && p.pincode.toLowerCase().includes(query))
        ) {
          match.push({
            isProject: true,
            project: p,
            text: `${p.name} (${p.type}) [PIN: ${p.pincode || "N/A"}]`,
            value: p.name
          });
        }
      });

      // Match current city regions as fallbacks
      selectedCity.regions.forEach((r) => {
        if (r.toLowerCase().includes(query)) {
          match.push({
            isProject: false,
            text: `${r}, ${selectedCity.name}`,
            value: `${r}, ${selectedCity.name}`
          });
        }
      });

      // Match other cities
      CITIES.forEach((c) => {
        if (c.name !== selectedCity.name) {
          c.regions.forEach((r) => {
            if (r.toLowerCase().includes(query)) {
              match.push({
                isProject: false,
                text: `${r}, ${c.name}`,
                value: `${r}, ${c.name}`
              });
            }
          });
        }
      });

      setSuggestions(match);
    }
  }, [searchVal, selectedCity, dbProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        tab: activeTab,
        city: selectedCity.name,
        query: searchVal || selectedCity.regions[0]
      });
    }
  };

  const handleTabClick = (tabName) => {
    if (tabName === "Projects") {
      window.location.href = "/properties";
    } else if (tabName === "Valuation") {
      const emiSection = document.getElementById("emi-calculator-section");
      if (emiSection) {
        emiSection.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#emi-calculator-section";
      }
    } else if (tabName === "Agents") {
      window.location.href = "/agents";
    } else {
      setActiveTab(tabName);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-slate-950/20 transform translate-y-0 transition-all duration-300 relative z-30">
      {/* Search Tabs with Dark SquareYards theme */}
      <div className="flex bg-[#0b1329]/97 border-b border-white/5 overflow-x-auto scrollbar-none rounded-t-3xl">
        {[
          { name: "Buy" },
          { name: "Projects" },
          { name: "Valuation", badge: "NEW" },
          { name: "Agents" }
        ].map((tab) => (
          <button
            key={tab.name}
            type="button"
            onClick={() => handleTabClick(tab.name)}
            className={`relative flex-1 min-w-[90px] py-4 text-xs sm:text-sm font-bold border-none transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 ${activeTab === tab.name
              ? "bg-white text-slate-900 font-extrabold"
              : "text-white/85 hover:text-white hover:bg-white/5"
              }`}
          >
            <span>{tab.name}</span>
            {tab.badge && (
              <span className="absolute -top-0.5 right-1.5 text-[8px] font-black tracking-tight text-[#0b1329] bg-yellow-450 px-1.5 py-0.5 rounded scale-90 select-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSearchSubmit} className="p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center relative z-20">
        {/* City Select Button */}
        <div ref={cityRef} className="relative w-full md:w-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="w-full flex items-center justify-between gap-1.5 px-4 py-3 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-350 rounded-2xl text-left transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-orange-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">{selectedCity.name}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showCityDropdown ? "rotate-180 text-orange-500" : ""}`} />
          </button>

          {/* City Dropdown panel */}
          {showCityDropdown && (
            <div className="absolute left-0 mt-2 w-[340px] md:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-150 p-4.5 z-50 animate-fade-in">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">Popular Indian Cities</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CITIES.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCityDropdown(false);
                      setSearchVal(""); // reset search input
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all duration-150 ${selectedCity.name === city.name
                      ? "bg-orange-50 text-orange-600 font-extrabold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <span>{city.name}</span>
                    {selectedCity.name === city.name && <Check className="h-3.5 w-3.5 text-orange-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block h-6 w-px bg-slate-200" />

        {/* Autocomplete Input */}
        <div ref={suggestRef} className="relative flex-1 w-full">
          <div className="flex items-center gap-2 px-2 py-1 bg-transparent rounded-2xl">
            <Search className="h-4.5 w-4.5 text-slate-450 flex-shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => setShowSuggestDropdown(true)}
              placeholder='Search by "Locality"'
              className="w-full border-none outline-none focus:ring-0 text-xs sm:text-sm font-extrabold text-slate-800 placeholder-slate-400 bg-transparent mt-0.5"
            />
          </div>

          {/* Autocomplete suggestions */}
          {showSuggestDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-150 overflow-y-auto z-50 animate-fade-in max-h-72">
              <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Locations & Projects</span>
                {/* <span className="text-[10px] text-slate-350 font-bold flex items-center gap-0.5"><Sparkles className="h-3 w-3 text-orange-500" /> Smart Match</span> */}
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (s.isProject) {
                      // Redirect directly to properties with project selected
                      window.location.href = `/properties?project=${s.project._id}&query=${encodeURIComponent(s.project.name)}&city=All`;
                    } else {
                      setSearchVal(s.value);
                      setShowSuggestDropdown(false);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 hover:text-orange-600 z-300 transition-colors"
                >
                  {s.isProject ? (
                    <Building className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  ) : (
                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  )}
                  {s.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buttons right panel */}
        <div className="flex gap-2 w-full md:w-auto items-center justify-end flex-shrink-0">
          {/* Yellow Search Button */}
          <button
            type="submit"
            className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-[#0b1329] rounded-full font-black text-xs sm:text-sm shadow-md shadow-yellow-500/10 active:scale-95 transition-all duration-150 cursor-pointer text-center"
          >
            Search
          </button>
        </div>
      </form>

      {/* Popular suggestion links */}
      <div className="px-4 pb-3.5 pt-0.5 flex flex-wrap gap-2 items-center bg-slate-50/30 text-xs font-bold text-slate-500 border-t border-slate-50 rounded-b-3xl">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Popular Searches:</span>
        {selectedCity.regions.slice(0, 3).map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => setSearchVal(`${reg}, ${selectedCity.name}`)}
            className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-150 hover:border-orange-200 hover:text-orange-600 rounded-lg text-slate-600 transition-all duration-150"
          >
            {reg}
          </button>
        ))}
      </div>
    </div>
  );

}
