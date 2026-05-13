import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wand2, FileText, Clock, CheckCircle2, Loader2 } from "lucide-react";
import LifecycleProgress from "@/components/LifecycleProgress";

const DOC_TYPES = [
  { id: "capability_statement", label: "Capability Statement", description: "Company capabilities and past performance summary" },
  { id: "proposal_outline", label: "Proposal Outline", description: "Structured proposal framework based on solicitation" },
  { id: "compliance_matrix", label: "Compliance Matrix", description: "Requirements-to-response mapping document" },
  { id: "past_performance", label: "Past Performance Narrative", description: "Formatted past performance write-up" },
  { id: "subcontracting_plan", label: "Subcontracting Plan", description: "Small business subcontracting plan template" },
  { id: "contract_summary", label: "Contract Summary Report", description: "Executive summary of contract status and metrics" },
  { id: "closeout_report", label: "Closeout Report", description: "Final contract closeout documentation" },
  { id: "letter_template", label: "Business Letter", description: "Professional correspondence template" },
];

export default function DocumentGeneration() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Query AI runs for document generation history
  const aiRunsQuery = trpc.ai.listRuns.useQuery();
  const generatedDocs = (aiRunsQuery.data || []).filter((r: any) => r.runType === "document_generation");

  const generateMutation = trpc.ai.generateGuidance.useMutation({
    onSuccess: () => {
      toast.success("Document generated successfully! Check the AI Runs section for results.");
      setSelectedType(null);
      setTitle("");
      setContext("");
      setIsGenerating(false);
      aiRunsQuery.refetch();
    },
    onError: (err: any) => {
      toast.error("Generation failed: " + err.message);
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    if (!selectedType || !title.trim()) {
      toast.error("Please select a document type and enter a title");
      return;
    }
    setIsGenerating(true);
    generateMutation.mutate({
      recordType: "document",
      recordId: 0,
      context: `Generate a ${DOC_TYPES.find(d => d.id === selectedType)?.label || selectedType} titled "${title}". ${context ? `Additional context: ${context}` : ""}`,
    });
  };

  return (
    <PageLayout
      label="AI Tools"
      title="Document Generator"
      subtitle="AI-powered document creation for government contracting. Select a template type, provide context, and generate formatted documents."
      summaryCards={[
        { label: "Templates", value: DOC_TYPES.length },
        { label: "Generated", value: generatedDocs.length },
      ]}
    >
      <LifecycleProgress currentPhase="proposal" />

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
            <FileText className="w-5 h-5 text-blue-600 mb-2" />
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
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Company Capability Statement 2026" />
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
            <p className="text-xs text-gray-400">AI-generated documents are drafts. Always review before use.</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Generated Documents */}
      {generatedDocs.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Generations</h2>
          <div className="space-y-2">
            {generatedDocs.slice(0, 10).map((doc: any) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.prompt?.substring(0, 80) || "Document generation"}</p>
                      <p className="text-xs text-gray-500">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                  <Badge className={doc.status === "completed" ? "bg-green-100 text-green-800" : doc.status === "running" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}>
                    {doc.status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {doc.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {generatedDocs.length === 0 && !selectedType && (
        <Card className="p-8 text-center">
          <Wand2 className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Generated Yet</h3>
          <p className="text-sm text-gray-500">Select a document type above to generate your first AI-powered contracting document.</p>
        </Card>
      )}
    </PageLayout>
  );
}
