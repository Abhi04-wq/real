import RoleDashboard from "./RoleDashboard";

export default function AgentDashboard() {
  return (
    <RoleDashboard
      role="AGENT"
      title="Agent CRM"
      subtitle="Assigned properties, leads, customers, follow-ups, site visits and deals."
      cards={[
        { title: "My Properties", text: "Listings assigned to you." },
        { title: "Leads & Follow-ups", text: "Calls, tasks and reminders." },
        { title: "Visits & Deals", text: "Scheduled visits and closings." },
      ]}
    />
  );
}
