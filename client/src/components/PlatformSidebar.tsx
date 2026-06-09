import { useLocation, Link } from "wouter";
import { BarChart3, Users, CreditCard, LogOut, Home, Package, AlertCircle, FileText, Inbox, Clock, Archive, Activity, Shield, X, Mail, HardDrive, ShieldCheck, HeartPulse, Plug, Bell, Lock, Rocket } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", path: "/platform", icon: Home },
  { label: "Workspaces", path: "/platform/workspaces", icon: Users },
  { label: "Users", path: "/platform/users", icon: Users },
  { label: "Activity", path: "/platform/activity", icon: Activity },
  { label: "Login Events", path: "/platform/login-events", icon: Shield },
  { label: "Plans", path: "/platform/plans", icon: Package },
  { label: "Discounts", path: "/platform/discounts", icon: CreditCard },
  { label: "Billing", path: "/platform/billing", icon: CreditCard },
  { label: "Support", path: "/platform/support", icon: Inbox },
  { label: "Onboarding", path: "/platform/onboarding", icon: Mail },
  { label: "Overrides", path: "/platform/overrides", icon: AlertCircle },
  { label: "Pricing History", path: "/platform/pricing-history", icon: Clock },
  { label: "Ownership Recovery", path: "/platform/ownership-recovery", icon: FileText },
  { label: "Demo Workspaces", path: "/platform/demo-workspaces", icon: Archive },
  { label: "Tasks", path: "/platform/tasks", icon: BarChart3 },
  { label: "Backups & Export", path: "/platform/backups", icon: HardDrive },
  { label: "Consent Records", path: "/platform/consent-records", icon: ShieldCheck },
  { label: "System Health", path: "/platform/system-health", icon: HeartPulse },
  { label: "Integrations", path: "/platform/integrations", icon: Plug },
  { label: "Notifications", path: "/platform/notifications", icon: Bell },
  { label: "Security", path: "/platform/security", icon: Lock },
  { label: "Launch Readiness", path: "/platform/launch-readiness", icon: Rocket },
];

interface PlatformSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function PlatformSidebar({ mobileOpen, onClose }: PlatformSidebarProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location === path;

  const SidebarInner = () => (
    <div className="w-64 bg-blue-900 text-white flex flex-col h-full min-h-0">
      <div className="p-5 border-b border-blue-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold leading-tight">PrimeContractorOS</h2>
          <p className="text-xs text-blue-200 mt-0.5">Platform Admin</p>
        </div>
        <button
          className="md:hidden p-1 rounded hover:bg-blue-800 transition-colors"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Single scrollable container: nav items + bottom actions.
          Everything is inside overflow-y-auto so all items are reachable
          by scrolling on any screen height. */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm block ${
                active
                  ? "bg-blue-800 text-white font-medium"
                  : "text-blue-100 hover:bg-blue-800/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* User info + Sign Out — inside the scroll area so always reachable */}
        <div className="mt-3 pt-3 border-t border-blue-800 space-y-1">
          {/* User identity */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{(user?.name || "A")[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-300 uppercase font-semibold">Platform Admin</p>
              <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
            </div>
          </div>

          {/* Switch to App */}
          <Link
            href="/app/dashboard"
            onClick={onClose}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium block text-center"
          >
            Switch to App
          </Link>

          {/* Sign Out — directly below user name for clear association */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex flex-shrink-0 h-screen">
        <SidebarInner />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative z-10 flex h-full">
            <SidebarInner />
          </div>
        </div>
      )}
    </>
  );
}
