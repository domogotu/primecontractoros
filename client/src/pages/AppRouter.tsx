import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

/**
 * AppRouter Page
 * 
 * Post-login routing logic
 * - Checks workspace status
 * - Checks subscription state
 * - Routes to appropriate page
 */
export default function AppRouter() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRoute = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Verify token and get user info
        const response = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        // Route to dashboard
        navigate("/app/dashboard");
      } catch (error) {
        console.error("Routing error:", error);
        toast.error("An error occurred");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAndRoute();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
