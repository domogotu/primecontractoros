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
import { getLoginUrl } from "@/const";

export default function PlatformRouter() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto" />
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have admin permissions to access the platform management area.</p>
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
    if (normalizedLocation.startsWith("/platform/workspaces/")) return <PlatformWorkspaceSummary />;
    if (normalizedLocation === "/platform/plans") return <PlatformPlans />;
    if (normalizedLocation === "/platform/discounts") return <PlatformDiscounts />;
    if (normalizedLocation === "/platform/billing") return <PlatformBilling />;
    if (normalizedLocation === "/platform/overrides") return <PlatformOverrides />;
    if (normalizedLocation === "/platform/support") return <PlatformSupport />;
    if (normalizedLocation === "/platform/pricing-history") return <PlatformPricingHistory />;
    if (normalizedLocation === "/platform/ownership-recovery") return <PlatformOwnershipRecovery />;
    if (normalizedLocation === "/platform/demo-workspaces") return <PlatformDemoWorkspaces />;
    if (normalizedLocation === "/platform/tasks") return <PlatformTasks />;
    return <PlatformAdmin />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <PlatformSidebar />
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}
