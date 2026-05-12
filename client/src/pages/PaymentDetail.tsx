import { useState, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import {
  ArrowLeft, DollarSign, AlertCircle, CreditCard, Plus, FileText, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function PaymentDetail() {
  const [, params] = useRoute("/app/payments/:id");
  const [, setLocation] = useLocation();
  const paymentId = parseInt(params?.id || "0");
  const utils = trpc.useUtils();

  const { data: payment, isLoading } = trpc.payments.getById.useQuery({ id: paymentId }, { enabled: paymentId > 0 });
  const { data: allInvoices = [] } = trpc.invoices.list.useQuery();
  const { data: financeNotes = [] } = trpc.financeNotes.list.useQuery({ recordType: "payment", recordId: paymentId }, { enabled: paymentId > 0 });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const deleteMutation = trpc.payments.delete.useMutation({
    onSuccess: () => { toast.success("Payment deleted"); setLocation("/app/finance"); },
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

  const linkedInvoice = useMemo(() => {
    if (!payment?.invoiceId) return null;
    return (allInvoices as any[]).find((inv: any) => inv.id === payment.invoiceId) || null;
  }, [payment, allInvoices]);

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading payment...</div>;
  if (!payment) return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-700">Payment Not Found</h2>
      <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/finance")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Finance
      </Button>
    </div>
  );

  const paymentAmount = parseFloat(payment.amount || "0");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageGuide
        title="Payment Detail"
        description="View payment details, linked invoices, and notes."
        whenToUse="Use to review payment information and match to invoices."
        whatToDoNext={["View linked invoice", "Add a note"]}
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
                <DollarSign className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-bold text-slate-900">Payment #{payment.id}</h1>
                <Badge className="bg-green-100 text-green-700">Received</Badge>
              </div>
              <div className="flex gap-6 mt-3 ml-9 text-sm text-slate-500">
                {payment.paymentDate && <span>Date: {new Date(payment.paymentDate).toLocaleDateString()}</span>}
                {payment.method && <span>Method: {payment.method}</span>}
                {payment.reference && <span>Ref: {payment.reference}</span>}
              </div>
              {payment.notes && <p className="text-sm text-slate-500 mt-2 ml-9">{payment.notes}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-green-700">${paymentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 ml-9">
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Linked Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            {linkedInvoice ? (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Invoice #{linkedInvoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">{linkedInvoice.status || "Draft"}</p>
                  </div>
                  <p className="text-sm font-medium">${parseFloat(linkedInvoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <Link href={`/app/invoices/${linkedInvoice.id}`}>
                  <Button size="sm" variant="link" className="p-0 h-auto text-blue-600 mt-2">View Invoice</Button>
                </Link>
              </div>
            ) : payment.invoiceId ? (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">Invoice #{payment.invoiceId}</p>
                <Link href={`/app/invoices/${payment.invoiceId}`}>
                  <Button size="sm" variant="link" className="p-0 h-auto text-blue-600">View Invoice</Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No invoice linked to this payment</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contract</CardTitle>
          </CardHeader>
          <CardContent>
            {payment.contractId ? (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900">Contract #{payment.contractId}</p>
                <Link href={`/app/contracts/${payment.contractId}/hub`}>
                  <Button size="sm" variant="link" className="p-0 h-auto text-blue-600 mt-1">View Contract</Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No contract linked</p>
            )}
          </CardContent>
        </Card>

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
            </div>
          </CardContent>
        </Card>

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
