import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Users, CreditCard, FileText, Clock, Shield,
  Plus, Ban, RotateCcw, Edit2, Mail, CheckCircle2, Flag,
  Activity, BarChart3, AlertTriangle, Settings, RefreshCw, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function PlatformWorkspaceDetailPage() {
  const [location, navigate] = useLocation();
  const workspaceId = parseInt(location.split("/platform/workspaces/")[1] || "0");

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContractingModel, setEditContractingModel] = useState<"prime" | "sub" | "both" | "">("");
  const [editOnboarding, setEditOnboarding] = useState<boolean | null>(null);
  const [flagTitle, setFlagTitle] = useState("");
  const [flagSeverity, setFlagSeverity] = useState<"info" | "warning" | "critical">("warning");
  const [flagDescription, setFlagDescription] = useState("");

  const { data: workspace, isLoading, refetch } = trpc.platformAdmin.workspaces.get.useQuery(
    { id: workspaceId },
    { enabled: workspaceId > 0 }
  );
  const { data: usage } = trpc.platformAdmin.workspaceUsage.useQuery(
    { workspaceId },
    { enabled: workspaceId > 0 }
  );
  const { data: healthFlags = [], refetch: refetchFlags } = trpc.platformAdmin.healthFlags.list.useQuery(
    { workspaceId, activeOnly: true },
    { enabled: workspaceId > 0 }
  );
  const { data: activityLog = [] } = trpc.platformAdmin.activityLog.list.useQuery(
    { workspaceId, limit: 20 },
    { enabled: workspaceId > 0 }
  );

  const suspendWorkspace = trpc.platformAdmin.workspaces.suspend.useMutation({
    onSuccess: () => { refetch(); setShowSuspendDialog(false); setReason(""); toast.success("Workspace suspended."); },
  });
  const reactivateWorkspace = trpc.platformAdmin.workspaces.reactivate.useMutation({
    onSuccess: () => { refetch(); setShowReactivateDialog(false); setReason(""); toast.success("Workspace reactivated."); },
  });
  const [inlineNoteText, setInlineNoteText] = useState("");
  const addNote = trpc.platformAdmin.workspaces.addNote.useMutation({
    onSuccess: () => { refetch(); setShowNoteDialog(false); setNoteText(""); toast.success("Note added."); },
  });
  const addInlineNote = trpc.platformAdmin.workspaces.addNote.useMutation({
    onSuccess: () => { refetch(); setInlineNoteText(""); toast.success("Note added."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteNote = trpc.platformAdmin.workspaces.deleteNote.useMutation({
    onSuccess: () => { refetch(); toast.success("Note deleted."); },
    onError: (e) => toast.error(e.message),
  });
  const updateWorkspace = trpc.platformAdmin.workspaces.update.useMutation({
    onSuccess: () => { refetch(); setShowEditDialog(false); toast.success("Workspace updated."); },
    onError: (e) => toast.error(e.message),
  });
  const sendWelcomeEmail = trpc.platformAdmin.sendWelcomeEmail.useMutation({
    onSuccess: () => toast.success("Welcome email sent successfully."),
    onError: (e: any) => toast.error(e.message),
  });
  const createFlag = trpc.platformAdmin.healthFlags.create.useMutation({
    onSuccess: () => { refetchFlags(); setShowFlagDialog(false); setFlagTitle(""); setFlagDescription(""); toast.success("Health flag created."); },
  });
  const resolveFlag = trpc.platformAdmin.healthFlags.resolve.useMutation({
    onSuccess: () => { refetchFlags(); toast.success("Flag resolved."); },
  });
  const resetOnboarding = trpc.platformAdmin.overrides.resetOnboarding.useMutation({
    onSuccess: () => { refetch(); setShowOverrideDialog(null); setReason(""); toast.success("Onboarding reset."); },
  });
  const resetTrial = trpc.platformAdmin.overrides.resetTrial.useMutation({
    onSuccess: () => { refetch(); setShowOverrideDialog(null); setReason(""); toast.success("Trial reset."); },
  });
  const transferOwnership = trpc.platformAdmin.overrides.transferOwnership.useMutation({
    onSuccess: () => { refetch(); setShowOverrideDialog(null); setReason(""); toast.success("Ownership transferred."); },
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/platform/workspaces")} className="text-slate-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workspaces
        </Button>
        <div className="text-center py-12 text-slate-400">
          <p>Workspace not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      {/* Section 1: Header / Workspace Summary */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/platform/workspaces")} className="text-slate-300">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-white truncate">
            {workspace.companyName || workspace.name}
          </h1>
          <p className="text-slate-400 text-sm">Workspace ID: {workspace.id} — Created: {formatDate(workspace.createdAt)}</p>
        </div>
        <Badge
          className={
            workspace.status === "active"
              ? "bg-green-900/50 text-green-300 border-green-700"
              : workspace.status === "suspended"
                ? "bg-red-900/50 text-red-300 border-red-700"
                : "bg-slate-700 text-slate-100"
          }
        >
          {workspace.status}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={openEditDialog} className="border-slate-600 text-slate-200 hover:bg-slate-700">
          <Edit2 className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => sendWelcomeEmail.mutate({ workspaceId: workspace.id })}
          disabled={sendWelcomeEmail.isPending}
          className="text-blue-300 border-blue-700 hover:bg-blue-900/50"
        >
          <Mail className="w-4 h-4 mr-1" />
          {sendWelcomeEmail.isPending ? "Sending..." : "Send Welcome Email"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowNoteDialog(true)} className="border-slate-600 text-slate-200 hover:bg-slate-700">
          <Plus className="w-4 h-4 mr-1" /> Add Note
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowFlagDialog(true)} className="border-amber-700 text-amber-300 hover:bg-amber-900/30">
          <Flag className="w-4 h-4 mr-1" /> Add Flag
        </Button>
        {workspace.status === "active" ? (
          <Button variant="destructive" size="sm" onClick={() => setShowSuspendDialog(true)}>
            <Ban className="w-4 h-4 mr-1" /> Suspend
          </Button>
        ) : workspace.status === "suspended" ? (
          <Button size="sm" onClick={() => setShowReactivateDialog(true)} className="bg-green-700 hover:bg-green-600 text-white">
            <RotateCcw className="w-4 h-4 mr-1" /> Reactivate
          </Button>
        ) : null}
      </div>

      {/* Section 2: Owner/Admin Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase mb-1">Owner / Admin</p>
          <p className="font-medium text-white">{workspace.owner?.name || "—"}</p>
          <p className="text-sm text-slate-400 truncate">{workspace.owner?.email || "—"}</p>
          <p className="text-xs text-slate-500 mt-1">User ID: {workspace.owner?.id || "—"}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase mb-1">Plan & Billing</p>
          <p className="font-medium text-white">{workspace.plan?.name || "No Plan"}</p>
          <p className="text-sm text-slate-400">
            {workspace.billingHistory?.[0]?.status || "No billing record"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Cycle: {workspace.billingHistory?.[0]?.billingCycle || "—"}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase mb-1">Activity</p>
          <p className="font-medium text-white">Last login: {formatDateTime(workspace.lastLogin?.createdAt)}</p>
          <p className="text-sm text-slate-400">
            Contracting model: <span className="capitalize">{workspace.contractingModel || "not set"}</span>
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase mb-1">Onboarding / Setup Status</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-1 text-white">
              {workspace.onboardingCompleted ? (
                <><CheckCircle2 className="w-4 h-4 text-green-400" /> Complete</>
              ) : (
                <><AlertTriangle className="w-4 h-4 text-amber-400" /> Incomplete</>
              )}
            </p>
            <p className="text-xs text-slate-500">
              Trial used: {workspace.trialUsed ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Workspace Usage / Product Activity */}
      {usage && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Workspace Usage / Product Activity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Contracts", value: usage.contracts },
              { label: "Proposals", value: usage.proposals },
              { label: "Opportunities", value: usage.opportunities },
              { label: "Invoices", value: usage.invoices },
              { label: "Tasks", value: usage.tasks },
              { label: "Users", value: usage.users },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-300">{item.value}</p>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 6: Risk / Attention Flags */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Flag className="w-5 h-5 text-amber-400" /> Risk / Attention Flags ({healthFlags.length})
        </h2>
        {healthFlags.length > 0 ? (
          <div className="space-y-2">
            {healthFlags.map((flag: any) => (
              <div key={flag.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                flag.severity === "critical" ? "bg-red-900/20 border-red-700/50" :
                flag.severity === "warning" ? "bg-amber-900/20 border-amber-700/50" :
                "bg-blue-900/20 border-blue-700/50"
              }`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  flag.severity === "critical" ? "text-red-400" :
                  flag.severity === "warning" ? "text-amber-400" :
                  "text-blue-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{flag.title}</p>
                    <Badge className={`text-xs ${
                      flag.severity === "critical" ? "bg-red-900/50 text-red-300" :
                      flag.severity === "warning" ? "bg-amber-900/50 text-amber-300" :
                      "bg-blue-900/50 text-blue-300"
                    }`}>{flag.severity}</Badge>
                  </div>
                  {flag.description && <p className="text-xs text-slate-400 mt-1">{flag.description}</p>}
                  <p className="text-xs text-slate-500 mt-1">Created: {formatDateTime(flag.createdAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resolveFlag.mutate({ id: flag.id, resolutionNote: "Resolved by admin." })}
                  className="text-green-400 hover:bg-green-900/30 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No active health flags.</p>
        )}
      </section>

      {/* Section 3: Users in Workspace */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" /> Users ({(workspace.members?.length || 0) + (workspace.owner ? 1 : 0)})
        </h2>
        <div className="border border-slate-700 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-300">Name</th>
                <th className="text-left px-4 py-2 font-medium text-slate-300 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-2 font-medium text-slate-300">Role</th>
                <th className="text-left px-4 py-2 font-medium text-slate-300 hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-2 font-medium text-slate-300">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {workspace.owner && (
                <tr className="hover:bg-slate-700/50">
                  <td className="px-4 py-2 font-medium text-white">{workspace.owner.name || "—"}</td>
                  <td className="px-4 py-2 text-slate-300 hidden sm:table-cell truncate max-w-[180px]">{workspace.owner.email || "—"}</td>
                  <td className="px-4 py-2"><Badge className="bg-blue-900/50 text-blue-300">Owner</Badge></td>
                  <td className="px-4 py-2 text-slate-400 hidden md:table-cell">{formatDate(workspace.owner.createdAt)}</td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/platform/users/${workspace.owner!.id}`)} className="text-blue-400 hover:text-blue-300">
                      View
                    </Button>
                  </td>
                </tr>
              )}
              {workspace.members?.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-2 font-medium text-white">{m.user?.name || "—"}</td>
                  <td className="px-4 py-2 text-slate-300 hidden sm:table-cell truncate max-w-[180px]">{m.user?.email || "—"}</td>
                  <td className="px-4 py-2"><Badge variant="secondary">{m.role}</Badge></td>
                  <td className="px-4 py-2 text-slate-400 hidden md:table-cell">{formatDate(m.joinedAt)}</td>
                  <td className="px-4 py-2">
                    {m.user && (
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/platform/users/${m.user.id}`)} className="text-blue-400 hover:text-blue-300">
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Billing History */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Billing History
        </h2>
        {workspace.billingHistory?.length > 0 ? (
          <div className="border border-slate-700 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300 hidden sm:table-cell">Cycle</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300 hidden md:table-cell">Period Start</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300 hidden md:table-cell">Period End</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {workspace.billingHistory.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-2">
                      <Badge className={
                        b.status === "active" ? "bg-green-900/50 text-green-300" :
                        b.status === "trial" ? "bg-blue-900/50 text-blue-300" :
                        b.status === "past_due" ? "bg-yellow-900/50 text-yellow-300" :
                        "bg-slate-700 text-slate-300"
                      }>{b.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-slate-300 hidden sm:table-cell">{b.billingCycle || "—"}</td>
                    <td className="px-4 py-2 text-slate-400 hidden md:table-cell">{formatDate(b.currentPeriodStart)}</td>
                    <td className="px-4 py-2 text-slate-400 hidden md:table-cell">{formatDate(b.currentPeriodEnd)}</td>
                    <td className="px-4 py-2 text-slate-400">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No billing records.</p>
        )}
      </section>

      {/* Section 7: Support Tickets */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Support Tickets ({workspace.supportTickets?.length || 0})
        </h2>
        {workspace.supportTickets?.length > 0 ? (
          <div className="border border-slate-700 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Subject</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300 hidden sm:table-cell">Priority</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300 hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {workspace.supportTickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-2 text-white">{t.subject}</td>
                    <td className="px-4 py-2"><Badge variant="secondary">{t.status}</Badge></td>
                    <td className="px-4 py-2 text-slate-300 hidden sm:table-cell">{t.priority || "—"}</td>
                    <td className="px-4 py-2 text-slate-400 hidden md:table-cell">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No support tickets.</p>
        )}
      </section>

      {/* Section 8: Customer Activity Log */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" /> Customer Activity Log
        </h2>
        {activityLog.length > 0 ? (
          <div className="space-y-2">
            {activityLog.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <Activity className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{entry.title}</p>
                  {entry.description && <p className="text-xs text-slate-400">{entry.description}</p>}
                  <p className="text-xs text-slate-500 mt-1">{formatDateTime(entry.createdAt)}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{entry.activityType}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No activity log entries.</p>
        )}
      </section>

      {/* Section 9: Platform Notes (internal, owner-only) */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-yellow-400" /> Platform Notes (Internal)
        </h2>

        {/* Inline Add Note Form */}
        <div className="mb-4 bg-slate-800/60 border border-slate-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Add a Note</label>
          <textarea
            value={inlineNoteText}
            onChange={e => setInlineNoteText(e.target.value)}
            placeholder="Enter an internal note about this workspace..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              className="bg-yellow-700 hover:bg-yellow-600 text-white"
              disabled={!inlineNoteText.trim() || addInlineNote.isPending}
              onClick={() => addInlineNote.mutate({ workspaceId: workspace.id, note: inlineNoteText })}
            >
              {addInlineNote.isPending ? "Saving..." : "Add Note"}
            </Button>
          </div>
        </div>

        {/* Existing Notes */}
        {workspace.platformNotes?.length > 0 ? (
          <div className="space-y-3">
            {workspace.platformNotes.map((n: any) => (
              <div key={n.id} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200">{n.note}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Added by admin #{n.createdBy} on {formatDateTime(n.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this note? This cannot be undone.")) {
                      deleteNote.mutate({ noteId: n.id });
                    }
                  }}
                  disabled={deleteNote.isPending}
                  className="shrink-0 p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No platform notes yet.</p>
        )}
      </section>

      {/* Section 10: Admin Overrides / Recovery */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" /> Admin Overrides / Recovery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setShowOverrideDialog("resetOnboarding")}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:border-purple-500 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-sm font-medium text-white">Reset Onboarding</p>
            <p className="text-xs text-slate-400 mt-1">Force workspace back to onboarding flow.</p>
          </button>
          <button
            onClick={() => setShowOverrideDialog("resetTrial")}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:border-purple-500 transition-colors"
          >
            <Clock className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-sm font-medium text-white">Reset Trial</p>
            <p className="text-xs text-slate-400 mt-1">Allow workspace to use trial again.</p>
          </button>
          <button
            onClick={() => setShowOverrideDialog("transferOwnership")}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:border-purple-500 transition-colors"
          >
            <Users className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-sm font-medium text-white">Transfer Ownership</p>
            <p className="text-xs text-slate-400 mt-1">Change workspace owner to another user.</p>
          </button>
          <button
            onClick={() => { toast.info("Plan change requires Stripe integration. Configure in Platform Admin \u203a Integrations."); }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:border-purple-500 transition-colors"
          >
            <CreditCard className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-sm font-medium text-white">Change Plan</p>
            <p className="text-xs text-slate-400 mt-1">Override workspace plan assignment.</p>
          </button>
        </div>
      </section>

      {/* Section 11: Audit Log Timeline */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-400" /> Audit Log
        </h2>
        {workspace.auditLog?.length > 0 ? (
          <div className="space-y-2">
            {workspace.auditLog.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg">
                <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{entry.action}</p>
                  {entry.reason && <p className="text-sm text-slate-400">{entry.reason}</p>}
                  <p className="text-xs text-slate-500 mt-1">
                    By admin #{entry.performedBy} at {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No audit entries.</p>
        )}
      </section>

      {/* ===== DIALOGS ===== */}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Workspace</DialogTitle></DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Company Name</label>
                <Input value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)} placeholder="Company name..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Contracting Model</label>
                <select
                  value={editContractingModel}
                  onChange={(e) => setEditContractingModel(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Select —</option>
                  <option value="prime">Prime Contractor</option>
                  <option value="sub">Subcontractor</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Onboarding Status</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditOnboarding(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${editOnboarding === true ? "bg-green-900/50 border-green-600 text-green-300" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}>
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                  <button type="button" onClick={() => setEditOnboarding(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${editOnboarding === false ? "bg-yellow-900/50 border-yellow-600 text-yellow-300" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}>
                    Incomplete
                  </button>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button disabled={updateWorkspace.isPending} onClick={handleEdit}>
              {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Suspend Workspace</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="text-slate-300 mb-4">
              Suspending <strong>{workspace.companyName || workspace.name}</strong> will prevent all users from accessing it.
            </p>
            <label className="block text-sm font-medium text-slate-200 mb-1">Reason (required for audit log)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for suspension..." rows={3} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!reason.trim() || suspendWorkspace.isPending}
              onClick={() => suspendWorkspace.mutate({ id: workspace.id, reason })}>
              {suspendWorkspace.isPending ? "Suspending..." : "Confirm Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reactivate Workspace</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="text-slate-300 mb-4">
              Reactivate <strong>{workspace.companyName || workspace.name}</strong>? Users will regain access.
            </p>
            <label className="block text-sm font-medium text-slate-200 mb-1">Reason (required for audit log)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for reactivation..." rows={3} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>Cancel</Button>
            <Button disabled={!reason.trim() || reactivateWorkspace.isPending}
              onClick={() => reactivateWorkspace.mutate({ id: workspace.id, reason })}>
              {reactivateWorkspace.isPending ? "Reactivating..." : "Confirm Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Platform Note</DialogTitle></DialogHeader>
          <DialogBody>
            <label className="block text-sm font-medium text-slate-200 mb-1">Note</label>
            <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter note about this workspace..." rows={4} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button disabled={!noteText.trim() || addNote.isPending}
              onClick={() => addNote.mutate({ workspaceId: workspace.id, note: noteText })}>
              {addNote.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Health Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Health Flag</DialogTitle></DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Title</label>
                <Input value={flagTitle} onChange={(e) => setFlagTitle(e.target.value)} placeholder="Flag title..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Severity</label>
                <select value={flagSeverity} onChange={(e) => setFlagSeverity(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description (optional)</label>
                <Textarea value={flagDescription} onChange={(e) => setFlagDescription(e.target.value)} placeholder="Additional details..." rows={3} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>Cancel</Button>
            <Button disabled={!flagTitle.trim() || createFlag.isPending}
              onClick={() => createFlag.mutate({ workspaceId, flagType: "manual", severity: flagSeverity, title: flagTitle, description: flagDescription || undefined })}>
              {createFlag.isPending ? "Creating..." : "Create Flag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={!!showOverrideDialog} onOpenChange={() => setShowOverrideDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showOverrideDialog === "resetOnboarding" ? "Reset Onboarding" :
               showOverrideDialog === "resetTrial" ? "Reset Trial" :
               showOverrideDialog === "transferOwnership" ? "Transfer Ownership" : "Override"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-slate-300 mb-4">
              {showOverrideDialog === "resetOnboarding" && "This will force the workspace back to the onboarding flow. The owner will need to complete setup again."}
              {showOverrideDialog === "resetTrial" && "This will allow the workspace to use a trial period again."}
              {showOverrideDialog === "transferOwnership" && "Enter the new owner's user ID and a reason for the transfer."}
            </p>
            <label className="block text-sm font-medium text-slate-200 mb-1">Reason (required for audit log)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." rows={3} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowOverrideDialog(null); setReason(""); }}>Cancel</Button>
            <Button disabled={!reason.trim()} onClick={() => {
              if (showOverrideDialog === "resetOnboarding") resetOnboarding.mutate({ workspaceId, reason });
              else if (showOverrideDialog === "resetTrial") resetTrial.mutate({ workspaceId, reason });
              else if (showOverrideDialog === "transferOwnership") {
                toast.info("Ownership transfer requires target user selection. Use the Ownership Recovery page for managed transfers.");
                setShowOverrideDialog(null);
              }
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
