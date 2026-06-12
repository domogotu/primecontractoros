import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, AlertCircle, Bell, ListTodo } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Alerts() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ title: "", message: "", type: "info", linkedRecordId: "" });

  const { data: alerts = [], isLoading, refetch } = trpc.alerts.list.useQuery();
  const createMutation = trpc.alerts.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ title: "", message: "", type: "info", linkedRecordId: "" }); } });
  const dismissMutation = trpc.alerts.dismiss.useMutation({ onSuccess: () => refetch() });
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created from alert");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const convertToTask = (alert: any) => {
    createTaskMutation.mutate({
      title: alert.title,
      description: alert.message || "Created from alert",
      priority: alert.type === "critical" ? "high" : alert.type === "warning" ? "medium" : "low",
      linkedRecordType: alert.linkedRecordType || undefined,
      linkedRecordId: alert.linkedRecordId || undefined,
    });
    dismissMutation.mutate({ id: alert.id });
  };

  const filtered = (alerts as any[]).filter((a) =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.title) return;
    createMutation.mutate({
      title: form.title,
      message: form.message || undefined,
      type: form.type,
      linkedRecordId: form.linkedRecordId ? parseInt(form.linkedRecordId) : undefined,
    } as any);
  };

  const typeColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <PageLayout
      title="Alerts"
      subtitle="Track important alerts and notifications"
      label="Notifications"
      summaryCards={[
        { label: "Total Alerts", value: alerts.length },
        { label: "Critical", value: (alerts as any[]).filter((a) => a.type === "critical").length, color: "text-red-600" },
        { label: "Warnings", value: (alerts as any[]).filter((a) => a.type === "warning").length, color: "text-amber-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Alert
        </Button>
      }
    >
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Alert</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <input placeholder="Linked Record ID (optional)" value={form.linkedRecordId} onChange={(e) => setForm({ ...form, linkedRecordId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
                    </DialogBody>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Adding..." : "Add Alert"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search alerts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading alerts...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Alerts</h3>
          <p className="text-gray-600 mb-6">Create alerts to track important events and deadlines.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Alert
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert: any) => (
            <Card key={alert.id} className={`border-l-4 p-4 flex justify-between items-start ${typeColors[alert.type] || typeColors.info}`}>
              <div className="flex gap-3 flex-1">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  {alert.message && <p className="text-sm mt-1">{alert.message}</p>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => convertToTask(alert)} title="Convert to Task">
                  <ListTodo className="h-4 w-4 text-blue-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => dismissMutation.mutate({ id: alert.id })} title="Dismiss">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
          <PageGuidancePanel
        pageKey="alerts"
        title="Alerts Help"
        description="Workspace attention items. Alerts are generated when action is needed — missing information, approaching deadlines, unmatched payments, or AI findings needing review."
        whatToDoNext={["Address high-priority alerts first", "Dismiss resolved alerts", "Follow links to take action on each alert", "Check regularly for new system-generated alerts"]}
        helpArticleSlug="what-is-primecontractoros"
        glossaryTerms={["ai-suggestion"]}
      />
    </PageLayout>
  );
}
