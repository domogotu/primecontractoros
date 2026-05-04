import { useState } from 'react';
import { CreditCard, Search, Filter, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockPayments = [
  {
    id: 1,
    paymentReference: 'PAY-2026-001',
    linkedContract: 'IT Infrastructure Support - Year 1',
    paymentDate: '2026-05-02',
    amountReceived: 50000,
    method: 'ACH Transfer',
    matchState: 'Matched',
    receiptFilePresent: true,
  },
  {
    id: 2,
    paymentReference: 'PAY-2026-002',
    linkedContract: 'Cloud Migration Services',
    paymentDate: '2026-04-28',
    amountReceived: 42500,
    method: 'Wire Transfer',
    matchState: 'Partially Matched',
    receiptFilePresent: true,
  },
  {
    id: 3,
    paymentReference: 'PAY-2026-003',
    linkedContract: 'Healthcare IT Compliance',
    paymentDate: '2026-04-20',
    amountReceived: 25000,
    method: 'Check',
    matchState: 'Unmatched',
    receiptFilePresent: false,
  },
  {
    id: 4,
    paymentReference: 'PAY-2026-004',
    linkedContract: 'Defense IT Infrastructure Modernization',
    paymentDate: '2026-04-15',
    amountReceived: 35000,
    method: 'ACH Transfer',
    matchState: 'Needs Review',
    receiptFilePresent: true,
  },
];

const matchStateColors: Record<string, { bg: string; text: string; badge: string }> = {
  'Recorded': { bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' },
  'Matched': { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  'Partially Matched': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  'Unmatched': { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
  'Needs Review': { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
};

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatchState, setFilterMatchState] = useState('All');

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.linkedContract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMatchState === 'All' || payment.matchState === filterMatchState;
    return matchesSearch && matchesFilter;
  });

  const matchStates = ['All', ...Array.from(new Set(mockPayments.map(p => p.matchState)))];
  const totalReceived = mockPayments.reduce((sum, p) => sum + p.amountReceived, 0);
  const unmatchedCount = mockPayments.filter(p => p.matchState === 'Unmatched' || p.matchState === 'Needs Review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-1">Track received payments and reconciliation status</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Received</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">${(totalReceived / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Matched Payments</p>
          <p className="text-2xl font-bold text-green-700 mt-2">
            {mockPayments.filter(p => p.matchState === 'Matched').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Needs Review</p>
          <p className="text-2xl font-bold text-red-700 mt-2">{unmatchedCount}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by payment reference or contract..."
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

      {/* Match State Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {matchStates.map(state => (
          <button
            key={state}
            onClick={() => setFilterMatchState(state)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterMatchState === state
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-slate-200">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No payments found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Record your first payment to get started'}
          </p>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map(payment => {
            const colors = matchStateColors[payment.matchState] || matchStateColors['Recorded'];
            return (
              <div
                key={payment.id}
                className={`${colors.bg} p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{payment.paymentReference}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                        {payment.matchState}
                      </span>
                      {!payment.receiptFilePresent && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Missing Receipt
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{payment.linkedContract}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-slate-600 font-medium">Payment Date</span>
                    <p className="text-slate-900">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Amount</span>
                    <p className="text-slate-900 font-semibold">${(payment.amountReceived / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Method</span>
                    <p className="text-slate-900">{payment.method}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Match State</span>
                    <p className={`font-medium ${colors.text}`}>{payment.matchState}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Receipt</span>
                    <p className={payment.receiptFilePresent ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                      {payment.receiptFilePresent ? 'Present' : 'Missing'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    {payment.matchState === 'Needs Review' ? 'Review & Match' : 'View Details'}
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Upload Receipt
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
