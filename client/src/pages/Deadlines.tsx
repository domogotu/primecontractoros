import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import PageGuide from "@/components/PageGuide";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";

const statusColors: Record<string, string> = {
  overdue: "bg-red-100 text-red-700",
  due_soon: "bg-amber-100 text-amber-700",
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const priorityColors: Record<string, string> = {
  critical: "border-red-400 text-red-700",
  high: "border-amber-400 text-amber-700",
  medium: "border-blue-400 text-blue-700",
  low: "border-slate-400 text-slate-600",
};

function computeStatus(dueDate: Date | string, currentStatus: string): string {
  if (currentStatus === "completed") return "completed";
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 14) return "due_soon";
  return "upcoming";
}

function daysUntil(dueDate: Date | string): number {
  const due = new Date(dueDate);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Deadlines() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const contractIdParam = urlParams.get("contractId") ? parseInt(urlParams.get("contractId")!) : undefined;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    linkedRecordType: "",
  });

  const { data: deadlines = [], isLoading, refetch } = trpc.deadlines.list.useQuery(
    contractIdParam ? { contractId: contractIdParam } : undefined
  );
  const createMutation = trpc.deadlines.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ title: "", description: "", dueDate: "", priority: "medium", linkedRecordType: "" });
      toast.success("Deadline created");
    },
    onError: (e: any) => toast.error(e.message),
  });
  const updateMutation = trpc.deadlines.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Deadline updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.deadlines.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Deadline deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const enriched = useMemo(() => {
    return (deadlines as any[]).map((d) => ({
      ...d,
      computedStatus: computeStatus(d.dueDate, d.status),
      daysUntil: daysUntil(d.dueDate),
    }));
  }, [deadlines]);

  const filtered = useMemo(() => {
    return enriched
      .filter((d) => {
        const matchesSearch =
          !search ||
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          (d.description || "").toLowerCase().includes(search.toLowerCase());
        const matchesType =
          typeFilter === "all" || d.linkedRecordType === typeFilter || d.priority === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [enriched, search, typeFilter]);

  const stats = {
    overdue: enriched.filter((d) => d.computedStatus === "overdue").length,
    dueSoon: enriched.filter((d) => d.computedStatus === "due_soon").length,
    thisMonth: enriched.filter((d) => d.daysUntil >= 0 && d.daysUntil <= 30).length,
    total: enriched.length,
  };

  const handleCreate = () => {
    if (!form.title || !form.dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    createMutation.mutate({
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate,
      priority: form.priority || undefined,
      linkedRecordType: form.linkedRecordType || undefined,
    });
  };

  const handleComplete = (id: number) => {
    updateMutation.mutate({ id, status: "completed" });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto pb-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-32 bg-slate-200 rounded" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <PageLayout
        label="Contract Operations"
        title="Deadlines & Milestones"
        subtitle="Track all contract deadlines, submission dates, and compliance milestones."
        summaryCards={[{ label: "Total", value: deadlines.length }, { label: "Due Soon", value: stats.dueSoon, color: "text-amber-600" }, { label: "Overdue", value: stats.overdue, color: "text-red-600" }, { label: "This Month", value: stats.thisMonth, color: "text-green-600" }]}
      >
      <PageGuide
        title="Deadlines"
        description="Monitor all upcoming deadlines across contracts, deliverables, compliance, and operations."
        whenToUse="Check daily to stay ahead of upcoming deadlines. Use for planning and prioritization."
        whatToDoNext={[
          "Address overdue items immediately",
          "Plan for urgent deadlines within 14 days",
          "Set reminders for upcoming milestones",
          "Link deadlines to responsible team members",
        ]}
        relatedRecords={[
          { label: "Deliverables", path: "/app/deliverables" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Alerts & Tasks", path: "/app/alerts" },

        ]}
        alerts={[
          ...(stats.overdue > 0
            ? [{ message: stats.overdue + " overdue deadline(s) require immediate attention", type: "warning" as const }]
            : []),
          ...(stats.dueSoon > 0
            ? [{ message: stats.dueSoon + " deadline(s) due within 14 days", type: "warning" as const }]
            : []),
        ]}
      />

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="deadlines" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="deadlines" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deadlines</h1>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} total | {stats.thisMonth} due this month | {stats.overdue} overdue
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deadline
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search deadlines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deadlines List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">
              {enriched.length === 0 ? "No deadlines yet. Add your first deadline to start tracking." : "No deadlines match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((deadline) => (
            <Card
              key={deadline.id}
              className={
                "border-l-4 " +
                (deadline.computedStatus === "overdue"
                  ? "border-l-red-500"
                  : deadline.computedStatus === "due_soon"
                  ? "border-l-amber-500"
                  : deadline.computedStatus === "completed"
                  ? "border-l-green-500"
                  : "border-l-blue-500")
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={statusColors[deadline.computedStatus] || statusColors.upcoming}>
                        {deadline.computedStatus}
                      </Badge>
                      {deadline.priority && (
                        <Badge variant="outline" className={priorityColors[deadline.priority] || ""}>
                          {deadline.priority}
                        </Badge>
                      )}
                      {deadline.linkedRecordType && (
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          {deadline.linkedRecordType}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">{deadline.title}</h3>
                    {deadline.description && (
                      <p className="text-xs text-slate-500 mt-1">{deadline.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(deadline.dueDate).toLocaleDateString()}
                      </p>
                      <p
                        className={
                          "text-xs mt-0.5 " +
                          (deadline.daysUntil < 0
                            ? "text-red-600 font-medium"
                            : deadline.daysUntil <= 14
                            ? "text-amber-600"
                            : "text-slate-500")
                        }
                      >
                        {deadline.computedStatus === "completed"
                          ? "Completed"
                          : deadline.daysUntil < 0
                          ? Math.abs(deadline.daysUntil) + " days overdue"
                          : deadline.daysUntil + " days remaining"}
                      </p>
                    </div>
                    {deadline.computedStatus !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComplete(deadline.id)}
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: deadline.id })}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Deadline Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deadline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Monthly Status Report Due"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional details"
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.linkedRecordType || "none"}
                onValueChange={(v) => setForm({ ...form, linkedRecordType: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="deliverable">Deliverable</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="personnel">Personnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? "Creating..." : "Create Deadline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
      </PageLayout>
  );
}
