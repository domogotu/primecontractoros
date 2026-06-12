// @ts-nocheck
import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Activity, 
  CheckCircle2, 
  Circle, 
  BarChart3, 
  Users, 
  FileText, 
  Briefcase, 
  DollarSign, 
  Folder, 
  Bot, 
  Building2,
  Plus
} from "lucide-react";

export default function CustomerAdoption() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskName, setTaskName] = useState("");

  const { data: metrics, isLoading } = trpc.customerAdoption.getMetrics.useQuery(undefined, {
    retry: false,
    initialData: {
      setupCompletion: 0,
      adoptionScore: 0,
      userActivity: {
        activeUsers: 0,
        totalUsers: 0,
        loginsThisWeek: 0,
        actionsThisWeek: 0
      },
      modules: [
        { id: "profile", name: "Business Profile", icon: Building2, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
        { id: "opportunities", name: "Opportunities", icon: Briefcase, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
        { id: "proposals", name: "Proposals", icon: FileText, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
        { id: "contracts", name: "Contracts", icon: CheckCircle2, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
        { id: "finance", name: "Finance", icon: DollarSign, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
        { id: "files", name: "Files", icon: Folder, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
        { id: "contacts", name: "Contacts", icon: Users, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
        { id: "ai", name: "AI Assistant", icon: Bot, active: false, firstRecord: null, totalRecords: 0, lastActivity: null },
      ]
    }
  });

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: `Task "${taskName}" created successfully` });
      setIsTaskDialogOpen(false);
      setTaskName("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    },
  });
  const handleCreateTask = () => {
    if (!taskName) {
      toast({ title: "Error", description: "Please enter a task name", variant: "destructive" });
      return;
    }
    createTaskMutation.mutate({
      title: taskName,
      description: "Created from Customer Adoption page",
      status: "todo",
      priority: "medium",
    });
  };

  const moduleRoutes: Record<string, string> = {
    "Business Profile": "/app/business-profile",
    "Opportunities": "/app/opportunities",
    "Proposals": "/app/proposals",
    "Contracts": "/app/contracts",
    "Finance": "/app/finance",
    "Files": "/app/files",
    "Contacts": "/app/contacts",
    "AI Assistant": "/app/ai-contract-review",
  };
  const handleGetStarted = (moduleName: string) => {
    const route = moduleRoutes[moduleName];
    if (route) {
      setLocation(route);
    } else {
      toast({ title: "Setup Required", description: `${moduleName} module requires additional configuration. Navigate to the module page for setup instructions.` });
    }
  };

  if (isLoading) {
    return <PageLayout><div className="p-8 text-center">Loading adoption metrics...</div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <PageGuide
          title="Workspace Adoption"
          description="Monitor how well your team is utilizing PrimeContractorOS features and track setup progress."
          whenToUse="Use this page to identify unused features, track team engagement, and improve your workspace setup."
          whatToDoNext={["Review inactive modules and create adoption tasks to encourage usage."]}
          relatedRecords={[
            { label: "Team Settings", url: "/app/settings/team" },
            { label: "Workspace Config", url: "/app/settings/workspace" }
          ]}
          alerts={[
            { type: "info", message: "Your workspace adoption score is good, but you have 3 unused modules." }
          ]}
        />

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Adoption Dashboard</h2>
          <Button onClick={() => setIsTaskDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Adoption Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card text-foreground border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Adoption Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{metrics.adoptionScore}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${metrics.adoptionScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-foreground border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Setup Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{metrics.setupCompletion}%</span>
              </div>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${metrics.setupCompletion}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-foreground border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">User Activity (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{metrics.userActivity.activeUsers}/{metrics.userActivity.totalUsers}</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.userActivity.loginsThisWeek}</div>
                  <div className="text-xs text-muted-foreground">Logins</div>
                </div>
                <div className="col-span-2">
                  <div className="text-2xl font-bold">{metrics.userActivity.actionsThisWeek}</div>
                  <div className="text-xs text-muted-foreground">Total Actions Performed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-semibold mt-4">Module Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className={`bg-card text-foreground border-border ${!module.active ? 'opacity-80' : ''}`}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-md font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {module.name}
                  </CardTitle>
                  {module.active ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  {module.active ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Records:</span>
                        <span className="font-medium">{module.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">First Used:</span>
                        <span className="font-medium">{module.firstRecord}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Activity:</span>
                        <span className="font-medium">{module.lastActivity}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                      <p className="text-sm text-muted-foreground text-center">Not yet configured or used.</p>
                      <Button size="sm" variant="outline" onClick={() => handleGetStarted(module.name)}>
                        Get Started
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Create Adoption Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Description</Label>
              <Input 
                id="taskName" 
                placeholder="e.g., Add first contract" 
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
