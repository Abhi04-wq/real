import { Link, useNavigate } from "react-router-dom";
import { Building2, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function RoleDashboard({ role, title, subtitle, cards }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-gray-900 text-white p-2 rounded-lg">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="font-bold tracking-tight">PrimeNest <span className="text-gray-400 font-medium">/ {title}</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-full px-3 py-1.5">
              <User className="h-4 w-4" />
              {user?.fullName || user?.name} · {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{role} Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">{title}</h1>
        <p className="text-gray-500 mt-2 max-w-2xl">{subtitle}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
              <h2 className="font-semibold">{c.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Signed in as <span className="font-semibold text-gray-900">{user?.email}</span>
        </div>
      </main>
    </div>
  );
}
