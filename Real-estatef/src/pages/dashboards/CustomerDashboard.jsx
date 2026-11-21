import RoleDashboard from "./RoleDashboard";

export default function CustomerDashboard() {
  return (
    <RoleDashboard
      role="CUSTOMER"
      title="Find Your Home"
      subtitle="Search properties, save favourites, enquire, schedule visits and manage bookings."
      cards={[
        { title: "Search & Saved", text: "Browse and shortlist properties." },
        { title: "Inquiries & Visits", text: "Track enquiries and upcoming visits." },
        { title: "Bookings & Payments", text: "Your bookings, receipts and dues." },
      ]}
    />
  );
}
