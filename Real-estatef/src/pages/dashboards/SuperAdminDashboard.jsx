import { Link } from "react-router-dom";
import RoleDashboard from "./RoleDashboard";
import { ArrowRight, ShieldCheck, BarChart3, Database } from "lucide-react";

export default function SuperAdminDashboard() {
  return (
    <div>
      <div className="bg-slate-900 text-white py-3 px-4 text-center text-xs flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Super Admin privilege detected. Access the full Interactive Operations Console with live charts:</span>
        <Link
          to="/panel"
          className="ml-2 inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg transition-colors shadow-xs"
        >
          Open Super Admin Panel <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <RoleDashboard
        role="SUPER_ADMIN"
        title="Super Admin Console"
        subtitle="Full platform control: users, roles, branches, properties, bookings, payments and audit."
        cards={[
          { title: "Super Admin Operations Panel", text: "Click above to launch the full interactive Super Admin Panel with animated charts and real-time revenue analytics." },
          { title: "User & Role Management", text: "Create admins, managers, agents, owners and customers." },
          { title: "All Properties & Deals", text: "Every listing, inquiry, visit, booking and payment." },
        ]}
      />
    </div>
  );
}
