// @ts-nocheck
import React, { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import {
  FileText,
  Download,
  Trash2,
  ArrowLeft,
  Clock,
  Link as LinkIcon,
  Sparkles,
  Tag,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function FileDetail() {
  const [, params] = useRoute("/app/files/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Demo data for the file
  const fileData = {
    id: params?.id || "1",
    name: "Q3_Financial_Report_Final.pdf",
    type: "application/pdf",
    size: "2.4 MB",
    uploadedDate: "2023-10-15T14:30:00Z",
    uploadedBy: "Jane Doe",
    status: "active",
    tags: ["Financial", "Q3", "Report", "Confidential"],
    linkedRecords: [
      { id: "c-101", type: "Contract", name: "GovCloud Infrastructure 2023" },
      { id: "p-204", type: "Proposal", name: "Q4 Budget Expansion" },
      { id: "i-502", type: "Invoice", name: "INV-2023-089" }
    ],
    versions: [
      { version: "v1.2", date: "2023-10-15", uploader: "Jane Doe", changes: "Final review updates applied" },
      { version: "v1.1", date: "2023-10-12", uploader: "John Smith", changes: "Added Q3 projections" },
      { version: "v1.0", date: "2023-10-10", uploader: "Jane Doe", changes: "Initial upload" }
    ],
    aiAnalysis: {
      summary: "This document outlines the Q3 financial performance, highlighting a 15% increase in revenue compared to Q2. Key drivers include the new GovCloud contract and reduced operational costs.",
      keyEntities: ["GovCloud", "Department of Defense", "Q3 Revenue"],
      riskFactors: ["Dependency on single large contract renewal in Q4"]
    }
  };

  const handleDownload = () => {
    toast({
      title: "Downloading file",
      description: "Your download will begin shortly.",
    });
  };

  const handleDelete = () => {
    toast({
      title: "File deleted",
      description: "The file has been moved to trash.",
      variant: "destructive",
    });
    setIsDeleteDialogOpen(false);
    setLocation("/app/files");
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    toast({
      title: "AI Analysis Started",
      description: "Analyzing document contents. This may take a moment.",
    });
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "AI analysis results have been updated.",
      });
    }, 2000);
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-12 w-12 text-red-500" />;
    if (type.includes("image")) return <ImageIcon className="h-12 w-12 text-blue-500" />;
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv")) return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
    return <File className="h-12 w-12 text-gray-500" />;
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/files")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Files
          </Button>
        </div>

        <PageGuide
          title="File Detail"
          description="View and manage file details, versions, and linked records."
          whenToUse="Use this page to review document contents, track version history, and analyze files with AI."
          whatToDoNext={[
            "Review the AI analysis summary",
            "Check linked contracts or proposals",
            "Download the latest version"
          ]}
          relatedRecords={[
            { title: "Contracts", url: "/app/contracts" },
            { title: "Proposals", url: "/app/proposals" }
          ]}
          alerts={[
            { type: "info", message: "This file is marked as Confidential." }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: File Info & Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card text-foreground border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-muted rounded-lg">
                      {getFileIcon(fileData.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{fileData.name}</h2>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {new Date(fileData.uploadedDate).toLocaleDateString()}</span>
                        <span>{fileData.size}</span>
                        <span>By {fileData.uploadedBy}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {fileData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {fileData.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview Area */}
            <Card className="bg-card text-foreground border-border">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-96 bg-muted rounded-md flex items-center justify-center border border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Preview not available for this file type.</p>
                    <Button variant="link" onClick={handleDownload}>Download to view</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Version History */}
            <Card className="bg-card text-foreground border-border">
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-md overflow-hidden">
                  <div className="grid grid-cols-4 bg-muted p-3 text-sm font-medium text-muted-foreground">
                    <div>Version</div>
                    <div>Date</div>
                    <div>Uploader</div>
                    <div>Changes</div>
                  </div>
                  <div className="divide-y divide-border">
                    {fileData.versions.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-4 p-3 text-sm items-center hover:bg-muted/50">
                        <div className="font-medium">{v.version}</div>
                        <div>{v.date}</div>
                        <div>{v.uploader}</div>
                        <div className="text-muted-foreground truncate pr-4" title={v.changes}>{v.changes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: AI Analysis & Linked Records */}
          <div className="space-y-6">
            {/* AI Analysis */}
            <Card className="bg-card text-foreground border-border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-primary">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI Analysis
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={handleRunAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{fileData.aiAnalysis.summary}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Key Entities</h4>
                  <div className="flex flex-wrap gap-1">
                    {fileData.aiAnalysis.keyEntities.map((entity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{entity}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-amber-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" /> Risk Factors
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {fileData.aiAnalysis.riskFactors.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Linked Records */}
            <Card className="bg-card text-foreground border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Linked Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fileData.linkedRecords.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toast({ title: "Navigating to record", description: "Feature coming soon" })}>
                      <div>
                        <div className="text-sm font-medium">{record.name}</div>
                        <div className="text-xs text-muted-foreground">{record.type} • {record.id}</div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4 rotate-135" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => toast({ title: "Link Record", description: "Feature coming soon" })}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link to Record
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{fileData.name}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
