import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from "@/components/PageLayout";
import LifecycleProgress from "@/components/LifecycleProgress";
import AIStatusPanel, { AICheck } from "@/components/AIStatusPanel";
import WhatsNext, { NextAction } from "@/components/WhatsNext";
import ValidationWarnings, { ValidationWarning } from "@/components/ValidationWarnings";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

const statusIcons: Record<string, typeof CheckCircle2> = {
  complete: CheckCircle2,
  in_progress: Clock,
  not_started: Circle,
  pending: Clock,
};

const statusColors: Record<string, string> = {
  complete: "text-green-600",
  in_progress: "text-amber-600",
  not_started: "text-slate-400",
  pending: "text-amber-600",
};

export default function Closeout() {
  const utils = trpc.useUtils();
  const { data: closeoutRecords = [], isLoading } = trpc.closeout.list.useQuery();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();
  const createMutation = trpc.closeout.create.useMutation({
    onSuccess: () => { utils.closeout.list.invalidate(); setShowCreate(false); toast.success("Closeout record created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.closeout.update.useMutation({
    onSuccess: () => { utils.closeout.list.invalidate(); toast.success("Closeout updated"); },
    onError: (e) => toast.error(e.message),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Closeout checklist items per record
  const checklistItems = [
    { key: "finalInvoiceSubmitted", label: "Final Invoice Submitted", description: "Submit final invoice with all remaining billable items" },
    { key: "deliverablesComplete", label: "All Deliverables Accepted", description: "Confirm government acceptance of all CDRLs" },
    { key: "governmentPropertyReturned", label: "Government Property Returned", description: "Return or dispose of all government-furnished property" },
    { key: "finalReportSubmitted", label: "Final Report Submitted", description: "Submit final performance and financial reports" },
  ];

  const activeContracts = (contracts as any[]).filter((c) => c.status === "active" || c.status === "awarded" || c.status === "closeout");
  const records = closeoutRecords as any[];

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading closeout records...</div>;

  return (
    <PageLayout
        label="Contract Operations"
        title="Contract Closeout"
        subtitle="Manage contract closeout processes, final deliverables, and documentation."
      >
      <PageGuide
        title="Contract Closeout"
        description="Guided workflow for closing out completed contracts. Track each closeout step from final invoicing through archival."
        whenToUse="Use when a contract is nearing completion or has ended. Follow the checklist to ensure all closeout requirements are met."
        whatToDoNext={[
          "Create a closeout record for a contract nearing completion",
          "Complete each checklist item as you finish the step",
          "Add notes for any blockers or exceptions",
          "Mark the closeout as complete when all items are done",
        ]}
        relatedRecords={[
          { label: "Contracts", path: "/app/contracts" },
          { label: "Finance", path: "/app/finance" },
          { label: "Lessons Learned", path: "/app/lessons-learned" },
        ]}
      />

      {/* Lifecycle Progress */}
      <LifecycleProgress currentPhase="closeout" />

      {/* AI Status Panel */}
      <AIStatusPanel checks={[
        { id: "active-closeouts", name: "Active Closeouts", status: records.filter((r: any) => r.status !== "complete" && r.status !== "closed").length > 0 ? "flagged" : "verified", message: records.filter((r: any) => r.status !== "complete" && r.status !== "closed").length > 0 ? `${records.filter((r: any) => r.status !== "complete" && r.status !== "closed").length} contract(s) in closeout process` : "No active closeouts", severity: "info" },
        { id: "contracts-ready", name: "Contracts Ready for Closeout", status: activeContracts.filter((c: any) => c.status === "closeout").length > 0 ? "flagged" : "verified", message: activeContracts.filter((c: any) => c.status === "closeout").length > 0 ? `${activeContracts.filter((c: any) => c.status === "closeout").length} contract(s) in closeout status without a record` : "All closeout-status contracts have records", severity: activeContracts.filter((c: any) => c.status === "closeout").length > 0 ? "warning" : "info" },
      ] as AICheck[]} title="CLOSEOUT STATUS" />

      {/* What's Next */}
      {records.filter((r: any) => r.status !== "complete" && r.status !== "closed").length > 0 && <WhatsNext actions={[
        { id: "complete-checklist", title: "Complete Closeout Checklists", description: "Finish remaining checklist items on active closeout records", priority: "high" as const },
      ] as NextAction[]} />}

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="closeout" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="closeout" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contract Closeout</h1>
          <p className="text-sm text-slate-500 mt-1">Track closeout progress for each contract</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Closeout
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="mb-6 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Start Contract Closeout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contract</Label>
                <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                  <SelectTrigger><SelectValue placeholder="Select a contract" /></SelectTrigger>
                  <SelectContent>
                    {activeContracts.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.title || c.contractNumber || `Contract #${c.id}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Initial closeout notes..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => { if (!selectedContractId) { toast.error("Select a contract"); return; } createMutation.mutate({ contractId: parseInt(selectedContractId), notes: notes || undefined }); }} className="bg-blue-600 hover:bg-blue-700 text-white">Create Closeout Record</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closeout Records */}
      {records.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Closeout Records</h3>
            <p className="text-sm text-slate-500 mb-4">Create a closeout record when a contract is nearing completion.</p>
            <Button onClick={() => setShowCreate(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Start First Closeout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {records.map((record: any) => {
            const contract = (contracts as any[]).find((c) => c.id === record.contractId);
            const completedItems = checklistItems.filter((item) => record[item.key]).length;
            const progress = Math.round((completedItems / checklistItems.length) * 100);
            const isComplete = record.status === "complete" || record.status === "closed";

            return (
              <Card key={record.id} className={isComplete ? "border-green-200 bg-green-50/30" : ""}>
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {contract?.title || contract?.contractNumber || `Contract #${record.contractId}`}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Started {new Date(record.createdAt).toLocaleDateString()}
                        {record.completedAt && ` — Completed ${new Date(record.completedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Badge variant={isComplete ? "default" : "outline"} className={isComplete ? "bg-green-600" : ""}>
                      {record.status || "in_progress"}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-600">Closeout Progress</span>
                      <span className="text-sm text-slate-500">{completedItems}/{checklistItems.length}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2">
                    {checklistItems.map((item) => {
                      const isDone = record[item.key];
                      const Icon = isDone ? CheckCircle2 : Circle;
                      return (
                        <div key={item.key} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                          <button
                            onClick={() => {
                              if (isComplete) return;
                              updateMutation.mutate({ id: record.id, [item.key]: !isDone });
                            }}
                            disabled={isComplete}
                            className="flex-shrink-0"
                          >
                            <Icon className={`w-5 h-5 ${isDone ? "text-green-600" : "text-slate-300"} ${!isComplete ? "hover:text-blue-500 cursor-pointer" : ""}`} />
                          </button>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}>{item.label}</p>
                            <p className="text-xs text-slate-500">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-700">{record.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {!isComplete && completedItems === checklistItems.length && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">All checklist items complete</span>
                      </div>
                      <Button size="sm" onClick={() => updateMutation.mutate({ id: record.id, status: "complete" })} className="bg-green-600 hover:bg-green-700 text-white">
                        Mark Closed <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    
            <PageGuidancePanel
        pageKey="closeout"
        title="Closeout Help"
        description="Controlled contract closeout process. Review blockers, resolve open items, upload final evidence, and create lessons learned before closing."
        whatToDoNext={["Review all closeout blockers for each contract", "Resolve open deliverables, invoices, and compliance items", "Upload final evidence and documentation", "Create lessons learned before closing"]}
        helpArticleSlug="what-is-closeout"
        glossaryTerms={["closeout", "lessons-learned", "deliverable"]}
      />
    </PageLayout>
  );
}
