import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
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
  Zap,
  FileCheck,
  ClipboardList,
} from 'lucide-react';
import ProposalForm from '@/components/ProposalForm';
import { AIGuidancePanel } from '@/components/AIGuidancePanel';
import { GuidancePanel } from '@/components/GuidancePanel';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

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
              {items.map(item => (
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

export default function ProposalDetail() {
  const [, params] = useRoute('/app/proposals/:id');
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [contractTitle, setContractTitle] = useState('');

  const proposalId = params?.id ? parseInt(params.id) : undefined;

  const { data: proposal, isLoading, error } = trpc.proposals.get.useQuery(
    { id: proposalId! },
    { enabled: !!proposalId }
  );

  const updateStatusMutation = trpc.proposals.updateStatus.useMutation();
  const convertToContractMutation = trpc.proposals.convertToContract.useMutation();

  if (!proposalId) {
    return (
      <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Invalid Proposal</h2>
            <Button onClick={() => navigate('/app/proposals')} className="mt-4">
              Back to Proposals
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
        <div className="p-8 flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-slate-600">Loading proposal...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !proposal) {
    return (
      <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Proposal Not Found</h2>
            <p className="text-slate-600 mt-2">This proposal may have been deleted or you don't have access to it.</p>
            <Button onClick={() => navigate('/app/proposals')} className="mt-4">
              Back to Proposals
            </Button>
          </div>
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
      await updateStatusMutation.mutateAsync({
        id: proposalId,
        
        status: newStatus as any,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <PageLayout title="Proposal Workspace" subtitle="Build and manage your proposal" label="Proposals">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/proposals')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proposals
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{proposal.title}</h1>
              <p className="text-slate-600">
                {proposal.opportunityId ? `Linked to Opportunity #${proposal.opportunityId}` : 'Standalone Proposal'}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[proposal.status || 'draft'] || 'bg-gray-100 text-gray-800'
              }`}
            >
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
            <p className="text-xs font-medium text-slate-500 mb-1">Readiness</p>
            <p className="text-lg font-semibold text-slate-900">0%</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Proposal Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Proposal Overview
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Status</p>
                  <p className="text-slate-700">{proposal.status ? proposal.status.replace(/_/g, ' ') : 'Unknown'}</p>
                </div>
                {proposal.opportunityId && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Linked Opportunity</p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/app/opportunities/${proposal.opportunityId}`)}
                    >
                      View Opportunity
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Matrix */}
            <ComplianceMatrixSection proposalId={proposalId} />

            {/* Linked Files */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Linked Files
              </h2>
              <p className="text-slate-500 italic">No files attached yet.</p>
              <Button variant="outline" className="mt-4">
                Upload Files
              </Button>
            </div>

            {/* Linked Contacts */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Linked Contacts
              </h2>
              <p className="text-slate-500 italic">No contacts linked yet.</p>
              <Button variant="outline" className="mt-4">
                Link Contacts
              </Button>
            </div>

            {/* Notes & Tasks */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Notes & Tasks</h2>
              <p className="text-slate-500 italic">No notes or tasks yet.</p>
              <Button variant="outline" className="mt-4">
                Add Note or Task
              </Button>
            </div>

            {/* Readiness Checklist */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Readiness Checklist
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Executive summary complete</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Technical section complete</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Compliance section complete</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Pricing section complete</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Final review completed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Status & AI Panel */}
          <div className="space-y-6">
            {/* Status Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Update Status</h2>
              <div className="space-y-2">
                <Button
                  variant={proposal.status === 'draft' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('draft')}
                  disabled={updateStatusMutation.isPending}
                >
                  Draft
                </Button>
                <Button
                  variant={proposal.status === 'in_progress' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={updateStatusMutation.isPending}
                >
                  In Progress
                </Button>
                <Button
                  variant={proposal.status === 'submitted' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('submitted')}
                  disabled={updateStatusMutation.isPending}
                >
                  Submitted
                </Button>
              </div>
            </div>

            {/* Outcome Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Outcome</h2>
              <p className="text-sm text-slate-600 mb-4">Mark the outcome of this proposal.</p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusChange('won')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Won
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={() => handleStatusChange('lost')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Lost
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('withdrawn')}
                  disabled={updateStatusMutation.isPending}
                >
                  Withdraw
                </Button>
              </div>
            </div>

            {/* Convert to Contract (if Won) */}
            {proposal.status === 'won' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Next Step</h2>
                <p className="text-sm text-slate-700 mb-4">This proposal has been won. Ready to create a contract?</p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsConvertDialogOpen(true)}
                  disabled={convertToContractMutation.isPending}
                >
                  Convert to Contract
                </Button>
              </div>
            )}

            {/* Rule-based Guidance Panel */}
            <GuidancePanel compact={true} showPreferences={false} />

            {/* AI Assistance Panel */}
            <AIGuidancePanel
              recordType="proposal"
              recordId={proposalId}
              context={`Reviewing proposal: ${proposal.title}`}
              title="AI Proposal Assistance"
            />

            {/* Edit Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditDialogOpen(true)}
            >
              Edit Proposal
            </Button>
          </div>
        </div>

        {/* Convert to Contract Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Convert Won Proposal to Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contract-title">Contract Title</Label>
                <Input
                  id="contract-title"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  placeholder="e.g., Defense IT Modernization Contract"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsConvertDialogOpen(false);
                    setContractTitle('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={async () => {
                    if (!contractTitle.trim()) {
                      alert('Please enter a contract title');
                      return;
                    }
                    try {
                      const result = await convertToContractMutation.mutateAsync({
                        proposalId,
                        
                        contractTitle,
                      });
                      setIsConvertDialogOpen(false);
                      setContractTitle('');
                      navigate(`/app/contracts/${result.contractId}`);
                    } catch (error) {
                      console.error('Failed to convert to contract:', error);
                      alert('Failed to convert to contract. Please try again.');
                    }
                  }}
                  disabled={convertToContractMutation.isPending || !contractTitle.trim()}
                >
                  {convertToContractMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Contract'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Proposal</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <ProposalForm
              proposalId={proposalId}
              onSuccess={() => {
                setIsEditDialogOpen(false);
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
