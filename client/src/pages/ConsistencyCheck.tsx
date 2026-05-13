
import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Wrench, 
  FileText, 
  AlertTriangle, 
  Info
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Issue = {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  description: string;
  recordId: string;
  recordType: string;
  recordLink: string;
};

export default function ConsistencyCheck() {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Fetch real data to run checks against
  const { data: contracts = [] } = trpc.contracts.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();
  const { data: proposals = [] } = trpc.proposals.list.useQuery();
  const { data: contacts = [] } = trpc.contacts.list.useQuery();
  const { data: tasks = [] } = trpc.tasks.list.useQuery();

  const runConsistencyCheck = () => {
    setIsChecking(true);
    const found: Issue[] = [];

    // Check 1: Contracts without any contacts linked
    contracts.forEach((c: any) => {
      if (c.status === "active") {
        const linked = contacts.filter((ct: any) => ct.contractId === c.id || ct.relatedContractId === c.id);
        if (linked.length === 0) {
          found.push({
            id: `no-contacts-${c.id}`,
            category: "Contract active but no contacts",
            severity: "warning",
            description: `Contract "${c.title}" has no assigned points of contact.`,
            recordId: `CON-${c.id}`,
            recordType: "contract",
            recordLink: `/app/contracts/${c.id}`,
          });
        }
      }
    });

    // Check 2: Won proposals without a contract
    proposals.forEach((p: any) => {
      if (p.status === "won") {
        const linked = contracts.filter((c: any) => c.proposalId === p.id || c.sourceProposalId === p.id);
        if (linked.length === 0) {
          found.push({
            id: `won-no-contract-${p.id}`,
            category: "Proposal won but no contract created",
            severity: "warning",
            description: `Proposal "${p.title}" was marked won but no contract has been created.`,
            recordId: `PRP-${p.id}`,
            recordType: "proposal",
            recordLink: `/app/proposals/${p.id}`,
          });
        }
      }
    });

    // Check 3: Invoices with no contract reference
    invoices.forEach((inv: any) => {
      if (!inv.contractId) {
        found.push({
          id: `invoice-no-contract-${inv.id}`,
          category: "Invoice without contract",
          severity: "critical",
          description: `Invoice "${inv.invoiceNumber || `#${inv.id}`}" is not linked to any contract.`,
          recordId: `INV-${inv.id}`,
          recordType: "invoice",
          recordLink: `/app/invoices/${inv.id}`,
        });
      }
    });

    // Check 4: Overdue tasks
    const now = new Date();
    tasks.forEach((t: any) => {
      if (t.dueDate && new Date(t.dueDate) < now && t.status !== "done" && t.status !== "completed") {
        found.push({
          id: `overdue-task-${t.id}`,
          category: "Overdue task",
          severity: "warning",
          description: `Task "${t.title}" was due ${new Date(t.dueDate).toLocaleDateString()} and is not yet complete.`,
          recordId: `TSK-${t.id}`,
          recordType: "task",
          recordLink: `/app/tasks`,
        });
      }
    });

    // Check 5: Contracts in closeout with no closeout record
    contracts.forEach((c: any) => {
      if (c.status === "closeout") {
        found.push({
          id: `closeout-check-${c.id}`,
          category: "Contract in closeout",
          severity: "info",
          description: `Contract "${c.title}" is in closeout status. Verify all deliverables and invoices are complete.`,
          recordId: `CON-${c.id}`,
          recordType: "contract",
          recordLink: `/app/contracts/${c.id}`,
        });
      }
    });

    setTimeout(() => {
      setIssues(found);
      setLastCheck(new Date());
      setIsChecking(false);
      setHasRun(true);
      toast({
        title: "Check Complete",
        description: found.length === 0 
          ? "No consistency issues found. Your data looks clean!"
          : `Found ${found.length} issue${found.length !== 1 ? "s" : ""} to review.`,
      });
    }, 800);
  };

  const handleFix = (issue: Issue) => {
    // Navigate to the affected record for manual fix
    window.location.href = issue.recordLink;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "red";
      case "warning": return "yellow";
      case "info": return "blue";
      default: return "gray";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info": return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const summary = {
    total: issues.length,
    critical: issues.filter(i => i.severity === "critical").length,
    warnings: issues.filter(i => i.severity === "warning").length,
    info: issues.filter(i => i.severity === "info").length,
  };

  return (
    <PageLayout title="Data Consistency" subtitle="Check whether data is consistent across records and find issues.">
      <PageGuide
        title="Data Consistency"
        description="Check whether data is consistent across records and find issues."
        whenToUse="Run this check periodically to ensure data integrity across contracts, invoices, and proposals."
        whatToDoNext={["Run the consistency check", "Review identified issues", "Navigate to affected records to resolve them"]}
        relatedRecords={[
          { label: "Contracts", path: "/app/contracts" },
          { label: "Invoices", path: "/app/invoices" }
        ]}
        alerts={
          summary.critical > 0 
            ? [{ type: "warning", message: `You have ${summary.critical} critical consistency issues that require immediate attention.` }]
            : undefined
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Consistency Status</h2>
            <p className="text-sm text-muted-foreground">
              {lastCheck ? `Last checked: ${lastCheck.toLocaleString()}` : "Not yet run — click the button to start a check."}
            </p>
          </div>
          <Button onClick={runConsistencyCheck} disabled={isChecking}>
            {isChecking ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {isChecking ? "Running Check..." : "Run Consistency Check"}
          </Button>
        </div>

        {hasRun && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{summary.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{summary.info}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {hasRun && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Identified Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p>No consistency issues found. Your data is clean!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-t-md border-b border-border text-sm font-medium text-muted-foreground">
                    <div className="col-span-3">Category</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Severity</div>
                    <div className="col-span-2">Affected Record</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-border">
                    {issues.map((issue) => {
                      const color = getSeverityColor(issue.severity);
                      return (
                        <div key={issue.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors">
                          <div className="col-span-1 md:col-span-3 font-medium text-foreground">
                            {issue.category}
                          </div>
                          <div className="col-span-1 md:col-span-4 text-sm text-muted-foreground">
                            {issue.description}
                          </div>
                          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                            {getSeverityIcon(issue.severity)}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 capitalize`}>
                              {issue.severity}
                            </span>
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <Link href={issue.recordLink} className="text-sm text-primary hover:underline flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {issue.recordId}
                            </Link>
                          </div>
                          <div className="col-span-1 md:col-span-1 flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleFix(issue)}>
                              <Wrench className="h-3 w-3 mr-1" />
                              Go Fix
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!hasRun && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium">No check has been run yet</p>
              <p className="text-sm mt-2">Click "Run Consistency Check" to scan your workspace data for issues.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
