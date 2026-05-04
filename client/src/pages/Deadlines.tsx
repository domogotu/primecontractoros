import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Deadlines() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", dueDate: "", priority: "medium", linkedRecordType: "", linkedRecordId: "",
  });

  const { data: deadlines = [], isLoading, refetch } = trpc.deadlines.list.useQuery();
  const createMutation = trpc.deadlines.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ title: "", description: "", dueDate: "", priority: "medium", linkedRecordType: "", linkedRecordId: "" });
    },
  });
  const deleteMutation = trpc.deadlines.delete.useMutation({ onSuccess: () => refetch() });
  const updateMutation = trpc.deadlines.update.useMutation({ onSuccess: () => refetch() });

  const filtered = (deadlines as any[]).filter((d) =>
    d.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.title || !form.dueDate) return;
    createMutation.mutate({
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate,
      priority: form.priority || undefined,
      linkedRecordType: form.linkedRecordType || undefined,
      linkedRecordId: form.linkedRecordId ? parseInt(form.linkedRecordId) : undefined,
    });
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  const isUpcoming = (dueDate: string) => {
    const d = new Date(dueDate);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  const priorityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-blue-100 text-blue-800",
    low: "bg-gray-100 text-gray-800",
  };

  return (
    <PageLayout
      title="Contract Deadlines"
      subtitle="Track proposal due dates, option exercise dates, period of performance milestones, and compliance deadlines"
      label="Key Dates"
      summaryCards={[
        { label: "Total Deadlines", value: deadlines.length },
        { label: "Overdue", value: (deadlines as any[]).filter((d) => d.status !== "complete" && isOverdue(d.dueDate)).length, color: "text-red-600" },
        { label: "Due This Week", value: (deadlines as any[]).filter((d) => d.status !== "complete" && isUpcoming(d.dueDate)).length, color: "text-amber-600" },
        { label: "Complete", value: (deadlines as any[]).filter((d) => d.status === "complete").length, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Deadline
        </Button>
      }
    >
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Add Contract Deadline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Deadline Title * (e.g., Option Year 2 Exercise Date, Proposal Due)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Description (FAR clause reference, action required)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={form.linkedRecordType} onChange={(e) => setForm({ ...form, linkedRecordType: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Link to Record Type (optional)</option>
              <option value="opportunity">Opportunity</option>
              <option value="proposal">Proposal</option>
              <option value="contract">Contract</option>
            </select>
            <input placeholder="Linked Record ID" value={form.linkedRecordId} onChange={(e) => setForm({ ...form, linkedRecordId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Adding..." : "Add Deadline"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search deadlines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading deadlines...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Deadlines Tracked</h3>
          <p className="text-gray-600 mb-6">Add key dates such as proposal due dates, option exercise windows, period of performance milestones, and compliance reporting deadlines.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add First Deadline
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((deadline: any) => (
            <Card key={deadline.id} className={`bg-white border-l-4 p-5 hover:shadow-md transition-shadow ${deadline.status === "complete" ? "border-green-400" : isOverdue(deadline.dueDate) ? "border-red-400" : isUpcoming(deadline.dueDate) ? "border-amber-400" : "border-gray-200"}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {isOverdue(deadline.dueDate) && deadline.status !== "complete" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <h3 className="font-semibold text-gray-900">{deadline.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${priorityColors[deadline.priority] || priorityColors.medium}`}>
                      {deadline.priority || "Medium"}
                    </span>
                  </div>
                  {deadline.description && <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs font-medium ${isOverdue(deadline.dueDate) && deadline.status !== "complete" ? "text-red-600" : "text-gray-500"}`}>
                      Due: {new Date(deadline.dueDate).toLocaleDateString()}
                    </span>
                    {deadline.linkedRecordType && (
                      <span className="text-xs text-gray-500">{deadline.linkedRecordType} #{deadline.linkedRecordId}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {deadline.status !== "complete" && (
                    <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: deadline.id, status: "complete" })} title="Mark Complete">
                      <Calendar className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: deadline.id })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
