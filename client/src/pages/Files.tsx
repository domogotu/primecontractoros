import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2, Trash2, Download, FolderOpen, Image, FileSpreadsheet, FileCode, File, Shield, Layers, Eye } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useMemo } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith("image/")) return Image;
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("csv") || mimeType?.includes("excel")) return FileSpreadsheet;
  if (mimeType?.includes("json") || mimeType?.includes("javascript") || mimeType?.includes("xml")) return FileCode;
  if (mimeType?.includes("pdf") || mimeType?.includes("document") || mimeType?.includes("text")) return FileText;
  return File;
}

const CATEGORIES = [
  { value: "all", label: "All Files" },
  { value: "governing", label: "Governing Docs" },
  { value: "proposal", label: "Proposals" },
  { value: "contract", label: "Contracts" },
  { value: "compliance", label: "Compliance" },
  { value: "financial", label: "Financial" },
  { value: "modification", label: "Modifications" },
  { value: "evidence", label: "Evidence" },
  { value: "correspondence", label: "Correspondence" },
  { value: "supporting", label: "Supporting" },
  { value: "deliverable", label: "Deliverables" },
  { value: "other", label: "Other" },
];

const RECORD_TYPES = [
  { value: "none", label: "No Link" },
  { value: "opportunity", label: "Opportunity" },
  { value: "proposal", label: "Proposal" },
  { value: "contract", label: "Contract" },
  { value: "invoice", label: "Invoice" },
  { value: "payment", label: "Payment" },
  { value: "closeout", label: "Closeout" },
  { value: "support", label: "Support Ticket" },
  { value: "business_profile", label: "Business Profile" },
  { value: "capability_statement", label: "Capability Statement" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "vendor", label: "Vendor" },
];

