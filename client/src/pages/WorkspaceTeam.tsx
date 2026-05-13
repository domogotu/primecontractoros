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
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Trash2, Shield, Eye, User } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  owner: { label: "Owner", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Shield },
  admin: { label: "Admin", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Shield },
  member: { label: "Member", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: User },
  viewer: { label: "Viewer", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Eye },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: "Full control — can manage all settings, members, and data",
  admin: "Can create, edit, and delete records; cannot manage workspace settings",
  member: "Can create and edit records; cannot delete",
  viewer: "Read-only access — cannot create, edit, or delete anything",
};

export default function WorkspaceTeam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [isInviting, setIsInviting] = useState(false);

  const { data: myRole } = trpc.workspace.getMyRole.useQuery();
  const { data: members, refetch } = trpc.workspace.listMembers.useQuery();

  const inviteMutation = trpc.workspace.inviteMember.useMutation({
    onSuccess: (data) => {
      toast({ title: "Member added", description: `${data.userName || data.email} has been added as ${inviteRole}.` });
      setInviteEmail("");
      refetch();
    },
    onError: (err) => {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => {
      toast({ title: "Role updated" });
      refetch();
    },
    onError: (err) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const removeMutation = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      toast({ title: "Member removed" });
      refetch();
    },
    onError: (err) => {
      toast({ title: "Remove failed", description: err.message, variant: "destructive" });
    },
  });

  const isOwner = myRole?.role === "owner";

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await inviteMutation.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <PageLayout
        label="Administration"
        title="Team & Roles"
        subtitle="Manage workspace members and assign roles to control access levels."
        summaryCards={[{ label: "Members", value: (members ?? []).length }]}
      >
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team Members
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage who has access to your workspace and what they can do.
        </p>
      </div>

      {/* Role reference card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => {
              const meta = ROLE_LABELS[role];
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

      {/* Invite form — only visible to owner */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Add Team Member
            </CardTitle>
            <CardDescription>
              The person must already have a PrimeContractorOS account. Enter their registered email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Input
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 min-w-[220px]"
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                {isInviting ? "Adding…" : "Add Member"}
              </Button>
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
              {members.map((m) => {
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
                    {isOwner && !isOwnerRow ? (
                      <Select
                        value={m.role}
                        onValueChange={(newRole) =>
                          updateRoleMutation.mutate({ memberId: m.id, role: newRole as any })
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={`text-xs ${meta.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {meta.label}
                      </Badge>
                    )}

                    {/* Remove button */}
                    {isOwner && !isOwnerRow && (
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
