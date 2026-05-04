import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ExternalLink, Briefcase, AlertCircle } from 'lucide-react';

const mockContracts = [
  {
    id: '1',
    title: 'IT Infrastructure Support - Year 1',
    contractNumber: 'N00123-26-C-0001',
    client: 'Naval Supply Systems Command',
    value: '$1,250,000',
    startDate: '2026-01-15',
    endDate: '2027-01-14',
    status: 'active' as const,
    health: 'healthy' as const,
    openAlerts: 0,
    openTasks: 3,
    financeAttention: false,
    closeoutStatus: 'Not Started',
  },
  {
    id: '2',
    title: 'Cloud Migration Services',
    contractNumber: 'GS-07F-0456K',
    client: 'General Services Administration',
    value: '$850,000',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    status: 'active' as const,
    health: 'at-risk' as const,
    openAlerts: 2,
    openTasks: 5,
    financeAttention: true,
    closeoutStatus: 'In Progress',
  },
  {
    id: '3',
    title: 'Healthcare IT Compliance Review',
    contractNumber: 'VA-2025-089',
    client: 'Department of Veterans Affairs',
    value: '$425,000',
    startDate: '2025-03-01',
    endDate: '2026-02-28',
    status: 'active' as const,
    health: 'warning' as const,
    openAlerts: 1,
    openTasks: 2,
    financeAttention: false,
    closeoutStatus: 'Not Started',
  },
];

export default function Contracts() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContracts = mockContracts.filter((contract) =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={() => navigate('/app/contracts/new')}
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

        {/* Contracts List */}
        {filteredContracts.length > 0 ? (
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
                      <StatusBadge status={contract.health} size="sm" />
                      {contract.openAlerts > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <AlertCircle className="w-3 h-3" />
                          {contract.openAlerts} alert{contract.openAlerts !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{contract.client}</p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Contract #</p>
                        <p className="font-medium text-slate-900">{contract.contractNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Value</p>
                        <p className="font-medium text-slate-900">{contract.value}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Period</p>
                        <p className="font-medium text-slate-900">
                          {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tasks</p>
                        <p className="font-medium text-slate-900">{contract.openTasks} open</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Closeout</p>
                        <p className="font-medium text-slate-900">{contract.closeoutStatus}</p>
                      </div>
                    </div>

                    {contract.financeAttention && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        ⚠️ Finance attention needed
                      </div>
                    )}
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
              onClick={() => navigate('/app/contracts/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
