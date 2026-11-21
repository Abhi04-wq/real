import React, { useState } from "react";
import EditorialHeader from "../components/editorial/EditorialHeader";
import EditorialFooter from "../components/editorial/EditorialFooter";
import EditorialAbout from "../components/editorial/EditorialAbout";
import EditorialEnquiryModal from "../components/editorial/EditorialEnquiryModal";
import { ShieldCheck, Users, Award } from "lucide-react";

export default function AboutUs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");

  const handleOpenEnquiry = (subject = "Enterprise Platform Advisory") => {
    setInquirySubject(subject);
    setModalOpen(true);
  };

  const handleCloseEnquiry = () => {
    setModalOpen(false);
    setInquirySubject("");
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F5F3ED] antialiased selection:bg-[#D6A85F] selection:text-[#07111F]">
      {/* Editorial Navigation */}
      <EditorialHeader onOpenEnquiry={handleOpenEnquiry} />

      <main>
        {/* Core Redesigned Enterprise Real Estate Management Software Section */}
        <EditorialAbout onOpenEnquiry={handleOpenEnquiry} />

        {/* Enterprise Governance, Escrow & Compliance Framework in Deep Navy */}
        <section className="relative py-20 bg-[#0C1929] border-t border-[#D6A85F]/20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#D6A85F] font-semibold block mb-2">
                GOVERNANCE &amp; ARCHITECTURE
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-[#F5F3ED] tracking-tight">
                Institutional Integrity, Built for Scale.
              </h3>
              <p className="text-sm text-[#9BA9B8] mt-3 leading-relaxed">
                Operating at the intersection of regulatory RERA compliance, digital escrow ledgers, and institutional asset management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-6 shadow-lg">
                <div className="p-2.5 rounded-xl bg-[#142A42] border border-[#D6A85F]/25 text-[#6FA58A] w-fit mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-[#F5F3ED]">
                  RERA Compliance Engine
                </h4>
                <p className="text-xs text-[#9BA9B8] mt-2 leading-relaxed">
                  Every asset portfolio and project unit is verified against active state RERA registries, digital land records, and escrow title disclosures.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-6 shadow-lg">
                <div className="p-2.5 rounded-xl bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F] w-fit mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-[#F5F3ED]">
                  Autonomous Agent Network
                </h4>
                <p className="text-xs text-[#9BA9B8] mt-2 leading-relaxed">
                  Empowering over 120+ vetted brokers and regional developer teams with automated lead distribution, commission ledgers, and milestone tracking.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-6 shadow-lg">
                <div className="p-2.5 rounded-xl bg-[#142A42] border border-[#D6A85F]/25 text-[#6F9BB8] w-fit mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-[#F5F3ED]">
                  Bank-Grade Escrow Security
                </h4>
                <p className="text-xs text-[#9BA9B8] mt-2 leading-relaxed">
                  Digital KYC onboarding, real-time lock reservations, and automated payment gateway webhooks ensuring zero-risk transaction execution.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <EditorialFooter />

      {/* Consultation Modal */}
      <EditorialEnquiryModal
        isOpen={modalOpen}
        onClose={handleCloseEnquiry}
        defaultSubject={inquirySubject}
      />
    </div>
  );
}
