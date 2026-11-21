import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaLinkedin, FaGithub, FaFacebook, FaInstagram } from "react-icons/fa";
import PrimeNestLogo from "../PrimeNestLogo";

const footerLinks = [
  { label: "Properties", href: "#properties", type: "anchor" },
  { label: "Projects", href: "#projects", type: "anchor" },
  { label: "About", href: "#about", type: "anchor" },
  { label: "Showcase", href: "#showcase", type: "anchor" },
  { label: "Privacy", to: "/privacy-policy", type: "route" },
  { label: "Terms", to: "/refund-policy", type: "route" },
];

const socials = [
  { label: "Twitter", href: "#twitter", Icon: FaTwitter },
  { label: "LinkedIn", href: "#linkedin", Icon: FaLinkedin },
  { label: "GitHub", href: "#github", Icon: FaGithub },
  { label: "Facebook", href: "#facebook", Icon: FaFacebook },
  { label: "Instagram", href: "#instagram", Icon: FaInstagram },
];

export default function EditorialFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-8xl mx-auto px-6 md:px-12 pt-4 pb-8">
        {/* Top hairline */}
        <div className="border-t border-white/15" />

        {/* Centered brand */}
        <div className="flex justify-center pt-10 pb-5">
          <Link to="/" className="inline-flex" aria-label="Prime Nest Properties home">
            <PrimeNestLogo dark size="md" showSubtitle={false} />
          </Link>
        </div>

        {/* Centered link row */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-8" aria-label="Footer">
          {footerLinks.map((link) =>
            link.type === "route" ? (
              <Link
                key={link.label}
                to={link.to}
                className="text-[14px] text-white/85 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-[14px] text-white/85 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Dotted divider */}
        <div className="border-t border-dotted border-white/25" />

        {/* Bottom row: copyright left, socials right */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/70">
            © {currentYear} PrimeNest Properties. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-white/80 hover:text-white transition-colors"
              >
                <Icon className="w-[18px] h-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
