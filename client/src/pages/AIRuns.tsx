import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Activity, Clock, CheckCircle2, XCircle, Loader2, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from "@/components/PageLayout";

const STATUS_ICONS: Record<string, any> = {
  completed: CheckCircle2,
  failed: XCircle,
  running: Loader2,
  pending: Clock,
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-600",
  failed: "text-red-600",
  running: "text-blue-600",
  pending: "text-amber-600",
};

const RUN_TYPES = [
  { value: "all", label: "All Types" },
  { value: "contract_scan", label: "Contract Scan" },
  { value: "file_analysis", label: "File Analysis" },
  { value: "opportunity_review", label: "Opportunity Review" },
  { value: "proposal_review", label: "Proposal Review" },
  { value: "invoice_review", label: "Invoice Review" },
  { value: "workspace_summary", label: "Workspace Summary" },
  { value: "guidance", label: "Guidance" },
];

export default function AIRuns() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: runs = [], isLoading } = trpc.aiWorkflow.runs.list.useQuery(
    filterType !== "all" || filterStatus !== "all"
      ? { runType: filterType !== "all" ? filterType : undefined, status: filterStatus !== "all" ? filterStatus : undefined }
      : undefined
  );

  const { data: usage } = trpc.aiWorkflow.usage.summary.useQuery();

  return (
    <PageLayout
      title="AI Run History"
      subtitle="Track all AI scans, analyses, and generation runs"
    >
      {/* Usage Summary */}
      {usage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{usage.totalRuns || 0}</p>
            <p className="text-xs text-slate-500">Total Runs</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{usage.totalFindings || 0}</p>
            <p className="text-xs text-slate-500">Findings Generated</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{usage.totalSuggestions || 0}</p>
            <p className="text-xs text-slate-500">Suggestions</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">{usage.totalTokens ? Math.round(usage.totalTokens / 1000) + "k" : "0"}</p>
            <p className="text-xs text-slate-500">Tokens Used</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Run Type" />
          </SelectTrigger>
          <SelectContent>
            {RUN_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Runs List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading runs...</div>
      ) : runs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Brain className="mx-auto h-12 w-12 mb-4 text-slate-300" />
          <p>No AI runs yet. Use the workflow buttons on contracts, files, or proposals to start an AI scan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run: any) => {
            const StatusIcon = STATUS_ICONS[run.status] || Clock;
            const statusColor = STATUS_COLORS[run.status] || "text-slate-500";
            return (
              <Card key={run.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon className={`h-5 w-5 flex-shrink-0 ${statusColor} ${run.status === "running" ? "animate-spin" : ""}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{run.purpose || run.aiType || "AI Run"}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">{(run.runType || run.aiType || "").replace(/_/g, " ")}</span>
                        <span>•</span>
                        <span>{run.relatedRecordType}</span>
                        {run.tokensUsed && <><span>•</span><span>{run.tokensUsed} tokens</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-medium capitalize ${statusColor}`}>{run.status}</p>
                    <p className="text-xs text-slate-400">
                      {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
                {run.errorMessage && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {run.errorMessage}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
