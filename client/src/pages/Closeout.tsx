import { useState } from "react";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, FileText, DollarSign, Users, Shield, Archive } from "lucide-react";

const closeoutSteps = [
  { id: 1, title: "Final Invoice Submitted", category: "finance", status: "complete", description: "Submit final invoice with all remaining billable items" },
  { id: 2, title: "All Deliverables Accepted", category: "deliverables", status: "complete", description: "Confirm government acceptance of all CDRLs" },
  { id: 3, title: "Property Disposition Complete", category: "property", status: "in_progress", description: "Return or dispose of all government-furnished property" },
  { id: 4, title: "Subcontractor Closeout", category: "subcontracts", status: "in_progress", description: "Close out all subcontracts and verify final payments" },
  { id: 5, title: "Final Patent/Royalty Report", category: "compliance", status: "not_started", description: "Submit final patent and royalty report per FAR 52.227-11" },
  { id: 6, title: "Release of Claims", category: "legal", status: "not_started", description: "Execute contractor release of claims" },
  { id: 7, title: "Final Indirect Cost Rate Proposal", category: "finance", status: "not_started", description: "Submit final indirect cost rate proposal if applicable" },
  { id: 8, title: "Lessons Learned Documentation", category: "knowledge", status: "not_started", description: "Document lessons learned for future contracts" },
  { id: 9, title: "Archive Contract Files", category: "records", status: "not_started", description: "Archive all contract files per retention requirements" },
  { id: 10, title: "Closeout Certification", category: "final", status: "not_started", description: "Obtain final closeout certification from contracting officer" },
];

const statusIcons: Record<string, typeof CheckCircle2> = {
  complete: CheckCircle2,
  in_progress: Clock,
  not_started: Circle,
};

const statusColors: Record<string, string> = {
  complete: "text-green-600",
  in_progress: "text-amber-600",
  not_started: "text-slate-400",
};

export default function Closeout() {
  const [steps, setSteps] = useState(closeoutSteps);
  const completed = steps.filter((s) => s.status === "complete").length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Contract Closeout"
        description="Guided workflow for closing out completed contracts. Track each closeout step from final invoicing through archival."
        whenToUse="Use when a contract is nearing completion or has ended. Follow the checklist to ensure all closeout requirements are met."
        whatToDoNext={[
          "Complete in-progress closeout steps",
          "Submit final invoices and deliverables",
          "Coordinate subcontractor closeout",
          "Document lessons learned before archiving",
        ]}
        relatedRecords={[
          { label: "Contracts", path: "/app/contracts" },
          { label: "Finance", path: "/app/finance" },
          { label: "Lessons Learned", path: "/app/lessons-learned" },
          { label: "Deliverables", path: "/app/deliverables" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contract Closeout</h1>
        <p className="text-sm text-slate-500 mt-1">Guided closeout workflow</p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Closeout Progress</h3>
            <span className="text-sm font-medium text-slate-600">{completed}/{steps.length} steps complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{progress}% complete</p>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = statusIcons[step.status];
          return (
            <Card key={step.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-6 h-6 ${statusColors[step.status]}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
                      <Badge variant="outline" className="text-xs capitalize">{step.category}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                  {step.status !== "complete" && (
                    <Button
                      size="sm"
                      variant={step.status === "in_progress" ? "default" : "outline"}
                      className={step.status === "in_progress" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                      onClick={() => {
                        setSteps((prev) =>
                          prev.map((s) =>
                            s.id === step.id
                              ? { ...s, status: s.status === "not_started" ? "in_progress" : "complete" }
                              : s
                          )
                        );
                      }}
                    >
                      {step.status === "in_progress" ? "Mark Complete" : "Start"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
