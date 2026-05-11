import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Download, FileText, Loader2, CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

type ReportType = "contract_summary" | "financial" | "win_loss" | "compliance";

export default function Reports() {
  
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [generatedReports, setGeneratedReports] = useState<Record<string, any>>({});

  const contractSummary = trpc.reports.generateContractSummary.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, contract_summary: data }));
      setGenerating(null);
      toast.success("Report Generated: Contract Summary Report is ready");
    },
    onError: () => setGenerating(null),
  });

  const financialReport = trpc.reports.generateFinancialReport.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, financial: data }));
      setGenerating(null);
      toast.success("Report Generated: Financial Report is ready");
    },
    onError: () => setGenerating(null),
  });

  const winLossAnalysis = trpc.reports.generateWinLossAnalysis.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, win_loss: data }));
      setGenerating(null);
      toast.success("Report Generated: Win/Loss Analysis is ready");
    },
    onError: () => setGenerating(null),
  });

  const complianceReport = trpc.reports.generateComplianceReport.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, compliance: data }));
      setGenerating(null);
      toast.success("Report Generated: Compliance Report is ready");
    },
    onError: () => setGenerating(null),
  });

  const handleGenerate = (type: ReportType) => {
    setGenerating(type);
    switch (type) {
      case "contract_summary":
        contractSummary.mutate({});
        break;
      case "financial":
        financialReport.mutate({});
        break;
      case "win_loss":
        winLossAnalysis.mutate();
        break;
      case "compliance":
        complianceReport.mutate();
        break;
    }
  };

  const handleDownload = (type: string) => {
    const report = generatedReports[type];
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    { type: "contract_summary" as ReportType, title: "Contract Summary", desc: "Overview of all contracts with status, value, and timeline" },
    { type: "financial" as ReportType, title: "Financial Report", desc: "Revenue, invoiced amounts, and outstanding balances by contract" },
    { type: "win_loss" as ReportType, title: "Win/Loss Analysis", desc: "Proposal win rate, conversion metrics, and pipeline health" },
    { type: "compliance" as ReportType, title: "Compliance Status", desc: "Contract compliance status and upcoming deadlines" },
  ];

  const generatedCount = Object.keys(generatedReports).length;

  return (
    <PageLayout
      title="Reports"
      subtitle="Generate reports on contract performance, financials, and compliance"
      label="Analytics"
      summaryCards={[
        { label: "Available Reports", value: 4 },
        { label: "Generated", value: generatedCount, color: "text-blue-600" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const isGenerated = !!generatedReports[report.type];
          const isGenerating = generating === report.type;
          return (
            <Card key={report.type} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
                {isGenerated && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200"
                  onClick={() => handleGenerate(report.type)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                  ) : (
                    <><FileText className="w-3 h-3 mr-1" /> Generate</>
                  )}
                </Button>
                {isGenerated && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-200"
                    onClick={() => handleDownload(report.type)}
                  >
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                )}
              </div>
              {isGenerated && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600 max-h-32 overflow-auto">
                  <pre>{JSON.stringify(generatedReports[report.type]?.data, null, 2)?.slice(0, 300)}...</pre>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
