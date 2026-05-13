import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Send, Eye, EyeOff, RefreshCw, Copy, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import PageLayout from "@/components/PageLayout";

export default function Webhooks() {
  const { toast } = useToast();
  const { canWrite } = useWorkspaceRole();
  const utils = trpc.useUtils();

  const { data: webhooksList, isLoading } = trpc.webhooks.list.useQuery();
  const { data: eventTypes } = trpc.webhooks.eventTypes.useQuery();

  const createMutation = trpc.webhooks.create.useMutation({
    onSuccess: (data) => {
      toast({ title: "Webhook created", description: `Signing secret: ${data.secret.substring(0, 12)}...` });
      utils.webhooks.list.invalidate();
      setCreateOpen(false);
      setNewUrl("");
      setNewDesc("");
      setSelectedEvents([]);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = trpc.webhooks.update.useMutation({
    onSuccess: () => {
      utils.webhooks.list.invalidate();
      toast({ title: "Webhook updated" });
    },
  });

  const deleteMutation = trpc.webhooks.delete.useMutation({
    onSuccess: () => {
      utils.webhooks.list.invalidate();
      toast({ title: "Webhook deleted" });
    },
  });

  const testMutation = trpc.webhooks.test.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Test successful", description: `Status: ${result.responseStatus}` });
      } else {
        toast({ title: "Test failed", description: `Status: ${result.responseStatus} - ${result.responseBody}`, variant: "destructive" });
      }
      utils.webhooks.list.invalidate();
    },
    onError: (err) => toast({ title: "Test error", description: err.message, variant: "destructive" }),
  });

  const regenMutation = trpc.webhooks.regenerateSecret.useMutation({
    onSuccess: (data) => {
      toast({ title: "Secret regenerated", description: `New secret: ${data.secret.substring(0, 12)}...` });
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showSecret, setShowSecret] = useState<Record<number, boolean>>({});

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
        label="Administration"
        title="Webhooks"
        subtitle="Register outbound webhook endpoints to receive real-time event notifications."
        summaryCards={[{ label: "Total", value: (webhooksList ?? []).length }, { label: "Active", value: (webhooksList ?? []).filter((w:any)=>w.active).length, color: "text-green-600" }]}
      >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure outbound webhooks to receive real-time notifications when events occur in your workspace.
          </p>
        </div>
        {canWrite && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Webhook</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
                <DialogDescription>
                  Configure a URL to receive HTTP POST requests when events occur.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Endpoint URL</Label>
                  <Input
                    placeholder="https://example.com/webhooks"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Production webhook"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Events</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {eventTypes?.map((et) => (
                      <label key={et.value} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(et.value)}
                          onChange={() => toggleEvent(et.value)}
                          className="rounded"
                        />
                        {et.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => createMutation.mutate({ url: newUrl, description: newDesc || undefined, events: selectedEvents })}
                  disabled={!newUrl || selectedEvents.length === 0 || createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Webhook"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {(!webhooksList || webhooksList.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No webhooks configured yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a webhook to receive real-time notifications for workspace events.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooksList.map((wh) => {
            const events: string[] = (() => { try { return JSON.parse(wh.events); } catch { return []; } })();
            const isExpanded = expandedId === wh.id;

            return (
              <Card key={wh.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{wh.url}</CardTitle>
                        {wh.description && (
                          <CardDescription>{wh.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={wh.isActive ? "default" : "secondary"}>
                        {wh.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {canWrite && (
                        <Switch
                          checked={wh.isActive}
                          onCheckedChange={(checked) =>
                            updateMutation.mutate({ id: wh.id, isActive: checked })
                          }
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {events.map((e) => (
                      <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {canWrite && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testMutation.mutate({ id: wh.id })}
                          disabled={testMutation.isPending}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          {testMutation.isPending ? "Sending..." : "Test"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Regenerate signing secret? The old secret will stop working.")) {
                              regenMutation.mutate({ id: wh.id });
                            }
                          }}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Regen Secret
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Delete this webhook?")) {
                              deleteMutation.mutate({ id: wh.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(isExpanded ? null : wh.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                      Deliveries
                    </Button>
                  </div>
                  {isExpanded && <WebhookDeliveries webhookId={wh.id} />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Documentation section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Webhook payloads are sent as HTTP POST with <code>Content-Type: application/json</code>.
            Each request includes these headers:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><code>X-Webhook-Event</code> — the event type (e.g., <code>contract.created</code>)</li>
            <li><code>X-Webhook-Signature</code> — HMAC-SHA256 signature: <code>sha256=&lt;hex&gt;</code></li>
            <li><code>X-Webhook-Timestamp</code> — ISO 8601 timestamp</li>
          </ul>
          <p>
            Verify the signature by computing <code>HMAC-SHA256(secret, body)</code> and comparing with the header value.
            Respond with a 2xx status within 10 seconds to confirm receipt.
          </p>
        </CardContent>
      </Card>
      </PageLayout>
  );
}

function WebhookDeliveries({ webhookId }: { webhookId: number }) {
  const { data: deliveries, isLoading } = trpc.webhooks.deliveries.useQuery({ webhookId, limit: 20 });

  if (isLoading) return <p className="text-sm text-muted-foreground mt-3">Loading deliveries...</p>;
  if (!deliveries || deliveries.length === 0) return <p className="text-sm text-muted-foreground mt-3">No deliveries yet.</p>;

  return (
    <div className="mt-3 border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-2 font-medium">Status</th>
            <th className="text-left p-2 font-medium">Event</th>
            <th className="text-left p-2 font-medium">HTTP</th>
            <th className="text-left p-2 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="p-2">
                {d.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </td>
              <td className="p-2">
                <Badge variant="outline" className="text-xs">{d.eventType}</Badge>
              </td>
              <td className="p-2 text-muted-foreground">{d.responseStatus || "—"}</td>
              <td className="p-2 text-muted-foreground">
                {d.deliveredAt ? new Date(d.deliveredAt).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    
    </div>
  );
}
