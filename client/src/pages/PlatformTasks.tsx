import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, CheckCircle2, Clock, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PlatformTasks() {
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const tasksQuery = trpc.platformAdmin.tasks.list.useQuery();
  const statsQuery = trpc.platformAdmin.tasks.stats.useQuery();
  const createMutation = trpc.platformAdmin.tasks.create.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      setShowForm(false);
      setFormData({ title: "", description: "", priority: "medium", dueDate: "" });
      toast.success("Task created successfully.");
    },
    onError: (err) => toast.error(err.message),
  });

  const completeMutation = trpc.platformAdmin.tasks.complete.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      toast.success("Task marked as complete.");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.platformAdmin.tasks.delete.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      toast.success("Task deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  const tasks = tasksQuery.data || [];
  const stats = statsQuery.data || { total: 0, open: 0, completed: 0, overdue: 0 };

  const filtered =
    filter === "all"
      ? tasks
      : filter === "open"
        ? tasks.filter((t) => t.status === "open")
        : filter === "completed"
          ? tasks.filter((t) => t.status === "completed")
          : tasks.filter((t) => t.status === "open" && t.dueDate && new Date(t.dueDate) < new Date());

  if (tasksQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Platform Tasks</h1>
            <p className="text-slate-300">Manage platform-level operational tasks and follow-ups.</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-900 text-white hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-blue-300">{stats.total}</div>
            <div className="text-xs text-slate-400">Total Tasks</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.open}</div>
            <div className="text-xs text-slate-400">Open</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-slate-400">Completed</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-slate-400">Overdue</div>
          </Card>
        </div>

        {showForm && (
          <Card className="mb-6 bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Task</h3>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded px-3 py-2 text-sm"
                rows={3}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="bg-slate-900 border border-slate-700 text-white rounded px-3 py-2"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <Input
                  placeholder="Due date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => createMutation.mutate({
                title: formData.title,
                description: formData.description,
                priority: formData.priority as "low" | "medium" | "high" | "urgent",
                dueDate: formData.dueDate || undefined,
              })}
                disabled={createMutation.isPending || !formData.title}
                className="bg-green-900 text-white hover:bg-green-800"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "open", "completed", "overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-900 text-white"
                  : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No tasks found in this filter.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((task: any) => {
              const isOverdue = task.status === "open" && task.dueDate && new Date(task.dueDate) < new Date();
              return (
                <Card key={task.id} className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${task.status === "completed" ? "text-slate-400 line-through" : "text-white"}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          task.priority === "urgent"
                            ? "destructive"
                            : task.priority === "high"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                    {isOverdue && <span className="text-red-400 font-medium">Overdue</span>}
                  </div>

                  <div className="flex gap-2">
                    {task.status === "open" && (
                      <Button
                        onClick={() => completeMutation.mutate({ id: task.id })}
                        size="sm"
                        className="bg-green-900 text-white hover:bg-green-800"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Complete
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        if (confirm("Delete this task?")) deleteMutation.mutate({ id: task.id });
                      }}
                      size="sm"
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
    </div>
  );
}
