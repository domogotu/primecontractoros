import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, MessageSquare, Mail, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";

export default function Messages() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    subject: "", body: "", linkedRecordType: "none", linkedRecordId: "",
  });

  const { data: messages = [], isLoading, refetch } = trpc.messages.list.useQuery();
  const { data: opportunities = [] } = trpc.opportunities.list.useQuery();
  const { data: proposals = [] } = trpc.proposals.list.useQuery();
  const { data: contractsList = [] } = trpc.contracts.list.useQuery();
  const createMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ subject: "", body: "", linkedRecordType: "none", linkedRecordId: "" });
    },
  });
  const deleteMutation = trpc.messages.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (messages as any[]).filter((m) =>
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecordOptions = () => {
    if (form.linkedRecordType === "opportunity") return (opportunities as any[]).map((o) => ({ id: o.id, title: o.title }));
    if (form.linkedRecordType === "proposal") return (proposals as any[]).map((p) => ({ id: p.id, title: p.title }));
    if (form.linkedRecordType === "contract") return (contractsList as any[]).map((c) => ({ id: c.id, title: c.title }));
    return [];
  };

  const getLinkedRecordName = (type: string, id: number) => {
    if (type === "opportunity") return (opportunities as any[]).find((o) => o.id === id)?.title || `Opportunity #${id}`;
    if (type === "proposal") return (proposals as any[]).find((p) => p.id === id)?.title || `Proposal #${id}`;
    if (type === "contract") return (contractsList as any[]).find((c) => c.id === id)?.title || `Contract #${id}`;
    return `${type} #${id}`;
  };

  const handleCreate = () => {
    if (!form.subject || !form.body) return;
    createMutation.mutate({
      subject: form.subject,
      body: form.body,
      linkedRecordType: form.linkedRecordType !== "none" ? form.linkedRecordType : undefined,
      linkedRecordId: form.linkedRecordId ? parseInt(form.linkedRecordId) : undefined,
    });
  };

  return (
    <PageLayout
      title="Correspondence & Messages"
      subtitle="Track communications with contracting officers, agency representatives, and team members"
      label="Communications"
      summaryCards={[
        { label: "Total Messages", value: messages.length },
        { label: "This Week", value: (messages as any[]).filter((m) => {
          const d = new Date(m.createdAt);
          const now = new Date();
          return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Message
        </Button>
      }
    >
      <PageGuide
        title="Messages & Communication"
        description="Communication log for all record-linked messages and correspondence."
        whenToUse="When logging communications, tracking follow-ups, or reviewing message history."
        whatToDoNext={["Log important communications", "Link messages to contracts or proposals", "Follow up on unanswered messages", "Review communication timeline"]}
        relatedRecords={[{ label: "Contacts", path: "/app/contacts" }, { label: "Contracts", path: "/app/contracts" }, { label: "Tasks", path: "/app/tasks" }]}
      />
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Correspondence</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Subject *" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Message body * (e.g., correspondence with CO, agency communication, internal note)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="md:col-span-2 border-t pt-3 mt-1">
              <label className="block text-xs font-medium text-gray-600 mb-2">Link to Record</label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.linkedRecordType} onValueChange={(v) => setForm({ ...form, linkedRecordType: v, linkedRecordId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Record type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Link</SelectItem>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                {form.linkedRecordType !== "none" && (
                  <Select value={form.linkedRecordId} onValueChange={(v) => setForm({ ...form, linkedRecordId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select record" /></SelectTrigger>
                    <SelectContent>
                      {getRecordOptions().map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
                    </DialogBody>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Sending..." : "Save Message"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search correspondence..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading messages...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Correspondence Recorded</h3>
          <p className="text-gray-600 mb-6">Log communications with contracting officers, agency representatives, subcontractors, and team members. Link messages to specific opportunities, proposals, or contracts.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Record First Message
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg: any) => (
            <Card key={msg.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{msg.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {msg.linkedRecordType && msg.linkedRecordId && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {getLinkedRecordName(msg.linkedRecordType, msg.linkedRecordId)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: msg.id })}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
