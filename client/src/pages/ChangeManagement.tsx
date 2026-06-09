import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, GitBranch, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import FieldHelp from "@/components/FieldHelp";

const statusConfig: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  implemented: "bg-purple-100 text-purple-700",
};

export default function ChangeManagement() {
  const { user } = useAuth();
  const { canWrite, canDelete } = useWorkspaceRole();
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const contractIdParam = urlParams.get("contractId") ? parseInt(urlParams.get("contractId")!) : undefined;
  const shouldAutoOpen = urlParams.get("create") === "true";
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(shouldAutoOpen);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", changeType: "scope", status: "draft", impactCost: "", impactSchedule: "", submittedBy: "" });

  const { data: changes = [], isLoading } = trpc.changeOrders.list.useQuery(
    contractIdParam ? { contractId: contractIdParam } : undefined
  );

  const createChange = trpc.changeOrders.create.useMutation({
    onSuccess: () => {
      utils.changeOrders.list.invalidate();
      setIsAddOpen(false);
      setForm({ title: "", description: "", changeType: "scope", status: "draft", impactCost: "", impactSchedule: "", submittedBy: "" });
      toast.success("Change request created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateChange = trpc.changeOrders.update.useMutation({
    onSuccess: () => {
      utils.changeOrders.list.invalidate();
      setEditItem(null);
      toast.success("Change request updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteChange = trpc.changeOrders.delete.useMutation({
    onSuccess: () => {
      utils.changeOrders.list.invalidate();
      setDeleteItem(null);
      toast.success("Change request deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = useMemo(() => (changes as any[]).filter((c) => {
    const matchesSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.changeType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }), [changes, search, statusFilter, typeFilter]);

  const stats = {
    total: (changes as any[]).length,
    pending: (changes as any[]).filter((c) => ["submitted", "under_review"].includes(c.status)).length,
    approved: (changes as any[]).filter((c) => c.status === "approved").length,
    totalCostImpact: (changes as any[]).filter((c) => c.status !== "rejected").reduce((sum, c) => {
      const cost = parseFloat(c.impactCost?.replace(/[^0-9.]/g, "") || "0");
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0),
  };

  const summaryCards = [
    { label: "Total", value: stats.total },
    { label: "Pending", value: stats.pending, color: stats.pending > 0 ? "text-amber-600" : undefined },
    { label: "Approved", value: stats.approved, color: "text-green-600" },
    { label: "Cost Impact", value: `$${stats.totalCostImpact.toLocaleString()}`, color: "text-blue-600" },
  ];

  const handleSubmit = (isEdit: boolean) => {
    if (!form.title) { toast.error("Title is required"); return; }
    if (isEdit && editItem) {
      updateChange.mutate({ id: editItem.id, ...form });
    } else {
      createChange.mutate({ ...form, submittedBy: form.submittedBy || user?.name || "", contractId: contractIdParam });
    }
  };

  const openEdit = (c: any) => {
    setForm({ title: c.title || "", description: c.description || "", changeType: c.changeType || "scope", status: c.status || "draft", impactCost: c.impactCost || "", impactSchedule: c.impactSchedule || "", submittedBy: c.submittedBy || "" });
    setEditItem(c);
  };

  return (
    <PageLayout label="Contract Operations" title="Change Management" subtitle="Track contract modifications, change orders, and amendments." summaryCards={summaryCards}>
      <PageGuide
        title="Change Management"
        description="Track contract modifications, change orders, and their approval status. Manage scope, cost, schedule, and personnel changes."
        whenToUse="Use when a contract modification is needed, when the government issues a change order, or when tracking the impact of approved changes."
        whatToDoNext={["Create a change request for any scope, cost, or schedule modification", "Track approval workflow through submission, review, and decision"]}
        relatedRecords={[
          { label: "Contracts", path: "/app/contracts" },
          { label: "Deliverables", path: "/app/deliverables" },
          { label: "Finance", path: "/app/finance" },
        ]}
        alerts={stats.pending > 0 ? [{ message: `${stats.pending} change request(s) awaiting review`, type: "warning" }] : []}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search changes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="scope">Scope</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="personnel">Personnel</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canWrite && (
          <Button onClick={() => { setForm({ title: "", description: "", changeType: "scope", status: "draft", impactCost: "", impactSchedule: "", submittedBy: user?.name || "" }); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New Change Request
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No change requests found. {canWrite && "Create your first change request to track contract modifications."}</CardContent></Card>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Change Request</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Impact</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((change: any) => {
                const colorClass = statusConfig[change.status] || statusConfig.draft;
                return (
                  <tr key={change.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 text-sm">{change.title}</p>
                      {change.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{change.description}</p>}
                      {change.submittedBy && <p className="text-xs text-slate-400 mt-0.5">By {change.submittedBy} · {new Date(change.createdAt).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant="outline" className="capitalize">{change.changeType?.replace("_", " ") || "—"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={colorClass}>{change.status?.replace("_", " ") || "draft"}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-xs text-slate-600">
                        {change.impactCost && <span className="block">{change.impactCost}</span>}
                        {change.impactSchedule && <span className="block">{change.impactSchedule}</span>}
                        {!change.impactCost && !change.impactSchedule && <span className="text-slate-400">No impact noted</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {canWrite && (
                          <Button variant="ghost" size="icon" onClick={() => openEdit(change)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteItem(change)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || !!editItem} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditItem(null); } }}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Change Request" : "New Change Request"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label className="flex items-center">Title * <FieldHelp field="title" /></Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Extend Period of Performance by 90 days" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Change Type</Label>
                <Select value={form.changeType} onValueChange={(v) => setForm(f => ({ ...f, changeType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scope">Scope</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="personnel">Personnel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="flex items-center">Status <FieldHelp field="status" /></Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Cost Impact</Label>
                <Input value={form.impactCost} onChange={(e) => setForm(f => ({ ...f, impactCost: e.target.value }))} placeholder="e.g. $45,000" />
              </div>
              <div className="space-y-1">
                <Label>Schedule Impact</Label>
                <Input value={form.impactSchedule} onChange={(e) => setForm(f => ({ ...f, impactSchedule: e.target.value }))} placeholder="e.g. 30 days" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Submitted By</Label>
              <Input value={form.submittedBy} onChange={(e) => setForm(f => ({ ...f, submittedBy: e.target.value }))} placeholder="Name of person submitting" />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center">Description <FieldHelp field="description" /></Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the change and its rationale..." className="min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditItem(null); }}>Cancel</Button>
            <Button onClick={() => handleSubmit(!!editItem)} disabled={createChange.isPending || updateChange.isPending}>
              {(createChange.isPending || updateChange.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editItem ? "Save Changes" : "Create Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => { if (!open) setDeleteItem(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Change Request</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete <strong>{deleteItem?.title}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteChange.mutate({ id: deleteItem.id })} disabled={deleteChange.isPending}>
              {deleteChange.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
