import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { getLoginUrl, navigateToLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Login Page
 * 
 * Redirects to Manus OAuth for authentication.
 * If already authenticated, redirects to dashboard.
 */
export default function Login() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = () => {
    navigateToLogin();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary">
            PrimeContractorOS
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate("/features")}>
              Features
            </Button>
            <Button variant="outline" onClick={() => navigate("/get-started")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-gray-500">
                Sign in to your PrimeContractorOS workspace
              </p>
            </div>

            {/* OAuth Login Button */}
            <div className="space-y-6">
              <Button
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In with Manus Account
              </Button>

              <p className="text-center text-sm text-gray-500">
                Secure authentication powered by Manus OAuth. Your credentials are never stored on our servers.
              </p>
              <p className="text-center text-xs text-gray-400">
                By signing in, you agree to our{" "}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to PrimeContractorOS?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Button
              variant="outline"
              onClick={() => navigate("/get-started")}
              className="w-full"
            >
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Help Links */}
            <div className="text-center space-y-2 text-sm">
              <p className="text-gray-500">
                Need help signing in?{" "}
                <button onClick={() => navigate("/support")} className="text-primary hover:underline">
                  Contact support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
