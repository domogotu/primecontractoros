import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Target, FileText, Briefcase, DollarSign, Folder, MessageSquare, Contact, AlertCircle, CheckCircle2, Clock, Bell, ListTodo, ShieldCheck, TrendingUp, ArrowRight, Activity } from "lucide-react";
import { GuidancePanel } from "@/components/GuidancePanel";
import AIWorkflowButtons from "@/components/AIWorkflowButtons";
import PageGuide from "@/components/PageGuide";
import { useMemo } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: opportunities = [] } = trpc.opportunities.list.useQuery();
  const { data: proposals = [] } = trpc.proposals.list.useQuery();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery({});
  const { data: tasks = [] } = trpc.tasks.list.useQuery({});
  const { data: alerts = [] } = trpc.alerts.list.useQuery();
  const { data: deadlines = [] } = trpc.deadlines.list.useQuery();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const activeOpps = (opportunities as any[]).filter((o) => o.status === "evaluating" || o.status === "pursuing" || o.status === "draft");
  const activeContracts = (contracts as any[]).filter((c) => c.status === "active" || c.status === "awarded");
  const pendingInvoices = (invoices as any[]).filter((i) => i.status !== "paid");
  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);
  const paidInvoices = (invoices as any[]).filter((i) => i.status === "paid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);
  const openTasks = (tasks as any[]).filter((t) => t.status !== "complete" && t.status !== "dismissed");
  const activeAlerts = (alerts as any[]).filter((a) => !a.dismissed);
  const overdueTasks = openTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  const overdueInvoices = pendingInvoices.filter((i) => i.dueDate && new Date(i.dueDate) < new Date());

  // Contract Health Score
  const contractHealthScore = useMemo(() => {
    if (activeContracts.length === 0) return null;
    const healthyCount = activeContracts.filter((c: any) => c.healthStatus === "green" || !c.healthStatus).length;
    const atRiskCount = activeContracts.filter((c: any) => c.healthStatus === "yellow").length;
    const criticalCount = activeContracts.filter((c: any) => c.healthStatus === "red").length;
    return { healthy: healthyCount, atRisk: atRiskCount, critical: criticalCount };
  }, [activeContracts]);

  // Upcoming deadlines (next 14 days)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return (deadlines as any[])
      .filter((d) => d.dueDate && new Date(d.dueDate) >= now && new Date(d.dueDate) <= twoWeeks)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [deadlines]);

  // Next Best Steps logic
  const nextSteps = useMemo(() => {
    const steps: { label: string; action: string; href: string; priority: "high" | "medium" | "low" }[] = [];
    if (activeAlerts.length > 0) steps.push({ label: `${activeAlerts.length} active alert${activeAlerts.length > 1 ? "s" : ""} need attention`, action: "Review Alerts", href: "/app/alerts", priority: "high" });
    if (overdueTasks.length > 0) steps.push({ label: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`, action: "View Tasks", href: "/app/tasks", priority: "high" });
    if (overdueInvoices.length > 0) steps.push({ label: `${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? "s" : ""}`, action: "View Invoices", href: "/app/invoices", priority: "high" });
    const pendingProposals = (proposals as any[]).filter((p) => p.status === "draft" || p.status === "in_progress");
    if (pendingProposals.length > 0) steps.push({ label: `${pendingProposals.length} proposal${pendingProposals.length > 1 ? "s" : ""} in progress`, action: "Continue", href: "/app/proposals", priority: "medium" });
    if (upcomingDeadlines.length > 0) steps.push({ label: `${upcomingDeadlines.length} deadline${upcomingDeadlines.length > 1 ? "s" : ""} in the next 14 days`, action: "View Deadlines", href: "/app/deadlines", priority: "medium" });
    if (activeOpps.length > 0) steps.push({ label: `${activeOpps.length} active opportunit${activeOpps.length > 1 ? "ies" : "y"} to evaluate`, action: "Review", href: "/app/opportunities", priority: "low" });
    return steps.slice(0, 6);
  }, [activeAlerts, overdueTasks, overdueInvoices, proposals, upcomingDeadlines, activeOpps]);

  const quickAccessButtons = [
    { label: "Opportunities", icon: Target, color: "bg-purple-500", href: "/app/opportunities" },
    { label: "Proposals", icon: FileText, color: "bg-pink-500", href: "/app/proposals" },
    { label: "Contracts", icon: Briefcase, color: "bg-green-500", href: "/app/contracts" },
    { label: "Invoices", icon: DollarSign, color: "bg-yellow-600", href: "/app/invoices" },
    { label: "Files", icon: Folder, color: "bg-cyan-500", href: "/app/files" },
    { label: "Contacts", icon: Contact, color: "bg-red-500", href: "/app/contacts" },
    { label: "Messages", icon: MessageSquare, color: "bg-orange-500", href: "/app/messages" },
    { label: "Finance", icon: DollarSign, color: "bg-indigo-500", href: "/app/finance" },
  ];

  const priorityColors = { high: "border-red-400 bg-red-50", medium: "border-amber-400 bg-amber-50", low: "border-blue-400 bg-blue-50" };
  const priorityTextColors = { high: "text-red-700", medium: "text-amber-700", low: "text-blue-700" };

  return (
    <div className="min-h-full bg-gray-100 flex flex-col">
      <PageGuide
        title="Workspace Dashboard"
        description="Your command center for government contracting operations."
        whenToUse="Check this page daily to see what needs attention, track your pipeline, and manage upcoming deadlines."
        whatToDoNext={["Review any open alerts or overdue tasks", "Check your opportunity pipeline for new leads", "Follow up on pending proposals", "Review upcoming contract deadlines"]}
        relatedRecords={[{ label: "Opportunities", path: "/app/opportunities" }, { label: "Proposals", path: "/app/proposals" }, { label: "Contracts", path: "/app/contracts" }, { label: "Tasks", path: "/app/tasks" }]}
      />
      {/* Navy Header */}
      <div className="bg-blue-900 text-white px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-200 text-xs sm:text-sm font-semibold uppercase mb-2">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome, {user?.name?.split(" ")[0] || "Contractor"}</h1>
          <p className="text-blue-100 text-sm sm:text-base">Your government contracting operations at a glance. Track your pipeline from opportunity through closeout.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:py-8 pb-32">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Summary Cards - Real Data */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <Card className="bg-white border border-gray-200 p-3 md:p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/opportunities")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Opps</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-700">{activeOpps.length}</p>
              <p className="text-xs text-gray-500 mt-1">active</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-3 md:p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/proposals")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Proposals</p>
              <p className="text-2xl md:text-3xl font-bold text-pink-700">{(proposals as any[]).length}</p>
              <p className="text-xs text-gray-500 mt-1">total</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-3 md:p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/contracts")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Contracts</p>
              <p className="text-2xl md:text-3xl font-bold text-green-700">{activeContracts.length}</p>
              <p className="text-xs text-gray-500 mt-1">active</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-3 md:p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/finance")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Outstanding</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-700">${Math.round(totalOutstanding / 1000)}K</p>
              <p className="text-xs text-gray-500 mt-1">{pendingInvoices.length} inv.</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-3 md:p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/tasks")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Tasks</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-700">{openTasks.length}</p>
              <p className="text-xs text-gray-500 mt-1">open</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-3 md:p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/alerts")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Alerts</p>
              <p className="text-2xl md:text-3xl font-bold text-red-700">{activeAlerts.length}</p>
              <p className="text-xs text-gray-500 mt-1">active</p>
            </Card>
          </div>

          {/* Next Best Steps */}
          {nextSteps.length > 0 && (
            <Card className="bg-white border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-600" /> Next Best Steps
              </h3>
              <div className="space-y-2">
                {nextSteps.map((step, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${priorityColors[step.priority]}`}>
                    <span className={`text-sm font-medium ${priorityTextColors[step.priority]}`}>{step.label}</span>
                    <Button variant="ghost" size="sm" onClick={() => navigate(step.href)} className="text-xs">
                      {step.action} <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Guidance Panel - Command Center */}
          <AIWorkflowButtons context="dashboard" />
          <GuidancePanel compact={false} showPreferences={true} />

          {/* Quick Access Grid */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Quick Access</h2>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
              {quickAccessButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <Link key={btn.label} href={btn.href}>
                    <div className={`${btn.color} text-white rounded-lg p-3 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2 hover:opacity-90 transition-opacity cursor-pointer`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="text-xs font-semibold text-center leading-tight">{btn.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Three Column: Contract Health + Finance Snapshot + Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Contract Health */}
            <Card className="bg-white border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" /> Contract Health
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/contracts")}>View All</Button>
              </div>
              {!contractHealthScore || activeContracts.length === 0 ? (
                <p className="text-sm text-gray-500">No active contracts to assess. Win your first contract to see health metrics here.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700 flex-1">Healthy</span>
                    <span className="text-sm font-bold text-green-700">{contractHealthScore.healthy}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-gray-700 flex-1">At Risk</span>
                    <span className="text-sm font-bold text-amber-700">{contractHealthScore.atRisk}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-700 flex-1">Critical</span>
                    <span className="text-sm font-bold text-red-700">{contractHealthScore.critical}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{activeContracts.length} active contract{activeContracts.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Finance Snapshot */}
            <Card className="bg-white border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" /> Finance Snapshot
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/finance")}>Details</Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Invoiced</span>
                  <span className="text-sm font-bold text-gray-900">${(totalOutstanding + totalPaid).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Collected</span>
                  <span className="text-sm font-bold text-green-700">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outstanding</span>
                  <span className="text-sm font-bold text-amber-700">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                {overdueInvoices.length > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-red-600 font-medium">Overdue</span>
                    <span className="text-sm font-bold text-red-700">{overdueInvoices.length} invoice{overdueInvoices.length > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Compliance Readiness */}
            <Card className="bg-white border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" /> Compliance Readiness
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/deadlines")}>Deadlines</Button>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No upcoming deadlines in the next 14 days.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingDeadlines.map((dl: any) => {
                    const daysLeft = Math.ceil((new Date(dl.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={dl.id} className="flex items-center gap-2 py-1.5">
                        <div className={`w-2 h-2 rounded-full ${daysLeft <= 3 ? "bg-red-500" : daysLeft <= 7 ? "bg-amber-500" : "bg-green-500"}`}></div>
                        <span className="text-sm text-gray-700 truncate flex-1">{dl.title}</span>
                        <span className={`text-xs font-medium ${daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-gray-500"}`}>{daysLeft}d</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Two Column: Tasks + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Open Tasks */}
            <Card className="bg-white border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-blue-500" /> Open Tasks
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/tasks")}>View All</Button>
              </div>
              {openTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No open tasks. Create tasks from contracts, proposals, or the Tasks page.</p>
              ) : (
                <div className="space-y-2">
                  {openTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                      <Clock className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Active Alerts */}
            <Card className="bg-white border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" /> Active Alerts
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/alerts")}>View All</Button>
              </div>
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-gray-500">No active alerts. Alerts are generated from compliance deadlines, overdue items, and system events.</p>
              ) : (
                <div className="space-y-2">
                  {activeAlerts.slice(0, 5).map((alert: any) => (
                    <div key={alert.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                        <p className="text-xs text-gray-500 truncate">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Pipeline Summary */}
          <Card className="bg-white border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Contracting Pipeline</h3>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="text-center px-3 md:px-6 py-3 bg-purple-50 rounded-lg border border-purple-200 flex-1 min-w-[80px]">
                <p className="text-xl md:text-2xl font-bold text-purple-700">{(opportunities as any[]).length}</p>
                <p className="text-xs text-gray-500 mt-1">Opportunities</p>
              </div>
              <div className="text-gray-400 text-lg font-bold hidden sm:block">&rarr;</div>
              <div className="text-center px-3 md:px-6 py-3 bg-pink-50 rounded-lg border border-pink-200 flex-1 min-w-[80px]">
                <p className="text-xl md:text-2xl font-bold text-pink-700">{(proposals as any[]).length}</p>
                <p className="text-xs text-gray-500 mt-1">Proposals</p>
              </div>
              <div className="text-gray-400 text-lg font-bold hidden sm:block">&rarr;</div>
              <div className="text-center px-3 md:px-6 py-3 bg-green-50 rounded-lg border border-green-200 flex-1 min-w-[80px]">
                <p className="text-xl md:text-2xl font-bold text-green-700">{(contracts as any[]).length}</p>
                <p className="text-xs text-gray-500 mt-1">Contracts</p>
              </div>
              <div className="text-gray-400 text-lg font-bold hidden sm:block">&rarr;</div>
              <div className="text-center px-3 md:px-6 py-3 bg-amber-50 rounded-lg border border-amber-200 flex-1 min-w-[80px]">
                <p className="text-xl md:text-2xl font-bold text-amber-700">{(invoices as any[]).length}</p>
                <p className="text-xs text-gray-500 mt-1">Invoices</p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
