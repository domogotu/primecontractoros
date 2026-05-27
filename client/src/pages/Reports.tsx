import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import {
  BarChart3, FileText, DollarSign, Shield, Calendar, Download,
  TrendingUp, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

type ReportResult = {
  type: string;
  generatedAt: string;
  data: any;
};

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportResult | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const contractSummary = trpc.reports.generateContractSummary.useMutation({
    onSuccess: (data) => { setActiveReport(data as any); setGenerating(null); },
    onError: (e: any) => { toast.error(e.message); setGenerating(null); },
  });
  const financialReport = trpc.reports.generateFinancialReport.useMutation({
    onSuccess: (data) => { setActiveReport(data as any); setGenerating(null); },
    onError: (e: any) => { toast.error(e.message); setGenerating(null); },
  });
  const winLossAnalysis = trpc.reports.generateWinLossAnalysis.useMutation({
    onSuccess: (data) => { setActiveReport(data as any); setGenerating(null); },
    onError: (e: any) => { toast.error(e.message); setGenerating(null); },
  });
  const complianceReport = trpc.reports.generateComplianceReport.useMutation({
    onSuccess: (data) => { setActiveReport(data as any); setGenerating(null); },
    onError: (e: any) => { toast.error(e.message); setGenerating(null); },
  });

  const reportTypes = [
    {
      key: "contract_summary",
      title: "Contract Summary",
      description: "Overview of all contracts with status, value, dates, and financial totals",
      icon: BarChart3,
      color: "text-blue-600 bg-blue-50",
      generate: () => { setGenerating("contract_summary"); contractSummary.mutate({}); },
    },
    {
      key: "financial_report",
      title: "Financial Report",
      description: "Revenue breakdown by contract, invoiced vs paid vs outstanding amounts",
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
      generate: () => { setGenerating("financial_report"); financialReport.mutate({}); },
    },
    {
      key: "win_loss_analysis",
      title: "Win/Loss Analysis",
      description: "Proposal outcomes, win rate, and pipeline metrics",
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
      generate: () => { setGenerating("win_loss_analysis"); winLossAnalysis.mutate(); },
    },
    {
      key: "compliance_status",
      title: "Compliance Status",
      description: "Contract compliance overview and audit readiness",
      icon: Shield,
      color: "text-amber-600 bg-amber-50",
      generate: () => { setGenerating("compliance_status"); complianceReport.mutate(); },
    },
  ];

  const exportReport = () => {
    if (!activeReport) return;
    const d = activeReport.data;
    if (activeReport.type === "contract_summary") {
      downloadCSV("contract_summary.csv",
        ["ID", "Title", "Status", "Value", "Start Date", "End Date", "Agency"],
        (d.contracts || []).map((c: any) => [c.id, c.title, c.status, c.value, c.startDate, c.endDate, c.agency])
      );
    } else if (activeReport.type === "financial_report") {
      downloadCSV("financial_report.csv",
        ["Contract ID", "Contract Title", "Total Invoiced", "Total Paid", "Outstanding", "Invoice Count"],
        (d.byContract || []).map((c: any) => [c.contractId, c.contractTitle, c.totalInvoiced, c.totalPaid, c.outstanding, c.invoiceCount])
      );
    } else if (activeReport.type === "win_loss_analysis") {
      const rows = [
        ["Total Proposals", d.totalProposals],
        ["Won", d.won],
        ["Lost", d.lost],
        ["Pending", d.pending],
        ["Win Rate", `${d.winRate}%`],
      ];
      downloadCSV("win_loss_analysis.csv", ["Metric", "Value"], rows as any);
    } else if (activeReport.type === "compliance_status") {
      downloadCSV("compliance_status.csv",
        ["ID", "Title", "Status", "End Date"],
        (d.contracts || []).map((c: any) => [c.id, c.title, c.status, c.endDate])
      );
    }
    toast.success("Report exported as CSV");
  };

  return (
    <PageLayout
        label="Analytics"
        title="Reports"
        subtitle="Generate and download reports for contracts, proposals, finance, and compliance."
      >
      <PageGuide
        title="Reports"
        description="Generate reports from your real workspace data and export as CSV."
        whenToUse="Use for management reviews, client reporting, or audit preparation."
        whatToDoNext={["Select a report type to generate", "Export the generated report as CSV"]}
        relatedRecords={[
          { label: "Dashboard", path: "/app" },
          { label: "Finance", path: "/app/finance" },
          { label: "Contracts", path: "/app/contracts" },
        ]}
      />

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="reports" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="reports" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate reports from your workspace data</p>
      </div>

      {/* Report Type Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {reportTypes.map((rt) => {
          const Icon = rt.icon;
          const isGenerating = generating === rt.key;
          return (
            <Card key={rt.key} className="hover:border-blue-300 hover:shadow-sm transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${rt.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{rt.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{rt.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 text-xs"
                      onClick={rt.generate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <BarChart3 className="w-3 h-3 mr-1" />}
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Results */}
      {activeReport && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base capitalize">{activeReport.type.replace(/_/g, " ")}</CardTitle>
                <p className="text-xs text-slate-500">Generated: {new Date(activeReport.generatedAt).toLocaleString()}</p>
              </div>
              <Button size="sm" onClick={exportReport}>
                <Download className="w-3 h-3 mr-1" /> Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeReport.type === "contract_summary" && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">{activeReport.data.totalContracts}</p>
                    <p className="text-xs text-blue-600">Total Contracts</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">${activeReport.data.financials?.totalPaid?.toLocaleString() || "0"}</p>
                    <p className="text-xs text-green-600">Total Paid</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-700">${activeReport.data.financials?.totalOutstanding?.toLocaleString() || "0"}</p>
                    <p className="text-xs text-amber-600">Outstanding</p>
                  </div>
                </div>
                {activeReport.data.contracts?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 font-medium text-slate-600">Title</th>
                          <th className="text-left p-2 font-medium text-slate-600">Status</th>
                          <th className="text-left p-2 font-medium text-slate-600">Agency</th>
                          <th className="text-right p-2 font-medium text-slate-600">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeReport.data.contracts.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-900">{c.title}</td>
                            <td className="p-2"><Badge variant="outline" className="text-xs capitalize">{c.status}</Badge></td>
                            <td className="p-2 text-slate-500">{c.agency || "—"}</td>
                            <td className="p-2 text-right text-slate-700">{c.value ? `$${parseFloat(c.value).toLocaleString()}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                ) : <p className="text-sm text-slate-500">No contracts found</p>}
              </div>
            )}

            {activeReport.type === "financial_report" && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">${activeReport.data.summary?.totalInvoiced?.toLocaleString() || "0"}</p>
                    <p className="text-xs text-blue-600">Total Invoiced</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">${activeReport.data.summary?.totalRevenue?.toLocaleString() || "0"}</p>
                    <p className="text-xs text-green-600">Revenue (Paid)</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-700">${activeReport.data.summary?.totalOutstanding?.toLocaleString() || "0"}</p>
                    <p className="text-xs text-amber-600">Outstanding</p>
                  </div>
                </div>
                {activeReport.data.byContract?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 font-medium text-slate-600">Contract</th>
                          <th className="text-right p-2 font-medium text-slate-600">Invoiced</th>
                          <th className="text-right p-2 font-medium text-slate-600">Paid</th>
                          <th className="text-right p-2 font-medium text-slate-600">Outstanding</th>
                          <th className="text-right p-2 font-medium text-slate-600">Invoices</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeReport.data.byContract.map((c: any) => (
                          <tr key={c.contractId} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-900">{c.contractTitle}</td>
                            <td className="p-2 text-right">${c.totalInvoiced.toLocaleString()}</td>
                            <td className="p-2 text-right text-green-700">${c.totalPaid.toLocaleString()}</td>
                            <td className="p-2 text-right text-amber-700">${c.outstanding.toLocaleString()}</td>
                            <td className="p-2 text-right">{c.invoiceCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                ) : <p className="text-sm text-slate-500">No financial data found</p>}
              </div>
            )}

            {activeReport.type === "win_loss_analysis" && (
              <div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">{activeReport.data.totalProposals}</p>
                    <p className="text-xs text-blue-600">Total Proposals</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">{activeReport.data.won}</p>
                    <p className="text-xs text-green-600">Won</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">{activeReport.data.lost}</p>
                    <p className="text-xs text-red-600">Lost</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-700">{activeReport.data.winRate}%</p>
                    <p className="text-xs text-purple-600">Win Rate</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Won ({activeReport.data.won})</h4>
                    {activeReport.data.wonProposals?.length > 0 ? activeReport.data.wonProposals.map((p: any) => (
                      <div key={p.id} className="p-2 bg-green-50 rounded text-sm mb-1">{p.title}</div>
                    )) : <p className="text-xs text-slate-500">None</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Lost ({activeReport.data.lost})</h4>
                    {activeReport.data.lostProposals?.length > 0 ? activeReport.data.lostProposals.map((p: any) => (
                      <div key={p.id} className="p-2 bg-red-50 rounded text-sm mb-1">{p.title}</div>
                    )) : <p className="text-xs text-slate-500">None</p>}
                  </div>
                </div>
              </div>
            )}

            {activeReport.type === "compliance_status" && (
              <div>
                <div className="p-3 bg-blue-50 rounded-lg text-center mb-4">
                  <p className="text-2xl font-bold text-blue-700">{activeReport.data.totalContracts}</p>
                  <p className="text-xs text-blue-600">Contracts Tracked</p>
                </div>
                {activeReport.data.contracts?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 font-medium text-slate-600">Title</th>
                          <th className="text-left p-2 font-medium text-slate-600">Status</th>
                          <th className="text-left p-2 font-medium text-slate-600">End Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeReport.data.contracts.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-900">{c.title}</td>
                            <td className="p-2"><Badge variant="outline" className="text-xs capitalize">{c.status}</Badge></td>
                            <td className="p-2 text-slate-500">{c.endDate || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                ) : <p className="text-sm text-slate-500">No contracts found</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    
      </PageLayout>
  );
}
