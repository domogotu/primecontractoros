import { useState } from 'react';
import { FileText, Search, Filter, DollarSign, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-001',
    linkedContract: 'IT Infrastructure Support - Year 1',
    invoiceDate: '2026-05-01',
    amountBilled: 125000,
    dueDate: '2026-05-31',
    status: 'Submitted',
    amountReceived: 0,
    remainingBalance: 125000,
    supportFilePresent: true,
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-002',
    linkedContract: 'Cloud Migration Services',
    invoiceDate: '2026-04-15',
    amountBilled: 85000,
    dueDate: '2026-05-15',
    status: 'Partially Paid',
    amountReceived: 50000,
    remainingBalance: 35000,
    supportFilePresent: true,
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-003',
    linkedContract: 'Healthcare IT Compliance',
    invoiceDate: '2026-04-01',
    amountBilled: 42500,
    dueDate: '2026-05-01',
    status: 'Overdue',
    amountReceived: 0,
    remainingBalance: 42500,
    supportFilePresent: false,
  },
];

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  'Submitted': { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  'Partially Paid': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  'Paid': { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  'Overdue': { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.linkedContract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statuses = ['All', ...Array.from(new Set(mockInvoices.map(i => i.status)))];
  const isOverdue = (dueDate: string, status: string) => new Date(dueDate) < new Date() && status !== 'Paid';

  const totalBilled = mockInvoices.reduce((sum, inv) => sum + inv.amountBilled, 0);
  const totalPaid = mockInvoices.reduce((sum, inv) => sum + inv.amountReceived, 0);
  const totalOutstanding = mockInvoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">Track invoices, payments, and billing status</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
          <FileText className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Billed</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">${(totalBilled / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Paid</p>
          <p className="text-2xl font-bold text-green-700 mt-2">${(totalPaid / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Outstanding</p>
          <p className="text-2xl font-bold text-red-700 mt-2">${(totalOutstanding / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by invoice number or contract..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No invoices found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first invoice to get started'}
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <FileText className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map(invoice => {
            const colors = statusColors[invoice.status] || statusColors['Submitted'];
            const overdue = isOverdue(invoice.dueDate, invoice.status);
            return (
              <div
                key={invoice.id}
                className={`${colors.bg} p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{invoice.invoiceNumber}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                        {invoice.status}
                      </span>
                      {overdue && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                      {!invoice.supportFilePresent && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                          Missing Support File
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{invoice.linkedContract}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-slate-600 font-medium">Invoice Date</span>
                    <p className="text-slate-900">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Amount Billed</span>
                    <p className="text-slate-900 font-semibold">${(invoice.amountBilled / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Amount Received</span>
                    <p className={`font-semibold ${invoice.amountReceived > 0 ? 'text-green-700' : 'text-slate-900'}`}>
                      ${(invoice.amountReceived / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Outstanding</span>
                    <p className={`font-semibold ${invoice.remainingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      ${(invoice.remainingBalance / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Due Date</span>
                    <p className={`${overdue ? 'text-red-700 font-semibold' : 'text-slate-900'}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Record Payment
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
