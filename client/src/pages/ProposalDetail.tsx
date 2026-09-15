import { useState, useMemo, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, FileText, Users, FileCheck,
  ClipboardList, Plus, Trash2, UserPlus, Sparkles, Save, ChevronDown, ChevronUp,
} from 'lucide-react';
import ProposalForm from '@/components/ProposalForm';
import { AIGuidancePanel } from '@/components/AIGuidancePanel';
import { GuidancePanel } from '@/components/GuidancePanel';
import { toast } from 'sonner';
import AIWorkflowButtons from "@/components/AIWorkflowButtons";
import PageGuide from "@/components/PageGuide";
import RecordNotes from "@/components/RecordNotes";
import RecordTimeline from "@/components/RecordTimeline";
import { useRecentRecords } from "@/hooks/useRecentRecords";

// ===== Proposal Sections Editor =====
function ProposalSectionsEditor({ proposalId, proposalTitle, framework }: { proposalId: number; proposalTitle: string; framework?: string }) {
  const utils = trpc.useUtils();
  const { data: sections = [], isLoading } = trpc.proposalSections.list.useQuery({ proposalId });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<Record<number, string>>({});
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const createMutation = trpc.proposalSections.create.useMutation({
    onSuccess: () => { utils.proposalSections.list.invalidate(); setShowAddSection(false); setNewSectionTitle(''); toast.success('Section added'); },
  });
  const updateMutation = trpc.proposalSections.update.useMutation({
    onSuccess: () => { utils.proposalSections.list.invalidate(); toast.success('Section saved'); },
  });
  const deleteMutation = trpc.proposalSections.delete.useMutation({
    onSuccess: () => { utils.proposalSections.list.invalidate(); toast.success('Section deleted'); },
  });
  const aiDraftMutation = trpc.proposalSections.aiDraft.useMutation({
    onSuccess: (result: any, variables: any) => {
      utils.proposalSections.list.invalidate();
      setEditContent(prev => ({ ...prev, [variables.sectionId]: result.content }));
      toast.success('AI draft generated — please review before saving');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = {
    not_started: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    complete: 'bg-green-100 text-green-700',
    needs_review: 'bg-yellow-100 text-yellow-700',
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Proposal Sections
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowAddSection(!showAddSection)}>
          <Plus className="w-4 h-4 mr-1" /> Add Section
        </Button>
      </div>

      {showAddSection && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg flex gap-3">
          <Input value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} placeholder="Section title" className="flex-1" />
          <Button size="sm" disabled={!newSectionTitle.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate({ proposalId, title: newSectionTitle, sortOrder: sections.length + 1 })}>
            {createMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </div>
      )}

      {sections.length === 0 ? (
        <p className="text-slate-500 italic py-4">No sections yet. Add sections or select a framework to get started.</p>
      ) : (
        <div className="space-y-3">
          {(sections as any[]).map((section, idx) => {
            const isExpanded = expandedId === section.id;
            const currentContent = editContent[section.id] ?? section.content ?? '';
            return (
              <div key={section.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedId(isExpanded ? null : section.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <span className="font-medium text-slate-900">{section.title}</span>
                    {section.isAiDraft && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">AI Draft</span>}
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[section.status || 'not_started']}`}>
                      {(section.status || 'not_started').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                    <textarea
                      value={currentContent}
                      onChange={e => setEditContent(prev => ({ ...prev, [section.id]: e.target.value }))}
                      className="w-full min-h-[200px] p-3 border border-slate-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write section content here..."
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" onClick={() => updateMutation.mutate({ id: section.id, content: currentContent, status: 'in_progress', isAiDraft: false })}
                        disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline"
                        onClick={() => updateMutation.mutate({ id: section.id, status: 'complete' })}
                        disabled={updateMutation.isPending}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Complete
                      </Button>
                      <Button size="sm" variant="outline"
                        onClick={() => aiDraftMutation.mutate({ sectionId: section.id, proposalId, sectionTitle: section.title, proposalTitle, framework })}
                        disabled={aiDraftMutation.isPending}>
                        <Sparkles className="w-4 h-4 mr-1" /> {aiDraftMutation.isPending ? 'Generating...' : 'AI Draft'}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 ml-auto"
                        onClick={() => { if (confirm('Delete this section?')) deleteMutation.mutate({ id: section.id }); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== Team Assignments Section =====
function TeamAssignmentsSection({ proposalId }: { proposalId: number }) {
  const utils = trpc.useUtils();
  const { data: assignments = [] } = trpc.teamAssignments.list.useQuery({ proposalId });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ memberName: '', role: '', sectionResponsibility: '', notes: '' });
  const createMutation = trpc.teamAssignments.create.useMutation({
    onSuccess: () => { utils.teamAssignments.list.invalidate(); setShowAdd(false); setForm({ memberName: '', role: '', sectionResponsibility: '', notes: '' }); toast.success('Team member assigned'); },
  });
  const updateMutation = trpc.teamAssignments.update.useMutation({ onSuccess: () => utils.teamAssignments.list.invalidate() });
  const deleteMutation = trpc.teamAssignments.delete.useMutation({ onSuccess: () => utils.teamAssignments.list.invalidate() });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" /> Team Assignments
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-1" /> Assign Member
        </Button>
      </div>
      {showAdd && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input value={form.memberName} onChange={e => setForm(f => ({ ...f, memberName: e.target.value }))} placeholder="Member name" />
            <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Role (e.g. Technical Lead)" />
            <Input value={form.sectionResponsibility} onChange={e => setForm(f => ({ ...f, sectionResponsibility: e.target.value }))} placeholder="Section responsibility" />
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" />
          </div>
          <Button size="sm"
            onClick={() => createMutation.mutate({ proposalId, memberName: form.memberName, role: form.role, sectionResponsibility: form.sectionResponsibility || undefined, notes: form.notes || undefined })}>
            {createMutation.isPending ? 'Adding...' : 'Add Assignment'}
          </Button>
        </div>
      )}
      {assignments.length === 0 ? (
        <p className="text-slate-500 italic">No team assignments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200">
              <th className="text-left py-2 font-medium text-slate-600">Member</th>
              <th className="text-left py-2 font-medium text-slate-600">Role</th>
              <th className="text-left py-2 font-medium text-slate-600">Section</th>
              <th className="text-left py-2 font-medium text-slate-600">Status</th>
              <th className="text-right py-2 font-medium text-slate-600">Actions</th>
            </tr></thead>
            <tbody>
              {assignments.map((a: any) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{a.memberName}</td>
                  <td className="py-2">{a.role}</td>
                  <td className="py-2">{a.sectionResponsibility || '-'}</td>
                  <td className="py-2">
                    <select value={a.status} onChange={e => updateMutation.mutate({ id: a.id, status: e.target.value as any })}
                      className="text-xs border border-slate-200 rounded px-2 py-1">
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="complete">Complete</option>
                    </select>
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => deleteMutation.mutate({ id: a.id })} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== Compliance Matrix Section =====
function ComplianceMatrixSection({ proposalId }: { proposalId: number }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ requirement: '', section: '', responseLocation: '', assignedTo: '' });
  const { data: items = [] } = trpc.complianceMatrix.list.useQuery({ proposalId });
  const utils = trpc.useUtils();
  const createMutation = trpc.complianceMatrix.create.useMutation({
    onSuccess: () => { utils.complianceMatrix.list.invalidate(); setShowAdd(false); setForm({ requirement: '', section: '', responseLocation: '', assignedTo: '' }); toast.success('Requirement added'); },
  });
  const deleteMutation = trpc.complianceMatrix.delete.useMutation({ onSuccess: () => utils.complianceMatrix.list.invalidate() });

  const statusColors: Record<string, string> = {
    complete: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    non_compliant: 'bg-red-100 text-red-800',
    not_started: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" /> Compliance Matrix
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-1" /> Add Requirement
        </Button>
      </div>
      {showAdd && (
        <div className="border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Section</Label><Input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="e.g. L-1" /></div>
            <div><Label>Response Location</Label><Input value={form.responseLocation} onChange={e => setForm(f => ({ ...f, responseLocation: e.target.value }))} placeholder="e.g. Vol II, 3.2" /></div>
          </div>
          <div><Label>Requirement</Label><Input value={form.requirement} onChange={e => setForm(f => ({ ...f, requirement: e.target.value }))} /></div>
          <div className="flex gap-3">
            <Input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Assigned to" />
            <Button size="sm" disabled={!form.requirement || createMutation.isPending}
              onClick={() => createMutation.mutate({ proposalId, requirement: form.requirement, section: form.section || undefined, responseLocation: form.responseLocation || undefined, assignedTo: form.assignedTo || undefined })}>
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-slate-500 italic">No compliance requirements tracked yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200">
              <th className="text-left py-2 font-medium text-slate-600">Section</th>
              <th className="text-left py-2 font-medium text-slate-600">Requirement</th>
              <th className="text-left py-2 font-medium text-slate-600">Response</th>
              <th className="text-left py-2 font-medium text-slate-600">Status</th>
              <th className="py-2"></th>
            </tr></thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{item.section || '-'}</td>
                  <td className="py-2 text-slate-600 max-w-[200px] truncate">{item.requirement}</td>
                  <td className="py-2">{item.responseLocation || '-'}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${statusColors[item.status || 'not_started']}`}>{(item.status || 'not_started').replace(/_/g, ' ')}</span></td>
                  <td className="py-2 text-right"><button onClick={() => deleteMutation.mutate({ id: item.id })} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== Readiness Review =====
function ReadinessReview({ proposalId }: { proposalId: number }) {
  const { data: sections = [] } = trpc.proposalSections.list.useQuery({ proposalId });
  const { data: compItems = [] } = trpc.complianceMatrix.list.useQuery({ proposalId });
  const { data: teamItems = [] } = trpc.teamAssignments.list.useQuery({ proposalId });

  const checks = useMemo(() => {
    const sArr = sections as any[];
    const cArr = compItems as any[];
    const tArr = teamItems as any[];
    const totalSections = sArr.length;
    const completeSections = sArr.filter(s => s.status === 'complete').length;
    const totalCompliance = cArr.length;
    const completeCompliance = cArr.filter(c => c.status === 'complete').length;
    const hasTeam = tArr.length > 0;
    const items = [
      { label: 'Proposal sections created', done: totalSections > 0, detail: `${totalSections} sections` },
      { label: 'All sections complete', done: totalSections > 0 && completeSections === totalSections, detail: `${completeSections}/${totalSections}` },
      { label: 'Compliance matrix addressed', done: totalCompliance === 0 || completeCompliance === totalCompliance, detail: totalCompliance === 0 ? 'N/A' : `${completeCompliance}/${totalCompliance}` },
      { label: 'Team members assigned', done: hasTeam, detail: `${tArr.length} members` },
    ];
    const score = items.filter(i => i.done).length;
    return { items, score, total: items.length };
  }, [sections, compItems, teamItems]);

  const pct = Math.round((checks.score / checks.total) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-blue-600" /> Readiness Review
      </h2>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall Readiness</span>
          <span className="text-sm font-bold text-slate-900">{pct}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="space-y-3">
        {checks.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            {item.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
            <span className={`text-sm ${item.done ? 'text-slate-700' : 'text-slate-500'}`}>{item.label}</span>
            <span className="text-xs text-slate-400 ml-auto">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Main ProposalDetail =====
export default function ProposalDetail() {
  const [, params] = useRoute('/app/proposals/:id');
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [contractTitle, setContractTitle] = useState('');
  const [contractCarryForward, setContractCarryForward] = useState({ contacts: true, files: true, notes: true, tasks: true, deliverables: true });

  const proposalId = params?.id ? parseInt(params.id) : undefined;
  const { addRecord } = useRecentRecords();

  const { data: proposal, isLoading, error } = trpc.proposals.get.useQuery(
    { id: proposalId! },
    { enabled: !!proposalId }
  );

  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.proposals.updateStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.proposals.get.invalidate({ id: proposalId! }),
        utils.proposals.list.invalidate(),
      ]);
    },
  });
  const convertToContractMutation = trpc.proposals.convertToContract.useMutation();

  // Hooks must run before any conditional return. Track the record only after data exists.
  useEffect(() => {
    if (proposal && proposalId) {
      addRecord({ type: 'proposal', id: proposalId, title: proposal.title, route: `/app/proposals/${proposalId}` });
    }
  }, [proposal?.id, proposalId, proposal?.title, addRecord]);

  if (!proposalId) {
    return (
      <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold">Invalid Proposal</h2>
          <Button onClick={() => navigate('/app/proposals')} className="mt-4">Back to Proposals</Button>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
        <div className="p-8 flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </PageLayout>
    );
  }

  if (error || !proposal) {
    return (
      <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold">Proposal Not Found</h2>
          <Button onClick={() => navigate('/app/proposals')} className="mt-4">Back to Proposals</Button>
        </div>
      </PageLayout>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-purple-100 text-purple-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    withdrawn: 'bg-slate-100 text-slate-800',
    archived: 'bg-slate-200 text-slate-800',
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: proposalId, status: newStatus as any });
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
      <div className="p-8">
        <PageGuide
          title="Proposal Detail"
          description="Complete proposal workspace with sections, team, compliance, and submission tracking."
          whenToUse="When actively building, reviewing, or managing a specific proposal."
          whatToDoNext={["Complete all required proposal sections", "Verify compliance matrix coverage", "Assign team members to sections", "Submit before the deadline"]}
          relatedRecords={[{ label: "Proposals", path: "/app/proposals" }, { label: "Opportunities", path: "/app/opportunities" }, { label: "Templates", path: "/app/templates" }]}
        />

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/app/proposals')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Proposals
          </button>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{proposal.title}</h1>
              <p className="text-slate-600">
                {proposal.opportunityId ? `Linked to Opportunity #${proposal.opportunityId}` : 'Standalone Proposal'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[proposal.status || 'draft'] || 'bg-gray-100 text-gray-800'}`}>
              {proposal.status ? proposal.status.replace(/_/g, ' ') : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Framework</p>
            <p className="text-lg font-semibold text-slate-900">{proposal.framework || 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Due Date</p>
            <p className="text-lg font-semibold text-slate-900">
              {proposal.dueDate ? new Date(proposal.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Created</p>
            <p className="text-lg font-semibold text-slate-900">
              {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
            <p className="text-lg font-semibold text-slate-900 capitalize">{(proposal.status || 'draft').replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Proposal Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Sections Editor */}
            <ProposalSectionsEditor proposalId={proposalId} proposalTitle={proposal.title} framework={proposal.framework || undefined} />

            {/* Compliance Matrix */}
            <ComplianceMatrixSection proposalId={proposalId} />

            {/* Team Assignments */}
            <TeamAssignmentsSection proposalId={proposalId} />

            {/* Loss Review Link (if lost) */}
            {proposal.status === 'lost' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-2">Loss Review</h2>
                <p className="text-sm text-red-700 mb-4">This proposal was lost. Conduct a loss review to capture lessons learned.</p>
                <Button onClick={() => navigate(`/app/proposals/${proposalId}/loss-review`)} className="bg-red-600 hover:bg-red-700 text-white">
                  Go to Loss Review
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Status & AI Panel */}
          <div className="space-y-6">
            {/* Readiness Review */}
            <ReadinessReview proposalId={proposalId} />

            {/* Status Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Update Status</h2>
              <div className="space-y-2">
                {['draft', 'in_progress', 'under_review', 'submitted'].map(s => (
                  <Button key={s} variant={proposal.status === s ? 'default' : 'outline'} className="w-full justify-start capitalize"
                    onClick={() => handleStatusChange(s)} disabled={updateStatusMutation.isPending}>
                    {s.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Outcome Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Outcome</h2>
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange('won')} disabled={updateStatusMutation.isPending}>Mark Won</Button>
                <Button variant="outline" className="w-full text-red-600" onClick={() => handleStatusChange('lost')} disabled={updateStatusMutation.isPending}>Mark Lost</Button>
                <Button variant="outline" className="w-full" onClick={() => handleStatusChange('withdrawn')} disabled={updateStatusMutation.isPending}>Withdraw</Button>
              </div>
            </div>

            {/* Convert to Contract (if Won) */}
            {proposal.status === 'won' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Next Step</h2>
                <p className="text-sm text-slate-700 mb-4">This proposal has been won. Ready to create a contract?</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsConvertDialogOpen(true)} disabled={convertToContractMutation.isPending}>
                  Convert to Contract
                </Button>
              </div>
            )}

            {/* Guidance & AI */}
            <GuidancePanel compact={true} showPreferences={false} />
            <AIWorkflowButtons context="proposal" recordId={proposalId} recordTitle={proposal.title} />
            {/* Record Notes */}
            <RecordNotes recordType="proposal" recordId={proposalId!} />

            {/* Record Timeline */}
            <RecordTimeline recordType="proposal" recordId={proposalId!} />

            <AIGuidancePanel recordType="proposal" recordId={proposalId} context={`Reviewing proposal: ${proposal.title}`} title="AI Proposal Assistance" />

            <Button variant="outline" className="w-full" onClick={() => setIsEditDialogOpen(true)}>Edit Proposal</Button>
          </div>
        </div>

        {/* Convert to Contract Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Convert Won Proposal to Contract</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contract-title">Contract Title</Label>
                <Input id="contract-title" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} placeholder="e.g., Defense IT Modernization Contract" className="mt-2" />
              </div>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-medium text-slate-700 mb-3">Carry forward from proposal:</p>
                <div className="space-y-2">
                  {([['contacts', 'Contacts'], ['files', 'Files & Documents'], ['notes', 'Notes'], ['tasks', 'Open Tasks'], ['deliverables', 'Deliverables']] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={contractCarryForward[key as keyof typeof contractCarryForward]}
                        onChange={(e) => setContractCarryForward(prev => ({ ...prev, [key]: e.target.checked }))} className="rounded border-slate-300" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setIsConvertDialogOpen(false); setContractTitle(''); }}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={async () => {
                    if (!contractTitle.trim()) { toast.error('Please enter a contract title'); return; }
                    try {
                      const result = await convertToContractMutation.mutateAsync({ proposalId, contractTitle, carryForward: contractCarryForward });
                      setIsConvertDialogOpen(false);
                      setContractTitle('');
                      navigate(`/app/contracts/${result.contractId}`);
                    } catch (err: any) { toast.error(err.message || 'Failed to convert to contract'); }
                  }}
                  disabled={convertToContractMutation.isPending || !contractTitle.trim()}>
                  {convertToContractMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create Contract'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Edit Proposal</DialogTitle></DialogHeader>
            <DialogBody>
              <ProposalForm proposalId={proposalId} onSuccess={() => setIsEditDialogOpen(false)} onCancel={() => setIsEditDialogOpen(false)} />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
