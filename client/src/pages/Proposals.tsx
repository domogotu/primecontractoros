import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { Plus, Search, Filter, ExternalLink, FileText, Loader2 } from 'lucide-react';
import ProposalForm from '@/components/ProposalForm';

export default function Proposals() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const workspaceId = 1; // TODO: Get from context
  const { data: proposals = [], isLoading } = trpc.proposals.list.useQuery({
    workspaceId,
  });

  const filteredProposals = proposals.filter((prop) =>
    prop.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
        <div className="section-header">
          <div className="flex items-center justify-between">
            <div>
              <h2>Proposals</h2>
              <p>Manage your proposal pipeline and track readiness</p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-slate-600">Loading proposals...</p>
            </div>
          </div>
        ) : filteredProposals.length > 0 ? (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => navigate(`/app/proposals/${proposal.id}`)}
                className="section-proposal cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{proposal.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          proposal.status ? statusColors[proposal.status] : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {proposal.status ? proposal.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Framework</p>
                        <p className="font-medium text-slate-900">{proposal.framework || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Due Date</p>
                        <p className="font-medium text-slate-900">
                          {proposal.dueDate ? new Date(proposal.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Opportunity</p>
                        <p className="font-medium text-slate-900">{proposal.opportunityId ? `#${proposal.opportunityId}` : 'Standalone'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Created</p>
                        <p className="font-medium text-slate-900">
                          {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText className="w-16 h-16 mx-auto text-slate-300" />
            </div>
            <div className="empty-state-title">No proposals yet</div>
            <div className="empty-state-description">
              {searchTerm ? 'Try adjusting your search' : 'Create your first proposal to get started'}
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            <ProposalForm
              workspaceId={workspaceId}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </WorkspaceLayout>
  );
}
