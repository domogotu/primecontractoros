import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, TrendingDown, FileSearch, Sparkles, BookOpen, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { toast } from "sonner";

function AIAnalysisPanel({ review }: { review: any }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const aiMutation = trpc.aiWorkflow.runs.proposalReview.useMutation({
    onSuccess: (data: any) => {
      setAnalysis(data.summary || "Analysis complete. Check AI findings for details.");
      setLoading(false);
      toast.success("AI analysis generated");
    },
    onError: (e: any) => {
      toast.error(e.message || "AI analysis failed");
      setLoading(false);
    },
  });

  const handleAnalyze = () => {
    setLoading(true);
    aiMutation.mutate({
      workspaceId: review.workspaceId || 1,
      proposalId: review.proposalId,
      proposalData: `Loss Review Debrief. Reason Lost: ${review.reasonLost || "Not specified"}. Competitor Info: ${review.competitorInfo || "Not specified"}. Lessons Learned: ${review.lessonsLearned || "Not specified"}. Action Items: ${review.actionItems || "Not specified"}.`,
    });
  };

  return (
    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI Analysis
        </span>
        {!analysis && (
          <Button size="sm" variant="outline" onClick={handleAnalyze} disabled={loading || aiMutation.isPending} className="text-xs h-7">
            {loading || aiMutation.isPending ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing...</> : "Analyze Debrief"}
          </Button>
        )}
      </div>
      {analysis && (
        <div className="text-sm text-purple-900 whitespace-pre-wrap">{analysis}</div>
      )}
    </div>
  );
}

function SaveLessonPanel({ review }: { review: any }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(`Lesson from Proposal #${review.proposalId} Loss`);
  const [description, setDescription] = useState(review.lessonsLearned || "");
  const createLesson = trpc.lessons.create.useMutation({
    onSuccess: () => { toast.success("Lesson saved"); setShowForm(false); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!showForm) {
    return (
      <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="text-xs mt-2">
        <BookOpen className="w-3 h-3 mr-1" /> Save as Lesson
      </Button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Lesson title"
        className="w-full px-3 py-2 border border-blue-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Lesson description"
        rows={3} className="w-full px-3 py-2 border border-blue-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => createLesson.mutate({ title, description, proposalId: review.proposalId })}
          disabled={createLesson.isPending || !title.trim()}>
          {createLesson.isPending ? "Saving..." : "Save Lesson"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
      </div>
    </div>
  );
}

export default function LossReview() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    proposalId: "", reviewDate: "", reasonLost: "", competitorInfo: "", lessonsLearned: "", actionItems: "",
  });

  const { data: reviews = [], isLoading, refetch } = trpc.lossReviews.list.useQuery();
  const createMutation = trpc.lossReviews.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ proposalId: "", reviewDate: "", reasonLost: "", competitorInfo: "", lessonsLearned: "", actionItems: "" }); toast.success("Loss review created"); },
  });
  const updateMutation = trpc.lossReviews.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Review updated"); },
  });

  const filtered = (reviews as any[]).filter((r) =>
    r.reasonLost?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.competitorInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.lessonsLearned?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.proposalId) return;
    createMutation.mutate({
      proposalId: parseInt(form.proposalId),
      reviewDate: form.reviewDate || undefined,
      reasonLost: form.reasonLost || undefined,
      competitorInfo: form.competitorInfo || undefined,
      lessonsLearned: form.lessonsLearned || undefined,
      actionItems: form.actionItems || undefined,
    });
  };

  return (
    <PageLayout
      title="Loss Reviews"
      subtitle="Analyze lost proposals to identify patterns, improve win rates, and refine competitive positioning"
      label="Win/Loss Analysis"
      summaryCards={[
        { label: "Total Reviews", value: reviews.length },
        { label: "This Year", value: (reviews as any[]).filter((r) => {
          const d = new Date(r.reviewDate || r.createdAt);
          return d.getFullYear() === new Date().getFullYear();
        }).length },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Loss Review
        </Button>
      }
    >
      <PageGuide
        title="Loss Reviews"
        description="Capture and analyze why proposals were not selected to improve future performance."
        whenToUse="After receiving a loss notification to document what happened and extract lessons."
        whatToDoNext={["Document the loss reason and debrief notes", "Run AI analysis to identify patterns", "Save lessons learned", "Update templates based on findings"]}
        relatedRecords={[{ label: "Proposals", path: "/app/proposals" }, { label: "Lessons Learned", path: "/app/lessons-learned" }, { label: "Templates", path: "/app/templates" }]}
      />

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Loss Review</DialogTitle></DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Proposal ID * (lost proposal)" type="number" value={form.proposalId} onChange={(e) => setForm({ ...form, proposalId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Review Date</label>
                <input type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <textarea placeholder="Reason Lost (price, technical approach, past performance, incumbency, etc.)" value={form.reasonLost} onChange={(e) => setForm({ ...form, reasonLost: e.target.value })} rows={3} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Competitor Information (who won, their strengths)" value={form.competitorInfo} onChange={(e) => setForm({ ...form, competitorInfo: e.target.value })} rows={2} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Lessons Learned (what to do differently)" value={form.lessonsLearned} onChange={(e) => setForm({ ...form, lessonsLearned: e.target.value })} rows={2} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Action Items (specific improvements for next pursuit)" value={form.actionItems} onChange={(e) => setForm({ ...form, actionItems: e.target.value })} rows={2} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Saving..." : "Save Loss Review"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search loss reviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading loss reviews...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <FileSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Loss Reviews</h3>
          <p className="text-gray-600 mb-6">When a proposal is not selected, conduct a loss review to analyze why, identify the winning competitor, and capture lessons to improve your win rate on future solicitations.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create First Loss Review
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((review: any) => {
            const isExpanded = expandedId === review.id;
            return (
              <Card key={review.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : review.id)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900">Proposal #{review.proposalId} - Loss Review</h3>
                        {review.status && <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">{review.status}</span>}
                      </div>
                      {review.reasonLost && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                          <strong>Reason Lost:</strong> {review.reasonLost}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {review.reviewDate && <span className="text-xs text-gray-400">{new Date(review.reviewDate).toLocaleDateString()}</span>}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {review.competitorInfo && <p className="text-sm text-gray-600"><strong>Competitor:</strong> {review.competitorInfo}</p>}
                    {review.lessonsLearned && <p className="text-sm text-gray-600"><strong>Lessons:</strong> {review.lessonsLearned}</p>}
                    {review.actionItems && (
                      <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Action Items:</strong> {review.actionItems}
                      </div>
                    )}

                    {/* AI Analysis */}
                    <AIAnalysisPanel review={review} />

                    {/* Save as Lesson */}
                    <SaveLessonPanel review={review} />

                    {/* Status update */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      <select
                        value={review.status || "open"}
                        onChange={e => updateMutation.mutate({ id: review.id, status: e.target.value })}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
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
