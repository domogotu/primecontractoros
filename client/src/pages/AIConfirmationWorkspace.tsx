import { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Finding {
  id: number;
  type: string;
  title: string;
  description: string;
  sourceFile: string;
  sourcePage: string;
  status: string;
  reviewState: string;
  confidence: number;
  linkedRecord: { type: string; id: number; title: string } | null;
}

export default function AIConfirmationWorkspace() {
  const findings: Finding[] = [
    {
      id: 1,
      type: 'Requirement',
      title: 'Monthly Status Reports Required',
      description: 'Contract requires submission of monthly status reports to contracting officer.',
      sourceFile: 'Contract_N00123-26-C-0001.pdf',
      sourcePage: 'Page 5, Section 2.3',
      status: 'Approved',
      reviewState: 'Approved',
      confidence: 0.98,
      linkedRecord: { type: 'Requirement', id: 1, title: 'Monthly Status Reports' }
    },
    {
      id: 2,
      type: 'Deadline',
      title: 'Security Compliance Audit Due June 15',
      description: 'DFARS security compliance audit must be completed and submitted by June 15, 2026.',
      sourceFile: 'Contract_N00123-26-C-0001.pdf',
      sourcePage: 'Page 8, Section 3.1',
      status: 'Reviewed',
      reviewState: 'Reviewed',
      confidence: 0.95,
      linkedRecord: { type: 'Requirement', id: 2, title: 'Security Compliance Audit' }
    },
    {
      id: 3,
      type: 'Billing',
      title: 'Invoicing Terms: Net 30 from Submission',
      description: 'Invoices must be submitted within 5 days of month-end. Payment terms are Net 30 from invoice submission.',
      sourceFile: 'Contract_N00123-26-C-0001.pdf',
      sourcePage: 'Page 12, Section 5.2',
      status: 'New',
      reviewState: 'New',
      confidence: 0.92,
      linkedRecord: null
    },
    {
      id: 4,
      type: 'Compliance',
      title: 'Cost Accounting Standards (CAS) Apply',
      description: 'Contract value exceeds $2M threshold. Full Cost Accounting Standards compliance required.',
      sourceFile: 'Contract_N00123-26-C-0001.pdf',
      sourcePage: 'Page 15, Section 6.1',
      status: 'Needs Manual Review',
      reviewState: 'Needs Manual Review',
      confidence: 0.88,
      linkedRecord: null
    },
    {
      id: 5,
      type: 'Deliverable',
      title: 'Training Materials Deliverable',
      description: 'Contractor must provide comprehensive training materials for all system users.',
      sourceFile: 'Contract_N00123-26-C-0001.pdf',
      sourcePage: 'Page 18, Section 7.2',
      status: 'Approved',
      reviewState: 'Approved',
      confidence: 0.96,
      linkedRecord: { type: 'Deliverable', id: 3, title: 'Training Materials' }
    },
  ];

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const statusColors: Record<string, string> = {
    'Approved': 'bg-green-100 text-green-800',
    'Reviewed': 'bg-blue-100 text-blue-800',
    'New': 'bg-slate-100 text-slate-800',
    'Needs Manual Review': 'bg-amber-100 text-amber-800',
    'Held': 'bg-red-100 text-red-800',
  };

  const filteredFindings = filterStatus === 'all' 
    ? findings 
    : findings.filter(f => f.reviewState === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Contract Analysis</h1>
        <p className="text-slate-600">Review and approve AI findings from contract analysis. All findings are source-linked and require review before becoming operational.</p>
      </div>

      {/* Source File Selection */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Source Files
        </h3>
        <div className="space-y-2">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
            <p className="font-medium text-slate-900">Contract_N00123-26-C-0001.pdf</p>
            <p className="text-sm text-slate-600">Primary contract document • 25 pages • Analyzed</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <p className="font-medium text-slate-900">Modifications_MOD-001.pdf</p>
            <p className="text-sm text-slate-600">Modification document • 5 pages • Ready to analyze</p>
          </div>
        </div>
      </div>

      {/* Findings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600 font-medium">Total Findings</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{findings.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{findings.filter(f => f.reviewState === 'Approved').length}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Reviewed</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{findings.filter(f => f.reviewState === 'Reviewed').length}</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-700 font-medium">Needs Review</p>
          <p className="text-3xl font-bold text-amber-900 mt-2">{findings.filter(f => f.reviewState === 'New' || f.reviewState === 'Needs Manual Review').length}</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search findings..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Approved">Approved</option>
            <option value="Needs Manual Review">Needs Manual Review</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.map(finding => (
          <div
            key={finding.id}
            onClick={() => setSelectedFinding(finding)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedFinding?.id === finding.id
                ? 'bg-blue-50 border-blue-300 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-800">
                    {finding.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[finding.status] || 'bg-slate-100 text-slate-800'}`}>
                    {finding.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900">{finding.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{finding.description}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-xs text-slate-600 font-medium">Confidence</p>
                <p className="text-lg font-bold text-slate-900">{(finding.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{finding.sourceFile} • {finding.sourcePage}</span>
              {finding.linkedRecord && (
                <span className="text-blue-700 font-medium">Linked to {finding.linkedRecord.type}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Finding Detail */}
      {selectedFinding && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Review & Approve</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Finding</p>
              <p className="text-slate-900">{selectedFinding.title}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Source</p>
              <p className="text-slate-900">{selectedFinding.sourceFile} • {selectedFinding.sourcePage}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Current Status</p>
              <p className="text-slate-900">{selectedFinding.reviewState}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-300">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
              <Button variant="outline">Hold for Review</Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700">Reject</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
