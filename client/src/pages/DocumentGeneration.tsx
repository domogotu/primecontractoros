import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wand2, FileText, Download, Clock, CheckCircle2, AlertCircle, Loader2, Plus, Eye } from "lucide-react";

const DOC_TYPES = [
  { id: "capability_statement", label: "Capability Statement", description: "Company capabilities and past performance summary", icon: "📋" },
  { id: "proposal_outline", label: "Proposal Outline", description: "Structured proposal framework based on solicitation", icon: "📝" },
  { id: "compliance_matrix", label: "Compliance Matrix", description: "Requirements-to-response mapping document", icon: "✅" },
  { id: "past_performance", label: "Past Performance Narrative", description: "Formatted past performance write-up", icon: "📊" },
  { id: "subcontracting_plan", label: "Subcontracting Plan", description: "Small business subcontracting plan template", icon: "🤝" },
  { id: "contract_summary", label: "Contract Summary Report", description: "Executive summary of contract status and metrics", icon: "📈" },
  { id: "closeout_report", label: "Closeout Report", description: "Final contract closeout documentation", icon: "📦" },
  { id: "letter_template", label: "Business Letter", description: "Professional correspondence template", icon: "✉️" },
];

export default function DocumentGeneration() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock generated docs history
  const [generatedDocs] = useState([
    { id: 1, type: "capability_statement", title: "Reed's Solutions Capability Statement", status: "completed", createdAt: "2026-05-10T14:30:00Z" },
    { id: 2, type: "proposal_outline", title: "DOD IT Modernization Proposal Outline", status: "completed", createdAt: "2026-05-08T09:15:00Z" },
    { id: 3, type: "compliance_matrix", title: "USAF Compliance Matrix - RFP-2026-001", status: "in_progress", createdAt: "2026-05-12T11:00:00Z" },
  ]);

  const handleGenerate = async () => {
    if (!selectedType || !title.trim()) {
      toast.error("Please select a document type and enter a title");
      return;
    }
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Document generated successfully! Check the Files section.");
      setSelectedType(null);
      setTitle("");
      setContext("");
    }, 3000);
  };

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Generator</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered document creation for government contracting</p>
        </div>
      </div>

      <PageGuide
        title="Document Generator"
        description="Create professional government contracting documents using AI. Select a template type, provide context, and generate formatted documents ready for review."
        whenToUse="When you need to create capability statements, proposal outlines, compliance matrices, or other standard contracting documents."
        whatToDoNext={["Select a document type below", "Provide context and requirements", "Generate and review the document", "Download or save to Files"]}
        relatedRecords={[{ label: "Files", path: "/app/files" }, { label: "Templates", path: "/app/templates" }, { label: "Proposals", path: "/app/proposals" }]}
      />

      {/* Document Type Selection */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Document Type</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {DOC_TYPES.map((dt) => (
          <button
            key={dt.id}
            onClick={() => setSelectedType(dt.id)}
            className={`text-left p-4 rounded-lg border transition-all ${
              selectedType === dt.id
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <span className="text-2xl mb-2 block">{dt.icon}</span>
            <h3 className="font-semibold text-sm text-gray-900">{dt.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{dt.description}</p>
          </button>
        ))}
      </div>

      {/* Generation Form */}
      {selectedType && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-600" />
              Generate: {DOC_TYPES.find(d => d.id === selectedType)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Document Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Reed's Solutions Capability Statement 2026" />
            </div>
            <div>
              <Label>Context / Instructions (optional)</Label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide any specific requirements, contract references, or details to include..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={isGenerating || !title.trim()} className="bg-blue-900 hover:bg-blue-800">
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4 mr-2" /> Generate Document</>}
              </Button>
              <Button variant="outline" onClick={() => { setSelectedType(null); setTitle(""); setContext(""); }}>Cancel</Button>
            </div>
            <p className="text-xs text-gray-400">AI-generated documents are drafts. Always review before use. AI does not make legal conclusions.</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Generated Documents */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h2>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {generatedDocs.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="capitalize">{doc.type.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[doc.status] || "bg-gray-100 text-gray-600"}>
                    {doc.status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : doc.status === "in_progress" ? <Clock className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {doc.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Opening document preview...")}><Eye className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Downloading document...")}><Download className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
