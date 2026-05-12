import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-red-300 bg-red-50",
  medium: "border-amber-300 bg-amber-50",
  low: "border-blue-300 bg-blue-50",
};

const STATUS_FILTERS = [
  { value: "all", label: "All Suggestions" },
  { value: "new", label: "New" },
  { value: "accepted", label: "Accepted" },
  { value: "dismissed", label: "Dismissed" },
];

export default function AISuggestions() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const { data: suggestions = [], isLoading, refetch } = trpc.aiWorkflow.suggestions.list.useQuery(
    filterStatus !== "all" ? { status: filterStatus as any } : undefined
  );

  const acceptMutation = trpc.aiWorkflow.suggestions.accept.useMutation({
    onSuccess: () => { toast.success("Suggestion accepted"); refetch(); },
    onError: () => toast.error("Failed to accept suggestion"),
  });

  const dismissMutation = trpc.aiWorkflow.suggestions.dismiss.useMutation({
    onSuccess: () => { toast.success("Suggestion dismissed"); refetch(); },
    onError: () => toast.error("Failed to dismiss suggestion"),
  });

  const filtered = suggestions.filter((s: any) => {
    if (filterPriority !== "all" && s.priority !== filterPriority) return false;
    return true;
  });

  return (
    <PageLayout
      title="AI Suggestions"
      subtitle="Guidance, next steps, and recommendations from AI analysis"
    >
      {/* Disclaimer */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Note:</strong> AI can help identify likely issues, obligations, and missing information, but it does not replace legal advice, contracting officer direction, or human review.
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading suggestions...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Lightbulb className="mx-auto h-12 w-12 mb-4 text-slate-300" />
          <p>No suggestions yet. Run an AI scan to generate recommendations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((suggestion: any) => (
            <Card key={suggestion.id} className={`p-4 border-l-4 ${PRIORITY_COLORS[suggestion.priority] || "border-slate-300 bg-white"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{suggestion.suggestionTitle}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{suggestion.priority}</span>
                    {suggestion.status === "accepted" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {suggestion.status === "dismissed" && <XCircle className="h-4 w-4 text-red-400" />}
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{suggestion.suggestionText}</p>
                  {suggestion.suggestedAction && (
                    <div className="flex items-center gap-1 text-xs text-indigo-600">
                      <ChevronRight className="h-3 w-3" />
                      <span>Suggested action: {suggestion.suggestedAction}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{suggestion.relatedRecordType}</span>
                    {suggestion.createdAt && <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                {suggestion.status === "new" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => acceptMutation.mutate({ id: suggestion.id })}
                      disabled={acceptMutation.isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => dismissMutation.mutate({ id: suggestion.id })}
                      disabled={dismissMutation.isPending}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
