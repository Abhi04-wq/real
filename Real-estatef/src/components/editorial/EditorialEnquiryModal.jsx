import React, { useEffect } from "react";
import ScheduleVisitForm from "../ScheduleVisitForm";

export default function EditorialEnquiryModal({
  isOpen,
  onClose,
  defaultSubject = "",
  property = null,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isVisit = Boolean(property) || defaultSubject?.toLowerCase().includes("visit");
  const defaultPurpose = isVisit ? "Schedule a Site Visit" : "General Inquiry";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl my-auto"
      >
        <ScheduleVisitForm
          isModal={true}
          onClose={onClose}
          property={property}
          defaultPurpose={defaultPurpose}
          defaultMessage={defaultSubject ? `Regarding: ${defaultSubject}` : ""}
        />
      </div>
    </div>
  );
}
