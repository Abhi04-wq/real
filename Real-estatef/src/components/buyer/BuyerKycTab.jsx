import React from "react";
import { CheckCircle, UploadCloud, Eye } from "lucide-react";

export default function BuyerKycTab({
  user,
  kycDetails,
  setKycDetails,
  kycDocs,
  uploadingField,
  handleFileUpload,
  handleKycSubmit
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h2 className="text-xl font-black tracking-tight">
          KYC Verification & Anti-Fraud Clearance
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-semibold">
          Upload identity papers and co-applicant details. Cleared KYC accounts bypass manual booking delays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleKycSubmit}
          className="lg:col-span-8 border border-slate-200/85 rounded-3xl p-6 bg-white shadow-sm text-left text-xs font-semibold space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                  Occupation Status
                </label>
                <input
                  type="text"
                  value={kycDetails.occupation}
                  onChange={(e) =>
                    setKycDetails((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                  placeholder="e.g. Software Engineer"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:bg-slate-50"
                  disabled={
                    user?.kycStatus === "verified" ||
                    user?.kycStatus === "pending"
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                  Annual Household Income (INR)
                </label>
                <input
                  type="text"
                  value={kycDetails.annualIncome}
                  onChange={(e) =>
                    setKycDetails((prev) => ({
                      ...prev,
                      annualIncome: e.target.value,
                    }))
                  }
                  placeholder="e.g. ₹ 15,0,000"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:bg-slate-50"
                  disabled={
                    user?.kycStatus === "verified" ||
                    user?.kycStatus === "pending"
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                  Income Tax PAN Number
                </label>
                <input
                  type="text"
                  value={kycDetails.panNumber}
                  onChange={(e) =>
                    setKycDetails((prev) => ({
                      ...prev,
                      panNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g. ABCDE1234F"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:bg-slate-50"
                  disabled={
                    user?.kycStatus === "verified" ||
                    user?.kycStatus === "pending"
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                  UIDAI Aadhaar Card Number
                </label>
                <input
                  type="text"
                  value={kycDetails.aadhaarNumber}
                  onChange={(e) =>
                    setKycDetails((prev) => ({
                      ...prev,
                      aadhaarNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g. 1234 5678 9012"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:bg-slate-50"
                  disabled={
                    user?.kycStatus === "verified" ||
                    user?.kycStatus === "pending"
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                  Co-Applicant Name (Optional)
                </label>
                <input
                  type="text"
                  value={kycDetails.coApplicantName}
                  onChange={(e) =>
                    setKycDetails((prev) => ({
                      ...prev,
                      coApplicantName: e.target.value,
                    }))
                  }
                  placeholder="Name"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:bg-slate-50"
                  disabled={
                    user?.kycStatus === "verified" ||
                    user?.kycStatus === "pending"
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                  Co-Applicant Phone (Optional)
                </label>
                <input
                  type="text"
                  value={kycDetails.coApplicantPhone}
                  onChange={(e) =>
                    setKycDetails((prev) => ({
                      ...prev,
                      coApplicantPhone: e.target.value,
                    }))
                  }
                  placeholder="Phone"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:bg-slate-50"
                  disabled={
                    user?.kycStatus === "verified" ||
                    user?.kycStatus === "pending"
                  }
                />
              </div>
            </div>
          </div>

          {/* Documents Upload fields */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold tracking-tight mb-4 uppercase text-slate-500">
              Required KYC Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl relative bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">
                  PAN Card Front
                </span>
                {kycDocs.panCardUrl ? (
                  <div className="mt-3 flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <a
                      href={kycDocs.panCardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-orange-500 hover:underline mt-2 flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View File
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col items-center">
                    <UploadCloud className="h-8 w-8 text-slate-400" />
                    <label className="cursor-pointer mt-2 text-[10px] font-extrabold text-orange-500 hover:underline">
                      {uploadingField === "panCardUrl"
                        ? "Uploading..."
                        : "Choose File"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          handleFileUpload(e, "panCardUrl")
                        }
                        className="hidden"
                        disabled={
                          user?.kycStatus === "verified" ||
                          user?.kycStatus === "pending"
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl relative bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Aadhaar Card Front
                </span>
                {kycDocs.aadhaarFrontUrl ? (
                  <div className="mt-3 flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <a
                      href={kycDocs.aadhaarFrontUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-orange-500 hover:underline mt-2 flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View File
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col items-center">
                    <UploadCloud className="h-8 w-8 text-slate-400" />
                    <label className="cursor-pointer mt-2 text-[10px] font-extrabold text-orange-500 hover:underline">
                      {uploadingField === "aadhaarFrontUrl"
                        ? "Uploading..."
                        : "Choose File"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          handleFileUpload(e, "aadhaarFrontUrl")
                        }
                        className="hidden"
                        disabled={
                          user?.kycStatus === "verified" ||
                          user?.kycStatus === "pending"
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl relative bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Aadhaar Card Back
                </span>
                {kycDocs.aadhaarBackUrl ? (
                  <div className="mt-3 flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <a
                      href={kycDocs.aadhaarBackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-orange-500 hover:underline mt-2 flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View File
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col items-center">
                    <UploadCloud className="h-8 w-8 text-slate-400" />
                    <label className="cursor-pointer mt-2 text-[10px] font-extrabold text-orange-500 hover:underline">
                      {uploadingField === "aadhaarBackUrl"
                        ? "Uploading..."
                        : "Choose File"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          handleFileUpload(e, "aadhaarBackUrl")
                        }
                        className="hidden"
                        disabled={
                          user?.kycStatus === "verified" ||
                          user?.kycStatus === "pending"
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user?.kycStatus !== "verified" &&
            user?.kycStatus !== "pending" && (
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-98 cursor-pointer"
              >
                Submit KYC Locker
              </button>
            )}
        </form>

        <div className="lg:col-span-4 space-y-6">
          <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50 text-xs text-slate-600 font-semibold space-y-3">
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">
              Locker Status Guide
            </h4>
            <p className="leading-relaxed">
              KYC verified buyer profiles allow direct, off-market inventory check-outs.
            </p>
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <div className="flex justify-between items-center">
                <span>Locker State</span>
                <span className="font-bold uppercase text-slate-800">
                  {user?.kycStatus || "Unsubmitted"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
