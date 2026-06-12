// @ts-nocheck
/**
 * AI Workflow Buttons Component
 * 
 * Reusable component that renders context-specific AI action buttons
 * for different record types (contracts, files, opportunities, proposals, invoices, dashboard).
 * 
 * Core rule: AI reads, organizes, compares, and suggests. The user reviews and approves.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Brain, FileSearch, GitCompare, RefreshCw, ListChecks, Lightbulb, AlertTriangle, CheckCircle2, FileText, Clock, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

type WorkflowContext = "contract" | "file" | "opportunity" | "proposal" | "invoice" | "dashboard";

interface AIWorkflowButtonsProps {
  context: WorkflowContext;
  recordId?: number;
  recordTitle?: string;
  compact?: boolean; // show as icon-only buttons
}

const WORKFLOW_ACTIONS: Record<WorkflowContext, Array<{ id: string; label: string; icon: any; description: string }>> = {
  contract: [
    { id: "contract_scan", label: "Run AI Contract Scan", icon: Brain, description: "Scan contract for requirements, deliverables, deadlines, and compliance items" },
    { id: "review_findings", label: "Review AI Findings", icon: FileSearch, description: "View and approve findings from the latest scan" },
    { id: "compare_versions", label: "Compare Prior vs Current", icon: GitCompare, description: "Compare modifications against the base contract" },
    { id: "rerun_after_mod", label: "Re-run After Modification", icon: RefreshCw, description: "Re-scan after a contract modification" },
    { id: "create_tasks", label: "Create Tasks from Findings", icon: ListChecks, description: "Convert approved findings into actionable tasks" },
  ],
  file: [
    { id: "analyze_file", label: "Analyze File", icon: FileSearch, description: "Run AI analysis on this document" },
    { id: "summarize_file", label: "Summarize File", icon: FileText, description: "Generate a concise summary" },
    { id: "extract_requirements", label: "Extract Requirements", icon: ListChecks, description: "Find requirements and obligations" },
    { id: "find_deadlines", label: "Find Deadlines", icon: Clock, description: "Identify dates and deadlines" },
    { id: "mark_governing", label: "Mark as Governing Source", icon: CheckCircle2, description: "Flag this file as the governing document" },
  ],
  opportunity: [
    { id: "opportunity_review", label: "AI Opportunity Review", icon: Brain, description: "Assess this opportunity for fit and readiness" },
    { id: "check_missing", label: "Check Missing Source Info", icon: AlertTriangle, description: "Identify missing information needed for a decision" },
    { id: "recommend_action", label: "Recommend Action", icon: Lightbulb, description: "Get a Pursue / Hold / No Pursue recommendation" },
  ],
  proposal: [
    { id: "recommend_framework", label: "Recommend Framework", icon: Lightbulb, description: "Suggest the best proposal framework" },
    { id: "build_outline", label: "Build Proposal Outline", icon: FileText, description: "Generate a structured proposal outline" },
    { id: "compliance_matrix", label: "Create Compliance Matrix", icon: ListChecks, description: "Build a compliance checklist from the solicitation" },
    { id: "review_readiness", label: "Review Proposal Readiness", icon: CheckCircle2, description: "Check if the proposal is ready for submission" },
  ],
  invoice: [
    { id: "review_billing", label: "Review Billing Terms", icon: DollarSign, description: "Check billing terms against contract" },
    { id: "check_support", label: "Check Missing Support", icon: AlertTriangle, description: "Identify missing supporting documentation" },
    { id: "match_payment", label: "Match Payment to Invoice", icon: CheckCircle2, description: "Verify payment matches invoice amount" },
  ],
  dashboard: [
    { id: "workspace_summary", label: "Generate AI Summary", icon: Brain, description: "Get an overview of your workspace status" },
    { id: "needs_attention", label: "What Needs Attention", icon: AlertTriangle, description: "Identify items requiring immediate action" },
    { id: "suggest_tasks", label: "Create Suggested Tasks", icon: ListChecks, description: "Generate task recommendations based on current state" },
  ],
};

export default function AIWorkflowButtons({ context, recordId, recordTitle, compact = false }: AIWorkflowButtonsProps) {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  // Contract scan mutation
  const contractScan = trpc.aiWorkflow.runs.contractScan.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Contract scan started. ${data.findingsCount || 0} findings generated.`);
      setRunningAction(null);
    },
    onError: (err: any) => { toast.error(err.message || "Scan failed"); setRunningAction(null); },
  });

  // File analysis mutation
  const fileAnalysis = trpc.aiWorkflow.runs.fileAnalysis.useMutation({
    onSuccess: (data: any) => {
      toast.success(`File analysis complete. ${data.findingsCount || 0} findings generated.`);
      setRunningAction(null);
    },
    onError: (err: any) => { toast.error(err.message || "Analysis failed"); setRunningAction(null); },
  });

  // Opportunity review mutation
  const opportunityReview = trpc.aiWorkflow.runs.opportunityReview.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Opportunity review complete. Recommendation: ${data.recommendation || "See suggestions"}`);
      setRunningAction(null);
    },
    onError: (err: any) => { toast.error(err.message || "Review failed"); setRunningAction(null); },
  });

  // Proposal review mutation
  const proposalReview = trpc.aiWorkflow.runs.proposalReview.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Proposal review complete. ${data.suggestionsCount || 0} suggestions generated.`);
      setRunningAction(null);
    },
    onError: (err: any) => { toast.error(err.message || "Review failed"); setRunningAction(null); },
  });

  // Invoice review mutation
  const invoiceReview = trpc.aiWorkflow.runs.invoiceReview.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Invoice review complete. ${data.findingsCount || 0} findings generated.`);
      setRunningAction(null);
    },
    onError: (err: any) => { toast.error(err.message || "Review failed"); setRunningAction(null); },
  });

  // Workspace summary mutation
  const workspaceSummary = trpc.aiWorkflow.runs.workspaceSummary.useMutation({
    onSuccess: () => {
      toast.success("Workspace summary generated. Check AI Suggestions.");
      setRunningAction(null);
    },
    onError: (err: any) => { toast.error(err.message || "Summary failed"); setRunningAction(null); },
  });

  const handleAction = (actionId: string) => {
    if (!recordId && context !== "dashboard") {
      toast.error("No record selected");
      return;
    }
    setRunningAction(actionId);
    setShowConfirm(null);

    switch (actionId) {
      case "contract_scan":
      case "rerun_after_mod":
        contractScan.mutate({ contractId: recordId! });
        break;
      case "analyze_file":
      case "summarize_file":
      case "extract_requirements":
      case "find_deadlines":
        fileAnalysis.mutate({ fileId: recordId!, analysisType: actionId });
        break;
      case "opportunity_review":
      case "check_missing":
      case "recommend_action":
        opportunityReview.mutate({ opportunityId: recordId! });
        break;
      case "recommend_framework":
      case "build_outline":
      case "compliance_matrix":
      case "review_readiness":
        proposalReview.mutate({ proposalId: recordId!, reviewType: actionId });
        break;
      case "review_billing":
      case "check_support":
      case "match_payment":
        invoiceReview.mutate({ invoiceId: recordId! });
        break;
      case "workspace_summary":
      case "needs_attention":
      case "suggest_tasks":
        workspaceSummary.mutate({ summaryType: actionId });
        break;
      case "review_findings":
        window.location.href = "/app/ai-findings";
        setRunningAction(null);
        break;
      case "compare_versions":
        contractScan.mutate({ contractId: recordId! });
        break;
      case "create_tasks":
        contractScan.mutate({ contractId: recordId! });
        break;
      case "mark_governing":
        fileAnalysis.mutate({ fileId: recordId!, analysisType: "mark_governing" });
        break;
      default:
        toast.error("Unknown action: " + actionId);
        setRunningAction(null);
    }
  };

  const actions = WORKFLOW_ACTIONS[context] || [];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {actions.map(action => {
          const Icon = action.icon;
          const isRunning = runningAction === action.id;
          return (
            <Button
              key={action.id}
              size="sm"
              variant="outline"
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              onClick={() => setShowConfirm(action.id)}
              disabled={isRunning}
              title={action.label}
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">{action.label}</span>
            </Button>
          );
        })}
        {/* Confirmation Dialog */}
        <Dialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm AI Action</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-slate-600 mb-4">
                {actions.find(a => a.id === showConfirm)?.description}
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                AI can help identify likely issues, obligations, and missing information, but it does not replace legal advice, contracting officer direction, or human review.
              </p>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirm(null)}>Cancel</Button>
              <Button onClick={() => handleAction(showConfirm!)}>Run AI Analysis</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Brain className="h-4 w-4 text-indigo-600" />
        AI Workflow Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {actions.map(action => {
          const Icon = action.icon;
          const isRunning = runningAction === action.id;
          return (
            <Button
              key={action.id}
              variant="outline"
              className="justify-start text-left h-auto py-2 px-3 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              onClick={() => setShowConfirm(action.id)}
              disabled={isRunning}
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Icon className="h-4 w-4 mr-2 flex-shrink-0" />}
              <span className="text-sm">{action.label}</span>
            </Button>
          );
        })}
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm AI Action</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-slate-600 mb-2">
              <strong>{actions.find(a => a.id === showConfirm)?.label}</strong>
            </p>
            <p className="text-sm text-slate-600 mb-4">
              {actions.find(a => a.id === showConfirm)?.description}
            </p>
            {recordTitle && (
              <p className="text-sm text-slate-500 mb-4">Target: <strong>{recordTitle}</strong></p>
            )}
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              AI can help identify likely issues, obligations, and missing information, but it does not replace legal advice, contracting officer direction, or human review.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(null)}>Cancel</Button>
            <Button onClick={() => handleAction(showConfirm!)}>Run AI Analysis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
