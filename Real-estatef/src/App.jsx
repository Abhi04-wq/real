import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProfessionalCursor from "./components/common/ProfessionalCursor";
import { useAuth } from "./context/AuthContext";
import { getDashboardPath } from "./lib/authApi";
import { applyFavicon } from "./lib/favicon";
import api from "./lib/adminApi";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/Landingpage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Agents from "./pages/Agents";
import AgentDetails from "./pages/AgentDetails";
import Plots from "./pages/Plots";
import ContactSupport from "./pages/ContactSupport";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ReraDisclaimer from "./pages/ReraDisclaimer";
import Sitemap from "./pages/Sitemap";
import AboutUs from "./pages/AboutUs";
import ScheduleVisit from "./pages/ScheduleVisit";
import AdminLayout from "./admin/AdminLayout";
import RequireAdmin from "./admin/RequireAdmin";
import SuperDashboard from "./admin/pages/Dashboard";
import SuperUsers from "./admin/pages/Users";
import AdminUserDetails from "./admin/pages/UserDetails";
import AdminAgents from "./admin/pages/Agents";
import AdminProperties from "./admin/pages/Properties";
import AdminPropertyTypes from "./admin/pages/PropertyTypes";
import AdminLeads from "./admin/pages/Leads";
import AdminBookings from "./admin/pages/Bookings";
import AdminTransactions from "./admin/pages/Transactions";
import AdminCommissions from "./admin/pages/Commissions";
import AdminReports from "./admin/pages/Reports";
import AdminNotifications from "./admin/pages/Notifications";
import AdminRoles from "./admin/pages/Roles";
import AdminSettings from "./admin/pages/Settings";
import AdminActivity from "./admin/pages/ActivityLogs";
import ManageLayout from "./manage/ManageLayout";
import RequireManager from "./manage/RequireManager";
import ManageDashboard from "./manage/pages/ManageDashboard";
import ManageProperties from "./manage/pages/Properties";
import ManageAgents from "./manage/pages/Agents";
import ManageCustomers from "./manage/pages/Customers";
import ManageCustomerDetails from "./manage/pages/CustomerDetails";
import ManageLeads from "./manage/pages/Leads";
import ManageBookings from "./manage/pages/Bookings";
import ManageTransactions from "./manage/pages/Transactions";
import ManageCommissions from "./manage/pages/Commissions";
import ManageReports from "./manage/pages/Reports";
import ManageNotifications from "./manage/pages/Notifications";
import ManageActivity from "./manage/pages/ActivityLog";
import PortalLayout from "./portal/PortalLayout";
import RequireAgent from "./portal/RequireAgent";
import PortalDashboard from "./portal/pages/PortalDashboard";
import PortalProperties from "./portal/pages/MyProperties";
import PortalLeads from "./portal/pages/PortalLeads";
import PortalBookings from "./portal/pages/PortalBookings";
import PortalCommissions from "./portal/pages/PortalCommissions";
import PortalProfile from "./portal/pages/PortalProfile";
import ClientLayout from "./client/ClientLayout";
import RequireClient from "./client/RequireClient";
import ClientOverview from "./client/pages/Overview";
import ClientBookings from "./client/pages/MyBookings";
import ClientFavorites from "./client/pages/Favorites";
import ClientOffers from "./client/pages/Offers";
import ClientAddProperty from "./client/pages/AddProperty";
import ClientListings from "./client/pages/MyListings";
import ClientMyProperties from "./client/pages/MyProperties";
import ClientSellerLeads from "./client/pages/SellerLeads";
import ClientTransactions from "./client/pages/Transactions";
import ClientProfile from "./client/pages/ClientProfile";
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import OwnerDashboard from "./pages/dashboards/OwnerDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";

