import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useWorkspace } from "@/hooks/useWorkspace";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, CheckCircle2, AlertTriangle, XCircle, FileText, Search, ChevronDown, ChevronRight, Loader2, Plus, Inbox } from "lucide-react";

export default function FlowdownReview() {
  const { workspaceId } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: reviews, isLoading } = trpc.flowdownReviews.list.useQuery(undefined, { retry: false });
  const updateMutation = trpc.flowdownReviews.update.useMutation({
    onSuccess: () => {
      toast.success("Review status updated");
    },
  });

  const statusConfig: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    included: { color: "bg-green-100 text-green-800", label: "Included", icon: CheckCircle2 },
    missing: { color: "bg-red-100 text-red-800", label: "Missing", icon: XCircle },
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending Review", icon: AlertTriangle },
    approved: { color: "bg-green-100 text-green-800", label: "Approved", icon: CheckCircle2 },
    flagged: { color: "bg-red-100 text-red-800", label: "Flagged", icon: XCircle },
    not_applicable: { color: "bg-gray-100 text-gray-600", label: "N/A", icon: FileText },
  };

  const items = (reviews || []) as any[];

  const filtered = items.filter((c: any) => {
    const matchesSearch = !searchTerm || (c.clauseReference || "").toLowerCase().includes(searchTerm.toLowerCase()) || (c.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.reviewStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: items.length,
    approved: items.filter((c: any) => c.reviewStatus === "approved" || c.reviewStatus === "included").length,
    pending: items.filter((c: any) => c.reviewStatus === "pending").length,
    flagged: items.filter((c: any) => c.reviewStatus === "flagged" || c.reviewStatus === "missing").length,
  };

  return (
    <PageLayout label="Compliance" title="Flowdown Review" subtitle="Review and manage FAR/DFARS clause flowdown requirements for subcontracts and teaming agreements.">
      <PageGuide
        title="Flowdown Review"
        description="Ensure required FAR/DFARS clauses are properly flowed down to subcontractors. Missing flowdown clauses create compliance risk."
        whenToUse="When issuing subcontracts, during compliance reviews, or when prime contract modifications add new clauses."
        whatToDoNext={["Review missing clauses and add them to subcontracts", "Mark review-needed items after legal review", "Run AI analysis for automated clause detection"]}
        relatedRecords={[{ label: "FAR/DFARS Reference", path: "/app/far-reference" }, { label: "Compliance", path: "/app/compliance" }, { label: "Subcontractors", path: "/app/subcontractors" }]}
      />

      <div className="flex items-start justify-between mb-6">
        <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => toast.info("AI flowdown analysis requires OpenAI API configuration. Check Platform Admin \u203a Integrations to set up.")}>
          <Shield className="w-4 h-4 mr-2" /> Run AI Analysis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Total Clauses</p></CardContent></Card>
        <Card className="border-l-4 border-l-green-400"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{stats.approved}</p><p className="text-xs text-gray-500">Approved</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-400"><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p><p className="text-xs text-gray-500">Pending</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-400"><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{stats.flagged}</p><p className="text-xs text-gray-500">Flagged</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search clauses..." className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="flagged">Flagged</option>
          <option value="included">Included</option>
          <option value="missing">Missing</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-500">Loading flowdown reviews...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Flowdown Reviews Yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Flowdown reviews track which FAR/DFARS clauses must be passed to subcontractors. Run AI Analysis on a contract to identify required flowdown clauses, or add them manually.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Clauses List */}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          {filtered.map((clause: any) => {
            const status = clause.reviewStatus || "pending";
            const cfg = statusConfig[status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === clause.id;

            return (
              <div key={clause.id} className="border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-blue-700">{clause.clauseReference || `Review #${clause.id}`}</span>
                      <span className="text-sm text-gray-900 truncate">{clause.notes ? clause.notes.substring(0, 80) : "No description"}</span>
                    </div>
                  </div>
                  <Badge className={cfg.color}><StatusIcon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pl-11 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div><span className="text-gray-500">Clause:</span> <span className="font-medium">{clause.clauseReference || "N/A"}</span></div>
                      <div><span className="text-gray-500">Flowdown Required:</span> <span className="font-medium">{clause.flowdownRequired ? "Yes" : "No"}</span></div>
                      <div><span className="text-gray-500">Status:</span> <span className="font-medium capitalize">{status}</span></div>
                    </div>
                    {clause.clauseText && (
                      <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                        {clause.clauseText}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {status === "pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateMutation.mutate({ id: clause.id, reviewStatus: "approved" })}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateMutation.mutate({ id: clause.id, reviewStatus: "flagged" })}>
                            <AlertTriangle className="w-3 h-3 mr-1" /> Flag Issue
                          </Button>
                        </>
                      )}
                      {status === "missing" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateMutation.mutate({ id: clause.id, reviewStatus: "included" })}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Included
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">AI analysis identifies clauses but does not make legal determinations. Always verify with legal counsel.</p>
    </PageLayout>
  );
}
