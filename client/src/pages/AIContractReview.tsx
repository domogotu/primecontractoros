import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useWorkspace } from "@/hooks/useWorkspace";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Upload, CheckCircle2, AlertTriangle, Clock, FileText, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";

type ReviewState = "idle" | "uploading" | "reviewing" | "complete";
type FindingStatus = "pending" | "accepted" | "rejected" | "needs_discussion";

interface Finding {
  id: string;
  category: string;
  severity: "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  clauseReference: string;
  recommendation: string;
  status: FindingStatus;
}

export default function AIContractReview() {
  const { workspaceId } = useWorkspace();
  const [reviewState, setReviewState] = useState<ReviewState>("idle");
  const [contractText, setContractText] = useState("");
  const [reviewType, setReviewType] = useState("full_review");
  const [findings, setFindings] = useState<Finding[]>([]);

  const aiMutation = trpc.aiWorkflow.runs.contractScan.useMutation({
    onSuccess: (data: any) => {
      if (data?.findings) {
        setFindings(data.findings.map((f: any, idx: number) => ({
          id: `finding-${idx}`,
          category: f.category || "General",
          severity: f.severity || "medium",
          title: f.title || f.requirement || "Finding",
          description: f.description || f.details || "",
          clauseReference: f.clauseReference || f.source || "",
          recommendation: f.recommendation || f.action || "",
          status: "pending" as FindingStatus,
        })));
      }
      setReviewState("complete");
    },
    onError: () => {
      setReviewState("idle");
    },
  });

  const handleStartReview = () => {
    if (!contractText.trim()) return;
    setReviewState("reviewing");
    aiMutation.mutate({ workspaceId, contractId: 0, documentContent: contractText, contractTitle: reviewType + " review" });
  };

  const updateFindingStatus = (id: string, status: FindingStatus) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
  };

  const severityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
    info: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    needs_discussion: "bg-purple-100 text-purple-700",
  };

  const stats = {
    total: findings.length,
    pending: findings.filter((f) => f.status === "pending").length,
    accepted: findings.filter((f) => f.status === "accepted").length,
    rejected: findings.filter((f) => f.status === "rejected").length,
  };

  return (
    <PageLayout label="AI Tools" title="AI Contract Review" subtitle="AI-powered contract analysis that identifies risks, compliance issues, and optimization opportunities.">
      <PageGuide
        title="AI Contract Review"
        description="Upload contract text for AI-powered analysis. The AI identifies requirements, risks, compliance gaps, and obligations. You review and confirm each finding."
        whenToUse="Use before signing a new contract, during proposal review, or when auditing existing contract compliance."
        whatToDoNext={[
          "Paste or upload contract text for analysis",
          "Review each AI finding - accept, reject, or flag for discussion",
          "Accepted findings become tracked requirements",
          "Export confirmed findings to your compliance matrix",
        ]}
        relatedRecords={[
          { label: "AI Findings", path: "/app/ai-findings" },
          { label: "Compliance Matrix", path: "/app/compliance" },
          { label: "Requirements", path: "/app/requirements" },
          { label: "Contracts", path: "/app/contracts" },
        ]}
        alerts={[
          { message: "AI reads and suggests - you review and approve. AI does not make legal conclusions.", type: "info" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Contract Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured AI analysis with human confirmation workflow
          </p>
        </div>
        {reviewState === "complete" && (
          <Button variant="outline" onClick={() => { setReviewState("idle"); setFindings([]); setContractText(""); }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Review
          </Button>
        )}
      </div>

      {/* Input Phase */}
      {reviewState === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Submit Contract for Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Review Type</label>
              <Select value={reviewType} onValueChange={setReviewType}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_review">Full Contract Review</SelectItem>
                  <SelectItem value="compliance_check">Compliance Check Only</SelectItem>
                  <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                  <SelectItem value="obligation_extraction">Extract Obligations</SelectItem>
                  <SelectItem value="deadline_extraction">Extract Deadlines</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Contract Text</label>
              <Textarea
                placeholder="Paste the contract text, SOW, or relevant sections here..."
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                {contractText.length} characters | Tip: Include section headers for better analysis
              </p>
            </div>
            <Button
              onClick={handleStartReview}
              disabled={!contractText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Start AI Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviewing Phase */}
      {reviewState === "reviewing" && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Analyzing Contract...</h3>
            <p className="text-sm text-slate-500 mt-2">
              AI is scanning for requirements, obligations, risks, and compliance items.
            </p>
            <p className="text-xs text-slate-400 mt-4">This may take 15-30 seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Results Phase */}
      {reviewState === "complete" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 uppercase">Total Findings</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-amber-600 uppercase">Pending Review</p>
                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-green-600 uppercase">Accepted</p>
                <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-red-600 uppercase">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              </CardContent>
            </Card>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            {findings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">No Issues Found</h3>
                  <p className="text-sm text-slate-500">The AI did not identify any findings for this contract text.</p>
                </CardContent>
              </Card>
            ) : (
              findings.map((finding) => (
                <Card key={finding.id} className="border-l-4" style={{ borderLeftColor: finding.severity === "high" ? "#ef4444" : finding.severity === "medium" ? "#f59e0b" : "#3b82f6" }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-slate-900">{finding.title}</h4>
                          <Badge className={severityColors[finding.severity]}>{finding.severity}</Badge>
                          <Badge className={statusColors[finding.status]}>{finding.status.replace("_", " ")}</Badge>
                          <span className="text-xs text-slate-400">{finding.category}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{finding.description}</p>
                        {finding.clauseReference && (
                          <p className="text-xs text-slate-500 mb-1">
                            <FileText className="w-3 h-3 inline mr-1" />
                            Clause: {finding.clauseReference}
                          </p>
                        )}
                        {finding.recommendation && (
                          <p className="text-xs text-blue-600 bg-blue-50 rounded p-2 mt-2">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {finding.recommendation}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={finding.status === "accepted" ? "default" : "outline"}
                          className={finding.status === "accepted" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                          onClick={() => updateFindingStatus(finding.id, "accepted")}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={finding.status === "rejected" ? "default" : "outline"}
                          className={finding.status === "rejected" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                          onClick={() => updateFindingStatus(finding.id, "rejected")}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={finding.status === "needs_discussion" ? "default" : "outline"}
                          className={finding.status === "needs_discussion" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                          onClick={() => updateFindingStatus(finding.id, "needs_discussion")}
                        >
                          <Clock className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
