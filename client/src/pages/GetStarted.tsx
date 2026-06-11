import { Button } from "@/components/ui/button";
import { useLocation, useSearch } from "wouter";
import { useEffect, useState } from "react";
import { CheckCircle2, LogIn, Tag } from "lucide-react";
import { getLoginUrl, navigateToLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Get Started / Signup Page
 *
 * Phase 2 update:
 * - Reads ?plan=<slug> query param and localStorage `pcos_selected_plan`
 * - Shows the selected plan name so the user knows what they're signing up for
 * - After OAuth, authenticated users are routed to /checkout/success (if a plan
 *   was selected) or /app/dashboard (if no plan was pre-selected)
 * - Stores plan selection in localStorage so it survives the OAuth redirect
 */
export default function GetStarted() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { isAuthenticated, loading } = useAuth();
  const [tosAccepted, setTosAccepted] = useState(false);

  // Resolve selected plan from URL param or localStorage
  const params = new URLSearchParams(search);
  const planSlugFromUrl = params.get("plan");

  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    slug: string;
    billingInterval: string;
  } | null>(null);

  useEffect(() => {
    // Prefer URL param; fall back to localStorage
    if (planSlugFromUrl) {
      const stored = (() => {
        try {
          return JSON.parse(localStorage.getItem("pcos_selected_plan") || "null");
        } catch {
          return null;
        }
      })();
      if (stored && stored.slug === planSlugFromUrl) {
        setSelectedPlan(stored);
      } else {
        // URL param present but no localStorage match — create a minimal entry
        const planName = planSlugFromUrl.charAt(0).toUpperCase() + planSlugFromUrl.slice(1);
        const entry = { name: planName, slug: planSlugFromUrl, billingInterval: "month" };
        setSelectedPlan(entry);
        localStorage.setItem("pcos_selected_plan", JSON.stringify({
          ...entry,
          selectedAt: new Date().toISOString(),
        }));
      }
    } else {
      // No URL param — check localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("pcos_selected_plan") || "null");
        if (stored) setSelectedPlan(stored);
      } catch {
        // ignore
      }
    }
  }, [planSlugFromUrl]);

  // Once authenticated, route to checkout success (plan was selected) or dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const hasPlan = !!selectedPlan || !!localStorage.getItem("pcos_selected_plan");
      if (hasPlan) {
        navigate("/checkout/success", { replace: true });
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, selectedPlan]);

  const handleSignUp = () => {
    if (!tosAccepted) return;
    // Persist TOS acceptance so it can be recorded after OAuth callback
    localStorage.setItem("tos_accepted", JSON.stringify({
      documentType: "terms_of_service",
      version: "1.0",
      acceptedAt: new Date().toISOString(),
    }));
    // Ensure plan selection is persisted before redirect
    if (selectedPlan && !localStorage.getItem("pcos_selected_plan")) {
      localStorage.setItem("pcos_selected_plan", JSON.stringify({
        ...selectedPlan,
        selectedAt: new Date().toISOString(),
      }));
    }
    navigateToLogin(selectedPlan ? "/checkout/success" : "/app/onboarding");
  };

  const benefits = [
    "Guided government contracting lifecycle management",
    "Opportunity tracking and proposal building tools",
    "Contract management with compliance monitoring",
    "AI-powered insights and recommendations",
    "Team collaboration and workspace management",
    "Finance tracking with invoicing and payments",
  ];

  const planLabels: Record<string, string> = {
    starter: "Starter — $99/month",
    growth: "Growth — $299/month",
    advanced: "Advanced — $799/month",
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
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container max-w-4xl py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Benefits */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Get Started with PrimeContractorOS</h1>
              <p className="text-lg text-gray-500">
                Create your workspace and start managing your government contracting operations with confidence.
              </p>
            </div>

            {selectedPlan && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Selected plan</p>
                  <p className="text-sm text-primary font-semibold">
                    {planLabels[selectedPlan.slug] ?? selectedPlan.name}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-700 underline"
                >
                  Change
                </button>
              </div>
            )}

            <div className="space-y-3">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-gray-900">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sign Up CTA */}
          <div className="p-8 rounded-xl bg-white border border-gray-200 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Create Your Account</h2>
              <p className="text-sm text-gray-500">
                Sign up securely with your Manus account. After creating your account, you will complete checkout to activate your workspace.
              </p>
            </div>

            {/* Terms of Service Acceptance */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600">
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>.
              </span>
            </label>

            <Button
              onClick={handleSignUp}
              disabled={!tosAccepted}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign Up with Manus Account
            </Button>

            <div className="space-y-4 text-sm text-gray-500">
              <p className="text-center">
                Secure authentication powered by Manus OAuth.
              </p>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <p className="font-medium text-gray-900">What happens next:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create your secure account via Manus</li>
                  {selectedPlan ? (
                    <li>Complete checkout for the {selectedPlan.name} plan</li>
                  ) : (
                    <li>Choose a plan or start a free trial</li>
                  )}
                  <li>Complete a brief onboarding wizard</li>
                  <li>Access your workspace dashboard</li>
                </ol>
              </div>
            </div>

            {/* Already have account */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="text-primary hover:underline font-medium">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
