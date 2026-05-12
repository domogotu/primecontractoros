import { useState, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import {
  FileText, ArrowLeft, DollarSign, AlertCircle,
  CreditCard, Plus, History, Edit, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Paid: "bg-emerald-100 text-emerald-700",
  "Partially Paid": "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
  Disputed: "bg-orange-100 text-orange-700",
  Cancelled: "bg-slate-100 text-slate-500",
};

export default function InvoiceDetail() {
  const [, params] = useRoute("/app/invoices/:id");
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(params?.id || "0");
  const utils = trpc.useUtils();

  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id: invoiceId }, { enabled: invoiceId > 0 });
  const { data: statusHistory = [] } = trpc.invoices.statusHistory.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: paymentLinks = [] } = trpc.invoices.paymentLinks.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: allPayments = [] } = trpc.payments.list.useQuery();
  const { data: financeNotes = [] } = trpc.financeNotes.list.useQuery({ recordType: "invoice", recordId: invoiceId }, { enabled: invoiceId > 0 });

  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState("Submitted");
  const [statusNotes, setStatusNotes] = useState("");
  const [showLinkPayment, setShowLinkPayment] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number>(0);
  const [linkAmount, setLinkAmount] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const updateStatus = trpc.invoices.updateStatus.useMutation({
    onSuccess: () => {
      utils.invoices.getById.invalidate({ id: invoiceId });
      utils.invoices.statusHistory.invalidate({ invoiceId });
      setShowStatusChange(false);
      setStatusNotes("");
      toast.success("Status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const linkPaymentMut = trpc.invoices.linkPayment.useMutation({
    onSuccess: () => {
      utils.invoices.paymentLinks.invalidate({ invoiceId });
      setShowLinkPayment(false);
      toast.success("Payment linked");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => { toast.success("Invoice deleted"); setLocation("/app/finance"); },
    onError: (e: any) => toast.error(e.message),
  });

  const addNote = trpc.financeNotes.create.useMutation({
    onSuccess: () => {
      utils.financeNotes.list.invalidate({ recordType: "invoice", recordId: invoiceId });
      setNoteContent("");
      toast.success("Note added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const linkedPaymentIds = useMemo(() => new Set((paymentLinks as any[]).map((l: any) => l.paymentId)), [paymentLinks]);
  const totalLinked = useMemo(() => (paymentLinks as any[]).reduce((s: number, l: any) => s + parseFloat(l.amount || "0"), 0), [paymentLinks]);

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading invoice...</div>;
  if (!invoice) return (
    <div className="p-6 max-w-4xl mx-auto text-center pb-32">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-700">Invoice Not Found</h2>
      <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/finance")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Finance
      </Button>
    </div>
  );

  const invoiceAmount = parseFloat(invoice.amount || "0");
  const remaining = invoiceAmount - totalLinked;

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32">
      <PageGuide
        title="Invoice Detail"
        description="View invoice details, status history, linked payments, and notes."
        whenToUse="Use to track invoice status, link payments, or update invoice information."
        whatToDoNext={["Update invoice status", "Link a payment", "Add a note"]}
        relatedRecords={[{ label: "Finance", path: "/app/finance" }]}
      />

      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setLocation("/app/finance")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Finance
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900">Invoice #{invoice.invoiceNumber}</h1>
                <Badge className={statusColors[invoice.status || "Draft"] || "bg-slate-100 text-slate-700"}>
                  {invoice.status || "Draft"}
                </Badge>
              </div>
              {invoice.description && <p className="text-sm text-slate-500 mt-2 ml-9">{invoice.description}</p>}
              <div className="flex gap-6 mt-3 ml-9 text-sm text-slate-500">
                {invoice.issuedDate && <span>Issued: {new Date(invoice.issuedDate).toLocaleDateString()}</span>}
                {invoice.dueDate && <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                {invoice.contractId && <Link href={`/app/contracts/${invoice.contractId}/hub`}><span className="text-blue-600 hover:underline">Contract #{invoice.contractId}</span></Link>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-slate-900">${invoiceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              {totalLinked > 0 && <p className="text-sm text-slate-500 mt-1">Paid: ${totalLinked.toLocaleString("en-US", { minimumFractionDigits: 2 })} | Remaining: ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>}
            </div>
          </div>
          <div className="flex gap-2 mt-4 ml-9">
            <Button size="sm" variant="outline" onClick={() => setShowStatusChange(true)}><Edit className="w-3 h-3 mr-1" /> Change Status</Button>
            <Button size="sm" variant="outline" onClick={() => setShowLinkPayment(true)}><CreditCard className="w-3 h-3 mr-1" /> Link Payment</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsDeleteOpen(true)}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
          </div>
        </CardContent>
      </Card>

      {showStatusChange && (
        <Card className="mb-6 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Change Invoice Status</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Draft","Submitted","Approved","Paid","Partially Paid","Overdue","Disputed","Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Notes (optional)</Label>
                <Input value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder="Reason for status change..." />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => updateStatus.mutate({ id: invoiceId, oldStatus: invoice.status || "Draft", newStatus, notes: statusNotes || undefined })} className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
              <Button size="sm" variant="outline" onClick={() => setShowStatusChange(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showLinkPayment && (
        <Card className="mb-6 border-green-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Link Payment to Invoice</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Payment</Label>
                <Select value={selectedPaymentId ? String(selectedPaymentId) : ""} onValueChange={(v) => setSelectedPaymentId(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Select payment..." /></SelectTrigger>
                  <SelectContent>
                    {(allPayments as any[]).filter((p: any) => !linkedPaymentIds.has(p.id)).map((p: any) => <SelectItem key={p.id} value={String(p.id)}>${parseFloat(p.amount).toLocaleString()} - {p.reference || `Payment #${p.id}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount to Apply</Label>
                <Input type="number" step="0.01" value={linkAmount} onChange={(e) => setLinkAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => { if (selectedPaymentId && linkAmount) linkPaymentMut.mutate({ invoiceId, paymentId: selectedPaymentId, amount: linkAmount }); }} className="bg-green-600 hover:bg-green-700 text-white">Link</Button>
              <Button size="sm" variant="outline" onClick={() => setShowLinkPayment(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" /> Status History</CardTitle></CardHeader>
          <CardContent>
            {(statusHistory as any[]).length === 0 ? <p className="text-sm text-slate-500">No status changes recorded</p> : (
              <div className="space-y-2">
                {(statusHistory as any[]).map((h: any, i: number) => (
                  <div key={h.id || i} className="flex items-center gap-3 p-2 bg-slate-50 rounded text-sm">
                    <div className="flex-1"><span className="text-slate-500">{h.oldStatus}</span> <span className="mx-1">{"\u2192"}</span> <span className="font-medium text-slate-700">{h.newStatus}</span>{h.notes && <span className="text-slate-400 ml-2">- {h.notes}</span>}</div>
                    <span className="text-xs text-slate-400">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Linked Payments</CardTitle></CardHeader>
          <CardContent>
            {(paymentLinks as any[]).length === 0 ? <p className="text-sm text-slate-500">No payments linked yet</p> : (
              <div className="space-y-2">
                {(paymentLinks as any[]).map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <Link href={`/app/payments/${l.paymentId}`}><span className="text-blue-600 hover:underline">Payment #{l.paymentId}</span></Link>
                    <span className="font-medium text-slate-700">${parseFloat(l.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t text-sm font-semibold"><span>Total Applied</span><span>${totalLinked.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Add a note..." className="flex-1" />
              <Button size="sm" onClick={() => { if (noteContent.trim()) addNote.mutate({ recordType: "invoice", recordId: invoiceId, content: noteContent }); }} className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-3 h-3 mr-1" /> Add</Button>
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
          <DialogHeader><DialogTitle>Delete Invoice</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete Invoice #{invoice.invoiceNumber}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: invoiceId })}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
