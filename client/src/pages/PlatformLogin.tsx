import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, navigateToLogin } from "@/const";
import { Redirect } from "wouter";

/**
 * PlatformLogin now redirects to Manus OAuth.
 * Platform admin access is determined by user role === 'admin'.
 * If already authenticated as admin, redirect to /platform.
 * Otherwise, redirect to Manus OAuth login.
 */
export default function PlatformLogin() {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigateToLogin();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="text-blue-100 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "admin") {
    return <Redirect to="/platform" />;
  }

  if (isAuthenticated && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Your account does not have platform admin permissions.</p>
          <a href="/app/dashboard" className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 inline-block">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
        <p className="text-blue-100 mt-4">Redirecting to login...</p>
      </div>
    </div>
  );
}
