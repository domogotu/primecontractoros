import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Users, CreditCard, FileText, Clock, Shield,
  Plus, Ban, RotateCcw, Edit2, Mail, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PlatformWorkspaceDetailPage() {
  const [location, navigate] = useLocation();
  const workspaceId = parseInt(location.split("/platform/workspaces/")[1] || "0");

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContractingModel, setEditContractingModel] = useState<"prime" | "sub" | "both" | "">("");
  const [editOnboarding, setEditOnboarding] = useState<boolean | null>(null);

  const { data: workspace, isLoading, refetch } = trpc.platformAdmin.workspaces.get.useQuery(
    { id: workspaceId },
    { enabled: workspaceId > 0 }
  );

  const suspendWorkspace = trpc.platformAdmin.workspaces.suspend.useMutation({
    onSuccess: () => { refetch(); setShowSuspendDialog(false); setReason(""); },
  });
  const reactivateWorkspace = trpc.platformAdmin.workspaces.reactivate.useMutation({
    onSuccess: () => { refetch(); setShowReactivateDialog(false); setReason(""); },
  });
  const addNote = trpc.platformAdmin.notes.create.useMutation({
    onSuccess: () => { refetch(); setShowNoteDialog(false); setNoteText(""); },
  });
  const updateWorkspace = trpc.platformAdmin.workspaces.update.useMutation({
    onSuccess: () => {
      refetch();
      setShowEditDialog(false);
      toast.success("Workspace updated");
    },
    onError: (e) => toast.error(e.message),
  });
  const sendWelcomeEmail = trpc.platformAdmin.sendWelcomeEmail.useMutation({
    onSuccess: () => toast.success("Welcome email sent successfully"),
    onError: (e: any) => toast.error(e.message),
  });

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString() : "—";
  const formatDateTime = (d: any) => d ? new Date(d).toLocaleString() : "—";

  const openEditDialog = () => {
    if (!workspace) return;
    setEditCompanyName(workspace.companyName || "");
    setEditContractingModel((workspace.contractingModel as any) || "");
    setEditOnboarding(workspace.onboardingCompleted ?? false);
    setShowEditDialog(true);
  };

  const handleEdit = () => {
    const payload: any = { id: workspaceId };
    if (editCompanyName.trim()) payload.companyName = editCompanyName.trim();
    if (editContractingModel) payload.contractingModel = editContractingModel;
    if (editOnboarding !== null) payload.onboardingCompleted = editOnboarding;
    updateWorkspace.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/platform/workspaces")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workspaces
        </Button>
        <div className="text-center py-12 text-gray-500">
          <p>Workspace not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/platform/workspaces")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
            {workspace.companyName || workspace.name}
          </h1>
          <p className="text-gray-500 text-sm">Workspace ID: {workspace.id}</p>
        </div>
        <Badge
          className={
            workspace.status === "active"
              ? "bg-green-100 text-green-800"
              : workspace.status === "suspended"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
          }
        >
          {workspace.status}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={openEditDialog}>
          <Edit2 className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => sendWelcomeEmail.mutate({ workspaceId: workspace.id })}
          disabled={sendWelcomeEmail.isPending}
          className="text-blue-700 border-blue-300 hover:bg-blue-50"
        >
          <Mail className="w-4 h-4 mr-1" />
          {sendWelcomeEmail.isPending ? "Sending..." : "Send Welcome Email"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowNoteDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Note
        </Button>
        {workspace.status === "active" ? (
          <Button variant="destructive" size="sm" onClick={() => setShowSuspendDialog(true)}>
            <Ban className="w-4 h-4 mr-1" /> Suspend
          </Button>
        ) : workspace.status === "suspended" ? (
          <Button size="sm" onClick={() => setShowReactivateDialog(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reactivate
          </Button>
        ) : null}
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Owner / Admin</p>
          <p className="font-medium text-gray-900">{workspace.owner?.name || "—"}</p>
          <p className="text-sm text-gray-500 truncate">{workspace.owner?.email || "—"}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Plan & Billing</p>
          <p className="font-medium text-gray-900">{workspace.plan?.name || "No Plan"}</p>
          <p className="text-sm text-gray-500">
            {workspace.billingHistory?.[0]?.status || "No billing"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Created</p>
          <p className="font-medium text-gray-900">{formatDate(workspace.createdAt)}</p>
          <p className="text-sm text-gray-500">Last login: {formatDateTime(workspace.lastLogin?.createdAt)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-1">
              Onboarding:
              {workspace.onboardingCompleted ? (
                <Badge className="bg-green-100 text-green-800 ml-1">Complete</Badge>
              ) : (
                <Badge variant="secondary" className="ml-1">Incomplete</Badge>
              )}
            </p>
            <p className="text-sm">
              Model: <span className="font-medium capitalize">{workspace.contractingModel || "—"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Users in Workspace */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" /> Users ({workspace.members?.length || 1})
        </h2>
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-2 font-medium text-gray-700 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-2 font-medium text-gray-700">Role</th>
                <th className="text-left px-4 py-2 font-medium text-gray-700 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workspace.owner && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{workspace.owner.name || "—"}</td>
                  <td className="px-4 py-2 text-gray-600 hidden sm:table-cell truncate max-w-[180px]">{workspace.owner.email || "—"}</td>
                  <td className="px-4 py-2"><Badge>Owner</Badge></td>
                  <td className="px-4 py-2 text-gray-600 hidden md:table-cell">{formatDate(workspace.owner.createdAt)}</td>
                </tr>
              )}
              {workspace.members?.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{m.user?.name || "—"}</td>
                  <td className="px-4 py-2 text-gray-600 hidden sm:table-cell truncate max-w-[180px]">{m.user?.email || "—"}</td>
                  <td className="px-4 py-2"><Badge variant="secondary">{m.role}</Badge></td>
                  <td className="px-4 py-2 text-gray-600 hidden md:table-cell">{formatDate(m.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Billing History */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Billing History
        </h2>
        {workspace.billingHistory?.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700 hidden sm:table-cell">Cycle</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700 hidden md:table-cell">Period Start</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700 hidden md:table-cell">Period End</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workspace.billingHistory.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Badge className={
                        b.status === "active" ? "bg-green-100 text-green-800" :
                        b.status === "trial" ? "bg-blue-100 text-blue-800" :
                        b.status === "past_due" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }>{b.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-gray-600 hidden sm:table-cell">{b.billingCycle || "—"}</td>
                    <td className="px-4 py-2 text-gray-600 hidden md:table-cell">{formatDate(b.currentPeriodStart)}</td>
                    <td className="px-4 py-2 text-gray-600 hidden md:table-cell">{formatDate(b.currentPeriodEnd)}</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No billing records</p>
        )}
      </section>

      {/* Support Tickets */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Support Tickets ({workspace.supportTickets?.length || 0})
        </h2>
        {workspace.supportTickets?.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Subject</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700 hidden sm:table-cell">Priority</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700 hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workspace.supportTickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{t.subject}</td>
                    <td className="px-4 py-2"><Badge variant="secondary">{t.status}</Badge></td>
                    <td className="px-4 py-2 text-gray-600 hidden sm:table-cell">{t.priority || "—"}</td>
                    <td className="px-4 py-2 text-gray-600 hidden md:table-cell">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No support tickets</p>
        )}
      </section>

      {/* Platform Notes */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Platform Notes
        </h2>
        {workspace.platformNotes?.length > 0 ? (
          <div className="space-y-3">
            {workspace.platformNotes.map((n: any) => (
              <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-900">{n.note}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Added by admin #{n.createdBy} on {formatDateTime(n.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No platform notes</p>
        )}
      </section>

      {/* Audit Log Timeline */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Audit Log
        </h2>
        {workspace.auditLog?.length > 0 ? (
          <div className="space-y-2">
            {workspace.auditLog.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                  {entry.reason && <p className="text-sm text-gray-600">{entry.reason}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    By admin #{entry.performedBy} at {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No audit entries</p>
        )}
      </section>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <Input
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  placeholder="Company name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contracting Model</label>
                <select
                  value={editContractingModel}
                  onChange={(e) => setEditContractingModel(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Select —</option>
                  <option value="prime">Prime Contractor</option>
                  <option value="sub">Subcontractor</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOnboarding(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                      editOnboarding === true
                        ? "bg-green-100 border-green-400 text-green-800"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditOnboarding(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                      editOnboarding === false
                        ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Incomplete
                  </button>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button
              disabled={updateWorkspace.isPending}
              onClick={handleEdit}
            >
              {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Workspace</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-gray-600 mb-4">
              Suspending <strong>{workspace.companyName || workspace.name}</strong> will prevent all users from accessing it.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required for audit log)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for suspension..."
              rows={3}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || suspendWorkspace.isPending}
              onClick={() => suspendWorkspace.mutate({ id: workspace.id, reason })}
            >
              {suspendWorkspace.isPending ? "Suspending..." : "Confirm Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate Workspace</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-gray-600 mb-4">
              Reactivate <strong>{workspace.companyName || workspace.name}</strong>? Users will regain access.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required for audit log)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for reactivation..."
              rows={3}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>Cancel</Button>
            <Button
              disabled={!reason.trim() || reactivateWorkspace.isPending}
              onClick={() => reactivateWorkspace.mutate({ id: workspace.id, reason })}
            >
              {reactivateWorkspace.isPending ? "Reactivating..." : "Confirm Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Platform Note</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note about this workspace..."
              rows={4}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button
              disabled={!noteText.trim() || addNote.isPending}
              onClick={() => addNote.mutate({ workspaceId: workspace.id, note: noteText })}
            >
              {addNote.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
