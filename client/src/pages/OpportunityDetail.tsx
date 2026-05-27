import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Users,
  Target,
  RefreshCw,
  ExternalLink,
  Download,
  Clock,
  Calendar,
  Building2,
  Hash,
  MapPin,
  Shield,
  Tag,
} from 'lucide-react';
import OpportunityForm from '@/components/OpportunityForm';
import { AIGuidancePanel } from '@/components/AIGuidancePanel';
import AIWorkflowButtons from "@/components/AIWorkflowButtons";
import { GuidancePanel } from '@/components/GuidancePanel';
import PageGuide from "@/components/PageGuide";
import RecordNotes from "@/components/RecordNotes";
import RecordTimeline from "@/components/RecordTimeline";
import { useRecentRecords } from "@/hooks/useRecentRecords";

export default function OpportunityDetail() {
  const [, params] = useRoute('/app/opportunities/:id');
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
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

  // Load review checklist from localStorage
  useEffect(() => {
    if (opportunityId) {
      const saved = localStorage.getItem(`opp-review-${opportunityId}`);
      if (saved) {
        try { setReviewChecklist(JSON.parse(saved)); } catch {}
      }
    }
  }, [opportunityId]);

  // Save review checklist
  const toggleChecklistItem = (key: string) => {
    const updated = { ...reviewChecklist, [key]: !reviewChecklist[key] };
    setReviewChecklist(updated);
    if (opportunityId) {
      localStorage.setItem(`opp-review-${opportunityId}`, JSON.stringify(updated));
    }
  };

  if (!opportunityId) {
    return (
      <PageLayout title="Opportunity Detail" subtitle="View and manage this opportunity" label="Opportunities">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold">Invalid Opportunity</h2>
          <Button onClick={() => navigate('/app/opportunities')} className="mt-4">Back to Opportunities</Button>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Opportunity Detail" subtitle="View and manage this opportunity" label="Opportunities">
        <div className="p-8 flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-slate-600">Loading opportunity...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !opportunity) {
    return (
      <PageLayout title="Opportunity Detail" subtitle="View and manage this opportunity" label="Opportunities">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold">Opportunity Not Found</h2>
          <p className="text-slate-600 mt-2">This opportunity may have been deleted or you don't have access to it.</p>
          <Button onClick={() => navigate('/app/opportunities')} className="mt-4">Back to Opportunities</Button>
        </div>
      </PageLayout>
    );
  }

  // Track recently viewed
  useEffect(() => {
    if (opportunity && opportunityId) {
      addRecord({ type: 'opportunity', id: opportunityId, title: opportunity.title, route: `/app/opportunities/${opportunityId}` });
    }
  }, [opportunity?.id]);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    pursue: 'bg-green-100 text-green-800',
    hold: 'bg-gray-100 text-gray-800',
    no_pursue: 'bg-red-100 text-red-800',
    moved_to_proposal: 'bg-purple-100 text-purple-800',
    archived: 'bg-slate-100 text-slate-800',
  };

  const importStatusColors: Record<string, string> = {
    manual: 'bg-gray-100 text-gray-700',
    imported: 'bg-blue-100 text-blue-700',
    synced: 'bg-green-100 text-green-700',
    sync_failed: 'bg-red-100 text-red-700',
  };

  const opp = opportunity as any;
  const isSamImported = opp.sourceSystem === "SAM.gov" || opp.samOpportunityId || opp.importStatus === "imported" || opp.importStatus === "synced";

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: opportunityId, status: newStatus as any });
      // Also update pursuit decision
      if (newStatus === "pursue" || newStatus === "hold" || newStatus === "no_pursue") {
        await updateMutation.mutateAsync({ id: opportunityId, pursuitDecision: newStatus as any });
      }
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleResync = async () => {
    setResyncMessage(null);
    try {
      const result = await resyncMutation.mutateAsync({ opportunityId });
      setResyncMessage(result.message || "Re-synced successfully.");
      refetch();
    } catch (error: any) {
      setResyncMessage(error.message || "Failed to re-sync from SAM.gov.");
    }
  };

  const handleMarkReviewed = async () => {
    try {
      await updateMutation.mutateAsync({ id: opportunityId, reviewStatus: "reviewed" });
      refetch();
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
    }
  };

  const handleConvertToProposal = async () => {
    if (!proposalTitle.trim()) return;
    try {
      const result = await convertToProposalMutation.mutateAsync({
        opportunityId,
        proposalTitle,
        framework: undefined,
        carryForward,
      });
      setIsConvertDialogOpen(false);
      setProposalTitle('');
      navigate(`/app/proposals/${result.proposalId}`);
    } catch (error) {
      console.error('Failed to convert to proposal:', error);
    }
  };

  // Parse point of contact
  let contacts: any[] = [];
  try {
    if (opp.pointOfContact) {
      contacts = JSON.parse(opp.pointOfContact);
    }
  } catch {}

  // Review checklist items
  const checklistItems = [
    { key: "source_url", label: "Source URL present" },
    { key: "source_notice", label: "Source notice imported" },
    { key: "due_date", label: "Due date reviewed" },
    { key: "naics", label: "NAICS reviewed" },
    { key: "set_aside", label: "Set-aside reviewed" },
    { key: "files", label: "Files/attachments reviewed" },
    { key: "business_fit", label: "Business fit reviewed" },
    { key: "subcontracting", label: "Subcontracting/teaming impact reviewed" },
    { key: "decision", label: "Pursue/Hold/No Pursue decision selected" },
  ];

  const completedChecks = checklistItems.filter(item => reviewChecklist[item.key]).length;
  const checklistProgress = Math.round((completedChecks / checklistItems.length) * 100);

  return (
    <PageLayout title="Opportunity Detail" subtitle="View and manage this opportunity" label="Opportunities">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app/opportunities')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Opportunities
          </button>

          <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{opportunity.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-slate-600">{opp.agency || 'No agency specified'}</p>
                {opp.subAgency && <span className="text-slate-400">/ {opp.subAgency}</span>}
                {opp.office && <span className="text-slate-400">/ {opp.office}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[opportunity.status || 'new'] || 'bg-gray-100 text-gray-800'}`}>
                {(opportunity.status || 'new').replace(/_/g, ' ')}
              </span>
              {isSamImported && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${importStatusColors[opp.importStatus || 'imported']}`}>
                  SAM.gov {(opp.importStatus || 'imported').replace(/_/g, ' ')}
                </span>
              )}
              {opp.reviewStatus && opp.reviewStatus !== "reviewed" && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  {opp.reviewStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Resync Message */}
        {resyncMessage && (
          <div className={`mb-4 p-3 rounded-lg border ${resyncMessage.includes("fail") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <p className={`text-sm ${resyncMessage.includes("fail") ? "text-red-800" : "text-green-800"}`}>{resyncMessage}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <InfoCard icon={<Hash className="w-4 h-4" />} label="Solicitation" value={opp.solicitation} />
          <InfoCard icon={<Calendar className="w-4 h-4" />} label="Due Date" value={opp.dueDate ? new Date(opp.dueDate).toLocaleDateString() : null} urgent={opp.dueDate && new Date(opp.dueDate) < new Date()} />
          <InfoCard icon={<Tag className="w-4 h-4" />} label="NAICS" value={opp.naics} />
          <InfoCard icon={<Shield className="w-4 h-4" />} label="Set-Aside" value={opp.setAside || opp.setAsideDescription || 'Full & Open'} />
          <InfoCard icon={<Building2 className="w-4 h-4" />} label="Notice Type" value={opp.noticeType || opp.type} />
          <InfoCard icon={<MapPin className="w-4 h-4" />} label="Location" value={opp.placeOfPerformance} />
        </div>

        {/* Additional Info Row for SAM imports */}
        {isSamImported && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <InfoCard icon={<Hash className="w-4 h-4" />} label="Notice ID" value={opp.noticeId || opp.samOpportunityId} />
            <InfoCard icon={<Tag className="w-4 h-4" />} label="PSC Code" value={opp.pscCode} />
            <InfoCard icon={<Calendar className="w-4 h-4" />} label="Posted" value={opp.postedDate ? new Date(opp.postedDate).toLocaleDateString() : null} />
            <InfoCard icon={<Clock className="w-4 h-4" />} label="Last Synced" value={opp.lastSyncedAt ? new Date(opp.lastSyncedAt).toLocaleString() : "Never"} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description/Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Opportunity Summary
              </h2>
              <div className="space-y-4">
                {(opp.description || opp.summary) ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap">{opp.description || opp.summary}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No description available.</p>
                )}
                {(opp.samUrl || opp.sourceLink) && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-slate-600 mb-2">Source</p>
                    <a
                      href={opp.samUrl || opp.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1 break-all"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {opp.samUrl || opp.sourceLink}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Source Files / Attachments */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Source Files & Attachments
                {sourceFiles.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{sourceFiles.length}</span>
                )}
              </h2>
              {sourceFiles.length > 0 ? (
                <div className="space-y-2">
                  {sourceFiles.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {file.sourceCategory?.replace(/_/g, ' ')} {file.fileType && `• ${file.fileType}`}
                          </p>
                        </div>
                      </div>
                      {file.fileUrl && (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">No source files attached yet.</p>
              )}
            </Card>

            {/* Contacts from SAM.gov */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Point of Contact
              </h2>
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{contact.fullName || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{contact.type || "Contact"}</p>
                      {contact.email && <p className="text-sm text-blue-600 mt-1">{contact.email}</p>}
                      {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">No contacts linked yet.</p>
              )}
            </Card>

            {/* Review Checklist */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Review Checklist
                </h2>
                <span className="text-xs font-medium text-gray-500">{completedChecks}/{checklistItems.length} ({checklistProgress}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${checklistProgress}%` }} />
              </div>
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!reviewChecklist[item.key]}
                      onChange={() => toggleChecklistItem(item.key)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${reviewChecklist[item.key] ? "text-gray-500 line-through" : "text-slate-700"} group-hover:text-slate-900`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
              {checklistProgress === 100 && (
                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleMarkReviewed}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Reviewed
                </Button>
              )}
            </Card>

            {/* Import History */}
            {importLogs.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Import History
                </h2>
                <div className="space-y-2">
                  {importLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-2 text-sm border-b border-gray-100 last:border-0">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          log.importStatus === "success" || log.importStatus === "synced" ? "bg-green-100 text-green-700" :
                          log.importStatus === "failed" || log.importStatus === "sync_failed" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {log.importStatus}
                        </span>
                        {log.errorMessage && <span className="text-xs text-red-600 ml-2">{log.errorMessage}</span>}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(log.importedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Decision & Actions */}
          <div className="space-y-6">
            {/* Decision Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Decision</h2>
              <p className="text-sm text-slate-600 mb-4">What would you like to do with this opportunity?</p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusChange('pursue')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Pursue
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('hold')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Hold
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleStatusChange('no_pursue')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark No Pursue
                </Button>
              </div>
            </Card>

            {/* Convert to Proposal */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Next Step</h2>
              <p className="text-sm text-slate-600 mb-4">Ready to start a proposal?</p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setProposalTitle(opportunity.title || '');
                  setIsConvertDialogOpen(true);
                }}
                disabled={convertToProposalMutation.isPending}
              >
                Start Proposal From This Opportunity
              </Button>
            </Card>

            {/* Re-sync from SAM.gov */}
            {isSamImported && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">SAM.gov Sync</h2>
                <p className="text-xs text-gray-500 mb-3">
                  {opp.lastSyncedAt ? `Last synced: ${new Date(opp.lastSyncedAt).toLocaleString()}` : "Not yet synced"}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResync}
                  disabled={resyncMutation.isPending}
                >
                  {resyncMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" /> Re-sync from SAM.gov</>
                  )}
                </Button>
              </Card>
            )}

            {/* AI & Guidance */}
            <AIWorkflowButtons context="opportunity" recordId={opportunityId} recordTitle={opportunity.title} />
            <GuidancePanel compact={true} showPreferences={false} />

            {/* Record Notes */}
            <RecordNotes recordType="opportunity" recordId={opportunityId} />

            {/* Record Timeline */}
            <RecordTimeline recordType="opportunity" recordId={opportunityId} />

            {/* AI Assistance */}
            <AIGuidancePanel
              recordType="opportunity"
              recordId={opportunityId}
              context={`Analyzing opportunity: ${opportunity.title} from ${opp.agency || 'Unknown Agency'}`}
              title="AI Opportunity Assistance"
            />

            {/* Edit Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditDialogOpen(true)}
            >
              Edit Opportunity
            </Button>
          </div>
        </div>

        {/* Convert to Proposal Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start Proposal From This Opportunity</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proposal-title">Proposal Title</Label>
                  <Input
                    id="proposal-title"
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    placeholder="e.g., Proposal for Defense IT Modernization"
                    className="mt-2"
                  />
                </div>

                {/* Carry-forward summary */}
                {isSamImported && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-800 mb-1">Carrying forward from SAM.gov import:</p>
                    <ul className="text-xs text-blue-700 space-y-0.5">
                      {opp.agency && <li>Agency: {opp.agency}</li>}
                      {opp.solicitation && <li>Solicitation: {opp.solicitation}</li>}
                      {opp.naics && <li>NAICS: {opp.naics}</li>}
                      {opp.dueDate && <li>Due: {new Date(opp.dueDate).toLocaleDateString()}</li>}
                      {opp.samUrl && <li>SAM.gov source URL</li>}
                      {sourceFiles.length > 0 && <li>{sourceFiles.length} source file(s)</li>}
                    </ul>
                  </div>
                )}

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="text-sm font-medium text-slate-700 mb-3">Carry forward from opportunity:</p>
                  <div className="space-y-2">
                    {([['contacts', 'Contacts'], ['files', 'Files & Documents'], ['notes', 'Notes'], ['tasks', 'Open Tasks']] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={carryForward[key as keyof typeof carryForward]}
                          onChange={(e) => setCarryForward(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded border-slate-300"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => { setIsConvertDialogOpen(false); setProposalTitle(''); }}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleConvertToProposal}
                    disabled={convertToProposalMutation.isPending || !proposalTitle.trim()}
                  >
                    {convertToProposalMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                    ) : (
                      'Create Proposal'
                    )}
                  </Button>
                </div>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <OpportunityForm
                opportunityId={opportunityId}
                onSuccess={() => { setIsEditDialogOpen(false); refetch(); }}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

function InfoCard({ icon, label, value, urgent }: { icon: React.ReactNode; label: string; value: string | null | undefined; urgent?: boolean }) {
  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-gray-400">{icon}</span>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className={`text-sm font-semibold ${urgent ? "text-red-700" : "text-slate-900"} truncate`}>
        {value || <span className="text-gray-400 font-normal">N/A</span>}
      </p>
    </div>
  );
}
