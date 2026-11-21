import React, { useState } from "react";
import EditorialHeader from "../components/editorial/EditorialHeader";
import EditorialHero from "../components/editorial/EditorialHero";
import SelectedProperties from "../components/editorial/SelectedProperties";
import EditorialAbout from "../components/editorial/EditorialAbout";
import SignatureProjects from "../components/editorial/SignatureProjects";
import ProjectShowcaseGallery from "../components/editorial/ProjectShowcaseGallery";
import WhyChooseUs from "../components/editorial/WhyChooseUs";
import EditorialTestimonials from "../components/editorial/EditorialTestimonials";
import EditorialCTA from "../components/editorial/EditorialCTA";
import EditorialFooter from "../components/editorial/EditorialFooter";
import EditorialEnquiryModal from "../components/editorial/EditorialEnquiryModal";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [inquirySubject, setInquirySubject] = useState("");

  const handleOpenEnquiry = (propertyOrSubject = "General Advisory") => {
    if (propertyOrSubject && typeof propertyOrSubject === "object") {
      setSelectedProperty(propertyOrSubject);
      setInquirySubject(propertyOrSubject.title || "");
    } else {
      setSelectedProperty(null);
      setInquirySubject(propertyOrSubject || "");
    }
    setModalOpen(true);
  };

  const handleCloseEnquiry = () => {
    setModalOpen(false);
    setSelectedProperty(null);
    setInquirySubject("");
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F5F3ED] antialiased selection:bg-[#D6A85F] selection:text-[#07111F] overflow-x-hidden">
      {/* Sticky Minimal Navigation Header */}
      <EditorialHeader onOpenEnquiry={handleOpenEnquiry} />

      {/* Main Editorial Content Flow */}
      <main>
        {/* 1. Large Architectural Hero Section (Home) */}
        <EditorialHero onOpenEnquiry={handleOpenEnquiry} />

        {/* 2. Asymmetric About Us & Statistics */}
        <EditorialAbout onOpenEnquiry={handleOpenEnquiry} />

        {/* 3. Why Discerning Clients Choose PrimeNest (01 to 04 Pillars) */}
        <WhyChooseUs />

        {/* 4. Signature Projects & Project Showcase Gallery */}
        <SignatureProjects onOpenEnquiry={handleOpenEnquiry} />
        <ProjectShowcaseGallery onOpenEnquiry={handleOpenEnquiry} />

        {/* 5. Selected Properties (Curated Properties Showcase) */}
        <SelectedProperties onOpenEnquiry={handleOpenEnquiry} />

        {/* 6. What Our Clients Say (Client Voices Testimonials) */}
        <EditorialTestimonials />

        {/* 7. Contact Section (Private Placement & Inquiries Plaque Card) */}
        <EditorialCTA onOpenEnquiry={handleOpenEnquiry} />
      </main>

      {/* Sophisticated Minimal Footer */}
      <EditorialFooter />

      {/* Consultation & Acquisition Modal */}
      <EditorialEnquiryModal
        isOpen={modalOpen}
        onClose={handleCloseEnquiry}
        property={selectedProperty}
        defaultSubject={inquirySubject}
      />
    </div>
  );
}