import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, AlertTriangle, CheckCircle2, Database, Loader2 } from "lucide-react";
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
      // Seed sample opportunities
      await createOpp.mutateAsync({ title: "IT Modernization Support - DoD", agency: "Department of Defense", solicitation: "W91278-26-R-0042", naics: "541512", setAside: "Small Business", type: "solicitation", summary: "Enterprise IT modernization and cloud migration services." });
      await createOpp.mutateAsync({ title: "Cybersecurity Assessment Services", agency: "DHS", solicitation: "70CDCR26R00000015", naics: "541519", setAside: "8(a)", type: "solicitation", summary: "Continuous cybersecurity monitoring and assessment." });
      // Seed sample contracts
      await createContract.mutateAsync({ title: "Network Operations Support", contractNumber: "GS-35F-0511T", agency: "GSA" });
      // Seed sample tasks
      await createTask.mutateAsync({ title: "Complete SAM.gov registration renewal", priority: "high" });
      await createTask.mutateAsync({ title: "Submit monthly status report", priority: "medium" });
      await createTask.mutateAsync({ title: "Review subcontracting plan", priority: "low" });

      setDemoActive(true);
      toast.success("Demo mode activated! Sample data has been created.");
    } catch (err: any) {
      toast.error(err.message || "Failed to seed demo data");
    } finally {
      setSeeding(false);
    }
  };

  const handleDeactivate = () => {
    setDemoActive(false);
    toast.info("Demo mode deactivated. Sample data remains in your workspace for reference.");
  };

  return (
    <PageLayout title="Demo Mode" subtitle="Preview the platform with sample data" label="Administration">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Demo Data Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Demo Mode {demoActive ? "Active" : "Inactive"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {demoActive
                  ? "Demo mode is active. Sample data has been created in your workspace. You can explore all features with realistic government contracting data."
                  : "Enable demo mode to populate your workspace with sample opportunities, contracts, tasks, and other records. This helps you explore the platform's capabilities."}
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={demoActive ? "default" : "secondary"} className={demoActive ? "bg-green-100 text-green-800" : ""}>
                  {demoActive ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</> : "Inactive"}
                </Badge>
              </div>
              {!demoActive ? (
                <Button onClick={handleActivateDemo} disabled={seeding}>
                  {seeding ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Seeding Data...</> : <><Play className="h-4 w-4 mr-2" /> Enable Demo Mode</>}
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleDeactivate}>
                  <Play className="h-4 w-4 mr-2" /> Disable Demo Mode
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {demoActive && (
        <Card className="mt-4">
          <CardHeader><CardTitle>Sample Data Created</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">2</p>
                <p className="text-xs text-gray-600">Opportunities</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">1</p>
                <p className="text-xs text-gray-600">Contracts</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">3</p>
                <p className="text-xs text-gray-600">Tasks</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">0</p>
                <p className="text-xs text-gray-600">Proposals</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Navigate to Opportunities, Contracts, or Tasks to see the sample data in action.</p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
