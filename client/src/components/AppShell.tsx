import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, navigateToLogin } from "@/const";
import WorkspaceSidebar from "./WorkspaceSidebar";
import MobileNav from "./MobileNav";
import { WorkspaceContext, useWorkspaceQuery } from "@/hooks/useWorkspace";
import HelpPanel from "./HelpPanel";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: ReactNode;
}

/**
 * AccessBlockPage — shown when a workspace has no valid billing access.
 *
 * Displayed for: no_access, pending_payment, past_due, suspended, canceled states.
 * Bypassed for: active_paid, trial_active, grace, override, admin_bypass.
 */
function AccessBlockPage({ status, reason }: { status: string; reason?: string }) {
  const [, navigate] = useLocation();

  const messages: Record<string, { title: string; body: string; cta: string; ctaPath: string }> = {
    no_access: {
      title: "Subscription Required",
      body: "Your workspace does not have an active subscription or trial. Choose a plan to continue.",
      cta: "View Plans",
      ctaPath: "/pricing",
    },
    pending_payment: {
      title: "Payment Pending",
      body: "Your payment is being processed. This usually takes just a moment. Refresh the page or contact support if this persists.",
      cta: "Manage Billing",
      ctaPath: "/app/billing",
    },
    past_due: {
      title: "Payment Past Due",
      body: "Your subscription payment is past due. Please update your payment method to restore access.",
      cta: "Update Payment",
      ctaPath: "/app/billing",
    },
    suspended: {
      title: "Account Suspended",
      body: reason ?? "Your workspace has been suspended. Please contact support to restore access.",
      cta: "Contact Support",
      ctaPath: "/support",
    },
    canceled: {
      title: "Subscription Canceled",
      body: "Your subscription has been canceled. Reactivate your plan to continue using PrimeContractorOS.",
      cta: "Reactivate Plan",
      ctaPath: "/pricing",
    },
  };

  const msg = messages[status] ?? messages.no_access;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          {status === "past_due" || status === "pending_payment" ? (
            <CreditCard className="h-12 w-12 text-amber-400" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-400" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">{msg.title}</h2>
          <p className="text-slate-400 text-sm mt-2">{msg.body}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate(msg.ctaPath)}
            className="w-full"
          >
            {msg.cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {status !== "suspended" && (
            <Button
              variant="outline"
              onClick={() => navigate("/support")}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Contact Support
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-500">
          PrimeContractorOS — Government Contracting Platform
        </p>
      </div>
    </div>
  );
}

/**
 * AppShell wraps all /app/* routes with:
 * 1. Authentication check (redirects to login if not authenticated)
 * 2. Billing access check (shows block page if workspace has no valid access)
 * 3. Workspace context provider (fetches user's workspace)
 * 4. Persistent sidebar navigation
 *
 * Phase 2: Added billing access gating. Admin users and platform overrides bypass
 * the gate. Regular users must have an active subscription, trial, or grace period.
 */
export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const [location] = useLocation();
  const { workspace, workspaceId, isLoading: wsLoading, refetch } = useWorkspaceQuery();

  // Fetch access status — only when authenticated and workspace is loaded
  const accessQuery = trpc.billing.getAccessStatus.useQuery(undefined, {
    enabled: isAuthenticated && !wsLoading,
    retry: false,
    refetchOnWindowFocus: false,
    // Refetch every 5 minutes to catch subscription changes
    refetchInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigateToLogin();
    }
  }, [loading, isAuthenticated]);

  // Routes that are exempt from billing gating (billing management itself)
  const billingExemptRoutes = [
    "/app/billing",
    "/app/onboarding",
    "/app/user-profile",
    "/app/settings",
  ];
  const isBillingExempt = billingExemptRoutes.some((r) => location.startsWith(r));

  if (loading || (isAuthenticated && wsLoading)) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Don't show sidebar on onboarding page
  if (location === "/app/onboarding") {
    return (
      <WorkspaceContext.Provider value={{ workspace, workspaceId, isLoading: wsLoading, refetch }}>
        {children}
      </WorkspaceContext.Provider>
    );
  }

  // Access gating — check billing status for non-exempt routes
  if (!isBillingExempt && !accessQuery.isLoading) {
    const access = accessQuery.data;
    if (access && !access.allowed) {
      return (
        <AccessBlockPage
          status={access.status}
          reason={"reason" in access ? (access.reason as string | undefined) : undefined}
        />
      );
    }
  }

  // Show loading spinner while access check is in progress (only on first load)
  if (!isBillingExempt && accessQuery.isLoading && !accessQuery.data) {
    return (
      <div className="flex h-screen bg-slate-900 items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-400 mx-auto" />
          <p className="text-slate-400 mt-4">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={{ workspace, workspaceId, isLoading: wsLoading, refetch }}>
      <MobileNav sidebarContent={<WorkspaceSidebar />}>
        {children}
      </MobileNav>
      {/* Global floating help panel — available on all app pages */}
      <HelpPanel />
    </WorkspaceContext.Provider>
  );
}
