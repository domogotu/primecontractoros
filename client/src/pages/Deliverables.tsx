import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Deliverables() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    contractId: "", title: "", description: "", dueDate: "", status: "pending",
  });

  const { data: deliverables = [], isLoading, refetch } = trpc.deliverables.list.useQuery();
  const createMutation = trpc.deliverables.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ contractId: "", title: "", description: "", dueDate: "", status: "pending" });
    },
  });
  const deleteMutation = trpc.deliverables.delete.useMutation({ onSuccess: () => refetch() });
  const updateMutation = trpc.deliverables.update.useMutation({ onSuccess: () => refetch() });

  const filtered = (deliverables as any[]).filter((d) =>
    d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.title || !form.contractId) return;
    createMutation.mutate({
      contractId: parseInt(form.contractId),
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate || undefined,
      status: form.status || undefined,
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    submitted: "bg-amber-100 text-amber-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <PageLayout
      title="Contract Deliverables"
      subtitle="Track CDRL items, data deliverables, and contract line item deliverables per DFARS/FAR requirements"
      label="Deliverables (CDRL)"
      summaryCards={[
        { label: "Total Deliverables", value: deliverables.length },
        { label: "Pending", value: (deliverables as any[]).filter((d) => d.status === "pending").length, color: "text-gray-600" },
        { label: "Submitted", value: (deliverables as any[]).filter((d) => d.status === "submitted").length, color: "text-amber-600" },
        { label: "Accepted", value: (deliverables as any[]).filter((d) => d.status === "accepted").length, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Deliverable
        </Button>
      }
    >
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Contract Deliverable</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Contract ID *" type="number" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Deliverable Title * (e.g., Monthly Status Report, CDRL A001)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Description (DID reference, format requirements, distribution)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted by Government</option>
              <option value="rejected">Rejected / Revision Required</option>
            </select>
          </div>
                    </DialogBody>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Adding..." : "Add Deliverable"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search deliverables..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading deliverables...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Deliverables Tracked</h3>
          <p className="text-gray-600 mb-6">Add contract deliverables (CDRLs, data items, reports) to track submission deadlines and government acceptance status.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add First Deliverable
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((del: any) => (
            <Card key={del.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{del.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${statusColors[del.status] || statusColors.pending}`}>
                      {del.status?.replace("_", " ") || "Pending"}
                    </span>
                  </div>
                  {del.description && <p className="text-sm text-gray-600 mt-1">{del.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">Contract #{del.contractId}</span>
                    {del.dueDate && <span className="text-xs text-gray-500">Due: {new Date(del.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {del.status !== "accepted" && (
                    <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: del.id, status: "accepted" })}>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: del.id })}>
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
