import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Users,
  Zap,
  Briefcase,
  BarChart3,
} from 'lucide-react';
import ContractForm from '@/components/ContractForm';

export default function ContractDetail() {
  const [, params] = useRoute('/app/contracts/:id');
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const contractId = params?.id ? parseInt(params.id) : undefined;
  const workspaceId = 1; // TODO: Get from context

  const { data: contract, isLoading, error } = trpc.contracts.get.useQuery(
    { id: contractId || 0, workspaceId },
    { enabled: !!contractId }
  );

  const updateHealthMutation = trpc.contracts.updateHealth.useMutation();

  if (!contractId) {
    return (
      <WorkspaceLayout>
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Invalid Contract</h2>
            <Button onClick={() => navigate('/app/contracts')} className="mt-4">
              Back to Contracts
            </Button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  if (isLoading) {
    return (
      <WorkspaceLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-slate-600">Loading contract...</p>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  if (error || !contract) {
    return (
      <WorkspaceLayout>
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Contract Not Found</h2>
            <p className="text-slate-600 mt-2">This contract may have been deleted or you don't have access to it.</p>
            <Button onClick={() => navigate('/app/contracts')} className="mt-4">
              Back to Contracts
            </Button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  const statusColors: Record<string, string> = {
    setup: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    modification: 'bg-yellow-100 text-yellow-800',
    closeout: 'bg-orange-100 text-orange-800',
    closed: 'bg-slate-100 text-slate-800',
    suspended: 'bg-red-100 text-red-800',
  };

  const healthColors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    at_risk: 'bg-yellow-100 text-yellow-800',
    warning: 'bg-red-100 text-red-800',
  };

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/contracts')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contracts
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{contract.title}</h1>
              <p className="text-slate-600">{contract.agency || 'No agency specified'}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[contract.status || 'setup'] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {contract.status ? contract.status.replace(/_/g, ' ') : 'Unknown'}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  healthColors[contract.health || 'healthy'] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {contract.health ? contract.health.replace(/_/g, ' ') : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Contract Number</p>
            <p className="text-lg font-semibold text-slate-900">{contract.contractNumber || 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Value</p>
            <p className="text-lg font-semibold text-slate-900">
              {contract.value ? `$${contract.value.toLocaleString()}` : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-slate-900">
              {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">End Date</p>
            <p className="text-lg font-semibold text-slate-900">
              {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Contract Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Contract Summary
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Status</p>
                  <p className="text-slate-900">{contract.status ? contract.status.replace(/_/g, ' ') : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Health</p>
                  <p className="text-slate-900">{contract.health ? contract.health.replace(/_/g, ' ') : 'Unknown'}</p>
                </div>
                {contract.proposalId && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Linked Proposal</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/app/proposals/${contract.proposalId}`)}
                    >
                      View Proposal
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Setup Checklist */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Setup Checklist
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Contract terms reviewed</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Key contacts identified</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Compliance requirements documented</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-700">Financial terms confirmed</span>
                </label>
              </div>
            </div>

            {/* Carried-Forward History */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Carried-Forward History
              </h2>
              <p className="text-slate-500 italic">No history available yet.</p>
            </div>

            {/* Files Snapshot */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Files Snapshot
              </h2>
              <p className="text-slate-500 italic">No files attached yet.</p>
              <Button variant="outline" className="mt-4">
                Upload Files
              </Button>
            </div>

            {/* Contacts Snapshot */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Contacts Snapshot
              </h2>
              <p className="text-slate-500 italic">No contacts linked yet.</p>
              <Button variant="outline" className="mt-4">
                Link Contacts
              </Button>
            </div>
          </div>

          {/* Right Column: Actions & AI Panel */}
          <div className="space-y-6">
            {/* Contract Hub Link */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Contract Management</h2>
              <p className="text-sm text-slate-600 mb-4">Access full contract hub for detailed management.</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Go to Contract Hub
              </Button>
            </div>

            {/* Health Status */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Health Status</h2>
              <p className="text-sm text-slate-600 mb-4">Update contract health status.</p>
              <div className="space-y-2">
                <Button
                  variant={contract.health === 'healthy' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => updateHealthMutation.mutate({ id: contractId, workspaceId, health: 'healthy' })}
                  disabled={updateHealthMutation.isPending}
                >
                  Healthy
                </Button>
                <Button
                  variant={contract.health === 'at_risk' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => updateHealthMutation.mutate({ id: contractId, workspaceId, health: 'at_risk' })}
                  disabled={updateHealthMutation.isPending}
                >
                  At Risk
                </Button>
                <Button
                  variant={contract.health === 'warning' ? 'default' : 'outline'}
                  className="w-full justify-start text-red-600"
                  onClick={() => updateHealthMutation.mutate({ id: contractId, workspaceId, health: 'warning' })}
                  disabled={updateHealthMutation.isPending}
                >
                  Warning
                </Button>
              </div>
            </div>

            {/* AI Assistance Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                AI Contract Assistance
              </h2>
              <p className="text-sm text-slate-700 mb-4">
                AI can help you track compliance, identify risks, and manage deliverables.
              </p>
              <Button variant="outline" className="w-full">
                Get AI Insights
              </Button>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditDialogOpen(true)}
            >
              Edit Contract
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Contract</DialogTitle>
            </DialogHeader>
            <ContractForm
              workspaceId={workspaceId}
              contractId={contractId}
              onSuccess={() => {
                setIsEditDialogOpen(false);
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </WorkspaceLayout>
  );
}
