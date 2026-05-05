import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowRight, CheckCircle2, LogIn } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Get Started / Signup Page
 * 
 * Redirects to Manus OAuth for account creation.
 * After OAuth, new users are directed to the onboarding flow.
 */
export default function GetStarted() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignUp = () => {
    window.location.href = getLoginUrl();
  };

  const benefits = [
    "Guided government contracting lifecycle management",
    "Opportunity tracking and proposal building tools",
    "Contract management with compliance monitoring",
    "AI-powered insights and recommendations",
    "Team collaboration and workspace management",
    "Finance tracking with invoicing and payments",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
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
              <p className="text-lg text-muted-foreground">
                Create your workspace and start managing your government contracting operations with confidence.
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sign Up CTA */}
          <div className="p-8 rounded-xl bg-card border border-border space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Create Your Account</h2>
              <p className="text-sm text-muted-foreground">
                Sign up securely with your Manus account. After creating your account, you will complete a brief onboarding to set up your workspace.
              </p>
            </div>

            <Button
              onClick={handleSignUp}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign Up with Manus Account
            </Button>

            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-center">
                Secure authentication powered by Manus OAuth.
              </p>

              <div className="border-t border-border pt-4 space-y-2">
                <p className="font-medium text-foreground">What happens next:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create your secure account via Manus</li>
                  <li>Complete a brief onboarding wizard</li>
                  <li>Access your workspace dashboard</li>
                </ol>
              </div>
            </div>

            {/* Already have account */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
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
