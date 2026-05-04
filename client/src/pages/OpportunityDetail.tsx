import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OpportunityDetail() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'new' | 'in-review' | 'pursue' | 'hold' | 'no-pursue'>('in-review');

  const opportunity = {
    id: '1',
    title: 'Defense IT Infrastructure Modernization',
    agency: 'Department of Defense',
    solicitationNumber: 'W912DQ-26-R-0001',
    naics: '541511',
    dueDate: '2026-06-15',
    type: 'RFP',
    value: '$2.5M - $5M',
    description: 'Modernization of IT infrastructure for DoD regional offices across North America.',
    sourceLink: 'https://sam.gov/opp/...',
    linkedFiles: [
      { id: '1', name: 'RFP_Full_Document.pdf', size: '2.4 MB' },
      { id: '2', name: 'Evaluation_Criteria.pdf', size: '1.1 MB' },
      { id: '3', name: 'Technical_Specifications.pdf', size: '3.2 MB' },
    ],
    linkedContacts: [
      { id: '1', name: 'Sarah Johnson', title: 'Contracting Officer', company: 'DoD' },
      { id: '2', name: 'Michael Chen', title: 'Technical Reviewer', company: 'DoD' },
    ],
  };

  const reviewChecklist = [
    { item: 'Reviewed full RFP document', completed: true },
    { item: 'Assessed technical requirements', completed: true },
    { item: 'Evaluated compliance requirements', completed: false },
    { item: 'Estimated resource needs', completed: false },
    { item: 'Identified key contacts', completed: true },
    { item: 'Determined fit with capabilities', completed: false },
  ];

  const completedItems = reviewChecklist.filter((item) => item.completed).length;
  const progress = (completedItems / reviewChecklist.length) * 100;

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
        <button
          onClick={() => navigate('/app/opportunities')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </button>

        <div className="section-header">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2>{opportunity.title}</h2>
                <StatusBadge status={status} />
              </div>
              <p className="text-slate-600">{opportunity.agency}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Summary */}
          <div className="col-span-2 space-y-6">
            {/* Key Details */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Opportunity Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600">Solicitation Number</p>
                  <p className="font-medium text-slate-900">{opportunity.solicitationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Type</p>
                  <p className="font-medium text-slate-900">{opportunity.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Due Date</p>
                  <p className="font-medium text-slate-900">{new Date(opportunity.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Estimated Value</p>
                  <p className="font-medium text-slate-900">{opportunity.value}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Description</h3>
              <p className="text-slate-700">{opportunity.description}</p>
            </div>

            {/* Review Checklist */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Review Checklist</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{completedItems} of {reviewChecklist.length} complete</span>
                  <span className="text-sm font-medium text-slate-900">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <div className="space-y-3">
                {reviewChecklist.map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-700'}>{item.item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Source Files */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Source Files</h3>
              </div>
              <div className="space-y-2">
                {opportunity.linkedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{file.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Key Contacts</h3>
              </div>
              <div className="space-y-3">
                {opportunity.linkedContacts.map((contact) => (
                  <div key={contact.id} className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">{contact.name}</p>
                    <p className="text-xs text-slate-600">{contact.title} • {contact.company}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Decision */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Decision</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setStatus('pursue')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    status === 'pursue'
                      ? 'bg-green-100 text-green-700 border-2 border-green-600'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  Pursue
                </button>
                <button
                  onClick={() => setStatus('hold')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    status === 'hold'
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-600'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Hold
                </button>
                <button
                  onClick={() => setStatus('no-pursue')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    status === 'no-pursue'
                      ? 'bg-red-100 text-red-700 border-2 border-red-600'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  No Pursue
                </button>
              </div>

              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                Convert to Proposal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
