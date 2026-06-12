import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import PlatformSidebar from "@/components/PlatformSidebar";
import PlatformAdmin from "./PlatformAdmin";
import {
  PlatformWorkspaces,
  PlatformWorkspaceSummary,
  PlatformPlans,
  PlatformDiscounts,
  PlatformBilling,
  PlatformOverrides,
  PlatformSupport,
  PlatformPricingHistory,
  PlatformOwnershipRecovery,
  PlatformDemoWorkspaces,
  PlatformTasks,
} from "./PlatformPages";
import PlatformUsersPage from "./PlatformUsers";
import PlatformActivityPage from "./PlatformActivity";
import PlatformLoginEventsPage from "./PlatformLoginEvents";
import PlatformWorkspaceDetailPage from "./PlatformWorkspaceDetail";
import PlatformOnboardingPage from "./PlatformOnboarding";
import PlatformBackups from "./PlatformBackups";
import PlatformConsentRecords from "./PlatformConsentRecords";
import PlatformSystemHealth from "./PlatformSystemHealth";
import PlatformIntegrations from "./PlatformIntegrations";
import PlatformNotifications from "./PlatformNotifications";
import PlatformSecurity from "./PlatformSecurity";
import PlatformLaunchReadiness from "./PlatformLaunchReadiness";
import PlatformUserDetailPage from "./PlatformUserDetail";
import { getLoginUrl, navigateToLogin } from "@/const";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function PlatformRouter() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto" />
          <p className="text-slate-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">You don't have admin permissions to access the platform management area.</p>
          <button onClick={() => navigate("/app/dashboard")} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine which page to show based on current location
  const renderPage = () => {
    const normalizedLocation = location.replace(/\/$/, '') || '/platform';

    if (normalizedLocation === "/platform") return <PlatformAdmin />;
    if (normalizedLocation === "/platform/workspaces") return <PlatformWorkspaces />;
    if (normalizedLocation.startsWith("/platform/workspaces/")) return <PlatformWorkspaceDetailPage />;
    if (normalizedLocation === "/platform/users") return <PlatformUsersPage />;
    if (normalizedLocation.startsWith("/platform/users/")) return <PlatformUserDetailPage />;
    if (normalizedLocation === "/platform/activity") return <PlatformActivityPage />;
    if (normalizedLocation === "/platform/login-events") return <PlatformLoginEventsPage />;
    if (normalizedLocation === "/platform/plans") return <PlatformPlans />;
    if (normalizedLocation === "/platform/discounts") return <PlatformDiscounts />;
    if (normalizedLocation === "/platform/billing") return <PlatformBilling />;
    if (normalizedLocation === "/platform/overrides") return <PlatformOverrides />;
    if (normalizedLocation === "/platform/support") return <PlatformSupport />;
    if (normalizedLocation === "/platform/pricing-history") return <PlatformPricingHistory />;
    if (normalizedLocation === "/platform/ownership-recovery") return <PlatformOwnershipRecovery />;
    if (normalizedLocation === "/platform/demo-workspaces") return <PlatformDemoWorkspaces />;
    if (normalizedLocation === "/platform/tasks") return <PlatformTasks />;
    if (normalizedLocation === "/platform/onboarding") return <PlatformOnboardingPage />;
    if (normalizedLocation === "/platform/backups") return <PlatformBackups />;
    if (normalizedLocation === "/platform/consent-records") return <PlatformConsentRecords />;
    if (normalizedLocation === "/platform/system-health") return <PlatformSystemHealth />;
    if (normalizedLocation === "/platform/integrations") return <PlatformIntegrations />;
    if (normalizedLocation === "/platform/notifications") return <PlatformNotifications />;
    if (normalizedLocation === "/platform/security") return <PlatformSecurity />;
    if (normalizedLocation === "/platform/launch-readiness") return <PlatformLaunchReadiness />;
    return <PlatformAdmin />;
  };

  // Get current page label for mobile top bar
  const currentPageLabel = (() => {
    const n = location.replace(/\/$/, '') || '/platform';
    if (n === "/platform") return "Platform Admin";
    if (n === "/platform/workspaces") return "Workspaces";
    if (n.startsWith("/platform/workspaces/")) return "Workspace Detail";
    if (n === "/platform/users") return "Users";
    if (n.startsWith("/platform/users/")) return "User Detail";
    if (n === "/platform/activity") return "Activity";
    if (n === "/platform/login-events") return "Login Events";
    if (n === "/platform/plans") return "Plans";
    if (n === "/platform/discounts") return "Discounts";
    if (n === "/platform/billing") return "Billing";
    if (n === "/platform/overrides") return "Overrides";
    if (n === "/platform/support") return "Support";
    if (n === "/platform/onboarding") return "Onboarding";
    if (n === "/platform/backups") return "Backups & Export";
    if (n === "/platform/consent-records") return "Consent Records";
    if (n === "/platform/system-health") return "System Health";
    if (n === "/platform/integrations") return "Integrations";
    if (n === "/platform/notifications") return "Notifications";
    if (n === "/platform/security") return "Security";
    if (n === "/platform/launch-readiness") return "Launch Readiness";
    return "Platform Admin";
  })();

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <PlatformSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-slate-700 bg-slate-800 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <span className="font-semibold text-white text-sm">{currentPageLabel}</span>
        </div>

        {/* Page content — pb-32 ensures content clears fixed bottom banners on all devices */}
        <div className="flex-1 overflow-auto text-slate-200 pb-32">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
