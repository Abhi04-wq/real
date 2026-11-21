import React from "react";
import { MapPin } from "lucide-react";
import { BACKEND_URL } from "../../config";

export default function BuyerPropertiesTab({
  projects,
  propertyFilters,
  setPropertyFilters,
  fetchAllProperties,
  allProperties,
  formatINR,
  navigate
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
            Lock & Book Real Estate Units
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Browse all platform listings, apply filters, and lock units.
          </p>
        </div>
        {projects.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 text-orange-600 px-3.5 py-1.5 rounded-xl font-extrabold text-xs">
            Active Projects: {projects.length}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Query Keyword
              </label>
              <input
                value={propertyFilters.query}
                onChange={(e) =>
                  setPropertyFilters((f) => ({
                    ...f,
                    query: e.target.value,
                  }))
                }
                placeholder="Keyword, name or description"
                className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Location
              </label>
              <input
                value={propertyFilters.location}
                onChange={(e) =>
                  setPropertyFilters((f) => ({
                    ...f,
                    location: e.target.value,
                  }))
                }
                placeholder="City, state or zip"
                className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Property Type
              </label>
              <select
                value={propertyFilters.type}
                onChange={(e) =>
                  setPropertyFilters((f) => ({
                    ...f,
                    type: e.target.value,
                  }))
                }
                className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold cursor-pointer"
              >
                <option value="all">All Types</option>
                <option>Apartment</option>
                <option>Villa</option>
                <option>Penthouse</option>
                <option>Flat</option>
                <option>House</option>
                <option>Land</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                BHK (Beds)
              </label>
              <input
                type="number"
                min={1}
                value={propertyFilters.bhk}
                onChange={(e) =>
                  setPropertyFilters((f) => ({
                    ...f,
                    bhk: e.target.value,
                  }))
                }
                placeholder="e.g. 3 BHK"
                className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Pincode
              </label>
              <input
                value={propertyFilters.pincode}
                onChange={(e) =>
                  setPropertyFilters((f) => ({
                    ...f,
                    pincode: e.target.value,
                  }))
                }
                placeholder="e.g. 110001"
                className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Exact Location Address
              </label>
              <input
                value={propertyFilters.address}
                onChange={(e) =>
                  setPropertyFilters((f) => ({
                    ...f,
                    address: e.target.value,
                  }))
                }
                placeholder="Street, locality, or landmark"
                className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Min Budget
                </label>
                <input
                  type="number"
                  value={propertyFilters.minPrice}
                  onChange={(e) =>
                    setPropertyFilters((f) => ({
                      ...f,
                      minPrice: e.target.value,
                    }))
                  }
                  placeholder="₹ Min"
                  className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Max Budget
                </label>
                <input
                  type="number"
                  value={propertyFilters.maxPrice}
                  onChange={(e) =>
                    setPropertyFilters((f) => ({
                      ...f,
                      maxPrice: e.target.value,
                    }))
                  }
                  placeholder="₹ Max"
                  className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Amenities
              </label>
              <input
                value={propertyFilters.features.join(", ")}
                onChange={(e) =>
                  setPropertyFilters((f) => ({
                    ...f,
                    features: e.target.value
                      .split(",")
                      .map((i) => i.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Comma separated amenities"
                className="mt-2 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 col-span-1 lg:w-48">
            <button
              onClick={() => fetchAllProperties(propertyFilters)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-xs uppercase transition-all cursor-pointer"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                const reset = {
                  query: "",
                  location: "",
                  type: "all",
                  status: "",
                  style: "",
                  features: [],
                  bhk: "",
                  pincode: "",
                  address: "",
                  minPrice: "",
                  maxPrice: "",
                  minSize: "",
                  maxSize: "",
                };
                setPropertyFilters(reset);
                fetchAllProperties();
              }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-2xl text-xs uppercase transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* LISTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 animate-fade-in">
        {allProperties.map((prop) => (
          <div
            key={prop._id}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-44 overflow-hidden">
              <img
                src={
                  prop.image
                    ? prop.image.startsWith("http")
                      ? prop.image
                      : `${BACKEND_URL}/${prop.image.replace(/^\/+/, "").replace(/\\/g, "/")}`
                    : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"
                }
                alt={prop.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-800 truncate">
                  {prop.name}
                </h4>
                <span className="text-[10px] uppercase font-black tracking-widest text-white bg-slate-800 px-2 py-1 rounded-xl">
                  {prop.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {[prop.streetAddress, prop.city, prop.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <div className="text-[11px] font-bold text-slate-800">
                {formatINR(prop.price)}
              </div>
              <div className="text-[10px] text-slate-500 flex flex-wrap gap-1">
                <span>{prop.type}</span>
                <span>•</span>
                <span>{prop.beds} BHK</span>
                <span>•</span>
                <span>{prop.area} sq.ft</span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const address = [
                      prop.streetAddress,
                      prop.city,
                      prop.state,
                      prop.country,
                      prop.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ");
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  className="w-full sm:w-auto p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  View on Map
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/property/${prop._id}`)}
                  className="w-full sm:w-auto p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black uppercase transition-all cursor-pointer"
                >
                  Enquire
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
