import { X, ArrowRightLeft, Star, Check, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompareProperties({ selectedIds, onRemove, onClear, projects, onEnquire }) {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  if (selectedIds.length === 0) return null;

  const selectedProjects = projects.filter((p) => selectedIds.includes(p.id));

  // Specs comparison categories
  const specRows = [
    { label: "Property Type", key: "type" },
    { label: "Starting Price", key: "price" },
    { label: "Super Area", key: "area" },
    { label: "RERA Status", key: "badge" },
    { label: "Inventory status", key: "status" },
    { label: "Customer Rating", key: "rating", isRating: true },
  ];

  return (
    <>
      {/* Floating Bottom Compare Bar */}
      <div className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-white/10 z-40 animate-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-orange-500 rounded-xl text-white shadow-md">
            <ArrowRightLeft className="h-4.5 w-4.5" />
          </span>
          <div>
            <h4 className="text-sm font-black tracking-tight">Compare Properties</h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Select up to 3 properties to compare side-by-side. ({selectedProjects.length} selected)
            </p>
          </div>
        </div>

        {/* Selected Items Thumbnails Row */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedProjects.map((p) => (
            <div key={p.id} className="flex items-center gap-2 bg-white/5 border border-white/10 pr-2.5 pl-1.5 py-1 rounded-xl relative group">
              <img
                src={p.img}
                alt={p.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-[10px] font-black text-slate-200 truncate max-w-[80px]">
                {p.name.split(" ")[0]}
              </span>
              <button
                onClick={() => onRemove(p.id)}
                className="p-0.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add filler slot if less than 3 */}
          {selectedProjects.length < 3 && (
            <div className="hidden sm:flex items-center justify-center border border-dashed border-white/20 text-white/40 font-bold text-[10px] px-4 py-2.5 rounded-xl bg-white/[0.02]">
              Add {3 - selectedProjects.length} more
            </div>
          )}
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            Compare Now
          </button>
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal content body */}
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all duration-300 animate-fade-in z-10 flex flex-col max-h-[90vh]">
            
            {/* Header section */}
            <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b border-white/5 flex-shrink-0">
              <div>
                <h3 className="text-lg font-black tracking-tight">Compare Properties side-by-side</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Detailed comparison matrix based on verify statistics, pricing, and structural amenities.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Matrix comparison Table body (scrollable) */}
            <div className="overflow-y-auto p-6 flex-1">
              <div className="grid grid-cols-12 gap-4 border-b border-slate-100 pb-6 mb-6 items-end">
                {/* Column header labels */}
                <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider pb-2">
                  Specification
                </div>
                {/* Project cards columns */}
                {selectedProjects.map((p) => (
                  <div key={p.id} className={`col-span-${Math.floor(9 / selectedProjects.length)} text-center space-y-3`}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-[180px] mx-auto">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 tracking-tight truncate px-1">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-tight truncate">
                        {p.location || [p.streetAddress, p.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specification Grid Rows */}
              <div className="space-y-4">
                {specRows.map((row) => (
                  <div key={row.key} className="grid grid-cols-12 gap-4 py-2 border-b border-slate-50 items-center hover:bg-slate-50/50 rounded-lg px-2">
                    <div className="col-span-3 text-xs font-bold text-slate-500">
                      {row.label}
                    </div>
                    {selectedProjects.map((p) => (
                      <div key={p.id} className={`col-span-${Math.floor(9 / selectedProjects.length)} text-center text-xs font-black text-slate-800`}>
                        {row.isRating ? (
                          <div className="flex items-center justify-center gap-1 text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            <span>{p.rating}</span>
                          </div>
                        ) : (
                          <span>{p[row.key]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Amenities Comparison Row */}
                <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-50 items-start hover:bg-slate-50/50 rounded-lg px-2">
                  <div className="col-span-3 text-xs font-bold text-slate-500 mt-1">
                    Key Amenities
                  </div>
                  {selectedProjects.map((p) => (
                    <div key={p.id} className={`col-span-${Math.floor(9 / selectedProjects.length)} flex flex-col items-center gap-1.5`}>
                      {(p.amenities || ["Smart Automation", "24x7 Security", "Power Backup"]).map((am) => (
                        <span key={am} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>{am}</span>
                        </span>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Direct Action trigger Call Row */}
                <div className="grid grid-cols-12 gap-4 pt-6">
                  <div className="col-span-3" />
                  {selectedProjects.map((p) => (
                    <div key={p.id} className={`col-span-${Math.floor(9 / selectedProjects.length)} flex justify-center`}>
                      <button
                        onClick={() => {
                          setModalOpen(false);
                          const token = localStorage.getItem("token");
                          if (token) {
                            navigate(`/property/${p.id}`);
                          } else {
                            navigate("/login");
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Enquire
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