// Legacy /dashboard → role home (keeps old bookmarks working)
function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function App() {
  useEffect(() => {
    // Initial fetch of settings to apply custom favicon
    api
      .get("/settings")
      .then(({ data }) => {
        if (data?.settings?.favicon) {
          applyFavicon(data.settings.favicon);
        }
      })
      .catch(() => {});

    // Listen for real-time updates when admin uploads a new favicon
    const handleSettingsUpdate = (e) => {
      const fav = e?.detail?.favicon;
      if (fav) {
        applyFavicon(fav);
      } else {
        applyFavicon("/favicon.png");
      }
    };

    window.addEventListener("agency-settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("agency-settings-updated", handleSettingsUpdate);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <ProfessionalCursor />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Role dashboards — URL guessing never grants access */}
        {/* Legacy /super-admin URL now points to the new Super Admin Panel */}
        <Route path="/super-admin" element={<Navigate to="/panel" replace />} />
        {/* Legacy role URLs now point to the new panels */}
        <Route path="/admin" element={<Navigate to="/manage" replace />} />
        <Route path="/manager" element={<Navigate to="/manage" replace />} />
        {/* Agent & Broker Portal lives at /agent */}
        <Route path="/owner" element={<ProtectedRoute allowedRoles={["OWNER", "MANAGER", "ADMIN", "SUPER_ADMIN"]}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/customer" element={<ProtectedRoute allowedRoles={["CUSTOMER", "AGENT", "MANAGER", "ADMIN", "SUPER_ADMIN"]}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agent/:id" element={<AgentDetails />} />
        <Route path="/plots" element={<Plots />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/schedule-visit" element={<ScheduleVisit />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/rera-disclaimer" element={<ReraDisclaimer />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/about-us" element={<AboutUs />} />

        {/* Super Admin Panel (MERN) — mounted at /panel to avoid clash with legacy /admin dashboard */}
        <Route path="/panel" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<SuperDashboard />} />
          <Route path="users" element={<SuperUsers />} />
          <Route path="users/:id" element={<AdminUserDetails />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="property-types" element={<AdminPropertyTypes />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="activity" element={<AdminActivity />} />
        </Route>

        {/* Admin/Manager operations panel — day-to-day business, no system modules */}
        <Route path="/manage" element={<RequireManager><ManageLayout /></RequireManager>}>
          <Route index element={<ManageDashboard />} />
          <Route path="properties" element={<ManageProperties />} />
          <Route path="agents" element={<ManageAgents />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="customers/:id" element={<ManageCustomerDetails />} />
          <Route path="leads" element={<ManageLeads />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="transactions" element={<ManageTransactions />} />
          <Route path="commissions" element={<ManageCommissions />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="notifications" element={<ManageNotifications />} />
          <Route path="activity" element={<ManageActivity />} />
        </Route>

        {/* Agent & Broker Portal — agents sign in via unified /login */}
        <Route path="/agent/login" element={<Navigate to="/login" replace />} />
        <Route path="/agent" element={<RequireAgent><PortalLayout /></RequireAgent>}>
          <Route index element={<PortalDashboard />} />
          <Route path="properties" element={<PortalProperties />} />
          <Route path="leads" element={<PortalLeads />} />
          <Route path="bookings" element={<PortalBookings />} />
          <Route path="commissions" element={<PortalCommissions />} />
          <Route path="profile" element={<PortalProfile />} />
        </Route>

        {/* Unified Buyer & Seller portal — CUSTOMER (buyer) / OWNER (seller), mode toggle */}
        <Route path="/home" element={<RequireClient><ClientLayout /></RequireClient>}>
          <Route path="dashboard" element={<ClientOverview />} />
          <Route path="favorites" element={<ClientFavorites />} />
          <Route path="my-bookings" element={<ClientBookings />} />
          <Route path="my-properties" element={<ClientMyProperties />} />
          <Route path="add-property" element={<ClientAddProperty />} />
          <Route path="my-listings" element={<ClientListings />} />
          <Route path="seller-leads" element={<ClientSellerLeads />} />
          <Route path="transactions" element={<ClientTransactions />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
