import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Plus, Loader2, Search, Tag, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "technical", label: "Technical", color: "bg-purple-100 text-purple-800" },
  { value: "management", label: "Management", color: "bg-blue-100 text-blue-800" },
  { value: "cost", label: "Cost", color: "bg-green-100 text-green-800" },
  { value: "schedule", label: "Schedule", color: "bg-orange-100 text-orange-800" },
  { value: "compliance", label: "Compliance", color: "bg-red-100 text-red-800" },
  { value: "general", label: "General", color: "bg-gray-100 text-gray-800" },
];

const SEVERITIES = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
];

const IMPACTS = [
  { value: "positive", label: "Positive", icon: TrendingUp, color: "text-green-600" },
  { value: "negative", label: "Negative", icon: TrendingDown, color: "text-red-600" },
  { value: "neutral", label: "Neutral", icon: Minus, color: "text-gray-600" },
];

export default function LessonsLearned() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterImpact, setFilterImpact] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [form, setForm] = useState({
    contractId: "",
    proposalId: "",
    title: "",
    description: "",
    rootCause: "",
    recommendation: "",
    category: "general",
    impact: "neutral" as "positive" | "negative" | "neutral",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    tags: "",
  });

  const { data: lessons = [], isLoading, refetch } = trpc.lessonsLearnedV2.list.useQuery();
  const createMutation = trpc.lessonsLearnedV2.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ contractId: "", proposalId: "", title: "", description: "", rootCause: "", recommendation: "", category: "general", impact: "neutral", severity: "medium", tags: "" });
      toast.success("Lesson recorded successfully.");
    },
  });
  const deleteMutation = trpc.lessonsLearnedV2.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Lesson deleted"); },
  });

  // Extract all unique tags from lessons
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    lessons.forEach((l: any) => {
      if (l.tags) {
        l.tags.split(",").forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l: any) => {
      const matchesSearch = !searchTerm ||
        l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.rootCause?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.recommendation?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || l.category === filterCategory;
      const matchesSeverity = !filterSeverity || l.severity === filterSeverity;
      const matchesImpact = !filterImpact || l.impact === filterImpact;
      const matchesTag = !filterTag || (l.tags && l.tags.split(",").map((t: string) => t.trim()).includes(filterTag));
      return matchesSearch && matchesCategory && matchesSeverity && matchesImpact && matchesTag;
    });
  }, [lessons, searchTerm, filterCategory, filterSeverity, filterImpact, filterTag]);

  // Summary stats
  const stats = useMemo(() => {
    const positive = lessons.filter((l: any) => l.impact === "positive").length;
    const negative = lessons.filter((l: any) => l.impact === "negative").length;
    const critical = lessons.filter((l: any) => l.severity === "critical" || l.severity === "high").length;
    return { total: lessons.length, positive, negative, critical, categories: new Set(lessons.map((l: any) => l.category).filter(Boolean)).size };
  }, [lessons]);

  const getCategoryStyle = (cat: string) => CATEGORIES.find(c => c.value === cat)?.color || "bg-gray-100 text-gray-800";
  const getSeverityStyle = (sev: string) => SEVERITIES.find(s => s.value === sev)?.color || "bg-gray-100 text-gray-800";

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
        { label: "Total Reviews", value: stats.total },
        { label: "Positive", value: stats.positive },
        { label: "Negative", value: stats.negative },
        { label: "High/Critical", value: stats.critical },
        { label: "Categories", value: stats.categories },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Review
        </Button>
      }
    >
      {/* Search and filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lessons..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Severity</option>
          {SEVERITIES.map((sev) => (
            <option key={sev.value} value={sev.value}>{sev.label}</option>
          ))}
        </select>
        <select
          value={filterImpact}
          onChange={(e) => setFilterImpact(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Impact</option>
          {IMPACTS.map((imp) => (
            <option key={imp.value} value={imp.value}>{imp.label}</option>
          ))}
        </select>
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

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Structured Review</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., USAF IT Modernization - Staffing Challenges"
                />
              </div>

              {/* Category, Impact, Severity row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                  <select
                    value={form.impact}
                    onChange={(e) => setForm({ ...form, impact: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {IMPACTS.map((imp) => (
                      <option key={imp.value} value={imp.value}>{imp.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {SEVERITIES.map((sev) => (
                      <option key={sev.value} value={sev.value}>{sev.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linked contract/proposal */}
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposal ID (optional)</label>
                  <input
                    type="number"
                    value={form.proposalId}
                    onChange={(e) => setForm({ ...form, proposalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Link to proposal"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / What Happened</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                  placeholder="Describe the situation, outcome, and context..."
                />
              </div>

              {/* Root Cause */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause Analysis</label>
                <textarea
                  value={form.rootCause}
                  onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={2}
                  placeholder="What was the underlying cause? (e.g., inadequate staffing plan, unclear requirements)"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea
                  value={form.recommendation}
                  onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={2}
                  placeholder="What should be done differently? What should be repeated?"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., staffing, DoD, IT modernization, agile"
                />
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {allTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = form.tags ? form.tags.split(",").map(t => t.trim()) : [];
                          if (!current.includes(tag)) {
                            setForm({ ...form, tags: [...current, tag].join(", ") });
                          }
                        }}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({
                title: form.title,
                contractId: form.contractId ? parseInt(form.contractId) : undefined,
                proposalId: form.proposalId ? parseInt(form.proposalId) : undefined,
                description: form.description || undefined,
                rootCause: form.rootCause || undefined,
                recommendation: form.recommendation || undefined,
                category: form.category,
                impact: form.impact,
                severity: form.severity,
                tags: form.tags || undefined,
              })}
              disabled={!form.title || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lessons list */}
      {filteredLessons.length === 0 ? (
        <Card className="p-8 text-center border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Found</h3>
          <p className="text-gray-600">
            {lessons.length === 0
              ? "Start capturing post-contract reviews to build organizational knowledge."
              : "No lessons match your current filters. Try adjusting your search criteria."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson: any) => {
            const ImpactIcon = IMPACTS.find(i => i.value === lesson.impact)?.icon || Minus;
            const impactColor = IMPACTS.find(i => i.value === lesson.impact)?.color || "text-gray-600";
            return (
              <Card key={lesson.id} className="p-5 border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                      <ImpactIcon className={`w-4 h-4 ${impactColor}`} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {lesson.category && (
                        <span className={`px-2 py-0.5 rounded-full font-medium ${getCategoryStyle(lesson.category)}`}>
                          {lesson.category}
                        </span>
                      )}
                      {lesson.severity && (
                        <span className={`px-2 py-0.5 rounded-full font-medium ${getSeverityStyle(lesson.severity)}`}>
                          {lesson.severity}
                        </span>
                      )}
                      {lesson.contractId && <span className="text-gray-500">Contract #{lesson.contractId}</span>}
                      {lesson.proposalId && <span className="text-gray-500">Proposal #{lesson.proposalId}</span>}
                      {lesson.createdAt && <span className="text-gray-400">{new Date(lesson.createdAt).toLocaleDateString()}</span>}
                    </div>
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

                {/* Content sections */}
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  {lesson.description && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <p className="font-medium text-slate-700 mb-1 text-xs uppercase tracking-wide">Description</p>
                      <p className="text-slate-600 line-clamp-3">{lesson.description}</p>
                    </div>
                  )}
                  {lesson.rootCause && (
                    <div className="p-3 bg-amber-50 rounded border border-amber-100">
                      <p className="font-medium text-amber-700 mb-1 text-xs uppercase tracking-wide">Root Cause</p>
                      <p className="text-amber-600 line-clamp-3">{lesson.rootCause}</p>
                    </div>
                  )}
                  {lesson.recommendation && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-100">
                      <p className="font-medium text-blue-700 mb-1 text-xs uppercase tracking-wide">Recommendation</p>
                      <p className="text-blue-600 line-clamp-3">{lesson.recommendation}</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
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
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
