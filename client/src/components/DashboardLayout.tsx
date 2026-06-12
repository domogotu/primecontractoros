import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, navigateToLogin } from "@/const";
import {
  LayoutDashboard, LogOut, Users, FileText, DollarSign, MessageSquare,
  BarChart3, Settings, User, Zap, CheckCircle2, BookOpen, Briefcase,
  TrendingDown, Award, Brain, CreditCard, ShieldCheck, Menu, X, Lightbulb, Activity, Shield, Bell
} from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  // Core Workflow
  { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
  { icon: Zap, label: "Opportunities", path: "/app/opportunities" },
  { icon: FileText, label: "Proposals", path: "/app/proposals" },
  { icon: Briefcase, label: "Contracts", path: "/app/contracts" },
  
  // Operations
  { icon: CheckCircle2, label: "Files", path: "/app/files" },
  { icon: Users, label: "Contacts", path: "/app/contacts" },
  { icon: MessageSquare, label: "Messages", path: "/app/messages" },
  
  // Finance
  { icon: DollarSign, label: "Invoices", path: "/app/invoices" },
  { icon: BarChart3, label: "Payments", path: "/app/payments" },
  { icon: TrendingDown, label: "Finance", path: "/app/finance" },
  
  // Intelligence
  { icon: BarChart3, label: "Reports", path: "/app/reports" },
  { icon: Award, label: "Capability Statements", path: "/app/capability-statements" },
  { icon: BookOpen, label: "Templates", path: "/app/templates" },
  { icon: BookOpen, label: "Lessons Learned", path: "/app/lessons" },
  { icon: Brain, label: "AI Findings", path: "/app/ai-findings" },
  { icon: Lightbulb, label: "AI Suggestions", path: "/app/ai-suggestions" },
  { icon: Activity, label: "AI Runs", path: "/app/ai-runs" },
  { icon: Shield, label: "Audit Log", path: "/app/audit-log" },
  { icon: Bell, label: "Notifications", path: "/app/notifications" },
  
  // Account & Settings
  { icon: Briefcase, label: "Business Profile", path: "/app/business-profile" },
  { icon: User, label: "User Profile", path: "/app/profile" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
  { icon: CreditCard, label: "Billing", path: "/app/billing" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <h1 className="text-2xl font-semibold tracking-tight text-center">Sign in to continue</h1>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Access to this dashboard requires authentication.
          </p>
          <Button
            onClick={() => { navigateToLogin(); }}
            size="lg"
            className="w-full"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return <DashboardLayoutInner>{children}</DashboardLayoutInner>;
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const activeItem = menuItems.find(item => item.path === location);

  const SidebarContent = () => (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full min-h-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold leading-tight">PrimeContractorOS</h2>
          <p className="text-xs text-slate-400 mt-0.5">Reed's Solutions LLC (Limited Liability Company)</p>
        </div>
        {/* Close button — mobile only */}
        <button
          className="md:hidden p-1 rounded hover:bg-slate-700 transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items — flex-1 overflow-y-auto ensures scrollability when many items exist */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                active
                  ? "bg-slate-700 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + Sign Out — grouped together so sign-out is always next to the user's name */}
      <div className="border-t border-slate-700 p-3">
        {/* User identity */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || ""}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
          </div>
        </div>

        {/* Switch to Admin — only for admin role */}
        {isAdmin && (
          <Link
            href="/platform"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Switch to Admin</span>
          </Link>
        )}

        {/* Sign Out — directly below user name for clear association */}
        <button
          onClick={async () => { setMobileOpen(false); await logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-sm font-medium mt-1"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer — overflow-y-auto at this level ensures the whole sidebar scrolls on small screens */}
          <div className="relative z-10 flex h-full overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b bg-white shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-medium text-gray-900 text-sm">
            {activeItem?.label ?? "PrimeContractorOS"}
          </span>
        </div>

        {/* Page content — pb-32 ensures content clears fixed bottom banners on all devices */}
        <main className="flex-1 overflow-auto p-4 pb-32">
          {children}
        </main>
      </div>
    </div>
  );
}
