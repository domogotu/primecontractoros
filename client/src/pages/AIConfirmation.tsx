import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
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

  const [findings, setFindings] = useState<Finding[]>([]);

  const [isScanning, setIsScanning] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const handleAction = (findingId: string, action: "confirmed" | "rejected" | "deferred") => {
    setFindings(prev => prev.map(f => f.id === findingId ? { ...f, status: action } : f));
    const labels = { confirmed: "Confirmed", rejected: "Rejected", deferred: "Deferred" };
    toast.success(`Finding ${labels[action]}`);
  };

  const scanMutation = trpc.aiWorkflow.runs.contractScan.useMutation({
    onSuccess: (data: any) => {
      if (data?.findings) {
        setFindings(data.findings.map((f: any, idx: number) => ({
          id: String(idx + 1),
          category: f.category || f.findingType || "General",
          title: f.title || "Finding",
          description: f.summary || f.description || "",
          severity: (f.severity || "medium") as any,
          source: "AI Contract Scan",
          clauseRef: f.sourceLocation || f.clauseReference || "",
          aiConfidence: (f.confidence || 80) / 100,
          status: "pending" as const,
        })));
      }
      setIsScanning(false);
      toast.success("AI scan complete. Review findings below.");
    },
    onError: (err: any) => {
      setIsScanning(false);
      toast.error(err.message || "AI scan failed");
    },
  });
  const handleRunScan = () => {
    if (!contract) { toast.error("No contract loaded"); return; }
    setIsScanning(true);
    toast.info("AI contract scan started. This may take a moment...");
    const workspaceId = (contract as any).workspaceId || 0;
    scanMutation.mutate({
      workspaceId,
      contractId: contractId || 0,
      documentContent: `Contract: ${(contract as any).title || ""}\nNumber: ${(contract as any).contractNumber || ""}\nStatus: ${(contract as any).status || ""}\nValue: ${(contract as any).value || ""}`,
      contractTitle: (contract as any).title || "Contract Review",
    });
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
    <PageLayout label="AI Tools" title="AI Finding Confirmation" subtitle="Review and approve AI-identified findings before they are applied to your contracts.">
      <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(`/app/contracts/${contractId}/hub`)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contract Hub
      </Button>

      <PageGuide
        title="AI Confirmation"
        description="Review AI-generated findings from contract analysis. Each finding must be confirmed, rejected, or deferred by a human reviewer before it becomes an official record."
        whenToUse="After running an AI contract scan, use this page to review each finding. AI reads and suggests — you review and approve."
        whatToDoNext={["Review each finding below. Confirm items that are accurate, reject false positives, or defer items that need further investigation."]}
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
          <Card><CardContent className="p-8 text-center text-gray-500">
            {findings.length === 0 ? (
              <div>
                <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-700 mb-1">No AI Findings Yet</p>
                <p className="text-sm">Click "Run AI Scan" above to analyze this contract for compliance issues, obligations, and risks.</p>
              </div>
            ) : "No findings match the current filters."}
          </CardContent></Card>
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
          <PageGuidancePanel
        pageKey="ai-confirmation"
        title="AI Confirmation Help"
        description="Review AI findings before they affect contract operations. Only approved findings can create live contract objects. Reject or hold findings that need manual review."
        whatToDoNext={["Review each finding carefully", "Approve findings that are correct", "Reject findings that are inaccurate", "Create live objects from approved findings"]}
        helpArticleSlug="what-is-ai-confirmation"
        glossaryTerms={["ai-finding", "awarded-contract", "deliverable", "compliance-item"]}
      />
    </PageLayout>
  );
}
