import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Target, FileText, Briefcase, DollarSign, Folder, MessageSquare, Contact, AlertCircle, CheckCircle2, Clock, Bell, ListTodo } from "lucide-react";
import { GuidancePanel } from "@/components/GuidancePanel";
import AIWorkflowButtons from "@/components/AIWorkflowButtons";
import PageGuide from "@/components/PageGuide";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: opportunities = [] } = trpc.opportunities.list.useQuery();
  const { data: proposals = [] } = trpc.proposals.list.useQuery();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery({});
  const { data: tasks = [] } = trpc.tasks.list.useQuery({});
  const { data: alerts = [] } = trpc.alerts.list.useQuery();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const activeOpps = (opportunities as any[]).filter((o) => o.status === "evaluating" || o.status === "pursuing" || o.status === "draft");
  const activeContracts = (contracts as any[]).filter((c) => c.status === "active" || c.status === "awarded");
  const pendingInvoices = (invoices as any[]).filter((i) => i.status !== "paid");
  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);
  const openTasks = (tasks as any[]).filter((t) => t.status !== "complete" && t.status !== "dismissed");
  const activeAlerts = (alerts as any[]).filter((a) => !a.dismissed);

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
      <div className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:py-8">
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
              <div className="text-gray-400 text-lg font-bold hidden sm:block">→</div>
              <div className="text-center px-3 md:px-6 py-3 bg-pink-50 rounded-lg border border-pink-200 flex-1 min-w-[80px]">
                <p className="text-xl md:text-2xl font-bold text-pink-700">{(proposals as any[]).length}</p>
                <p className="text-xs text-gray-500 mt-1">Proposals</p>
              </div>
              <div className="text-gray-400 text-lg font-bold hidden sm:block">→</div>
              <div className="text-center px-3 md:px-6 py-3 bg-green-50 rounded-lg border border-green-200 flex-1 min-w-[80px]">
                <p className="text-xl md:text-2xl font-bold text-green-700">{(contracts as any[]).length}</p>
                <p className="text-xs text-gray-500 mt-1">Contracts</p>
              </div>
              <div className="text-gray-400 text-lg font-bold hidden sm:block">→</div>
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
