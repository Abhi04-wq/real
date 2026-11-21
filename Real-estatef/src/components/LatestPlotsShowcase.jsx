import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapPin, Compass, ArrowRight, Activity, Calendar } from "lucide-react";
import { BACKEND_URL } from "../config";

// Leaflet Map CDN wrapper component
const LeafletMap = ({ lat, lng, popupText }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (window.L && mapRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      try {
        const map = window.L.map(mapRef.current).setView([lat, lng], 13);
        mapInstanceRef.current = map;

        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
          }
        ).addTo(map);

        window.L.marker([lat, lng])
          .addTo(map)
          .bindPopup(popupText || "Location Coordinate")
          .openPopup();
      } catch (e) {
        console.warn("Leaflet rendering error:", e);
      }
    }
  }, [lat, lng, popupText]);

  return (
    <div
      ref={mapRef}
      className="h-[480px] w-full rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden z-10"
      style={{ minHeight: "480px" }}
    />
  );
};

export default function LatestPlotsShowcase() {
  const navigate = useNavigate();
  const [latestLayouts, setLatestLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestLayouts();
  }, []);

  const fetchLatestLayouts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/plots/latest`);
      setLatestLayouts(res.data.plots);
      if (res.data.plots.length > 0) {
        setSelectedLayout(res.data.plots[0]);
      }
    } catch (err) {
      console.error("Failed to load latest plot layouts", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 border-t border-b border-slate-200/60 py-16 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold tracking-wider rounded-full uppercase">
          Newly Listed Today
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Explore Latest Plot Divisions
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          View recently added large land parcels split into custom residential segment sizes, with real-time geographic exploration.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs">Loading listings...</p>
        </div>
      ) : latestLayouts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
          No plot layouts listed today yet. Change role to Admin or Agent to list one!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: List of latest layouts */}
          <div className="lg:col-span-6 space-y-4">
            {latestLayouts.map((layout) => {
              const vacantCount = layout.segments?.filter(s => s.status === "vacant").length || 0;
              const bookedCount = layout.segments?.filter(s => s.status === "booked").length || 0;
              const lockedCount = layout.segments?.filter(s => s.status === "locked").length || 0;

              return (
                <div
                  key={layout._id}
                  onClick={() => setSelectedLayout(layout)}
                  className={`p-5 rounded-2xl border cursor-pointer transition duration-200 bg-white ${
                    selectedLayout?._id === layout._id
                      ? "border-blue-500 shadow-md shadow-blue-50/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">
                        {layout.name} Layout ({layout.projectId?.name || "Premium Project"})
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{layout.address}</span>
                      </div>

                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {layout.totalSqft} Sqft
                    </span>
                  </div>

                  {/* Segment split progress bar */}
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-bold">
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{vacantCount} Vacant</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{lockedCount} Locked</span>
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{bookedCount} Booked</span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => navigate("/plots")}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-950/20"
            >
              <span>Explore Interactive Plot Maps</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Right panel: Leaflet Map & Info */}
          <div className="lg:col-span-6 space-y-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            {selectedLayout && (
              <>
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">{selectedLayout.name} Geography</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Plot centroid coordinates</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-xl">
                    <Compass size={14} className="animate-spin-slow" />
                    <span>Live GPS Map</span>
                  </div>
                </div>

                <LeafletMap
                  lat={selectedLayout.lat || 28.4595}
                  lng={selectedLayout.lng || 77.0266}
                  popupText={`${selectedLayout.name} Plot - ${selectedLayout.address}`}
                />

                <div className="pt-2 flex items-start gap-2 text-xs text-slate-500 leading-normal bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Activity size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>
                    This layout splits the main land parcel into {selectedLayout.segments?.length || 0} sub-segments. To schedule a site visit or book sub-plots, click the <b>Explore Interactive Plot Maps</b> button.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
