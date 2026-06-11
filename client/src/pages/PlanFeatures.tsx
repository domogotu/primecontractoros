// @ts-nocheck
import React from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Lock, 
  Zap, 
  CreditCard, 
  BarChart3, 
  Users, 
  HardDrive, 
  Shield,
  AlertCircle
} from "lucide-react";

export default function PlanFeatures() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: billingStatus, isLoading: loadingBilling } = trpc.billing.getStatus.useQuery();
  const { data: plans = [], isLoading: loadingPlans } = trpc.billing.getPlans.useQuery();
  const { data: workspace } = trpc.workspace.getMyWorkspace.useQuery();

  const isLoading = loadingBilling || loadingPlans;

  // Feature categories are static UI config describing what's available per tier
  const featureCategories = [
    {
      name: "Core",
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      features: [
        { name: "Contract Management", description: "Manage unlimited contracts", included: true },
        { name: "Document Storage", description: "Secure document vault", included: true },
        { name: "Custom Workflows", description: "Build custom approval flows", included: false, unlocksIn: "Advanced" }
      ]
    },
    {
      name: "AI",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      features: [
        { name: "AI Contract Analysis", description: "Automated risk detection", included: true },
        { name: "Proposal Generation", description: "AI-assisted proposal writing", included: true },
        { name: "Custom AI Models", description: "Train on your own data", included: false, unlocksIn: "Advanced" }
      ]
    },
    {
      name: "Finance",
      icon: <CreditCard className="w-5 h-5 text-green-500" />,
      features: [
        { name: "Invoicing", description: "Create and send invoices", included: true },
        { name: "Expense Tracking", description: "Track project expenses", included: true },
        { name: "Multi-currency", description: "Support for multiple currencies", included: false, unlocksIn: "Advanced" }
      ]
    },
    {
      name: "Reporting",
      icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
      features: [
        { name: "Basic Reports", description: "Standard reporting dashboards", included: true },
        { name: "Custom Dashboards", description: "Build your own dashboards", included: true },
        { name: "Scheduled Reports", description: "Automated email reports", included: false, unlocksIn: "Advanced" }
      ]
    },
    {
      name: "Team",
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      features: [
        { name: "Role-based Access", description: "Granular permissions", included: true },
        { name: "Activity Log", description: "Track user actions", included: true },
        { name: "SSO Integration", description: "SAML/SSO login", included: false, unlocksIn: "Advanced" }
      ]
    },
    {
      name: "Storage",
      icon: <HardDrive className="w-5 h-5 text-slate-500" />,
      features: [
        { name: "Document Storage", description: "Included storage quota", included: true },
        { name: "Version History", description: "30-day document history", included: true },
        { name: "Unlimited Storage", description: "No storage limits", included: false, unlocksIn: "Advanced" }
      ]
    }
  ];

  const handleUpgrade = () => {
    toast({
      title: "Redirecting to Billing",
      description: "Taking you to the upgrade page...",
    });
    setLocation("/app/settings/billing");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48 col-span-2" />
          </div>
        </div>
      </PageLayout>
    );
  }

  const currentPlanName = billingStatus?.planName || workspace?.plan || "No Plan";
  const planStatus = billingStatus?.status || "unknown";
  const currentPeriodEnd = billingStatus?.currentPeriodEnd
    ? new Date(billingStatus.currentPeriodEnd).toLocaleDateString()
    : "N/A";

  return (
    <PageLayout>
      <PageGuide
        title="Plan Features"
        description="View your current plan capabilities and explore available upgrades."
        whenToUse="Use this page to understand what features are available in your current workspace plan."
        whatToDoNext={[
          "Review your current plan status",
          "Explore locked features",
          "Upgrade your plan if needed"
        ]}
        relatedRecords={[
          { title: "Billing & Subscription", url: "/app/settings/billing" },
          { title: "Workspace Settings", url: "/app/settings/workspace" }
        ]}
      />

      <div className="space-y-6">
        {/* Current Plan */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-foreground">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{currentPlanName}</h3>
                <p className="text-sm text-muted-foreground capitalize">Status: {planStatus}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                planStatus === "active" ? "bg-green-100 text-green-800" :
                planStatus === "trialing" ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {planStatus === "active" ? "Active" : planStatus === "trialing" ? "Trial" : planStatus || "Unknown"}
              </span>
            </div>
            {currentPeriodEnd !== "N/A" && (
              <p className="text-sm text-muted-foreground mb-4">
                Current period ends: {currentPeriodEnd}
              </p>
            )}
            {!billingStatus && (
              <div className="flex items-center gap-2 text-amber-600 text-sm mb-4">
                <AlertCircle className="w-4 h-4" />
                <span>Billing not configured. Contact your workspace admin.</span>
              </div>
            )}
            <Button onClick={handleUpgrade} className="w-full">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Features by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCategories.map((category, idx) => (
            <Card key={idx} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  {category.icon}
                  <CardTitle className="text-lg text-foreground">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {category.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {feature.included ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {feature.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                        {!feature.included && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                            Unlocks in {feature.unlocksIn}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Plans */}
        {plans.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan: any) => (
                <Card key={plan.id} className={`bg-card border-border ${plan.name === currentPlanName ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description || "Government contracting plan"}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-foreground">
                        ${plan.monthlyPrice || plan.price || 0}
                      </span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    {plan.name === currentPlanName ? (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Current Plan
                      </span>
                    ) : (
                      <Button size="sm" onClick={handleUpgrade} variant="outline">
                        {(plan.monthlyPrice || plan.price || 0) > 0 ? "Upgrade" : "Contact Sales"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* No plans available */}
        {plans.length === 0 && !loadingPlans && (
          <Card className="bg-card border-border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Plans Not Configured</h3>
            <p className="text-muted-foreground">
              Subscription plans have not been set up yet. Contact your platform administrator.
            </p>
          </Card>
        )}

        {/* Downgrade notice */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Need to change your plan?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Plan upgrades can be initiated from the Billing page. For downgrades or cancellations,
                please submit a request via the <a href="/app/support" className="text-blue-600 hover:underline">Support page</a>.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
