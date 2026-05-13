import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Loader2, Copy, Trash2, Eye } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";

export default function Templates() {
  
  const [showCreate, setShowCreate] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", category: "proposal", content: "" });

  const { data: templates = [], isLoading, refetch } = trpc.intTemplates.list.useQuery();
  const defaultsQuery = trpc.intTemplates.getDefaults.useQuery();
  const addDefaultsMutation = trpc.intTemplates.createFromDefault.useMutation({
    onSuccess: () => { refetch(); toast.success("Templates Added: Pre-built templates have been added to your library."); },
  });
  const createMutation = trpc.intTemplates.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreate(false);
      setForm({ name: "", category: "proposal", content: "" });
      toast.success("Template Created");
    },
  });
  const deleteMutation = trpc.intTemplates.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Template Deleted"); },
  });

  const categories = ["proposal", "contract", "closeout", "capability", "past_performance"];

  if (isLoading) {
    return (
      <PageLayout title="Template Library" subtitle="Pre-built templates for government contracting" label="Resources">
      <PageGuide
        title="Templates"
        description="Reusable structures, checklists, and language for proposals, contracts, and operations."
        whenToUse="When creating reusable templates, applying templates to new records, or improving from lessons learned."
        whatToDoNext={["Create templates from successful proposals", "Apply templates to new proposals or contracts", "Update templates with lessons learned", "Review template usage and effectiveness"]}
        relatedRecords={[{ label: "Proposals", path: "/app/proposals" }, { label: "Lessons Learned", path: "/app/lessons-learned" }, { label: "Capability Statements", path: "/app/capability-statements" }]}
      />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Template Library"
      subtitle="Pre-built templates for proposals, contracts, closeouts, and more"
      label="Resources"
      summaryCards={[
        { label: "Total Templates", value: templates.length },
        { label: "Categories", value: categories.length },
      ]}
      actions={
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button variant="outline" onClick={() => addDefaultsMutation.mutate({ templateKey: "default" })} disabled={addDefaultsMutation.isPending}>
              {addDefaultsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
              Load Defaults
            </Button>
          )}
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Template
          </Button>
        </div>
      }
    >
      {/* Create form */}
      {showCreate && (
        <Card className="p-6 border border-blue-200 bg-blue-50/30 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Template</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              rows={10}
              placeholder="Template content (supports markdown)..."
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.content || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Template
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Templates grid */}
      {templates.length === 0 && !showCreate ? (
        <Card className="p-8 text-center border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Yet</h3>
          <p className="text-gray-600 mb-4">Load pre-built templates or create your own to streamline your workflow.</p>
          <Button onClick={() => addDefaultsMutation.mutate({ templateKey: "default" })} disabled={addDefaultsMutation.isPending}>
            {addDefaultsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
            Load Default Templates
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl: any) => (
            <Card key={tmpl.id} className="p-5 border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewId(previewId === tmpl.id ? null : tmpl.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ id: tmpl.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{tmpl.title}</h3>
              <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded capitalize">
                {tmpl.category?.replace("_", " ")}
              </span>
              {previewId === tmpl.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-700 max-h-48 overflow-auto whitespace-pre-wrap border">
                  {tmpl.content}
                </div>
              )}
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(tmpl.content || "");
                    toast.success("Copied: Template content copied to clipboard.");
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" /> Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