export default function Files() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const contractIdParam = urlParams.get("contractId") ? parseInt(urlParams.get("contractId")!) : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadCategory, setUploadCategory] = useState("other");
  const [linkedRecordType, setLinkedRecordType] = useState("none");
  const [linkedRecordId, setLinkedRecordId] = useState("");
  const [showGoverningOnly, setShowGoverningOnly] = useState(false);
  const [, setLocation] = useLocation();

  const { data: files = [], isLoading, refetch } = trpc.fileStorage.list.useQuery(
    contractIdParam ? { linkedRecordType: "contract", linkedRecordId: contractIdParam } : undefined
  );
  const { data: opportunities = [] } = trpc.opportunities.list.useQuery();
  const { data: proposals = [] } = trpc.proposals.list.useQuery();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();

  const getRecordOptions = () => {
    if (linkedRecordType === "opportunity") return (opportunities as any[]).map((o) => ({ id: o.id, title: o.title }));
    if (linkedRecordType === "proposal") return (proposals as any[]).map((p) => ({ id: p.id, title: p.title }));
    if (linkedRecordType === "contract") return (contracts as any[]).map((c) => ({ id: c.id, title: c.title }));
    return [];
  };

  const getLinkedRecordName = (type: string, id: number) => {
    if (type === "opportunity") return (opportunities as any[]).find((o) => o.id === id)?.title || `Opportunity #${id}`;
    if (type === "proposal") return (proposals as any[]).find((p) => p.id === id)?.title || `Proposal #${id}`;
    if (type === "contract") return (contracts as any[]).find((c) => c.id === id)?.title || `Contract #${id}`;
    return `${type} #${id}`;
  };

  const uploadMutation = trpc.fileStorage.upload.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("File uploaded successfully.");
      setUploading(false);
    },
    onError: (err) => {
      toast.error(`Upload failed: ${err.message}`);
      setUploading(false);
    },
  });

  const bulkUploadMutation = trpc.fileStorage.bulkUpload.useMutation({
    onSuccess: (data) => {
      refetch();
      const succeeded = data.results.filter((r: any) => r.id).length;
      const failed = data.results.filter((r: any) => r.error).length;
      if (failed > 0) {
        toast.warning(`${succeeded} files uploaded, ${failed} failed.`);
      } else {
        toast.success(`${succeeded} files uploaded successfully.`);
      }
      setUploading(false);
    },
    onError: (err) => {
      toast.error(`Bulk upload failed: ${err.message}`);
      setUploading(false);
    },
  });

  const deleteMutation = trpc.fileStorage.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("File deleted"); },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileData: base64,
        category: uploadCategory,
        linkedRecordType: linkedRecordType !== "none" ? linkedRecordType : undefined,
        linkedRecordId: linkedRecordId ? parseInt(linkedRecordId) : undefined,
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBulkSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (selectedFiles.length > 20) {
      toast.error("Maximum 20 files at once. Please select fewer files.");
      return;
    }

    setUploading(true);

    const filePromises = Array.from(selectedFiles).map((file) => {
      return new Promise<{ fileName: string; mimeType: string; fileData: string } | null>((resolve) => {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 10MB limit, skipping.`);
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve({
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            fileData: base64,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(filePromises);
    const validFiles = results.filter(Boolean) as Array<{ fileName: string; mimeType: string; fileData: string }>;

    if (validFiles.length === 0) {
      toast.error("No valid files to upload.");
      setUploading(false);
      return;
    }

    bulkUploadMutation.mutate({
      files: validFiles.map((f) => ({
        ...f,
        category: uploadCategory,
        linkedRecordType: linkedRecordType !== "none" ? linkedRecordType : undefined,
        linkedRecordId: linkedRecordId ? parseInt(linkedRecordId) : undefined,
      })),
    });

    if (bulkInputRef.current) bulkInputRef.current.value = "";
  };

  const filteredFiles = useMemo(() => {
    let result = files as any[];
    if (showGoverningOnly) {
      result = result.filter((f: any) => f.isGoverningDocument);
    }
    if (selectedCategory === "all") return result;
    return result.filter((f: any) => f.category === selectedCategory);
  }, [files, selectedCategory, showGoverningOnly]);

  const totalSize = useMemo(() => {
    return files.reduce((sum: number, f: any) => sum + (f.size || 0), 0);
  }, [files]);

  const governingCount = useMemo(() => {
    return (files as any[]).filter((f: any) => f.isGoverningDocument).length;
  }, [files]);

  if (isLoading) {
    return (
      <PageLayout title="Files" subtitle="Upload and manage documents" label="Storage">
      <PageGuide
        title="File Management"
        description="Central file repository linked to contracts, proposals, and other records."
        whenToUse="When uploading, organizing, or finding documents related to your contracting work."
        whatToDoNext={["Upload new documents and link to records", "Review unlinked files", "Run AI analysis on contract documents", "Check file version history"]}
        relatedRecords={[{ label: "Contracts", path: "/app/contracts" }, { label: "Proposals", path: "/app/proposals" }, { label: "Document Versions", path: "/app/document-versions" }]}
      />
      <GuidanceQuestionPanel pageContext="files" />
      <TrainingWalkthrough pageContext="files" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Files"
      subtitle="Upload and manage documents and attachments"
      label="Storage"
      summaryCards={[
        { label: "Total Files", value: files.length },
        { label: "Total Size", value: formatFileSize(totalSize) },
        { label: "Governing Docs", value: governingCount },
        { label: "Storage", value: "Active", color: "text-green-600" },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={uploadCategory} onValueChange={setUploadCategory}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter(c => c.value !== "all" && c.value !== "governing").map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={linkedRecordType} onValueChange={(v) => { setLinkedRecordType(v); setLinkedRecordId(""); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Link to" />
            </SelectTrigger>
            <SelectContent>
              {RECORD_TYPES.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {linkedRecordType !== "none" && getRecordOptions().length > 0 && (
            <Select value={linkedRecordId} onValueChange={setLinkedRecordId}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select record" />
              </SelectTrigger>
              <SelectContent>
                {getRecordOptions().map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={bulkInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleBulkSelect}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload File
          </Button>
          <Button variant="outline" onClick={() => bulkInputRef.current?.click()} disabled={uploading}>
            <Layers className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      }
    >
      {/* Category Filter + Governing Toggle */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <Button
              key={c.value}
              variant={selectedCategory === c.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(c.value)}
              className="text-xs"
            >
              {c.label}
              {c.value !== "all" && (
                <span className="ml-1 opacity-60">
                  ({(files as any[]).filter((f: any) => c.value === "all" || f.category === c.value).length})
                </span>
              )}
            </Button>
          ))}
        </div>
        <div className="ml-auto">
          <Button
            variant={showGoverningOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGoverningOnly(!showGoverningOnly)}
            className="text-xs"
          >
            <Shield className="w-3 h-3 mr-1" />
            Governing Only ({governingCount})
          </Button>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <Card className="p-8 text-center border border-gray-200">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files</h3>
          <p className="text-gray-600">
            {showGoverningOnly
              ? "No governing documents found. Mark files as governing documents from the file detail page."
              : selectedCategory !== "all"
              ? `No files in the "${CATEGORIES.find(c => c.value === selectedCategory)?.label}" category.`
              : "Upload your first file to get started. Files are stored securely and accessible from anywhere."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file: any) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <Card key={file.id} className="p-4 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer" onClick={() => setLocation(`/app/files/${file.id}`)}>
                <div className="flex items-center gap-3">
                  <Icon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      {file.isGoverningDocument && (
                        <Badge variant="default" className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">
                          <Shield className="w-3 h-3 mr-0.5" /> Governing
                        </Badge>
                      )}
                      {(file.versionNumber || 1) > 1 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          v{file.versionNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {file.mimeType} · {formatFileSize(file.size || 0)} · {file.category || "uncategorized"} · {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ""}
                      {file.linkedRecordType && file.linkedRecordId && (
                        <span className="ml-2 text-blue-600">→ {getLinkedRecordName(file.linkedRecordType, file.linkedRecordId)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => setLocation(`/app/files/${file.id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {file.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ fileId: file.id })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Maximum file size: 10MB per file (base64 upload). Bulk upload supports up to 20 files at once. Files are stored using built-in secure storage. For custom S3 storage, configure credentials in Settings → Integrations.
      </p>
          <PageGuidancePanel
        pageKey="files"
        title="Files Help"
        description="Workspace file management. Upload and categorize documents linked to opportunities, proposals, contracts, invoices, and closeout records."
        whatToDoNext={["Upload governing contract files for AI Confirmation", "Categorize files by type (governing, supporting, deliverable)", "Link files to specific records", "Track file versions"]}
        helpArticleSlug="what-is-a-governing-contract-file"
        glossaryTerms={["awarded-contract", "modification"]}
      />
    </PageLayout>
  );
}
