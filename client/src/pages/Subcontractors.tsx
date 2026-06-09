import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";
import PageLayout from "@/components/PageLayout";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Building2, Users, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  inactive: "bg-red-100 text-red-800",
  archived: "bg-slate-100 text-slate-600",
};

export default function Subcontractors() {
  const { canWrite, canDelete } = useWorkspaceRole();
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const contractIdParam = urlParams.get("contractId") ? parseInt(urlParams.get("contractId")!) : undefined;
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSub, setEditSub] = useState<any>(null);
  const [deleteSub, setDeleteSub] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [form, setForm] = useState({ companyName: "", contactName: "", email: "", phone: "", specialty: "", status: "active" });

  const { data: subs = [], isLoading } = trpc.subcontractors.list.useQuery(
    contractIdParam ? { contractId: contractIdParam } : undefined
  );

  const createSub = trpc.subcontractors.create.useMutation({
    onSuccess: () => { utils.subcontractors.list.invalidate(); setIsAddOpen(false); setForm({ companyName: "", contactName: "", email: "", phone: "", specialty: "", status: "active" }); toast.success("Subcontractor added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateSub = trpc.subcontractors.update.useMutation({
    onSuccess: () => { utils.subcontractors.list.invalidate(); setEditSub(null); toast.success("Subcontractor updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSubMutation = trpc.subcontractors.delete.useMutation({
    onSuccess: () => { utils.subcontractors.list.invalidate(); setDeleteSub(null); toast.success("Subcontractor deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = useMemo(() => (subs as any[]).filter((s) => {
    const matchesSearch = !searchQuery || s.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || s.pointOfContact?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [subs, searchQuery, statusFilter]);

  const totalSubs = (subs as any[]).length;
  const activeSubs = (subs as any[]).filter((s) => s.status === "active").length;
  const pendingSubs = (subs as any[]).filter((s) => s.status === "pending").length;

  const summaryCards = [
    { label: "Total Subcontractors", value: totalSubs },
    { label: "Active", value: activeSubs, color: "text-green-600" },
    { label: "Pending", value: pendingSubs, color: pendingSubs > 0 ? "text-amber-600" : undefined },
  ];

  const handleSubmit = (isEdit: boolean) => {
    if (!form.companyName) { toast.error("Company name is required"); return; }
    if (isEdit && editSub) {
      updateSub.mutate({ id: editSub.id, ...form });
    } else {
      createSub.mutate(form);
    }
  };

  const openEdit = (s: any) => {
    setForm({ companyName: s.companyName || "", contactName: s.pointOfContact || "", email: s.email || "", phone: s.phone || "", specialty: s.role || "", status: s.status || "active" });
    setEditSub(s);
  };

  return (
    <PageLayout label="Workspace" title="Subcontractors" subtitle="Manage subcontractor relationships, compliance, and performance." summaryCards={summaryCards}>
      <PageGuide
        title="Subcontractors"
        description="Manage subcontractor relationships, compliance, and performance tracking."
        whenToUse="Use this page to onboard new subcontractors, track compliance requirements, and monitor performance."
        whatToDoNext={["Add a subcontractor", "Review pending subcontractors", "Link subcontractors to contracts"]}
        relatedRecords={[
          { label: "Contracts", path: "/app/contracts" },
          { label: "Vendors", path: "/app/vendors" },
        ]}
        alerts={pendingSubs > 0 ? [{ type: "warning", message: `${pendingSubs} subcontractor(s) pending review.` }] : []}
      />

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="subcontractors" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="subcontractors" />

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search subcontractors..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canWrite && (
          <Button onClick={() => { setForm({ companyName: "", contactName: "", email: "", phone: "", specialty: "", status: "active" }); setIsAddOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Subcontractor
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No subcontractors found. {canWrite && "Add your first subcontractor to get started."}</CardContent></Card>
      ) : (
        <Card>
          <div className="rounded-md border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
              <div className="col-span-4">Company</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Role / Specialty</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((sub: any) => (
                <div key={sub.id} className="flex flex-col">
                  <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)}>
                    <div className="col-span-4 font-medium flex items-center gap-2 text-sm">
                      {expandedRow === sub.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      {sub.companyName}
                    </div>
                    <div className="col-span-2 text-sm text-slate-600">{sub.pointOfContact || "—"}</div>
                    <div className="col-span-2 text-sm text-slate-600">{sub.role || "—"}</div>
                    <div className="col-span-2">
                      <Badge className={statusColors[sub.status?.toLowerCase()] || "bg-slate-100 text-slate-700"}>{sub.status || "unknown"}</Badge>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      {canWrite && (
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(sub); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteSub(sub); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {expandedRow === sub.id && (
                    <div className="bg-slate-50 p-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p><span className="font-medium">Email:</span> {sub.email || "—"}</p>
                          <p><span className="font-medium">Phone:</span> {sub.phone || "—"}</p>
                          {sub.createdAt && <p><span className="font-medium">Added:</span> {new Date(sub.createdAt).toLocaleDateString()}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Performance Notes</h4>
                        <p className="text-sm text-slate-600">{sub.performanceNotes || "No notes available."}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || !!editSub} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditSub(null); } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editSub ? "Edit Subcontractor" : "Add Subcontractor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Company *</Label>
              <Input className="col-span-3" value={form.companyName} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Company name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Contact</Label>
              <Input className="col-span-3" value={form.contactName} onChange={(e) => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Point of contact" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <Input className="col-span-3" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phone</Label>
              <Input className="col-span-3" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="555-0100" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Role / Specialty</Label>
              <Input className="col-span-3" value={form.specialty} onChange={(e) => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. IT Services, Engineering" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <div className="col-span-3">
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditSub(null); }}>Cancel</Button>
            <Button onClick={() => handleSubmit(!!editSub)} disabled={createSub.isPending || updateSub.isPending}>
              {(createSub.isPending || updateSub.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editSub ? "Save Changes" : "Add Subcontractor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteSub} onOpenChange={(open) => { if (!open) setDeleteSub(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Subcontractor</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete <strong>{deleteSub?.companyName}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSub(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteSubMutation.mutate({ id: deleteSub.id })} disabled={deleteSubMutation.isPending}>
              {deleteSubMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
