import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import LifecycleProgress from "@/components/LifecycleProgress";
import AIStatusPanel, { AICheck } from "@/components/AIStatusPanel";
import WhatsNext, { NextAction } from "@/components/WhatsNext";
import {
  Plus, Search, Lightbulb, ThumbsUp, ThumbsDown, BookOpen, ArrowLeft,
  FileText, CheckCircle2, ListTodo, Link2, Eye, Archive, Pencil, Trash2,
  TrendingUp, TrendingDown, Minus, Filter
} from "lucide-react";

// Lesson type definitions
const LESSON_TYPES = [
  { value: "contract_closeout", label: "Contract Closeout" },
  { value: "proposal_win", label: "Proposal Win" },
  { value: "proposal_loss", label: "Proposal Loss" },
  { value: "subcontractor_teaming", label: "Subcontractor/Teaming" },
  { value: "invoice_payment", label: "Invoice/Payment" },
  { value: "compliance_requirement", label: "Compliance/Requirement" },
  { value: "file_documentation", label: "File/Documentation" },
  { value: "communication_followup", label: "Communication/Follow-Up" },
  { value: "internal_process", label: "Internal Process" },
  { value: "other", label: "Other" },
];

const IMPACT_LEVELS = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-700" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
];

const IMPACT_TYPES = [
  { value: "positive", label: "Positive (Success)", icon: ThumbsUp, color: "text-green-600" },
  { value: "negative", label: "Negative (Challenge)", icon: ThumbsDown, color: "text-red-600" },
  { value: "neutral", label: "Neutral (Observation)", icon: Minus, color: "text-slate-500" },
];

const LINKABLE_RECORD_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "proposal", label: "Proposal" },
  { value: "opportunity", label: "Opportunity" },
];

