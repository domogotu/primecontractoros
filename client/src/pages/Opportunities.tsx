import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ExternalLink, Target } from 'lucide-react';

// Mock data - will be replaced with tRPC calls
const mockOpportunities = [
  {
    id: '1',
    title: 'Defense IT Infrastructure Modernization',
    agency: 'Department of Defense',
    solicitationNumber: 'W912DQ-26-R-0001',
    naics: '541511',
    dueDate: '2026-06-15',
    type: 'RFP',
    status: 'in-review' as const,
    value: '$2.5M - $5M',
    linkedFiles: 3,
    linkedContacts: 2,
  },
  {
    id: '2',
    title: 'Cloud Services for Federal Agencies',
    agency: 'General Services Administration',
    solicitationNumber: 'GS-07F-0123K',
    naics: '518210',
    dueDate: '2026-07-01',
    type: 'RFQ',
    status: 'new' as const,
    value: '$1M - $3M',
    linkedFiles: 1,
    linkedContacts: 1,
  },
  {
    id: '3',
    title: 'Healthcare IT Solutions',
    agency: 'Department of Veterans Affairs',
    solicitationNumber: 'VA-2026-001',
    naics: '541512',
    dueDate: '2026-05-30',
    type: 'RFP',
    status: 'pursue' as const,
    value: '$500K - $1.5M',
    linkedFiles: 5,
    linkedContacts: 3,
  },
];

export default function Opportunities() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredOpportunities = mockOpportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.solicitationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || opp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
              onClick={() => navigate('/app/opportunities/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </Button>
          </div>
        </div>

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

        {/* Opportunities List */}
        {filteredOpportunities.length > 0 ? (
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
                      <StatusBadge status={opp.status} size="sm" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Agency</p>
                        <p className="font-medium text-slate-900">{opp.agency}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Solicitation</p>
                        <p className="font-medium text-slate-900">{opp.solicitationNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Due Date</p>
                        <p className="font-medium text-slate-900">{new Date(opp.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Estimated Value</p>
                        <p className="font-medium text-slate-900">{opp.value}</p>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                </div>
                <div className="flex gap-6 mt-4 text-xs text-slate-600">
                  <span>{opp.linkedFiles} files</span>
                  <span>{opp.linkedContacts} contacts</span>
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
              onClick={() => navigate('/app/opportunities/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </Button>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
