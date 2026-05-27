// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Eye, Plus, Copy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/hooks/use-toast";

export default function ExternalViewer() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const { data: invites = [], refetch } = trpc.invites.list.useQuery();
  const createMutation = trpc.invites.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setEmail("");
      toast({ title: "Viewer invited", description: "An invitation has been sent." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to send invite", variant: "destructive" });
    },
  });

  const viewerInvites = (invites as any[]).filter((inv) => inv.role === "viewer");

  const handleInvite = () => {
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    createMutation.mutate({ email: email.trim(), role: "viewer" });
  };

  return (
    <PageLayout title="External Viewers" subtitle="Grant read-only access to external stakeholders" label="Access Control"
      actions={<Button onClick={() => setShowForm(true)} className="bg-white text-blue-900 hover:bg-blue-50"><Plus className="h-4 w-4 mr-2" />Invite Viewer</Button>}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {viewerInvites.length === 0 ? (
          <Card className="p-12 text-center">
            <Eye className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No External Viewers</h3>
            <p className="text-gray-500 mb-4">Invite external stakeholders to view specific contracts or proposals without full access.</p>
            <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Invite First Viewer</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {viewerInvites.map((viewer) => (
              <Card key={viewer.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center"><Eye className="h-4 w-4 text-purple-600" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{viewer.email}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">{viewer.status}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(viewer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Invite Viewer Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite External Viewer</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="viewer@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleInvite} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
