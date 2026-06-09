import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * CheckoutSuccess Page
 *
 * Handles the post-Stripe-checkout flow:
 *   1. Reads ?session_id= from the URL (Stripe appends this on redirect)
 *   2. Calls billing.verifyCheckout to verify server-side and update accessStates
 *   3. Routes the user to onboarding (if not completed) or dashboard
 *
 * Also handles the case where no session_id is present (user arrived here
 * after OAuth with a pre-selected plan — initiates checkout immediately).
 */
export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { user, loading: authLoading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });

  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const [phase, setPhase] = useState<"verifying" | "initiating" | "success" | "error" | "no_plan">("verifying");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const verifyMutation = trpc.billing.verifyCheckout.useMutation();
  const createCheckoutMutation = trpc.billing.createCheckout.useMutation();
  const getPlansQuery = trpc.billing.getPlans.useQuery(undefined, { enabled: !sessionId && isAuthenticated });

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (sessionId) {
      // Stripe redirected back with a session_id — verify it
      verifyMutation.mutate(
        { sessionId },
        {
          onSuccess: (data) => {
            if (data.success) {
              setWorkspaceId(data.workspaceId ?? null);
              setOnboardingCompleted(data.onboardingCompleted ?? false);
              setPhase("success");
            } else {
              setErrorMsg(data.error ?? "Verification failed");
              setPhase("error");
            }
          },
          onError: (err) => {
            setErrorMsg(err.message);
            setPhase("error");
          },
        }
      );
    } else {
      // No session_id — user arrived here after OAuth with a pre-selected plan.
      // Initiate checkout immediately.
      const storedPlan = (() => {
        try {
          return JSON.parse(localStorage.getItem("pcos_selected_plan") || "null");
        } catch {
          return null;
        }
      })();

      if (!storedPlan) {
        setPhase("no_plan");
        return;
      }

      setPhase("initiating");
    }
  }, [authLoading, isAuthenticated, sessionId]);

  // When plans are loaded and we're in "initiating" phase, create the checkout session
  useEffect(() => {
    if (phase !== "initiating" || getPlansQuery.isLoading || !getPlansQuery.data) return;

    const storedPlan = (() => {
      try {
        return JSON.parse(localStorage.getItem("pcos_selected_plan") || "null");
      } catch {
        return null;
      }
    })();

    if (!storedPlan) {
      setPhase("no_plan");
      return;
    }

    // Find matching plan by slug/name
    const plans = getPlansQuery.data;
    const matchedPlan = plans.find(
      (p) =>
        p.name.toLowerCase() === storedPlan.slug?.toLowerCase() ||
        p.name.toLowerCase() === storedPlan.name?.toLowerCase()
    );

    if (!matchedPlan) {
      // Plan not found in DB — fall back to first active plan
      const fallback = plans[0];
      if (!fallback) {
        setPhase("no_plan");
        return;
      }
      initiateCheckout(fallback.id, storedPlan.billingInterval ?? "month");
      return;
    }

    initiateCheckout(matchedPlan.id, storedPlan.billingInterval ?? "month");
  }, [phase, getPlansQuery.isLoading, getPlansQuery.data]);

  function initiateCheckout(planId: number, billingInterval: string) {
    const successUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/pricing`;

    createCheckoutMutation.mutate(
      {
        planId,
        successUrl,
        cancelUrl,
        billingInterval: billingInterval as "month" | "year",
      },
      {
        onSuccess: (data) => {
          if (data.url) {
            // Clear stored plan so we don't loop
            localStorage.removeItem("pcos_selected_plan");
            window.location.href = data.url;
          } else if (data.error) {
            // Stripe not configured (dev mode) — treat as trial
            setPhase("success");
            setOnboardingCompleted(false);
          } else {
            setErrorMsg("Could not create checkout session");
            setPhase("error");
          }
        },
        onError: (err) => {
          setErrorMsg(err.message);
          setPhase("error");
        },
      }
    );
  }

  function handleContinue() {
    // Clear stored plan
    localStorage.removeItem("pcos_selected_plan");
    if (!onboardingCompleted) {
      navigate("/app/onboarding", { replace: true });
    } else {
      navigate("/app/dashboard", { replace: true });
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-primary"
          >
            PrimeContractorOS
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center space-y-6">
          {(phase === "verifying" || phase === "initiating") && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {phase === "initiating" ? "Preparing Checkout…" : "Verifying Payment…"}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  {phase === "initiating"
                    ? "Setting up your checkout session. You'll be redirected to Stripe shortly."
                    : "Confirming your payment and activating your workspace. This only takes a moment."}
                </p>
              </div>
            </>
          )}

          {phase === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Confirmed!</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Your workspace is now active. Let's get you set up.
                </p>
              </div>
              <Button onClick={handleContinue} className="w-full" size="lg">
                {onboardingCompleted ? "Go to Dashboard" : "Start Onboarding"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {phase === "error" && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Something Went Wrong</h2>
                <p className="text-sm text-gray-500 mt-2">{errorMsg}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/pricing")}
                  className="flex-1"
                >
                  Back to Pricing
                </Button>
                <Button
                  onClick={() => navigate("/app/billing")}
                  className="flex-1"
                >
                  Billing Settings
                </Button>
              </div>
            </>
          )}

          {phase === "no_plan" && (
            <>
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">No Plan Selected</h2>
                <p className="text-sm text-gray-500 mt-2">
                  It looks like you didn't select a plan. Choose a plan to continue.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/pricing")}
                  className="flex-1"
                >
                  View Pricing
                </Button>
                <Button
                  onClick={() => navigate("/app/dashboard")}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions?{" "}
          <a href="/support" className="underline hover:text-gray-700">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
