import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Plus, Loader2, Search, Tag, Trash2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function LessonsLearned() {
  
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [form, setForm] = useState({
    contractId: "",
    title: "",
    description: "",
    recommendation: "",
    category: "general",
  });

  const { data: lessons = [], isLoading, refetch } = trpc.lessonsLearnedV2.list.useQuery();
  const createMutation = trpc.lessonsLearnedV2.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ contractId: "", title: "", description: "", recommendation: "", category: "general" });
      toast.success("Lesson Saved: Post-contract review has been recorded.");
    },
  });
  const deleteMutation = trpc.lessonsLearnedV2.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Lesson Deleted"); },
  });

  const filteredLessons = lessons.filter((l: any) => {
    const matchesSearch = !searchTerm || l.title?.toLowerCase().includes(searchTerm.toLowerCase()) || l.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || l.tags?.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Tags are not used in this version - simplified to empty array
  const allTags: string[] = [];

  if (isLoading) {
    return (
      <PageLayout title="Lessons Learned" subtitle="Structured post-contract reviews" label="Knowledge">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Lessons Learned"
      subtitle="Structured post-contract reviews and knowledge capture"
      label="Knowledge"
      summaryCards={[
        { label: "Total Reviews", value: lessons.length },
        { label: "Categories", value: allTags.length },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Review
        </Button>
      }
    >
      {/* Search and filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lessons..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}
      </div>

      {/* Create form */}
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Post-Contract Review</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="e.g., USAF IT Modernization Contract Review"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract ID (optional)</label>
              <input
                type="number"
                value={form.contractId}
                onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Link to contract"
              />
            </div>
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What Went Well</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="Describe successes, effective practices, and positive outcomes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What Didn't Go Well</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="Describe challenges, issues, and areas for improvement..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
              <textarea
                value={form.recommendation}
                onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="What would you do differently? What should be repeated?"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="management">Management</option>
                <option value="compliance">Compliance</option>
                <option value="financial">Financial</option>
                <option value="staffing">Staffing</option>
              </select>
            </div>
          </div>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={() => createMutation.mutate({
                title: form.title,
                contractId: form.contractId ? parseInt(form.contractId) : undefined,
                description: form.description,
                recommendation: form.recommendation,
                category: form.category,
              })}
              disabled={!form.title || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Review
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lessons list */}
      {filteredLessons.length === 0 ? (
        <Card className="p-8 text-center border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Recorded</h3>
          <p className="text-gray-600">Start capturing post-contract reviews to build organizational knowledge.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson: any) => (
            <Card key={lesson.id} className="p-5 border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lesson.category && <span className="capitalize">{lesson.category}</span>}
                    {lesson.contractId && <span> · Contract #{lesson.contractId}</span>}
                    {lesson.createdAt && <span> · {new Date(lesson.createdAt).toLocaleDateString()}</span>}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate({ id: lesson.id })}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {lesson.description && (
                  <div className="p-3 bg-green-50 rounded">
                    <p className="font-medium text-green-800 mb-1">What Went Well</p>
                    <p className="text-green-700 line-clamp-3">{lesson.description}</p>
                  </div>
                )}
                {lesson.description && (
                  <div className="p-3 bg-red-50 rounded">
                    <p className="font-medium text-red-800 mb-1">What Didn't Go Well</p>
                    <p className="text-red-700 line-clamp-3">{lesson.description}</p>
                  </div>
                )}
                {lesson.recommendations && (
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="font-medium text-blue-800 mb-1">Recommendations</p>
                    <p className="text-blue-700 line-clamp-3">{lesson.recommendations}</p>
                  </div>
                )}
              </div>
              {lesson.tags && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {lesson.tags.split(",").map((tag: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      <Tag className="w-3 h-3" />{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
