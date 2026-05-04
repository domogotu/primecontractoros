import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, FileText, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function CapabilityStatements() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "", version: "", content: "", naicsCodes: "", pastPerformance: "", differentiators: "",
  });

  const { data: statements = [], isLoading, refetch } = trpc.capabilityStatements.list.useQuery();
  const createMutation = trpc.capabilityStatements.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ title: "", version: "", content: "", naicsCodes: "", pastPerformance: "", differentiators: "" }); },
  });
  const deleteMutation = trpc.capabilityStatements.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (statements as any[]).filter((s) =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.naicsCodes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.title) return;
    createMutation.mutate({
      title: form.title,
      version: form.version || undefined,
      content: form.content || undefined,
      naicsCodes: form.naicsCodes || undefined,
      pastPerformance: form.pastPerformance || undefined,
      differentiators: form.differentiators || undefined,
    });
  };

  return (
    <PageLayout
      title="Capability Statements"
      subtitle="Manage your company capability statements for government contracting opportunities and teaming arrangements"
      label="Capability Statements"
      summaryCards={[
        { label: "Total Statements", value: statements.length },
        { label: "Active", value: (statements as any[]).filter((s) => s.status === "active" || !s.status).length },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Statement
        </Button>
      }
    >
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Create Capability Statement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Statement Title * (e.g., IT Services Capability Statement v2.0)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Version (e.g., 2.1)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="NAICS Codes (comma-separated, e.g., 541512, 541519)" value={form.naicsCodes} onChange={(e) => setForm({ ...form, naicsCodes: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Core Capabilities / Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Past Performance (contract references, agencies served)" value={form.pastPerformance} onChange={(e) => setForm({ ...form, pastPerformance: e.target.value })} rows={3} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Differentiators (certifications, set-asides: 8(a), HUBZone, SDVOSB, WOSB)" value={form.differentiators} onChange={(e) => setForm({ ...form, differentiators: e.target.value })} rows={3} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Creating..." : "Create Statement"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search by title or NAICS code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading capability statements...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Capability Statements</h3>
          <p className="text-gray-600 mb-6">Create capability statements to share with agencies, primes, and teaming partners. Include your NAICS codes, past performance, certifications, and differentiators.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create First Statement
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((stmt: any) => (
            <Card key={stmt.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{stmt.title}</h3>
                    {stmt.version && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">v{stmt.version}</span>}
                  </div>
                  {stmt.naicsCodes && <p className="text-sm text-gray-600 mt-1 font-mono">NAICS: {stmt.naicsCodes}</p>}
                  {stmt.differentiators && <p className="text-sm text-gray-500 mt-1">{stmt.differentiators}</p>}
                  {stmt.content && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{stmt.content.substring(0, 150)}...</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: stmt.id })}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
