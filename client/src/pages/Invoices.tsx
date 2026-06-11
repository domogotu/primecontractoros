import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Receipt, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import LifecycleProgress from "@/components/LifecycleProgress";
import AIStatusPanel, { AICheck } from "@/components/AIStatusPanel";
import WhatsNext, { NextAction } from "@/components/WhatsNext";
import ValidationWarnings, { ValidationWarning } from "@/components/ValidationWarnings";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

export default function Invoices() {
  const searchString = useSearch();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Open create dialog when navigated here with ?create=true (e.g. from CommandPalette)
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("create") === "true") {
      setShowForm(true);
    }
  }, [searchString]);
  const [form, setForm] = useState({ invoiceNumber: "", amount: "", contractId: "", description: "", dueDate: "" });

  const { data: invoices = [], isLoading, refetch } = trpc.invoices.list.useQuery();
  const createMutation = trpc.invoices.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ invoiceNumber: "", amount: "", contractId: "", description: "", dueDate: "" }); } });
  const deleteMutation = trpc.invoices.delete.useMutation({ onSuccess: () => refetch() });
  const exportFinance = trpc.pdf.exportFinanceSummary.useMutation({
    onSuccess: (data) => { window.open(data.url, "_blank"); },
  });

  const filtered = (invoices as any[]).filter((inv) =>
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.invoiceNumber || !form.amount) return;
    createMutation.mutate({
      invoiceNumber: form.invoiceNumber,
      amount: form.amount,
      contractId: form.contractId ? parseInt(form.contractId) : undefined,
      description: form.description || undefined,
      dueDate: form.dueDate || undefined,
    });
  };

  const totalAmount = (invoices as any[]).reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);
  const paidCount = (invoices as any[]).filter((inv) => inv.status === "paid").length;
  const overdueCount = (invoices as any[]).filter((inv) => inv.status === "overdue").length;
  const draftCount = (invoices as any[]).filter((inv) => inv.status === "draft" || !inv.status).length;
  const submittedCount = (invoices as any[]).filter((inv) => inv.status === "submitted").length;

  // Overdue invoices
  const overdueInvoices = useMemo(() => {
    return (invoices as any[]).filter((inv) => inv.status === "overdue" || (inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== "paid"));
  }, [invoices]);

  // AI Status Checks
  const aiChecks = useMemo((): AICheck[] => {
    const checks: AICheck[] = [];

    checks.push({
      id: "overdue-invoices",
      name: "Overdue Invoices",
      status: overdueInvoices.length > 0 ? "flagged" : "verified",
      message: overdueInvoices.length > 0 ? `${overdueInvoices.length} invoice(s) past due date — follow up immediately` : "No overdue invoices",
      severity: overdueInvoices.length > 0 ? "error" : "info",
    });

    checks.push({
      id: "draft-invoices",
      name: "Unsubmitted Invoices",
      status: draftCount > 0 ? "flagged" : "verified",
      message: draftCount > 0 ? `${draftCount} invoice(s) in draft — submit to start payment cycle` : "All invoices submitted",
      severity: draftCount > 0 ? "warning" : "info",
    });

    checks.push({
      id: "payment-rate",
      name: "Payment Rate",
      status: invoices.length > 0 && paidCount > 0 ? "verified" : invoices.length > 0 ? "flagged" : "pending",
      message: invoices.length > 0 ? `${Math.round((paidCount / invoices.length) * 100)}% of invoices paid (${paidCount}/${invoices.length})` : "No invoices created yet",
      severity: invoices.length > 0 && paidCount === 0 ? "warning" : "info",
    });

    checks.push({
      id: "submitted-pending",
      name: "Awaiting Payment",
      status: submittedCount > 0 ? "flagged" : "verified",
      message: submittedCount > 0 ? `${submittedCount} invoice(s) submitted and awaiting payment` : "No invoices awaiting payment",
      severity: submittedCount > 0 ? "warning" : "info",
    });

    return checks;
  }, [overdueInvoices, draftCount, paidCount, submittedCount, invoices.length]);

  // Next Steps
  const nextSteps = useMemo((): NextAction[] => {
    const steps: NextAction[] = [];

    if (overdueInvoices.length > 0) {
      steps.push({
        id: "follow-up-overdue",
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? "s" : ""}`,
        description: "Follow up with the contracting officer on overdue payments",
        priority: "high",
      });
    }

    if (draftCount > 0) {
      steps.push({
        id: "submit-drafts",
        title: `${draftCount} Draft Invoice${draftCount > 1 ? "s" : ""} Ready to Submit`,
        description: "Review and submit draft invoices to begin the payment cycle",
        priority: "medium",
      });
    }

    if (invoices.length === 0) {
      steps.push({
        id: "create-first",
        title: "Create Your First Invoice",
        description: "Bill against a contract for completed deliverables or milestones",
        priority: "high",
        action: {
          label: "Create",
          onClick: () => setShowForm(true),
        },
      });
    }

    return steps.slice(0, 4);
  }, [overdueInvoices, draftCount, invoices.length]);

  // Validation Warnings
  const validationWarnings = useMemo((): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.amount || "0"), 0);
      warnings.push({
        id: "overdue",
        message: `$${totalOverdue.toLocaleString()} in overdue invoices (${overdueInvoices.length} invoice${overdueInvoices.length > 1 ? "s" : ""}). Follow up with contracting officer.`,
        type: "error",
        dismissible: true,
      });
    }

    return warnings;
  }, [overdueInvoices]);

  return (
    <PageLayout
      title="Invoices"
      subtitle="Create, submit, and track invoices for your government contracts"
      label="Finance"
      summaryCards={[
        { label: "Total", value: invoices.length },
        { label: "Amount", value: `$${totalAmount.toLocaleString()}` },
        { label: "Paid", value: paidCount, color: "text-green-600" },
        { label: "Overdue", value: overdueCount, color: "text-red-600" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportFinance.mutate()} disabled={exportFinance.isPending}>
            <Download className="w-4 h-4 mr-2" /> {exportFinance.isPending ? "Exporting..." : "Export PDF"}
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Button>
        </div>
      }
    >
      <PageGuide
        title="Invoices"
        description="Track what was billed, submission status, and payment application. Government invoicing follows strict rules — submit on time, match to deliverables, and track payment cycles."
        whenToUse="When creating invoices, tracking submissions, or matching payments to invoices."
        whatToDoNext={["Create invoices for completed deliverables", "Submit draft invoices to the government", "Apply received payments to invoices", "Follow up on overdue invoices"]}
        relatedRecords={[{ label: "Payments", path: "/app/payments" }, { label: "Finance", path: "/app/finance" }, { label: "Contracts", path: "/app/contracts" }]}
      />

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && <ValidationWarnings warnings={validationWarnings} />}

      {/* Lifecycle Progress */}
      <LifecycleProgress currentPhase="performance" />

      {/* AI Status Panel */}
      <AIStatusPanel checks={aiChecks} title="INVOICING STATUS" />

      {/* What's Next */}
      {nextSteps.length > 0 && <WhatsNext actions={nextSteps} />}

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="invoices" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="invoices" />

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Invoice Number *" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Amount *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Contract ID (optional)" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {/* Invoice List */}
      {isLoading ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Loading invoices...</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Invoices Found</h3>
          <p className="text-gray-600 mb-6">{searchTerm ? "Try adjusting your search." : "Create your first invoice to start billing against your contracts."}</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Your First Invoice
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((invoice: any) => {
            const isOverdue = invoice.status === "overdue" || (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== "paid");
            return (
              <Card key={invoice.id} className={`bg-white border p-5 hover:shadow-md transition-shadow ${isOverdue ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">{invoice.description || "No description"}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                    invoice.status === "paid" ? "bg-green-100 text-green-700" :
                    isOverdue ? "bg-red-100 text-red-700" :
                    invoice.status === "submitted" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {isOverdue && invoice.status !== "overdue" ? "overdue" : invoice.status || "draft"}
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">${parseFloat(invoice.amount || "0").toLocaleString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: invoice.id })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                {invoice.dueDate && (
                  <p className={`text-xs mt-2 ${isOverdue ? "text-red-600 font-medium" : "text-gray-400"}`}>
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    {isOverdue && " — OVERDUE"}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <PageGuidancePanel
        pageKey="invoices"
        title="Invoices Help"
        description="Track invoices separately from payments. Create invoices from contracts, attach support documentation, and track submission and payment status."
        whatToDoNext={[
          "Create invoices linked to active contracts",
          "Attach required supporting documentation",
          "Track submission status and follow up on overdue invoices",
          "Match received payments to invoices on the Payments page"
        ]}
        helpArticleSlug="why-invoices-payments-separate"
        glossaryTerms={["invoice", "proper-invoice", "prompt-payment"]}
        warnings={["Invoices and payments are tracked separately because submission and receipt are different events in government contracting."]}
      />
    </PageLayout>
  );
}
