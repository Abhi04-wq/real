import React from "react";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../../config";

export default function BuyerVisitsTab({
  topFormRef,
  handleBookVisit,
  visitForm,
  setVisitForm,
  user,
  myLocks,
  visits,
  setSelectedVisitForFeedback,
  handleOpenChat,
  setSelectedVisitForReschedule,
  setRescheduleForm,
  setRescheduleModalOpen,
  exploreProjectsOpen,
  setExploreProjectsOpen,
  formatINR
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in" ref={topFormRef}>
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
          Site Visits Scheduler
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-semibold">
          Arrange a physical site tour or virtual walkthrough with a dedicated property representative.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleBookVisit}
          className="lg:col-span-5 lg:sticky lg:top-6 self-start space-y-4 border border-slate-200/85 rounded-3xl p-6 bg-white shadow-sm text-left text-xs font-semibold"
        >
          <h3 className="font-black text-sm text-slate-800 pb-2 border-b">
            Schedule a Property Walkthrough
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                value={visitForm.fullName}
                onChange={(e) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder={user?.name || "e.g. John Doe"}
                className="p-2.5 bg-slate-50 border rounded-xl"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                Mobile Number
              </label>
              <input
                type="text"
                value={visitForm.mobileNumber}
                onChange={(e) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    mobileNumber: e.target.value,
                  }))
                }
                placeholder={user?.phone || "e.g. +91 98765 43210"}
                className="p-2.5 bg-slate-50 border rounded-xl"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              value={visitForm.email}
              onChange={(e) =>
                setVisitForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder={user?.email || "e.g. john@domain.com"}
              className="p-2.5 bg-slate-50 border rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
              Target Locked Property
            </label>
            <select
              value={visitForm.propertyId ? `property_${visitForm.propertyId}` : (visitForm.plotId ? `plot_${visitForm.plotId}_${visitForm.plotSegmentId}` : "")}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setVisitForm((prev) => ({ ...prev, propertyId: "", plotId: "", plotSegmentId: "", projectId: "" }));
                  return;
                }
                const [type, id1, id2] = val.split("_");
                if (type === "property") {
                  const selectedLock = myLocks.find(l => l.property?._id === id1);
                  setVisitForm((prev) => ({
                    ...prev,
                    propertyId: id1,
                    plotId: "",
                    plotSegmentId: "",
                    projectId: selectedLock?.property?.project || "",
                  }));
                } else if (type === "plot") {
                  const selectedLock = myLocks.find(l => l.plot?._id === id1 && l.plotSegmentId === id2);
                  setVisitForm((prev) => ({
                    ...prev,
                    propertyId: "",
                    plotId: id1,
                    plotSegmentId: id2,
                    projectId: selectedLock?.plot?.projectId || "",
                  }));
                }
              }}
              className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer"
              required
            >
              <option value="">-- Choose Your Locked Property / Plot --</option>
              {myLocks
                .filter(l => ["pending_admin", "admin_approved", "agent_assigned", "agent_accepted"].includes(l.status))
                .map((l) => {
                  if (l.property) {
                    return (
                      <option key={`prop_${l.property._id}`} value={`property_${l.property._id}`}>
                        [PROPERTY] {l.property.name} ({l.property.city}) - Status: {l.status.replace("_", " ")}
                      </option>
                    );
                  } else if (l.plot) {
                    const segmentObj = l.plot.segments?.find(s => s._id === l.plotSegmentId);
                    return (
                      <option key={`plot_${l.plot._id}_${l.plotSegmentId}`} value={`plot_${l.plot._id}_${l.plotSegmentId}`}>
                        [PLOT] {l.plot.name} - Segment #{segmentObj?.plotNumber || "Plot"} ({l.plot.address}) - Status: {l.status.replace("_", " ")}
                      </option>
                    );
                  }
                  return null;
                })}
            </select>

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                Target Date
              </label>
              <input
                type="date"
                value={visitForm.date}
                onChange={(e) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                Preferred Slot
              </label>
              <select
                value={visitForm.timeSlot}
                onChange={(e) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    timeSlot: e.target.value,
                  }))
                }
                className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer"
                required
              >
                <option value="10:00 AM - 12:00 PM">10 AM - 12 PM</option>
                <option value="12:00 PM - 02:00 PM">12 PM - 02 PM</option>
                <option value="02:00 PM - 04:00 PM">02 PM - 04 PM</option>
                <option value="04:00 PM - 06:00 PM">04 PM - 06 PM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                Walkthrough Type
              </label>
              <select
                value={visitForm.visitType}
                onChange={(e) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    visitType: e.target.value,
                  }))
                }
                className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer"
              >
                <option value="physical">Physical Tour</option>
                <option value="virtual">Virtual Guided Call</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                Visitors Count
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={visitForm.visitorsCount}
                onChange={(e) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    visitorsCount: Number(e.target.value),
                  }))
                }
                className="p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
              Remarks / Special Request
            </label>
            <input
              type="text"
              value={visitForm.remarks}
              onChange={(e) =>
                setVisitForm((prev) => ({
                  ...prev,
                  remarks: e.target.value,
                }))
              }
              placeholder="e.g. Need physical wheelchair assistance."
              className="p-2.5 bg-slate-50 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-655 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs shadow-sm cursor-pointer active:scale-98 transition-all"
          >
            Book Free Property Tour
          </button>
        </form>

        {/* Tour List (Buyer) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-black text-sm text-slate-800 pb-2 border-b text-left">
            Your Scheduled Tours
          </h3>

          {visits.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white border rounded-3xl border-dashed">
              No tours scheduled. Select a project location and slot above to book a site visit.
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((v) => (
                <div
                  key={v._id}
                  className="border border-slate-200 bg-white rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold"
                >
                  <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100">
                    <div className="text-left">
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          v.visitType === "physical"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {v.visitType} Tour
                      </span>
                      <h4 className="font-black text-sm text-slate-855 mt-1">
                        {v.property?.name || (v.plot ? `${v.plot.name} - Segment #${v.plot.segments?.find(s => s._id === v.plotSegmentId)?.plotNumber || "Plot"}` : v.project?.name || "Emerald Bay Greens")}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {v.property?.city || v.plot?.address || v.project?.location}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        v.status === "completed"
                          ? "bg-green-150 text-green-707 border border-green-205"
                          : v.status === "cancelled"
                            ? "bg-red-50 text-red-655 border border-red-100"
                            : v.status === "in_progress"
                              ? "bg-teal-50 text-teal-700 border border-teal-100 animate-pulse"
                              : "bg-orange-50 text-orange-655 border border-orange-100"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                        Date & Preferred Slot
                      </span>
                      <span className="font-extrabold text-slate-750 block mt-0.5">
                        {v.date} • {v.timeSlot}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                        Assigned Representative
                      </span>
                      <span className="font-extrabold text-slate-750 block mt-0.5">
                        {v.assignedAgent ? (
                          <span className="text-emerald-600 font-black">
                            {v.assignedAgent.name} ({v.assignedAgent.phone})
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium italic">
                            Pending balanced assignment...
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Secure verification OTP */}
                  {v.status === "confirmed" && v.otp && (
                    <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow">
                      <div className="text-left">
                        <span className="text-[9px] font-black uppercase tracking-wider text-orange-400 block">
                          🔑 Secure Verification Code
                        </span>
                        <p className="text-[10px] text-slate-300 font-medium mt-0.5 leading-relaxed max-w-xs">
                          Read this 6-digit OTP to the agent at the project site to authorize check-in logs.
                        </p>
                      </div>
                      <div className="px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl font-mono text-xl font-black tracking-widest text-orange-400">
                        {v.otp}
                      </div>
                    </div>
                  )}

                  {/* Walkthrough In Progress */}
                  {v.status === "in_progress" && (
                    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-left text-teal-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-ping inline-block" />
                        <span className="font-black text-[10px] uppercase tracking-wider">
                          Walkthrough Tour In Progress
                        </span>
                      </div>
                      <p className="text-[10px] text-teal-700 font-medium mt-1 leading-relaxed">
                        Check-in logged. Awaiting checkout complete.
                      </p>
                    </div>
                  )}

                  {/* Review site tour */}
                  {(v.status === "completed" || v.status === "follow_up") && (
                    <div className="bg-slate-50 border rounded-2xl p-4 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-slate-800 block">
                          Tour Finished Successfully
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">
                          Check-out logged. Submit review of your tour to advance to lead pipeline.
                        </span>
                      </div>
                      {v.buyerRating ? (
                        <div className="flex text-amber-500 font-bold items-center gap-1">
                          {"★".repeat(v.buyerRating)}
                          <span className="text-[10px] text-slate-455 font-normal">
                            ({v.buyerRating}/5 Rated)
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedVisitForFeedback(v)}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-855 text-white rounded-xl font-bold cursor-pointer transition-colors"
                        >
                          Submit Review
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-50">
                    {v.assignedAgent && (
                      <button
                        onClick={() => handleOpenChat(v.assignedAgent)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold transition-all cursor-pointer"
                      >
                        Chat with Agent
                      </button>
                    )}

                    {(v.status === "pending" || v.status === "confirmed") && (
                      <button
                        onClick={() => {
                          setSelectedVisitForReschedule(v);
                          setRescheduleForm({
                            date: v.date,
                            timeSlot: v.timeSlot,
                          });
                          setRescheduleModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Explore Projects Section */}
      <div className="pt-8 border-t border-slate-200 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setExploreProjectsOpen(!exploreProjectsOpen)}
          className="group px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
        >
          <span>✨ {exploreProjectsOpen ? "Collapse Projects Selection" : "Explore Projects"}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            {exploreProjectsOpen ? "▲" : "▼"}
          </span>
        </button>

        <div
          className={`w-full mt-6 transition-all duration-500 ease-in-out overflow-hidden ${
            exploreProjectsOpen
              ? "max-h-[2500px] opacity-100 scale-100 translate-y-0"
              : "max-h-0 opacity-0 scale-95 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-6">
            <div className="mb-6 text-left">
              <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">
                🔒 Your Gated & Locked Properties
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                Select a property card below to pre-fill it in the site visit scheduler above.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myLocks
                .filter(l => ["pending_admin", "admin_approved", "agent_assigned", "agent_accepted"].includes(l.status))
                .length > 0 ? (
                myLocks
                  .filter(l => ["pending_admin", "admin_approved", "agent_assigned", "agent_accepted"].includes(l.status))
                  .map((l) => {
                    if (l.property) {
                      const p = l.property;
                      const isSelected = visitForm.propertyId === p._id;
                      return (
                        <div
                          key={l._id}
                          onClick={() => {
                            setVisitForm((prev) => ({
                              ...prev,
                              propertyId: p._id,
                              plotId: "",
                              plotSegmentId: "",
                              projectId: p.project || "",
                            }));
                            toast.success(`Selected property: ${p.name}`);
                            if (topFormRef.current) {
                              topFormRef.current.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }
                          }}
                          className={`group border rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col ${
                            isSelected
                              ? "border-orange-500 ring-2 ring-orange-500/20"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="h-44 overflow-hidden bg-slate-100 relative shrink-0">
                            <img
                              src={p.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"}
                              alt={p.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                {p.type}
                              </span>
                              <span className="px-2.5 py-1 bg-orange-50 text-white text-[8px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                {l.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          <div className="p-5 flex flex-col flex-1 text-left justify-between">
                            <div className="space-y-2">
                              <h4 className="font-black text-sm text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                                {p.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                                {p.style} style
                              </p>
                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 font-semibold">
                                {p.description}
                              </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <span className="text-[10px] font-bold">📍 {p.streetAddress}, {p.city}</span>
                              </div>

                              <div className="flex items-center justify-between gap-3 pt-1">
                                <div className="flex flex-col">
                                  <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">
                                    Total Value
                                  </span>
                                  <span className="text-xs font-black text-slate-800">
                                    {formatINR(p.price)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-wide rounded-xl shadow-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-orange-500 text-white"
                                      : "bg-slate-900 text-white hover:bg-slate-850"
                                  }`}
                                >
                                  {isSelected ? "Selected" : "Select Property"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (l.plot) {
                      const p = l.plot;
                      const segmentObj = p.segments?.find(s => s._id === l.plotSegmentId);
                      const isSelected = visitForm.plotId === p._id && visitForm.plotSegmentId === l.plotSegmentId;
                      return (
                        <div
                          key={l._id}
                          onClick={() => {
                            setVisitForm((prev) => ({
                              ...prev,
                              propertyId: "",
                              plotId: p._id,
                              plotSegmentId: l.plotSegmentId,
                              projectId: p.projectId || "",
                            }));
                            toast.success(`Selected plot segment: ${segmentObj?.plotNumber || "Plot"}`);
                            if (topFormRef.current) {
                              topFormRef.current.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }
                          }}
                          className={`group border rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col ${
                            isSelected
                              ? "border-orange-500 ring-2 ring-orange-500/20"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="h-44 overflow-hidden bg-slate-100 relative shrink-0">
                            <img
                              src={
                                p.highlightedImageUrl
                                  ? (p.highlightedImageUrl.startsWith("http")
                                      ? p.highlightedImageUrl
                                      : `${BACKEND_URL}/${p.highlightedImageUrl.startsWith("/") ? p.highlightedImageUrl.slice(1) : p.highlightedImageUrl}`)
                                  : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
                              }
                              alt={p.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                PLOT SEGMENT #{segmentObj?.plotNumber}
                              </span>
                              <span className="px-2.5 py-1 bg-orange-50 text-white text-[8px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                {l.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          <div className="p-5 flex flex-col flex-1 text-left justify-between">
                            <div className="space-y-2">
                              <h4 className="font-black text-sm text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                                {p.name} - Segment #{segmentObj?.plotNumber}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                                Area: {segmentObj?.totalSqft} Sqft
                              </p>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                                Premium plot segment layout block. Scheduled site tour is fully GPS coordinate authorized.
                              </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-105 space-y-3">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <span className="text-[10px] font-bold">📍 {p.address}</span>
                              </div>

                              <div className="flex items-center justify-between gap-3 pt-1">
                                <div className="flex flex-col">
                                  <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">
                                    Base Value
                                  </span>
                                  <span className="text-xs font-black text-slate-800">
                                    {formatINR(segmentObj?.basePrice || 0)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-wide rounded-xl shadow-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-orange-500 text-white"
                                      : "bg-slate-900 text-white hover:bg-slate-850"
                                  }`}
                                >
                                  {isSelected ? "Selected" : "Select Plot"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })

              ) : (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white border rounded-3xl border-dashed">
                  No locked properties found. Please go lock a property to schedule visits.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
