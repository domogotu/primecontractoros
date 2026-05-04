import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, FileCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Closeout() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contractId: "", notes: "" });

  const { data: records = [], isLoading, refetch } = trpc.closeout.list.useQuery();
  const createMutation = trpc.closeout.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ contractId: "", notes: "" }); },
  });
  const updateMutation = trpc.closeout.update.useMutation({ onSuccess: () => refetch() });

  const handleCreate = () => {
    if (!form.contractId) return;
    createMutation.mutate({ contractId: parseInt(form.contractId), notes: form.notes || undefined });
  };

  const statusColors: Record<string, string> = {
    initiated: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    complete: "bg-green-100 text-green-800",
  };

  return (
    <PageLayout
      title="Contract Closeout"
      subtitle="Manage contract closeout per FAR 4.804 — final invoices, deliverables, government property, and final reports"
      label="Closeout (FAR 4.804)"
      summaryCards={[
        { label: "Total Closeouts", value: records.length },
        { label: "In Progress", value: (records as any[]).filter((r) => r.status === "in_progress" || r.status === "initiated").length, color: "text-amber-600" },
        { label: "Complete", value: (records as any[]).filter((r) => r.status === "complete").length, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Initiate Closeout
        </Button>
      }
    >
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Initiate Contract Closeout</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Contract ID *" type="number" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Closeout Notes (reason for closeout, special instructions)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Initiating..." : "Initiate Closeout"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading closeout records...</div>
      ) : (records as any[]).length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Closeout Records</h3>
          <p className="text-gray-600 mb-6">When a contract reaches completion, initiate closeout to track the FAR 4.804 checklist: final invoice submission, deliverable acceptance, government property return, and final report filing.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Initiate First Closeout
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {(records as any[]).map((record: any) => (
            <Card key={record.id} className="bg-white border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">Contract #{record.contractId} Closeout</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${statusColors[record.status] || statusColors.initiated}`}>
                      {(record.status || "initiated").replace("_", " ")}
                    </span>
                  </div>
                  {record.notes && <p className="text-sm text-gray-600 mt-1">{record.notes}</p>}
                </div>
              </div>

              {/* FAR 4.804 Checklist */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">FAR 4.804 Closeout Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={record.finalInvoiceSubmitted || false} onChange={() => updateMutation.mutate({ id: record.id, finalInvoiceSubmitted: !record.finalInvoiceSubmitted })} className="rounded" />
                    <span className="text-sm text-gray-700">Final Invoice Submitted</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={record.deliverablesComplete || false} onChange={() => updateMutation.mutate({ id: record.id, deliverablesComplete: !record.deliverablesComplete })} className="rounded" />
                    <span className="text-sm text-gray-700">All Deliverables Accepted</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={record.governmentPropertyReturned || false} onChange={() => updateMutation.mutate({ id: record.id, governmentPropertyReturned: !record.governmentPropertyReturned })} className="rounded" />
                    <span className="text-sm text-gray-700">Government Property Returned</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={record.finalReportSubmitted || false} onChange={() => updateMutation.mutate({ id: record.id, finalReportSubmitted: !record.finalReportSubmitted })} className="rounded" />
                    <span className="text-sm text-gray-700">Final Report Submitted</span>
                  </label>
                </div>
              </div>

              {record.status !== "complete" && record.finalInvoiceSubmitted && record.deliverablesComplete && record.governmentPropertyReturned && record.finalReportSubmitted && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button onClick={() => updateMutation.mutate({ id: record.id, status: "complete" })} className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Closeout Complete
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
