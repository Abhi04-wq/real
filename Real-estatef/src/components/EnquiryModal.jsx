import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Phone, User, Mail, Building, Sparkles, ChevronDown, ShieldAlert, Key } from "lucide-react";

export default function EnquiryModal({ isOpen, onClose, defaultProjectName = "" }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    propertyType: defaultProjectName ? "Specific Project" : "Residential",
    notes: defaultProjectName ? `Interested in ${defaultProjectName}` : "",
  });
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [otpError, setOtpError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let interval;
    if (showOtpScreen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, timer]);

  if (!isOpen) return null;

  const validate = () => {
    let errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit number";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowOtpScreen(true);
      setTimer(30);
      setOtpDigits(["", "", "", ""]);
      setOtpError("");
    }
  };

  const handleOtpChange = (val, index) => {
    if (isNaN(val)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = val.substring(val.length - 1);
    setOtpDigits(newOtp);

    // Auto-focus next box
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 4) {
      setOtpError("Please enter all 4 digits");
      return;
    }
    // Simulate verification success
    setSubmitted(true);
    setShowOtpScreen(false);
  };

  const handleResendOtp = () => {
    setTimer(30);
    setOtpDigits(["", "", "", ""]);
    setOtpError("");
    // Simulate resend notification
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all duration-300 animate-fade-in z-10">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Guaranteed Response in 15 Mins</span>
          </div>
          <h3 className="text-xl font-black mt-1">Get Developer Best Price</h3>
          <p className="text-xs text-orange-100 font-medium mt-1 leading-relaxed">
            Fill in your details below and our expert channel advisor will contact you with floorplans, brochures, and pricing tables.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!showOtpScreen && !submitted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-800 outline-none placeholder-slate-400 focus:bg-white transition-all ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-slate-150 focus:border-orange-500"
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-sm font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit number"
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-800 outline-none placeholder-slate-400 focus:bg-white transition-all ${
                      errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-150 focus:border-orange-500"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-150 focus:border-orange-500 rounded-2xl text-sm font-bold text-slate-800 outline-none placeholder-slate-400 focus:bg-white transition-all ${
                      errors.email ? "border-red-500 focus:border-red-500" : "border-slate-150 focus:border-orange-500"
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.email}</p>}
              </div>

              {/* Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">What are you looking for?</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-150 focus:border-orange-500 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {defaultProjectName && <option value="Specific Project">Specific Project ({defaultProjectName})</option>}
                    <option value="Residential">Residential Flats / Villas</option>
                    <option value="Commercial">Commercial Offices / Shops</option>
                    <option value="Plots">Residential Plots</option>
                    <option value="Home Loan">Home Loan Assistance</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Message Note */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Requirements / Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tell us about budget, BHK, or immediate requirements..."
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-150 focus:border-orange-500 rounded-2xl text-sm font-bold text-slate-800 outline-none placeholder-slate-400 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* GDPR and submission button */}
              <div className="pt-2">
                <p className="text-[10px] text-slate-450 font-semibold leading-relaxed mb-4">
                  By clicking Submit, I consent to receive property offers and support alerts over Phone and SMS.
                </p>
                <button
                  type="submit"
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-sm hover:bg-orange-600 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Submit Call Request
                </button>
              </div>
            </form>
          )}

          {/* OTP Screen Panel */}
          {showOtpScreen && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 py-4">
              <div className="text-center flex flex-col items-center">
                <span className="p-3 bg-orange-50 text-orange-500 rounded-2xl mb-3 border border-orange-100">
                  <Key className="h-6 w-6" />
                </span>
                <h4 className="text-base font-black text-slate-800">Verify Mobile Number</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xs leading-relaxed">
                  We've sent a 4-digit verification OTP to <strong className="text-slate-700">+91 {formData.phone}</strong>. Enter code below to confirm.
                </p>
              </div>

              {/* 4 Digit inputs */}
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    pattern="[0-8]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className="w-12 h-12 text-center text-xl font-black bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl outline-none transition-all"
                  />
                ))}
              </div>

              {otpError && (
                <div className="text-center text-xs font-bold text-red-500 flex items-center justify-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Submits OTP */}
              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-extrabold text-sm hover:bg-slate-800 shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Verify & Submit Enquiry
                </button>

                {/* Resend Action */}
                <div className="text-center text-xs font-semibold text-slate-400">
                  {timer > 0 ? (
                    <span>Resend OTP in <strong className="text-slate-650">{timer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-orange-500 hover:text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      Resend Verification OTP
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Success Panel */}
          {submitted && (
            <div className="text-center py-8 px-4 flex flex-col items-center">
              <span className="p-4 bg-emerald-50 text-emerald-500 rounded-full mb-4 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </span>
              <h4 className="text-lg font-black text-slate-800">Enquiry Submitted Successfully!</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 max-w-xs">
                Thank you <strong className="text-slate-700">{formData.name}</strong>. Our designated project advisor for <strong>{defaultProjectName || formData.propertyType}</strong> will connect with you on <strong className="text-slate-700">+91 {formData.phone}</strong> in the next 15 minutes.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="mt-8 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
