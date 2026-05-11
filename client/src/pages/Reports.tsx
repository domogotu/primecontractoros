import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Download, FileText, Loader2, CheckCircle2, DollarSign, TrendingUp, Shield, ExternalLink } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

type ReportType = "contract_summary" | "financial" | "win_loss" | "compliance";

export default function Reports() {
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [generatedReports, setGeneratedReports] = useState<Record<string, any>>({});
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null);

  const contractSummary = trpc.reports.generateContractSummary.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, contract_summary: data }));
      setGenerating(null);
      toast.success("Contract Summary Report generated");
    },
    onError: () => { setGenerating(null); toast.error("Failed to generate report"); },
  });

  const financialReport = trpc.reports.generateFinancialReport.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, financial: data }));
      setGenerating(null);
      toast.success("Financial Report generated");
    },
    onError: () => { setGenerating(null); toast.error("Failed to generate report"); },
  });

  const winLossAnalysis = trpc.reports.generateWinLossAnalysis.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, win_loss: data }));
      setGenerating(null);
      toast.success("Win/Loss Analysis generated");
    },
    onError: () => { setGenerating(null); toast.error("Failed to generate report"); },
  });

  const complianceReport = trpc.reports.generateComplianceReport.useMutation({
    onSuccess: (data) => {
      setGeneratedReports((prev) => ({ ...prev, compliance: data }));
      setGenerating(null);
      toast.success("Compliance Report generated");
    },
    onError: () => { setGenerating(null); toast.error("Failed to generate report"); },
  });

  // PDF export mutations
  const exportFinancePdf = trpc.pdf.exportFinanceSummary.useMutation({
    onSuccess: (data) => {
      setPdfGenerating(null);
      window.open(data.url, "_blank");
      toast.success("PDF downloaded");
    },
    onError: () => { setPdfGenerating(null); toast.error("Failed to export PDF"); },
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

  const handleDownloadJSON = (type: string) => {
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

  const handleExportPDF = (type: string) => {
    setPdfGenerating(type);
    if (type === "financial") {
      exportFinancePdf.mutate();
    } else {
      // For other types, download JSON as fallback
      handleDownloadJSON(type);
      setPdfGenerating(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  const reports = [
    {
      type: "contract_summary" as ReportType,
      title: "Contract Summary",
      desc: "Overview of all contracts with status, value, and timeline",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      type: "financial" as ReportType,
      title: "Financial Report",
      desc: "Revenue, invoiced amounts, and outstanding balances by contract",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      type: "win_loss" as ReportType,
      title: "Win/Loss Analysis",
      desc: "Proposal win rate, conversion metrics, and pipeline health",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      type: "compliance" as ReportType,
      title: "Compliance Status",
      desc: "Contract compliance status and upcoming deadlines",
      icon: Shield,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const generatedCount = Object.keys(generatedReports).length;

  const renderReportPreview = (type: string) => {
    const report = generatedReports[type];
    if (!report?.data) return null;

    if (type === "contract_summary") {
      const d = report.data;
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{d.totalContracts}</p>
              <p className="text-xs text-gray-500">Contracts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(d.financials?.totalPaid || 0)}</p>
              <p className="text-xs text-gray-500">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(d.financials?.totalOutstanding || 0)}</p>
              <p className="text-xs text-gray-500">Outstanding</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === "financial") {
      const d = report.data;
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(d.summary?.totalInvoiced || 0)}</p>
              <p className="text-xs text-gray-500">Invoiced</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(d.summary?.totalRevenue || 0)}</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(d.summary?.totalOutstanding || 0)}</p>
              <p className="text-xs text-gray-500">Outstanding</p>
            </div>
          </div>
          {d.byContract?.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">By Contract ({d.byContract.length})</p>
              {d.byContract.slice(0, 3).map((c: any) => (
                <div key={c.contractId} className="flex justify-between text-xs text-gray-600 py-1">
                  <span className="truncate max-w-[60%]">{c.contractTitle}</span>
                  <span className="font-medium">{formatCurrency(c.totalInvoiced)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (type === "win_loss") {
      const d = report.data;
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{d.totalProposals}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{d.won}</p>
              <p className="text-xs text-gray-500">Won</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{d.lost}</p>
              <p className="text-xs text-gray-500">Lost</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{d.winRate}%</p>
              <p className="text-xs text-gray-500">Win Rate</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === "compliance") {
      const d = report.data;
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">{d.totalContracts} Contracts Tracked</p>
          {d.contracts?.slice(0, 3).map((c: any) => (
            <div key={c.id} className="flex justify-between items-center text-xs py-1">
              <span className="truncate max-w-[60%] text-gray-600">{c.title}</span>
              <span className={`px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-100 text-green-700" : c.status === "closeout" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

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
      <div className="grid md:grid-cols-2 gap-5">
        {reports.map((report) => {
          const isGenerated = !!generatedReports[report.type];
          const isGenerating = generating === report.type;
          const Icon = report.icon;
          return (
            <Card key={report.type} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${report.bgColor}`}>
                  <Icon className={`w-5 h-5 ${report.color}`} />
                </div>
                {isGenerated && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <h3 className="font-semibold text-gray-900 mt-3 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${report.color} border-current/20`}
                  onClick={() => handleGenerate(report.type)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                  ) : isGenerated ? (
                    <><FileText className="w-3 h-3 mr-1" /> Refresh</>
                  ) : (
                    <><FileText className="w-3 h-3 mr-1" /> Generate</>
                  )}
                </Button>
                {isGenerated && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                      onClick={() => handleDownloadJSON(report.type)}
                    >
                      <Download className="w-3 h-3 mr-1" /> JSON
                    </Button>
                    {report.type === "financial" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200"
                        onClick={() => handleExportPDF(report.type)}
                        disabled={pdfGenerating === report.type}
                      >
                        {pdfGenerating === report.type ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> PDF...</>
                        ) : (
                          <><ExternalLink className="w-3 h-3 mr-1" /> PDF</>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
              {isGenerated && renderReportPreview(report.type)}
            </Card>
          );
        })}
      </div>

      {/* Help text */}
      <Card className="bg-blue-50 border border-blue-100 p-5 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">About Reports</h4>
        <p className="text-sm text-blue-800">
          Reports are generated from your workspace data in real-time. The Financial Report also supports PDF export for sharing with stakeholders.
          Contract-specific PDFs can be exported from individual Contract Detail pages. Capability Statement PDFs are available from the Capability Statements page.
        </p>
      </Card>
    </PageLayout>
  );
}
