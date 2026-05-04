import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Layout, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Templates() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ name: "", category: "proposal", content: "" });

  const { data: templates = [], isLoading, refetch } = trpc.templates.list.useQuery();
  const createMutation = trpc.templates.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ name: "", category: "proposal", content: "" }); },
  });
  const deleteMutation = trpc.templates.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (templates as any[]).filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.name) return;
    createMutation.mutate({ name: form.name, category: form.category || undefined, content: form.content || undefined });
  };

  const categoryLabels: Record<string, string> = {
    proposal: "Proposal", contract: "Contract", correspondence: "Correspondence",
    compliance: "Compliance", report: "Report", invoice: "Invoice", other: "Other",
  };

  return (
    <PageLayout
      title="Document Templates"
      subtitle="Reusable templates for proposals, contracts, correspondence, and compliance documents"
      label="Templates"
      summaryCards={[
        { label: "Total Templates", value: templates.length },
        { label: "Proposal", value: (templates as any[]).filter((t) => t.category === "proposal").length },
        { label: "Contract", value: (templates as any[]).filter((t) => t.category === "contract").length },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Template
        </Button>
      }
    >
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Template Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="proposal">Proposal</option>
              <option value="contract">Contract</option>
              <option value="correspondence">Correspondence</option>
              <option value="compliance">Compliance</option>
              <option value="report">Report</option>
              <option value="invoice">Invoice</option>
              <option value="other">Other</option>
            </select>
            <textarea placeholder="Template content (Markdown supported)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Creating..." : "Create Template"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading templates...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Created</h3>
          <p className="text-gray-600 mb-6">Create reusable templates for proposals, contracts, correspondence, and compliance documents to streamline your government contracting workflows.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create First Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tpl: any) => (
            <Card key={tpl.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{tpl.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">
                    {categoryLabels[tpl.category] || tpl.category || "Other"}
                  </span>
                  {tpl.content && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{tpl.content.substring(0, 100)}...</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: tpl.id })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
