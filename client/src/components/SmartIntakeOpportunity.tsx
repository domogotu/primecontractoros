import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Link, Search, FileText, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import SamGovSearchModal from "./SamGovSearchModal";
import ImportPreviewModal from "./ImportPreviewModal";
import MissingInfoPanel from "./MissingInfoPanel";

interface SmartIntakeOpportunityProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function SmartIntakeOpportunity({ open, onClose, onCreated }: SmartIntakeOpportunityProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [samUrl, setSamUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showSamSearch, setShowSamSearch] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Manual form state
  const [formData, setFormData] = useState({
    title: "",
    agency: "",
    solicitation: "",
    naics: "",
    setAside: "",
    dueDate: "",
    type: "",
    sourceLink: "",
    summary: "",
  });

  const createMutation = trpc.opportunities.create.useMutation({
    onSuccess: () => {
      onCreated?.();
      onClose();
    },
  });

  // Duplicate check is handled server-side

  const handleManualCreate = () => {
    createMutation.mutate({
      title: formData.title,
      agency: formData.agency || undefined,
      solicitation: formData.solicitation || undefined,
      naics: formData.naics || undefined,
      setAside: formData.setAside || undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      type: formData.type || undefined,
      sourceLink: formData.sourceLink || undefined,
      summary: formData.summary || undefined,
    });
  };

  const handleUrlImport = async () => {
    if (!samUrl.trim()) return;
    setIsImporting(true);
    try {
      // Extract notice ID from URL
      const urlMatch = samUrl.match(/opportunities\/([^/?]+)/);
      const noticeId = urlMatch?.[1] || samUrl.trim();

      // Fetch from SAM.gov
      const result = await fetch(`/api/trpc/sam.getOpportunity?input=${encodeURIComponent(JSON.stringify({ noticeId }))}`);
      const data = await result.json();

      if (data?.result?.data) {
        setPreviewData(data.result.data);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) return;
    // Parse free-text description into structured fields
    const parsed = parseDescription(pasteText);
    setPreviewData(parsed);
    setShowPreview(true);
  };

  const handleSamImport = (opportunity: Record<string, unknown>) => {
    setPreviewData(opportunity);
    setShowSamSearch(false);
    setShowPreview(true);
  };

  const handlePreviewConfirm = (data: Record<string, unknown>) => {
    createMutation.mutate({
      title: (data.title as string) || "Untitled Opportunity",
      agency: data.agency as string,
      solicitation: data.solicitation as string,
      naics: data.naics as string,
      setAside: data.setAside as string,
      dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
      type: data.type as string,
      sourceLink: data.sourceLink as string,
      summary: data.summary as string,
    });
    setShowPreview(false);
  };

  const getMissingFields = () => {
    const required: { field: string; label: string; tier: "red" | "amber" | "blue" }[] = [];
    if (!formData.title) required.push({ field: "title", label: "Title", tier: "red" });
    if (!formData.agency) required.push({ field: "agency", label: "Agency", tier: "amber" });
    if (!formData.dueDate) required.push({ field: "dueDate", label: "Due Date", tier: "amber" });
    if (!formData.naics) required.push({ field: "naics", label: "NAICS Code", tier: "blue" });
    if (!formData.solicitation) required.push({ field: "solicitation", label: "Solicitation #", tier: "blue" });
    if (!formData.setAside) required.push({ field: "setAside", label: "Set-Aside", tier: "blue" });
    return required;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Opportunity</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual" className="text-xs">
                <Plus className="h-3 w-3 mr-1" /> Manual
              </TabsTrigger>
              <TabsTrigger value="url" className="text-xs">
                <Link className="h-3 w-3 mr-1" /> SAM.gov URL
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs">
                <Search className="h-3 w-3 mr-1" /> SAM Search
              </TabsTrigger>
              <TabsTrigger value="paste" className="text-xs">
                <FileText className="h-3 w-3 mr-1" /> Paste Text
              </TabsTrigger>
            </TabsList>

            {/* Manual Creation */}
            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Opportunity title"
                  />
                </div>
                <div>
                  <Label>Agency</Label>
                  <Input
                    value={formData.agency}
                    onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
                    placeholder="e.g., Department of Defense"
                  />
                </div>
                <div>
                  <Label>Solicitation #</Label>
                  <Input
                    value={formData.solicitation}
                    onChange={(e) => setFormData(prev => ({ ...prev, solicitation: e.target.value }))}
                    placeholder="e.g., W911NF-24-R-0001"
                  />
                </div>
                <div>
                  <Label>NAICS Code</Label>
                  <Input
                    value={formData.naics}
                    onChange={(e) => setFormData(prev => ({ ...prev, naics: e.target.value }))}
                    placeholder="e.g., 541512"
                  />
                </div>
                <div>
                  <Label>Set-Aside</Label>
                  <Input
                    value={formData.setAside}
                    onChange={(e) => setFormData(prev => ({ ...prev, setAside: e.target.value }))}
                    placeholder="e.g., Small Business"
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Input
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="e.g., RFP, RFI, Sources Sought"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Source Link</Label>
                  <Input
                    value={formData.sourceLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceLink: e.target.value }))}
                    placeholder="https://sam.gov/opp/..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Summary</Label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief description of the opportunity"
                    rows={3}
                  />
                </div>
              </div>

              <MissingInfoPanel fields={getMissingFields()} />

              {duplicateWarning && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-800">{duplicateWarning}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleManualCreate}
                  disabled={!formData.title || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Opportunity
                </Button>
              </div>
            </TabsContent>

            {/* URL Import */}
            <TabsContent value="url" className="space-y-4 mt-4">
              <div>
                <Label>SAM.gov Opportunity URL or Notice ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={samUrl}
                    onChange={(e) => setSamUrl(e.target.value)}
                    placeholder="https://sam.gov/opp/abc123... or notice ID"
                    className="flex-1"
                  />
                  <Button onClick={handleUrlImport} disabled={isImporting || !samUrl.trim()}>
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a SAM.gov opportunity URL or notice ID to auto-fetch all details
                </p>
              </div>
            </TabsContent>

            {/* SAM.gov Search */}
            <TabsContent value="search" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Search SAM.gov for opportunities by keyword, NAICS, agency, or set-aside
                </p>
                <Button onClick={() => setShowSamSearch(true)}>
                  Open SAM.gov Search
                </Button>
              </div>
            </TabsContent>

            {/* Paste Description */}
            <TabsContent value="paste" className="space-y-4 mt-4">
              <div>
                <Label>Paste Opportunity Description</Label>
                <Textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste the full opportunity description, email, or notice text here. The system will parse it into structured fields..."
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The system will extract title, agency, NAICS, dates, and other fields from free text
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasteImport} disabled={!pasteText.trim()}>
                  Parse & Preview
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* SAM.gov Search Modal */}
      {showSamSearch && (
        <SamGovSearchModal
          open={showSamSearch}
          onClose={() => setShowSamSearch(false)}
          onImport={handleSamImport}
        />
      )}

      {/* Import Preview Modal */}
      {showPreview && previewData && (
        <ImportPreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          data={previewData}
          recordType="opportunity"
          onConfirm={handlePreviewConfirm}
        />
      )}
    </>
  );
}

