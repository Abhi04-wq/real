import RoleDashboard from "./RoleDashboard";

export default function ManagerDashboard() {
  return (
    <RoleDashboard
      role="MANAGER"
      title="Manager Overview"
      subtitle="Assigned branch and team operations, targets and escalations."
      cards={[
        { title: "Team Pipeline", text: "Agents, leads and follow-up performance." },
        { title: "Branch Operations", text: "Visits, inventory and daily tasks." },
        { title: "Approvals", text: "Review deals and customer requests." },
      ]}
    />
  );
}
