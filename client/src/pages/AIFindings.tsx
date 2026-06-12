import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Brain, CheckCircle2, XCircle, Clock, AlertTriangle, Search, Filter, ChevronDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";

type ReviewState = "unreviewed" | "acknowledged" | "approved" | "rejected" | "stale";

const REVIEW_STATES: { value: string; label: string; color: string; icon: any }[] = [
  { value: "all", label: "All Findings", color: "text-gray-600", icon: Brain },
  { value: "unreviewed", label: "Unreviewed", color: "text-amber-600", icon: Clock },
  { value: "approved", label: "Approved", color: "text-green-600", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", color: "text-red-600", icon: XCircle },
  { value: "stale", label: "Stale", color: "text-gray-400", icon: AlertTriangle },
];

const FINDING_TYPES = [
  { value: "all", label: "All Types" },
  { value: "compliance", label: "Compliance" },
  { value: "risk", label: "Risk" },
  { value: "missing_item", label: "Missing Item" },
  { value: "inconsistency", label: "Inconsistency" },
  { value: "opportunity", label: "Opportunity" },
];

export default function AIFindings() {
  const [filterState, setFilterState] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showAuditLog, setShowAuditLog] = useState(false);

  const [showRuns, setShowRuns] = useState(false);

  const queryInput = filterState !== "all" ? { reviewState: filterState } : undefined;
  const { data: findings = [], isLoading, refetch } = trpc.findings.list.useQuery(queryInput);
  const { data: aiRuns = [] } = trpc.findings.runs.useQuery();
  const { data: auditEntries = [] } = trpc.audit.list.useQuery({ limit: 50, entity: "aiFinding" });

  const reviewMutation = trpc.findings.review.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedFinding(null);
      if (data.resultingTaskId) {
        toast.success(`Finding approved — Task #${data.resultingTaskId} created`);
      } else {
        toast.success("Finding reviewed");
      }
    },
    onError: () => toast.error("Failed to review finding"),
  });

  const filtered = useMemo(() => {
    let list = findings as any[];
    if (filterType !== "all") {
      list = list.filter((f) => f.findingType === filterType);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((f) =>
        f.title?.toLowerCase().includes(term) ||
        f.summary?.toLowerCase().includes(term) ||
        f.sourceLocation?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [findings, filterType, searchTerm]);

  const stats = useMemo(() => {
    const all = findings as any[];
    return {
      total: all.length,
      unreviewed: all.filter((f) => f.reviewState === "unreviewed").length,
      approved: all.filter((f) => f.reviewState === "approved").length,
      rejected: all.filter((f) => f.reviewState === "rejected").length,
    };
  }, [findings]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchAction = (action: "confirm" | "reject") => {
    if (selectedIds.size === 0) return;
    const promises = Array.from(selectedIds).map((id) =>
      reviewMutation.mutateAsync({ findingId: id, action })
    );
    Promise.all(promises).then(() => {
      setSelectedIds(new Set());
      refetch();
      toast.success(`${selectedIds.size} findings ${action === "confirm" ? "approved" : "rejected"}`);
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-50";
    if (confidence >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "unreviewed": return "bg-amber-100 text-amber-700";
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "stale": return "bg-gray-100 text-gray-500";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "compliance": return "bg-blue-100 text-blue-700";
      case "risk": return "bg-red-100 text-red-700";
      case "missing_item": return "bg-amber-100 text-amber-700";
      case "inconsistency": return "bg-purple-100 text-purple-700";
      case "opportunity": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <PageLayout
      title="AI Findings"
      subtitle="Review AI-generated findings from contract analysis. Approve to create tasks, reject to dismiss."
      label="AI Review"
      summaryCards={[
        { label: "Total Findings", value: stats.total },
        { label: "Needs Review", value: stats.unreviewed, color: "text-amber-600" },
        { label: "Approved", value: stats.approved, color: "text-green-600" },
        { label: "Rejected", value: stats.rejected, color: "text-red-600" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowRuns(true)}>
            <Brain className="w-4 h-4 mr-1" /> AI Runs ({(aiRuns as any[]).length})
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAuditLog(true)}>
            <Clock className="w-4 h-4 mr-1" /> Audit Log
          </Button>
        </div>
      }
    >
      {/* Filters & Batch Actions */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search findings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {FINDING_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedIds.size > 0 && (
            <div className="flex gap-2 ml-auto">
              <span className="text-sm text-gray-600 self-center">{selectedIds.size} selected</span>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleBatchAction("confirm")}>
                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve All
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleBatchAction("reject")}>
                <XCircle className="w-3 h-3 mr-1" /> Reject All
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Findings Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading findings...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No AI Findings</h3>
          <p className="text-gray-600 mb-4">
            AI findings are generated when you run contract analysis from the Contract Detail page.
            Findings identify compliance issues, risks, missing items, and inconsistencies.
          </p>
        </Card>
      ) : (
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={() => {
                        if (selectedIds.size === filtered.length) {
                          setSelectedIds(new Set());
                        } else {
                          setSelectedIds(new Set(filtered.map((f: any) => f.id)));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Finding</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Source</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Confidence</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((finding: any) => (
                  <tr key={finding.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(finding.id)}
                        onChange={() => toggleSelect(finding.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{finding.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{finding.summary}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(finding.findingType)}`}>
                        {finding.findingType?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{finding.sourceLocation || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(finding.confidence || 0)}`}>
                        {finding.confidence || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStateColor(finding.reviewState)}`}>
                        {finding.reviewState}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFinding(finding)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {finding.reviewState === "unreviewed" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              title="Approve"
                              onClick={() => reviewMutation.mutate({ findingId: finding.id, action: "confirm" })}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-600"
                              title="Hold"
                              onClick={() => reviewMutation.mutate({ findingId: finding.id, action: "hold" })}
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              title="Reject"
                              onClick={() => reviewMutation.mutate({ findingId: finding.id, action: "reject" })}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {finding.reviewState === "acknowledged" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                            title="Needs Review"
                            onClick={() => reviewMutation.mutate({ findingId: finding.id, action: "needs_review" })}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Finding Detail Dialog */}
      <Dialog open={!!selectedFinding} onOpenChange={() => setSelectedFinding(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              {selectedFinding?.title}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {selectedFinding && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(selectedFinding.findingType)}`}>
                    {selectedFinding.findingType?.replace(/_/g, " ")}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStateColor(selectedFinding.reviewState)}`}>
                    {selectedFinding.reviewState}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(selectedFinding.confidence || 0)}`}>
                    Confidence: {selectedFinding.confidence}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
                  <p className="text-sm text-gray-600">{selectedFinding.summary}</p>
                </div>

                {selectedFinding.sourceLocation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Source Location</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">{selectedFinding.sourceLocation}</p>
                  </div>
                )}

                {selectedFinding.sourceExcerpt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Source Excerpt</h4>
                    <blockquote className="text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-300 px-4 py-3 rounded-r italic">
                      {selectedFinding.sourceExcerpt}
                    </blockquote>
                  </div>
                )}

                {selectedFinding.practicalMeaning && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Practical Meaning</h4>
                    <p className="text-sm text-gray-600">{selectedFinding.practicalMeaning}</p>
                  </div>
                )}

                {selectedFinding.reviewedAt && (
                  <div className="text-xs text-gray-400 border-t pt-3">
                    Reviewed on {new Date(selectedFinding.reviewedAt).toLocaleString()}
                    {selectedFinding.approvedLiveObjectType && (
                      <span className="ml-2">→ Created {selectedFinding.approvedLiveObjectType} #{selectedFinding.approvedLiveObjectId}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
              {selectedFinding?.reviewState === "unreviewed" && (
              <>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => reviewMutation.mutate({ findingId: selectedFinding.id, action: "confirm" })}
                  disabled={reviewMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve (Create Task)
                </Button>
                <Button
                  variant="outline"
                  className="text-amber-600 border-amber-200"
                  onClick={() => reviewMutation.mutate({ findingId: selectedFinding.id, action: "hold" })}
                  disabled={reviewMutation.isPending}
                >
                  <Clock className="w-4 h-4 mr-1" /> Hold
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200"
                  onClick={() => reviewMutation.mutate({ findingId: selectedFinding.id, action: "reject" })}
                  disabled={reviewMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedFinding(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Runs Dialog */}
      <Dialog open={showRuns} onOpenChange={setShowRuns}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Analysis Runs</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {(aiRuns as any[]).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No AI runs yet. Run contract analysis from a Contract Detail page.</p>
              ) : (
                (aiRuns as any[]).map((run: any) => (
                  <div key={run.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{run.purpose || run.aiType}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{run.relatedRecordType} #{run.relatedRecordId} · {run.modelUsed}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${run.status === 'completed' ? 'bg-green-100 text-green-700' : run.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {run.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{run.findingCount} findings</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{new Date(run.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuns(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Findings Audit Trail</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {(auditEntries as any[]).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No audit entries yet.</p>
              ) : (
                (auditEntries as any[]).map((entry: any) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{entry.action}</span> on {entry.entity} #{entry.entityId}
                      </p>
                      {entry.changes && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {typeof entry.changes === "string" ? entry.changes : JSON.stringify(entry.changes)}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entry.timestamp).toLocaleString()} · User #{entry.userId}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditLog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          <PageGuidancePanel
        pageKey="ai-findings"
        title="AI Findings Help"
        description="Source-linked analysis results from AI Confirmation. Each finding references a specific location in your governing contract file. Review and approve before creating live objects."
        whatToDoNext={["Review findings with source references", "Approve correct findings to create live objects", "Reject inaccurate findings", "Re-run analysis when governing file changes"]}
        helpArticleSlug="what-is-ai-confirmation"
        glossaryTerms={["ai-finding", "contract-hub"]}
      />
    </PageLayout>
  );
}
