import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";

export default function Obligations() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    contractId: "", title: "", description: "", obligationType: "reporting", frequency: "one-time", dueDate: "",
  });

  const { data: obligations = [], isLoading, refetch } = trpc.obligations.list.useQuery();
  const createMutation = trpc.obligations.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ contractId: "", title: "", description: "", obligationType: "reporting", frequency: "one-time", dueDate: "" });
    },
  });
  const deleteMutation = trpc.obligations.delete.useMutation({ onSuccess: () => refetch() });
  const updateMutation = trpc.obligations.update.useMutation({ onSuccess: () => refetch() });

  const filtered = (obligations as any[]).filter((o) =>
    o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.obligationType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.title || !form.contractId) return;
    createMutation.mutate({
      contractId: parseInt(form.contractId),
      title: form.title,
      description: form.description || undefined,
      obligationType: form.obligationType || undefined,
      frequency: form.frequency || undefined,
      dueDate: form.dueDate || undefined,
    });
  };

  const typeLabels: Record<string, string> = {
    reporting: "Reporting", financial: "Financial", compliance: "Compliance",
    performance: "Performance", security: "Security", environmental: "Environmental",
    subcontracting: "Subcontracting Plan", property: "Government Property",
  };

  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-800",
    complete: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    waived: "bg-gray-100 text-gray-800",
  };

  return (
    <PageLayout
      title="Contractual Obligations"
      subtitle="Track FAR/DFARS clause obligations, reporting requirements, and compliance actions"
      label="Obligations"
      summaryCards={[
        { label: "Total Obligations", value: obligations.length },
        { label: "Active", value: (obligations as any[]).filter((o) => o.status === "active" || !o.status).length, color: "text-blue-600" },
        { label: "Complete", value: (obligations as any[]).filter((o) => o.status === "complete").length, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Obligation
        </Button>
      }
    >
      <PageGuide
        title="Obligations"
        description="Track contractual obligations extracted from contracts and AI reviews."
        whenToUse="When reviewing what you owe under each contract or checking obligation fulfillment."
        whatToDoNext={["Review pending obligations", "Mark fulfilled obligations", "Link obligations to deliverables", "Check for upcoming obligation deadlines"]}
        relatedRecords={[{ label: "Contracts", path: "/app/contracts" }, { label: "Deliverables", path: "/app/deliverables" }, { label: "Compliance", path: "/app/compliance" }]}
      />
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Contractual Obligation</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Contract ID *" type="number" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Obligation Title * (e.g., FAR 52.219-9 Small Business Subcontracting Plan)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Description (clause reference, specific requirements)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.obligationType} onChange={(e) => setForm({ ...form, obligationType: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="reporting">Reporting</option>
              <option value="financial">Financial</option>
              <option value="compliance">Compliance</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="environmental">Environmental</option>
              <option value="subcontracting">Subcontracting Plan</option>
              <option value="property">Government Property</option>
            </select>
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="one-time">One-Time</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annual">Semi-Annual</option>
              <option value="annual">Annual</option>
              <option value="ongoing">Ongoing</option>
            </select>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
                    </DialogBody>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Adding..." : "Add Obligation"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search obligations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading obligations...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Obligations Tracked</h3>
          <p className="text-gray-600 mb-6">Add contractual obligations from FAR/DFARS clauses including reporting requirements, subcontracting plans, security obligations, and compliance actions.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add First Obligation
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((ob: any) => (
            <Card key={ob.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{ob.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${statusColors[ob.status] || statusColors.active}`}>
                      {ob.status || "Active"}
                    </span>
                  </div>
                  {ob.description && <p className="text-sm text-gray-600 mt-1">{ob.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{typeLabels[ob.obligationType] || ob.obligationType}</span>
                    <span className="text-xs text-gray-500">Contract #{ob.contractId}</span>
                    {ob.frequency && <span className="text-xs text-gray-500">Frequency: {ob.frequency}</span>}
                    {ob.dueDate && <span className="text-xs text-gray-500">Due: {new Date(ob.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {ob.status !== "complete" && (
                    <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: ob.id, status: "complete" })}>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: ob.id })}>
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
