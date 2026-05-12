// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, CheckCircle2, RefreshCw } from "lucide-react";

export default function Diagnostics() {
  const { data: status, isLoading, refetch } = trpc.diagnostics.getStatus.useQuery();
  const runCheck = trpc.diagnostics.runCheck.useMutation();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">System Diagnostics</h1><p className="text-muted-foreground">Monitor system health and run checks</p></div>
        <Button variant="outline" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>
      {isLoading ? <p>Loading...</p> : status && (
        <div className="grid grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-sm">Database</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>{status.database}</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Version</CardTitle></CardHeader><CardContent><p className="text-lg font-mono">{status.version}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Workspace</CardTitle></CardHeader><CardContent><p>{status.workspace}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Last Check</CardTitle></CardHeader><CardContent><p className="text-sm">{status.timestamp}</p></CardContent></Card>
          <Card className="col-span-2"><CardHeader><CardTitle className="text-sm">Features</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{status.features && Object.entries(status.features).map(([k, v]) => (<span key={k} className={"px-2 py-1 rounded text-xs " + (v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>{k}: {v ? "active" : "inactive"}</span>))}</div></CardContent></Card>
        </div>
      )}
      <div className="mt-6"><Button onClick={() => runCheck.mutate({ checkType: "full" })}>Run Full Diagnostic</Button></div>
    </div>
  );
}
