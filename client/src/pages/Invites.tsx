import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Mail, Clock, CheckCircle2, XCircle, Loader2, Search, Trash2 } from "lucide-react";

export default function Invites() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invites = [], isLoading } = trpc.invites.list.useQuery();
  const utils = trpc.useUtils();

  const sendInvite = trpc.invites.create.useMutation({
    onSuccess: () => {
      utils.invites.list.invalidate();
      setShowInviteDialog(false);
      setEmail("");
      setRole("member");
      toast.success("Invitation sent successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const revokeInvite = trpc.invites.revoke.useMutation({
    onSuccess: () => {
      utils.invites.list.invalidate();
      toast.success("Invitation revoked");
    },
    onError: (err) => toast.error(err.message),
  });

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    accepted: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    revoked: { color: "bg-red-100 text-red-800", icon: XCircle },
    expired: { color: "bg-gray-100 text-gray-600", icon: Clock },
  };

  const filtered = invites.filter((inv: any) =>
    !searchTerm || inv.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: invites.length,
    pending: invites.filter((i: any) => i.status === "pending").length,
    accepted: invites.filter((i: any) => i.status === "accepted").length,
    revoked: invites.filter((i: any) => i.status === "revoked").length,
  };

  return (
    <PageLayout label="Team" title="Workspace Invites" subtitle="Manage team invitations and track pending access requests for your workspace.">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invites</h1>
          <p className="text-gray-500 text-sm mt-1">Manage workspace invitations</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} className="bg-blue-900 hover:bg-blue-800">
          <UserPlus className="w-4 h-4 mr-2" /> Send Invite
        </Button>
      </div>

      <PageGuide
        title="Workspace Invitations"
        description="Invite team members to join your workspace. Track invitation status and manage access."
        whenToUse="When you need to add new team members, check pending invitations, or revoke access."
        whatToDoNext={["Send invitations to new team members", "Follow up on pending invitations", "Revoke invitations that are no longer needed"]}
        relatedRecords={[{ label: "Users", path: "/app/users" }, { label: "Settings", path: "/app/settings" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Total Sent</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-400"><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p><p className="text-xs text-gray-500">Pending</p></CardContent></Card>
        <Card className="border-l-4 border-l-green-400"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{stats.accepted}</p><p className="text-xs text-gray-500">Accepted</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-400"><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{stats.revoked}</p><p className="text-xs text-gray-500">Revoked</p></CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by email..." className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{invites.length === 0 ? "No Invitations Yet" : "No Matching Invitations"}</h3>
          <p className="text-gray-500 mb-4">{invites.length === 0 ? "Send your first invitation to start building your team." : "Try adjusting your search."}</p>
          {invites.length === 0 && <Button onClick={() => setShowInviteDialog(true)}><UserPlus className="w-4 h-4 mr-2" /> Send First Invite</Button>}
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invite: any) => {
                const cfg = statusConfig[invite.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={invite.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{invite.email}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{invite.role}</Badge></td>
                    <td className="px-4 py-3"><Badge className={cfg.color}><StatusIcon className="w-3 h-3 mr-1" />{invite.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      {invite.status === "pending" && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => revokeInvite.mutate({ id: invite.id })}>
                          <Trash2 className="w-3 h-3 mr-1" /> Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Send Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Invitation</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" />
            </div>
            <div>
              <Label>Role</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button onClick={() => sendInvite.mutate({ email, role })} disabled={!email.trim() || sendInvite.isPending} className="bg-blue-900 hover:bg-blue-800">
              {sendInvite.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
