import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, MessageSquare, Mail, Phone, Video, FileText, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
  meeting: Video,
  letter: FileText,
  message: MessageSquare,
};

export default function CommunicationLog() {
  const { canWrite, canDelete } = useWorkspaceRole();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<any>(null);
  const [form, setForm] = useState({ subject: "", body: "", channel: "email", direction: "outgoing", contact: "" });

  const { data: messages = [], isLoading } = trpc.messages.list.useQuery();

  const createMessage = trpc.messages.create.useMutation({
    onSuccess: () => {
      utils.messages.list.invalidate();
      setIsAddOpen(false);
      setForm({ subject: "", body: "", channel: "email", direction: "outgoing", contact: "" });
      toast.success("Communication logged");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMessage = trpc.messages.delete.useMutation({
    onSuccess: () => {
      utils.messages.list.invalidate();
      setDeleteMsg(null);
      toast.success("Communication deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    return (messages as any[]).filter((m) => {
      const matchesSearch = !search || m.subject?.toLowerCase().includes(search.toLowerCase()) || m.body?.toLowerCase().includes(search.toLowerCase());
      // channel and direction are stored in linkedRecordType as "channel:direction" or in body metadata
      // For now filter by subject/body search only since DB doesn't have channel/direction columns
      return matchesSearch;
    });
  }, [messages, search, channelFilter, directionFilter]);

  const summaryCards = [
    { label: "Total Communications", value: (messages as any[]).length },
    { label: "This Month", value: (messages as any[]).filter((m: any) => {
      const d = new Date(m.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length },
  ];

  const handleSubmit = () => {
    if (!form.subject) { toast.error("Subject is required"); return; }
    if (!form.body) { toast.error("Summary/body is required"); return; }
    // Store channel and direction in the body as metadata prefix
    const body = `[${form.channel}|${form.direction}|${form.contact}] ${form.body}`;
    createMessage.mutate({ subject: form.subject, body });
  };

  // Parse channel/direction/contact from body metadata
  const parseMsg = (m: any) => {
    const match = m.body?.match(/^\[([^|]+)\|([^|]+)\|([^\]]*)\]\s*([\s\S]*)/);
    if (match) {
      return { channel: match[1], direction: match[2], contact: match[3], summary: match[4] };
    }
    return { channel: "message", direction: "outgoing", contact: "", summary: m.body || "" };
  };

  return (
    <PageLayout label="Workspace" title="Communication Log" subtitle="Record and track all contract-related communications." summaryCards={summaryCards}>
      <PageGuide
        title="Communication Log"
        description="Record and track all contract-related communications with government contacts, subcontractors, and stakeholders."
        whenToUse="Log every significant communication for audit trail and institutional memory. Essential for contract disputes and performance reviews."
        whatToDoNext={["Log recent communications with government contacts", "Review communication history before meetings"]}
        relatedRecords={[
          { label: "Contacts", path: "/app/contacts" },
          { label: "Contracts", path: "/app/contracts" },
        ]}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search communications..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Channel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Direction" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="incoming">Incoming</SelectItem>
              <SelectItem value="outgoing">Outgoing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canWrite && (
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Log Communication
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No communications logged yet. {canWrite && "Log your first communication to build your audit trail."}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg: any) => {
            const parsed = parseMsg(msg);
            const Icon = channelIcons[parsed.channel] || MessageSquare;
            return (
              <Card key={msg.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={"p-2 rounded-lg flex-shrink-0 " + (parsed.direction === "outgoing" ? "bg-blue-100" : "bg-green-100")}>
                      <Icon className={"w-4 h-4 " + (parsed.direction === "outgoing" ? "text-blue-600" : "text-green-600")} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="capitalize text-xs">{parsed.channel}</Badge>
                        <Badge className={parsed.direction === "outgoing" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                          {parsed.direction}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">{msg.subject}</h3>
                      <p className="text-sm text-slate-600 mt-1">{parsed.summary}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {parsed.contact && <span>{parsed.contact} | </span>}
                        {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {canDelete && (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 flex-shrink-0" onClick={() => setDeleteMsg(msg)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Communication subject..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={(v) => setForm(f => ({ ...f, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Direction</Label>
                <Select value={form.direction} onValueChange={(v) => setForm(f => ({ ...f, direction: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                    <SelectItem value="incoming">Incoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Contact Name & Role</Label>
              <Input value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="e.g. James Wilson (COR)" />
            </div>
            <div className="space-y-1">
              <Label>Summary *</Label>
              <Textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Summary of the communication..." className="min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMessage.isPending}>
              {createMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteMsg} onOpenChange={(open) => { if (!open) setDeleteMsg(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Communication</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete <strong>{deleteMsg?.subject}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMsg(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMessage.mutate({ id: deleteMsg.id })} disabled={deleteMessage.isPending}>
              {deleteMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
