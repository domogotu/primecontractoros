import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Hash,
  Loader2,
  MapPin,
  RefreshCw,
  Shield,
  Tag,
  Target,
  Users,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import OpportunityForm from "@/components/OpportunityForm";
import AIWorkflowButtons from "@/components/AIWorkflowButtons";
import RecordNotes from "@/components/RecordNotes";
import RecordTimeline from "@/components/RecordTimeline";
import { useRecentRecords } from "@/hooks/useRecentRecords";

export default function OpportunityDetail() {
  const [, params] = useRoute("/app/opportunities/:id");
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("");
  const [carryForward, setCarryForward] = useState({ contacts: true, files: true, notes: true, tasks: false });
  const [reviewChecklist, setReviewChecklist] = useState<Record<string, boolean>>({});
  const [resyncMessage, setResyncMessage] = useState<string | null>(null);

  const opportunityId = params?.id ? parseInt(params.id) : undefined;
  const { addRecord } = useRecentRecords();

  const { data: opportunity, isLoading, error, refetch } = trpc.opportunities.get.useQuery(
    { id: opportunityId! },
    { enabled: !!opportunityId }
  );
  const { data: sourceFiles = [] } = trpc.sam.getSourceFiles.useQuery(
    { opportunityId: opportunityId! },
    { enabled: !!opportunityId }
  );
  const { data: importLogs = [] } = trpc.sam.getImportLogs.useQuery(
    { opportunityId: opportunityId! },
    { enabled: !!opportunityId }
  );

  const updateStatusMutation = trpc.opportunities.updateStatus.useMutation();
  const updateMutation = trpc.opportunities.update.useMutation();
  const convertToProposalMutation = trpc.opportunities.convertToProposal.useMutation();
  const resyncMutation = trpc.sam.resync.useMutation();

  useEffect(() => {
    if (!opportunityId) return;
    const saved = localStorage.getItem(`opp-review-${opportunityId}`);
    if (!saved) return;
    try {
      setReviewChecklist(JSON.parse(saved));
    } catch {
      // Ignore invalid legacy local state.
    }
  }, [opportunityId]);

  useEffect(() => {
    if (!opportunity || !opportunityId) return;
    addRecord({
      type: "opportunity",
      id: opportunityId,
      title: opportunity.title,
      route: `/app/opportunities/${opportunityId}`,
    });
  }, [opportunity?.id, opportunityId, addRecord]);

  const toggleChecklistItem = (key: string) => {
    const updated = { ...reviewChecklist, [key]: !reviewChecklist[key] };
    setReviewChecklist(updated);
    if (opportunityId) localStorage.setItem(`opp-review-${opportunityId}`, JSON.stringify(updated));
  };

  if (!opportunityId) {
    return <StatePage title="Invalid Opportunity" body="This opportunity link is invalid." onBack={() => navigate("/app/opportunities")} />;
  }

  if (isLoading) {
    return (
      <PageLayout title="Opportunity" subtitle="Loading opportunity workspace" label="Opportunities">
        <div className="flex h-80 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
            <p className="mt-3 text-sm text-slate-600">Loading opportunity...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !opportunity) {
    return <StatePage title="Opportunity Not Found" body="This opportunity may have been deleted or you may not have access to it." onBack={() => navigate("/app/opportunities")} />;
  }

  const opp = opportunity as any;
  const status = opportunity.status || "new";
  const isSamImported = opp.sourceSystem === "SAM.gov" || opp.samOpportunityId || opp.importStatus === "imported" || opp.importStatus === "synced";
  const dueDate = opp.dueDate ? new Date(opp.dueDate) : null;
  const isOverdue = !!dueDate && dueDate.getTime() < Date.now() && !["no_pursue", "moved_to_proposal", "archived"].includes(status);
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  let contacts: any[] = [];
  try {
    if (opp.pointOfContact) contacts = JSON.parse(opp.pointOfContact);
  } catch {
    contacts = [];
  }

  const automaticChecks: Array<{ id: string; severity: "high" | "medium"; title: string; why: string }> = [];
  if (isOverdue) automaticChecks.push({ id: "overdue", severity: "high", title: "Response date has passed", why: "Confirm whether the opportunity is still actionable before spending more time on it." });
  if (!opp.dueDate) automaticChecks.push({ id: "due", severity: "high", title: "Due date is missing", why: "A pursuit decision is risky without a confirmed response deadline." });
  if (!opp.naics) automaticChecks.push({ id: "naics", severity: "medium", title: "NAICS has not been captured", why: "NAICS affects eligibility, size standards, and fit analysis." });
  if (!opp.description && !opp.summary) automaticChecks.push({ id: "description", severity: "medium", title: "Opportunity description is missing", why: "The system has limited context for analysis until the source description is available." });
  if (sourceFiles.length === 0) automaticChecks.push({ id: "files", severity: "medium", title: "No solicitation files are attached", why: "Requirements and terms may exist only in attachments." });
  if (opp.importStatus === "sync_failed") automaticChecks.push({ id: "sync", severity: "high", title: "SAM.gov sync failed", why: "The stored opportunity may not reflect the current notice or amendments." });
  if (["new", "in_review"].includes(status)) automaticChecks.push({ id: "decision", severity: "medium", title: "Pursuit decision is still open", why: "Review fit, requirements, risk, and resources before moving into proposal work." });

  const checklistItems = [
    { key: "source_url", label: "Source URL or notice verified" },
    { key: "due_date", label: "Due date reviewed" },
    { key: "naics", label: "NAICS and set-aside reviewed" },
    { key: "files", label: "Solicitation files reviewed" },
    { key: "business_fit", label: "Business fit reviewed" },
    { key: "subcontracting", label: "Teaming / subcontracting impact reviewed" },
    { key: "decision", label: "Pursue / Hold / No Pursue decision selected" },
  ];
  const completedChecks = checklistItems.filter((item) => reviewChecklist[item.key]).length;
  const checklistProgress = Math.round((completedChecks / checklistItems.length) * 100);

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    in_review: "bg-amber-100 text-amber-800",
    pursue: "bg-green-100 text-green-800",
    hold: "bg-gray-100 text-gray-800",
    no_pursue: "bg-red-100 text-red-800",
    moved_to_proposal: "bg-purple-100 text-purple-800",
    archived: "bg-slate-100 text-slate-800",
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateStatusMutation.mutateAsync({ id: opportunityId, status: newStatus as any });
    if (["pursue", "hold", "no_pursue"].includes(newStatus)) {
      await updateMutation.mutateAsync({ id: opportunityId, pursuitDecision: newStatus as any });
    }
    refetch();
  };

  const handleResync = async () => {
    setResyncMessage(null);
    try {
      const result = await resyncMutation.mutateAsync({ opportunityId });
      setResyncMessage(result.message || "Re-synced successfully.");
      refetch();
    } catch (err: any) {
      setResyncMessage(err.message || "Failed to re-sync from SAM.gov.");
    }
  };

  const handleMarkReviewed = async () => {
    await updateMutation.mutateAsync({ id: opportunityId, reviewStatus: "reviewed" });
    refetch();
  };

  const handleConvertToProposal = async () => {
    if (!proposalTitle.trim()) return;
    const result = await convertToProposalMutation.mutateAsync({
      opportunityId,
      proposalTitle,
      framework: undefined,
      carryForward,
    });
    setIsConvertDialogOpen(false);
    setProposalTitle("");
    navigate(`/app/proposals/${result.proposalId}`);
  };

  return (
    <PageLayout title="Opportunity" subtitle="Evaluate fit, source requirements, risk, resources, and the next pursuit decision" label="Opportunities">
      <div className="space-y-5 p-4 md:p-6">
        <button onClick={() => navigate("/app/opportunities")} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Back to Opportunities
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">{opportunity.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{opp.agency || "Agency not captured"}{opp.office ? ` · ${opp.office}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>{status.replace(/_/g, " ")}</span>
              {isSamImported && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">SAM.gov linked</span>}
              {daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{daysUntilDue}d left</span>}
              {isOverdue && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">Overdue</span>}
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>Edit Opportunity</Button>
        </div>

        {resyncMessage && (
          <div className={`rounded-lg border p-3 text-sm ${resyncMessage.toLowerCase().includes("fail") ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>
            {resyncMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <InfoCard icon={<Hash className="h-4 w-4" />} label="Solicitation" value={opp.solicitation || opp.noticeId} />
          <InfoCard icon={<Calendar className="h-4 w-4" />} label="Due Date" value={dueDate ? dueDate.toLocaleDateString() : null} urgent={isOverdue} />
          <InfoCard icon={<Tag className="h-4 w-4" />} label="NAICS" value={opp.naics} />
          <InfoCard icon={<Shield className="h-4 w-4" />} label="Set-Aside" value={opp.setAside || opp.setAsideDescription || "Full & Open"} />
          <InfoCard icon={<Building2 className="h-4 w-4" />} label="Notice Type" value={opp.noticeType || opp.type} />
          <InfoCard icon={<MapPin className="h-4 w-4" />} label="Location" value={opp.placeOfPerformance} />
        </div>

        {automaticChecks.length > 0 ? (
          <Card className="border-amber-200 bg-amber-50 p-4 md:p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-amber-950">Needs attention</h2>
                <p className="mt-1 text-sm text-amber-800">Automatic checks found {automaticChecks.length} item{automaticChecks.length === 1 ? "" : "s"} worth reviewing before the next lifecycle step.</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {automaticChecks.map((item) => (
                    <div key={item.id} className="rounded-lg border border-amber-200 bg-white p-3">
                      <p className={`text-sm font-semibold ${item.severity === "high" ? "text-red-700" : "text-amber-800"}`}>{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600">Why it matters: {item.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-sm text-green-800"><CheckCircle2 className="h-4 w-4" /> Automatic checks found no immediate exceptions.</div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            <Card className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Target className="h-5 w-5 text-blue-600" /> Opportunity overview</h2>
              <div className="mt-4">
                {opp.description || opp.summary ? <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{opp.description || opp.summary}</p> : <p className="text-sm italic text-slate-500">No description is available yet.</p>}
                {(opp.samUrl || opp.sourceLink) && (
                  <a href={opp.samUrl || opp.sourceLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" /> Open governing source notice
                  </a>
                )}
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><FileText className="h-5 w-5 text-blue-600" /> Requirements & source documents</h2>
                  <p className="mt-1 text-sm text-slate-600">Review the documents that should drive fit, compliance, pricing, and proposal work.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{sourceFiles.length} file{sourceFiles.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-4 space-y-2">
                {sourceFiles.length > 0 ? sourceFiles.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-500">{file.sourceCategory?.replace(/_/g, " ") || "Source file"}{file.fileType ? ` · ${file.fileType}` : ""}</p>
                    </div>
                    {file.fileUrl && <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600"><ExternalLink className="h-4 w-4" /></a>}
                  </div>
                )) : <p className="text-sm italic text-slate-500">No source files are attached yet.</p>}
              </div>

              <details className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">Review readiness · {completedChecks}/{checklistItems.length} complete</summary>
                <div className="mt-4">
                  <div className="mb-4 h-1.5 w-full rounded-full bg-gray-200"><div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${checklistProgress}%` }} /></div>
                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <label key={item.key} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                        <input type="checkbox" checked={!!reviewChecklist[item.key]} onChange={() => toggleChecklistItem(item.key)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                        <span className={reviewChecklist[item.key] ? "text-gray-500 line-through" : ""}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                  {checklistProgress === 100 && <Button className="mt-4" onClick={handleMarkReviewed} disabled={updateMutation.isPending}>Mark Review Complete</Button>}
                </div>
              </details>
            </Card>

            <Card className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Users className="h-5 w-5 text-blue-600" /> Contacts & resources</h2>
              <p className="mt-1 text-sm text-slate-600">Keep source contacts and teaming information close to the pursuit decision.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {contacts.length > 0 ? contacts.map((contact: any, index: number) => (
                  <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-900">{contact.fullName || "Unknown contact"}</p>
                    <p className="text-xs text-gray-500">{contact.type || "Contact"}</p>
                    {contact.email && <p className="mt-1 text-sm text-blue-600">{contact.email}</p>}
                  </div>
                )) : <p className="text-sm italic text-slate-500">No contacts are linked yet.</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate("/app/contacts")}>Open Contacts</Button>
                <Button variant="outline" onClick={() => navigate("/app/subcontractors")}>Subcontractors / Teaming</Button>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="border-indigo-200 bg-indigo-50/40 p-5">
              <h2 className="font-semibold text-slate-900">Opportunity intelligence</h2>
              <p className="mt-1 text-sm text-slate-600">Use AI when you want a deeper review. Routine field and deadline checks already happen automatically on this page.</p>
              <div className="mt-4"><AIWorkflowButtons context="opportunity" recordId={opportunityId} recordTitle={opportunity.title} /></div>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold text-slate-900">Pursuit decision</h2>
              <p className="mt-1 text-sm text-slate-600">You remain responsible for the final decision. AI guidance is advisory.</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={() => handleStatusChange("pursue")} disabled={updateStatusMutation.isPending}>Pursue</Button>
                <Button variant="outline" className="w-full" onClick={() => handleStatusChange("hold")} disabled={updateStatusMutation.isPending}>Hold</Button>
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleStatusChange("no_pursue")} disabled={updateStatusMutation.isPending}>No Pursue</Button>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold text-slate-900">Next lifecycle step</h2>
              {status === "pursue" ? (
                <>
                  <p className="mt-1 text-sm text-slate-600">This opportunity is marked Pursue. Start the proposal workspace and carry the approved context forward.</p>
                  <Button className="mt-4 w-full" onClick={() => { setProposalTitle(opportunity.title || ""); setIsConvertDialogOpen(true); }} disabled={convertToProposalMutation.isPending}>Start Proposal</Button>
                </>
              ) : (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Mark this opportunity <strong>Pursue</strong> before creating the proposal. This prevents accidental lifecycle advancement.</p>
              )}
            </Card>

            {isSamImported && (
              <Card className="p-5">
                <h2 className="font-semibold text-slate-900">SAM.gov source sync</h2>
                <p className="mt-1 text-xs text-gray-500">{opp.lastSyncedAt ? `Last synced ${new Date(opp.lastSyncedAt).toLocaleString()}` : "Not yet synced"}</p>
                <Button variant="outline" className="mt-3 w-full" onClick={handleResync} disabled={resyncMutation.isPending}>
                  {resyncMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</> : <><RefreshCw className="mr-2 h-4 w-4" /> Check for source updates</>}
                </Button>
              </Card>
            )}

            <details className="rounded-lg border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">Notes & activity</summary>
              <div className="mt-4 space-y-5"><RecordNotes recordType="opportunity" recordId={opportunityId} /><RecordTimeline recordType="opportunity" recordId={opportunityId} /></div>
            </details>

            {importLogs.length > 0 && (
              <details className="rounded-lg border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">Import / sync history</summary>
                <div className="mt-3 space-y-2">
                  {importLogs.map((log: any) => <div key={log.id} className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 text-xs last:border-0"><span>{log.importStatus}{log.errorMessage ? ` · ${log.errorMessage}` : ""}</span><span className="whitespace-nowrap text-gray-500">{new Date(log.importedAt).toLocaleString()}</span></div>)}
                </div>
              </details>
            )}
          </div>
        </div>

        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Start Proposal From This Opportunity</DialogTitle></DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <div><Label htmlFor="proposal-title">Proposal Title</Label><Input id="proposal-title" value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} className="mt-2" /></div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">The proposal will inherit the opportunity context. Keep only the additional record groups you want carried forward.</div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">Carry forward</p>
                  <div className="space-y-2">
                    {([ ["contacts", "Contacts"], ["files", "Files & Documents"], ["notes", "Notes"], ["tasks", "Open Tasks"] ] as const).map(([key, label]) => (
                      <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={carryForward[key]} onChange={(e) => setCarryForward((prev) => ({ ...prev, [key]: e.target.checked }))} className="rounded border-slate-300" />{label}</label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>Cancel</Button><Button onClick={handleConvertToProposal} disabled={convertToProposalMutation.isPending || !proposalTitle.trim()}>{convertToProposalMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Proposal"}</Button></div>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Edit Opportunity</DialogTitle></DialogHeader>
            <DialogBody><OpportunityForm opportunityId={opportunityId} onSuccess={() => { setIsEditDialogOpen(false); refetch(); }} onCancel={() => setIsEditDialogOpen(false)} /></DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

function InfoCard({ icon, label, value, urgent }: { icon: React.ReactNode; label: string; value: string | null | undefined; urgent?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1 flex items-center gap-1.5"><span className="text-gray-400">{icon}</span><p className="text-xs font-medium text-slate-500">{label}</p></div>
      <p className={`truncate text-sm font-semibold ${urgent ? "text-red-700" : "text-slate-900"}`}>{value || <span className="font-normal text-gray-400">Not captured</span>}</p>
    </div>
  );
}

function StatePage({ title, body, onBack }: { title: string; body: string; onBack: () => void }) {
  return (
    <PageLayout title="Opportunity" subtitle="Opportunity workspace" label="Opportunities">
      <div className="p-8 text-center"><AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" /><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-slate-600">{body}</p><Button onClick={onBack} className="mt-4">Back to Opportunities</Button></div>
    </PageLayout>
  );
}
