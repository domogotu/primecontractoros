import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, AlertTriangle, Receipt, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import PageLayout from "@/components/PageLayout";

export default function Finance() {
  const [, navigate] = useLocation();
  const { data: invoices = [], isLoading: loadingInv } = trpc.invoices.list.useQuery();
  const { data: payments = [], isLoading: loadingPay } = trpc.payments.list.useQuery();
  const { data: financeSummary } = trpc.finance.summary.useQuery();

  const totalBilled = (invoices as any[]).reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);
  const totalPaid = (payments as any[]).reduce((sum, pay) => sum + parseFloat(pay.amount || "0"), 0);
  const outstanding = totalBilled - totalPaid;
  const overdueInvoices = (invoices as any[]).filter((inv) => {
    if (inv.status === "paid") return false;
    if (!inv.dueDate) return false;
    return new Date(inv.dueDate) < new Date();
  });
  const unmatchedPayments = (payments as any[]).filter((p) => !p.invoiceId);

  const isLoading = loadingInv || loadingPay;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  return (
    <PageLayout
      title="Finance Summary"
      subtitle="Aggregated financial overview across all contracts — invoices, payments, and outstanding balances"
      label="Financial Overview"
    >
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading financial data...</div>
      ) : (invoices as any[]).length === 0 && (payments as any[]).length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Financial Data</h3>
          <p className="text-gray-600 mb-6">
            Create invoices and record payments against your government contracts to see your financial summary here.
            Navigate to Invoices or Payments to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/app/invoices")} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Receipt className="w-4 h-4 mr-2" /> Go to Invoices
            </Button>
            <Button onClick={() => navigate("/app/payments")} variant="outline">
              <CreditCard className="w-4 h-4 mr-2" /> Go to Payments
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-500">Total Billed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBilled)}</p>
              <p className="text-xs text-gray-500 mt-1">{(invoices as any[]).length} invoices</p>
            </Card>

            <Card className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Total Paid</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-gray-500 mt-1">{(payments as any[]).length} payments</p>
            </Card>

            <Card className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <span className="text-sm text-gray-500">Outstanding Balance</span>
              </div>
              <p className={`text-2xl font-bold ${outstanding > 0 ? "text-amber-700" : "text-green-700"}`}>
                {formatCurrency(outstanding)}
              </p>
            </Card>

            <Card className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-500">Overdue Invoices</span>
              </div>
              <p className={`text-2xl font-bold ${overdueInvoices.length > 0 ? "text-red-700" : "text-gray-900"}`}>
                {overdueInvoices.length}
              </p>
            </Card>
          </div>

          {/* Overdue Invoices */}
          {overdueInvoices.length > 0 && (
            <Card className="bg-white border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Overdue Invoices
              </h3>
              <div className="space-y-3">
                {overdueInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{inv.description || "No description"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700">{formatCurrency(parseFloat(inv.amount || "0"))}</p>
                      <p className="text-xs text-red-600">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Unmatched Payments */}
          {unmatchedPayments.length > 0 && (
            <Card className="bg-white border border-amber-200 p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">Unmatched Payments ({unmatchedPayments.length})</h3>
              <p className="text-sm text-gray-600 mb-3">These payments are not linked to any invoice. Match them to maintain accurate records.</p>
              <div className="space-y-2">
                {unmatchedPayments.slice(0, 5).map((pay: any) => (
                  <div key={pay.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{pay.reference || `Payment #${pay.id}`}</p>
                      <p className="text-xs text-gray-500">{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : "No date"}</p>
                    </div>
                    <p className="font-bold text-amber-700">{formatCurrency(parseFloat(pay.amount || "0"))}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Contract-Level Breakdown */}
          {financeSummary && financeSummary.byContract && financeSummary.byContract.length > 0 && (
            <Card className="bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> By Contract
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-600">Contract</th>
                      <th className="text-right py-2 font-medium text-gray-600">Billed</th>
                      <th className="text-right py-2 font-medium text-gray-600">Paid</th>
                      <th className="text-right py-2 font-medium text-gray-600">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeSummary.byContract.map((c: any) => (
                      <tr key={c.contractId} className="border-b border-gray-100">
                        <td className="py-2">{c.contractTitle || `Contract #${c.contractId}`}</td>
                        <td className="py-2 text-right">{formatCurrency(c.totalBilled)}</td>
                        <td className="py-2 text-right text-green-700">{formatCurrency(c.totalPaid)}</td>
                        <td className="py-2 text-right text-amber-700">{formatCurrency(c.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Quick Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/invoices")}>
              <div className="flex items-center gap-3">
                <Receipt className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Invoices</h3>
                  <p className="text-sm text-gray-600">Create, track, and manage contract invoices</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/payments")}>
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Payments</h3>
                  <p className="text-sm text-gray-600">Record and match payments to invoices</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