// Parse free-text description into structured fields
function parseDescription(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Extract title (first line or first sentence)
  const lines = text.split("\n").filter(l => l.trim());
  result.title = lines[0]?.substring(0, 200) || "Parsed Opportunity";

  // Extract solicitation number patterns
  const solMatch = text.match(/(?:solicitation|sol|rfp|rfi|rfq)[#:\s]*([A-Z0-9-]+)/i);
  if (solMatch) result.solicitation = solMatch[1];

  // Extract NAICS
  const naicsMatch = text.match(/(?:naics)[:\s]*(\d{6})/i);
  if (naicsMatch) result.naics = naicsMatch[1];

  // Extract agency
  const agencyPatterns = [
    /(?:agency|department|dept)[:\s]*([^\n,]+)/i,
    /(Department of [A-Za-z\s]+)/i,
    /(U\.?S\.?\s+[A-Za-z\s]+(?:Agency|Department|Administration|Service))/i,
  ];
  for (const pattern of agencyPatterns) {
    const match = text.match(pattern);
    if (match) { result.agency = match[1].trim(); break; }
  }

  // Extract dates
  const dateMatch = text.match(/(?:due|deadline|response|close)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i);
  if (dateMatch) result.dueDate = dateMatch[1];

  // Extract set-aside
  const setAsidePatterns = ["small business", "8(a)", "hubzone", "sdvosb", "wosb", "full and open"];
  for (const sa of setAsidePatterns) {
    if (text.toLowerCase().includes(sa)) { result.setAside = sa; break; }
  }

  result.summary = text.substring(0, 500);
  result.sourceLink = "";
  result.type = solMatch ? "RFP" : "Sources Sought";

  return result;
}
