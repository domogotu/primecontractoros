import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle, FileText,
  Loader2, ChevronRight, Plus, Shield, Link2, RefreshCw, X, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

export default function ContractCloseout() {
  const [, params] = useRoute("/app/contracts/:id/closeout");
  const [, navigate] = useLocation();
  const contractId = params?.id ? parseInt(params.id) : undefined;
  const utils = trpc.useUtils();

  const { data: contract, isLoading: contractLoading } = trpc.contracts.get.useQuery(
    { id: contractId! },
    { enabled: !!contractId }
  );

  const { data: closeoutData, isLoading: closeoutLoading } = trpc.intCloseout.getByContract.useQuery(
    { contractId: contractId! },
    { enabled: !!contractId }
  );

  const initiateCloseout = trpc.intCloseout.initiate.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Closeout initiated"); },
    onError: (e) => toast.error(e.message),
  });

  const toggleItem = trpc.intCloseout.toggleItem.useMutation({
    onSuccess: () => utils.intCloseout.getByContract.invalidate(),
  });

  const updateItem = trpc.intCloseout.updateItem.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Item updated"); },
  });

  const addItem = trpc.intCloseout.addItem.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); setShowAddItem(false); setNewItem({ label: "", description: "", required: true, category: "", owner: "" }); toast.success("Item added"); },
    onError: (e) => toast.error(e.message),
  });

  const addBlocker = trpc.intCloseout.addBlocker.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); setShowAddBlocker(false); setNewBlocker({ title: "", description: "", severity: "medium", blockerType: "general", owner: "" }); toast.success("Blocker added"); },
    onError: (e) => toast.error(e.message),
  });

  const resolveBlocker = trpc.intCloseout.resolveBlocker.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Blocker resolved"); },
  });

  const waiveBlocker = trpc.intCloseout.waiveBlocker.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Blocker waived"); },
  });

  const addEvidence = trpc.intCloseout.addEvidence.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); setShowAddEvidence(null); setNewEvidence({ title: "", url: "", description: "" }); toast.success("Evidence linked"); },
    onError: (e) => toast.error(e.message),
  });

  const removeEvidence = trpc.intCloseout.removeEvidence.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Evidence removed"); },
  });

  const generateSummary = trpc.intCloseout.generateSummary.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Summary generated"); },
    onError: (e) => toast.error(e.message),
  });

  const updateStatus = trpc.intCloseout.updateStatus.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Closeout status updated"); },
    onError: (e) => toast.error(e.message),
  });

  const updateNotes = trpc.intCloseout.updateNotes.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success("Notes saved"); },
  });

  // UI state
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddBlocker, setShowAddBlocker] = useState(false);
  const [showAddEvidence, setShowAddEvidence] = useState<{ type: "checklist_item" | "blocker"; id: number } | null>(null);
  const [resolveNotes, setResolveNotes] = useState<{ id: number; notes: string } | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesEditing, setNotesEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"checklist" | "blockers" | "evidence" | "summary">("checklist");

  const [newItem, setNewItem] = useState({ label: "", description: "", required: true, category: "", owner: "" });
  const [newBlocker, setNewBlocker] = useState({ title: "", description: "", severity: "medium" as const, blockerType: "general", owner: "" });
  const [newEvidence, setNewEvidence] = useState({ title: "", url: "", description: "" });

  const statusColors: Record<string, string> = {
    not_started: "bg-gray-100 text-gray-600",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    not_started: <Circle className="w-5 h-5 text-gray-300" />,
    in_progress: <Clock className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    blocked: <AlertTriangle className="w-5 h-5 text-red-500" />,
  };

  const severityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  const isLoading = contractLoading || closeoutLoading;

  if (isLoading) return <div className="p-6 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;

  if (!contract) return <div className="p-6 text-center text-slate-500">Contract not found.</div>;

  // If no closeout record exists, show initiation prompt
  if (!closeoutData) {
    return (
      <PageLayout label="Contract Lifecycle" title="Contract Closeout" subtitle="Initiate the closeout process for this contract.">
        <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(`/app/contracts/${contractId}`)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contract
        </Button>
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Closeout Not Initiated</h3>
            <p className="text-sm text-slate-500 mb-6">
              Start the FAR 4.804 compliant closeout process for <strong>{contract.title || contract.contractNumber}</strong>.
              This will create a persisted checklist and track all closeout activities.
            </p>
            <Button
              onClick={() => initiateCloseout.mutate({ contractId: contractId! })}
              disabled={initiateCloseout.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {initiateCloseout.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Initiating...</> : "Initiate Closeout"}
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const items = closeoutData.items || [];
  const blockers = closeoutData.blockers || [];
  const evidence = closeoutData.evidence || [];
  const completedCount = closeoutData.completedCount || 0;
  const totalCount = closeoutData.totalCount || 0;
  const progress = closeoutData.completionPercentage || 0;
  const requiredCompleted = closeoutData.requiredCompleted || 0;
  const requiredTotal = closeoutData.requiredTotal || 0;
  const openBlockerCount = closeoutData.unresolvedBlockers || 0;
  const canComplete = closeoutData.canComplete || false;

  return (
    <PageLayout label="Contract Lifecycle" title="Contract Closeout" subtitle="Track and complete all closeout activities. Ensure all requirements are met before final closure.">
      <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(`/app/contracts/${contractId}/hub`)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contract Hub
      </Button>

      <PageGuide
        title="Contract Closeout"
        description="Systematic checklist for closing out a government contract. Each step must be completed and documented before the contract can be formally closed."
        whenToUse="When a contract is nearing completion or has been completed. Start closeout as early as possible to avoid delays in final payment."
        whatToDoNext={["Work through each checklist item. Resolve or waive any blockers. Attach evidence as needed. Generate a summary when ready."]}
      />

      {/* Progress Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">Closeout Progress — {contract.title || contract.contractNumber}</h3>
              <p className="text-sm text-gray-500">
                {completedCount} of {totalCount} steps completed ({requiredCompleted}/{requiredTotal} required)
                {openBlockerCount > 0 && <span className="text-red-600 ml-2">• {openBlockerCount} open blocker(s)</span>}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{progress}%</span>
              <Badge className={`ml-2 ${closeoutData.status === "completed" ? "bg-green-100 text-green-800" : closeoutData.status === "pending_review" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                {(closeoutData.status || "in_progress").replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {(["checklist", "blockers", "evidence", "summary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab === "checklist" && `Checklist (${completedCount}/${totalCount})`}
            {tab === "blockers" && `Blockers (${openBlockerCount})`}
            {tab === "evidence" && `Evidence (${evidence.length})`}
            {tab === "summary" && "Summary"}
          </button>
        ))}
      </div>

      {/* CHECKLIST TAB */}
      {activeTab === "checklist" && (
        <div className="space-y-3">
          {items.map((step: any) => {
            const itemEvidence = evidence.filter((e: any) => e.linkedItemType === "checklist_item" && e.linkedItemId === step.id);
            return (
              <Card key={step.id} className={`transition-all ${step.completed ? "opacity-75" : ""}`}>
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={(e) => { e.stopPropagation(); toggleItem.mutate({ itemId: step.id, completed: !step.completed }); }}
                      className="h-4 w-4 rounded border-slate-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${step.completed ? "line-through text-gray-400" : "text-gray-900"}`}>{step.label}</h3>
                        {step.required && <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Required</Badge>}
                        {step.category && <Badge variant="outline" className="text-xs">{step.category}</Badge>}
                      </div>
                      {step.owner && <p className="text-xs text-gray-500 mt-0.5">Owner: {step.owner}</p>}
                    </div>
                    <Badge className={statusColors[step.status || "not_started"]}>{(step.status || "not_started").replace(/_/g, " ")}</Badge>
                    {itemEvidence.length > 0 && <Badge variant="outline" className="text-xs"><Link2 className="w-3 h-3 mr-1" />{itemEvidence.length}</Badge>}
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedStep === step.id ? "rotate-90" : ""}`} />
                  </button>
                  {expandedStep === step.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-4 mt-3">{step.description}</p>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-xs text-gray-500">Status:</span>
                        {(["not_started", "in_progress", "completed", "blocked"] as const).map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={step.status === s ? "default" : "outline"}
                            onClick={() => updateItem.mutate({ itemId: step.id, status: s })}
                            className="text-xs h-7"
                          >
                            {s.replace(/_/g, " ")}
                          </Button>
                        ))}
                      </div>
                      {step.dueDate && <p className="text-xs text-gray-500 mb-2">Due: {new Date(step.dueDate).toLocaleDateString()}</p>}
                      {step.completedAt && <p className="text-xs text-green-600 mb-2">Completed: {new Date(step.completedAt).toLocaleDateString()}</p>}

                      {/* Evidence for this item */}
                      {itemEvidence.length > 0 && (
                        <div className="mt-3 mb-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Evidence:</p>
                          <div className="space-y-1">
                            {itemEvidence.map((ev: any) => (
                              <div key={ev.id} className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                                <Link2 className="w-3 h-3 text-blue-500" />
                                {ev.url ? <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{ev.title}</a> : <span>{ev.title}</span>}
                                <button onClick={() => removeEvidence.mutate({ evidenceId: ev.id })} className="ml-auto text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="text-xs mt-2" onClick={() => setShowAddEvidence({ type: "checklist_item", id: step.id })}>
                        <Link2 className="w-3 h-3 mr-1" /> Add Evidence
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Add Item */}
          {showAddItem ? (
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-3">Add Checklist Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Title *</Label>
                    <Input value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} placeholder="Item title" />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} placeholder="e.g. Financial, Legal" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description" />
                  </div>
                  <div>
                    <Label className="text-xs">Owner</Label>
                    <Input value={newItem.owner} onChange={(e) => setNewItem({ ...newItem, owner: e.target.value })} placeholder="Responsible person" />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" checked={newItem.required} onChange={(e) => setNewItem({ ...newItem, required: e.target.checked })} className="h-4 w-4 rounded" />
                    <Label className="text-xs">Required for completion</Label>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => { if (!newItem.label.trim()) { toast.error("Title is required"); return; } addItem.mutate({ closeoutId: closeoutData.id, label: newItem.label, description: newItem.description || undefined, required: newItem.required, category: newItem.category || undefined, owner: newItem.owner || undefined }); }} disabled={addItem.isPending}>
                    {addItem.isPending ? "Adding..." : "Add Item"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowAddItem(true)} className="mt-2">
              <Plus className="w-4 h-4 mr-1" /> Add Checklist Item
            </Button>
          )}
        </div>
      )}

      {/* BLOCKERS TAB */}
      {activeTab === "blockers" && (
        <div className="space-y-4">
          {blockers.length === 0 && !showAddBlocker && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-1">No Blockers</h3>
                <p className="text-sm text-gray-500 mb-4">No blocking items have been identified for this closeout.</p>
                <Button variant="outline" size="sm" onClick={() => setShowAddBlocker(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Blocker
                </Button>
              </CardContent>
            </Card>
          )}

          {blockers.map((blocker: any) => {
            const blockerEvidence = evidence.filter((e: any) => e.linkedItemType === "blocker" && e.linkedItemId === blocker.id);
            return (
              <Card key={blocker.id} className={blocker.status === "open" ? "border-red-200" : blocker.status === "waived" ? "border-yellow-200" : "border-green-200"}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{blocker.title}</h4>
                        <Badge className={severityColors[blocker.severity || "medium"]}>{blocker.severity || "medium"}</Badge>
                        <Badge variant="outline" className={blocker.status === "open" ? "text-red-600 border-red-300" : blocker.status === "waived" ? "text-yellow-700 border-yellow-300" : "text-green-600 border-green-300"}>
                          {blocker.status}
                        </Badge>
                      </div>
                      {blocker.description && <p className="text-sm text-gray-600 mb-2">{blocker.description}</p>}
                      {blocker.owner && <p className="text-xs text-gray-500">Owner: {blocker.owner}</p>}
                      {blocker.dueDate && <p className="text-xs text-gray-500">Due: {new Date(blocker.dueDate).toLocaleDateString()}</p>}
                      {blocker.resolutionNotes && <p className="text-xs text-gray-500 mt-1 italic">Resolution: {blocker.resolutionNotes}</p>}
                      {blocker.resolvedAt && <p className="text-xs text-green-600 mt-1">Resolved: {new Date(blocker.resolvedAt).toLocaleDateString()}</p>}
                    </div>
                    {blocker.status === "open" && (
                      <div className="flex gap-2 ml-4">
                        {resolveNotes?.id === blocker.id ? (
                          <div className="flex flex-col gap-1">
                            <Input value={resolveNotes?.notes || ""} onChange={(e) => setResolveNotes(prev => prev ? { ...prev, notes: e.target.value } : null)} placeholder="Resolution notes..." className="text-xs h-7 w-48" />
                            <div className="flex gap-1">
                              <Button size="sm" className="text-xs h-6 bg-green-600 hover:bg-green-700" onClick={() => { resolveBlocker.mutate({ blockerId: blocker.id, resolutionNotes: resolveNotes?.notes || "" }); setResolveNotes(null); }}>Resolve</Button>
                              <Button size="sm" className="text-xs h-6 bg-yellow-600 hover:bg-yellow-700" onClick={() => { waiveBlocker.mutate({ blockerId: blocker.id, resolutionNotes: resolveNotes?.notes || "" }); setResolveNotes(null); }}>Waive</Button>
                              <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => setResolveNotes(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => setResolveNotes({ id: blocker.id, notes: "" })}>
                            Resolve / Waive
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Evidence for blocker */}
                  {blockerEvidence.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Evidence:</p>
                      {blockerEvidence.map((ev: any) => (
                        <div key={ev.id} className="flex items-center gap-2 text-xs bg-gray-50 p-1.5 rounded mb-1">
                          <Link2 className="w-3 h-3 text-blue-500" />
                          {ev.url ? <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{ev.title}</a> : <span>{ev.title}</span>}
                          <button onClick={() => removeEvidence.mutate({ evidenceId: ev.id })} className="ml-auto text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={() => setShowAddEvidence({ type: "blocker", id: blocker.id })}>
                    <Link2 className="w-3 h-3 mr-1" /> Add Evidence
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Blocker Form */}
          {showAddBlocker ? (
            <Card className="border-red-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-3">Add Blocker</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Title *</Label>
                    <Input value={newBlocker.title} onChange={(e) => setNewBlocker({ ...newBlocker, title: e.target.value })} placeholder="Blocker title" />
                  </div>
                  <div>
                    <Label className="text-xs">Severity</Label>
                    <Select value={newBlocker.severity} onValueChange={(v: any) => setNewBlocker({ ...newBlocker, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea value={newBlocker.description} onChange={(e) => setNewBlocker({ ...newBlocker, description: e.target.value })} placeholder="Describe the blocker..." className="h-16" />
                  </div>
                  <div>
                    <Label className="text-xs">Owner</Label>
                    <Input value={newBlocker.owner} onChange={(e) => setNewBlocker({ ...newBlocker, owner: e.target.value })} placeholder="Responsible person" />
                  </div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Input value={newBlocker.blockerType} onChange={(e) => setNewBlocker({ ...newBlocker, blockerType: e.target.value })} placeholder="e.g. financial, legal, compliance" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { if (!newBlocker.title.trim()) { toast.error("Title is required"); return; } addBlocker.mutate({ closeoutId: closeoutData.id, title: newBlocker.title, description: newBlocker.description || undefined, severity: newBlocker.severity as any, blockerType: newBlocker.blockerType || undefined, owner: newBlocker.owner || undefined }); }} disabled={addBlocker.isPending}>
                    {addBlocker.isPending ? "Adding..." : "Add Blocker"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddBlocker(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            blockers.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowAddBlocker(true)} className="mt-2">
                <Plus className="w-4 h-4 mr-1" /> Add Blocker
              </Button>
            )
          )}
        </div>
      )}

      {/* EVIDENCE TAB */}
      {activeTab === "evidence" && (
        <div className="space-y-3">
          {evidence.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Link2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-1">No Evidence Linked</h3>
                <p className="text-sm text-gray-500">Evidence documents will appear here when linked to checklist items or blockers.</p>
              </CardContent>
            </Card>
          ) : (
            evidence.map((ev: any) => (
              <Card key={ev.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{ev.title}</h4>
                    {ev.description && <p className="text-xs text-gray-500">{ev.description}</p>}
                    <p className="text-xs text-gray-400">
                      Linked to: {ev.linkedItemType === "checklist_item" ? "Checklist Item" : "Blocker"} #{ev.linkedItemId}
                    </p>
                  </div>
                  {ev.url && (
                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View</a>
                  )}
                  <button onClick={() => removeEvidence.mutate({ evidenceId: ev.id })} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* SUMMARY TAB */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button size="sm" onClick={() => generateSummary.mutate({ closeoutId: closeoutData.id })} disabled={generateSummary.isPending}>
              <RefreshCw className={`w-4 h-4 mr-1 ${generateSummary.isPending ? "animate-spin" : ""}`} />
              {generateSummary.isPending ? "Generating..." : "Generate Summary"}
            </Button>
          </div>
          {closeoutData.summary ? (
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: closeoutData.summary.replace(/\n/g, "<br/>").replace(/## /g, "<h3>").replace(/### /g, "<h4>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/- /g, "• ") }} />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-1">No Summary Generated</h3>
                <p className="text-sm text-gray-500">Click "Generate Summary" to create a closeout status summary.</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Closeout Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {notesEditing ? (
                <div>
                  <Textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} className="h-24 mb-2" placeholder="Add notes about this closeout..." />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { updateNotes.mutate({ closeoutId: closeoutData.id, notes: notesText }); setNotesEditing(false); }}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setNotesEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  {closeoutData.notes ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{closeoutData.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No notes yet.</p>
                  )}
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => { setNotesText(closeoutData.notes || ""); setNotesEditing(true); }}>Edit Notes</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Evidence Modal (inline) */}
      {showAddEvidence && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAddEvidence(null)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold mb-3">Link Evidence</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Title *</Label>
                  <Input value={newEvidence.title} onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })} placeholder="Evidence title" />
                </div>
                <div>
                  <Label className="text-xs">URL (document link)</Label>
                  <Input value={newEvidence.url} onChange={(e) => setNewEvidence({ ...newEvidence, url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input value={newEvidence.description} onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })} placeholder="Brief description" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={() => {
                  if (!newEvidence.title.trim()) { toast.error("Title is required"); return; }
                  addEvidence.mutate({
                    closeoutId: closeoutData.id,
                    linkedItemType: showAddEvidence.type,
                    linkedItemId: showAddEvidence.id,
                    title: newEvidence.title,
                    url: newEvidence.url || undefined,
                    description: newEvidence.description || undefined,
                  });
                }} disabled={addEvidence.isPending}>
                  {addEvidence.isPending ? "Linking..." : "Link Evidence"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddEvidence(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Final Actions */}
      <Card className={`mt-6 ${canComplete ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
        <CardContent className="p-6">
          {canComplete ? (
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Ready for Completion</h3>
              <p className="text-sm text-green-700 mt-1">All required items are complete and no open blockers remain.</p>
              {closeoutData.status !== "completed" && (
                <div className="flex gap-2 justify-center mt-4">
                  {closeoutData.status !== "pending_review" && (
                    <Button variant="outline" onClick={() => updateStatus.mutate({ closeoutId: closeoutData.id, status: "pending_review" })}>
                      Submit for Review
                    </Button>
                  )}
                  <Button className="bg-green-700 hover:bg-green-800" onClick={() => updateStatus.mutate({ closeoutId: closeoutData.id, status: "completed" })} disabled={updateStatus.isPending}>
                    {updateStatus.isPending ? "Completing..." : "Complete Closeout"}
                  </Button>
                </div>
              )}
              {closeoutData.status === "completed" && (
                <p className="text-sm text-green-600 mt-2 font-medium">Closeout completed on {closeoutData.completedAt ? new Date(closeoutData.completedAt).toLocaleDateString() : "N/A"}</p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Not Ready for Completion</h3>
              <p className="text-sm text-gray-600 mt-1">
                {requiredCompleted < requiredTotal && `${requiredTotal - requiredCompleted} required item(s) still incomplete. `}
                {openBlockerCount > 0 && `${openBlockerCount} open blocker(s) must be resolved or waived.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
