import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, User, Shield, Clock, Mail, Building2,
  Ban, CheckCircle2, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function PlatformUserDetailPage() {
  const [location, navigate] = useLocation();
  const userId = parseInt(location.split("/platform/users/")[1] || "0");

  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [reason, setReason] = useState("");

  const { data: user, isLoading, refetch } = trpc.platformAdmin.users.get.useQuery(
    { id: userId },
    { enabled: userId > 0 }
  );

  const disableUser = trpc.platformAdmin.users.disable.useMutation({
    onSuccess: () => { refetch(); setShowDisableDialog(false); setReason(""); toast.success("User account disabled."); },
    onError: (e) => toast.error(e.message),
  });
  const enableUser = trpc.platformAdmin.users.enable.useMutation({
    onSuccess: () => { refetch(); setShowEnableDialog(false); setReason(""); toast.success("User account enabled."); },
    onError: (e) => toast.error(e.message),
  });

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString() : "—";
  const formatDateTime = (d: any) => d ? new Date(d).toLocaleString() : "—";

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/platform/users")} className="text-slate-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
        <div className="text-center py-12 text-slate-400">
          <p>User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/platform/users")} className="text-slate-300">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-white truncate">
            {user.name || "Unnamed User"}
          </h1>
          <p className="text-slate-400 text-sm">User ID: {user.id} — Joined: {formatDate(user.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={
            user.accountStatus === "active" ? "bg-green-900/50 text-green-300 border-green-700" :
            user.accountStatus === "disabled" ? "bg-red-900/50 text-red-300 border-red-700" :
            user.accountStatus === "suspended" ? "bg-orange-900/50 text-orange-300 border-orange-700" :
            "bg-slate-700 text-slate-300"
          }>
            {user.accountStatus || "active"}
          </Badge>
          <Badge className={user.role === "admin" ? "bg-purple-900/50 text-purple-300" : "bg-slate-700 text-slate-300"}>
            {user.role}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {user.accountStatus !== "disabled" && user.role !== "admin" && (
          <Button variant="destructive" size="sm" onClick={() => setShowDisableDialog(true)}>
            <Ban className="w-4 h-4 mr-1" /> Disable Account
          </Button>
        )}
        {user.accountStatus === "disabled" && (
          <Button size="sm" onClick={() => setShowEnableDialog(true)} className="bg-green-700 hover:bg-green-600 text-white">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Enable Account
          </Button>
        )}
        {user.workspace && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/platform/workspaces/${user.workspace!.id}`)} className="border-slate-600 text-slate-200 hover:bg-slate-700">
            <Building2 className="w-4 h-4 mr-1" /> View Workspace
          </Button>
        )}
      </div>

      {/* User Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase mb-1">Contact</p>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-white truncate">{user.email || "No email"}</p>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-slate-300">{user.name || "—"}</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase mb-1">Workspace</p>
          {user.workspace ? (
            <>
              <p className="text-sm text-white">{user.workspace.companyName || user.workspace.name}</p>
              <p className="text-xs text-slate-400">ID: {user.workspace.id} — Status: {user.workspace.status}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">No workspace associated.</p>
          )}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase mb-1">Authentication</p>
          <p className="text-sm text-white">Last signed in: {formatDateTime(user.lastSignedIn)}</p>
          <p className="text-xs text-slate-400 mt-1">Open ID: {user.openId || "—"}</p>
        </div>
      </div>

      {/* Login History */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" /> Login History (Last 50)
        </h2>
        {user.loginHistory?.length > 0 ? (
          <div className="border border-slate-700 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Date & Time</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Event Type</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Result</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300 hidden sm:table-cell">IP Address (Internet Protocol)</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300 hidden md:table-cell">Device</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-300">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {user.loginHistory.map((event: any) => (
                  <tr key={event.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-2 text-slate-300 text-xs">{formatDateTime(event.createdAt)}</td>
                    <td className="px-4 py-2 text-slate-200">{event.eventType || "login"}</td>
                    <td className="px-4 py-2">
                      <Badge className={event.success ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}>
                        {event.success ? "Success" : "Failed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-slate-400 hidden sm:table-cell text-xs">{event.ipAddress || "—"}</td>
                    <td className="px-4 py-2 text-slate-400 hidden md:table-cell text-xs truncate max-w-[150px]">{event.userAgent || "—"}</td>
                    <td className="px-4 py-2">
                      {event.suspiciousFlag && <Badge className="bg-red-900/50 text-red-300 text-xs">Suspicious</Badge>}
                      {event.failedAttempts > 0 && <span className="text-xs text-amber-400 ml-1">{event.failedAttempts} failures</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No login history available.</p>
        )}
      </section>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Disable User Account</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="text-slate-300 mb-4">
              Disabling <strong>{user.name || user.email}</strong> will prevent them from logging in.
            </p>
            <label className="block text-sm font-medium text-slate-200 mb-1">Reason (required for audit log)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for disabling..." rows={3} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!reason.trim() || disableUser.isPending}
              onClick={() => disableUser.mutate({ id: user.id, reason })}>
              {disableUser.isPending ? "Disabling..." : "Confirm Disable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enable User Account</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="text-slate-300 mb-4">
              Re-enable <strong>{user.name || user.email}</strong>? They will be able to log in again.
            </p>
            <label className="block text-sm font-medium text-slate-200 mb-1">Reason (required for audit log)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for enabling..." rows={3} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnableDialog(false)}>Cancel</Button>
            <Button disabled={!reason.trim() || enableUser.isPending}
              onClick={() => enableUser.mutate({ id: user.id, reason })}>
              {enableUser.isPending ? "Enabling..." : "Confirm Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
