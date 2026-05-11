import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Target, FileText, Briefcase, DollarSign, Folder, MessageSquare, Contact, AlertCircle, CheckCircle2, Clock, Bell, ListTodo } from "lucide-react";
import { GuidancePanel } from "@/components/GuidancePanel";

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
      {/* Navy Header */}
      <div className="bg-blue-900 text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-200 text-sm font-semibold uppercase mb-2">Dashboard</p>
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name?.split(" ")[0] || "Contractor"}</h1>
          <p className="text-blue-100">Your government contracting operations at a glance. Track your pipeline from opportunity through closeout.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary Cards - Real Data */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-white border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/opportunities")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Opportunities</p>
              <p className="text-3xl font-bold text-purple-700">{activeOpps.length}</p>
              <p className="text-xs text-gray-500 mt-1">active</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/proposals")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Proposals</p>
              <p className="text-3xl font-bold text-pink-700">{(proposals as any[]).length}</p>
              <p className="text-xs text-gray-500 mt-1">total</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/contracts")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Contracts</p>
              <p className="text-3xl font-bold text-green-700">{activeContracts.length}</p>
              <p className="text-xs text-gray-500 mt-1">active</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/finance")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Outstanding</p>
              <p className="text-3xl font-bold text-amber-700">${Math.round(totalOutstanding / 1000)}K</p>
              <p className="text-xs text-gray-500 mt-1">{pendingInvoices.length} invoices</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/tasks")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Open Tasks</p>
              <p className="text-3xl font-bold text-blue-700">{openTasks.length}</p>
              <p className="text-xs text-gray-500 mt-1">pending</p>
            </Card>
            <Card className="bg-white border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/alerts")}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Alerts</p>
              <p className="text-3xl font-bold text-red-700">{activeAlerts.length}</p>
              <p className="text-xs text-gray-500 mt-1">active</p>
            </Card>
          </div>

          {/* Guidance Panel */}
          <GuidancePanel compact={false} showPreferences={true} />

          {/* Quick Access Grid */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {quickAccessButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <Link key={btn.label} href={btn.href}>
                    <div className={`${btn.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer`}>
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-semibold text-center">{btn.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Two Column: Tasks + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Tasks */}
            <Card className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-blue-500" /> Open Tasks
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/tasks")}>View All</Button>
              </div>
              {openTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No open tasks. Create tasks from contracts, proposals, or the Tasks page.</p>
              ) : (
                <div className="space-y-2">
                  {openTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 mt-0.5">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                        task.priority === "critical" ? "bg-red-100 text-red-800" :
                        task.priority === "high" ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>{task.priority || "normal"}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Active Alerts */}
            <Card className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" /> Active Alerts
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/alerts")}>View All</Button>
              </div>
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No active alerts. Alerts are generated from compliance deadlines, overdue items, and system events.</p>
              ) : (
                <div className="space-y-2">
                  {activeAlerts.slice(0, 5).map((alert: any) => (
                    <div key={alert.id} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{alert.alertType || "system"}</p>
                      </div>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                        alert.severity === "critical" ? "bg-red-100 text-red-800" :
                        alert.severity === "high" ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>{alert.severity || "info"}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Pipeline Overview */}
          <Card className="bg-white border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contracting Pipeline</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { label: "Opportunities", count: (opportunities as any[]).length, color: "bg-purple-100 text-purple-800 border-purple-200" },
                { label: "Proposals", count: (proposals as any[]).length, color: "bg-pink-100 text-pink-800 border-pink-200" },
                { label: "Contracts", count: (contracts as any[]).length, color: "bg-green-100 text-green-800 border-green-200" },
                { label: "Invoices", count: (invoices as any[]).length, color: "bg-amber-100 text-amber-800 border-amber-200" },
              ].map((stage, idx) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className={`${stage.color} border rounded-lg px-4 py-3 text-center min-w-[120px]`}>
                    <p className="text-2xl font-bold">{stage.count}</p>
                    <p className="text-xs font-semibold">{stage.label}</p>
                  </div>
                  {idx < 3 && <span className="text-gray-300 text-xl">→</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
