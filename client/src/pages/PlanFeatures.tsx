// @ts-nocheck
import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Lock, 
  Zap, 
  CreditCard, 
  BarChart3, 
  Users, 
  HardDrive, 
  Shield,
  ArrowRight
} from "lucide-react";

export default function PlanFeatures() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Try to use trpc, fallback to demo data
  const { data: featuresData, isLoading } = trpc.planFeatures?.list?.useQuery(undefined, {
    retry: false,
  }) || { data: null, isLoading: false };

  const currentPlan = {
    name: "Growth Plan",
    price: "$199/mo",
    status: "Active",
    renewalDate: "Oct 1, 2026"
  };

  const usage = {
    storage: { used: 45, total: 100, unit: "GB" },
    aiRuns: { used: 850, total: 1000, unit: "runs" },
    team: { used: 8, total: 10, unit: "members" }
  };

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
        { name: "100GB Storage", description: "Included storage quota", included: true },
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

  return (
    <PageLayout>
      <PageGuide
        title="Plan Features"
        description="View your current plan capabilities, usage limits, and explore available upgrades."
        whenToUse="Use this page to understand what features are available in your current workspace plan and check your usage limits."
        whatToDoNext={[
          "Review your current usage meters",
          "Explore locked features",
          "Upgrade your plan if needed"
        ]}
        relatedRecords={[
          { title: "Billing & Subscription", url: "/app/settings/billing" },
          { title: "Workspace Settings", url: "/app/settings/workspace" }
        ]}
      />

      <div className="space-y-6">
        {/* Current Plan & Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-1 bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{currentPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentPlan.price}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {currentPlan.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Renews on {currentPlan.renewalDate}
              </p>
              <Button onClick={handleUpgrade} className="w-full">
                Request Upgrade
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">Current Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">Storage</span>
                    <span className="text-muted-foreground">{usage.storage.used} / {usage.storage.total} {usage.storage.unit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(usage.storage.used / usage.storage.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">AI Runs</span>
                    <span className="text-muted-foreground">{usage.aiRuns.used} / {usage.aiRuns.total} {usage.aiRuns.unit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${(usage.aiRuns.used / usage.aiRuns.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">Team Members</span>
                    <span className="text-muted-foreground">{usage.team.used} / {usage.team.total} {usage.team.unit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full" 
                      style={{ width: `${(usage.team.used / usage.team.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Plan Comparison */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Plan Comparison</h2>
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-4 border-b border-border bg-muted/50">
            <div className="p-4 font-medium text-foreground">Feature</div>
            <div className="p-4 font-medium text-center text-foreground">Starter</div>
            <div className="p-4 font-medium text-center text-foreground border-x border-border bg-primary/5">Growth (Current)</div>
            <div className="p-4 font-medium text-center text-foreground">Advanced</div>
          </div>
          
          <div className="divide-y divide-border">
            {[
              { name: "Users", starter: "Up to 3", growth: "Up to 10", advanced: "Unlimited" },
              { name: "Storage", starter: "10GB", growth: "100GB", advanced: "Unlimited" },
              { name: "AI Runs", starter: "100/mo", growth: "1000/mo", advanced: "Unlimited" },
              { name: "Custom Workflows", starter: false, growth: false, advanced: true },
              { name: "API Access", starter: false, growth: true, advanced: true },
              { name: "SSO/SAML", starter: false, growth: false, advanced: true },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-4 hover:bg-muted/50 transition-colors">
                <div className="p-4 text-sm text-foreground flex items-center">{row.name}</div>
                <div className="p-4 text-sm text-center flex items-center justify-center text-muted-foreground">
                  {typeof row.starter === 'boolean' ? (row.starter ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : "-") : row.starter}
                </div>
                <div className="p-4 text-sm text-center flex items-center justify-center font-medium text-foreground border-x border-border bg-primary/5">
                  {typeof row.growth === 'boolean' ? (row.growth ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : "-") : row.growth}
                </div>
                <div className="p-4 text-sm text-center flex items-center justify-center text-muted-foreground">
                  {typeof row.advanced === 'boolean' ? (row.advanced ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : "-") : row.advanced}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 border-t border-border bg-muted/20 p-4">
            <div></div>
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Feature coming soon" })}>Downgrade</Button>
            </div>
            <div className="text-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Current Plan</span>
            </div>
            <div className="text-center">
              <Button size="sm" onClick={handleUpgrade}>Upgrade</Button>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
