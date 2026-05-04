import { useState } from 'react';
import { useLocation } from 'wouter';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Plus, Search, X, Briefcase, Loader2, Calendar, DollarSign } from 'lucide-react';
import ContractForm from '@/components/ContractForm';

export default function Contracts() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const workspaceId = 1;
  const { data: contracts = [], isLoading, refetch } = trpc.contracts.list.useQuery({
    workspaceId,
  });

  const filteredContracts = contracts.filter((contract) =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleFormSuccess = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="text-blue-300 text-sm font-semibold tracking-wider uppercase">Contracts</div>
          <h1 className="text-4xl font-bold text-white">Contracts</h1>
          <p className="text-slate-300">Manage your awarded contracts and active operations</p>
        </div>

        {/* Add Form Section */}
        {showForm && (
          <Card className="bg-blue-900/40 border-blue-700/50 backdrop-blur p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Contract</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ContractForm
              workspaceId={workspaceId}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        )}

        {/* Add Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contract
          </Button>
        )}

        {/* Search Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Search Contracts</h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by title or contract number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-900/40 border-blue-700/50 text-white placeholder-slate-400"
              />
            </div>
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
              className="border-blue-700/50 text-slate-300 hover:bg-blue-900/40"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Contract Records Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Contract Records</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : filteredContracts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContracts.map((contract) => (
                <Card
                  key={contract.id}
                  onClick={() => navigate(`/app/contracts/${contract.id}`)}
                  className="bg-blue-900/40 border-blue-700/50 backdrop-blur p-6 rounded-lg cursor-pointer hover:bg-blue-900/60 transition-colors"
                >
                  <div className="space-y-4">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-white">{contract.title}</h3>

                    {/* Client */}
                    {contract.agency && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Client</p>
                        <p className="text-slate-200">{contract.agency}</p>
                      </div>
                    )}

                    {/* Value */}
                    {contract.value && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-slate-200 font-semibold">
                          ${contract.value.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Status */}
                    {contract.status && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Status</p>
                        <p className="text-slate-200 capitalize">{contract.status.replace(/_/g, ' ')}</p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      {contract.startDate && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">Start Date</p>
                          <div className="flex items-center gap-2 text-slate-200">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            {new Date(contract.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {contract.endDate && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">End Date</p>
                          <div className="flex items-center gap-2 text-slate-200">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            {new Date(contract.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contract Number */}
                    {contract.contractNumber && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Contract Number</p>
                        <p className="text-slate-300 text-sm">{contract.contractNumber}</p>
                      </div>
                    )}

                    {/* Created Date */}
                    {contract.createdAt && (
                      <p className="text-xs text-slate-500 pt-2 border-t border-blue-700/30">
                        Created {new Date(contract.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400 mb-4">
                {searchTerm ? 'No contracts match your search' : 'No contracts yet'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Contract
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
