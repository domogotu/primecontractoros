import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ExternalLink, FileText } from 'lucide-react';

const mockProposals = [
  {
    id: '1',
    title: 'Defense IT Infrastructure Modernization - Proposal',
    opportunity: 'Defense IT Infrastructure Modernization',
    framework: 'Standard Structured',
    status: 'in-progress' as const,
    internalDueDate: '2026-05-30',
    submissionDate: '2026-06-10',
    files: 8,
    contacts: 3,
    readinessPercent: 75,
  },
  {
    id: '2',
    title: 'Cloud Services - Federal Agencies',
    opportunity: 'Cloud Services for Federal Agencies',
    framework: 'Technical/Compliance',
    status: 'draft' as const,
    internalDueDate: '2026-06-15',
    submissionDate: '2026-06-25',
    files: 2,
    contacts: 1,
    readinessPercent: 30,
  },
];

export default function Proposals() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProposals = mockProposals.filter((prop) =>
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.opportunity.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={() => navigate('/app/proposal-frameworks')}
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

        {/* Proposals List */}
        {filteredProposals.length > 0 ? (
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
                      <StatusBadge status={proposal.status === 'in-progress' ? 'submitted' : 'draft'} size="sm" />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Linked to: {proposal.opportunity}</p>

                    {/* Readiness Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">Readiness</span>
                        <span className="text-xs font-semibold text-slate-900">{proposal.readinessPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${proposal.readinessPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Framework</p>
                        <p className="font-medium text-slate-900">{proposal.framework}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Internal Due</p>
                        <p className="font-medium text-slate-900">{new Date(proposal.internalDueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Submission</p>
                        <p className="font-medium text-slate-900">{new Date(proposal.submissionDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Resources</p>
                        <p className="font-medium text-slate-900">{proposal.files} files • {proposal.contacts} contacts</p>
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
              onClick={() => navigate('/app/proposal-frameworks')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
