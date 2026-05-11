import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2, Trash2, Download, AlertCircle, FolderOpen } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function Files() {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: storageStatus } = trpc.fileStorage.getConfig.useQuery();
  const { data: files = [], isLoading, refetch } = trpc.fileStorage.list.useQuery();
  const uploadMutation = trpc.fileStorage.upload.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("File Uploaded: Your file has been stored successfully.");
      setUploading(false);
    },
    onError: (err) => {
      toast.error("Upload Failed");
      setUploading(false);
    },
  });
  const deleteMutation = trpc.fileStorage.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("File Deleted"); },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        fileName: file.name,
        mimeType: file.type,
        fileData: base64,
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isConfigured = storageStatus?.configured;

  if (isLoading) {
    return (
      <PageLayout title="Files" subtitle="Upload and manage documents" label="Storage">
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
        { label: "Storage", value: isConfigured ? "S3 Connected" : "Not Configured", color: isConfigured ? "text-green-600" : "text-orange-600" },
      ]}
      actions={
        isConfigured ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload File
            </Button>
          </>
        ) : undefined
      }
    >
      {!isConfigured && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900">File Storage Not Configured</h3>
            <p className="text-sm text-orange-700 mt-1">
              To enable file uploads, configure your AWS S3 credentials in Settings → Integrations.
              You'll need an Access Key, Secret Key, Bucket Name, and Region.
            </p>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <Card className="p-8 text-center border border-gray-200">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files</h3>
          <p className="text-gray-600">
            {isConfigured ? "Upload your first file to get started." : "Configure S3 storage in Settings to enable file uploads."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {files.map((file: any) => (
            <Card key={file.id} className="p-4 border border-gray-200 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.mimeType} · {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex gap-1">
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
          ))}
        </div>
      )}
    </PageLayout>
  );
}
