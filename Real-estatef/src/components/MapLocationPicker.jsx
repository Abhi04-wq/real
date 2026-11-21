import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";

// Modern SVG pulse map pin
const createPinIcon = () =>
  L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="position: relative; width: 36px; height: 42px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 24 24" width="36" height="42" fill="none" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
          <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#059669"/>
          <circle cx="12" cy="8" r="3.2" fill="#ffffff"/>
        </svg>
        <span style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: rgba(5, 150, 105, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

export default function MapLocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressFill,
  initialCity = "",
  initialAddress = "",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchContainerRef = useRef(null);

  const [coords, setCoords] = useState({
    lat: latitude ? Number(latitude) : null,
    lng: longitude ? Number(longitude) : null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Reverse geocode when coordinates change
  const fetchAddressFromCoords = useCallback(async (lat, lng) => {
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street =
          addr.road ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.commercial ||
          addr.residential ||
          "";
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state_district ||
          "";
        const state = addr.state || "";
        const zipCode = addr.postcode || "";
        const fullDisplay = data.display_name || "";

        setDetectedLocation({
          fullDisplay,
          address: street,
          city,
          state,
          zipCode,
        });
      }
    } catch {
      // Gracefully ignore geocoding network errors
    } finally {
      setReverseLoading(false);
    }
  }, []);

  // Update pin and notify parent
  const handlePinUpdate = useCallback(
    (lat, lng, shouldReverse = true) => {
      const formattedLat = Number(lat.toFixed(6));
      const formattedLng = Number(lng.toFixed(6));

      setCoords({ lat: formattedLat, lng: formattedLng });

      if (onChange) {
        onChange({ latitude: formattedLat, longitude: formattedLng });
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([formattedLat, formattedLng]);
      }

      if (shouldReverse) {
        fetchAddressFromCoords(formattedLat, formattedLng);
      }
    },
    [onChange, fetchAddressFromCoords]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent duplicate initialization

    // Default center: Bardhaman / West Bengal or user coordinates or India center
    const initialLat = coords.lat || 23.2324;
    const initialLng = coords.lng || 87.8615;
    const initialZoom = coords.lat && coords.lng ? 15 : 12;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // If coordinates were already provided, create initial marker
    if (coords.lat && coords.lng) {
      const marker = L.marker([coords.lat, coords.lng], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        handlePinUpdate(pos.lat, pos.lng);
      });

      markerRef.current = marker;
      fetchAddressFromCoords(coords.lat, coords.lng);
    }

    // Map Click Listener to move or place pin
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (!markerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on("dragend", (evt) => {
          const pos = evt.target.getLatLng();
          handlePinUpdate(pos.lat, pos.lng);
        });

        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      handlePinUpdate(lat, lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run once on mount

  // Sync if latitude/longitude prop change externally
  useEffect(() => {
    if (latitude && longitude) {
      const nLat = Number(latitude);
      const nLng = Number(longitude);
      if (
        !Number.isNaN(nLat) &&
        !Number.isNaN(nLng) &&
        (nLat !== coords.lat || nLng !== coords.lng)
      ) {
        setCoords({ lat: nLat, lng: nLng });
        if (mapInstanceRef.current) {
          if (!markerRef.current) {
            const marker = L.marker([nLat, nLng], {
              icon: createPinIcon(),
              draggable: true,
            }).addTo(mapInstanceRef.current);
            marker.on("dragend", (evt) => {
              const pos = evt.target.getLatLng();
              handlePinUpdate(pos.lat, pos.lng);
            });
            markerRef.current = marker;
          } else {
            markerRef.current.setLatLng([nLat, nLng]);
          }
          mapInstanceRef.current.setView([nLat, nLng], 15);
        }
      }
    }
  }, [latitude, longitude, handlePinUpdate]);

  // Debounced live suggestions as user types in map search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const q = encodeURIComponent(searchQuery.trim());
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=in&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        const list = await res.json();
        setSearchResults(list || []);
      } catch {
        // Ignore
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search places via Nominatim (on Enter or Button click)
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    try {
      const q = encodeURIComponent(searchQuery.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=in&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const list = await res.json();
      setSearchResults(list || []);
      if (list && list.length > 0) {
        selectSearchResult(list[0]);
      }
    } catch {
      // Ignore search error
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (item) => {
    const lat = Number(parseFloat(item.lat).toFixed(6));
    const lng = Number(parseFloat(item.lon).toFixed(6));

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });

      if (!markerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(mapInstanceRef.current);
        marker.on("dragend", (evt) => {
          const pos = evt.target.getLatLng();
          handlePinUpdate(pos.lat, pos.lng);
        });
        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    handlePinUpdate(lat, lng);
    setSearchResults([]);
    setSearchQuery(item.display_name.split(",")[0]);
  };

  // Locate User GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
          if (!markerRef.current) {
            const marker = L.marker([lat, lng], {
              icon: createPinIcon(),
              draggable: true,
            }).addTo(mapInstanceRef.current);
            marker.on("dragend", (evt) => {
              const p = evt.target.getLatLng();
              handlePinUpdate(p.lat, p.lng);
            });
            markerRef.current = marker;
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
        handlePinUpdate(lat, lng);
      },
      () => {
        setLocating(false);
        alert("Unable to retrieve your current location. Please allow location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Pin Property Location on Map</h4>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click or drag the pin anywhere on the map — Latitude and Longitude are captured automatically.
          </p>
        </div>

        {/* Coords pill */}
        <div className="flex items-center gap-2">
          {coords.lat && coords.lng ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                {coords.lat}, {coords.lng}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
              Click map to drop pin
            </span>
          )}
        </div>
      </div>

      {/* Search & Locate Me Bar */}
      <div ref={searchContainerRef} className="flex gap-2 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
            placeholder="Search city, neighborhood or landmark (e.g. Bardhaman, Salt Lake)…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs outline-none focus:border-slate-900 focus:bg-white transition"
          />
        </div>
        <button
          type="button"
          onClick={handleSearchSubmit}
          disabled={searching || !searchQuery.trim()}
          className="rounded-xl bg-slate-900 hover:bg-black px-3.5 py-2 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer shrink-0"
        >
          {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
        </button>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          title="Use my current GPS location"
          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition cursor-pointer shrink-0 shadow-2xs"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          ) : (
            <Crosshair className="h-3.5 w-3.5 text-emerald-600" />
          )}
          <span className="hidden sm:inline">Locate Me</span>
        </button>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-500 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSearchResult(item)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0 truncate flex items-center gap-2"
              >
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Map Box */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-inner">
        <div
          ref={mapContainerRef}
          className="h-64 sm:h-72 w-full z-0"
          style={{ background: "#e5e7eb" }}
        />

        {/* Small floating hint on top-right of map */}
        <div className="absolute top-2.5 right-2.5 z-400 rounded-lg bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-medium text-slate-700 shadow-xs border border-white/60 pointer-events-none">
          📍 Drag or click to position
        </div>
      </div>

      {/* Reverse Geocoding Address Card & Auto-Fill Action */}
      {detectedLocation && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Detected Location from Pin
            </span>
            <p className="font-semibold text-slate-800 truncate mt-0.5">
              {detectedLocation.fullDisplay}
            </p>
          </div>

          {onAddressFill && (
            <button
              type="button"
              onClick={() => onAddressFill(detectedLocation)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition shrink-0 cursor-pointer shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Auto-Fill Address Fields</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
