import RoleDashboard from "./RoleDashboard";

export default function AdminDashboard() {
  return (
    <RoleDashboard
      role="ADMIN"
      title="Admin Workspace"
      subtitle="Administrative management: teams, listings, verifications, bookings and support."
      cards={[
        { title: "Team & Agents", text: "Manage managers, agents and operational staff." },
        { title: "Listings Review", text: "Approve properties, plots and projects." },
        { title: "Bookings & Support", text: "Track visits, deals and customer queries." },
      ]}
    />
  );
}
