import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useEffect } from "react";
import {
  Check,
  CreditCard,
  AlertCircle,
  Loader2,
  Crown,
  Zap,
  Rocket,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";

// ─── Access Status Banner ─────────────────────────────────────────────────────

function AccessStatusBanner({ status, reason, expiresAt }: {
  status: string;
  reason?: string;
  expiresAt?: string;
}) {
  if (!status || status === "active_paid" || status === "admin_bypass") return null;

  const configs: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
    trial_active: {
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      label: "Trial Active",
    },
    grace: {
      icon: ShieldCheck,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "Grace Period",
    },
    override: {
      icon: ShieldCheck,
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200",
      label: "Platform Override",
    },
    past_due: {
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Payment Past Due",
    },
    pending_payment: {
      icon: AlertCircle,
      color: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: "Payment Pending",
    },
    suspended: {
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Account Suspended",
    },
    no_access: {
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "No Active Subscription",
    },
  };

  const cfg = configs[status];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <Card className={`${cfg.bg} ${cfg.border} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${cfg.color} mt-0.5 flex-shrink-0`} />
        <div>
          <p className={`font-medium ${cfg.color}`}>{cfg.label}</p>
          {reason && <p className={`text-sm mt-1 ${cfg.color} opacity-80`}>{reason}</p>}
          {expiresAt && (
            <p className={`text-sm mt-1 ${cfg.color} opacity-80`}>
              Expires: {new Date(expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Billing() {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [, navigate] = useLocation();
  const search = useSearch();

  const { data: billingStatus, isLoading, refetch: refetchStatus } = trpc.billing.getStatus.useQuery();
  const { data: plans = [] } = trpc.billing.getPlans.useQuery();
  const { data: accessStatus, refetch: refetchAccess } = trpc.billing.getAccessStatus.useQuery();

  // Handle return from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("success") === "true") {
      toast.success("Subscription activated! Your workspace is now fully active.");
      refetchStatus();
      refetchAccess();
    } else if (params.get("canceled") === "true") {
      toast.info("Checkout canceled. Your current plan is unchanged.");
    }
  }, [search]);

  const checkoutMutation = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to Stripe checkout...");
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(`Checkout failed: ${data.error}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.billing.cancelSubscription.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Subscription will cancel at end of billing period");
        refetchStatus();
        refetchAccess();
      } else {
        toast.error(data.error || "Failed to cancel");
      }
    },
  });

  const reactivateMutation = trpc.billing.reactivateSubscription.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Subscription reactivated");
        refetchStatus();
        refetchAccess();
      } else {
        toast.error(data.error || "Failed to reactivate");
      }
    },
  });

  const handleSubscribe = (planId: number, isUpgrade: boolean) => {
    const origin = window.location.origin;
    checkoutMutation.mutate({
      planId,
      billingInterval,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/app/billing?canceled=true`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PageGuide
          title="Billing & Subscription"
          description="Manage your workspace subscription, payment methods, and billing history."
          whenToUse="When reviewing your plan, updating payment information, or checking billing history."
          whatToDoNext={["Review your current plan and usage", "Check billing history for recent charges", "Update payment method if needed", "Compare plans for upgrade options"]}
          relatedRecords={[{ label: "Plan Features", path: "/app/plan-features" }, { label: "Settings", path: "/app/settings" }, { label: "Support", path: "/support" }]}
        />
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const subscription = billingStatus?.subscription;
  const currentPlan = subscription?.plan;
  const isDevelopmentMode = billingStatus?.developmentMode;

  const planIcons: Record<string, any> = {
    Starter: Zap,
    Growth: Crown,
    Advanced: Rocket,
  };

  // Determine plan ordering for upgrade/downgrade logic
  const planOrder = ["Starter", "Growth", "Advanced"];
  const currentPlanIndex = currentPlan ? planOrder.indexOf(currentPlan.name) : -1;

  return (
    <PageLayout
      label="Finance"
      title="Billing & Subscription"
      subtitle="Manage your subscription plan, billing history, and payment methods."
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your plan, view usage limits, and update payment details</p>
      </div>

      {/* Access Status Banner */}
      {accessStatus && (
        <AccessStatusBanner
          status={accessStatus.status}
          reason={"reason" in accessStatus ? (accessStatus.reason as string | undefined) : undefined}
          expiresAt={"expiresAt" in accessStatus ? (accessStatus.expiresAt as string | undefined) : undefined}
        />
      )}

      {/* Development Mode Banner */}
      {isDevelopmentMode && (
        <Card className="bg-amber-50 border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Development Mode</p>
              <p className="text-sm text-amber-700 mt-1">
                Stripe is not configured. All features are unlocked for development. Subscribe to a plan to enable billing and enforce usage limits.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Current Subscription */}
      {subscription && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg">{currentPlan?.name || "Active Plan"}</h3>
                  <Badge variant={subscription.status === "active" ? "default" : subscription.status === "trialing" ? "secondary" : "destructive"}>
                    {subscription.cancelAtPeriodEnd ? "Canceling at period end" : subscription.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {subscription.currentPeriodEnd
                    ? `${subscription.cancelAtPeriodEnd ? "Expires" : "Renews"} ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : "Active subscription"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {subscription.cancelAtPeriodEnd ? (
                <Button
                  variant="outline"
                  onClick={() => reactivateMutation.mutate()}
                  disabled={reactivateMutation.isPending}
                >
                  {reactivateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel? Your subscription will remain active until the end of the billing period.")) {
                      cancelMutation.mutate();
                    }
                  }}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Usage Limits */}
      {billingStatus?.limits && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Current Usage Limits</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Contracts", value: billingStatus.limits.maxContracts },
              { label: "Proposals", value: billingStatus.limits.maxProposals },
              { label: "Opportunities", value: billingStatus.limits.maxOpportunities },
              { label: "Team Members", value: billingStatus.limits.maxTeamMembers },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {item.value === -1 ? "∞" : item.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Billing Interval Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billingInterval === "month" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setBillingInterval("month")}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billingInterval === "year" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setBillingInterval("year")}
        >
          Annual <span className="text-xs opacity-75">(Save ~17%)</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const Icon = planIcons[plan.name] || Zap;
          const monthlyPrice = parseFloat(plan.monthlyPrice || "0");
          const annualPrice = parseFloat(plan.annualPrice || plan.monthlyPrice || "0");
          const displayPrice = billingInterval === "year" ? annualPrice / 12 : monthlyPrice;
          const features = plan.features ? JSON.parse(plan.features) : [];

          const planIndex = planOrder.indexOf(plan.name);
          const isUpgrade = currentPlanIndex >= 0 && planIndex > currentPlanIndex;
          const isDowngrade = currentPlanIndex >= 0 && planIndex < currentPlanIndex;

          let ctaLabel = "Subscribe";
          let ctaVariant: "default" | "outline" = plan.name === "Growth" ? "default" : "outline";
          if (isCurrentPlan) {
            ctaLabel = "Current Plan";
          } else if (isUpgrade) {
            ctaLabel = "Upgrade";
            ctaVariant = "default";
          } else if (isDowngrade) {
            ctaLabel = "Downgrade";
            ctaVariant = "outline";
          }

          return (
            <Card
              key={plan.id}
              className={`p-6 flex flex-col ${
                isCurrentPlan ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
              } ${plan.name === "Growth" ? "relative" : ""}`}
            >
              {plan.name === "Growth" && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white">Most Popular</Badge>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isCurrentPlan ? "bg-primary/10" : "bg-gray-100"
                }`}>
                  <Icon className={`w-5 h-5 ${isCurrentPlan ? "text-primary" : "text-gray-600"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {isCurrentPlan && <Badge variant="outline" className="text-xs">Current</Badge>}
                  {isUpgrade && <Badge variant="outline" className="text-xs text-green-600 border-green-300">Upgrade</Badge>}
                  {isDowngrade && <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">Downgrade</Badge>}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold">${displayPrice.toFixed(0)}</span>
                <span className="text-gray-500 text-sm">/mo</span>
                {billingInterval === "year" && (
                  <p className="text-xs text-green-600 mt-1">
                    ${annualPrice.toFixed(0)}/year billed annually
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrentPlan ? "outline" : ctaVariant}
                disabled={isCurrentPlan || checkoutMutation.isPending}
                onClick={() => handleSubscribe(plan.id, isUpgrade)}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : isUpgrade ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : isDowngrade ? (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                ) : null}
                {ctaLabel}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Legal Agreement */}
      <p className="text-xs text-slate-400 text-center">
        By subscribing, you agree to our{" "}
        <a href="/terms" target="_blank" className="text-blue-500 hover:underline">Terms of Service</a>
        {" "}and{" "}
        <a href="/privacy" target="_blank" className="text-blue-500 hover:underline">Privacy Policy</a>.
        Subscriptions renew automatically; cancel anytime in your billing settings.
      </p>

      {/* Test Mode Notice */}
      {isDevelopmentMode && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Test Mode</p>
              <p className="text-sm text-blue-700 mt-1">
                Stripe is in test mode. Use card number{" "}
                <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code>{" "}
                with any future expiry date and CVC to test payments.
              </p>
            </div>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
