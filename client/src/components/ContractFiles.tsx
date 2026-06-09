import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload, FileText, Download, Shield, Loader2, Eye, Layers,
  File, Image as ImageIcon, FileSpreadsheet, FolderOpen
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  return FileText;
}

interface ContractFilesProps {
  contractId: number;
}

export default function ContractFiles({ contractId }: ContractFilesProps) {
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const { data: allFiles = [], refetch } = trpc.fileStorage.list.useQuery();
  const contractFiles = (allFiles as any[]).filter(
    (f: any) => f.linkedRecordType === "contract" && f.linkedRecordId === contractId
  );

  const governingFiles = contractFiles.filter((f: any) => f.isGoverningDocument);
  const otherFiles = contractFiles.filter((f: any) => !f.isGoverningDocument);

  const uploadMutation = trpc.fileStorage.upload.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("File uploaded to contract.");
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
        toast.warning(`${succeeded} uploaded, ${failed} failed.`);
      } else {
        toast.success(`${succeeded} files uploaded.`);
      }
      setUploading(false);
    },
    onError: (err) => {
      toast.error(`Bulk upload failed: ${err.message}`);
      setUploading(false);
    },
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
        category: "contract",
        linkedRecordType: "contract",
        linkedRecordId: contractId,
      });
    };
    reader.onerror = () => { toast.error("Failed to read file."); setUploading(false); };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBulkSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    if (selectedFiles.length > 20) {
      toast.error("Maximum 20 files at once.");
      return;
    }
    setUploading(true);
    const filePromises = Array.from(selectedFiles).map((file) => {
      return new Promise<{ fileName: string; mimeType: string; fileData: string } | null>((resolve) => {
        if (file.size > MAX_FILE_SIZE) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve({ fileName: file.name, mimeType: file.type || "application/octet-stream", fileData: base64 });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(filePromises);
    const validFiles = results.filter(Boolean) as Array<{ fileName: string; mimeType: string; fileData: string }>;
    if (validFiles.length === 0) { toast.error("No valid files."); setUploading(false); return; }
    bulkUploadMutation.mutate({
      files: validFiles.map((f) => ({ ...f, category: "contract", linkedRecordType: "contract", linkedRecordId: contractId })),
    });
    if (bulkInputRef.current) bulkInputRef.current.value = "";
  };

  const renderFileRow = (f: any) => {
    const Icon = getFileIcon(f.mimeType);
    return (
      <div key={f.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer" onClick={() => setLocation(`/app/files/${f.id}`)}>
        <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-slate-900 truncate">{f.name}</span>
            {(f.versionNumber || 1) > 1 && <Badge variant="outline" className="text-[10px] px-1 py-0">v{f.versionNumber}</Badge>}
          </div>
          <span className="text-xs text-slate-500">{formatBytes(f.size)} · {f.category || "contract"}</span>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setLocation(`/app/files/${f.id}`)}>
            <Eye className="w-3 h-3" />
          </Button>
          {f.url && (
            <a href={f.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Download className="w-3 h-3" />
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
        <input ref={bulkInputRef} type="file" multiple className="hidden" onChange={handleBulkSelect} />
        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
          Upload File
        </Button>
        <Button size="sm" variant="outline" onClick={() => bulkInputRef.current?.click()} disabled={uploading}>
          <Layers className="w-4 h-4 mr-1" /> Bulk Upload
        </Button>
        <span className="text-xs text-slate-500 ml-auto">{contractFiles.length} files · Max 10MB each</span>
      </div>

      {/* Governing Documents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" /> Governing Documents ({governingFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {governingFiles.length === 0 ? (
            <p className="text-xs text-slate-500">No governing documents. Mark files as governing from the file detail page.</p>
          ) : (
            <div className="space-y-1">{governingFiles.map(renderFileRow)}</div>
          )}
        </CardContent>
      </Card>

      {/* Other Files */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600" /> Contract Files ({otherFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {otherFiles.length === 0 ? (
            <p className="text-xs text-slate-500">No additional files uploaded for this contract.</p>
          ) : (
            <div className="space-y-1">{otherFiles.map(renderFileRow)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
