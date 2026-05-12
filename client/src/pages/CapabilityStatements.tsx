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
  Building2, CheckCircle2, Edit, FilePlus2, X, AlertCircle,
  ChevronDown, ChevronUp, FileDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Statement {
  id: number;
  title?: string | null;
  content?: string | null;
  naicsCodes?: string | null;
  pastPerformance?: string | null;
  differentiators?: string | null;
  status?: string | null;
  version?: number | null;
  createdAt?: Date | string | null;
}

// ─── Statement Card ───────────────────────────────────────────────────────────

function StatementCard({
  stmt,
  onEdit,
  onDelete,
  onTailor,
  onExportText,
  onExportPdf,
  isExportingPdf,
}: {
  stmt: Statement;
  onEdit: (s: Statement) => void;
  onDelete: (id: number) => void;
  onTailor: (id: number) => void;
  onExportText: (s: Statement) => void;
  onExportPdf: (id: number) => void;
  isExportingPdf: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    draft: "bg-amber-100 text-amber-800 border-amber-200",
    archived: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const status = stmt.status || "draft";

  return (
    <Card className="border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm leading-snug">{stmt.title || "Untitled Statement"}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[status] || statusColor.draft}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stmt.version ? `Version ${stmt.version} · ` : ""}
              Created {stmt.createdAt ? new Date(stmt.createdAt as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "recently"}
            </p>
          </div>
        </div>

        {/* Meta pills */}
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {stmt.naicsCodes && (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md font-mono">
              NAICS: {stmt.naicsCodes}
            </span>
          )}
          {stmt.differentiators && (
            <span className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-1 rounded-md max-w-xs truncate">
              {stmt.differentiators.slice(0, 60)}{stmt.differentiators.length > 60 ? "…" : ""}
            </span>
          )}
        </div>

        {/* Expandable content preview */}
        {stmt.content && (
          <div className="px-5 pb-4">
            <button
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? "Hide preview" : "Preview content"}
            </button>
            {expanded && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-56 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed">{stmt.content}</pre>
              </div>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-1 flex-wrap">
          <Button variant="ghost" size="sm" className="text-xs h-8 px-3 text-slate-600 hover:text-slate-900" onClick={() => onEdit(stmt)}>
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 px-3 text-slate-600 hover:text-slate-900" onClick={() => onTailor(stmt.id)}>
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Tailor Copy
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 px-3 text-slate-600 hover:text-slate-900" onClick={() => onExportText(stmt)}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> .txt
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => onExportPdf(stmt.id)}
            disabled={isExportingPdf}
          >
            {isExportingPdf
              ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              : <FileDown className="w-3.5 h-3.5 mr-1.5" />}
            Download PDF
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(stmt.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CapabilityStatements() {
  const utils = trpc.useUtils();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showTailorDialog, setShowTailorDialog] = useState(false);
  const [tailorSourceId, setTailorSourceId] = useState<number | null>(null);
  const [tailorAudience, setTailorAudience] = useState("");
  const [exportingPdfId, setExportingPdfId] = useState<number | null>(null);
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
      setShowBuilder(false);
      toast.success("Capability statement updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.capability.delete.useMutation({
    onSuccess: () => {
      utils.capability.list.invalidate();
      toast.success("Statement deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const exportPdfMutation = trpc.pdf.exportCapabilityStatement.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success("PDF ready — opening in new tab");
      setExportingPdfId(null);
    },
    onError: (e: any) => {
      toast.error(e.message || "PDF export failed");
      setExportingPdfId(null);
    },
  });

  const resetForm = () =>
    setForm({ title: "", content: "", naicsCodes: "", pastPerformance: "", differentiators: "" });

  const buildFromProfile = () => {
    const p = (profileData as any) || {};
    const companyName = p.company_name || p.legal_name || "Your Company";
    const naics = p.naics_codes || p.naics || "";
    const certs = p.certifications || "";
    const capabilities = p.capabilities || p.core_competencies || "";
    const website = p.website || "";
    const email = p.email || p.contact_email || "";
    const phone = p.phone || p.contact_phone || "";

    const missing: string[] = [];
    if (!p.company_name && !p.legal_name) missing.push("Company Name");
    if (!naics) missing.push("NAICS Codes");
    if (!capabilities) missing.push("Core Capabilities");
    if (missing.length > 0) {
      toast.warning(`Missing profile data: ${missing.join(", ")}. Update your Business Profile for a complete statement.`);
    }

    const content = [
      `# ${companyName} — Capability Statement`,
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
    ]
      .filter(Boolean)
      .join("\n");

    setForm({
      title: `${companyName} Capability Statement`,
      content,
      naicsCodes: naics,
      pastPerformance: "",
      differentiators: capabilities,
    });
    setEditId(null);
    setShowBuilder(true);
  };

  const createTailoredVersion = () => {
    if (!tailorSourceId) return;
    const source = (statements as Statement[]).find((s) => s.id === tailorSourceId);
    if (!source) return;
    setForm({
      title: `${source.title || "Statement"} — Tailored for ${tailorAudience || "Specific Agency"}`,
      content: source.content || "",
      naicsCodes: source.naicsCodes || "",
      pastPerformance: source.pastPerformance || "",
      differentiators: source.differentiators || "",
    });
    setShowTailorDialog(false);
    setEditId(null);
    setShowBuilder(true);
    setTailorAudience("");
  };

  const exportAsText = (stmt: Statement) => {
    const text = [
      stmt.title,
      "=".repeat((stmt.title?.length || 20)),
      "",
      stmt.content || "",
      "",
      stmt.naicsCodes ? `NAICS Codes: ${stmt.naicsCodes}` : "",
      stmt.pastPerformance ? `Past Performance: ${stmt.pastPerformance}` : "",
      stmt.differentiators ? `Differentiators: ${stmt.differentiators}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(stmt.title || "capability-statement").replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as text file");
  };

  const handleExportPdf = (id: number) => {
    setExportingPdfId(id);
    exportPdfMutation.mutate({ statementId: id });
  };

  const startEdit = (stmt: Statement) => {
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
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editId) {
      updateMutation.mutate({ id: editId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <PageLayout
      title="Capability Statements"
      subtitle="Build, manage, and export capability statements for government contracting"
      label="Marketing"
      summaryCards={[
        { label: "Total Statements", value: (statements as Statement[]).length },
        { label: "Active", value: (statements as Statement[]).filter((s) => s.status === "active").length },
        { label: "Drafts", value: (statements as Statement[]).filter((s) => !s.status || s.status === "draft").length },
      ]}
      actions={
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={buildFromProfile}>
            <Building2 className="w-4 h-4 mr-2" /> Build From Profile
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setEditId(null);
              setShowBuilder(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> New Statement
          </Button>
        </div>
      }
    >
      <PageGuide
        title="Capability Statements"
        description="Build and maintain capability statements from your business profile data. A capability statement is a one-page marketing document that summarizes your company's qualifications, past performance, and differentiators for government agencies."
        whenToUse="When preparing for networking events, responding to sources sought notices, or marketing to specific agencies."
        whatToDoNext={[
          "Click 'Build From Profile' to auto-populate from your business profile",
          "Create tailored versions for specific agencies or opportunities",
          "Download as PDF to share with contracting officers",
        ]}
        relatedRecords={[
          { label: "Business Profile", path: "/app/business-profile" },
          { label: "Templates", path: "/app/templates" },
        ]}
      />

      {/* ── Builder Form ── */}
      {showBuilder && (
        <Card className="mb-6 border-blue-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FilePlus2 className="w-4 h-4 text-blue-600" />
                {editId ? "Edit Capability Statement" : "New Capability Statement"}
              </CardTitle>
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => { setShowBuilder(false); setEditId(null); resetForm(); }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-5">
              {/* Title */}
              <div>
                <Label className="text-sm font-medium text-slate-700">Statement Title <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Reed's Solutions LLC — IT Services Capability Statement 2025"
                />
              </div>

              {/* Content */}
              <div>
                <Label className="text-sm font-medium text-slate-700">Statement Content</Label>
                <p className="text-xs text-slate-500 mt-0.5 mb-1">Markdown is supported. Use ## for section headings.</p>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  placeholder="## Company Overview&#10;&#10;## Core Competencies&#10;&#10;## Certifications & Set-Asides&#10;&#10;## Past Performance&#10;&#10;## Contact Information"
                  className="font-mono text-sm"
                />
              </div>

              {/* Meta fields */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">NAICS Codes</Label>
                  <Input
                    className="mt-1"
                    value={form.naicsCodes}
                    onChange={(e) => setForm({ ...form, naicsCodes: e.target.value })}
                    placeholder="541512, 541519"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Past Performance Summary</Label>
                  <Input
                    className="mt-1"
                    value={form.pastPerformance}
                    onChange={(e) => setForm({ ...form, pastPerformance: e.target.value })}
                    placeholder="Key contracts and outcomes"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Differentiators</Label>
                  <Input
                    className="mt-1"
                    value={form.differentiators}
                    onChange={(e) => setForm({ ...form, differentiators: e.target.value })}
                    placeholder="What sets you apart"
                  />
                </div>
              </div>

              {/* Tip */}
              <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  A strong capability statement is one page. Focus on your top 3–5 core competencies, one or two relevant past performance examples, and clear contact information.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={!form.title.trim() || isSaving}>
                  {isSaving
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {editId ? "Update Statement" : "Create Statement"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowBuilder(false); setEditId(null); resetForm(); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Statements List ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (statements as Statement[]).length === 0 && !showBuilder ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">No Capability Statements Yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Build your first capability statement to share with government agencies and contracting officers.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="outline" onClick={buildFromProfile}>
                <Building2 className="w-4 h-4 mr-2" /> Build From Profile
              </Button>
              <Button onClick={() => { resetForm(); setShowBuilder(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Start Blank
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(statements as Statement[]).map((stmt) => (
            <StatementCard
              key={stmt.id}
              stmt={stmt}
              onEdit={startEdit}
              onDelete={(id) => deleteMutation.mutate({ id })}
              onTailor={(id) => { setTailorSourceId(id); setShowTailorDialog(true); }}
              onExportText={exportAsText}
              onExportPdf={handleExportPdf}
              isExportingPdf={exportingPdfId === stmt.id && exportPdfMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* ── Tailor Dialog ── */}
      <Dialog open={showTailorDialog} onOpenChange={setShowTailorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tailored Version</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Create a copy of this capability statement customized for a specific agency or opportunity.
          </p>
          <div className="mt-3">
            <Label>Target Agency or Audience</Label>
            <Input
              className="mt-1"
              value={tailorAudience}
              onChange={(e) => setTailorAudience(e.target.value)}
              placeholder="e.g., Department of Defense, VA, GSA Schedule"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowTailorDialog(false)}>Cancel</Button>
            <Button onClick={createTailoredVersion}>Create Tailored Copy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
