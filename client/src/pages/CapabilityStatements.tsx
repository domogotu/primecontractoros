import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Loader2, Download, Trash2, Eye } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";

export default function CapabilityStatements() {
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    companyOverview: "",
    coreCompetencies: "",
    pastPerformance: "",
    naicsCodes: "",
    certifications: "",
    contactInfo: "",
  });

  const { data: statements = [], isLoading, refetch } = trpc.capability.list.useQuery();
  const generateMutation = trpc.capability.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowBuilder(false);
      setForm({ title: "", companyOverview: "", coreCompetencies: "", pastPerformance: "", naicsCodes: "", certifications: "", contactInfo: "" });
      toast.success("Capability Statement Created: Your capability statement has been generated.");
    },
  });
  const deleteMutation = trpc.capability.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Deleted"); },
  });

  if (isLoading) {
    return (
      <PageLayout title="Capability Statements" subtitle="Build and manage your capability statements" label="Marketing">
      <PageGuide
        title="Capability Statements"
        description="Build and maintain capability statements from your business profile data."
        whenToUse="When preparing for networking events, responding to sources sought, or marketing to agencies."
        whatToDoNext={["Build from your business profile", "Create tailored versions for specific agencies", "Export as downloadable document", "Review for missing data warnings"]}
        relatedRecords={[{ label: "Business Profile", path: "/app/business-profile" }, { label: "Templates", path: "/app/templates" }, { label: "Files", path: "/app/files" }]}
      />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Capability Statements"
      subtitle="Build formatted capability statements for government contracting"
      label="Marketing"
      summaryCards={[
        { label: "Total Statements", value: statements.length },
      ]}
      actions={
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="w-4 h-4 mr-2" /> Build New
        </Button>
      }
    >
      {/* Builder wizard */}
      {showBuilder && (
        <Card className="p-6 border border-blue-200 bg-blue-50/30 mb-6">
          <h3 className="text-lg font-semibold mb-4">Capability Statement Builder</h3>
          <p className="text-sm text-gray-600 mb-4">Fill in the sections below. The system will format these into a professional capability statement.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statement Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="e.g., IT Services Capability Statement 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Overview</label>
              <textarea
                value={form.companyOverview}
                onChange={(e) => setForm({ ...form, companyOverview: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="Brief description of your company, mission, and capabilities..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Core Competencies</label>
              <textarea
                value={form.coreCompetencies}
                onChange={(e) => setForm({ ...form, coreCompetencies: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="List your core competencies, one per line..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Past Performance</label>
              <textarea
                value={form.pastPerformance}
                onChange={(e) => setForm({ ...form, pastPerformance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="Key contracts, clients, and results..."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NAICS Codes</label>
                <input
                  type="text"
                  value={form.naicsCodes}
                  onChange={(e) => setForm({ ...form, naicsCodes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., 541512, 541519, 541611"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                <input
                  type="text"
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., 8(a), HUBZone, SDVOSB"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
              <textarea
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={2}
                placeholder="Company name, address, phone, email, website..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => generateMutation.mutate(form)}
              disabled={!form.title || generateMutation.isPending}
            >
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate Statement
            </Button>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Statements list */}
      {statements.length === 0 && !showBuilder ? (
        <Card className="p-8 text-center border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Capability Statements</h3>
          <p className="text-gray-600 mb-4">Build your first capability statement to share with government agencies.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {statements.map((stmt: any) => (
            <Card key={stmt.id} className="p-5 border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{stmt.title}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewId(previewId === stmt.id ? null : stmt.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ id: stmt.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Created {stmt.createdAt ? new Date(stmt.createdAt).toLocaleDateString() : "recently"}
              </p>
              {stmt.naicsCodes && (
                <p className="text-xs text-gray-600"><span className="font-medium">NAICS:</span> {stmt.naicsCodes}</p>
              )}
              {stmt.certifications && (
                <p className="text-xs text-gray-600"><span className="font-medium">Certs:</span> {stmt.certifications}</p>
              )}
              {previewId === stmt.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm space-y-2 border">
                  {stmt.companyOverview && <div><strong>Overview:</strong> {stmt.companyOverview}</div>}
                  {stmt.coreCompetencies && <div><strong>Core Competencies:</strong> {stmt.coreCompetencies}</div>}
                  {stmt.pastPerformance && <div><strong>Past Performance:</strong> {stmt.pastPerformance}</div>}
                  {stmt.contactInfo && <div><strong>Contact:</strong> {stmt.contactInfo}</div>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
