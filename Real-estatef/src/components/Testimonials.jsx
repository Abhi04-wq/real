"use client";
import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "../config";

const REVIEWS = [
  {
    name: "Sarah Thompson",
    role: "Verified Buyer",
    time: "3 months ago",
    text: "A year ago I was struggling to keep up with my property searches, but this platform streamlined my KYC checks, EMI valuations and booking parameters seamlessly.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "Daniel Martinez",
    role: "Investor",
    time: "2 months ago",
    text: "The team was supportive and transparent throughout the process. Document registries and e-signatures were completely painless.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Emily Carter",
    role: "First-time Buyer",
    time: "4 months ago",
    text: "I had multiple options listed across cities and didn't know where to start. Their interactive pricing charts made budgeting very easy.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
  {
    name: "Michael Chen",
    role: "Commercial Partner",
    time: "3 months ago",
    text: "Professional, trustworthy, and very responsive. The analytics on micro-markets were extremely accurate. Highly recommended!",
    rating: 4,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  }
];

export default function Testimonials() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/site-visits/testimonials`);
        if (res.data.success && res.data.data?.length > 0) {
          setReviews(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      }
    };
    fetchTestimonials();
  }, []);

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const getVisibleReviews = () => {
    const visible = [];
    const count = Math.min(3, reviews.length);
    for (let i = 0; i < count; i++) {
      visible.push(reviews[(startIndex + i) % reviews.length]);
    }
    return visible;
  };

  return (
    <section className="bg-white py-24 border-b border-slate-200/60 relative overflow-hidden font-poppins">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4">
            Client Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            What Our Clients Say
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
            Real experiences from families who found their home and financial stability through our platform.
          </p>
        </div>

        {/* Testimonial Cards Slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {getVisibleReviews().map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative h-[26rem] rounded-[2.5rem] overflow-hidden group shadow-lg"
            >
              {/* Profile Background Image */}
              <img
                src={rev.img}
                alt={rev.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Bottom Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Glass/Text Content panel at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-left text-white flex flex-col justify-end min-h-[50%]">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-extrabold tracking-wide leading-snug">{rev.name}</h4>
                    <p className="text-[10px] text-white/60 font-semibold mt-0.5">{rev.time}</p>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5 text-orange-400 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating ? "fill-orange-400 text-orange-400" : "text-white/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/80 font-medium leading-relaxed mt-2 italic line-clamp-3">
                  "{rev.text}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex justify-between items-center max-w-6xl mx-auto px-2">
          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-650 flex items-center justify-center hover:bg-slate-50 hover:border-slate-350 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5]" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-650 flex items-center justify-center hover:bg-slate-50 hover:border-slate-350 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <ChevronRight className="h-4.5 w-4.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Slider Dots */}
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === startIndex ? "w-6 bg-slate-800" : "w-2.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
