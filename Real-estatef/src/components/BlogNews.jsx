import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

const FALLBACK_UPDATES = [
  {
    type: "feature-left",
    title: "The First Signs of Real Estate Bubble Damage Are Not in the Capital Cities",
    desc: "The combination of infrastructure delays and personal backing limits lit a fire in suburban corridors. Learn what local trends reveal for Q3-26 investments.",
    date: "June 24, 2026",
    author: "Marina Sherof",
    role: "Reporter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  },
  {
    type: "feature-mid",
    title: "How 7 Lines of Code Turned Into a $36 Billion Real Estate Tech Empire.",
    desc: "Yeah, it's safe to say these developers had a great sense of automation. Which isn't really surprising for us, considering their solutions for digital escrow verification.",
    author: "James Robert",
    role: "Editor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
  },
  {
    type: "feature-right-top",
    title: "To Become Happier, Ask Yourself These Two Questions Every Single Night",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
    author: "Jonathan O'Connell",
    role: "Contributor"
  },
  {
    type: "feature-right-mid",
    title: "10 Things I Stole From People Smarter Than Me in Property Trading",
    author: "Jonathan O'Connell",
    role: "Contributor"
  },
  {
    type: "feature-right-bottom",
    title: "The Absolute Blueprint to Successful Property Flipping in Metros",
    desc: "A step-by-step checklist of buying distressed assets, obtaining swift RERA clearances, and staging units for rapid closure.",
    author: "James Robert",
    role: "Editor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  }
];

export default function BlogNews() {
  const [updates, setUpdates] = useState(FALLBACK_UPDATES);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/news`);
      if (res.data.success && res.data.data.length > 0) {
          // Replace each slot individually if admin has published for that position
          const dbData = res.data.data;
          const mapped = [...FALLBACK_UPDATES];
          dbData.forEach(item => {
            const idx = mapped.findIndex(f => f.type === item.type);
            if (idx !== -1) mapped[idx] = item;
          });
          setUpdates(mapped);
        }
      } catch (err) {
        console.warn("Failed to fetch news from database, using editorial fallbacks:", err.message);
      }
    };
    fetchLatestNews();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <section id="news" className="bg-amber-50/20 py-24 border-b border-slate-200/60 font-poppins text-left">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-900/10 pb-8 mb-12 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Editorial Insights
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">
              Latest Editorial Updates
            </h2>
          </div>
        </div>

        {/* Editorial Grid Layout matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Text-only editorial highlights (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-10 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 leading-snug hover:text-orange-600 cursor-pointer transition-colors">
                {updates[0].title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {updates[0].desc}
              </p>
              <p className="text-[10px] text-slate-400 font-bold">
                He was admitted to the portal directory on {updates[0].date || "June 24, 2026"}.
              </p>
              {/* Reporter Tag */}
              <div className="flex items-center gap-2 pt-4">
                <img
                  src={getImageUrl(updates[0].avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover border"
                />
                <div>
                  <h5 className="text-[11px] font-black text-slate-850 leading-none">{updates[0].author || "Marina Sherof"}</h5>
                  <span className="text-[9px] text-slate-400 font-semibold">{updates[0].role || "Reporter"}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-4">
              <h4 className="text-lg font-black text-slate-900 leading-snug hover:text-orange-600 cursor-pointer transition-colors">
                The Founder's Guide to Actually Understanding Real Estate Users Today.
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold">
                By Jonathan O'Connell, Andrew Van Dam, Aaron Gregg and Alyssa Fowers.
              </p>
            </div>
          </div>

          {/* COLUMN 2: Central Graphic Highlight (lg:col-span-5) */}
          <div className="lg:col-span-5 border border-slate-200 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-50 border border-slate-100 mb-6">
              <img
                src={getImageUrl(updates[1].img) || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"}
                alt=""
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 leading-snug hover:text-orange-600 cursor-pointer transition-colors">
                {updates[1].title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {updates[1].desc}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <img
                  src={getImageUrl(updates[1].avatar) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover border"
                />
                <div>
                  <h5 className="text-[11px] font-black text-slate-850 leading-none">{updates[1].author || "James Robert"}</h5>
                  <span className="text-[9px] text-slate-400 font-semibold">{updates[1].role || "Editor"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: Side cards (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Top Side Mini Card */}
            <div className="grid grid-cols-3 gap-4 items-center border-b pb-6 border-slate-100">
              <div className="col-span-2 space-y-2">
                <h4 className="text-xs font-black text-slate-900 leading-snug hover:text-orange-600 cursor-pointer transition-colors">
                  {updates[2].title}
                </h4>
                <p className="text-[9px] text-slate-400 font-bold">By {updates[2].author || "Jonathan O'Connell"}</p>
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border">
                <img
                  src={getImageUrl(updates[2].img) || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"}
                  alt=""
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            </div>

            {/* Mid Side Mini Card */}
            <div className="border-b pb-6 border-slate-100 space-y-2">
              <h4 className="text-xs font-black text-slate-900 leading-snug hover:text-orange-600 cursor-pointer transition-colors">
                {updates[3].title}
              </h4>
              <p className="text-[9px] text-slate-400 font-bold">By {updates[3].author || "Jonathan O'Connell"}</p>
            </div>

            {/* Fifth Column Editorial card (Replacer of Podcast part) */}
            <div className="border border-slate-200 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-orange-500">Trending Highlight</span>
              <h4 className="text-sm font-black text-slate-900 leading-snug hover:text-orange-600 cursor-pointer transition-colors">
                {updates[4].title}
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                {updates[4].desc}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t">
                <img
                  src={getImageUrl(updates[4].avatar) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover border"
                />
                <div>
                  <h5 className="text-[10px] font-black text-slate-800 leading-none">{updates[4].author || "James Robert"}</h5>
                  <span className="text-[8px] text-slate-400 font-semibold">{updates[4].role || "Editor"}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
