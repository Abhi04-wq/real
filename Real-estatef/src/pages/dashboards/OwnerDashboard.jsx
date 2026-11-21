import RoleDashboard from "./RoleDashboard";

export default function OwnerDashboard() {
  return (
    <RoleDashboard
      role="OWNER"
      title="Owner Portfolio"
      subtitle="Your properties, inquiries, site visits and deals in one place."
      cards={[
        { title: "My Properties", text: "Performance of your listings." },
        { title: "Inquiries", text: "Customer interest and messages." },
        { title: "Visits & Deals", text: "Scheduled visits and offers." },
      ]}
    />
  );
}
