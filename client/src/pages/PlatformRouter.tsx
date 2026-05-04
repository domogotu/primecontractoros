import { useLocation } from "wouter";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import PlatformSidebar from "@/components/PlatformSidebar";
import PlatformAdmin from "./PlatformAdmin";
import {
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

export default function PlatformRouter() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, loading } = usePlatformAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/platform/login");
    return null;
  }

  // Determine which page to show based on current location
  const renderPage = () => {
    // Normalize location to handle trailing slashes
    const normalizedLocation = location.replace(/\/$/, '') || '/platform';
    
    if (normalizedLocation === "/platform") {
      return <PlatformAdmin />;
    }
    if (normalizedLocation.startsWith("/platform/workspaces/")) {
      return <PlatformWorkspaceSummary />;
    }
    if (normalizedLocation === "/platform/plans") {
      return <PlatformPlans />;
    }
    if (normalizedLocation === "/platform/discounts") {
      return <PlatformDiscounts />;
    }
    if (normalizedLocation === "/platform/billing") {
      return <PlatformBilling />;
    }
    if (normalizedLocation === "/platform/overrides") {
      return <PlatformOverrides />;
    }
    if (normalizedLocation === "/platform/support") {
      return <PlatformSupport />;
    }
    if (normalizedLocation === "/platform/pricing-history") {
      return <PlatformPricingHistory />;
    }
    if (normalizedLocation === "/platform/ownership-recovery") {
      return <PlatformOwnershipRecovery />;
    }
    if (normalizedLocation === "/platform/demo-workspaces") {
      return <PlatformDemoWorkspaces />;
    }
    if (normalizedLocation === "/platform/tasks") {
      return <PlatformTasks />;
    }
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
