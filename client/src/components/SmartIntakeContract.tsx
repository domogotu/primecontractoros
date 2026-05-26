import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, ArrowRightLeft, Download, Upload, Loader2 } from "lucide-react";
import ImportPreviewModal from "./ImportPreviewModal";
import MissingInfoPanel from "./MissingInfoPanel";

interface SmartIntakeContractProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function SmartIntakeContract({ open, onClose, onCreated }: SmartIntakeContractProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null);
  const [selectedProposal, setSelectedProposal] = useState("");

  // Manual form state
  const [formData, setFormData] = useState({
    title: "",
    contractNumber: "",
    agency: "",
    value: "",
    startDate: "",
    endDate: "",
  });

  const { data: wonProposals = [] } = trpc.proposals.list.useQuery();
  const filteredProposals = wonProposals.filter(p => p.status === "won");

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => {
      onCreated?.();
      onClose();
    },
  });

  const handleManualCreate = () => {
    createMutation.mutate({
      title: formData.title,
      contractNumber: formData.contractNumber || undefined,
      agency: formData.agency || undefined,
      value: formData.value ? parseFloat(formData.value) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    });
  };

  const handleConvertProposal = () => {
    const proposal = wonProposals.find(p => p.id.toString() === selectedProposal);
    if (!proposal) return;
    setPreviewData({
      title: proposal.title,
      proposalId: proposal.id,
      agency: "",
      contractNumber: "",
      value: "",
    });
    setShowPreview(true);
  };

  const handlePreviewConfirm = (data: Record<string, unknown>) => {
    createMutation.mutate({
      title: (data.title as string) || "Untitled Contract",
      contractNumber: data.contractNumber as string,
      agency: data.agency as string,
      value: data.value ? parseFloat(data.value as string) : undefined,
      startDate: data.startDate ? new Date(data.startDate as string) : undefined,
      endDate: data.endDate ? new Date(data.endDate as string) : undefined,
      proposalId: data.proposalId as number,
    });
    setShowPreview(false);
  };

  const getMissingFields = () => {
    const fields: { field: string; label: string; tier: "red" | "amber" | "blue" }[] = [];
    if (!formData.title) fields.push({ field: "title", label: "Title", tier: "red" });
    if (!formData.contractNumber) fields.push({ field: "contractNumber", label: "Contract Number", tier: "amber" });
    if (!formData.agency) fields.push({ field: "agency", label: "Agency", tier: "amber" });
    if (!formData.value) fields.push({ field: "value", label: "Contract Value", tier: "amber" });
    if (!formData.startDate) fields.push({ field: "startDate", label: "Start Date", tier: "blue" });
    if (!formData.endDate) fields.push({ field: "endDate", label: "End Date", tier: "blue" });
    return fields;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Contract</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual" className="text-xs">
                <Plus className="h-3 w-3 mr-1" /> Manual
              </TabsTrigger>
              <TabsTrigger value="convert" className="text-xs">
                <ArrowRightLeft className="h-3 w-3 mr-1" /> From Proposal
              </TabsTrigger>
              <TabsTrigger value="sam" className="text-xs">
                <Download className="h-3 w-3 mr-1" /> SAM Award
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs">
                <Upload className="h-3 w-3 mr-1" /> Upload File
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
                    placeholder="Contract title"
                  />
                </div>
                <div>
                  <Label>Contract Number</Label>
                  <Input
                    value={formData.contractNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractNumber: e.target.value }))}
                    placeholder="e.g., FA8750-24-C-0001"
                  />
                </div>
                <div>
                  <Label>Agency</Label>
                  <Input
                    value={formData.agency}
                    onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
                    placeholder="e.g., U.S. Air Force"
                  />
                </div>
                <div>
                  <Label>Contract Value ($)</Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <MissingInfoPanel fields={getMissingFields()} />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleManualCreate}
                  disabled={!formData.title || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Contract
                </Button>
              </div>
            </TabsContent>

            {/* Convert Won Proposal */}
            <TabsContent value="convert" className="space-y-4 mt-4">
              <div>
                <Label>Select Won Proposal</Label>
                <Select value={selectedProposal} onValueChange={setSelectedProposal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a won proposal to convert..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProposals.length === 0 ? (
                      <SelectItem value="none" disabled>No won proposals available</SelectItem>
                    ) : (
                      filteredProposals.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleConvertProposal} disabled={!selectedProposal}>
                  Convert to Contract
                </Button>
              </div>
            </TabsContent>

            {/* SAM.gov Award Import */}
            <TabsContent value="sam" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <Download className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Import contract details from a SAM.gov award notice
                </p>
                <Input placeholder="Enter SAM.gov award URL or contract number" className="max-w-md mx-auto" />
                <Button className="mt-3">Search Awards</Button>
              </div>
            </TabsContent>

            {/* Upload Contract File */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a contract PDF to auto-extract details
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports PDF, DOCX formats. AI will extract key terms.
                </p>
                <Input type="file" accept=".pdf,.docx" className="max-w-xs mx-auto" />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showPreview && previewData && (
        <ImportPreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          data={previewData}
          recordType="contract"
          onConfirm={handlePreviewConfirm}
        />
      )}
    </>
  );
}
