import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Files() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "", fileKey: "", url: "", mimeType: "", size: "",
    category: "solicitation", linkedRecordType: "", linkedRecordId: "",
  });

  const { data: files = [], isLoading, refetch } = trpc.files.list.useQuery();
  const createMutation = trpc.files.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ name: "", fileKey: "", url: "", mimeType: "", size: "", category: "solicitation", linkedRecordType: "", linkedRecordId: "" });
    },
  });
  const deleteMutation = trpc.files.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (files as any[]).filter((f) =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.name || !form.fileKey || !form.url) return;
    createMutation.mutate({
      name: form.name,
      fileKey: form.fileKey,
      url: form.url,
      mimeType: form.mimeType || undefined,
      size: form.size ? parseInt(form.size) : undefined,
      category: form.category || undefined,
      linkedRecordType: form.linkedRecordType || undefined,
      linkedRecordId: form.linkedRecordId ? parseInt(form.linkedRecordId) : undefined,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "\u2014";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const categoryLabels: Record<string, string> = {
    solicitation: "Solicitation", proposal: "Proposal Document", contract: "Contract Document",
    modification: "Modification", deliverable: "Deliverable", correspondence: "Correspondence",
    compliance: "Compliance", financial: "Financial", governing: "Governing File", other: "Other",
  };

  return (
    <PageLayout
      title="Contract Files & Documents"
      subtitle="Manage solicitations, proposals, contract documents, modifications, and deliverables"
      label="Document Management"
      summaryCards={[
        { label: "Total Files", value: files.length },
        { label: "Solicitations", value: (files as any[]).filter((f) => f.category === "solicitation").length },
        { label: "Contract Docs", value: (files as any[]).filter((f) => f.category === "contract" || f.category === "governing").length },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      }
    >
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Document Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Storage Key (path) *" value={form.fileKey} onChange={(e) => setForm({ ...form, fileKey: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="File URL *" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="solicitation">Solicitation</option>
              <option value="proposal">Proposal Document</option>
              <option value="contract">Contract Document</option>
              <option value="modification">Modification</option>
              <option value="deliverable">Deliverable</option>
              <option value="correspondence">Correspondence</option>
              <option value="compliance">Compliance</option>
              <option value="financial">Financial</option>
              <option value="governing">Governing File</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="MIME Type (e.g., application/pdf)" value={form.mimeType} onChange={(e) => setForm({ ...form, mimeType: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="File Size (bytes)" type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.linkedRecordType} onChange={(e) => setForm({ ...form, linkedRecordType: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Link to Record Type (optional)</option>
              <option value="opportunity">Opportunity</option>
              <option value="proposal">Proposal</option>
              <option value="contract">Contract</option>
            </select>
            <input placeholder="Linked Record ID" value={form.linkedRecordId} onChange={(e) => setForm({ ...form, linkedRecordId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Uploading..." : "Upload Document"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search documents by name or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Documents Uploaded</h3>
          <p className="text-gray-600 mb-6">Upload solicitations, proposals, contract documents, modifications, and other files related to your government contracting operations.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Upload Your First Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((file: any) => (
            <Card key={file.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                        {categoryLabels[file.category] || file.category || "Other"}
                      </span>
                      {file.linkedRecordType && (
                        <span className="text-xs text-gray-500">Linked: {file.linkedRecordType} #{file.linkedRecordId}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: file.id })}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {file.url && (
                <div className="mt-3">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View / Download</a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
