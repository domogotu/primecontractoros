import { useState, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import {
  FileText, ArrowLeft, DollarSign, AlertCircle,
  CreditCard, Plus, History, Edit, Trash2, CheckCircle2,
  AlertTriangle, Upload, List, ClipboardCheck, Ban, Send, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  ready_for_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  submitted: "bg-blue-100 text-blue-700",
  partially_paid: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  disputed: "bg-orange-100 text-orange-700",
  void: "bg-slate-100 text-slate-500",
  rejected: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  ready_for_review: "Ready for Review",
  approved: "Approved",
  submitted: "Submitted",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  disputed: "Disputed",
  void: "Void",
  rejected: "Rejected",
};

const ALL_STATUSES = ["draft", "ready_for_review", "approved", "submitted", "partially_paid", "paid", "disputed", "void", "overdue"];

export default function InvoiceDetail() {
  const [, params] = useRoute("/app/invoices/:id");
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(params?.id || "0");
  const utils = trpc.useUtils();

  // Data queries
  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id: invoiceId }, { enabled: invoiceId > 0 });
  const { data: statusHistory = [] } = trpc.invoices.statusHistory.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: paymentLinks = [] } = trpc.invoices.paymentLinks.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: allPayments = [] } = trpc.payments.list.useQuery();
  const { data: financeNotes = [] } = trpc.financeNotes.list.useQuery({ recordType: "invoice", recordId: invoiceId }, { enabled: invoiceId > 0 });
  const { data: lineItems = [] } = trpc.invoices.lineItems.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: checklistItems = [] } = trpc.invoices.checklistItems.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: issues = [] } = trpc.invoices.issues.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: supportDocs = [] } = trpc.invoices.supportDocs.useQuery({ invoiceId }, { enabled: invoiceId > 0 });
  const { data: paymentApps = [] } = trpc.payments.applications.useQuery({ invoiceId }, { enabled: invoiceId > 0 });

  // UI state
  const [activeTab, setActiveTab] = useState<"lineItems" | "checklist" | "issues" | "docs" | "history" | "payments">("lineItems");
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState("submitted");
  const [statusNotes, setStatusNotes] = useState("");
  const [showLinkPayment, setShowLinkPayment] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number>(0);
  const [linkAmount, setLinkAmount] = useState("");
  const [linkNotes, setLinkNotes] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  // Line item form
  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [lineItemForm, setLineItemForm] = useState({ description: "", quantity: "1", unitPrice: "", category: "" });
  const [editingLineItem, setEditingLineItem] = useState<any>(null);

  // Checklist form
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [checklistForm, setChecklistForm] = useState({ title: "", description: "", required: true });

  // Issue form
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: "", description: "", severity: "medium" });

  // Mutations
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

  const linkPaymentMut = trpc.payments.applyToInvoice.useMutation({
    onSuccess: () => {
      utils.payments.applications.invalidate({ invoiceId });
      utils.invoices.getById.invalidate({ id: invoiceId });
      utils.invoices.statusHistory.invalidate({ invoiceId });
      setShowLinkPayment(false);
      setLinkAmount("");
      setLinkNotes("");
      toast.success("Payment applied to invoice");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => { toast.success("Invoice deleted"); setLocation("/app/invoices"); },
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

  // Line item mutations
  const createLineItem = trpc.invoices.createLineItem.useMutation({
    onSuccess: () => {
      utils.invoices.lineItems.invalidate({ invoiceId });
      setShowLineItemForm(false);
      setLineItemForm({ description: "", quantity: "1", unitPrice: "", category: "" });
      toast.success("Line item added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateLineItem = trpc.invoices.updateLineItem.useMutation({
    onSuccess: () => {
      utils.invoices.lineItems.invalidate({ invoiceId });
      setEditingLineItem(null);
      toast.success("Line item updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLineItem = trpc.invoices.deleteLineItem.useMutation({
    onSuccess: () => {
      utils.invoices.lineItems.invalidate({ invoiceId });
      toast.success("Line item removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Checklist mutations
  const createChecklistItem = trpc.invoices.createChecklistItem.useMutation({
    onSuccess: () => {
      utils.invoices.checklistItems.invalidate({ invoiceId });
      setShowChecklistForm(false);
      setChecklistForm({ title: "", description: "", required: true });
      toast.success("Checklist item added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateChecklistItem = trpc.invoices.updateChecklistItem.useMutation({
    onSuccess: () => {
      utils.invoices.checklistItems.invalidate({ invoiceId });
      toast.success("Checklist updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteChecklistItem = trpc.invoices.deleteChecklistItem.useMutation({
    onSuccess: () => {
      utils.invoices.checklistItems.invalidate({ invoiceId });
      toast.success("Checklist item removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Issue mutations
  const createIssue = trpc.invoices.createIssue.useMutation({
    onSuccess: () => {
      utils.invoices.issues.invalidate({ invoiceId });
      setShowIssueForm(false);
      setIssueForm({ title: "", description: "", severity: "medium" });
      toast.success("Issue created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateIssue = trpc.invoices.updateIssue.useMutation({
    onSuccess: () => {
      utils.invoices.issues.invalidate({ invoiceId });
      toast.success("Issue updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Computed values
  const linkedPaymentIds = useMemo(() => new Set((paymentLinks as any[]).map((l: any) => l.paymentId)), [paymentLinks]);
  const totalApplied = useMemo(() => (paymentApps as any[]).reduce((s: number, a: any) => s + parseFloat(a.amount || "0"), 0), [paymentApps]);
  const lineItemsTotal = useMemo(() => (lineItems as any[]).reduce((s: number, li: any) => s + parseFloat(li.amount || "0"), 0), [lineItems]);
  const checklistComplete = useMemo(() => (checklistItems as any[]).filter((c: any) => c.completed).length, [checklistItems]);
  const checklistTotal = (checklistItems as any[]).length;
  const openIssues = useMemo(() => (issues as any[]).filter((i: any) => i.status === "open" || i.status === "in_progress").length, [issues]);

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading invoice...</div>;
  if (!invoice) return (
    <div className="p-6 max-w-4xl mx-auto text-center pb-32">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-700">Invoice Not Found</h2>
      <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/invoices")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices
      </Button>
    </div>
  );

  const invoiceAmount = parseFloat(invoice.amount || "0");
  const remaining = invoiceAmount - totalApplied;
  const currentStatus = invoice.status || "draft";

  const handleVoid = () => {
    if (!voidReason.trim()) { toast.error("Please provide a reason"); return; }
    updateStatus.mutate({ id: invoiceId, oldStatus: currentStatus, newStatus: "void", notes: `Voided: ${voidReason}` });
    setShowVoidDialog(false);
    setVoidReason("");
  };

  const handleAddLineItem = () => {
    if (!lineItemForm.description || !lineItemForm.unitPrice) { toast.error("Description and unit price are required"); return; }
    const qty = parseFloat(lineItemForm.quantity) || 1;
    const price = parseFloat(lineItemForm.unitPrice) || 0;
    const amount = (qty * price).toFixed(2);
    createLineItem.mutate({
      invoiceId,
      description: lineItemForm.description,
      quantity: String(qty),
      unitPrice: lineItemForm.unitPrice,
      amount,
      category: lineItemForm.category || undefined,
    });
  };

  const handleApplyPayment = () => {
    if (!selectedPaymentId || !linkAmount) { toast.error("Select a payment and enter amount"); return; }
    linkPaymentMut.mutate({ paymentId: selectedPaymentId, invoiceId, amount: linkAmount, notes: linkNotes || undefined });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32">
      <PageGuide
        title="Invoice Detail"
        description="Manage invoice line items, approval workflow, checklist, issues, and payment applications."
        whenToUse="Use to manage the full invoice lifecycle from draft through payment."
        whatToDoNext={["Add line items", "Complete checklist", "Submit for approval", "Apply payments"]}
        relatedRecords={[{ label: "Invoices", path: "/app/invoices" }, { label: "Payments", path: "/app/payments" }, { label: "Finance", path: "/app/finance" }]}
      />

      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setLocation("/app/invoices")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900">Invoice #{invoice.invoiceNumber}</h1>
                <Badge className={statusColors[currentStatus] || "bg-slate-100 text-slate-700"}>
                  {statusLabels[currentStatus] || currentStatus}
                </Badge>
                {openIssues > 0 && <Badge className="bg-orange-100 text-orange-700"><AlertTriangle className="w-3 h-3 mr-1" />{openIssues} Issue{openIssues > 1 ? "s" : ""}</Badge>}
              </div>
              {invoice.description && <p className="text-sm text-slate-500 mt-2 ml-9">{invoice.description}</p>}
              <div className="flex gap-6 mt-3 ml-9 text-sm text-slate-500 flex-wrap">
                {invoice.issuedDate && <span>Issued: {new Date(invoice.issuedDate).toLocaleDateString()}</span>}
                {invoice.dueDate && <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                {invoice.contractId && <Link href={`/app/contracts/${invoice.contractId}/hub`}><span className="text-blue-600 hover:underline">Contract #{invoice.contractId}</span></Link>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-slate-900">${invoiceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              {totalApplied > 0 && (
                <div className="text-sm text-slate-500 mt-1">
                  <span className="text-green-600">Paid: ${totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  {remaining > 0 && <span className="ml-2 text-amber-600">Remaining: ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>}
                </div>
              )}
              {lineItems.length > 0 && <p className="text-xs text-slate-400 mt-1">Line items total: ${lineItemsTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>}
            </div>
          </div>

          {/* Action Buttons - Workflow */}
          <div className="flex gap-2 mt-4 ml-9 flex-wrap">
            {currentStatus === "draft" && (
              <Button size="sm" onClick={() => updateStatus.mutate({ id: invoiceId, oldStatus: currentStatus, newStatus: "ready_for_review", notes: "Marked ready for review" })} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Eye className="w-3 h-3 mr-1" /> Mark Ready for Review
              </Button>
            )}
            {currentStatus === "ready_for_review" && (
              <Button size="sm" onClick={() => updateStatus.mutate({ id: invoiceId, oldStatus: currentStatus, newStatus: "approved", notes: "Approved" })} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
              </Button>
            )}
            {currentStatus === "approved" && (
              <Button size="sm" onClick={() => updateStatus.mutate({ id: invoiceId, oldStatus: currentStatus, newStatus: "submitted", notes: "Submitted to customer" })} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="w-3 h-3 mr-1" /> Submit
              </Button>
            )}
            {(currentStatus === "submitted" || currentStatus === "partially_paid" || currentStatus === "overdue") && (
              <Button size="sm" variant="outline" onClick={() => setShowLinkPayment(true)}>
                <CreditCard className="w-3 h-3 mr-1" /> Apply Payment
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setShowStatusChange(true)}>
              <Edit className="w-3 h-3 mr-1" /> Change Status
            </Button>
            {currentStatus !== "void" && currentStatus !== "paid" && (
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setShowVoidDialog(true)}>
                <Ban className="w-3 h-3 mr-1" /> Void
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>

          {/* Checklist progress bar */}
          {checklistTotal > 0 && (
            <div className="mt-4 ml-9">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ClipboardCheck className="w-3 h-3" />
                <span>Checklist: {checklistComplete}/{checklistTotal} complete</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${(checklistComplete / checklistTotal) * 100}%` }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Card */}
      {showStatusChange && (
        <Card className="mb-6 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Change Invoice Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabels[s] || s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Notes (optional)</Label>
                <Input value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder="Reason for status change..." />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => updateStatus.mutate({ id: invoiceId, oldStatus: currentStatus, newStatus, notes: statusNotes || undefined })} className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
              <Button size="sm" variant="outline" onClick={() => setShowStatusChange(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Payment Card */}
      {showLinkPayment && (
        <Card className="mb-6 border-green-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Apply Payment to Invoice</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Payment</Label>
                <Select value={selectedPaymentId ? String(selectedPaymentId) : ""} onValueChange={(v) => setSelectedPaymentId(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Select payment..." /></SelectTrigger>
                  <SelectContent>
                    {(allPayments as any[]).map((p: any) => <SelectItem key={p.id} value={String(p.id)}>${parseFloat(p.amount).toLocaleString()} - {p.reference || `Payment #${p.id}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount to Apply</Label>
                <Input type="number" step="0.01" value={linkAmount} onChange={(e) => setLinkAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input value={linkNotes} onChange={(e) => setLinkNotes(e.target.value)} placeholder="Application notes..." />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleApplyPayment} className="bg-green-600 hover:bg-green-700 text-white">Apply</Button>
              <Button size="sm" variant="outline" onClick={() => setShowLinkPayment(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
        {[
          { key: "lineItems", label: "Line Items", icon: List, count: lineItems.length },
          { key: "checklist", label: "Checklist", icon: ClipboardCheck, count: checklistTotal },
          { key: "issues", label: "Issues", icon: AlertTriangle, count: openIssues },
          { key: "docs", label: "Documents", icon: Upload, count: supportDocs.length },
          { key: "payments", label: "Payments", icon: CreditCard, count: (paymentApps as any[]).length },
          { key: "history", label: "History", icon: History, count: (statusHistory as any[]).length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count > 0 && <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "lineItems" && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button size="sm" onClick={() => setShowLineItemForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            {showLineItemForm && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Label>Description *</Label>
                    <Input value={lineItemForm.description} onChange={(e) => setLineItemForm({ ...lineItemForm, description: e.target.value })} placeholder="Line item description" />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" step="0.01" value={lineItemForm.quantity} onChange={(e) => setLineItemForm({ ...lineItemForm, quantity: e.target.value })} />
                  </div>
                  <div>
                    <Label>Unit Price *</Label>
                    <Input type="number" step="0.01" value={lineItemForm.unitPrice} onChange={(e) => setLineItemForm({ ...lineItemForm, unitPrice: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input value={lineItemForm.category} onChange={(e) => setLineItemForm({ ...lineItemForm, category: e.target.value })} placeholder="e.g., Labor, Materials" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleAddLineItem} disabled={createLineItem.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                    {createLineItem.isPending ? "Adding..." : "Add"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowLineItemForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {(lineItems as any[]).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No line items yet. Add line items to detail this invoice.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Description</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Qty</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Unit Price</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Amount</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Category</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(lineItems as any[]).map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-900">{item.description}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{parseFloat(item.quantity || "1")}</td>
                        <td className="px-3 py-2 text-right text-slate-700">${parseFloat(item.unitPrice || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">${parseFloat(item.amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-slate-500">{item.category || "—"}</td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="sm" onClick={() => deleteLineItem.mutate({ id: item.id })}>
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold text-slate-700">Total:</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">${lineItemsTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "checklist" && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Invoice Checklist</CardTitle>
            <Button size="sm" onClick={() => setShowChecklistForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            {showChecklistForm && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Title *</Label>
                    <Input value={checklistForm.title} onChange={(e) => setChecklistForm({ ...checklistForm, title: e.target.value })} placeholder="Checklist item title" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={checklistForm.description} onChange={(e) => setChecklistForm({ ...checklistForm, description: e.target.value })} placeholder="Optional description" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={checklistForm.required} onChange={(e) => setChecklistForm({ ...checklistForm, required: e.target.checked })} className="rounded" />
                    Required
                  </label>
                  <Button size="sm" onClick={() => { if (checklistForm.title) createChecklistItem.mutate({ invoiceId, title: checklistForm.title, description: checklistForm.description || undefined, required: checklistForm.required }); }} disabled={createChecklistItem.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                    {createChecklistItem.isPending ? "Adding..." : "Add"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowChecklistForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {(checklistItems as any[]).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No checklist items. Add items to track invoice readiness.</p>
            ) : (
              <div className="space-y-2">
                {(checklistItems as any[]).map((item: any) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.completed ? "bg-green-50 border-green-200" : "bg-white border-slate-200"}`}>
                    <input
                      type="checkbox"
                      checked={!!item.completed}
                      onChange={(e) => updateChecklistItem.mutate({ id: item.id, completed: e.target.checked })}
                      className="rounded w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.completed ? "line-through text-slate-400" : "text-slate-900"}`}>{item.title}</p>
                      {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                    </div>
                    {item.required && <Badge className="bg-red-50 text-red-600 text-xs">Required</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => deleteChecklistItem.mutate({ id: item.id })}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "issues" && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Issues / Disputes</CardTitle>
            <Button size="sm" onClick={() => setShowIssueForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-3 h-3 mr-1" /> Open Issue
            </Button>
          </CardHeader>
          <CardContent>
            {showIssueForm && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Title *</Label>
                    <Input value={issueForm.title} onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} placeholder="Issue title" />
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select value={issueForm.severity} onValueChange={(v) => setIssueForm({ ...issueForm, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} placeholder="Describe the issue..." rows={3} />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => { if (issueForm.title) createIssue.mutate({ invoiceId, title: issueForm.title, description: issueForm.description || undefined, severity: issueForm.severity }); }} disabled={createIssue.isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
                    {createIssue.isPending ? "Creating..." : "Create Issue"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowIssueForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {(issues as any[]).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No issues or disputes. Open an issue if there is a problem with this invoice.</p>
            ) : (
              <div className="space-y-3">
                {(issues as any[]).map((issue: any) => (
                  <div key={issue.id} className={`p-3 rounded-lg border ${issue.status === "open" || issue.status === "in_progress" ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-slate-900">{issue.title}</h4>
                          <Badge className={issue.severity === "critical" ? "bg-red-100 text-red-700" : issue.severity === "high" ? "bg-orange-100 text-orange-700" : issue.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}>
                            {issue.severity}
                          </Badge>
                          <Badge className={issue.status === "open" ? "bg-red-100 text-red-600" : issue.status === "in_progress" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}>
                            {issue.status}
                          </Badge>
                        </div>
                        {issue.description && <p className="text-xs text-slate-500 mt-1">{issue.description}</p>}
                        {issue.resolution && <p className="text-xs text-green-600 mt-1">Resolution: {issue.resolution}</p>}
                      </div>
                      <div className="flex gap-1">
                        {(issue.status === "open" || issue.status === "in_progress") && (
                          <Button size="sm" variant="outline" onClick={() => updateIssue.mutate({ id: issue.id, status: "resolved", resolution: "Resolved" })}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "docs" && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Support Documents</CardTitle>
            <Link href={`/app/files?linkedRecordType=invoice&linkedRecordId=${invoiceId}`}>
              <Button size="sm" variant="outline"><Upload className="w-3 h-3 mr-1" /> Upload Document</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {(supportDocs as any[]).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No support documents linked. Upload files from the Files page and link them to this invoice.</p>
            ) : (
              <div className="space-y-2">
                {(supportDocs as any[]).map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.name || doc.fileName || `File #${doc.id}`}</p>
                        <p className="text-xs text-slate-500">{doc.category || "Uncategorized"} | {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}</p>
                      </div>
                    </div>
                    <Link href={`/app/files/${doc.id}`}>
                      <Button size="sm" variant="ghost" className="text-blue-600">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "payments" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {(paymentApps as any[]).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No payments applied yet.</p>
            ) : (
              <div className="space-y-2">
                {(paymentApps as any[]).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <Link href={`/app/payments/${app.paymentId}`}><span className="text-sm text-blue-600 hover:underline font-medium">Payment #{app.paymentId}</span></Link>
                      {app.notes && <p className="text-xs text-slate-500 mt-0.5">{app.notes}</p>}
                      <p className="text-xs text-slate-400">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""}</p>
                    </div>
                    <span className="font-semibold text-green-700">${parseFloat(app.amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t text-sm">
                  <span className="font-semibold text-slate-700">Total Applied</span>
                  <span className="font-bold text-green-700">${totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Invoice Amount</span>
                  <span className="text-slate-700">${invoiceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-amber-600">Remaining Balance</span>
                  <span className="font-bold text-amber-600">${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" /> Status History</CardTitle></CardHeader>
          <CardContent>
            {(statusHistory as any[]).length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No status changes recorded</p> : (
              <div className="space-y-2">
                {(statusHistory as any[]).map((h: any, i: number) => (
                  <div key={h.id || i} className="flex items-center gap-3 p-2 bg-slate-50 rounded text-sm">
                    <div className="flex-1">
                      <span className="text-slate-500">{statusLabels[h.oldStatus] || h.oldStatus || "—"}</span>
                      <span className="mx-1">{"\u2192"}</span>
                      <span className="font-medium text-slate-700">{statusLabels[h.newStatus] || h.newStatus}</span>
                      {h.notes && <span className="text-slate-400 ml-2">— {h.notes}</span>}
                    </div>
                    <span className="text-xs text-slate-400">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card className="mt-6">
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Invoice</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete Invoice #{invoice.invoiceNumber}? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: invoiceId })}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Void Invoice</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 mb-3">Voiding this invoice will mark it as cancelled. Please provide a reason.</p>
          <div>
            <Label>Reason *</Label>
            <Textarea value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="Reason for voiding this invoice..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidDialog(false)}>Cancel</Button>
            <Button onClick={handleVoid} className="bg-orange-600 hover:bg-orange-700 text-white">Void Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
