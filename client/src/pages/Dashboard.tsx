import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, AlertCircle, CheckCircle2, Clock, TrendingUp, Users, FileText, DollarSign, Zap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AIGuidancePanel } from "@/components/AIGuidancePanel";

/**
 * Dashboard Page
 * 
 * Design: Professional Minimalism
 * - Workspace status overview
 * - Setup completion progress
 * - Alerts and tasks
 * - Quick action buttons
 * - Next best steps
 */
export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
      console.error(error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-primary">PrimeContractorOS</div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="text-muted-foreground text-xs">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome to PrimeContractorOS</h1>
            <p className="text-muted-foreground">
              Your guided operating system for government contracting. Let's get you set up.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Active Opportunities</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">1</p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Outstanding Invoices</p>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">$0</p>
            </div>
          </div>

          {/* Setup Progress */}
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Setup Progress</h2>
              <span className="text-sm text-muted-foreground">3 of 6 complete</span>
            </div>

            <div className="space-y-4">
              {[
                { title: "Complete your profile", completed: true },
                { title: "Add team members", completed: false },
                { title: "Register with SAM.gov", completed: true },
                { title: "Add business certifications", completed: false },
                { title: "Set up payment method", completed: true },
                { title: "Review compliance settings", completed: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-border flex-shrink-0" />
                  )}
                  <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Guidance Panel */}
          {user?.id && (
            <AIGuidancePanel
              workspaceId={1}
              recordType="workspace"
              recordId={1}
              context={`Workspace setup status: 3 of 6 complete. Active opportunities: 0, Active contracts: 0, Team members: 1, Outstanding invoices: $0`}
              title="AI Assistant"
            />
          )}

          {/* Alerts & Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold">Alerts</h2>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm font-medium text-amber-900">
                    Complete your business profile
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Add certifications and NAICS codes to improve your visibility
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    Invite team members
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Collaborate with your team to manage opportunities and contracts
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Next Steps</h2>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium">1. Set up your workspace</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure your company profile and access settings
                  </p>
                  <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                    Get started →
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium">2. Explore opportunities</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Browse government contracting opportunities
                  </p>
                  <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                    Browse opportunities →
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                New Opportunity
              </Button>
              <Button variant="outline" className="justify-start">
                <Users className="h-4 w-4 mr-2" />
                Invite Team
              </Button>
              <Button variant="outline" className="justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
              <Button variant="outline" className="justify-start">
                <Clock className="h-4 w-4 mr-2" />
                View Tasks
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>PrimeContractorOS — A Reed Solutions LLC Product</p>
          <a href="https://reedssolutionsllc.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Visit Reed Solutions LLC →
          </a>
        </div>
      </div>
    </div>
  );
}
