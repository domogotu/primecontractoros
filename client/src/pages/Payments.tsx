import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Payments() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ amount: "", method: "", reference: "", contractId: "", invoiceId: "", paymentDate: "", notes: "" });

  const { data: payments = [], isLoading, refetch } = trpc.payments.list.useQuery();
  const createMutation = trpc.payments.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ amount: "", method: "", reference: "", contractId: "", invoiceId: "", paymentDate: "", notes: "" }); } });
  const deleteMutation = trpc.payments.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (payments as any[]).filter((p) =>
    p.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.amount) return;
    createMutation.mutate({
      amount: form.amount,
      method: form.method || undefined,
      reference: form.reference || undefined,
      contractId: form.contractId ? parseInt(form.contractId) : undefined,
      invoiceId: form.invoiceId ? parseInt(form.invoiceId) : undefined,
      paymentDate: form.paymentDate || undefined,
      notes: form.notes || undefined,
    });
  };

  const totalAmount = (payments as any[]).reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

  return (
    <PageLayout
      title="Payments"
      subtitle="Track received payments, reconcile against invoices, and monitor cash flow"
      label="Finance"
      summaryCards={[
        { label: "Total Payments", value: payments.length },
        { label: "Total Received", value: `$${totalAmount.toLocaleString()}` },
        { label: "Pending", value: 0, color: "text-amber-600" },
        { label: "Overdue", value: 0, color: "text-red-600" },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      }
    >
      {/* Add Form */}
      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Amount *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Payment Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Reference Number" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Payment Date" type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Contract ID (optional)" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Invoice ID (optional)" value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
                    </DialogBody>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search payments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {/* Payment List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading payments...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Payments Recorded</h3>
          <p className="text-gray-600 mb-6">Record your first payment when you receive funds against an invoice.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Record Your First Payment
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((payment: any) => (
            <Card key={payment.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">${parseFloat(payment.amount || "0").toLocaleString()}</h3>
                  <p className="text-sm text-gray-500 mt-1">{payment.method || "Unknown method"} {payment.reference ? `• ${payment.reference}` : ""}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: payment.id })}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {payment.paymentDate && (
                <p className="text-xs text-gray-400 mt-2">Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
              )}
              {payment.notes && (
                <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
