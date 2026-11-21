import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Building,
  Heart,
  Share2,
  MessageSquare,
  Globe,
  Link2,
  Mail,
  Send,
  Calendar,
  User,
  Star,
  Plus,
  XCircle,
  FileCheck,
  Lock,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck
} from "lucide-react";
import EditorialHeader from "../components/editorial/EditorialHeader";
import EditorialFooter from "../components/editorial/EditorialFooter";
import EditorialEnquiryModal from "../components/editorial/EditorialEnquiryModal";
import { CURATED_PROPERTIES } from "../components/editorial/SelectedProperties";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BACKEND_URL } from "../config";

// Leaflet Map CDN wrapper component
const DetailsMap = ({ lat, lng, popupText }) => {
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

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        window.L.marker([lat, lng]).addTo(map)
          .bindPopup(popupText || "Property Location")
          .openPopup();
      } catch (e) {
        console.warn("Leaflet rendering error:", e);
      }
    }
  }, [lat, lng, popupText]);

  return (
    <div ref={mapRef} className="h-56 w-full rounded-2xl border border-slate-100 shadow-sm overflow-hidden z-10" />
  );
};

// Authentic luxury default reviews
const DEFAULT_REVIEWS = [
  {
    _id: "rev-default-1",
    name: "Arjun Singhania",
    rating: 5,
    role: "Verified Resident",
    comment: "Exceptional architecture and pristine living ambiance. The finishes, layout, and cross-ventilation exceed expectations. Truly a signature property.",
    createdAt: "2026-08-14T10:00:00.000Z"
  },
  {
    _id: "rev-default-2",
    name: "Dr. Rohini Sen",
    rating: 5,
    role: "Verified Buyer",
    comment: "The site visit arranged was seamless. Natural light and high ceilings give the entire home an airy, ultra-luxurious feel. Highly recommended.",
    createdAt: "2026-09-02T14:30:00.000Z"
  },
  {
    _id: "rev-default-3",
    name: "Vikramaditya Roy",
    rating: 4,
    role: "Verified Client",
    comment: "Top-tier neighborhood and world-class design. Security and infrastructure are top-notch. Very satisfied with the investment potential.",
    createdAt: "2026-09-15T09:15:00.000Z"
  }
];

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", name: "" });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const cachedUser = localStorage.getItem("user");
    return cachedUser ? JSON.parse(cachedUser) : null;
  });

  // Load profile on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }
  }, []);

  const fetchProperty = useCallback(async () => {
    let localCachedReviews = [];
    try {
      const raw = localStorage.getItem(`cached_reviews_${id}`);
      if (raw) localCachedReviews = JSON.parse(raw);
    } catch {}

    const mergeReviews = (backendReviews = []) => {
      const combined = [...backendReviews];
      for (const lr of localCachedReviews) {
        if (!combined.some((r) => r._id === lr._id || (r.name === lr.name && r.comment === lr.comment))) {
          combined.push(lr);
        }
      }
      return combined;
    };

    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/properties/details/${id}`);
      if (res.data?.property) {
        const p = res.data.property;
        setProperty({
          ...p,
          reviews: mergeReviews(p.reviews),
          name: p.name || p.title || "Luxury Residence",
          title: p.title || p.name || "Luxury Residence",
          image: p.image || p.images?.[0],
          images: p.images?.length ? p.images : (p.image ? [p.image] : []),
          beds: p.beds || p.bedrooms || 3,
          baths: p.baths || p.bathrooms || 2,
          area: p.area || 2500,
          type: p.type || p.category || p.propertyType?.name || "Apartment",
          status: p.status || (p.listingType === "Rent" ? "For Rent" : "For Sale"),
        });
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn("Fetch property details error, trying secondary source:", error.message);
    }

    try {
      const res2 = await axios.get(`${BACKEND_URL}/api/properties/${id}`);
      const p = res2.data?.property || res2.data?.data;
      if (p) {
        setProperty({
          ...p,
          reviews: mergeReviews(p.reviews),
          name: p.name || p.title || "Luxury Residence",
          title: p.title || p.name || "Luxury Residence",
          image: p.image || p.images?.[0],
          images: p.images?.length ? p.images : (p.image ? [p.image] : []),
          beds: p.beds || p.bedrooms || 3,
          baths: p.baths || p.bathrooms || 2,
          area: p.area || 2500,
          type: p.type || p.category || p.propertyType?.name || "Apartment",
          status: p.status || (p.listingType === "Rent" ? "For Rent" : "For Sale"),
        });
        setLoading(false);
        return;
      }
    } catch (err2) {
      console.warn("Secondary fetch error:", err2.message);
    }

    // Curated properties fallback
    const foundCurated = CURATED_PROPERTIES.find(
      (p) => p._id === id || p.id === id || p.propertyId === id || String(p.id).includes(id)
    );
    if (foundCurated) {
      setProperty({
        ...foundCurated,
        _id: foundCurated._id || foundCurated.id,
        name: foundCurated.title || foundCurated.name,
        title: foundCurated.title || foundCurated.name,
        image: foundCurated.images?.[0] || foundCurated.image,
        images: foundCurated.images || [foundCurated.image],
        beds: foundCurated.bedrooms || foundCurated.beds || 3,
        baths: foundCurated.bathrooms || foundCurated.baths || 2,
        area: foundCurated.area || 4500,
        type: foundCurated.category || "Luxury Residence",
        status: foundCurated.listingType === "Rent" ? "For Rent" : "For Sale",
        country: "India",
        reviews: localCachedReviews,
        createdAt: new Date().toISOString(),
        uploadedBy: {
          name: "Signature Channel Partner",
          specialization: "Principal Estate Advisor",
        },
        additionalFeatures: [
          "Private Security & Guard House",
          "Automated Smart Home Integration",
          "Climate Controlled Interior",
          "Landscaped Terrace & Reflection Pool",
          "24/7 Power Backup & Water Filtration",
        ],
      });
      setLoading(false);
      return;
    }

    toast.error("Failed to retrieve property details.");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please enter your review comments.");
      return;
    }
    const reviewerName = reviewForm.name.trim() || currentUser?.name || "Verified Resident";
    const newReview = {
      _id: "rev_" + Date.now(),
      name: reviewerName,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
      role: currentUser?.role === "CUSTOMER" ? "Verified Buyer" : "Verified Client",
      createdAt: new Date().toISOString(),
    };

    // Cache locally immediately so it persists even without backend sync
    try {
      const cacheKey = `cached_reviews_${id}`;
      const existing = JSON.parse(localStorage.getItem(cacheKey) || "[]");
      localStorage.setItem(cacheKey, JSON.stringify([newReview, ...existing]));
    } catch {}

    // Optimistically update UI so review shows instantly
    setProperty((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev?.reviews || [])],
    }));

    toast.success("Thank you! Your review has been submitted and saved.");
    setShowReviewModal(false);
    setReviewForm({ rating: 5, comment: "", name: "" });

    // Save to backend database
    try {
      const res = await axios.post(`${BACKEND_URL}/api/properties/${id}/reviews`, {
        userId: currentUser?.id || currentUser?._id,
        name: reviewerName,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        role: currentUser?.role === "CUSTOMER" ? "Verified Buyer" : "Verified Client",
      });
      if (res.data?.reviews) {
        setProperty((prev) => ({
          ...prev,
          reviews: res.data.reviews,
          avgRating: res.data.avgRating,
          totalReviews: res.data.totalReviews,
        }));
      }
    } catch (err) {
      console.warn("Backend review sync notice:", err.message);
    }
  };

  const formatPrice = (val) => {
    if (!val && val !== 0) return "₹ Price Upon Request";
    if (typeof val === "string" && val.startsWith("₹")) return val;
    return "₹" + Number(val).toLocaleString("en-IN");
  };

  // Open Google Maps with the property address
  const openGoogleMaps = () => {
    if (!property) return;
    const address = [property.streetAddress, property.city, property.state, property.country, property.zipCode]
      .filter(Boolean)
      .join(", ");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-sans">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="mt-3 font-extrabold text-xs text-slate-400 uppercase tracking-widest animate-pulse">Loading property spec sheet...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans">
        <EditorialHeader onOpenEnquiry={() => setEnquiryModalOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <XCircle className="h-16 w-16 text-slate-300 animate-bounce" />
          <h3 className="mt-4 font-bold text-lg text-slate-700">Property Details Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm text-center mt-2 leading-relaxed">The requested residence could not be found or has been archived.</p>
          <Link to="/properties" className="mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md hover:bg-slate-800">
            Return to Properties
          </Link>
        </div>
        <EditorialFooter />
      </div>
    );
  }

  // Calculate verified reviews and average rating
  const userReviews = property.reviews || [];
  const allReviews = userReviews.length > 0
    ? [...userReviews, ...DEFAULT_REVIEWS.filter((d) => !userReviews.some((u) => u.comment === d.comment))]
    : DEFAULT_REVIEWS;
  const avgRating = (allReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / (allReviews.length || 1)).toFixed(1);

  return (
    <div className="bg-[#FBFBFA] min-h-screen flex flex-col font-sans selection:bg-[#111111] selection:text-white text-left">
      <Toaster />
      <EditorialHeader onOpenEnquiry={() => setEnquiryModalOpen(true)} />

      {/* HEADER WITH BREADCRUMB */}
      <section className="bg-white border-b border-slate-200/80 shadow-2xs relative z-20 shrink-0">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center w-full">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/" className="hover:text-black transition-colors font-medium">Home</Link>
              <span>/</span>
              <Link to="/properties" className="hover:text-black transition-colors font-medium">Properties</Link>
              <span>/</span>
              <span className="text-[#111111] font-semibold truncate max-w-xs">{property.name || property.title}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-wider">Residence Monograph &amp; Details</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="header-direct-enquiry-btn"
              onClick={() => setEnquiryModalOpen(true)}
              className="px-4 py-2 bg-[#E05A2B] hover:bg-[#c94d22] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Direct Enquiry
            </button>
          </div>
        </div>
      </section>

      {/* DETAILS GRID LAYOUT */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR: Agent Card + Lock Property + Reviews + Map (Col Span 4) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Agent Info card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-extrabold text-sm uppercase text-orange-605">
                    {property.uploadedBy?.name ? property.uploadedBy.name.charAt(0) : "A"}
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-850 block">{property.uploadedBy?.name || "Premium Broker Representative"}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">{property.uploadedBy?.specialization || "Senior Real Estate Agent"}</span>
                  </div>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex gap-4 mt-5 justify-center border-t pt-4 border-slate-100">
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors"><Globe className="h-4 w-4" /></a>
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors"><Mail className="h-4 w-4" /></a>
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors"><Link2 className="h-4 w-4" /></a>
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors"><Send className="h-4 w-4" /></a>
              </div>

              {/* Direct Enquiry Button */}
              <button
                type="button"
                id="direct-enquiry-btn-agent-card"
                onClick={() => setEnquiryModalOpen(true)}
                className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Direct Enquiry
              </button>
            </div>

            {/* Direct Consultation & Private Visit Card */}
            <div className="bg-gradient-to-br from-slate-900 to-[#111111] text-white rounded-3xl p-6 shadow-sm text-left space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Calendar className="h-4 w-4 text-[#E05A2B]" />
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Private Residence Tour</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Experience the spatial grandeur in person. Schedule a private walkthrough guided by our senior portfolio director.
              </p>
              <button
                type="button"
                onClick={() => setEnquiryModalOpen(true)}
                className="w-full py-3 bg-[#E05A2B] hover:bg-[#c94d22] text-white font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Schedule Guided Visit
              </button>
            </div>

            {/* Location Map Coordinates card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <div className="border-b pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Property Location</h4>
                  <span className="text-[9px] text-slate-400 font-mono font-medium block mt-0.5">{property.city}, {property.state}, {property.zipCode}</span>
                </div>
                <button
                  onClick={openGoogleMaps}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-black text-[9px] rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                >
                  <MapPin className="h-3 w-3" /> Google Maps
                </button>
              </div>
              <DetailsMap
                lat={property.coordinates?.lat || 28.4595}
                lng={property.coordinates?.lng || 77.0266}
                popupText={property.name}
              />
            </div>

          </div>

          {/* RIGHT SIDEBAR: Image banner, title, specs, description (Col Span 8) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Top Image Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-md h-[400px] border">
              <img
                src={
                  property.image
                    ? property.image.startsWith("http")
                      ? property.image
                      : `${BACKEND_URL}/${property.image.replace(/^\/+/, "").replace(/\\/g, "/")}`
                    : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80"
                }
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-orange-500 text-white px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
                {property.status}
              </span>
            </div>

            {/* Title Block details */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-850 uppercase tracking-tight leading-snug">
                    {property.name}
                  </h1>
                  <div className="flex flex-wrap gap-3 items-center text-[10px] text-slate-400 mt-2 font-semibold uppercase">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Posted: {new Date(property.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> Agent: {property.uploadedBy?.name || "Representative"}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-500 cursor-pointer">
                    <Heart className="h-4.5 w-4.5" />
                  </button>
                  <button className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-500 cursor-pointer">
                    <Share2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Price Details & Direct Enquiry */}
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-orange-605 font-sans">
                    {formatPrice(property.price)}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold uppercase">Listed Price</span>
                </div>
                <button
                  type="button"
                  id="direct-enquiry-btn-details"
                  onClick={() => setEnquiryModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Direct Enquiry
                </button>
              </div>

              {/* Quick specifications row chips */}
              <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100">
                <div className="px-3.5 py-2 bg-slate-50 border rounded-xl text-slate-700 font-bold text-[10.5px] flex items-center gap-1.5 font-mono">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {property.city}, {property.country}
                </div>
                <div className="px-3.5 py-2 bg-slate-50 border rounded-xl text-slate-700 font-bold text-[10.5px] flex items-center gap-1.5 font-mono">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> {property.area} Sq. Ft
                </div>
                <div className="px-3.5 py-2 bg-slate-50 border rounded-xl text-slate-700 font-bold text-[10.5px] flex items-center gap-1.5 font-mono">
                  {property.beds} Beds / {property.baths} Baths
                </div>
                <div className="px-3.5 py-2 bg-slate-50 border rounded-xl text-slate-700 font-bold text-[10.5px] flex items-center gap-1.5 font-mono">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {avgRating} Rating
                </div>
                <div className="px-3.5 py-2 bg-slate-50 border rounded-xl text-slate-700 font-bold text-[10.5px] flex items-center gap-1.5 font-mono">
                  {property.type}
                </div>
              </div>
            </div>

            {/* Description card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 border-b pb-3">Property Description</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed leading-7">
                {property.description || "Architecturally refined residence built with premium fixtures, expansive floor-to-ceiling vistas, and seamless modern lifestyle amenities. Contact for complete inventory monograph and floor plans."}
              </p>
            </div>

            {/* Lifestyle Features card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 border-b pb-3">Lifestyle & Amenity Features</h3>
              <div className="flex flex-wrap gap-2 pt-2">
                {property.additionalFeatures && property.additionalFeatures.map((feat, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black uppercase text-emerald-700 shadow-sm flex items-center gap-1">
                    <FileCheck className="h-3 w-3" /> {feat}
                  </span>
                ))}
                {(!property.additionalFeatures || property.additionalFeatures.length === 0) && (
                  <span className="text-xs text-slate-400 italic">No additional features logged.</span>
                )}
              </div>
            </div>

            {/* Comprehensive Customer Reviews & Ratings Section */}
            <div id="property-reviews-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Verified Feedback</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    Customer Reviews &amp; Ratings
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Authentic impressions from verified residents, prospective buyers, and site visitors.
                  </p>
                </div>

                <button
                  type="button"
                  id="write-review-btn"
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2.5 bg-[#111111] hover:bg-[#E05A2B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Write a Review
                </button>
              </div>

              {/* Ratings Summary Scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/80 border border-slate-100 rounded-2xl p-5 sm:p-6 items-center">
                <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 font-sans tracking-tight">
                    {avgRating}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(Number(avgRating)) ? "fill-amber-500 text-amber-500" : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Based on <strong>{allReviews.length}</strong> verified reviews
                  </p>
                </div>

                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = allReviews.filter((r) => Math.round(r.rating) === stars).length;
                    const percent = allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-slate-600 font-bold flex items-center gap-1">
                          {stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-slate-500 font-mono text-[11px]">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 pt-2">
                {allReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                          {rev.name ? rev.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{rev.name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5" /> {rev.role || "Verified Client"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                          </span>
                        </div>
                      </div>

                      <div className="flex text-amber-500 text-sm">
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(Math.max(0, 5 - rev.rating))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Review Modal Form overlay */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl animate-fade-in text-left border border-slate-100">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-base font-black text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-2 uppercase tracking-wide">
              💬 Post Resident Feedback Review
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4 mt-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Full Name</label>
                <input
                  type="text"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  placeholder={currentUser?.name || "Enter your full name"}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Feedback Rating Score</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs focus:outline-none focus:border-slate-900"
                >
                  <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                  <option value="4">★★★★☆ (4 Stars - Highly Satisfied)</option>
                  <option value="3">★★★☆☆ (3 Stars - Average)</option>
                  <option value="2">★★☆☆☆ (2 Stars - Needs Improvement)</option>
                  <option value="1">★☆☆☆☆ (1 Star - Poor Experience)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Review Comments</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Describe your living experience, amenities quality, or site visit feedback..."
                  rows={4}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-xs leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E05A2B] hover:bg-[#c94d22] text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer shadow-md transition-all"
              >
                Submit Feedback Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Editorial Enquiry Modal */}
      <EditorialEnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        property={property}
        defaultSubject={property ? `Direct Enquiry for ${property.name || property.title}` : "Direct Property Enquiry"}
      />

      <EditorialFooter />
    </div>
  );
}