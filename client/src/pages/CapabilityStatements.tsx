import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, Plus, Loader2, Download, Trash2, Eye, Copy,
  Building, AlertCircle, CheckCircle2, Edit
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function CapabilityStatements() {
  const utils = trpc.useUtils();
  const [showBuilder, setShowBuilder] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showTailorDialog, setShowTailorDialog] = useState(false);
  const [tailorSourceId, setTailorSourceId] = useState<number | null>(null);
  const [tailorAudience, setTailorAudience] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    naicsCodes: "",
    pastPerformance: "",
    differentiators: "",
  });

  const { data: statements = [], isLoading } = trpc.capability.list.useQuery();
  const { data: profileData } = trpc.capability.getProfileData.useQuery();

  const createMutation = trpc.capability.create.useMutation({
    onSuccess: () => {
      utils.capability.list.invalidate();
      setShowBuilder(false);
      resetForm();
      toast.success("Capability statement created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = trpc.capability.update.useMutation({
    onSuccess: () => {
      utils.capability.list.invalidate();
      setEditId(null);
      resetForm();
      toast.success("Capability statement updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.capability.delete.useMutation({
    onSuccess: () => {
      utils.capability.list.invalidate();
      toast.success("Deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => setForm({ title: "", content: "", naicsCodes: "", pastPerformance: "", differentiators: "" });

  const buildFromProfile = () => {
    const p = profileData || {};
    const companyName = p.company_name || p.legal_name || "Your Company";
    const naics = p.naics_codes || p.naics || "";
    const certs = p.certifications || "";
    const capabilities = p.capabilities || p.core_competencies || "";
    const website = p.website || "";
    const email = p.email || p.contact_email || "";
    const phone = p.phone || p.contact_phone || "";

    const missingFields: string[] = [];
    if (!p.company_name && !p.legal_name) missingFields.push("Company Name");
    if (!naics) missingFields.push("NAICS Codes");
    if (!capabilities) missingFields.push("Core Capabilities");

    if (missingFields.length > 0) {
      toast.warning(`Missing profile data: ${missingFields.join(", ")}. Please update your Business Profile for a complete statement.`);
    }

    const content = [
      `# ${companyName} - Capability Statement`,
      "",
      "## Company Overview",
      p.company_overview || p.description || `${companyName} is a government contracting firm providing professional services.`,
      "",
      "## Core Competencies",
      capabilities || "- [Add your core competencies]",
      "",
      "## Certifications & Set-Asides",
      certs || "- [Add your certifications]",
      "",
      "## NAICS Codes",
      naics || "- [Add your NAICS codes]",
      "",
      "## Past Performance",
      "- [Add relevant past performance]",
      "",
      "## Contact Information",
      companyName,
      website ? `Website: ${website}` : "",
      email ? `Email: ${email}` : "",
      phone ? `Phone: ${phone}` : "",
    ].filter(Boolean).join("\n");

    setForm({
      title: `${companyName} Capability Statement`,
      content,
      naicsCodes: naics,
      pastPerformance: "",
      differentiators: capabilities,
    });
    setShowBuilder(true);
  };

  const createTailoredVersion = () => {
    if (!tailorSourceId) return;
    const source = (statements as any[]).find((s: any) => s.id === tailorSourceId);
    if (!source) return;

    setForm({
      title: `${source.title} - Tailored for ${tailorAudience || "Specific Agency"}`,
      content: source.content || "",
      naicsCodes: source.naicsCodes || "",
      pastPerformance: source.pastPerformance || "",
      differentiators: source.differentiators || "",
    });
    setShowTailorDialog(false);
    setShowBuilder(true);
    setTailorAudience("");
  };

  const exportAsText = (stmt: any) => {
    const text = [
      stmt.title,
      "=".repeat(stmt.title?.length || 20),
      "",
      stmt.content || "",
      "",
      stmt.naicsCodes ? `NAICS Codes: ${stmt.naicsCodes}` : "",
      stmt.pastPerformance ? `Past Performance: ${stmt.pastPerformance}` : "",
      stmt.differentiators ? `Differentiators: ${stmt.differentiators}` : "",
    ].filter(Boolean).join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(stmt.title || "capability-statement").replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as text file");
  };

  const startEdit = (stmt: any) => {
    setEditId(stmt.id);
    setForm({
      title: stmt.title || "",
      content: stmt.content || "",
      naicsCodes: stmt.naicsCodes || "",
      pastPerformance: stmt.pastPerformance || "",
      differentiators: stmt.differentiators || "",
    });
    setShowBuilder(true);
  };

  const handleSave = () => {
    if (editId) {
      updateMutation.mutate({ id: editId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <PageLayout
      title="Capability Statements"
      subtitle="Build formatted capability statements for government contracting"
      label="Marketing"
      summaryCards={[{ label: "Total Statements", value: (statements as any[]).length }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={buildFromProfile}>
            <Building className="w-4 h-4 mr-2" /> Build From Profile
          </Button>
          <Button onClick={() => { resetForm(); setEditId(null); setShowBuilder(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New Statement
          </Button>
        </div>
      }
    >
      <PageGuide
        title="Capability Statements"
        description="Build and maintain capability statements from your business profile data."
        whenToUse="When preparing for networking events, responding to sources sought, or marketing to agencies."
        whatToDoNext={["Build from your business profile", "Create tailored versions for specific agencies", "Export as downloadable document"]}
        relatedRecords={[{ label: "Business Profile", path: "/app/business-profile" }, { label: "Templates", path: "/app/templates" }]}
      />

      {/* Builder Form */}
      {showBuilder && (
        <Card className="mb-6 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editId ? "Edit" : "Build"} Capability Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., IT Services Capability Statement 2024" />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} placeholder="Full capability statement content (Markdown supported)..." className="font-mono text-sm" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>NAICS Codes</Label>
                  <Input value={form.naicsCodes} onChange={(e) => setForm({ ...form, naicsCodes: e.target.value })} placeholder="541512, 541519" />
                </div>
                <div>
                  <Label>Past Performance</Label>
                  <Input value={form.pastPerformance} onChange={(e) => setForm({ ...form, pastPerformance: e.target.value })} placeholder="Key contracts and results" />
                </div>
                <div>
                  <Label>Differentiators</Label>
                  <Input value={form.differentiators} onChange={(e) => setForm({ ...form, differentiators: e.target.value })} placeholder="What sets you apart" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!form.title || createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {editId ? "Update" : "Create"} Statement
                </Button>
                <Button variant="outline" onClick={() => { setShowBuilder(false); setEditId(null); resetForm(); }}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (statements as any[]).length === 0 && !showBuilder ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Capability Statements</h3>
          <p className="text-sm text-slate-500 mb-4">Build your first capability statement to share with government agencies.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={buildFromProfile}><Building className="w-4 h-4 mr-2" /> Build From Profile</Button>
            <Button onClick={() => { resetForm(); setShowBuilder(true); }}><Plus className="w-4 h-4 mr-2" /> Start Blank</Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(statements as any[]).map((stmt: any) => (
            <Card key={stmt.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{stmt.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {stmt.version && <span>v{stmt.version} &middot; </span>}
                      Created {stmt.createdAt ? new Date(stmt.createdAt).toLocaleDateString() : "recently"}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{stmt.status || "draft"}</Badge>
                </div>

                {stmt.naicsCodes && <p className="text-xs text-slate-600 mt-2"><span className="font-medium">NAICS:</span> {stmt.naicsCodes}</p>}
                {stmt.differentiators && <p className="text-xs text-slate-600"><span className="font-medium">Differentiators:</span> {stmt.differentiators}</p>}

                {previewId === stmt.id && (
                  <div className="mt-3 p-3 bg-slate-50 rounded text-sm border max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-slate-700">{stmt.content || "No content"}</pre>
                  </div>
                )}

                <div className="flex gap-1 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewId(previewId === stmt.id ? null : stmt.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(stmt)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => exportAsText(stmt)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setTailorSourceId(stmt.id); setShowTailorDialog(true); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ id: stmt.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tailor Dialog */}
      <Dialog open={showTailorDialog} onOpenChange={setShowTailorDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Tailored Version</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Create a copy of this capability statement tailored for a specific audience.</p>
          <div className="mt-3">
            <Label>Target Audience / Agency</Label>
            <Input value={tailorAudience} onChange={(e) => setTailorAudience(e.target.value)} placeholder="e.g., Department of Defense, VA, GSA" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTailorDialog(false)}>Cancel</Button>
            <Button onClick={createTailoredVersion}>Create Tailored Copy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
