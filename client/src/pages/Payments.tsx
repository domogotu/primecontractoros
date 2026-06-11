import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, DollarSign, ArrowDownRight, ArrowUpRight, Plus, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import LifecycleProgress from "@/components/LifecycleProgress";
import AIStatusPanel, { AICheck } from "@/components/AIStatusPanel";
import WhatsNext, { NextAction } from "@/components/WhatsNext";
import ValidationWarnings, { ValidationWarning } from "@/components/ValidationWarnings";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

const statusColors: Record<string, string> = {
  cleared: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  disputed: "bg-purple-100 text-purple-700",
};

export default function Payments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    method: "EFT/ACH",
    reference: "",
    notes: "",
    paymentDate: "",
    invoiceId: "",
    contractId: "",
  });

  const { data: payments = [], isLoading, refetch } = trpc.payments.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();

  const createMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ amount: "", method: "EFT/ACH", reference: "", notes: "", paymentDate: "", invoiceId: "", contractId: "" });
      toast.success("Payment recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.payments.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Payment deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    return (payments as any[]).filter((p) => {
      const matchesSearch =
        !search ||
        (p.notes || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.reference || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.method || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const stats = {
    totalReceived: (payments as any[])
      .filter((p) => p.status === "cleared" || p.status === "pending")
      .reduce((s, p) => s + Number(p.amount || 0), 0),
    pending: (payments as any[]).filter((p) => p.status === "pending").length,
    total: (payments as any[]).length,
  };

  const handleCreate = () => {
    if (!form.amount) {
      toast.error("Amount is required");
      return;
    }
    createMutation.mutate({
      amount: form.amount,
      method: form.method || undefined,
      reference: form.reference || undefined,
      notes: form.notes || undefined,
      paymentDate: form.paymentDate || undefined,
      invoiceId: form.invoiceId ? parseInt(form.invoiceId) : undefined,
      contractId: form.contractId ? parseInt(form.contractId) : undefined,
    });
  };

  const getInvoiceLabel = (invoiceId: number) => {
    const inv = (invoices as any[]).find((i) => i.id === invoiceId);
    return inv ? `${inv.invoiceNumber || "INV-" + inv.id}` : "";
  };

  const getContractLabel = (contractId: number) => {
    const c = (contracts as any[]).find((c) => c.id === contractId);
    return c ? c.title || c.contractNumber || "" : "";
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto pb-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <PageLayout
        label="Finance"
        title="Payments"
        subtitle="Track all payment records linked to invoices and contracts."
        summaryCards={[{ label: "Total", value: payments.length }, { label: "Completed", value: (payments as any[]).filter((p:any)=>p.status==="completed").length, color: "text-green-600" }, { label: "Pending", value: (payments as any[]).filter((p:any)=>p.status==="pending").length, color: "text-amber-600" }]}
      >
      <PageGuide
        title="Payments"
        description="Track all incoming and outgoing payments separately from invoice management. Monitor payment status, methods, and reconciliation."
        whenToUse="Use to track payment receipts from the government, subcontractor payments, and vendor disbursements."
        whatToDoNext={[
          "Reconcile pending payments with bank records",
          "Follow up on overdue receivables",
          "Process pending subcontractor payments",
          "Match payments to invoices",
        ]}
        relatedRecords={[
          { label: "Finance & Invoicing", path: "/app/finance" },
          { label: "Subcontractors", path: "/app/subcontractors" },
          { label: "Vendors", path: "/app/vendors" },
          { label: "Reports", path: "/app/reports" },
        ]}
        alerts={stats.pending > 0 ? [{ message: `${stats.pending} payment(s) pending clearance`, type: "info" }] : []}
      />

      {/* Lifecycle Progress */}
      <LifecycleProgress currentPhase="performance" />

      {/* AI Status Panel */}
      <AIStatusPanel checks={[
        { id: "pending-payments", name: "Pending Payments", status: stats.pending > 0 ? "flagged" : "verified", message: stats.pending > 0 ? `${stats.pending} payment(s) awaiting clearance` : "All payments cleared", severity: stats.pending > 0 ? "warning" : "info" },
        { id: "total-received", name: "Revenue Tracking", status: stats.totalReceived > 0 ? "verified" : "pending", message: stats.totalReceived > 0 ? `$${stats.totalReceived.toLocaleString()} total recorded` : "No payments recorded yet", severity: "info" },
      ] as AICheck[]} title="PAYMENT STATUS" />

      {/* What's Next */}
      {stats.pending > 0 && <WhatsNext actions={[
        { id: "reconcile", title: `${stats.pending} Pending Payment${stats.pending > 1 ? "s" : ""}`, description: "Reconcile pending payments with bank records", priority: "medium" as const },
      ] as NextAction[]} />}

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="payments" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="payments" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} total | ${stats.totalReceived.toLocaleString()} recorded
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-green-600 uppercase">Total Recorded</p>
            <p className="text-2xl font-bold text-green-700">${stats.totalReceived.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 uppercase">Pending</p>
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 uppercase">Total Payments</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="cleared">Cleared</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {(payments as any[]).length === 0
                ? "No payments recorded yet. Record your first payment."
                : "No payments match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Invoice / Contract</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {payment.notes || payment.reference || `Payment #${payment.id}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {payment.method || "—"} {payment.reference ? `| Ref: ${payment.reference}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-slate-600">
                      {payment.invoiceId ? getInvoiceLabel(payment.invoiceId) : ""}
                      {payment.contractId ? ` / ${getContractLabel(payment.contractId)}` : ""}
                      {!payment.invoiceId && !payment.contractId ? "—" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-sm text-green-700">
                      ${Number(payment.amount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[payment.status] || statusColors.pending}>
                      {payment.status || "pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-600">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <Link href={`/app/payments/${payment.id}`}>
                      <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4 text-blue-500" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: payment.id })}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g., 45000"
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFT/ACH">EFT/ACH</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference / Check #</Label>
              <Input
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="e.g., CHK-1234"
              />
            </div>
            <div>
              <Label>Link to Invoice</Label>
              <Select
                value={form.invoiceId || "none"}
                onValueChange={(v) => setForm({ ...form, invoiceId: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Invoice</SelectItem>
                  {(invoices as any[]).map((inv) => (
                    <SelectItem key={inv.id} value={String(inv.id)}>
                      {inv.invoiceNumber || `INV-${inv.id}`} - ${Number(inv.amount || 0).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Link to Contract</Label>
              <Select
                value={form.contractId || "none"}
                onValueChange={(v) => setForm({ ...form, contractId: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Contract</SelectItem>
                  {(contracts as any[]).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title || c.contractNumber || `Contract #${c.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
            <PageGuidancePanel
        pageKey="payments"
        title="Payments Help"
        description="Log received payments and match them to invoices. Track unmatched payments and outstanding balances."
        whatToDoNext={["Log payments as they are received", "Match payments to submitted invoices", "Identify unmatched or partial payments", "Track outstanding balances across contracts"]}
        helpArticleSlug="why-invoices-payments-separate"
        glossaryTerms={["payment", "invoice", "prompt-payment"]}
      />
    </PageLayout>
  );
}
