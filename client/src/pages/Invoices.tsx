import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Invoices() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ invoiceNumber: "", amount: "", contractId: "", description: "", dueDate: "" });

  const { data: invoices = [], isLoading, refetch } = trpc.invoices.list.useQuery();
  const createMutation = trpc.invoices.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ invoiceNumber: "", amount: "", contractId: "", description: "", dueDate: "" }); } });
  const deleteMutation = trpc.invoices.delete.useMutation({ onSuccess: () => refetch() });

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
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      }
    >
      {/* Add Form */}
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Invoice</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Invoice Number *" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Amount *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Contract ID (optional)" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

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
        <div className="text-center py-12 text-gray-500">Loading invoices...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Invoices Found</h3>
          <p className="text-gray-600 mb-6">Create your first invoice to start billing against your contracts.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Your First Invoice
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((invoice: any) => (
            <Card key={invoice.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                  <p className="text-sm text-gray-500 mt-1">{invoice.description || "No description"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === "paid" ? "bg-green-100 text-green-700" :
                  invoice.status === "overdue" ? "bg-red-100 text-red-700" :
                  invoice.status === "submitted" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {invoice.status || "draft"}
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">${parseFloat(invoice.amount || "0").toLocaleString()}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: invoice.id })}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {invoice.dueDate && (
                <p className="text-xs text-gray-400 mt-2">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
