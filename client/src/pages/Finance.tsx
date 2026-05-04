import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Finance() {
  const financeSummary = {
    totalBilled: 252500,
    totalPaid: 92500,
    outstandingBalance: 160000,
    overdueInvoices: 1,
    unmatchedPayments: 2,
    missingBillingContacts: 1,
    missingSupportFiles: 2,
  };

  const overdueInvoices = [
    { number: 'INV-2026-003', amount: 42500, daysOverdue: 3 },
  ];

  const unmatchedPayments = [
    { reference: 'PAY-2026-003', amount: 25000, status: 'Unmatched' },
    { reference: 'PAY-2026-004', amount: 35000, status: 'Needs Review' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Finance Summary</h1>
        <p className="text-slate-600 mt-1">Overview of billing, payments, and financial status</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Billed</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">${(financeSummary.totalBilled / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-500 mt-2">Across all contracts</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Paid</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-700">${(financeSummary.totalPaid / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-500 mt-2">
            {((financeSummary.totalPaid / financeSummary.totalBilled) * 100).toFixed(0)}% collected
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Outstanding</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-700">${(financeSummary.outstandingBalance / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-500 mt-2">Awaiting payment</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Collection Rate</p>
            <DollarSign className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {((financeSummary.totalPaid / financeSummary.totalBilled) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500 mt-2">Of total billed</p>
        </div>
      </div>

      {/* Attention Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Invoices */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Overdue Invoices</h2>
            <span className="ml-auto bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
              {financeSummary.overdueInvoices}
            </span>
          </div>
          <div className="space-y-3">
            {overdueInvoices.map(inv => (
              <div key={inv.number} className="bg-white p-3 rounded border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{inv.number}</p>
                    <p className="text-sm text-red-700">{inv.daysOverdue} days overdue</p>
                  </div>
                  <p className="text-lg font-bold text-red-700">${(inv.amount / 1000).toFixed(1)}K</p>
                </div>
              </div>
            ))}
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-2">
              View All Overdue
            </Button>
          </div>
        </div>

        {/* Unmatched Payments */}
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900">Unmatched Payments</h2>
            <span className="ml-auto bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full">
              {financeSummary.unmatchedPayments}
            </span>
          </div>
          <div className="space-y-3">
            {unmatchedPayments.map(pay => (
              <div key={pay.reference} className="bg-white p-3 rounded border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{pay.reference}</p>
                    <p className="text-sm text-amber-700">{pay.status}</p>
                  </div>
                  <p className="text-lg font-bold text-amber-700">${(pay.amount / 1000).toFixed(1)}K</p>
                </div>
              </div>
            ))}
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-2">
              Review & Match
            </Button>
          </div>
        </div>
      </div>

      {/* Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Missing Billing Contacts</h3>
            <span className="ml-auto bg-slate-200 text-slate-800 text-sm font-bold px-3 py-1 rounded-full">
              {financeSummary.missingBillingContacts}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Add billing contacts to ensure invoices reach the right people.
          </p>
          <Button variant="outline" className="w-full">
            Add Billing Contacts
          </Button>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Missing Support Files</h3>
            <span className="ml-auto bg-slate-200 text-slate-800 text-sm font-bold px-3 py-1 rounded-full">
              {financeSummary.missingSupportFiles}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Upload support files for invoices and payments to complete your records.
          </p>
          <Button variant="outline" className="w-full">
            Upload Files
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="text-sm">
            New Invoice
          </Button>
          <Button variant="outline" className="text-sm">
            Record Payment
          </Button>
          <Button variant="outline" className="text-sm">
            View Invoices
          </Button>
          <Button variant="outline" className="text-sm">
            View Payments
          </Button>
        </div>
      </div>
    </div>
  );
}
