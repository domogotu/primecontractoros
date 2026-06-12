import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl, navigateToLogin } from "@/const";

/**
 * AppRouter Page
 * 
 * Post-login routing logic:
 * - Checks if user is authenticated (via JWT cookie / tRPC auth.me)
 * - If not authenticated, redirects to login
 * - If authenticated but onboarding not completed, redirects to /app/onboarding
 * - If authenticated and onboarding completed, redirects to /app/dashboard
 */
export default function AppRouter() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: onboardingStatus, isLoading: onboardingLoading } = trpc.workspace.getOnboardingStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (authLoading || onboardingLoading) return;

    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }

    if (onboardingStatus && !onboardingStatus.completed) {
      navigate("/app/onboarding", { replace: true });
    } else {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, onboardingStatus, onboardingLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
        <p className="text-gray-500">Loading your workspace...</p>
      </div>
    </div>
  );
}
