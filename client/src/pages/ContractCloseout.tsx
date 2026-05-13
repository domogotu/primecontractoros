import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle, FileText, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type CloseoutStep = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "not_started" | "in_progress" | "completed" | "blocked";
  required: boolean;
  notes: string;
};

export default function ContractCloseout() {
  const [, params] = useRoute("/app/contracts/:id/closeout");
  const [, navigate] = useLocation();
  const contractId = params?.id ? parseInt(params.id) : undefined;
  const { data: contract, isLoading } = trpc.contracts.get.useQuery(
    { id: contractId! },
    { enabled: !!contractId }
  );

  const [steps, setSteps] = useState<CloseoutStep[]>([
    { id: "1", title: "Final Deliverable Verification", description: "Verify all contract deliverables have been submitted and accepted by the government.", category: "Deliverables", status: "not_started", required: true, notes: "" },
    { id: "2", title: "Final Invoice Submission", description: "Submit the final invoice including all remaining billable work and any outstanding costs.", category: "Financial", status: "not_started", required: true, notes: "" },
    { id: "3", title: "Government Property Disposition", description: "Account for and return or dispose of all government-furnished property (GFP) and equipment.", category: "Property", status: "not_started", required: true, notes: "" },
    { id: "4", title: "Subcontractor Closeout", description: "Ensure all subcontractors have completed their work, submitted final invoices, and released claims.", category: "Subcontracts", status: "not_started", required: true, notes: "" },
    { id: "5", title: "Patent and Royalty Clearance", description: "File required patent reports and resolve any royalty obligations under the contract.", category: "IP/Legal", status: "not_started", required: false, notes: "" },
    { id: "6", title: "Final Compliance Review", description: "Conduct final review of all compliance requirements including FAR/DFARS clauses.", category: "Compliance", status: "not_started", required: true, notes: "" },
    { id: "7", title: "Release of Claims", description: "Prepare and submit the contractor release of claims document to the Contracting Officer.", category: "Legal", status: "not_started", required: true, notes: "" },
    { id: "8", title: "Final Audit Preparation", description: "Prepare documentation for potential DCAA audit of contract costs and billing.", category: "Audit", status: "not_started", required: false, notes: "" },
    { id: "9", title: "Record Retention Plan", description: "Establish record retention schedule per FAR 4.703 (minimum 3 years after final payment).", category: "Records", status: "not_started", required: true, notes: "" },
    { id: "10", title: "Lessons Learned Documentation", description: "Document lessons learned, performance metrics, and recommendations for future contracts.", category: "Knowledge", status: "not_started", required: false, notes: "" },
  ]);

  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const updateStepStatus = (stepId: string, newStatus: CloseoutStep["status"]) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: newStatus } : s));
    toast.success("Step status updated");
  };

  const updateStepNotes = (stepId: string, notes: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, notes } : s));
  };

  const statusColors: Record<string, string> = {
    not_started: "bg-gray-100 text-gray-600",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    not_started: <Circle className="w-5 h-5 text-gray-300" />,
    in_progress: <Clock className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    blocked: <AlertTriangle className="w-5 h-5 text-red-500" />,
  };

  const completedCount = steps.filter(s => s.status === "completed").length;
  const requiredCompleted = steps.filter(s => s.required && s.status === "completed").length;
  const requiredTotal = steps.filter(s => s.required).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  if (isLoading) return <div className="p-6 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;

  return (
    <PageLayout label="Contract Lifecycle" title="Contract Closeout" subtitle="Track and complete all closeout activities. Ensure all requirements are met before final closure.">
      <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(`/app/contracts/${contractId}/hub`)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contract Hub
      </Button>

      <PageGuide
        title="Contract Closeout"
        description="Systematic checklist for closing out a government contract. Each step must be completed and documented before the contract can be formally closed."
        whenToUse="When a contract is nearing completion or has been completed. Start closeout as early as possible to avoid delays in final payment."
        whatToDoNext={["Work through each step below. Mark required items as completed before submitting the final closeout package."]}
      />

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">Closeout Progress</h3>
              <p className="text-sm text-gray-500">{completedCount} of {steps.length} steps completed ({requiredCompleted}/{requiredTotal} required)</p>
            </div>
            <span className="text-2xl font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <Card key={step.id} className={`transition-all ${step.status === "completed" ? "opacity-75" : ""}`}>
            <CardContent className="p-0">
              <button
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50"
              >
                {statusIcons[step.status]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${step.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>{step.title}</h3>
                    {step.required && <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Required</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{step.category}</p>
                </div>
                <Badge className={statusColors[step.status]}>{step.status.replace(/_/g, " ")}</Badge>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedStep === step.id ? "rotate-90" : ""}`} />
              </button>
              {expandedStep === step.id && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-4 mt-3">{step.description}</p>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs text-gray-500">Status:</span>
                    {(["not_started", "in_progress", "completed", "blocked"] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={step.status === s ? "default" : "outline"}
                        onClick={() => updateStepStatus(step.id, s)}
                        className="text-xs h-7"
                      >
                        {s.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add notes..."
                    value={step.notes}
                    onChange={(e) => updateStepNotes(step.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-20"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Final Actions */}
      {requiredCompleted === requiredTotal && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">All Required Steps Complete</h3>
            <p className="text-sm text-green-700 mt-1">You can now submit the closeout package to the Contracting Officer.</p>
            <Button className="mt-4 bg-green-700 hover:bg-green-800" onClick={() => toast.success("Closeout package submitted for review.")}>
              Submit Closeout Package
            </Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
