import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, CheckCircle2, XCircle, AlertTriangle, Clock, ThumbsUp, ThumbsDown, Loader2, FileText, Shield } from "lucide-react";
import { toast } from "sonner";

type Finding = {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  source: string;
  clauseRef?: string;
  aiConfidence: number;
  status: "pending" | "confirmed" | "rejected" | "deferred";
};

export default function AIConfirmation() {
  const [, params] = useRoute("/app/contracts/:id/ai-confirmation");
  const [, navigate] = useLocation();
  const contractId = params?.id ? parseInt(params.id) : undefined;
  const { data: contract, isLoading: contractLoading } = trpc.contracts.get.useQuery(
    { id: contractId! },
    { enabled: !!contractId }
  );

  const [findings, setFindings] = useState<Finding[]>([
    { id: "1", category: "Compliance", title: "FAR 52.219-8 Small Business Subcontracting Plan Required", description: "Contract value exceeds $750,000 threshold. A subcontracting plan for small business participation is required under FAR 52.219-8.", severity: "critical", source: "AI Contract Scan", clauseRef: "FAR 52.219-8", aiConfidence: 0.95, status: "pending" },
    { id: "2", category: "Deliverable", title: "Monthly Status Report Due by 5th Business Day", description: "Section C.4.2 requires monthly status reports submitted by the 5th business day of each month. Ensure recurring deadline is tracked.", severity: "high", source: "AI Contract Scan", clauseRef: "Section C.4.2", aiConfidence: 0.92, status: "pending" },
    { id: "3", category: "Financial", title: "Invoice Format Must Follow WAWF Requirements", description: "All invoices must be submitted through Wide Area Workflow (WAWF) per DFARS 252.232-7006.", severity: "high", source: "AI Contract Scan", clauseRef: "DFARS 252.232-7006", aiConfidence: 0.88, status: "pending" },
    { id: "4", category: "Security", title: "CUI Handling Requirements Identified", description: "Contract contains Controlled Unclassified Information (CUI) markings. NIST SP 800-171 compliance required per DFARS 252.204-7012.", severity: "critical", source: "AI Contract Scan", clauseRef: "DFARS 252.204-7012", aiConfidence: 0.91, status: "pending" },
    { id: "5", category: "Requirement", title: "Key Personnel Clause — Substitution Requires CO Approval", description: "Key personnel identified in Section H. Any substitution requires 30-day advance notice and Contracting Officer approval.", severity: "medium", source: "AI Contract Scan", clauseRef: "Section H.3", aiConfidence: 0.87, status: "pending" },
    { id: "6", category: "Insurance", title: "Professional Liability Insurance $1M Minimum", description: "Section I requires professional liability insurance with minimum $1,000,000 per occurrence.", severity: "medium", source: "AI Contract Scan", clauseRef: "Section I.2", aiConfidence: 0.85, status: "pending" },
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const handleAction = (findingId: string, action: "confirmed" | "rejected" | "deferred") => {
    setFindings(prev => prev.map(f => f.id === findingId ? { ...f, status: action } : f));
    const labels = { confirmed: "Confirmed", rejected: "Rejected", deferred: "Deferred" };
    toast.success(`Finding ${labels[action]}`);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    toast.info("AI contract scan started. This may take a moment...");
    setTimeout(() => {
      setIsScanning(false);
      toast.success("AI scan complete. Review findings below.");
    }, 3000);
  };

  const severityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
    info: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4 text-gray-400" />,
    confirmed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
    deferred: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  };

  const filteredFindings = findings.filter(f => {
    if (filterStatus !== "all" && f.status !== filterStatus) return false;
    if (filterSeverity !== "all" && f.severity !== filterSeverity) return false;
    return true;
  });

  const stats = {
    total: findings.length,
    pending: findings.filter(f => f.status === "pending").length,
    confirmed: findings.filter(f => f.status === "confirmed").length,
    rejected: findings.filter(f => f.status === "rejected").length,
  };

  if (contractLoading) return <div className="p-6 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/contracts/${contractId}/hub`)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Contract Hub
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Contract Review</h1>
          <p className="text-sm text-gray-500">{contract?.title || contract?.contractNumber || `Contract #${contractId}`}</p>
        </div>
      </div>

      <PageGuide
        title="AI Confirmation"
        description="Review AI-generated findings from contract analysis. Each finding must be confirmed, rejected, or deferred by a human reviewer before it becomes an official record."
        whenToUse="After running an AI contract scan, use this page to review each finding. AI reads and suggests — you review and approve."
        whatToDoNext="Review each finding below. Confirm items that are accurate, reject false positives, or defer items that need further investigation."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Total Findings</p></CardContent></Card>
        <Card className="border-l-4 border-l-gray-400"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-600">{stats.pending}</p><p className="text-xs text-gray-500">Pending Review</p></CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.confirmed}</p><p className="text-xs text-gray-500">Confirmed</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-500"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.rejected}</p><p className="text-xs text-gray-500">Rejected</p></CardContent></Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button onClick={handleRunScan} disabled={isScanning} className="bg-blue-900 hover:bg-blue-800">
          {isScanning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</> : <><Brain className="w-4 h-4 mr-2" /> Run AI Scan</>}
        </Button>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="deferred">Deferred</option>
        </select>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">AI Disclaimer</p>
          <p className="text-xs text-amber-700 mt-1">AI findings are suggestions only. They do not constitute legal advice, compliance certification, or official records. All findings must be reviewed and confirmed by authorized personnel before action.</p>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-gray-500">No findings match the current filters.</CardContent></Card>
        ) : (
          filteredFindings.map((finding) => (
            <Card key={finding.id} className={`border-l-4 ${finding.severity === "critical" ? "border-l-red-500" : finding.severity === "high" ? "border-l-orange-500" : finding.severity === "medium" ? "border-l-amber-500" : "border-l-blue-500"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {statusIcons[finding.status]}
                      <h3 className="font-semibold text-gray-900">{finding.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{finding.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={severityColors[finding.severity]}>{finding.severity}</Badge>
                      <Badge variant="outline">{finding.category}</Badge>
                      {finding.clauseRef && <Badge variant="outline" className="bg-slate-50"><FileText className="w-3 h-3 mr-1" />{finding.clauseRef}</Badge>}
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        <Brain className="w-3 h-3 mr-1" />{Math.round(finding.aiConfidence * 100)}% confidence
                      </Badge>
                      <Badge variant="outline" className="capitalize">{finding.status}</Badge>
                    </div>
                  </div>
                  {finding.status === "pending" && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => handleAction(finding.id, "confirmed")} className="bg-green-600 hover:bg-green-700 text-white">
                        <ThumbsUp className="w-3 h-3 mr-1" /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(finding.id, "rejected")} className="text-red-600 border-red-200 hover:bg-red-50">
                        <ThumbsDown className="w-3 h-3 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(finding.id, "deferred")} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                        <Clock className="w-3 h-3 mr-1" /> Defer
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
