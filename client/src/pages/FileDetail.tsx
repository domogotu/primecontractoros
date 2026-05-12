import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import {
  FileText, Download, Trash2, ArrowLeft, Clock, Plus,
  File, Image as ImageIcon, FileSpreadsheet, AlertCircle, History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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

export default function FileDetail() {
  const [, params] = useRoute("/app/files/:id");
  const [, setLocation] = useLocation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fileId = parseInt(params?.id || "0");
  const utils = trpc.useUtils();

  const { data: file, isLoading } = trpc.files.getById.useQuery({ id: fileId }, { enabled: fileId > 0 });
  const { data: versions = [] } = trpc.fileVersions.list.useQuery({ fileId }, { enabled: fileId > 0 });
  const { data: allFiles = [] } = trpc.files.list.useQuery();

  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => { toast.success("File deleted"); setLocation("/app/files"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading file...</div>;
  if (!file) return (
    <div className="p-6 max-w-4xl mx-auto text-center">
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
    f.id !== file.id && f.linkedRecordType === file.linkedRecordType && f.linkedRecordId === file.linkedRecordId && file.linkedRecordId
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageGuide
        title="File Detail"
        description="View file metadata, version history, and linked records."
        whenToUse="Use to review file details, download, or manage versions."
        whatToDoNext={["Download the file", "View version history", "Check linked records"]}
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
              <h1 className="text-xl font-bold text-slate-900 truncate">{file.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                <span>{formatBytes(file.size)}</span>
                <span>{file.mimeType || "Unknown type"}</span>
                {file.category && <Badge variant="outline">{file.category}</Badge>}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Uploaded {new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="w-4 h-4 mr-1" /> Download
                </Button>
              </a>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Linked Record */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Linked Record</CardTitle>
          </CardHeader>
          <CardContent>
            {file.linkedRecordType && file.linkedRecordId ? (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900 capitalize">{file.linkedRecordType} #{file.linkedRecordId}</p>
                <Link href={`/app/${file.linkedRecordType}s/${file.linkedRecordId}`}>
                  <Button size="sm" variant="link" className="p-0 h-auto text-blue-600">View Record →</Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not linked to any record</p>
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
              <p className="text-sm text-slate-500">No version history (original upload)</p>
            ) : (
              <div className="space-y-2">
                {(versions as any[]).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <div>
                      <span className="font-medium text-slate-700">v{v.versionNumber}</span>
                      {v.notes && <span className="text-slate-500 ml-2">— {v.notes}</span>}
                    </div>
                    <span className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
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
                {relatedFiles.slice(0, 5).map((f: any) => {
                  const FIcon = getFileIcon(f.mimeType);
                  return (
                    <Link key={f.id} href={`/app/files/${f.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <FIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{f.name}</span>
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete "{file.name}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: file.id })}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
