// @ts-nocheck
import React, { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { 
  Users as UsersIcon, 
  Shield, 
  UserCheck, 
  Mail, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  Trash2,
  Ban,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";



export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteMessage, setInviteMessage] = useState("");

  const { data: workspaceUsers = [], isLoading: isUsersLoading, refetch: refetchUsers } = trpc.workspace.listMembers.useQuery();
  const { data: invitesData = [], isLoading: isInvitesLoading, refetch: refetchInvites } = trpc.invites.list.useQuery();

  const users = workspaceUsers;
  const invites = invitesData;

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createInviteMutation = trpc.invites.create.useMutation({
    onSuccess: () => {
      toast({ title: "Invitation Sent", description: `Invited ${inviteEmail} as ${inviteRole}` });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteMessage("");
      refetchInvites();
    },
    onError: (err) => toast({ title: "Failed to send invite", description: err.message, variant: "destructive" }),
  });
  const revokeInviteMutation = trpc.invites.revoke.useMutation({
    onSuccess: () => { toast({ title: "Invite revoked" }); refetchInvites(); },
    onError: (err) => toast({ title: "Failed to revoke", description: err.message, variant: "destructive" }),
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({ title: "Error", description: "Please enter an email address", variant: "destructive" });
      return;
    }
    createInviteMutation.mutate({ email: inviteEmail, role: inviteRole.toLowerCase() });
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Deactivated" : "Activated";
    toast({ title: "Status Updated", description: `User has been ${newStatus.toLowerCase()}` });
  };

  const handleRevokeInvite = (inviteId: number) => {
    revokeInviteMutation.mutate({ id: inviteId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case "Inactive":
      case "Deactivated":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
      case "Pending":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <PageLayout title="Team Members" subtitle="Manage workspace users, roles, and invitations.">
      <PageGuide
        title="Team Members"
        description="Manage workspace users, roles, and invitations."
        whenToUse="Use this page to add new team members, change their access levels, or deactivate users who no longer need access."
        whatToDoNext={[
          "Invite a new team member",
          "Review pending invitations",
          "Audit user roles and permissions"
        ]}
        relatedRecords={[
          { label: "Settings", path: "/app/settings" },
          { label: "Audit Log", path: "/app/audit-log" }
        ]}
      />

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <h3 className="text-2xl font-bold">{users.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <h3 className="text-2xl font-bold">{users.filter(u => u.role === "Admin").length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <h3 className="text-2xl font-bold">{users.filter(u => u.status === "Active").length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Mail className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <h3 className="text-2xl font-bold">{invites.length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="colleague@example.com" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin (Full access)</SelectItem>
                          <SelectItem value="Member">Member (Standard access)</SelectItem>
                          <SelectItem value="Viewer">Viewer (Read-only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Welcome to the team!" 
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite}>Send Invitation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Last Login</div>
                <div className="col-span-2">Joined</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-muted/50 transition-colors">
                      <div className="col-span-3">
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                      </div>
                      <div className="col-span-2">
                        <Select defaultValue={user.role} onValueChange={(val) => handleChangeRole(user.id, val)}>
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="col-span-2 text-muted-foreground">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                      <div className="col-span-2 text-muted-foreground">
                        {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                      <div className="col-span-1 flex justify-end space-x-2">
                        {user.status === "Active" ? (
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(user.id, user.status)} title="Deactivate">
                            <Ban className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(user.id, user.status)} title="Reactivate">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground hover:text-green-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No users found matching your search.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Email</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Sent Date</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y divide-border">
                  {invites.map((invite: any) => (
                    <div key={invite.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-muted/50 transition-colors">
                      <div className="col-span-4 font-medium text-foreground">{invite.email}</div>
                      <div className="col-span-3 text-muted-foreground">{invite.role}</div>
                      <div className="col-span-2">
                        {getStatusBadge(invite.status)}
                      </div>
                      <div className="col-span-2 text-muted-foreground">
                        {new Date(invite.sentAt).toLocaleDateString()}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleRevokeInvite(invite.id)} title="Revoke Invite">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
