import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  Eye,
  FileText,
} from "lucide-react";

interface SamImportPanelProps {
  onImportSuccess?: () => void;
}

export default function SamImportPanel({ onImportSuccess }: SamImportPanelProps) {
  const [, navigate] = useLocation();
  const [samUrl, setSamUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "success" | "error" | "duplicate">("idle");
  const [message, setMessage] = useState("");
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewAttachments, setPreviewAttachments] = useState<any[]>([]);
  const [duplicateId, setDuplicateId] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);

  const importMutation = trpc.sam.importFromUrl.useMutation();
  const previewMutation = trpc.sam.previewFromUrl.useMutation();

  const handleImport = async () => {
    if (!samUrl.trim()) {
      setStatus("error");
      setMessage("Please paste a SAM.gov opportunity URL.");
      return;
    }

    setStatus("loading");
    setMessage("");
    setImportWarnings([]);

    try {
      const result = await importMutation.mutateAsync({ samUrl: samUrl.trim() });

      if (result.isDuplicate) {
        setStatus("duplicate");
        setDuplicateId(result.existingId || null);
        setMessage(result.message || "This opportunity already exists in your workspace.");
        return;
      }

      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Opportunity imported from SAM.gov successfully.");

        const warnings: string[] = [];
        if (result.isArchived) warnings.push("This opportunity is archived on SAM.gov.");
        if (result.isInactive) warnings.push("This opportunity is marked inactive on SAM.gov.");
        setImportWarnings(warnings);

        onImportSuccess?.();

        // Redirect after short delay
        setTimeout(() => {
          if (result.redirectUrl) {
            navigate(result.redirectUrl);
          }
        }, 1500);
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Could not import this SAM.gov opportunity. Please confirm the URL is valid or enter the opportunity manually.");
    }
  };

  const handlePreview = async () => {
    if (!samUrl.trim()) {
      setStatus("error");
      setMessage("Please paste a SAM.gov opportunity URL.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await previewMutation.mutateAsync({ samUrl: samUrl.trim() });

      if (result.isDuplicate) {
        setStatus("duplicate");
        setDuplicateId(result.existingId || null);
        setMessage("This opportunity already exists in your workspace.");
        return;
      }

      if (result.success) {
        setPreviewData(result.data);
        setPreviewAttachments(result.attachments || []);
        setIsPreviewOpen(true);
        setStatus("preview");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Could not retrieve opportunity data from SAM.gov.");
    }
  };

  const handleConfirmImport = async () => {
    setIsPreviewOpen(false);
    await handleImport();
  };

  const resetState = () => {
    setStatus("idle");
    setMessage("");
    setSamUrl("");
    setPreviewData(null);
    setPreviewAttachments([]);
    setDuplicateId(null);
    setImportWarnings([]);
  };

  return (
    <>
      <Card className="bg-white border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Import from SAM.gov</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Paste a SAM.gov opportunity link and PrimeContractorOS will create a structured opportunity record with the available agency, notice, NAICS, due date, source link, and attachment information.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={samUrl}
            onChange={(e) => {
              setSamUrl(e.target.value);
              if (status !== "idle" && status !== "loading") setStatus("idle");
            }}
            placeholder="Paste SAM.gov opportunity URL"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status === "loading"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !importMutation.isPending) handleImport();
            }}
          />
          <Button
            onClick={handleImport}
            disabled={status === "loading" || !samUrl.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm whitespace-nowrap"
          >
            {status === "loading" ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Importing...</>
            ) : (
              <><Download className="w-4 h-4 mr-1" /> Import</>
            )}
          </Button>
          <Button
            onClick={handlePreview}
            disabled={status === "loading" || !samUrl.trim()}
            variant="outline"
            className="text-sm whitespace-nowrap"
          >
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-800 font-medium">{message}</p>
              {importWarnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 mt-1">{w}</p>
              ))}
              <p className="text-xs text-green-600 mt-1">Redirecting to opportunity detail...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800">{message}</p>
              <button onClick={resetState} className="text-xs text-red-600 underline mt-1">
                Try again
              </button>
            </div>
          </div>
        )}

        {status === "duplicate" && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-800 font-medium">{message}</p>
                <div className="flex gap-2 mt-3">
                  {duplicateId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/app/opportunities/${duplicateId}`)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> Open Existing
                    </Button>
                  )}
                  {duplicateId && (
                    <ResyncButton opportunityId={duplicateId} onSuccess={onImportSuccess} />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={resetState}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SAM.gov Opportunity Preview</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {previewData && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{previewData.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{previewData.agency || "No agency"}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <PreviewField label="Solicitation" value={previewData.solicitation} />
                  <PreviewField label="Notice ID" value={previewData.noticeId} />
                  <PreviewField label="NAICS Code" value={previewData.naics} />
                  <PreviewField label="PSC Code" value={previewData.pscCode} />
                  <PreviewField label="Set-Aside" value={previewData.setAside || previewData.setAsideDescription} />
                  <PreviewField label="Notice Type" value={previewData.noticeType} />
                  <PreviewField label="Due Date" value={previewData.dueDate ? new Date(previewData.dueDate).toLocaleDateString() : null} />
                  <PreviewField label="Posted Date" value={previewData.postedDate ? new Date(previewData.postedDate).toLocaleDateString() : null} />
                  <PreviewField label="Place of Performance" value={previewData.placeOfPerformance} />
                  <PreviewField label="Sub-Agency" value={previewData.subAgency} />
                  <PreviewField label="Office" value={previewData.office} />
                  <PreviewField label="Type" value={previewData.type} />
                </div>

                {previewData.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                      {previewData.description.substring(0, 500)}
                      {previewData.description.length > 500 && "..."}
                    </p>
                  </div>
                )}

                {previewAttachments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Attachments ({previewAttachments.length})</p>
                    <div className="space-y-1">
                      {previewAttachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleConfirmImport}
                    disabled={importMutation.isPending}
                  >
                    {importMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Importing...</>
                    ) : (
                      <><Download className="w-4 h-4 mr-1" /> Import Opportunity</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreviewField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value || <span className="text-gray-400 italic">N/A</span>}</p>
    </div>
  );
}

function ResyncButton({ opportunityId, onSuccess }: { opportunityId: number; onSuccess?: () => void }) {
  const resyncMutation = trpc.sam.resync.useMutation();
  const [, navigate] = useLocation();

  const handleResync = async () => {
    try {
      await resyncMutation.mutateAsync({ opportunityId });
      onSuccess?.();
      navigate(`/app/opportunities/${opportunityId}`);
    } catch (error) {
      console.error("Resync failed:", error);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleResync}
      disabled={resyncMutation.isPending}
      className="text-xs"
    >
      {resyncMutation.isPending ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <RefreshCw className="w-3 h-3 mr-1" />
      )}
      Re-sync
    </Button>
  );
}
