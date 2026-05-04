import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, DollarSign, FileText, Users, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContractHub() {
  const [activeTab, setActiveTab] = useState('overview');

  const contract = {
    id: 1,
    title: 'IT Infrastructure Support - Year 1',
    contractNumber: 'N00123-26-C-0001',
    agency: 'Department of Defense',
    value: 250000,
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    status: 'Active',
    health: 'Healthy',
    proposalTitle: 'Defense IT - Proposal',
    modifications: 2,
    openAlerts: 3,
    openTasks: 5,
    outstandingBalance: 125000,
  };

  const requirements = [
    { id: 1, title: 'Monthly Status Reports', dueDate: '2026-05-31', status: 'On Track', priority: 'High' },
    { id: 2, title: 'Security Compliance Audit', dueDate: '2026-06-15', status: 'At Risk', priority: 'Critical' },
    { id: 3, title: 'Q2 Performance Review', dueDate: '2026-06-30', status: 'On Track', priority: 'Medium' },
  ];

  const deliverables = [
    { id: 1, title: 'System Architecture Documentation', dueDate: '2026-05-15', status: 'Completed', submitted: '2026-05-10' },
    { id: 2, title: 'Implementation Plan', dueDate: '2026-05-31', status: 'In Progress', submitted: null },
    { id: 3, title: 'Training Materials', dueDate: '2026-06-30', status: 'Not Started', submitted: null },
  ];

  const complianceItems = [
    { id: 1, title: 'DFARS Compliance Review', status: 'Approved', evidence: 'Present' },
    { id: 2, title: 'Security Clearance Verification', status: 'Pending', evidence: 'Pending' },
    { id: 3, title: 'Cost Accounting Standards', status: 'Approved', evidence: 'Present' },
  ];

  const modifications = [
    { id: 1, number: 'MOD-001', title: 'Scope Increase - Additional Support Hours', value: 25000, date: '2026-04-15', status: 'Executed' },
    { id: 2, number: 'MOD-002', title: 'Schedule Extension - 30 Days', value: 0, date: '2026-05-01', status: 'Pending Approval' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{contract.title}</h1>
            <p className="text-slate-600 mt-1">Contract {contract.contractNumber} • {contract.agency}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
              {contract.status}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-600 font-medium">Contract Value</p>
            <p className="text-2xl font-bold text-slate-900">${(contract.value / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 font-medium">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-700">${(contract.outstandingBalance / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 font-medium">Duration</p>
            <p className="text-sm text-slate-900 font-semibold">Apr 2026 - Mar 2027</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 font-medium">Health Status</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">{contract.health}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Actions */}
      {contract.openAlerts > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">{contract.openAlerts} Open Alerts</h3>
            <p className="text-sm text-red-700 mt-1">Review compliance and deadline alerts to keep contract on track.</p>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            View Alerts
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Governing Source */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Governing Source
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Awarded Proposal</p>
                  <p className="text-slate-900">{contract.proposalTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">RFP Reference</p>
                  <p className="text-slate-900">Defense IT Infrastructure Modernization</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Proposal Context
                </Button>
              </div>
            </div>

            {/* Modifications */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Modifications ({contract.modifications})
              </h3>
              <div className="space-y-2">
                {modifications.map(mod => (
                  <div key={mod.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                    <p className="font-medium text-slate-900">{mod.number}: {mod.title}</p>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        mod.status === 'Executed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {mod.status}
                      </span>
                      {mod.value > 0 && <span className="text-slate-600">+${(mod.value / 1000).toFixed(0)}K</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Actions */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-slate-600" />
              Next Actions
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded border border-slate-200">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Security Compliance Audit Due</p>
                  <p className="text-sm text-slate-600">June 15, 2026 (11 days remaining)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded border border-slate-200">
                <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Invoice INV-2026-001 Outstanding</p>
                  <p className="text-sm text-slate-600">$125K awaiting payment</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded border border-slate-200">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Implementation Plan Due</p>
                  <p className="text-sm text-slate-600">May 31, 2026 (27 days remaining)</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <div className="space-y-3">
            {requirements.map(req => (
              <div key={req.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{req.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    req.status === 'On Track' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${req.priority === 'Critical' ? 'text-red-700' : req.priority === 'High' ? 'text-amber-700' : 'text-slate-600'}`}>
                    {req.priority} Priority
                  </span>
                  <span className="text-slate-600">Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Deliverables Tab */}
        <TabsContent value="deliverables" className="space-y-4">
          <div className="space-y-3">
            {deliverables.map(del => (
              <div key={del.id} className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{del.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    del.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    del.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {del.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Due: {new Date(del.dueDate).toLocaleDateString()}</span>
                  {del.submitted && <span className="text-green-700">Submitted: {new Date(del.submitted).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="space-y-3">
            {complianceItems.map(item => (
              <div key={item.id} className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.evidence === 'Present' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.evidence}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-lg border border-slate-200 text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-900 mb-2">Files</h4>
            <p className="text-2xl font-bold text-slate-900">12</p>
            <p className="text-sm text-slate-600 mt-2">Contract documents and deliverables</p>
            <Button variant="outline" size="sm" className="w-full mt-4">View Files</Button>
          </div>

          <div className="p-6 bg-white rounded-lg border border-slate-200 text-center">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-900 mb-2">Contacts</h4>
            <p className="text-2xl font-bold text-slate-900">8</p>
            <p className="text-sm text-slate-600 mt-2">Agency and internal contacts</p>
            <Button variant="outline" size="sm" className="w-full mt-4">View Contacts</Button>
          </div>

          <div className="p-6 bg-white rounded-lg border border-slate-200 text-center">
            <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-900 mb-2">Messages</h4>
            <p className="text-2xl font-bold text-slate-900">5</p>
            <p className="text-sm text-slate-600 mt-2">Communication records</p>
            <Button variant="outline" size="sm" className="w-full mt-4">View Messages</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
