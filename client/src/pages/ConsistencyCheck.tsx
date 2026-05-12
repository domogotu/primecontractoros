// @ts-nocheck
import React, { useState } from "react";
import { Link } from "wouter";
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

const DEMO_ISSUES = [
  {
    id: "ISS-001",
    category: "Contract missing governing file",
    severity: "critical",
    description: "Contract CON-2024-001 has no signed PDF attached.",
    recordId: "CON-2024-001",
    recordType: "contract",
    recordLink: "/app/contracts/CON-2024-001"
  },
  {
    id: "ISS-002",
    category: "Invoice without contract",
    severity: "critical",
    description: "Invoice INV-9923 is not linked to any active contract.",
    recordId: "INV-9923",
    recordType: "invoice",
    recordLink: "/app/invoices/INV-9923"
  },
  {
    id: "ISS-003",
    category: "Payment without invoice match",
    severity: "warning",
    description: "Payment PAY-1029 has no corresponding invoice.",
    recordId: "PAY-1029",
    recordType: "payment",
    recordLink: "/app/payments/PAY-1029"
  },
  {
    id: "ISS-004",
    category: "Contact not linked to any record",
    severity: "info",
    description: "Contact John Doe is orphaned.",
    recordId: "CNT-004",
    recordType: "contact",
    recordLink: "/app/contacts/CNT-004"
  },
  {
    id: "ISS-005",
    category: "Proposal won but no contract created",
    severity: "warning",
    description: "Proposal PRP-2023-09 was marked won 30 days ago.",
    recordId: "PRP-2023-09",
    recordType: "proposal",
    recordLink: "/app/proposals/PRP-2023-09"
  },
  {
    id: "ISS-006",
    category: "Contract active but no contacts",
    severity: "warning",
    description: "Contract CON-2024-005 has no assigned POCs.",
    recordId: "CON-2024-005",
    recordType: "contract",
    recordLink: "/app/contracts/CON-2024-005"
  },
  {
    id: "ISS-007",
    category: "Closeout requested but finance still open",
    severity: "critical",
    description: "Contract CON-2023-012 requested closeout but has pending invoices.",
    recordId: "CON-2023-012",
    recordType: "contract",
    recordLink: "/app/contracts/CON-2023-012"
  },
  {
    id: "ISS-008",
    category: "AI findings approved but no live object created",
    severity: "info",
    description: "AI extraction for RFP-2024-001 approved but proposal not generated.",
    recordId: "RFP-2024-001",
    recordType: "rfp",
    recordLink: "/app/rfps/RFP-2024-001"
  }
];

export default function ConsistencyCheck() {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(new Date(Date.now() - 86400000));
  const [issues, setIssues] = useState(DEMO_ISSUES);

  const handleRunCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setLastCheck(new Date());
      setIssues([...DEMO_ISSUES].sort(() => Math.random() - 0.5).slice(0, 5));
      toast({
        title: "Check Complete",
        description: "Data consistency check finished successfully.",
      });
    }, 2000);
  };

  const handleFix = (id: string) => {
    toast({
      title: "Feature coming soon",
      description: `Auto-fix for issue ${id} is not yet implemented.`,
    });
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
    <PageLayout>
      <PageGuide
        title="Data Consistency"
        description="Check whether data is consistent across records and find issues."
        whenToUse="Run this check periodically to ensure data integrity across contracts, invoices, and proposals."
        whatToDoNext="Review the identified issues and use the Fix action or navigate to the affected record to resolve them."
        relatedRecords={[
          { name: "Contracts", link: "/app/contracts" },
          { name: "Invoices", link: "/app/invoices" }
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
              Last checked: {lastCheck ? lastCheck.toLocaleString() : "Never"}
            </p>
          </div>
          <Button onClick={handleRunCheck} disabled={isChecking}>
            {isChecking ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {isChecking ? "Running Check..." : "Run Consistency Check"}
          </Button>
        </div>

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
                          <Button variant="outline" size="sm" onClick={() => handleFix(issue.id)}>
                            <Wrench className="h-3 w-3 mr-1" />
                            Fix
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
      </div>
    </PageLayout>
  );
}
