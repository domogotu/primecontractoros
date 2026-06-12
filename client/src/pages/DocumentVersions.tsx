import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import {
  Search,
  Upload,
  Eye,
  GitCompare,
  RotateCcw,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DocumentVersions() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ fileId: "", notes: "" });

  // Fetch all file versions across the workspace
  const { data: allVersions = [], isLoading, refetch } = trpc.fileVersions.listAll.useQuery();
  // Fetch all files for the upload dialog dropdown
  const { data: allFiles = [] } = trpc.files.list.useQuery();

  const createVersionMutation = trpc.fileVersions.create.useMutation({
    onSuccess: () => {
      toast({ title: "Version recorded", description: "New version has been added." });
      setUploadDialogOpen(false);
      setUploadForm({ fileId: "", notes: "" });
      refetch();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const categories = ["All", ...Array.from(new Set(allFiles.map((f: any) => f.category).filter(Boolean)))];

  const filteredVersions = allVersions.filter((v: any) => {
    const matchesSearch =
      (v.fileName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || v.fileCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedFileVersions = selectedFileId
    ? allVersions.filter((v: any) => v.fileId === selectedFileId).sort((a: any, b: any) => b.versionNumber - a.versionNumber)
    : [];

  const handleRestoreClick = (version: any) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = () => {
    if (!versionToRestore) return;
    // Record a new version pointing to the same URL as the restored one
    createVersionMutation.mutate({
      fileId: versionToRestore.fileId,
      versionNumber: Math.max(...allVersions.filter((v: any) => v.fileId === versionToRestore.fileId).map((v: any) => v.versionNumber)) + 1,
      storageKey: versionToRestore.url || "",
      storageUrl: versionToRestore.url || "",
      notes: `Restored from version ${versionToRestore.versionNumber}`,
    });
    setRestoreDialogOpen(false);
    setVersionToRestore(null);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.fileId) {
      toast({ title: "Select a file", variant: "destructive" });
      return;
    }
    const fileId = parseInt(uploadForm.fileId);
    const existingVersions = allVersions.filter((v: any) => v.fileId === fileId);
    const nextVersion = existingVersions.length > 0
      ? Math.max(...existingVersions.map((v: any) => v.versionNumber)) + 1
      : 1;
    createVersionMutation.mutate({
      fileId,
      versionNumber: nextVersion,
      storageKey: `version-${fileId}-v${nextVersion}-${Date.now()}`,
      storageUrl: "",
      notes: uploadForm.notes || undefined,
    });
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "contract": return "purple";
      case "proposal": return "blue";
      case "invoice": return "green";
      case "report": return "orange";
      default: return "gray";
    }
  };

  return (
    <PageLayout title="Document Versions" subtitle="Version history for all uploaded files. Track changes, compare versions, and restore previous states.">
      <PageGuide
        title="Document Versions"
        description="Version history for all uploaded files. Track changes, compare versions, and restore previous states."
        whenToUse="Use this page to review the history of a document, see what changed between versions, or restore an earlier version."
        whatToDoNext={["Upload a new version of an existing file, or click a row to view its full version timeline on the right."]}
        relatedRecords={[
          { label: "Files", path: "/app/files" },
          { label: "Contracts", path: "/app/contracts" },
        ]}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by file name or notes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c === "All" ? "All Categories" : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Record New Version
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading versions...</div>
                ) : filteredVersions.length === 0 ? (
                  <div className="p-8 text-center space-y-4">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                    <p className="text-muted-foreground">
                      {allVersions.length === 0
                        ? "No file versions recorded yet. Upload files and record versions to track changes."
                        : "No versions match your filters."}
                    </p>
                    {allVersions.length === 0 && (
                      <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Record First Version
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-border">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 font-medium text-sm text-muted-foreground">
                      <div className="col-span-5">File</div>
                      <div className="col-span-2">Version</div>
                      <div className="col-span-3">Notes</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-border">
                      {filteredVersions.map((v: any) => (
                        <div
                          key={v.id}
                          className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors cursor-pointer ${selectedFileId === v.fileId ? "bg-muted/30" : ""}`}
                          onClick={() => setSelectedFileId(v.fileId)}
                        >
                          <div className="col-span-5">
                            <div className="font-medium text-foreground truncate">{v.fileName || "Unnamed File"}</div>
                            {v.fileCategory && (
                              <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-${getCategoryColor(v.fileCategory)}-100 text-${getCategoryColor(v.fileCategory)}-800 dark:bg-${getCategoryColor(v.fileCategory)}-900/30 dark:text-${getCategoryColor(v.fileCategory)}-400`}>
                                {v.fileCategory}
                              </span>
                            )}
                          </div>
                          <div className="col-span-2">
                            <span className="font-mono text-sm">v{v.versionNumber}</span>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(v.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="text-sm text-muted-foreground truncate">{v.notes || "—"}</div>
                          </div>
                          <div className="col-span-2 flex justify-end gap-1">
                            {v.url && (
                              <Button variant="ghost" size="icon" asChild title="View">
                                <a href={v.url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleRestoreClick(v); }}
                              title="Restore this version"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Version Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFileId ? (
                  <div className="space-y-4">
                    <div className="font-medium border-b border-border pb-2">
                      {allVersions.find((v: any) => v.fileId === selectedFileId)?.fileName}
                    </div>
                    <div className="relative border-l-2 border-muted ml-3 space-y-6">
                      {selectedFileVersions.map((v: any, i: number) => (
                        <div key={v.id} className="relative pl-6">
                          <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${i === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">v{v.versionNumber}</span>
                              <span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span>
                            </div>
                            {i === 0 && (
                              <Badge variant="outline" className="w-fit text-xs text-green-600 border-green-300">Current</Badge>
                            )}
                            <p className="text-sm text-muted-foreground">{v.notes || "No notes"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                    <Clock className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Select a file from the list to view its version timeline.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              This will create a new version based on v{versionToRestore?.versionNumber} of <strong>{versionToRestore?.fileName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 bg-muted p-3 rounded-md text-sm">
            <div className="font-medium mb-1">Notes from this version:</div>
            <div className="text-muted-foreground">{versionToRestore?.notes || "No notes"}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmRestore} disabled={createVersionMutation.isPending}>
              {createVersionMutation.isPending ? "Restoring..." : "Restore Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record New Version Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record New Version</DialogTitle>
            <DialogDescription>
              Select a file and add notes to record a new version entry.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>File</Label>
              <Select value={uploadForm.fileId} onValueChange={(v) => setUploadForm({ ...uploadForm, fileId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a file..." />
                </SelectTrigger>
                <SelectContent>
                  {allFiles.map((f: any) => (
                    <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Change Notes</Label>
              <Textarea
                placeholder="Describe what changed in this version..."
                value={uploadForm.notes}
                onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createVersionMutation.isPending}>
                {createVersionMutation.isPending ? "Saving..." : "Record Version"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
