import { Home, Mail, Phone, Clock, Send, Award } from "lucide-react";
import { FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa6";
import { Link } from "react-router-dom";
import PrimeNestLogo from "./PrimeNestLogo";

export default function Footer({ onSubscribe }) {
  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (onSubscribe) {
      onSubscribe();
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top footer row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-900">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <PrimeNestLogo variant="inline" size="md" dark={true} />
            </Link>
            <p className="text-xs leading-relaxed max-w-sm">
              PrimeNest Properties is a premier RERA-approved luxury real estate advisory, curating distinctive residences, private villas, and bespoke architectural investments.
            </p>
            <div className="flex gap-2">
              {/* Social icons */}
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl hover:text-white transition-all">
                <FaFacebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl hover:text-white transition-all">
                <FaLinkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl hover:text-white transition-all">
                <FaYoutube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:col-span-5">
            {/* Column 1 */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Properties</h4>
              <ul className="space-y-2.5 text-xs font-bold">
                <li><Link to="/properties?type=Apartment" className="hover:text-white transition-colors">Residential Apartments</Link></li>
                <li><Link to="/properties?style=Office" className="hover:text-white transition-colors">Commercial Offices</Link></li>
                <li><Link to="/properties?type=Land" className="hover:text-white transition-colors">Residential Plots</Link></li>
                <li><Link to="/properties?status=Under%20Construction" className="hover:text-white transition-colors">Under Construction</Link></li>
                <li><Link to="/properties?type=Villa" className="hover:text-white transition-colors">Premium Villas</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs font-bold">
                <li><Link to="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/#news" className="hover:text-white transition-colors">Real Estate Blog</Link></li>
                <li><Link to="/contact-support" className="hover:text-white transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5 text-xs font-bold">
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><Link to="/rera-disclaimer" className="hover:text-white transition-colors">RERA Disclaimers</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policies</Link></li>
                <li><Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Details & Newsletter */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Join Our Newsletter</h4>
            <form onSubmit={handleSubscribeSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Your email address"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500 placeholder-slate-500"
              />
              <button
                type="submit"
                className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-2.5 text-xs pt-4 font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>1800-419-7566 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>care@propestate.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Mon-Sat, 9:00 AM - 7:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-xs font-bold text-slate-500">
          <span>© 2026 PropEstate Private Limited. All rights reserved.</span>
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="flex items-center gap-1">
              <Award className="h-4 w-4 text-orange-500" />
              RERA Compliant Registry
            </span>
            <span>|</span>
            <span>PCI-DSS Transaction Secure</span>
            <span>|</span>
            <span>ISO 27001 Certified</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
