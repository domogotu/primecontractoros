import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Trash2, Shield, Eye, User, Mail, RefreshCw, XCircle, Briefcase, DollarSign, Copy } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  owner: { label: "Owner", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Shield },
  admin: { label: "Admin", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Shield },
  contract_manager: { label: "Contract Mgr", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", icon: Briefcase },
  finance_user: { label: "Finance", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: DollarSign },
  member: { label: "Member", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: User },
  viewer: { label: "Viewer", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Eye },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: "Full workspace control — settings, billing, members, all data",
  admin: "Manage most workspace records and users; cannot change workspace settings",
  contract_manager: "Manage opportunities, proposals, contracts, requirements, deliverables, deadlines, files, subcontractors, closeout",
  finance_user: "Manage invoices, payments, finance reports, financial files",
  member: "Operational access — create and edit records as allowed",
  viewer: "Read-only access — cannot create, edit, or delete anything",
};

const ASSIGNABLE_ROLES = ["admin", "contract_manager", "finance_user", "member", "viewer"] as const;

export default function WorkspaceTeam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInviteEmail, setPendingInviteEmail] = useState("");
  const [pendingInviteRole, setPendingInviteRole] = useState<string>("member");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const { data: myRole } = trpc.workspace.getMyRole.useQuery();
  const { data: members, refetch } = trpc.workspace.listMembers.useQuery();
  const { data: pendingInvites, refetch: refetchInvites } = trpc.inviteWorkflow.list.useQuery();

  const inviteMutation = trpc.workspace.inviteMember.useMutation({
    onSuccess: (data: any) => {
      toast({ title: "Member added", description: `${data.userName || data.email} has been added as ${inviteRole}.` });
      setInviteEmail("");
      refetch();
    },
    onError: (err: any) => {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    },
  });

  const createInviteMutation = trpc.inviteWorkflow.create.useMutation({
    onSuccess: (data: any) => {
      toast({ title: "Invite sent", description: "A pending invitation has been created. Link copied to clipboard." });
      setPendingInviteEmail("");
      refetchInvites();
      const link = `${window.location.origin}/invite/accept/${data.token}`;
      navigator.clipboard.writeText(link).catch(() => {});
    },
    onError: (err: any) => {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    },
  });

  const revokeInviteMutation = trpc.inviteWorkflow.revoke.useMutation({
    onSuccess: () => {
      toast({ title: "Invite revoked" });
      refetchInvites();
    },
    onError: (err: any) => {
      toast({ title: "Revoke failed", description: err.message, variant: "destructive" });
    },
  });

  const resendInviteMutation = trpc.inviteWorkflow.resend.useMutation({
    onSuccess: (data: any) => {
      toast({ title: "Invite resent", description: "New invite link generated and copied." });
      const link = `${window.location.origin}/invite/accept/${data.token}`;
      navigator.clipboard.writeText(link).catch(() => {});
      refetchInvites();
    },
    onError: (err: any) => {
      toast({ title: "Resend failed", description: err.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => {
      toast({ title: "Role updated" });
      refetch();
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const removeMutation = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      toast({ title: "Member removed" });
      refetch();
    },
    onError: (err: any) => {
      toast({ title: "Remove failed", description: err.message, variant: "destructive" });
    },
  });

  const canManage = myRole?.role === "owner" || myRole?.role === "admin";

  async function handleDirectAdd() {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await inviteMutation.mutateAsync({ email: inviteEmail.trim(), role: inviteRole as any });
    } finally {
      setIsInviting(false);
    }
  }

  async function handleSendInvite() {
    if (!pendingInviteEmail.trim()) return;
    setIsSendingInvite(true);
    try {
      await createInviteMutation.mutateAsync({ email: pendingInviteEmail.trim(), role: pendingInviteRole as any });
    } finally {
      setIsSendingInvite(false);
    }
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/invite/accept/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({ title: "Link copied", description: "Invite link copied to clipboard." });
    }).catch(() => {
      toast({ title: "Copy failed", variant: "destructive" });
    });
  }

  const pendingCount = (pendingInvites || []).filter((inv: any) => inv.status === "pending").length;

  return (
    <PageLayout
      label="Administration"
      title="Team & Roles"
      subtitle="Manage workspace members, assign roles, and send invitations."
      summaryCards={[
        { label: "Members", value: (members ?? []).length },
        { label: "Pending Invites", value: pendingCount },
      ]}
    >
      {/* Role reference card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => {
              const meta = ROLE_LABELS[role];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <div key={role} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <Badge variant="outline" className={`text-xs mb-1 ${meta.color}`}>
                      {meta.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite / Add section — only visible to owner/admin */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Add or Invite Team Members
            </CardTitle>
            <CardDescription>
              Add existing users directly, or send a pending invite link to anyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="invite" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="invite">Send Invite Link</TabsTrigger>
                <TabsTrigger value="direct">Add Existing User</TabsTrigger>
              </TabsList>

              <TabsContent value="invite">
                <div className="flex gap-3 flex-wrap">
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    value={pendingInviteEmail}
                    onChange={(e) => setPendingInviteEmail(e.target.value)}
                    className="flex-1 min-w-[220px]"
                    onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                  />
                  <Select value={pendingInviteRole} onValueChange={setPendingInviteRole}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]?.label || r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSendInvite} disabled={isSendingInvite || !pendingInviteEmail.trim()}>
                    <Mail className="h-4 w-4 mr-2" />
                    {isSendingInvite ? "Sending\u2026" : "Send Invite"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Creates a pending invite. The recipient will need to log in and accept the invite link.
                </p>
              </TabsContent>

              <TabsContent value="direct">
                <div className="flex gap-3 flex-wrap">
                  <Input
                    placeholder="colleague@example.com"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 min-w-[220px]"
                    onKeyDown={(e) => e.key === "Enter" && handleDirectAdd()}
                  />
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]?.label || r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleDirectAdd} disabled={isInviting || !inviteEmail.trim()}>
                    {isInviting ? "Adding\u2026" : "Add Member"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  The person must already have a PrimeContractorOS account with this email.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites */}
      {canManage && pendingInvites && pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Pending Invites ({pendingInvites.filter((i: any) => i.status === "pending").length})
            </CardTitle>
            <CardDescription>Invitations that have not yet been accepted.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {pendingInvites.map((inv: any) => {
                const roleMeta = ROLE_LABELS[inv.role] || ROLE_LABELS.member;
                const isPending = inv.status === "pending";
                const isExpired = inv.status === "expired";
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.status === "pending" && "Pending"}
                        {inv.status === "accepted" && "Accepted"}
                        {inv.status === "expired" && "Expired"}
                        {inv.status === "revoked" && "Revoked"}
                        {inv.expiresAt && isPending && ` \u2014 expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${roleMeta.color}`}>
                      {roleMeta.label}
                    </Badge>
                    {(isPending || isExpired) && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Copy invite link"
                          onClick={() => copyInviteLink(inv.token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Resend invite"
                          onClick={() => resendInviteMutation.mutate({ id: inv.id })}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        {isPending && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Revoke invite"
                            onClick={() => revokeInviteMutation.mutate({ id: inv.id })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Current Members ({members?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!members || members.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No team members yet. Add someone above.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map((m: any) => {
                const meta = ROLE_LABELS[m.role] ?? ROLE_LABELS.member;
                const Icon = meta.icon;
                const isMe = m.userId === user?.id;
                const isOwnerRow = m.role === "owner";

                return (
                  <div
                    key={`${m.userId}-${m.id}`}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    {/* Avatar placeholder */}
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {(m.userName || m.userEmail || "?")[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Name / email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {m.userName || m.userEmail || "Unknown"}
                        {isMe && (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        )}
                      </p>
                      {m.userName && (
                        <p className="text-xs text-muted-foreground truncate">{m.userEmail}</p>
                      )}
                    </div>

                    {/* Role badge / selector */}
                    {canManage && !isOwnerRow ? (
                      <Select
                        value={m.role}
                        onValueChange={(newRole) =>
                          updateRoleMutation.mutate({ memberId: m.id, role: newRole as any })
                        }
                      >
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]?.label || r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={`text-xs ${meta.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {meta.label}
                      </Badge>
                    )}

                    {/* Remove button */}
                    {canManage && !isOwnerRow && !isMe && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {m.userName || m.userEmail} will lose access to this workspace immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMutation.mutate({ memberId: m.id })}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </PageLayout>
  );
}
