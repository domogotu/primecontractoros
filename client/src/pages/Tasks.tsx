import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Tasks() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "medium" as string, status: "open" as string, assignedTo: "", contractId: "" });

  const { data: tasks = [], isLoading, refetch } = trpc.tasks.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ title: "", description: "", dueDate: "", priority: "medium", status: "open", assignedTo: "", contractId: "" }); } });
  const deleteMutation = trpc.tasks.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (tasks as any[]).filter((t) =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inProgress = (tasks as any[]).filter((t) => t.status === "in_progress").length;
  const dueThisWeek = (tasks as any[]).filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return due >= now && due <= weekFromNow;
  }).length;
  const completed = (tasks as any[]).filter((t) => t.status === "completed").length;

  const handleCreate = () => {
    if (!form.title) return;
    createMutation.mutate({
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      status: form.status,
      assignedTo: form.assignedTo || undefined,
      contractId: form.contractId ? parseInt(form.contractId) : undefined,
    } as any);
  };

  return (
    <PageLayout
      title="Tasks"
      subtitle="Track action items, assignments, and workflow steps across all contracts"
      label="Workflow"
      summaryCards={[
        { label: "Total Tasks", value: tasks.length },
        { label: "In Progress", value: inProgress, color: "text-blue-600" },
        { label: "Due This Week", value: dueThisWeek, color: "text-amber-600" },
        { label: "Completed", value: completed, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      }
    >
      {/* Add Form */}
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Task Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20" />
            <input placeholder="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <input placeholder="Assigned To" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Contract ID (optional)" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {/* Task List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Tasks Created</h3>
          <p className="text-gray-600 mb-6">Create tasks to track action items and assignments across your contracts and proposals.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Your First Task
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((task: any) => (
            <Card key={task.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: task.id })}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full ${task.status === "completed" ? "bg-green-100 text-green-700" : task.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                  {task.status?.replace(/_/g, " ").toUpperCase()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${task.priority === "high" ? "bg-red-100 text-red-700" : task.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                  {task.priority?.toUpperCase()}
                </span>
              </div>
              {task.dueDate && (
                <p className="text-xs text-gray-400 mt-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
              {task.assignedTo && (
                <p className="text-xs text-gray-500 mt-1">Assigned to: {task.assignedTo}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
