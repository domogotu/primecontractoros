import { useState, useRef } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import {
  FileText, Download, Trash2, ArrowLeft, Clock, Plus,
  File, Image as ImageIcon, FileSpreadsheet, AlertCircle, History,
  Shield, Upload, Loader2, ExternalLink, Edit2, Save, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  return FileText;
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function FileDetail() {
  const [, params] = useRoute("/app/files/:id");
  const [, setLocation] = useLocation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadVersionOpen, setIsUploadVersionOpen] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const versionFileRef = useRef<HTMLInputElement>(null);

  const fileId = parseInt(params?.id || "0");
  const utils = trpc.useUtils();

  const { data: file, isLoading, refetch } = trpc.files.getById.useQuery({ id: fileId }, { enabled: fileId > 0 });
  const { data: versions = [] } = trpc.fileVersions.list.useQuery({ fileId }, { enabled: fileId > 0 });
  const { data: allFiles = [] } = trpc.files.list.useQuery();

  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => { toast.success("File deleted"); setLocation("/app/files"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleGoverningMutation = trpc.fileStorage.toggleGoverning.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Governing document status updated.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = trpc.files.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("File updated.");
      setEditingNotes(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const uploadVersionMutation = trpc.fileStorage.uploadVersion.useMutation({
    onSuccess: (data) => {
      refetch();
      utils.fileVersions.list.invalidate({ fileId });
      toast.success(`Version ${data.versionNumber} uploaded successfully.`);
      setIsUploadVersionOpen(false);
      setVersionNotes("");
      setUploadingVersion(false);
    },
    onError: (e: any) => {
      toast.error(e.message);
      setUploadingVersion(false);
    },
  });

  const handleVersionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setUploadingVersion(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadVersionMutation.mutate({
        fileId,
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "application/octet-stream",
        fileData: base64,
        notes: versionNotes || undefined,
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
      setUploadingVersion(false);
    };
    reader.readAsDataURL(selectedFile);
    if (versionFileRef.current) versionFileRef.current.value = "";
  };

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading file...</div>;
  if (!file) return (
    <div className="p-6 max-w-4xl mx-auto text-center pb-32">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-700">File Not Found</h2>
      <p className="text-sm text-slate-500 mt-2">This file may have been deleted or you don't have access.</p>
      <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/files")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Files
      </Button>
    </div>
  );

  const Icon = getFileIcon(file.mimeType);
  const relatedFiles = (allFiles as any[]).filter((f: any) =>
    f.id !== file.id && f.linkedRecordType === (file as any).linkedRecordType && f.linkedRecordId === (file as any).linkedRecordId && (file as any).linkedRecordId
  );

  const isImage = file.mimeType?.startsWith("image/");
  const isPdf = file.mimeType?.includes("pdf");

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32">
      <PageGuide
        title="File Detail"
        description="View file metadata, version history, and linked records. Upload new versions and manage governing document status."
        whenToUse="Use to review file details, download, manage versions, or designate governing documents."
        whatToDoNext={["Download the file", "Upload a new version", "Toggle governing document status", "Check version history"]}
        relatedRecords={[{ label: "All Files", path: "/app/files" }]}
      />

      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setLocation("/app/files")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Files
      </Button>

      {/* File Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 truncate">{file.name}</h1>
                {(file as any).isGoverningDocument && (
                  <Badge className="bg-amber-100 text-amber-800">
                    <Shield className="w-3 h-3 mr-1" /> Governing Document
                  </Badge>
                )}
                {((file as any).versionNumber || 1) > 1 && (
                  <Badge variant="outline">v{(file as any).versionNumber}</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                <span>{formatBytes(file.size)}</span>
                <span>{file.mimeType || "Unknown type"}</span>
                {file.category && <Badge variant="outline">{file.category}</Badge>}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Uploaded {new Date(file.createdAt).toLocaleDateString()}</span>
                {(file as any).documentDate && (
                  <span className="ml-2">· Document Date: {new Date((file as any).documentDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="w-4 h-4 mr-1" /> Download
                </Button>
              </a>
              <Button size="sm" variant="outline" onClick={() => setIsUploadVersionOpen(true)}>
                <Upload className="w-4 h-4 mr-1" /> New Version
              </Button>
              <Button
                size="sm"
                variant={(file as any).isGoverningDocument ? "default" : "outline"}
                className={(file as any).isGoverningDocument ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                onClick={() => toggleGoverningMutation.mutate({ fileId: file.id, isGoverningDocument: !(file as any).isGoverningDocument })}
              >
                <Shield className="w-4 h-4 mr-1" />
                {(file as any).isGoverningDocument ? "Unmark Governing" : "Mark Governing"}
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {(isImage || isPdf) && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {isImage && (
              <div className="max-h-96 overflow-hidden rounded-lg border">
                <img src={file.url} alt={file.name} className="w-full h-auto object-contain max-h-96" />
              </div>
            )}
            {isPdf && (
              <div className="border rounded-lg overflow-hidden">
                <iframe src={file.url} className="w-full h-96" title={file.name} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">File Name</span>
                <span className="text-slate-900 font-medium truncate ml-4">{file.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MIME Type</span>
                <span className="text-slate-900">{file.mimeType || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Size</span>
                <span className="text-slate-900">{formatBytes(file.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-900">{file.category || "Uncategorized"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Version</span>
                <span className="text-slate-900">v{(file as any).versionNumber || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Governing Document</span>
                <span className="text-slate-900">{(file as any).isGoverningDocument ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Storage</span>
                <span className="text-slate-900">{(file as any).storageProvider || "built-in"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded</span>
                <span className="text-slate-900">{new Date(file.createdAt).toLocaleString()}</span>
              </div>
              {(file as any).documentDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Date</span>
                  <span className="text-slate-900">{new Date((file as any).documentDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Linked Record */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Linked Record</CardTitle>
          </CardHeader>
          <CardContent>
            {(file as any).linkedRecordType && (file as any).linkedRecordId ? (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900 capitalize">{(file as any).linkedRecordType} #{(file as any).linkedRecordId}</p>
                <Link href={`/app/${(file as any).linkedRecordType}s/${(file as any).linkedRecordId}`}>
                  <Button size="sm" variant="link" className="p-0 h-auto text-blue-600">
                    <ExternalLink className="w-3 h-3 mr-1" /> View Record
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not linked to any record</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Notes
              {!editingNotes && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingNotes(true); setNotesValue((file as any).notes || ""); }}>
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add notes about this file..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateMutation.mutate({ id: file.id, notes: notesValue || null })}>
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{(file as any).notes || "No notes"}</p>
            )}
          </CardContent>
        </Card>

        {/* Version History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" /> Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(versions as any[]).length === 0 ? (
              <div>
                <p className="text-sm text-slate-500 mb-2">No version history (original upload, v{(file as any).versionNumber || 1})</p>
                <Button size="sm" variant="outline" onClick={() => setIsUploadVersionOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Upload New Version
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {(versions as any[]).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <div className="flex-1">
                      <span className="font-medium text-slate-700">v{v.versionNumber}</span>
                      {v.notes && <span className="text-slate-500 ml-2">— {v.notes}</span>}
                      {v.size && <span className="text-slate-400 ml-2">({formatBytes(v.size)})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                      {v.url && (
                        <a href={v.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setIsUploadVersionOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Upload New Version
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Files */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Related Files (Same Record)</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedFiles.length === 0 ? (
              <p className="text-sm text-slate-500">No other files linked to the same record</p>
            ) : (
              <div className="space-y-2">
                {relatedFiles.slice(0, 10).map((f: any) => {
                  const FIcon = getFileIcon(f.mimeType);
                  return (
                    <Link key={f.id} href={`/app/files/${f.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <FIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{f.name}</span>
                        {f.isGoverningDocument && (
                          <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1 py-0">
                            <Shield className="w-2 h-2 mr-0.5" /> Gov
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">{formatBytes(f.size)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Version Dialog */}
      <Dialog open={isUploadVersionOpen} onOpenChange={setIsUploadVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Upload a new version of "{file.name}". The current version (v{(file as any).versionNumber || 1}) will be preserved in version history.
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700">Version Notes (optional)</label>
              <Input
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="e.g., Updated per Mod 003 requirements"
                className="mt-1"
              />
            </div>
            <input
              ref={versionFileRef}
              type="file"
              className="hidden"
              onChange={handleVersionUpload}
            />
            <p className="text-xs text-slate-500">Maximum file size: 10MB</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadVersionOpen(false)}>Cancel</Button>
            <Button onClick={() => versionFileRef.current?.click()} disabled={uploadingVersion}>
              {uploadingVersion ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Select & Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete "{file.name}"? This will soft-delete the file (it can be recovered by an administrator).
            {(file as any).isGoverningDocument && (
              <span className="block mt-2 text-amber-600 font-medium">
                Warning: This is a governing document. Deleting it may affect contract compliance tracking.
              </span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: file.id })}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
