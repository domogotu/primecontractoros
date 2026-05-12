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
  Target,
} from 'lucide-react';
import OpportunityForm from '@/components/OpportunityForm';
import { AIGuidancePanel } from '@/components/AIGuidancePanel';
import AIWorkflowButtons from "@/components/AIWorkflowButtons";
import { GuidancePanel } from '@/components/GuidancePanel';

export default function OpportunityDetail() {
  const [, params] = useRoute('/app/opportunities/:id');
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');

  const opportunityId = params?.id ? parseInt(params.id) : undefined;

  const { data: opportunity, isLoading, error } = trpc.opportunities.get.useQuery(
    { id: opportunityId! },
    { enabled: !!opportunityId }
  );

  const updateStatusMutation = trpc.opportunities.updateStatus.useMutation();
  const convertToProposalMutation = trpc.opportunities.convertToProposal.useMutation();

  if (!opportunityId) {
    return (
      <PageLayout title="Opportunity Detail" subtitle="View and manage this opportunity" label="Opportunities">
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Invalid Opportunity</h2>
            <Button onClick={() => navigate('/app/opportunities')} className="mt-4">
              Back to Opportunities
            </Button>
          </div>
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
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Opportunity Not Found</h2>
            <p className="text-slate-600 mt-2">This opportunity may have been deleted or you don't have access to it.</p>
            <Button onClick={() => navigate('/app/opportunities')} className="mt-4">
              Back to Opportunities
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    pursue: 'bg-green-100 text-green-800',
    hold: 'bg-gray-100 text-gray-800',
    no_pursue: 'bg-red-100 text-red-800',
    moved_to_proposal: 'bg-purple-100 text-purple-800',
    archived: 'bg-slate-100 text-slate-800',
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: opportunityId,
        
        status: newStatus as any,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleConvertToProposal = async () => {
    if (!proposalTitle.trim()) {
      alert('Please enter a proposal title');
      return;
    }
    try {
      const result = await convertToProposalMutation.mutateAsync({
        opportunityId,
        
        proposalTitle,
        framework: undefined,
      });
      setIsConvertDialogOpen(false);
      setProposalTitle('');
      navigate(`/app/proposals/${result.proposalId}`);
    } catch (error) {
      console.error('Failed to convert to proposal:', error);
      alert('Failed to convert to proposal. Please try again.');
    }
  };

  return (
    <PageLayout title="Opportunity Detail" subtitle="View and manage this opportunity" label="Opportunities">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/opportunities')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Opportunities
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{opportunity.title}</h1>
              <p className="text-slate-600">{opportunity.agency || 'No agency specified'}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[opportunity.status || 'new'] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {opportunity.status ? opportunity.status.replace(/_/g, ' ') : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Solicitation</p>
            <p className="text-lg font-semibold text-slate-900">{opportunity.solicitation || 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Due Date</p>
            <p className="text-lg font-semibold text-slate-900">
              {opportunity.dueDate ? new Date(opportunity.dueDate).toLocaleDateString() : 'N/A'}
            </p>
            {opportunity.dueDate && (() => {
              const now = new Date();
              const due = new Date(opportunity.dueDate);
              const diffMs = due.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              if (diffDays < 0) return <p className="text-xs text-red-600 font-medium mt-1">Overdue by {Math.abs(diffDays)} days</p>;
              if (diffDays === 0) return <p className="text-xs text-red-600 font-medium mt-1">Due today!</p>;
              if (diffDays <= 7) return <p className="text-xs text-orange-600 font-medium mt-1">{diffDays} days remaining</p>;
              if (diffDays <= 30) return <p className="text-xs text-yellow-600 font-medium mt-1">{diffDays} days remaining</p>;
              return <p className="text-xs text-green-600 font-medium mt-1">{diffDays} days remaining</p>;
            })()}
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">NAICS Code</p>
            <p className="text-lg font-semibold text-slate-900">{opportunity.naics || 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Set-Aside</p>
            <p className="text-lg font-semibold text-slate-900">{(opportunity as any).setAside || 'Full & Open'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Type</p>
            <p className="text-lg font-semibold text-slate-900">{opportunity.type || 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Agency</p>
            <p className="text-lg font-semibold text-slate-900">{opportunity.agency || 'N/A'}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Opportunity Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Opportunity Summary
              </h2>
              <div className="space-y-4">
                {opportunity.summary ? (
                  <p className="text-slate-700">{opportunity.summary}</p>
                ) : (
                  <p className="text-slate-500 italic">No summary provided yet.</p>
                )}
                {opportunity.sourceLink && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Source Link</p>
                    <a
                      href={opportunity.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {opportunity.sourceLink}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Source Files Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Source Files
              </h2>
              <p className="text-slate-500 italic">No files attached yet.</p>
              <Button variant="outline" className="mt-4">
                Upload Files
              </Button>
            </div>

            {/* Contacts Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Contacts
              </h2>
              <p className="text-slate-500 italic">No contacts linked yet.</p>
              <Button variant="outline" className="mt-4">
                Link Contacts
              </Button>
            </div>

            {/* Review Checklist */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Review Checklist
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Reviewed opportunity details</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Assessed fit with company capabilities</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Identified required resources</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Confirmed compliance requirements</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Decision & AI Panel */}
          <div className="space-y-6">
            {/* Decision Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Decision</h2>
              <p className="text-sm text-slate-600 mb-4">What would you like to do with this opportunity?</p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusChange('pursue')}
                  disabled={updateStatusMutation.isPending}
                >
                  Pursue This Opportunity
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('hold')}
                  disabled={updateStatusMutation.isPending}
                >
                  Hold for Later
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={() => handleStatusChange('no_pursue')}
                  disabled={updateStatusMutation.isPending}
                >
                  No Pursue
                </Button>
              </div>
            </div>

            {/* Convert to Proposal */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Next Step</h2>
              <p className="text-sm text-slate-600 mb-4">Ready to start a proposal?</p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsConvertDialogOpen(true)}
                disabled={convertToProposalMutation.isPending}
              >
                Start Proposal From This Opportunity
              </Button>
            </div>

            {/* Rule-based Guidance Panel */}
            <AIWorkflowButtons context="opportunity" recordId={opportunityId} recordTitle={opportunity.title} />
            <GuidancePanel compact={true} showPreferences={false} />

            {/* AI Assistance Panel */}
            <AIGuidancePanel
              recordType="opportunity"
              recordId={opportunityId}
              context={`Analyzing opportunity: ${opportunity.title} from ${opportunity.agency || 'Unknown Agency'}`}
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
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsConvertDialogOpen(false);
                      setProposalTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleConvertToProposal}
                    disabled={convertToProposalMutation.isPending || !proposalTitle.trim()}
                  >
                    {convertToProposalMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
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
