import { useState, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import {
  ArrowLeft, DollarSign, AlertCircle, CreditCard, Plus, FileText, Trash2, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const paymentStatusColors: Record<string, string> = {
  recorded: "bg-blue-100 text-blue-700",
  partially_applied: "bg-amber-100 text-amber-700",
  fully_applied: "bg-green-100 text-green-700",
  reversed: "bg-red-100 text-red-700",
  disputed: "bg-orange-100 text-orange-700",
  unapplied: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

export default function PaymentDetail() {
  const [, params] = useRoute("/app/payments/:id");
  const [, setLocation] = useLocation();
  const paymentId = parseInt(params?.id || "0");
  const utils = trpc.useUtils();

  const { data: payment, isLoading } = trpc.payments.getById.useQuery({ id: paymentId }, { enabled: paymentId > 0 });
  const { data: allInvoices = [] } = trpc.invoices.list.useQuery();
  const { data: financeNotes = [] } = trpc.financeNotes.list.useQuery({ recordType: "payment", recordId: paymentId }, { enabled: paymentId > 0 });
  const { data: applications = [] } = trpc.payments.applications.useQuery({ paymentId }, { enabled: paymentId > 0 });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyInvoiceId, setApplyInvoiceId] = useState<number>(0);
  const [applyAmount, setApplyAmount] = useState("");
  const [applyNotes, setApplyNotes] = useState("");

  const deleteMutation = trpc.payments.delete.useMutation({
    onSuccess: () => { toast.success("Payment deleted"); setLocation("/app/payments"); },
    onError: (e: any) => toast.error(e.message),
  });

  const addNote = trpc.financeNotes.create.useMutation({
    onSuccess: () => {
      utils.financeNotes.list.invalidate({ recordType: "payment", recordId: paymentId });
      setNoteContent("");
      toast.success("Note added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const applyToInvoice = trpc.payments.applyToInvoice.useMutation({
    onSuccess: () => {
      utils.payments.applications.invalidate({ paymentId });
      utils.invoices.list.invalidate();
      setShowApplyForm(false);
      setApplyAmount("");
      setApplyNotes("");
      setApplyInvoiceId(0);
      toast.success("Payment applied to invoice");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeApplication = trpc.payments.removeApplication.useMutation({
    onSuccess: () => {
      utils.payments.applications.invalidate({ paymentId });
      toast.success("Application removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalApplied = useMemo(() => (applications as any[]).reduce((s: number, a: any) => s + parseFloat(a.amount || "0"), 0), [applications]);
  const paymentAmount = parseFloat(payment?.amount || "0");
  const unappliedAmount = paymentAmount - totalApplied;

  const computedStatus = useMemo(() => {
    if (!payment) return "recorded";
    if (totalApplied >= paymentAmount && paymentAmount > 0) return "fully_applied";
    if (totalApplied > 0) return "partially_applied";
    return payment.status || "recorded";
  }, [payment, totalApplied, paymentAmount]);

  // Get invoice label helper
  const getInvoiceLabel = (invoiceId: number) => {
    const inv = (allInvoices as any[]).find((i: any) => i.id === invoiceId);
    return inv ? `${inv.invoiceNumber || "INV-" + inv.id}` : `Invoice #${invoiceId}`;
  };

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading payment...</div>;
  if (!payment) return (
    <div className="p-6 max-w-4xl mx-auto text-center pb-32">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-700">Payment Not Found</h2>
      <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/payments")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments
      </Button>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32">
      <PageGuide
        title="Payment Detail"
        description="View payment details, apply to invoices, and track reconciliation."
        whenToUse="Use to apply payments to invoices and track unapplied amounts."
        whatToDoNext={["Apply payment to invoices", "Review unapplied amount", "Add a note"]}
        relatedRecords={[{ label: "Payments", path: "/app/payments" }, { label: "Finance", path: "/app/finance" }]}
      />

      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setLocation("/app/payments")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Payments
      </Button>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-bold text-slate-900">Payment #{payment.id}</h1>
                <Badge className={paymentStatusColors[computedStatus] || "bg-slate-100 text-slate-700"}>
                  {computedStatus.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex gap-6 mt-3 ml-9 text-sm text-slate-500 flex-wrap">
                {payment.paymentDate && <span>Date: {new Date(payment.paymentDate).toLocaleDateString()}</span>}
                {payment.method && <span>Method: {payment.method}</span>}
                {payment.reference && <span>Ref: {payment.reference}</span>}
              </div>
              {payment.notes && <p className="text-sm text-slate-500 mt-2 ml-9">{payment.notes}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-green-700">${paymentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <div className="text-sm mt-1">
                <p className="text-slate-500">Applied: <span className="font-medium text-slate-700">${totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
                <p className={`font-medium ${unappliedAmount > 0 ? "text-amber-600" : "text-green-600"}`}>
                  Unapplied: ${unappliedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 ml-9">
            {unappliedAmount > 0 && (
              <Button size="sm" onClick={() => setShowApplyForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <CreditCard className="w-3 h-3 mr-1" /> Apply to Invoice
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Apply to Invoice Form */}
      {showApplyForm && (
        <Card className="mb-6 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Apply Payment to Invoice</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Invoice</Label>
                <Select value={applyInvoiceId ? String(applyInvoiceId) : ""} onValueChange={(v) => setApplyInvoiceId(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Select invoice..." /></SelectTrigger>
                  <SelectContent>
                    {(allInvoices as any[]).filter((inv: any) => inv.status !== "paid" && inv.status !== "void").map((inv: any) => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {inv.invoiceNumber || `INV-${inv.id}`} — ${parseFloat(inv.amount || "0").toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (max ${unappliedAmount.toFixed(2)})</Label>
                <Input type="number" step="0.01" max={unappliedAmount} value={applyAmount} onChange={(e) => setApplyAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={applyNotes} onChange={(e) => setApplyNotes(e.target.value)} placeholder="Optional notes" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => {
                if (!applyInvoiceId || !applyAmount) { toast.error("Select invoice and enter amount"); return; }
                if (parseFloat(applyAmount) > unappliedAmount) { toast.error("Amount exceeds unapplied balance"); return; }
                applyToInvoice.mutate({ paymentId, invoiceId: applyInvoiceId, amount: applyAmount, notes: applyNotes || undefined });
              }} disabled={applyToInvoice.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {applyToInvoice.isPending ? "Applying..." : "Apply"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowApplyForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Applications */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {(applications as any[]).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No applications yet. Apply this payment to one or more invoices.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Invoice</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Amount Applied</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Notes</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(applications as any[]).map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <Link href={`/app/invoices/${app.invoiceId}`}>
                            <span className="text-blue-600 hover:underline">{getInvoiceLabel(app.invoiceId)}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-green-700">${parseFloat(app.amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-slate-500">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""}</td>
                        <td className="px-3 py-2 text-slate-500">{app.notes || "—"}</td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="sm" onClick={() => removeApplication.mutate({ id: app.id })}>
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2">
                    <tr>
                      <td className="px-3 py-2 font-semibold text-slate-700">Total Applied</td>
                      <td className="px-3 py-2 text-right font-bold text-green-700">${totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td colSpan={3}></td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-amber-600">Unapplied</td>
                      <td className="px-3 py-2 text-right font-bold text-amber-600">${unappliedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="text-slate-700 font-medium">${paymentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="text-slate-700">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Not set"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="text-slate-700">{payment.method || "Not specified"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reference</span><span className="text-slate-700">{payment.reference || "None"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Created</span><span className="text-slate-700">{new Date(payment.createdAt).toLocaleDateString()}</span></div>
              {payment.contractId && (
                <div className="flex justify-between"><span className="text-slate-500">Contract</span><Link href={`/app/contracts/${payment.contractId}/hub`}><span className="text-blue-600 hover:underline">#{payment.contractId}</span></Link></div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Add a note..." className="flex-1" />
              <Button size="sm" onClick={() => { if (noteContent.trim()) addNote.mutate({ recordType: "payment", recordId: paymentId, content: noteContent }); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {(financeNotes as any[]).length === 0 ? <p className="text-sm text-slate-500">No notes yet</p> : (
              <div className="space-y-2">
                {(financeNotes as any[]).map((n: any) => (
                  <div key={n.id} className="p-2 bg-slate-50 rounded text-sm">
                    <p className="text-slate-700">{n.content}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Payment</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete Payment #{payment.id}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: paymentId })}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
