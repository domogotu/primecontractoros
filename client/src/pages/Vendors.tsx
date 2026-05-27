import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Star, Building2, Users, Clock, Loader2 } from "lucide-react";
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
};

export default function Vendors() {
  const { canWrite, canDelete } = useWorkspaceRole();
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<any>(null);
  const [deleteVendor, setDeleteVendor] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [form, setForm] = useState({ companyName: "", contactName: "", email: "", phone: "", category: "Services", status: "active", notes: "" });

  const { data: vendors = [], isLoading } = trpc.vendors.list.useQuery();

  const createVendor = trpc.vendors.create.useMutation({
    onSuccess: () => { utils.vendors.list.invalidate(); setIsAddOpen(false); setForm({ companyName: "", contactName: "", email: "", phone: "", category: "Services", status: "active", notes: "" }); toast.success("Vendor created"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateVendor = trpc.vendors.update.useMutation({
    onSuccess: () => { utils.vendors.list.invalidate(); setEditVendor(null); toast.success("Vendor updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteVendorMutation = trpc.vendors.delete.useMutation({
    onSuccess: () => { utils.vendors.list.invalidate(); setDeleteVendor(null); toast.success("Vendor deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = useMemo(() => (vendors as any[]).filter((v) => {
    const matchesSearch = !searchQuery || v.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || v.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }), [vendors, searchQuery, statusFilter, categoryFilter]);

  const totalVendors = (vendors as any[]).length;
  const activeVendors = (vendors as any[]).filter((v) => v.status === "active").length;
  const pendingVendors = (vendors as any[]).filter((v) => v.status === "pending").length;

  const summaryCards = [
    { label: "Total Vendors", value: totalVendors },
    { label: "Active", value: activeVendors, color: "text-green-600" },
    { label: "Pending Review", value: pendingVendors, color: pendingVendors > 0 ? "text-amber-600" : undefined },
  ];

  const handleSubmit = (isEdit: boolean) => {
    if (!form.companyName) { toast.error("Company name is required"); return; }
    if (isEdit && editVendor) {
      updateVendor.mutate({ id: editVendor.id, ...form });
    } else {
      createVendor.mutate(form);
    }
  };

  const openEdit = (v: any) => {
    setForm({ companyName: v.companyName || "", contactName: v.contactName || "", email: v.email || "", phone: v.phone || "", category: v.category || "Services", status: v.status || "active", notes: v.notes || "" });
    setEditVendor(v);
  };

  return (
    <PageLayout label="Workspace" title="Vendor Management" subtitle="Manage your vendors, track performance, and link contracts." summaryCards={summaryCards}>
      <PageGuide
        title="Vendor Management"
        description="Manage your vendors, track performance, and link contracts."
        whenToUse="Use this page to onboard new vendors, review pending approvals, and monitor vendor performance across all contracts."
        whatToDoNext={["Add a new vendor", "Review pending vendors", "Update vendor status after review"]}
        relatedRecords={[{ label: "Contracts", path: "/app/contracts" }, { label: "Subcontractors", path: "/app/subcontractors" }]}
        alerts={pendingVendors > 0 ? [{ type: "warning", message: `${pendingVendors} vendor(s) pending review.` }] : []}
      />

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="vendors" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="vendors" />

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search vendors..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Materials">Materials</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canWrite && (
          <Button onClick={() => { setForm({ companyName: "", contactName: "", email: "", phone: "", category: "Services", status: "active", notes: "" }); setIsAddOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No vendors found. {canWrite && "Add your first vendor to get started."}</CardContent></Card>
      ) : (
        <Card>
          <div className="rounded-md border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((vendor: any) => (
                <div key={vendor.id} className="flex flex-col">
                  <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === vendor.id ? null : vendor.id)}>
                    <div className="col-span-3 font-medium flex items-center gap-2 text-sm">
                      {expandedRow === vendor.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      {vendor.companyName}
                    </div>
                    <div className="col-span-2 text-sm text-slate-600">{vendor.contactName || "—"}</div>
                    <div className="col-span-2 text-sm">{vendor.category || "—"}</div>
                    <div className="col-span-2">
                      <Badge className={statusColors[vendor.status?.toLowerCase()] || "bg-slate-100 text-slate-700"}>{vendor.status || "unknown"}</Badge>
                    </div>
                    <div className="col-span-3 flex justify-end gap-2">
                      {canWrite && (
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(vendor); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteVendor(vendor); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {expandedRow === vendor.id && (
                    <div className="bg-slate-50 p-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p><span className="font-medium">Email:</span> {vendor.email || "—"}</p>
                          <p><span className="font-medium">Phone:</span> {vendor.phone || "—"}</p>
                          {vendor.createdAt && <p><span className="font-medium">Added:</span> {new Date(vendor.createdAt).toLocaleDateString()}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Notes</h4>
                        <p className="text-sm text-slate-600">{vendor.notes || "No notes available."}</p>
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
      <Dialog open={isAddOpen || !!editVendor} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditVendor(null); } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Company *</Label>
              <Input className="col-span-3" value={form.companyName} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Company name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Contact</Label>
              <Input className="col-span-3" value={form.contactName} onChange={(e) => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Contact name" />
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
              <Label className="text-right">Category</Label>
              <div className="col-span-3">
                <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Materials">Materials</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Notes</Label>
              <Textarea className="col-span-3" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes about this vendor..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditVendor(null); }}>Cancel</Button>
            <Button onClick={() => handleSubmit(!!editVendor)} disabled={createVendor.isPending || updateVendor.isPending}>
              {(createVendor.isPending || updateVendor.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editVendor ? "Save Changes" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteVendor} onOpenChange={(open) => { if (!open) setDeleteVendor(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Vendor</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete <strong>{deleteVendor?.companyName}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteVendor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteVendorMutation.mutate({ id: deleteVendor.id })} disabled={deleteVendorMutation.isPending}>
              {deleteVendorMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
