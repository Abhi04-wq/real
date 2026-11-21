import React from "react";
import { XCircle } from "lucide-react";

export default function BuyerModals({
  agreementPreviewModalOpen,
  setAgreementPreviewModalOpen,
  selectedBookingForAgreement,
  setSelectedBookingForAgreement,
  formatINR,
  selectedVisitForFeedback,
  setSelectedVisitForFeedback,
  feedbackForm,
  setFeedbackForm,
  handleFeedbackSubmit,
  rescheduleModalOpen,
  setRescheduleModalOpen,
  selectedVisitForReschedule,
  setSelectedVisitForReschedule,
  rescheduleForm,
  setRescheduleForm,
  handleReschedule
}) {
  return (
    <>
      {/* AGREEMENT PREVIEW MODAL */}
      {agreementPreviewModalOpen && selectedBookingForAgreement && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl animate-fade-in text-left border border-slate-100 flex flex-col max-h-[85vh]">
            <button
              onClick={() => {
                setAgreementPreviewModalOpen(false);
                setSelectedBookingForAgreement(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer border-0 bg-transparent outline-none"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <h3 className="text-base font-black text-slate-800 border-b pb-2 border-slate-100 flex items-center gap-1.5 uppercase">
              📜 Builder-Buyer Sale Agreement Contract
            </h3>

            <div className="flex-1 overflow-y-auto my-4 p-5 bg-slate-50 border rounded-2xl text-[11px] text-slate-700 font-mono leading-relaxed space-y-4">
              <div className="text-center font-bold text-slate-900 border-b pb-2">
                BUILDER-BUYER AGREEMENT
              </div>
              <p>
                This Agreement is made at Gurugram on this day between the Developer/Builder, hereinafter referred to as the "Promoter", and the Buyer/Allottee:
              </p>
              <div>
                <strong>Applicant Name:</strong> {selectedBookingForAgreement.buyer?.name || "Client"}<br />
                <strong>Applicant Email:</strong> {selectedBookingForAgreement.buyer?.email || "N/A"}<br />
                <strong>Allocated Inventory Number:</strong> Unit {selectedBookingForAgreement.unit?.unitNumber}<br />
                <strong>Project:</strong> {selectedBookingForAgreement.unit?.project?.name}
              </div>
              <p>
                1. The Promoter agrees to sell and the Allottee agrees to purchase the scheduled unit with specifications listed under the RERA registration.
              </p>
              <p>
                2. The total consideration value is locked upon payment of the Token Deposit of {formatINR(selectedBookingForAgreement.tokenAmountPaid)}.
              </p>
              <p>
                3. Both parties agree to execute this e-contract with cryptographic validation checks to prevent off-platform escrow bypass fraud.
              </p>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                <span>E-Sign Audit Hash: SHA-256/f7b8c9d0...</span>
                <span>Verification State: {selectedBookingForAgreement.agreementStatus || "Signature Pending"}</span>
              </div>
            </div>

            <div className="flex gap-4 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setAgreementPreviewModalOpen(false);
                  setSelectedBookingForAgreement(null);
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer border-0 outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SITE VISIT FEEDBACK MODAL */}
      {selectedVisitForFeedback && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-left border border-slate-100">
            <button
              onClick={() => setSelectedVisitForFeedback(null)}
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-700 cursor-pointer border-0 bg-transparent outline-none"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-base font-black text-slate-800 border-b pb-2 border-slate-100 uppercase">
              📝 Submit Tour Feedback
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 mt-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                  Tours Rating Score (1-5)
                </label>
                <select
                  value={feedbackForm.rating}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })
                  }
                  className="p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                  <option value="2">★★☆☆☆ (2 Stars)</option>
                  <option value="1">★☆☆☆☆ (1 Star)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                  Comments
                </label>
                <textarea
                  value={feedbackForm.comments}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, comments: e.target.value })
                  }
                  placeholder="Tell us what you liked or experienced at this site..."
                  rows={3}
                  className="p-2.5 bg-slate-50 border rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                  Buyer Interest
                </label>
                <select
                  value={feedbackForm.buyerInterest}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, buyerInterest: e.target.value })
                  }
                  className="p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="Interested">Interested</option>
                  <option value="Highly Interested">Highly Interested</option>
                  <option value="Thinking">Thinking</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && selectedVisitForReschedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-left border border-slate-100">
            <button
              onClick={() => {
                setRescheduleModalOpen(false);
                setSelectedVisitForReschedule(null);
              }}
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-700 cursor-pointer border-0 bg-transparent outline-none"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-base font-black text-slate-800 border-b pb-2 border-slate-100 uppercase">
              🗓️ Reschedule Tour
            </h3>
            <form onSubmit={handleReschedule} className="space-y-4 mt-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest">
                  Target Date
                </label>
                <input
                  type="date"
                  value={rescheduleForm.date}
                  onChange={(e) =>
                    setRescheduleForm({ ...rescheduleForm, date: e.target.value })
                  }
                  className="p-2.5 bg-slate-50 border rounded-xl cursor-pointer"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">
                  Preferred Slot
                </label>
                <select
                  value={rescheduleForm.timeSlot}
                  onChange={(e) =>
                    setRescheduleForm({ ...rescheduleForm, timeSlot: e.target.value })
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
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Reschedule Tour
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
