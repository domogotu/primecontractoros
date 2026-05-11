import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Subscription() {
  
  const { data: billingStatus, isLoading } = trpc.billing.getStatus.useQuery();
  const { data: plans = [] } = trpc.billing.getPlans.useQuery();
  const upgrade = trpc.billing.createCheckout.useMutation({
    onSuccess: () => {
      toast.success("Plan Updated: Your subscription has been updated.");
    },
  });

  if (isLoading) {
    return (
      <PageLayout title="Subscription" subtitle="Manage your plan and billing" label="Billing">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  const currentPlan = billingStatus?.subscription?.plan;
  const isDevMode = !billingStatus?.stripeConfigured;

  return (
    <PageLayout
      title="Subscription"
      subtitle="Manage your plan and billing"
      label="Billing"
      summaryCards={[
        { label: "Current Plan", value: currentPlan?.name || "Free" },
        { label: "Status", value: isDevMode ? "Dev Mode" : (billingStatus?.subscription?.status || "Inactive"), color: isDevMode ? "text-purple-600" : "text-green-600" },
        { label: "Contracts Used", value: billingStatus?.limits?.maxContracts || 0 },
        { label: "Contract Limit", value: currentPlan?.maxUsers === -1 ? "Unlimited" : (currentPlan?.maxUsers || "N/A") },
      ]}
    >
      {isDevMode && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-900">Development Mode</h3>
            <p className="text-sm text-purple-700">Stripe is not configured. All features are unlocked with no limits. Configure Stripe in Settings to enable billing.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan: any) => {
          const isCurrent = currentPlan?.id === plan.id;
          return (
            <Card key={plan.id} className={`p-6 border-2 ${isCurrent ? "border-blue-500 bg-blue-50/50" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                {isCurrent && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Current</span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                ${plan.monthlyPrice}<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {plan.contractLimit === -1 ? "Unlimited" : plan.contractLimit} contracts
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {plan.userLimit === -1 ? "Unlimited" : plan.userLimit} team members
                </li>
                {plan.features && (
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {plan.features}
                  </li>
                )}
              </ul>
              {!isCurrent && !isDevMode && (
                <Button
                  className="w-full"
                  variant={plan.monthlyPrice > (currentPlan?.monthlyPrice || 0) ? "default" : "outline"}
                  onClick={() => upgrade.mutate({ planId: plan.id, successUrl: window.location.origin + '/app/subscription', cancelUrl: window.location.origin + '/app/subscription' })}
                  disabled={upgrade.isPending}
                >
                  {plan.monthlyPrice > (currentPlan?.monthlyPrice || 0) ? "Upgrade" : "Downgrade"}
                </Button>
              )}
              {isCurrent && (
                <Button className="w-full" variant="outline" disabled>
                  <CreditCard className="w-4 h-4 mr-2" /> Current Plan
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {!isDevMode && billingStatus?.subscription?.status === "active" && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Billing History</h3>
          <Card className="p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Billing history will appear here once payments are processed through Stripe.</p>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
