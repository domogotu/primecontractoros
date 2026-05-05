import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import WorkspaceSidebar from "./WorkspaceSidebar";

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell wraps all /app/* routes with:
 * 1. Authentication check (redirects to login if not authenticated)
 * 2. Persistent sidebar navigation
 * 
 * This ensures logged-in users always see the app sidebar
 * and never see public marketing navigation.
 */
export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Don't show sidebar on onboarding page
  if (location === "/app/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <WorkspaceSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
