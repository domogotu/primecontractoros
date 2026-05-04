import { BarChart3, AlertTriangle, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Workspace Health Reports</h1>
        <p className="text-slate-600">Overview of your entire contracting operation with key metrics, at-risk items, and actionable insights.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 font-medium">Active Opportunities</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">8</p>
          <p className="text-sm text-slate-600 mt-2">Total pipeline value: $2.4M</p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 font-medium">Active Contracts</p>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">5</p>
          <p className="text-sm text-slate-600 mt-2">Total value: $1.8M</p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 font-medium">Outstanding Balance</p>
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-700">$425K</p>
          <p className="text-sm text-slate-600 mt-2">Across 3 contracts</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* At-Risk Items */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                At-Risk Items (3)
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="font-medium text-slate-900">Contract N00123-26-C-0001</p>
                  <p className="text-sm text-red-700 mt-1">Security compliance audit overdue by 2 days</p>
                </div>
                <div className="p-3 bg-amber-50 rounded border border-amber-200">
                  <p className="font-medium text-slate-900">Proposal: Defense IT Infrastructure</p>
                  <p className="text-sm text-amber-700 mt-1">Final submission due in 3 days</p>
                </div>
                <div className="p-3 bg-amber-50 rounded border border-amber-200">
                  <p className="font-medium text-slate-900">Invoice INV-2026-001</p>
                  <p className="text-sm text-amber-700 mt-1">Payment 45 days overdue</p>
                </div>
              </div>
            </div>

            {/* Open Tasks */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Open Tasks (12)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-slate-900">Complete implementation plan</span>
                  <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 font-medium">High</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-slate-900">Submit compliance evidence</span>
                  <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 font-medium">Critical</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-slate-900">Follow up on payment</span>
                  <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 font-medium">High</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-slate-900">Review proposal feedback</span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">Medium</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">View All Tasks</Button>
            </div>
          </div>

          {/* Coverage Report */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Coverage Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-2">Contacts Linked</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">85%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-2">Files Linked</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">72%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-2">Support Files Present</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">65%</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Opportunity Pipeline</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">New Opportunities</p>
                  <p className="text-sm text-slate-600">Not yet evaluated</p>
                </div>
                <span className="text-2xl font-bold text-slate-900">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">In Review</p>
                  <p className="text-sm text-slate-600">Under evaluation</p>
                </div>
                <span className="text-2xl font-bold text-slate-900">2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                <div>
                  <p className="font-medium text-slate-900">Pursuing</p>
                  <p className="text-sm text-slate-600">Active pursuit</p>
                </div>
                <span className="text-2xl font-bold text-green-900">2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">On Hold</p>
                  <p className="text-sm text-slate-600">Paused</p>
                </div>
                <span className="text-2xl font-bold text-slate-900">1</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Proposal Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                <div>
                  <p className="font-medium text-slate-900">In Progress</p>
                  <p className="text-sm text-slate-600">Being built</p>
                </div>
                <span className="text-2xl font-bold text-blue-900">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">Submitted</p>
                  <p className="text-sm text-slate-600">Awaiting decision</p>
                </div>
                <span className="text-2xl font-bold text-slate-900">2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                <div>
                  <p className="font-medium text-slate-900">Won</p>
                  <p className="text-sm text-slate-600">Awarded</p>
                </div>
                <span className="text-2xl font-bold text-green-900">5</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Contract Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                <div>
                  <p className="font-medium text-slate-900">Healthy</p>
                  <p className="text-sm text-slate-600">On track</p>
                </div>
                <span className="text-2xl font-bold text-green-900">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200">
                <div>
                  <p className="font-medium text-slate-900">At Risk</p>
                  <p className="text-sm text-slate-600">Needs attention</p>
                </div>
                <span className="text-2xl font-bold text-amber-900">1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">Closeout</p>
                  <p className="text-sm text-slate-600">Wrapping up</p>
                </div>
                <span className="text-2xl font-bold text-slate-900">1</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <p className="font-medium text-slate-900">Total Billed</p>
                <p className="text-2xl font-bold text-slate-900">$1.2M</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                <p className="font-medium text-slate-900">Total Paid</p>
                <p className="text-2xl font-bold text-green-900">$775K</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <p className="font-medium text-slate-900">Outstanding</p>
                <p className="text-2xl font-bold text-red-900">$425K</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200">
                <p className="font-medium text-slate-900">Overdue (30+ days)</p>
                <p className="text-2xl font-bold text-amber-900">$180K</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Open Alerts</h3>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Security Compliance Overdue</p>
                    <p className="text-sm text-slate-600 mt-1">Contract N00123-26-C-0001 compliance audit was due 2 days ago</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Payment Overdue</p>
                    <p className="text-sm text-slate-600 mt-1">Invoice INV-2026-001 has been outstanding for 45 days</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Proposal Approaching Deadline</p>
                    <p className="text-sm text-slate-600 mt-1">Defense IT Infrastructure proposal due in 3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