export default function LessonsLearned() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [impactLevelFilter, setImpactLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [targetLessonId, setTargetLessonId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    lessonType: "other",
    category: "",
    description: "",
    impact: "neutral" as "positive" | "negative" | "neutral",
    impactLevel: "medium" as "low" | "medium" | "high" | "critical",
    rootCause: "",
    recommendation: "",
    whatHappened: "",
    whatWorked: "",
    whatDidNotWork: "",
    actionTaken: "",
    preventionSteps: "",
    linkedRecordType: "" as "" | "contract" | "proposal" | "opportunity",
    linkedRecordId: undefined as number | undefined,
    linkedRecordTitle: "",
    visibility: "workspace" as "workspace" | "team" | "private",
    tags: "",
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    taskTitle: "",
    taskDescription: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
  });

  // Template form state
  const [templateId, setTemplateId] = useState<number | undefined>();

  // Queries
  const lessonsQuery = trpc.lessonsLearnedV2.list.useQuery({
    search: search || undefined,
    lessonType: typeFilter !== "all" ? typeFilter : undefined,
    impact: impactFilter !== "all" ? impactFilter : undefined,
    impactLevel: impactLevelFilter !== "all" ? impactLevelFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const statsQuery = trpc.lessonsLearnedV2.stats.useQuery();
  const templatesQuery = trpc.intTemplates.list.useQuery();

  // Linkable records query
  const [linkRecordType, setLinkRecordType] = useState("");
  const linkableRecordsQuery = trpc.lessonsLearnedV2.linkableRecords.useQuery(
    { recordType: linkRecordType },
    { enabled: !!linkRecordType }
  );

  // Mutations
  const createMutation = trpc.lessonsLearnedV2.create.useMutation({
    onSuccess: () => {
      toast({ title: "Lesson created successfully." });
      lessonsQuery.refetch();
      statsQuery.refetch();
      resetForm();
      setShowForm(false);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = trpc.lessonsLearnedV2.update.useMutation({
    onSuccess: () => {
      toast({ title: "Lesson updated successfully." });
      lessonsQuery.refetch();
      statsQuery.refetch();
      setEditingLesson(null);
      setShowForm(false);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = trpc.lessonsLearnedV2.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Lesson deleted." });
      lessonsQuery.refetch();
      statsQuery.refetch();
      setShowDetail(false);
      setSelectedLesson(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const applyTemplateMutation = trpc.lessonsLearnedV2.applyToTemplate.useMutation({
    onSuccess: () => {
      toast({ title: "Lesson applied to template successfully." });
      lessonsQuery.refetch();
      setShowApplyTemplate(false);
      setTargetLessonId(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const createTaskMutation = trpc.lessonsLearnedV2.createTask.useMutation({
    onSuccess: () => {
      toast({ title: "Task created from lesson successfully." });
      lessonsQuery.refetch();
      setShowCreateTask(false);
      setTargetLessonId(null);
      setTaskForm({ taskTitle: "", taskDescription: "", priority: "medium" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const lessons = lessonsQuery.data || [];
  const stats = statsQuery.data || { total: 0, positive: 0, negative: 0, neutral: 0, applied: 0 };

  function resetForm() {
    setFormData({
      title: "", lessonType: "other", category: "", description: "",
      impact: "neutral", impactLevel: "medium", rootCause: "", recommendation: "",
      whatHappened: "", whatWorked: "", whatDidNotWork: "", actionTaken: "",
      preventionSteps: "", linkedRecordType: "", linkedRecordId: undefined,
      linkedRecordTitle: "", visibility: "workspace", tags: "",
    });
    setLinkRecordType("");
  }

  function handleSubmit() {
    if (!formData.title.trim()) {
      toast({ title: "Title is required.", variant: "destructive" });
      return;
    }
    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id, ...formData, linkedRecordType: formData.linkedRecordType || undefined, linkedRecordId: formData.linkedRecordId || undefined });
    } else {
      createMutation.mutate({ ...formData, linkedRecordType: formData.linkedRecordType || undefined, linkedRecordId: formData.linkedRecordId || undefined });
    }
  }

  function openEdit(lesson: any) {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title || "",
      lessonType: lesson.lessonType || "other",
      category: lesson.category || "",
      description: lesson.description || "",
      impact: lesson.impact || "neutral",
      impactLevel: lesson.impactLevel || "medium",
      rootCause: lesson.rootCause || "",
      recommendation: lesson.recommendation || "",
      whatHappened: lesson.whatHappened || "",
      whatWorked: lesson.whatWorked || "",
      whatDidNotWork: lesson.whatDidNotWork || "",
      actionTaken: lesson.actionTaken || "",
      preventionSteps: lesson.preventionSteps || "",
      linkedRecordType: lesson.linkedRecordType || "",
      linkedRecordId: lesson.linkedRecordId || undefined,
      linkedRecordTitle: lesson.linkedRecordTitle || "",
      visibility: lesson.visibility || "workspace",
      tags: lesson.tags || "",
    });
    if (lesson.linkedRecordType) setLinkRecordType(lesson.linkedRecordType);
    setShowForm(true);
  }

  function getImpactBadge(impact: string) {
    switch (impact) {
      case "positive": return <Badge className="bg-green-100 text-green-700 border-green-200">Positive</Badge>;
      case "negative": return <Badge className="bg-red-100 text-red-700 border-red-200">Negative</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Neutral</Badge>;
    }
  }

  function getImpactLevelBadge(level: string) {
    const found = IMPACT_LEVELS.find(l => l.value === level);
    return <Badge className={found?.color || "bg-slate-100 text-slate-600"}>{found?.label || level}</Badge>;
  }

  function getLessonTypeLabel(type: string) {
    return LESSON_TYPES.find(t => t.value === type)?.label || type;
  }

  // Detail View
  if (showDetail && selectedLesson) {
    return (
      <div className="p-6 max-w-5xl mx-auto pb-32">
        <Button variant="ghost" className="mb-4" onClick={() => { setShowDetail(false); setSelectedLesson(null); }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lessons
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{selectedLesson.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {getImpactBadge(selectedLesson.impact)}
                {getImpactLevelBadge(selectedLesson.impactLevel || "medium")}
                <Badge variant="outline">{getLessonTypeLabel(selectedLesson.lessonType || "other")}</Badge>
                {selectedLesson.lessonStatus && (
                  <Badge variant="outline" className="capitalize">{selectedLesson.lessonStatus}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(selectedLesson)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setTargetLessonId(selectedLesson.id); setShowApplyTemplate(true); }}>
                <FileText className="w-3 h-3 mr-1" /> Apply to Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setTargetLessonId(selectedLesson.id);
                setTaskForm({ taskTitle: `Follow up: ${selectedLesson.title}`, taskDescription: selectedLesson.recommendation || "", priority: "medium" });
                setShowCreateTask(true);
              }}>
                <ListTodo className="w-3 h-3 mr-1" /> Create Task
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate({ id: selectedLesson.id })}>
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            </div>
          </div>

          {/* Description */}
          {selectedLesson.description && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.description}</p></CardContent>
            </Card>
          )}

          {/* What Happened */}
          {selectedLesson.whatHappened && (
            <Card>
              <CardHeader><CardTitle className="text-sm">What Happened</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.whatHappened}</p></CardContent>
            </Card>
          )}

          {/* What Worked / What Did Not Work */}
          <div className="grid md:grid-cols-2 gap-4">
            {selectedLesson.whatWorked && (
              <Card>
                <CardHeader><CardTitle className="text-sm text-green-700">What Worked</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.whatWorked}</p></CardContent>
              </Card>
            )}
            {selectedLesson.whatDidNotWork && (
              <Card>
                <CardHeader><CardTitle className="text-sm text-red-700">What Did Not Work</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.whatDidNotWork}</p></CardContent>
              </Card>
            )}
          </div>

          {/* Root Cause & Recommendation */}
          <div className="grid md:grid-cols-2 gap-4">
            {selectedLesson.rootCause && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Root Cause</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.rootCause}</p></CardContent>
              </Card>
            )}
            {selectedLesson.recommendation && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Recommendation</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.recommendation}</p></CardContent>
              </Card>
            )}
          </div>

          {/* Action Taken & Prevention Steps */}
          <div className="grid md:grid-cols-2 gap-4">
            {selectedLesson.actionTaken && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Action Taken</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.actionTaken}</p></CardContent>
              </Card>
            )}
            {selectedLesson.preventionSteps && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Prevention Steps</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLesson.preventionSteps}</p></CardContent>
              </Card>
            )}
          </div>

          {/* Linked Record */}
          {selectedLesson.linkedRecordType && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Linked Record</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm capitalize">{selectedLesson.linkedRecordType}:</span>
                  <span className="text-sm font-medium">{selectedLesson.linkedRecordTitle || `ID #${selectedLesson.linkedRecordId}`}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-slate-500">Created:</span><br />{selectedLesson.createdAt ? new Date(selectedLesson.createdAt).toLocaleDateString() : "N/A"}</div>
                <div><span className="text-slate-500">Visibility:</span><br /><span className="capitalize">{selectedLesson.visibility || "workspace"}</span></div>
                <div><span className="text-slate-500">Tags:</span><br />{selectedLesson.tags || "None"}</div>
                <div><span className="text-slate-500">Category:</span><br />{selectedLesson.category || "General"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Applied/Task Status */}
          {(selectedLesson.appliedToTemplateId || selectedLesson.createdTaskId) && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Workflow Status</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {selectedLesson.appliedToTemplateId && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" /> Applied to template #{selectedLesson.appliedToTemplateId}.
                  </div>
                )}
                {selectedLesson.createdTaskId && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <ListTodo className="w-4 h-4" /> Task #{selectedLesson.createdTaskId} created from this lesson.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <PageLayout
        label="Knowledge Base"
        title="Lessons Learned"
        subtitle="Capture and review lessons learned from contracts, proposals, and operations."
        summaryCards={[{ label: "Total", value: lessons.length }, { label: "Positive", value: (lessons as any[]).filter((l:any)=>l.outcome==="positive").length, color: "text-green-600" }, { label: "Negative", value: (lessons as any[]).filter((l:any)=>l.outcome==="negative").length, color: "text-red-600" }]}
      >
      <PageGuide
        title="Lessons Learned"
        description="Capture and review lessons from past and current contracts to improve future performance. Document what worked, what did not, and what to do differently next time."
        whenToUse="Use during contract closeout, after significant milestones, proposal wins or losses, or when reviewing past performance for new proposals."
        whatToDoNext={[
          "Document lessons from recently completed contracts.",
          "Review past lessons when starting new proposals.",
          "Apply lessons to templates for future use.",
          "Create follow-up tasks from lessons that need action.",
        ]}
        relatedRecords={[
          { label: "Closeout", path: "/app/closeout" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Proposals", path: "/app/proposals" },
          { label: "Templates", path: "/app/templates" },
          { label: "Tasks", path: "/app/tasks" },
        ]}
      />

      {/* Lifecycle Progress */}
      <LifecycleProgress currentPhase="closeout" />

      {/* AI Status Panel */}
      <AIStatusPanel checks={[
        { id: "lessons-captured", name: "Lessons Captured", status: stats.total > 0 ? "verified" : "pending", message: stats.total > 0 ? `${stats.total} lesson(s) documented` : "No lessons captured yet — document your first lesson", severity: stats.total === 0 ? "warning" : "info" },
        { id: "negative-unresolved", name: "Unresolved Challenges", status: stats.negative > 0 ? "flagged" : "verified", message: stats.negative > 0 ? `${stats.negative} challenge(s) documented — review for process improvements` : "No unresolved challenges", severity: stats.negative > 0 ? "warning" : "info" },
        { id: "applied-lessons", name: "Applied to Templates", status: stats.applied > 0 ? "verified" : "pending", message: stats.applied > 0 ? `${stats.applied} lesson(s) applied to templates` : "Apply lessons to templates for future use", severity: "info" },
      ] as AICheck[]} title="LESSONS LEARNED STATUS" />

      {/* What's Next */}
      {stats.total === 0 && <WhatsNext actions={[
        { id: "first-lesson", title: "Document Your First Lesson", description: "Capture a lesson from a recent contract, proposal, or operational experience", priority: "high" as const, action: { label: "Add Lesson", onClick: () => { resetForm(); setShowForm(true); } } },
      ] as NextAction[]} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="p-3">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-500">Total Lessons</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
          <div className="text-xs text-slate-500">Successes</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
          <div className="text-xs text-slate-500">Challenges</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-slate-600">{stats.neutral}</div>
          <div className="text-xs text-slate-500">Observations</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
          <div className="text-xs text-slate-500">Applied</div>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lessons Learned</h1>
          <p className="text-sm text-slate-500 mt-1">{lessons.length} lessons documented.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { resetForm(); setEditingLesson(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search lessons by title, description, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Lesson Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LESSON_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={impactFilter} onValueChange={setImpactFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Impact" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impact</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
        <Select value={impactLevelFilter} onValueChange={setImpactLevelFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {IMPACT_LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Lessons List */}
      {lessonsQuery.isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading lessons...</div>
      ) : lessons.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No lessons documented yet.</h3>
          <p className="text-sm text-slate-500 mb-4">Start capturing lessons from your contracts, proposals, and operations to build institutional knowledge.</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Lesson
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson: any) => (
            <Card
              key={lesson.id}
              className={"border-l-4 cursor-pointer hover:shadow-md transition-shadow " +
                (lesson.impact === "positive" ? "border-l-green-500" :
                 lesson.impact === "negative" ? "border-l-red-500" : "border-l-slate-300")}
              onClick={() => { setSelectedLesson(lesson); setShowDetail(true); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {lesson.impact === "positive" ? (
                    <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : lesson.impact === "negative" ? (
                    <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Minus className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getImpactBadge(lesson.impact)}
                      {getImpactLevelBadge(lesson.impactLevel || "medium")}
                      <Badge variant="outline" className="text-xs">{getLessonTypeLabel(lesson.lessonType || "other")}</Badge>
                      {lesson.linkedRecordType && (
                        <Badge variant="outline" className="text-xs">
                          <Link2 className="w-3 h-3 mr-1" />{lesson.linkedRecordTitle || lesson.linkedRecordType}
                        </Badge>
                      )}
                      {lesson.appliedToTemplateId && (
                        <Badge className="bg-blue-50 text-blue-700 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Applied</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mt-1">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : ""}</span>
                      {lesson.tags && <span className="truncate max-w-[200px]">Tags: {lesson.tags}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openEdit(lesson); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => {
                      e.stopPropagation();
                      setTargetLessonId(lesson.id);
                      setShowApplyTemplate(true);
                    }}>
                      <FileText className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => {
                      e.stopPropagation();
                      setTargetLessonId(lesson.id);
                      setTaskForm({ taskTitle: `Follow up: ${lesson.title}`, taskDescription: lesson.recommendation || "", priority: "medium" });
                      setShowCreateTask(true);
                    }}>
                      <ListTodo className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Lesson Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingLesson(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Brief title describing the lesson." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lesson Type</Label>
                <Select value={formData.lessonType} onValueChange={(v) => setFormData({ ...formData, lessonType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LESSON_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Impact Direction</Label>
                <Select value={formData.impact} onValueChange={(v: any) => setFormData({ ...formData, impact: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive (Success)</SelectItem>
                    <SelectItem value="negative">Negative (Challenge)</SelectItem>
                    <SelectItem value="neutral">Neutral (Observation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Impact Level</Label>
                <Select value={formData.impactLevel} onValueChange={(v: any) => setFormData({ ...formData, impactLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {IMPACT_LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(v: any) => setFormData({ ...formData, visibility: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace">Entire Workspace</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the lesson in detail." className="min-h-[80px]" />
            </div>

            <div>
              <Label>What Happened</Label>
              <Textarea value={formData.whatHappened} onChange={(e) => setFormData({ ...formData, whatHappened: e.target.value })} placeholder="Describe the situation or event that led to this lesson." className="min-h-[60px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>What Worked</Label>
                <Textarea value={formData.whatWorked} onChange={(e) => setFormData({ ...formData, whatWorked: e.target.value })} placeholder="What went well." className="min-h-[60px]" />
              </div>
              <div>
                <Label>What Did Not Work</Label>
                <Textarea value={formData.whatDidNotWork} onChange={(e) => setFormData({ ...formData, whatDidNotWork: e.target.value })} placeholder="What went wrong or could improve." className="min-h-[60px]" />
              </div>
            </div>

            <div>
              <Label>Root Cause</Label>
              <Textarea value={formData.rootCause} onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })} placeholder="Underlying cause of the issue or success." className="min-h-[60px]" />
            </div>

            <div>
              <Label>Recommendation</Label>
              <Textarea value={formData.recommendation} onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })} placeholder="What should be done differently in the future." className="min-h-[60px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Action Taken</Label>
                <Textarea value={formData.actionTaken} onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })} placeholder="What action was taken as a result." className="min-h-[60px]" />
              </div>
              <div>
                <Label>Prevention Steps</Label>
                <Textarea value={formData.preventionSteps} onChange={(e) => setFormData({ ...formData, preventionSteps: e.target.value })} placeholder="Steps to prevent recurrence." className="min-h-[60px]" />
              </div>
            </div>

            {/* Linked Record */}
            <div className="border rounded-lg p-4 space-y-3">
              <Label className="font-medium">Link to Record (Optional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={formData.linkedRecordType || "none"} onValueChange={(v) => {
                  const val = (v === "none" ? "" : v) as "" | "contract" | "proposal" | "opportunity";
                  setFormData({ ...formData, linkedRecordType: val, linkedRecordId: undefined, linkedRecordTitle: "" });
                  setLinkRecordType(val);
                }}>
                  <SelectTrigger><SelectValue placeholder="Record type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Link</SelectItem>
                    {LINKABLE_RECORD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formData.linkedRecordType && linkableRecordsQuery.data && (
                  <Select value={formData.linkedRecordId?.toString() || "none"} onValueChange={(v) => {
                    if (v === "none") {
                      setFormData({ ...formData, linkedRecordId: undefined, linkedRecordTitle: "" });
                    } else {
                      const record = linkableRecordsQuery.data?.find((r: any) => r.id.toString() === v);
                      setFormData({ ...formData, linkedRecordId: parseInt(v), linkedRecordTitle: record?.title || "" });
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select record" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select...</SelectItem>
                      {(linkableRecordsQuery.data || []).map((r: any) => (
                        <SelectItem key={r.id} value={r.id.toString()}>{r.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g., compliance, CMMC, subcontractor" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingLesson(null); }}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingLesson ? "Update Lesson" : "Save Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply to Template Dialog */}
      <Dialog open={showApplyTemplate} onOpenChange={setShowApplyTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Lesson to Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Select a template to append this lesson's recommendation to.</p>
            <Select value={templateId?.toString() || "none"} onValueChange={(v) => setTemplateId(v === "none" ? undefined : parseInt(v))}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a template...</SelectItem>
                {(templatesQuery.data || []).map((t: any) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name || t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyTemplate(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!templateId || applyTemplateMutation.isPending}
              onClick={() => { if (targetLessonId && templateId) applyTemplateMutation.mutate({ lessonId: targetLessonId, templateId }); }}>
              Apply to Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task from Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Title</Label>
              <Input value={taskForm.taskTitle} onChange={(e) => setTaskForm({ ...taskForm, taskTitle: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={taskForm.taskDescription} onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })} className="min-h-[80px]" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={taskForm.priority} onValueChange={(v: any) => setTaskForm({ ...taskForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!taskForm.taskTitle || createTaskMutation.isPending}
              onClick={() => { if (targetLessonId) createTaskMutation.mutate({ lessonId: targetLessonId, ...taskForm }); }}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
            <PageGuidancePanel
        pageKey="lessons-learned"
        title="Lessons Learned Help"
        description="Document insights from completed contracts and lost proposals. Create template improvement suggestions to improve future work."
        whatToDoNext={["Document what worked and what didn't on each contract", "Capture recommendations for future proposals", "Create template improvement suggestions", "Review lessons before starting new proposals"]}
        helpArticleSlug="what-are-lessons-learned"
        glossaryTerms={["lessons-learned", "closeout"]}
      />
    </PageLayout>
  );
}
