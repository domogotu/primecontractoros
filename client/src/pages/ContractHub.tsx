import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, DollarSign, FileText, Users, MessageSquare, AlertTriangle, ArrowRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Footer from '@/components/Footer';

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navy Header */}
      <div className="bg-blue-900 text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Run the Contract From One Structured Workspace</h1>
          <p className="text-blue-100 mb-6">Manage all contract activities, track obligations, and maintain compliance in one place</p>
          <div className="flex gap-3 flex-wrap">
            <Button className="bg-white text-blue-900 hover:bg-gray-100">
              <Upload className="w-4 h-4 mr-2" /> Upload Governing File
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Run/Review AI Confirmation
            </Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white">
              <MessageSquare className="w-4 h-4 mr-2" /> Add Update/Note
            </Button>
            <Button className="bg-gray-600 hover:bg-gray-700 text-white">
              <FileText className="w-4 h-4 mr-2" /> Open Help
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Contract Title</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{contract.title}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-semibold text-gray-900">{contract.status}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Contract Value</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">${(contract.value / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Outstanding Balance</p>
              <p className="text-sm font-semibold text-red-600 mt-1">${(contract.outstandingBalance / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Open Alerts</p>
              <p className="text-sm font-semibold text-amber-600 mt-1">{contract.openAlerts}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Open Tasks</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{contract.openTasks}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Health Status</p>
              <p className="text-sm font-semibold text-green-600 mt-1">{contract.health}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Executive Summary */}
          <Card className="bg-white border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Contract Number</p>
                <p className="text-lg font-semibold text-gray-900">{contract.contractNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Contracting Agency</p>
                <p className="text-lg font-semibold text-gray-900">{contract.agency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Performance Period</p>
                <p className="text-lg font-semibold text-gray-900">Apr 2026 - Mar 2027</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Contract Type</p>
                <p className="text-lg font-semibold text-gray-900">Fixed Price</p>
              </div>
            </div>
          </Card>

          {/* Governing Source Summary */}
          <Card className="bg-white border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Source Summary</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Awarded Proposal</p>
                <p className="text-sm text-gray-900">{contract.proposalTitle}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">RFP Reference</p>
                <p className="text-sm text-gray-900">Defense IT Infrastructure Modernization - Solicitation No. N00123-26-R-0001</p>
              </div>
              <Button variant="outline" className="w-full">View Proposal Context</Button>
            </div>
          </Card>

          {/* Live Tracking Snapshot */}
          <Card className="bg-white border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Tracking Snapshot</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-gray-900 uppercase">Deliverables Met</p>
                </div>
                <p className="text-2xl font-bold text-green-600">12/12</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <p className="text-xs font-semibold text-gray-900 uppercase">At Risk</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">1</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-gray-900 uppercase">Team Members</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-xs font-semibold text-gray-900 uppercase">Critical Issues</p>
                </div>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
            </div>
          </Card>

          {/* Changes & Modifications */}
          <Card className="bg-white border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes & Modifications ({contract.modifications})</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">MOD-001: Scope Increase - Additional Support Hours</p>
                  <p className="text-xs text-gray-600 mt-1">Approved on Apr 15, 2026 • Value: +$25K</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Executed</span>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">MOD-002: Schedule Extension - 30 Days</p>
                  <p className="text-xs text-gray-600 mt-1">Pending approval since May 1, 2026</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">Pending</span>
              </div>
            </div>
          </Card>

          {/* Files, Contacts, Notes */}
          <Card className="bg-white border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Files, Contacts & Notes</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600 mt-2">Contract Documents</p>
                <Button variant="outline" size="sm" className="w-full mt-4">View Files</Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-600 mt-2">Key Contacts</p>
                <Button variant="outline" size="sm" className="w-full mt-4">View Contacts</Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600 mt-2">Notes & Updates</p>
                <Button variant="outline" size="sm" className="w-full mt-4">View Notes</Button>
              </div>
            </div>
          </Card>

          {/* Alerts and Tasks */}
          <Card className="bg-white border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Alerts and Tasks</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Security Compliance Audit Due</p>
                  <p className="text-xs text-gray-600 mt-1">Due: June 15, 2026 (11 days remaining)</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">Critical</span>
              </div>
              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Monthly Status Report Due</p>
                  <p className="text-xs text-gray-600 mt-1">Due: May 31, 2026 (27 days remaining)</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">Warning</span>
              </div>
            </div>
          </Card>

          {/* Next Actions */}
          <Card className="bg-white border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Actions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Q2 Compliance Report Due</p>
                  <p className="text-xs text-gray-600 mt-1">Due: May 31, 2026</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Start</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Invoice INV-2026-001 Outstanding</p>
                  <p className="text-xs text-gray-600 mt-1">$125K awaiting payment</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white">Follow Up</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
