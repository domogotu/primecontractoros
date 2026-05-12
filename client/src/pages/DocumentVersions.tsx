// @ts-nocheck
import React, { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import {
  Search,
  Filter,
  Upload,
  Eye,
  GitCompare,
  RotateCcw,
  FileText,
  Clock,
  Download,
  MoreVertical
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEMO_VERSIONS = [
  {
    id: "v10",
    documentId: "doc1",
    documentName: "Q3 Server Infrastructure Contract",
    type: "Contract",
    version: "v2.1",
    date: "2023-10-15T14:30:00Z",
    author: "Jane Smith",
    changes: "Updated SLA terms and pricing",
    size: "2.4 MB",
    status: "Current"
  },
  {
    id: "v9",
    documentId: "doc1",
    documentName: "Q3 Server Infrastructure Contract",
    type: "Contract",
    version: "v2.0",
    date: "2023-10-10T09:15:00Z",
    author: "John Doe",
    changes: "Major revision after legal review",
    size: "2.3 MB",
    status: "Archived"
  },
  {
    id: "v8",
    documentId: "doc2",
    documentName: "Network Security Proposal",
    type: "Proposal",
    version: "v1.5",
    date: "2023-10-12T11:45:00Z",
    author: "Alice Johnson",
    changes: "Added executive summary",
    size: "1.8 MB",
    status: "Current"
  },
  {
    id: "v7",
    documentId: "doc3",
    documentName: "September Invoice - DoD",
    type: "Invoice",
    version: "v1.1",
    date: "2023-10-01T08:00:00Z",
    author: "Bob Wilson",
    changes: "Corrected billing address",
    size: "450 KB",
    status: "Current"
  },
  {
    id: "v6",
    documentId: "doc1",
    documentName: "Q3 Server Infrastructure Contract",
    type: "Contract",
    version: "v1.0",
    date: "2023-09-15T10:00:00Z",
    author: "Jane Smith",
    changes: "Initial draft",
    size: "2.1 MB",
    status: "Archived"
  }
];

export default function DocumentVersions() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<any>(null);

  // Try to use tRPC, fallback to demo data
  const { data: versionsData, isLoading } = trpc.documentVersions?.list?.useQuery() || { data: null, isLoading: false };
  
  const versions = versionsData || DEMO_VERSIONS;

  const filteredVersions = versions.filter(v => {
    const matchesSearch = v.documentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.changes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || v.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCompare = (v1: any) => {
    toast({
      title: "Feature coming soon",
      description: "Document comparison will be available in the next release.",
    });
  };

  const handleRestoreClick = (version: any) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = () => {
    toast({
      title: "Version Restored",
      description: `${versionToRestore.documentName} has been restored to ${versionToRestore.version}.`,
    });
    setRestoreDialogOpen(false);
    setVersionToRestore(null);
  };

  const handleUpload = () => {
    toast({
      title: "Feature coming soon",
      description: "New version upload will be available soon.",
    });
  };

  const handleView = () => {
    toast({
      title: "Feature coming soon",
      description: "Document viewer opening...",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current": return "green";
      case "Archived": return "gray";
      default: return "blue";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Contract": return "purple";
      case "Proposal": return "blue";
      case "Invoice": return "green";
      case "Report": return "orange";
      default: return "gray";
    }
  };

  return (
    <PageLayout>
      <PageGuide
        title="Document Versions"
        description="Version history for all documents with compare and restore capabilities."
        whenToUse="Use this page to track changes, compare different versions of a document, or restore a previous version if needed."
        whatToDoNext="Select a document to view its version timeline, or use the compare tool to see what changed between two versions."
        relatedRecords={[
          { title: "Documents", url: "/app/documents" },
          { title: "Contracts", url: "/app/contracts" }
        ]}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents or changes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Report">Report</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload New Version
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 font-medium text-sm text-muted-foreground">
                    <div className="col-span-4">Document</div>
                    <div className="col-span-2">Version</div>
                    <div className="col-span-3">Changes</div>
                    <div className="col-span-3 text-right">Actions</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-border">
                    {filteredVersions.length > 0 ? (
                      filteredVersions.map((v) => (
                        <div 
                          key={v.id} 
                          className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors cursor-pointer ${selectedDocId === v.documentId ? 'bg-muted/30' : ''}`}
                          onClick={() => setSelectedDocId(v.documentId)}
                        >
                          <div className="col-span-4">
                            <div className="font-medium text-foreground truncate">{v.documentName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getTypeColor(v.type)}-100 text-${getTypeColor(v.type)}-800 dark:bg-${getTypeColor(v.type)}-900/30 dark:text-${getTypeColor(v.type)}-400`}>
                                {v.type}
                              </span>
                              <span className="text-xs text-muted-foreground">{v.size}</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{v.version}</span>
                              {v.status === "Current" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(v.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="text-sm truncate">{v.changes}</div>
                            <div className="text-xs text-muted-foreground mt-1">by {v.author}</div>
                          </div>
                          <div className="col-span-3 flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleView(); }} title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCompare(v); }} title="Compare">
                              <GitCompare className="h-4 w-4" />
                            </Button>
                            {v.status !== "Current" && (
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRestoreClick(v); }} title="Restore">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        No versions found matching your filters.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Version Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDocId ? (
                  <div className="space-y-6">
                    <div className="font-medium text-lg border-b border-border pb-2">
                      {versions.find(v => v.documentId === selectedDocId)?.documentName}
                    </div>
                    <div className="relative border-l-2 border-muted ml-3 space-y-8">
                      {versions
                        .filter(v => v.documentId === selectedDocId)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((v, i) => (
                          <div key={v.id} className="relative pl-6">
                            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${v.status === 'Current' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">{v.version}</span>
                                <span className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{v.changes}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  {v.author.charAt(0)}
                                </div>
                                <span className="text-xs text-muted-foreground">{v.author}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                    <Clock className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Select a document from the list to view its version timeline.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to restore <strong>{versionToRestore?.documentName}</strong> to version <strong>{versionToRestore?.version}</strong>?
            </p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <div className="font-medium mb-1">Changes in this version:</div>
              <div className="text-muted-foreground">{versionToRestore?.changes}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This will create a new version (e.g., v{versionToRestore ? parseFloat(versionToRestore.version.replace('v', '')) + 1 : ''}) based on the selected version. The current version will be archived.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmRestore}>Restore Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
