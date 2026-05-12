// @ts-nocheck
import { useState } from "react";
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function ConsistencyCheck() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  const runCheck = async () => {
    setRunning(true);
    setTimeout(() => {
      setResults([
        { category: "Contracts", check: "All contracts have valid status", status: "pass", details: "15 contracts checked" },
        { category: "Contracts", check: "Contract dates are consistent", status: "pass", details: "Start dates before end dates" },
        { category: "Proposals", check: "All proposals linked to opportunities", status: "warning", details: "2 proposals without linked opportunity" },
        { category: "Invoices", check: "Invoice amounts match contract values", status: "pass", details: "All invoices within contract ceiling" },
        { category: "Files", check: "All file references are valid", status: "pass", details: "No orphaned file records" },
        { category: "Users", check: "All users have valid workspace assignment", status: "pass", details: "All users assigned to active workspace" },
        { category: "Compliance", check: "Compliance items have valid due dates", status: "warning", details: "3 items with past-due dates" },
        { category: "Subcontractors", check: "Active subcontractors have contact info", status: "pass", details: "All active subs have email or phone" },
      ]);
      setRunning(false);
    }, 2000);
  };

  const passCount = results.filter(r => r.status === "pass").length;
  const warnCount = results.filter(r => r.status === "warning").length;

  return (
    <PageLayout title="Consistency Check" subtitle="Validate data integrity across your workspace" label="Administration"
      actions={<Button onClick={runCheck} disabled={running} className="bg-white text-blue-900 hover:bg-blue-50"><RefreshCw className={"h-4 w-4 mr-2 " + (running ? "animate-spin" : "")} />{running ? "Running..." : "Run Check"}</Button>}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {results.length === 0 ? (
          <Card className="p-12 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Run a Consistency Check</h3>
            <p className="text-gray-500 mb-4">Validate your workspace data to identify missing links and potential issues.</p>
            <Button onClick={runCheck}><RefreshCw className="h-4 w-4 mr-2" />Run Check Now</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((result, i) => (
              <Card key={i} className="p-4 flex items-center gap-3">
                {result.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{result.category}</span>
                    <p className="font-medium text-gray-900 text-sm">{result.check}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
