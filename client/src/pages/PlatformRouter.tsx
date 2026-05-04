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
    if (location === "/platform" || location === "/platform/") {
      return <PlatformAdmin />;
    }
    if (location === "/platform/workspaces/:id") {
      return <PlatformWorkspaceSummary />;
    }
    if (location === "/platform/plans") {
      return <PlatformPlans />;
    }
    if (location === "/platform/discounts") {
      return <PlatformDiscounts />;
    }
    if (location === "/platform/billing") {
      return <PlatformBilling />;
    }
    if (location === "/platform/overrides") {
      return <PlatformOverrides />;
    }
    if (location === "/platform/support") {
      return <PlatformSupport />;
    }
    if (location === "/platform/pricing-history") {
      return <PlatformPricingHistory />;
    }
    if (location === "/platform/ownership-recovery") {
      return <PlatformOwnershipRecovery />;
    }
    if (location === "/platform/demo-workspaces") {
      return <PlatformDemoWorkspaces />;
    }
    if (location === "/platform/tasks") {
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
