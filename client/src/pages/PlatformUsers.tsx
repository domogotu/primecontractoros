import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Users, Search, ExternalLink, Eye, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";

export default function PlatformUsersPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [reason, setReason] = useState("");

  const { data: users, isLoading, refetch } = trpc.platformAdmin.users.list.useQuery();
  const disableUser = trpc.platformAdmin.users.disable.useMutation({
    onSuccess: () => { refetch(); setShowDisableDialog(false); setReason(""); },
  });
  const enableUser = trpc.platformAdmin.users.enable.useMutation({
    onSuccess: () => { refetch(); setShowEnableDialog(false); setReason(""); },
  });

  const filteredUsers = users?.filter((u: any) => {
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.workspaceName || "").toLowerCase().includes(q)
    );
  }) || [];

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString() : "—";
  const formatDateTime = (d: any) => d ? new Date(d).toLocaleString() : "—";

  return (
    <div className="p-6 max-w-full pb-32">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Users</h1>
          <p className="text-slate-400 text-sm mt-1">All registered users across all workspaces</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {users?.length || 0} total users
        </Badge>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search by name, email, or workspace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Workspace</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Role</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Signup Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Last Login</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Last Activity</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Onboarding</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-900">
                  <td className="px-4 py-3 font-medium text-white">
                    <button onClick={() => navigate(`/platform/users/${u.id}`)} className="hover:text-blue-400 hover:underline">
                      {u.name || "—"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.email || "—"}</td>
                  <td className="px-4 py-3">
                    {u.workspaceName ? (
                      <button
                        onClick={() => u.workspaceId && navigate(`/platform/workspaces/${u.workspaceId}`)}
                        className="text-blue-600 hover:underline"
                      >
                        {u.workspaceName}
                      </button>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        u.accountStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : u.accountStatus === "disabled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {u.accountStatus || "active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDateTime(u.lastLogin)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDateTime(u.lastActivityAt)}</td>
                  <td className="px-4 py-3">
                    {u.onboardingCompleted ? (
                      <Badge className="bg-green-100 text-green-800">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/platform/activity?userId=${u.id}`)}
                        title="Review Activity"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {u.workspaceId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/platform/workspaces/${u.workspaceId}`)}
                          title="Open Workspace"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {u.accountStatus !== "disabled" && u.role !== "admin" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => { setSelectedUser(u); setShowDisableDialog(true); }}
                          title="Disable User"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : u.accountStatus === "disabled" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => { setSelectedUser(u); setShowEnableDialog(true); }}
                          title="Enable User"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Disable User Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable User</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-slate-300 mb-4">
              Are you sure you want to disable <strong>{selectedUser?.name || selectedUser?.email}</strong>?
              This will prevent them from logging in.
            </p>
            <label className="block text-sm font-medium text-slate-200 mb-1">Reason (required)</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for disabling this user..."
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || disableUser.isPending}
              onClick={() => selectedUser && disableUser.mutate({ id: selectedUser.id, reason })}
            >
              {disableUser.isPending ? "Disabling..." : "Disable User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable User Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable User</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-slate-300 mb-4">
              Re-enable <strong>{selectedUser?.name || selectedUser?.email}</strong>?
              This will restore their login access.
            </p>
            <label className="block text-sm font-medium text-slate-200 mb-1">Reason (required)</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for re-enabling this user..."
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnableDialog(false)}>Cancel</Button>
            <Button
              disabled={!reason.trim() || enableUser.isPending}
              onClick={() => selectedUser && enableUser.mutate({ id: selectedUser.id, reason })}
            >
              {enableUser.isPending ? "Enabling..." : "Enable User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
