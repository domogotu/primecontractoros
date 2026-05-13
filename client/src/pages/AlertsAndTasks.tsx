import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CheckSquare, AlertTriangle, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";

type TabType = "alerts" | "tasks";

const severityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
  critical: "bg-red-200 text-red-800",
};

const taskStatusColors: Record<string, string> = {
  not_started: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  complete: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};

export default function AlertsAndTasks() {
  const [activeTab, setActiveTab] = useState<TabType>("alerts");
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", priority: "medium", dueDate: "" });
  const { canWrite } = useWorkspaceRole();

  const { data: alerts = [], isLoading: alertsLoading, refetch: refetchAlerts } = trpc.alerts.list.useQuery();
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = trpc.tasks.list.useQuery();

  const dismissAlert = trpc.alerts.dismiss.useMutation({
    onSuccess: () => { refetchAlerts(); toast.success("Alert dismissed"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => { refetchTasks(); toast.success("Task updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      refetchTasks();
      setCreateTaskOpen(false);
      setTaskForm({ title: "", priority: "medium", dueDate: "" });
      toast.success("Task created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const unreadAlerts = (alerts as any[]).filter((a) => !a.read && a.status !== "dismissed").length;
  const openTasks = (tasks as any[]).filter((t) => t.status !== "complete").length;

  const summaryCards = [
    { label: "Unread Alerts", value: unreadAlerts, color: unreadAlerts > 0 ? "text-red-600" : "text-green-600" },
    { label: "Open Tasks", value: openTasks, color: openTasks > 0 ? "text-amber-600" : "text-green-600" },
    { label: "Total Alerts", value: (alerts as any[]).length },
    { label: "Total Tasks", value: (tasks as any[]).length },
  ];

  return (
    <PageLayout
      label="Workspace"
      title="Alerts & Tasks"
      subtitle="Central hub for system alerts, notifications, and task management across all your contracts."
      summaryCards={summaryCards}
    >
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Alerts & Tasks</h2>
          <p className="text-sm text-slate-500 mt-1">{unreadAlerts} unread alerts | {openTasks} open tasks</p>
        </div>
        {canWrite && (
          <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={taskForm.title} onChange={(e) => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
                  <Button
                    onClick={() => {
                      if (!taskForm.title) { toast.error("Title is required"); return; }
                      createTask.mutate({ title: taskForm.title, priority: taskForm.priority, dueDate: taskForm.dueDate || undefined });
                    }}
                    disabled={createTask.isPending}
                  >
                    {createTask.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
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
          Tasks {openTasks > 0 && <Badge className="bg-amber-500 text-white ml-1 text-xs">{openTasks}</Badge>}
        </button>
      </div>

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-3">
          {alertsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}
          {!alertsLoading && (alerts as any[]).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">No alerts. You're all caught up!</p>
              </CardContent>
            </Card>
          )}
          {(alerts as any[]).filter((a) => a.status !== "dismissed").map((alert: any) => (
            <Card key={alert.id} className={"border-l-4 " + (alert.severity === "high" || alert.severity === "critical" ? "border-l-red-500" : alert.severity === "medium" ? "border-l-amber-500" : "border-l-blue-500") + (!alert.read ? " bg-blue-50/30" : "")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={"w-5 h-5 flex-shrink-0 mt-0.5 " + (alert.severity === "high" || alert.severity === "critical" ? "text-red-600" : alert.severity === "medium" ? "text-amber-600" : "text-blue-600")} />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={severityColors[alert.severity] || "bg-slate-100 text-slate-700"}>{alert.severity}</Badge>
                        {alert.type && <Badge variant="outline" className="capitalize text-xs">{alert.type}</Badge>}
                        {!alert.read && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                      </div>
                      <p className="font-medium text-slate-900 text-sm">{alert.title || alert.message}</p>
                      {alert.description && <p className="text-xs text-slate-500 mt-1">{alert.description}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(alert.createdAt || alert.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {canWrite && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs flex-shrink-0"
                      onClick={() => dismissAlert.mutate({ id: alert.id })}
                      disabled={dismissAlert.isPending}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          {tasksLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}
          {!tasksLoading && (tasks as any[]).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">No tasks yet. Create your first task to get started.</p>
              </CardContent>
            </Card>
          )}
          {(tasks as any[]).map((task: any) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={severityColors[task.priority] || "bg-slate-100 text-slate-700"}>{task.priority}</Badge>
                      <Badge className={taskStatusColors[task.status] || "bg-slate-100 text-slate-700"}>{(task.status || "").replace("_", " ")}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mt-1">{task.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {task.linkedRecordType && `${task.linkedRecordType} | `}
                      {task.dueDate && `Due ${new Date(task.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  {canWrite && task.status !== "complete" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs flex-shrink-0"
                      onClick={() => updateTask.mutate({ id: task.id, status: task.status === "not_started" ? "in_progress" : "complete" })}
                      disabled={updateTask.isPending}
                    >
                      {task.status === "not_started" ? "Start" : "Complete"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
