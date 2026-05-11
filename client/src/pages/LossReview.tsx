import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, TrendingDown, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function LossReview() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    proposalId: "", reviewDate: "", reasonLost: "", competitorInfo: "", lessonsLearned: "", actionItems: "",
  });

  const { data: reviews = [], isLoading, refetch } = trpc.lossReviews.list.useQuery();
  const createMutation = trpc.lossReviews.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ proposalId: "", reviewDate: "", reasonLost: "", competitorInfo: "", lessonsLearned: "", actionItems: "" }); },
  });

  const filtered = (reviews as any[]).filter((r) =>
    r.reasonLost?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.competitorInfo?.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Loss Review</DialogTitle>
          </DialogHeader>
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
        <div className="text-center py-12 text-gray-500">Loading loss reviews...</div>
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
          {filtered.map((review: any) => (
            <Card key={review.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
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
                  {review.competitorInfo && <p className="text-sm text-gray-600 mt-2"><strong>Competitor:</strong> {review.competitorInfo}</p>}
                  {review.lessonsLearned && <p className="text-sm text-gray-600 mt-1"><strong>Lessons:</strong> {review.lessonsLearned}</p>}
                  {review.actionItems && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                      <strong>Action Items:</strong> {review.actionItems}
                    </div>
                  )}
                  {review.reviewDate && <span className="text-xs text-gray-400 mt-2 block">Reviewed: {new Date(review.reviewDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
