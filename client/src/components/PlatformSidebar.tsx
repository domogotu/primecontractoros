import { useLocation, Link } from "wouter";
import { BarChart3, Users, CreditCard, Settings, LogOut, Home, Package, AlertCircle, FileText, Inbox, Clock, Archive } from "lucide-react";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";

export default function PlatformSidebar() {
  const [location, navigate] = useLocation();
  const { owner, logout } = usePlatformAuth();

  const handleLogout = () => {
    logout();
    navigate("/platform/login");
  };

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Dashboard", path: "/platform", icon: Home },
    { label: "Workspaces", path: "/platform/workspaces", icon: Users },
    { label: "Plans", path: "/platform/plans", icon: Package },
    { label: "Discounts", path: "/platform/discounts", icon: CreditCard },
    { label: "Billing", path: "/platform/billing", icon: CreditCard },
    { label: "Support", path: "/platform/support", icon: Inbox },
    { label: "Overrides", path: "/platform/overrides", icon: AlertCircle },
    { label: "Pricing History", path: "/platform/pricing-history", icon: Clock },
    { label: "Ownership Recovery", path: "/platform/ownership-recovery", icon: FileText },
    { label: "Demo Workspaces", path: "/platform/demo-workspaces", icon: Archive },
    { label: "Tasks", path: "/platform/tasks", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <h2 className="text-xl font-bold">PrimeContractorOS</h2>
        <p className="text-xs text-blue-200 mt-1">Platform Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors block ${
                active
                  ? "bg-blue-800 text-white"
                  : "text-blue-100 hover:bg-blue-800/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Switch to App */}
      <div className="border-t border-blue-800 p-4">
        <Link
          href="/app/dashboard"
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium mb-3 block text-center"
        >
          Switch to App
        </Link>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-blue-800 p-4 space-y-3">
        <div className="px-4 py-2 bg-blue-800/50 rounded-lg">
          <p className="text-xs text-blue-200 uppercase">Platform Owner</p>
          <p className="text-sm font-medium text-white">Dominique Reed</p>
          <p className="text-xs text-blue-200 mt-1">Reed Solutions LLC</p>
          <p className="text-xs text-blue-300 mt-2">{owner?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-blue-100 hover:bg-blue-800/50 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
