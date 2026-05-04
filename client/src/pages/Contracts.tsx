import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { Plus, Search, Filter, ExternalLink, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import ContractForm from '@/components/ContractForm';

export default function Contracts() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const workspaceId = 1; // TODO: Get from context
  const { data: contracts = [], isLoading } = trpc.contracts.list.useQuery({
    workspaceId,
  });

  const filteredContracts = contracts.filter((contract) =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (contract.agency?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const healthColors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    at_risk: 'bg-yellow-100 text-yellow-800',
    warning: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    setup: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    modification: 'bg-yellow-100 text-yellow-800',
    closeout: 'bg-orange-100 text-orange-800',
    closed: 'bg-slate-100 text-slate-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
        <div className="section-header">
          <div className="flex items-center justify-between">
            <div>
              <h2>Contracts</h2>
              <p>Manage your awarded contracts and active operations</p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, contract number, or client..."
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
              <p className="text-slate-600">Loading contracts...</p>
            </div>
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                onClick={() => navigate(`/app/contracts/${contract.id}`)}
                className="section-contract cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{contract.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contract.health ? healthColors[contract.health] : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.health ? contract.health.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contract.status ? statusColors[contract.status] : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.status ? contract.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{contract.agency || 'N/A'}</p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Contract #</p>
                        <p className="font-medium text-slate-900">{contract.contractNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Value</p>
                        <p className="font-medium text-slate-900">
                          {contract.value ? `$${contract.value.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Start Date</p>
                        <p className="font-medium text-slate-900">
                          {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">End Date</p>
                        <p className="font-medium text-slate-900">
                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Created</p>
                        <p className="font-medium text-slate-900">
                          {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'N/A'}
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
              <Briefcase className="w-16 h-16 mx-auto text-slate-300" />
            </div>
            <div className="empty-state-title">No contracts yet</div>
            <div className="empty-state-description">
              {searchTerm ? 'Try adjusting your search' : 'Create your first contract to get started'}
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <ContractForm
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
