import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, AlertTriangle, CheckCircle2, Database, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";

export default function DemoMode() {
  const [demoActive, setDemoActive] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const createOpp = trpc.opportunities.create.useMutation();
  const createContract = trpc.contracts.create.useMutation();
  const createTask = trpc.tasks.create.useMutation();

  const handleActivateDemo = async () => {
    setSeeding(true);
    try {
      await createOpp.mutateAsync({ title: "[DEMO] IT Modernization Support - DoD", agency: "Department of Defense", solicitation: "W91278-26-R-0042", naics: "541512", setAside: "Small Business", type: "solicitation", summary: "[DEMO DATA] Enterprise IT modernization and cloud migration services." });
      await createOpp.mutateAsync({ title: "[DEMO] Cybersecurity Assessment Services", agency: "DHS", solicitation: "70CDCR26R00000015", naics: "541519", setAside: "8(a)", type: "solicitation", summary: "[DEMO DATA] Continuous cybersecurity monitoring and assessment." });
      await createContract.mutateAsync({ title: "[DEMO] Network Operations Support", contractNumber: "GS-35F-0511T", agency: "GSA" });
      await createTask.mutateAsync({ title: "[DEMO] Complete SAM.gov registration renewal", priority: "high" });
      await createTask.mutateAsync({ title: "[DEMO] Submit monthly status report", priority: "medium" });
      await createTask.mutateAsync({ title: "[DEMO] Review subcontracting plan", priority: "low" });
      setDemoActive(true);
      toast.success("Demo mode activated. All demo records are prefixed with [DEMO] for easy identification.");
    } catch (err: any) {
      toast.error(err.message || "Failed to seed demo data");
    } finally {
      setSeeding(false);
    }
  };

  const handleDeactivate = () => {
    setDemoActive(false);
    toast.info("Demo mode deactivated. Demo records remain in your workspace — delete them manually or filter by [DEMO] prefix.");
  };

  return (
    <PageLayout title="Demo Mode" subtitle="Seed sample records for testing and exploration" label="Administration">
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Admin/Testing Feature</p>
              <p className="text-sm text-yellow-700 mt-1">
                Demo mode creates <strong>real records</strong> in your workspace database, prefixed with [DEMO]. 
                These are not isolated — they appear in your workspace alongside production data. 
                Use only for testing or demonstration purposes. Delete demo records when no longer needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Demo Data Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={demoActive ? "default" : "secondary"} className={demoActive ? "bg-green-100 text-green-800" : ""}>
              {demoActive ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</> : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {demoActive
              ? "Demo records have been created. All are prefixed with [DEMO] for identification. Navigate to Opportunities, Contracts, or Tasks to explore."
              : "Click below to create sample opportunities, contracts, and tasks. All records will be prefixed with [DEMO] so they can be easily identified and removed later."}
          </p>
          {!demoActive ? (
            <Button onClick={handleActivateDemo} disabled={seeding}>
              {seeding ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Demo Records...</> : <><Play className="h-4 w-4 mr-2" /> Create Demo Records</>}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">2</p>
                  <p className="text-xs text-gray-600">Opportunities</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">1</p>
                  <p className="text-xs text-gray-600">Contracts</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xl font-bold text-purple-600">3</p>
                  <p className="text-xs text-gray-600">Tasks</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDeactivate} className="mt-3">
                Dismiss Demo Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
