import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Users, CreditCard, FileText, Clock, Shield,
  Plus, Ban, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";

export default function PlatformWorkspaceDetailPage() {
  const [location, navigate] = useLocation();
  const workspaceId = parseInt(location.split("/platform/workspaces/")[1] || "0");

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [noteText, setNoteText] = useState("");

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

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString() : "—";
  const formatDateTime = (d: any) => d ? new Date(d).toLocaleString() : "—";

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
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/platform/workspaces")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
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
        <div className="flex gap-2">
          {workspace.status === "active" ? (
            <Button variant="destructive" size="sm" onClick={() => setShowSuspendDialog(true)}>
              <Ban className="w-4 h-4 mr-1" /> Suspend
            </Button>
          ) : workspace.status === "suspended" ? (
            <Button size="sm" onClick={() => setShowReactivateDialog(true)}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reactivate
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => setShowNoteDialog(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Note
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Owner / Admin</p>
          <p className="font-medium text-gray-900">{workspace.owner?.name || "—"}</p>
          <p className="text-sm text-gray-500">{workspace.owner?.email || "—"}</p>
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
            <p className="text-sm">
              Onboarding: {workspace.onboardingCompleted ? (
                <Badge className="bg-green-100 text-green-800 ml-1">Complete</Badge>
              ) : (
                <Badge variant="secondary" className="ml-1">Incomplete</Badge>
              )}
            </p>
            <p className="text-sm">
              Trial Used: {workspace.trialUsed ? (
                <Badge className="bg-yellow-100 text-yellow-800 ml-1">Yes</Badge>
              ) : (
                <Badge variant="secondary" className="ml-1">No</Badge>
              )}
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
                <th className="text-left px-4 py-2 font-medium text-gray-700">Email</th>
                <th className="text-left px-4 py-2 font-medium text-gray-700">Role</th>
                <th className="text-left px-4 py-2 font-medium text-gray-700">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workspace.owner && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{workspace.owner.name || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{workspace.owner.email || "—"}</td>
                  <td className="px-4 py-2"><Badge>Owner</Badge></td>
                  <td className="px-4 py-2 text-gray-600">{formatDate(workspace.owner.createdAt)}</td>
                </tr>
              )}
              {workspace.members?.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{m.user?.name || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{m.user?.email || "—"}</td>
                  <td className="px-4 py-2"><Badge variant="secondary">{m.role}</Badge></td>
                  <td className="px-4 py-2 text-gray-600">{formatDate(m.joinedAt)}</td>
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
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Cycle</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Period Start</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Period End</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Trial Ends</th>
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
                    <td className="px-4 py-2 text-gray-600">{b.billingCycle || "—"}</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(b.currentPeriodStart)}</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(b.currentPeriodEnd)}</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(b.trialEndsAt)}</td>
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
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Priority</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workspace.supportTickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{t.subject || "—"}</td>
                    <td className="px-4 py-2"><Badge variant="secondary">{t.status}</Badge></td>
                    <td className="px-4 py-2 text-gray-600">{t.priority || "—"}</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(t.createdAt)}</td>
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
