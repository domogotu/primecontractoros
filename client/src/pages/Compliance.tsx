import { useState } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

export default function Compliance() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const contractIdParam = urlParams.get("contractId") ? parseInt(urlParams.get("contractId")!) : undefined;
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    contractId: contractIdParam ? String(contractIdParam) : "", title: "", description: "", regulation: "", category: "far", dueDate: "", notes: "",
  });

  const { data: items = [], isLoading, refetch } = trpc.compliance.list.useQuery(
    contractIdParam ? { contractId: contractIdParam } : undefined
  );
  const createMutation = trpc.compliance.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ contractId: "", title: "", description: "", regulation: "", category: "far", dueDate: "", notes: "" });
    },
  });
  const deleteMutation = trpc.compliance.delete.useMutation({ onSuccess: () => refetch() });
  const updateMutation = trpc.compliance.update.useMutation({ onSuccess: () => refetch() });

  const filtered = (items as any[]).filter((i) =>
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.regulation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.title) return;
    createMutation.mutate({
      contractId: form.contractId ? parseInt(form.contractId) : undefined,
      title: form.title,
      description: form.description || undefined,
      regulation: form.regulation || undefined,
      category: form.category || undefined,
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
    });
  };

  const categoryLabels: Record<string, string> = {
    far: "FAR", dfars: "DFARS", cybersecurity: "Cybersecurity (CMMC/NIST)",
    labor: "Labor Standards", environmental: "Environmental", small_business: "Small Business",
    cost_accounting: "Cost Accounting (CAS)", export_control: "Export Control (ITAR/EAR)",
  };

  const statusColors: Record<string, string> = {
    compliant: "bg-green-100 text-green-800",
    non_compliant: "bg-red-100 text-red-800",
    in_review: "bg-amber-100 text-amber-800",
    pending: "bg-gray-100 text-gray-800",
  };

  return (
    <PageLayout
      title="Compliance Tracking"
      subtitle="Monitor FAR/DFARS compliance, CMMC readiness, CAS requirements, and regulatory obligations"
      label="Regulatory Compliance"
      summaryCards={[
        { label: "Total Items", value: items.length },
        { label: "Compliant", value: (items as any[]).filter((i) => i.status === "compliant").length, color: "text-green-600" },
        { label: "Non-Compliant", value: (items as any[]).filter((i) => i.status === "non_compliant").length, color: "text-red-600" },
        { label: "In Review", value: (items as any[]).filter((i) => i.status === "in_review").length, color: "text-amber-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Compliance Item
        </Button>
      }
    >
      <PageGuide
        title="Compliance Tracking"
        description="Monitor compliance items, requirements, and regulatory obligations across contracts."
        whenToUse="When checking compliance status, reviewing requirements, or preparing for audits."
        whatToDoNext={["Review open compliance items", "Update compliance status for active contracts", "Check FAR/DFARS requirements", "Run AI compliance review"]}
        relatedRecords={[{ label: "Contracts", path: "/app/contracts" }, { label: "Requirements", path: "/app/requirements" }, { label: "FAR Reference", path: "/app/far-reference" }]}
      />

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="compliance" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="compliance" />
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Compliance Item</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title * (e.g., CMMC Level 2 Assessment)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Regulation Reference (e.g., FAR 52.204-21, DFARS 252.204-7012)" value={form.regulation} onChange={(e) => setForm({ ...form, regulation: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="far">FAR</option>
              <option value="dfars">DFARS</option>
              <option value="cybersecurity">Cybersecurity (CMMC/NIST)</option>
              <option value="labor">Labor Standards</option>
              <option value="environmental">Environmental</option>
              <option value="small_business">Small Business</option>
              <option value="cost_accounting">Cost Accounting (CAS)</option>
              <option value="export_control">Export Control (ITAR/EAR)</option>
            </select>
            <textarea placeholder="Description (specific requirements, evidence needed)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Contract ID (optional)" type="number" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
                    </DialogBody>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Adding..." : "Add Compliance Item"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search compliance items or regulations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading compliance items...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Compliance Items Tracked</h3>
          <p className="text-gray-600 mb-6">Add compliance requirements from FAR/DFARS clauses, CMMC assessments, CAS standards, and other regulatory obligations applicable to your contracts.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add First Compliance Item
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item: any) => (
            <Card key={item.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${statusColors[item.status] || statusColors.pending}`}>
                      {(item.status || "pending").replace("_", " ")}
                    </span>
                  </div>
                  {item.regulation && <p className="text-sm text-blue-600 mt-1 font-mono">{item.regulation}</p>}
                  {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{categoryLabels[item.category] || item.category}</span>
                    {item.contractId && <span className="text-xs text-gray-500">Contract #{item.contractId}</span>}
                    {item.dueDate && <span className="text-xs text-gray-500">Due: {new Date(item.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.status !== "compliant" && (
                    <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: item.id, status: "compliant" })} title="Mark Compliant">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: item.id })}>
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
