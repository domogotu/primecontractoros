import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function LessonsLearned() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    contractId: "", proposalId: "", title: "", category: "process", description: "", impact: "", recommendation: "",
  });

  const { data: lessons = [], isLoading, refetch } = trpc.lessons.list.useQuery();
  const createMutation = trpc.lessons.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ contractId: "", proposalId: "", title: "", category: "process", description: "", impact: "", recommendation: "" }); },
  });
  const deleteMutation = trpc.lessons.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (lessons as any[]).filter((l) =>
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.title) return;
    createMutation.mutate({
      title: form.title,
      contractId: form.contractId ? parseInt(form.contractId) : undefined,
      proposalId: form.proposalId ? parseInt(form.proposalId) : undefined,
      category: form.category || undefined,
      description: form.description || undefined,
      impact: form.impact || undefined,
      recommendation: form.recommendation || undefined,
    });
  };

  const categoryLabels: Record<string, string> = {
    process: "Process Improvement", technical: "Technical", management: "Management",
    proposal: "Proposal Strategy", compliance: "Compliance", teaming: "Teaming/Subcontracting",
    pricing: "Pricing/Cost", performance: "Performance",
  };

  return (
    <PageLayout
      title="Lessons Learned"
      subtitle="Capture insights from completed contracts, proposals, and operations to improve future performance"
      label="Knowledge Base"
      summaryCards={[
        { label: "Total Lessons", value: lessons.length },
        { label: "Process", value: (lessons as any[]).filter((l) => l.category === "process").length },
        { label: "Technical", value: (lessons as any[]).filter((l) => l.category === "technical").length },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Lesson
        </Button>
      }
    >
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Record Lesson Learned</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Lesson Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="process">Process Improvement</option>
              <option value="technical">Technical</option>
              <option value="management">Management</option>
              <option value="proposal">Proposal Strategy</option>
              <option value="compliance">Compliance</option>
              <option value="teaming">Teaming/Subcontracting</option>
              <option value="pricing">Pricing/Cost</option>
              <option value="performance">Performance</option>
            </select>
            <input placeholder="Contract ID (optional)" type="number" value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Description (what happened, context)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Impact (positive or negative outcome)" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} rows={2} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Recommendation (what to do differently next time)" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} rows={2} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Saving..." : "Save Lesson"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search lessons..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading lessons...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Lessons Recorded</h3>
          <p className="text-gray-600 mb-6">Capture lessons learned from completed contracts, lost proposals, and operational challenges to continuously improve your contracting processes.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Record First Lesson
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lesson: any) => (
            <Card key={lesson.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">
                      {categoryLabels[lesson.category] || lesson.category}
                    </span>
                  </div>
                  {lesson.description && <p className="text-sm text-gray-600 mt-2">{lesson.description}</p>}
                  {lesson.recommendation && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                      <strong>Recommendation:</strong> {lesson.recommendation}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {lesson.contractId && <span className="text-xs text-gray-500">Contract #{lesson.contractId}</span>}
                    {lesson.proposalId && <span className="text-xs text-gray-500">Proposal #{lesson.proposalId}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: lesson.id })}>
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
