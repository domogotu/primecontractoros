import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { Plus, Search, Filter, ExternalLink, Target, Loader2 } from 'lucide-react';
import OpportunityForm from '@/components/OpportunityForm';
import { AIGuidancePanel } from '@/components/AIGuidancePanel';

export default function Opportunities() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const workspaceId = 1; // TODO: Get from context
  const { data: opportunities = [], isLoading } = trpc.opportunities.list.useQuery({
    workspaceId,
  });

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.agency?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (opp.solicitation?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesFilter = !filterStatus || opp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusOptions = [
    'new',
    'in_review',
    'pursue',
    'hold',
    'no_pursue',
    'moved_to_proposal',
    'archived',
  ];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    pursue: 'bg-green-100 text-green-800',
    hold: 'bg-gray-100 text-gray-800',
    no_pursue: 'bg-red-100 text-red-800',
    moved_to_proposal: 'bg-purple-100 text-purple-800',
    archived: 'bg-slate-100 text-slate-800',
  };

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
        <div className="section-header">
          <div className="flex items-center justify-between">
            <div>
              <h2>Opportunities</h2>
              <p>Track and review potential government contracting opportunities</p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </Button>
          </div>
        </div>

        {/* AI Guidance Panel */}
        <AIGuidancePanel
          workspaceId={workspaceId}
          recordType="opportunities"
          recordId={0}
          context={`Opportunities: ${opportunities.length} total`}
          title="Opportunity Fit Assessment"
        />

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, agency, or solicitation number..."
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
              <p className="text-slate-600">Loading opportunities...</p>
            </div>
          </div>
        ) : filteredOpportunities.length > 0 ? (
          <div className="space-y-4">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                onClick={() => navigate(`/app/opportunities/${opp.id}`)}
                className="section-opportunity cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{opp.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          opp.status ? statusColors[opp.status] : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {opp.status ? opp.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Agency</p>
                        <p className="font-medium text-slate-900">{opp.agency || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Solicitation</p>
                        <p className="font-medium text-slate-900">{opp.solicitation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Due Date</p>
                        <p className="font-medium text-slate-900">
                          {opp.dueDate ? new Date(opp.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Type</p>
                        <p className="font-medium text-slate-900">{opp.type || 'N/A'}</p>
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
              <Target className="w-16 h-16 mx-auto text-slate-300" />
            </div>
            <div className="empty-state-title">No opportunities found</div>
            <div className="empty-state-description">
              {searchTerm || filterStatus
                ? 'Try adjusting your search or filters'
                : 'Create your first opportunity to get started'}
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </Button>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Opportunity</DialogTitle>
            </DialogHeader>
            <OpportunityForm
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
