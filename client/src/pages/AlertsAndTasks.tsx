import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CheckSquare, Search, AlertTriangle, Clock, CheckCircle2, Plus, Filter } from "lucide-react";

type TabType = "alerts" | "tasks";

const mockAlerts = [
  { id: 1, title: "Invoice #INV-2026-005 payment overdue", type: "finance", severity: "high", date: "2026-05-12", read: false },
  { id: 2, title: "CMMC assessment deadline in 14 days", type: "compliance", severity: "high", date: "2026-05-11", read: false },
  { id: 3, title: "Deliverable A003 at risk - due May 20", type: "deliverable", severity: "medium", date: "2026-05-10", read: true },
  { id: 4, title: "Subcontractor ABC Corp insurance expiring June 1", type: "subcontractor", severity: "medium", date: "2026-05-09", read: true },
  { id: 5, title: "New change order submitted for review", type: "change", severity: "low", date: "2026-05-08", read: true },
  { id: 6, title: "Option year exercise decision due May 25", type: "contract", severity: "high", date: "2026-05-07", read: false },
];

const mockTasks = [
  { id: 1, title: "Review and approve change order #CO-003", priority: "high", status: "in_progress", assignee: "You", dueDate: "2026-05-15", contract: "IT Services" },
  { id: 2, title: "Submit monthly status report", priority: "high", status: "not_started", assignee: "You", dueDate: "2026-06-01", contract: "IT Services" },
  { id: 3, title: "Complete subcontractor performance evaluation", priority: "medium", status: "in_progress", assignee: "You", dueDate: "2026-05-30", contract: "Engineering Support" },
  { id: 4, title: "Update compliance matrix for new DFARS clause", priority: "medium", status: "not_started", assignee: "Jane Doe", dueDate: "2026-05-20", contract: "IT Services" },
  { id: 5, title: "Prepare closeout documentation", priority: "low", status: "not_started", assignee: "Mike Johnson", dueDate: "2026-06-15", contract: "Engineering Support" },
  { id: 6, title: "Review AI contract scan findings", priority: "high", status: "not_started", assignee: "You", dueDate: "2026-05-14", contract: "IT Services" },
];

const severityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

const taskStatusColors: Record<string, string> = {
  not_started: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  complete: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};

export default function AlertsAndTasks() {
  const [activeTab, setActiveTab] = useState<TabType>("alerts");
  const [search, setSearch] = useState("");

  const unreadAlerts = mockAlerts.filter((a) => !a.read).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Alerts & Tasks"
        description="Central hub for system alerts, notifications, and task management across all your contracts."
        whenToUse="Check daily to stay on top of urgent items. Review alerts for time-sensitive notifications and tasks for your action items."
        whatToDoNext={[
          "Address unread high-severity alerts first",
          "Review and update task progress",
          "Assign tasks to team members",
          "Clear resolved alerts",
        ]}
        relatedRecords={[
          { label: "Dashboard", path: "/app" },
          { label: "Deadlines", path: "/app/deadlines" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Compliance", path: "/app/compliance" },
        ]}
        alerts={unreadAlerts > 0 ? [{ message: `${unreadAlerts} unread alert(s) require attention`, type: "warning" }] : []}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts & Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadAlerts} unread alerts | {mockTasks.filter((t) => t.status !== "complete").length} open tasks</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === "alerts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
          onClick={() => setActiveTab("alerts")}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Alerts {unreadAlerts > 0 && <Badge className="bg-red-500 text-white ml-1 text-xs">{unreadAlerts}</Badge>}
        </button>
        <button
          className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === "tasks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
          onClick={() => setActiveTab("tasks")}
        >
          <CheckSquare className="w-4 h-4 inline mr-2" />
          Tasks
        </button>
      </div>

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-3">
          {mockAlerts.map((alert) => (
            <Card key={alert.id} className={"border-l-4 " + (alert.severity === "high" ? "border-l-red-500" : alert.severity === "medium" ? "border-l-amber-500" : "border-l-blue-500") + (!alert.read ? " bg-blue-50/30" : "")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={"w-5 h-5 flex-shrink-0 mt-0.5 " + (alert.severity === "high" ? "text-red-600" : alert.severity === "medium" ? "text-amber-600" : "text-blue-600")} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={severityColors[alert.severity]}>{alert.severity}</Badge>
                        <Badge variant="outline" className="capitalize text-xs">{alert.type}</Badge>
                        {!alert.read && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                      </div>
                      <p className="font-medium text-slate-900 text-sm">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{alert.date}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs">Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          {mockTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={severityColors[task.priority]}>{task.priority}</Badge>
                      <Badge className={taskStatusColors[task.status]}>{task.status.replace("_", " ")}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mt-1">{task.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {task.contract} | Assigned to {task.assignee} | Due {task.dueDate}
                    </p>
                  </div>
                  {task.status !== "complete" && (
                    <Button size="sm" variant="outline" className="text-xs flex-shrink-0">
                      {task.status === "not_started" ? "Start" : "Complete"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
