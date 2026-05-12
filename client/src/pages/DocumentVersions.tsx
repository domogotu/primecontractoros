// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Clock } from "lucide-react";

export default function DocumentVersions() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Document Versions</h1><p className="text-muted-foreground">Track document revision history</p></div>
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a document to view its version history.</p>
          <p className="text-sm text-muted-foreground mt-2">Version tracking is available for all uploaded files.</p>
        </CardContent>
      </Card>
    </div>
  );
}
