import { useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import {
  DollarSign, AlertTriangle, CheckCircle2, ArrowLeft, FileText, CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Reconciliation() {
  const { data: invoices = [] } = trpc.invoices.list.useQuery();
  const { data: payments = [] } = trpc.payments.list.useQuery();
  const { data: allApplications = [] } = trpc.payments.allApplications.useQuery();

  // Build reconciliation data
  const reconciliationData = useMemo(() => {
    const invoiceMap = new Map<number, { invoice: any; applied: number }>();
    (invoices as any[]).forEach((inv: any) => {
      invoiceMap.set(inv.id, { invoice: inv, applied: 0 });
    });
    (allApplications as any[]).forEach((app: any) => {
      const entry = invoiceMap.get(app.invoiceId);
      if (entry) {
        entry.applied += parseFloat(app.amount || "0");
      }
    });

    const paymentMap = new Map<number, { payment: any; applied: number }>();
    (payments as any[]).forEach((p: any) => {
      paymentMap.set(p.id, { payment: p, applied: 0 });
    });
    (allApplications as any[]).forEach((app: any) => {
      const entry = paymentMap.get(app.paymentId);
      if (entry) {
        entry.applied += parseFloat(app.amount || "0");
      }
    });

    return { invoiceMap, paymentMap };
  }, [invoices, payments, allApplications]);

  const invoiceEntries = Array.from(reconciliationData.invoiceMap.values());
  const paymentEntries = Array.from(reconciliationData.paymentMap.values());

  // Stats
  const totalInvoiced = invoiceEntries.reduce((s, e) => s + parseFloat(e.invoice.amount || "0"), 0);
  const totalApplied = invoiceEntries.reduce((s, e) => s + e.applied, 0);
  const totalOutstanding = totalInvoiced - totalApplied;
  const totalPayments = paymentEntries.reduce((s, e) => s + parseFloat(e.payment.amount || "0"), 0);
  const totalUnapplied = paymentEntries.reduce((s, e) => s + (parseFloat(e.payment.amount || "0") - e.applied), 0);
  const mismatches = invoiceEntries.filter(e => {
    const amt = parseFloat(e.invoice.amount || "0");
    return e.applied > 0 && e.applied < amt && e.invoice.status !== "partially_paid";
  });

  const paymentsWithUnapplied = paymentEntries.filter(e => {
    const amt = parseFloat(e.payment.amount || "0");
    return (amt - e.applied) > 0.01;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32">
      <PageGuide
        title="Payment Reconciliation"
        description="View invoice balances vs payments applied. Identify unapplied amounts and mismatches."
        whenToUse="Use to reconcile payments with invoices and ensure all amounts are properly accounted for."
        whatToDoNext={["Apply unapplied payments to invoices", "Resolve mismatches", "Review outstanding balances"]}
        relatedRecords={[{ label: "Payments", path: "/app/payments" }, { label: "Invoices", path: "/app/invoices" }, { label: "Finance", path: "/app/finance" }]}
      />

      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/app/finance"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Finance</Link>
      </Button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Payment Reconciliation</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase">Total Invoiced</p>
            <p className="text-xl font-bold text-slate-900">${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-green-600 uppercase">Total Applied</p>
            <p className="text-xl font-bold text-green-700">${totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 uppercase">Outstanding</p>
            <p className="text-xl font-bold text-amber-700">${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 uppercase">Total Payments</p>
            <p className="text-xl font-bold text-blue-700">${totalPayments.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-orange-600 uppercase">Unapplied</p>
            <p className="text-xl font-bold text-orange-700">${totalUnapplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mismatches Alert */}
      {(mismatches.length > 0 || paymentsWithUnapplied.length > 0) && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-semibold text-orange-700">Reconciliation Alerts</h3>
            </div>
            {mismatches.length > 0 && (
              <p className="text-sm text-orange-600">{mismatches.length} invoice(s) have partial payments but status not updated.</p>
            )}
            {paymentsWithUnapplied.length > 0 && (
              <p className="text-sm text-orange-600">{paymentsWithUnapplied.length} payment(s) have unapplied balances totaling ${totalUnapplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoice Balances */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Invoice Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {invoiceEntries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No invoices found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">Invoice</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">Status</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Amount</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Applied</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Balance</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-600">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceEntries.map(({ invoice, applied }) => {
                    const amt = parseFloat(invoice.amount || "0");
                    const balance = amt - applied;
                    const isFullyPaid = balance <= 0.01;
                    const isPartial = applied > 0 && !isFullyPaid;
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <Link href={`/app/invoices/${invoice.id}`}>
                            <span className="text-blue-600 hover:underline font-medium">{invoice.invoiceNumber || `INV-${invoice.id}`}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={
                            invoice.status === "paid" ? "bg-green-100 text-green-700" :
                            invoice.status === "partially_paid" ? "bg-amber-100 text-amber-700" :
                            invoice.status === "void" ? "bg-slate-100 text-slate-500" :
                            "bg-slate-100 text-slate-700"
                          }>{invoice.status || "draft"}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right">${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-green-700">${applied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className={`px-3 py-2 text-right font-medium ${isFullyPaid ? "text-green-600" : "text-amber-600"}`}>${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-center">
                          {isFullyPaid ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> :
                           isPartial ? <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" /> :
                           <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments with Unapplied Amounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payments — Unapplied Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsWithUnapplied.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-green-600">All payments are fully applied.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">Payment</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Total</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Applied</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Unapplied</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsWithUnapplied.map(({ payment, applied }) => {
                    const amt = parseFloat(payment.amount || "0");
                    const unapplied = amt - applied;
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <Link href={`/app/payments/${payment.id}`}>
                            <span className="text-blue-600 hover:underline font-medium">
                              {payment.reference || `Payment #${payment.id}`}
                            </span>
                          </Link>
                          <p className="text-xs text-slate-500">{payment.method || ""} {payment.paymentDate ? `| ${new Date(payment.paymentDate).toLocaleDateString()}` : ""}</p>
                        </td>
                        <td className="px-3 py-2 text-right">${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-green-700">${applied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-medium text-orange-600">${unapplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2">
                          <Link href={`/app/payments/${payment.id}`}>
                            <Button size="sm" variant="outline" className="text-blue-600">Apply</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
