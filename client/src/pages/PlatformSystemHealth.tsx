import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Eye, CheckSquare } from "lucide-react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  if (status === "configured" || status === "pass") {
    return <Badge className="bg-green-900/50 text-green-300 border-green-700">Configured</Badge>;
  }
  if (status === "partial" || status === "warning") {
    return <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-700">Partial</Badge>;
  }
  return <Badge className="bg-red-900/50 text-red-300 border-red-700">Not Configured</Badge>;
}

export default function PlatformSystemHealth() {
  const [selectedError, setSelectedError] = useState<any>(null);
  const healthQuery = trpc.platformHealth.getHealthStatus.useQuery();
  const errorsQuery = trpc.platformHealth.getRecentErrors.useQuery();
  const webhookQuery = trpc.platformHealth.getRecentWebhookDeliveries.useQuery();
  const failedTasksQuery = trpc.platformHealth.getFailedTaskRuns.useQuery();
  const runHealthCheck = trpc.platformHealth.runHealthCheck.useMutation({
    onSuccess: () => {
      healthQuery.refetch();
      toast.success("Health check completed.");
    },
    onError: (err: any) => toast.error(err.message),
  });
  const markReviewed = trpc.platformHealth.markErrorReviewed.useMutation({
    onSuccess: () => {
      errorsQuery.refetch();
      toast.success("Error marked as reviewed.");
    },
  });

  const health = healthQuery.data;
  const errors = errorsQuery.data || [];
  const webhookDeliveries = webhookQuery.data || [];
  const failedTasks = failedTasksQuery.data || [];

  if (healthQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">System Health</h1>
            <p className="text-slate-300">Monitor system connectivity, integrations, and environment configuration.</p>
          </div>
          <Button
            onClick={() => runHealthCheck.mutate()}
            disabled={runHealthCheck.isPending}
            className="bg-blue-900 text-white hover:bg-blue-800"
          >
            {runHealthCheck.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Run Health Check
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Database Status */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {health?.database.connected ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            Database Connectivity
          </h2>
          <div className="text-sm">
            {health?.database.connected ? (
              <span className="text-green-300">Connected and responding</span>
            ) : (
              <span className="text-red-300">{health?.database.error || "Not connected"}</span>
            )}
          </div>
        </Card>

        {/* Integration Status Summary */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Integration Configuration Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {health?.integrations.map((integration) => (
              <div key={integration.key} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{integration.name}</span>
                  <StatusBadge status={integration.status} />
                </div>
                <div className="space-y-1">
                  {integration.requiredVars.map((v) => (
                    <div key={v.key} className="flex items-center gap-2 text-xs">
                      {v.configured ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-400" />
                      )}
                      <span className={v.configured ? "text-slate-300" : "text-red-300"}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Environment Variables */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Required Environment Variables</h2>
          <p className="text-xs text-slate-400 mb-4">Shows configured/not-configured status only. Secret values are never exposed.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {health?.envVars.map((v) => (
              <div key={v.key} className="flex items-center gap-2 py-1 px-3 rounded bg-slate-900 border border-slate-700">
                {v.configured ? (
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span className="text-sm text-slate-300 font-mono">{v.key}</span>
                <span className={`ml-auto text-xs ${v.configured ? "text-green-400" : "text-red-400"}`}>
                  {v.configured ? "Set" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent System Errors */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent System Errors</h2>
          {errors.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent errors.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {errors.slice(0, 20).map((err) => (
                <div key={err.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={err.status === "resolved" ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}>
                        {err.status}
                      </Badge>
                      <span className="text-xs text-slate-400">{err.errorType}</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate">{err.message}</p>
                    <p className="text-xs text-slate-500">{err.route} • {new Date(err.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedError(err)} className="text-slate-400 hover:text-white">
                      <Eye className="w-3 h-3" />
                    </Button>
                    {err.status !== "resolved" && (
                      <Button size="sm" variant="ghost" onClick={() => markReviewed.mutate({ id: err.id })} className="text-slate-400 hover:text-green-300">
                        <CheckSquare className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Webhook Deliveries */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Webhook Deliveries</h2>
          {webhookDeliveries.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent webhook deliveries.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {webhookDeliveries.slice(0, 15).map((d) => (
                <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
                  {d.success ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white">{d.eventType}</span>
                    <span className="text-xs text-slate-400 ml-2">HTTP {d.responseStatus || "N/A"}</span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(d.deliveredAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Failed Task Runs */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Failed Jobs / Task Runs</h2>
          {failedTasks.length === 0 ? (
            <p className="text-slate-400 text-sm">No failed task runs.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {failedTasks.slice(0, 15).map((t) => (
                <div key={t.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-white">Task #{t.taskId}</span>
                    <Badge className="bg-red-900/50 text-red-300">Failed</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{t.errorMessage || "No error message"}</p>
                  <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Last check timestamp */}
        {health?.timestamp && (
          <p className="text-xs text-slate-500 text-center">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
        )}
      </div>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedError(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Error Details</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-slate-400">Type:</span> <span className="text-white">{selectedError.errorType}</span></div>
              <div><span className="text-slate-400">Route:</span> <span className="text-white">{selectedError.route || "N/A"}</span></div>
              <div><span className="text-slate-400">Status:</span> <Badge className={selectedError.status === "resolved" ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}>{selectedError.status}</Badge></div>
              <div><span className="text-slate-400">Message:</span> <p className="text-white mt-1">{selectedError.message}</p></div>
              {selectedError.stackTrace && (
                <div>
                  <span className="text-slate-400">Stack Trace:</span>
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded mt-1 overflow-x-auto whitespace-pre-wrap">{selectedError.stackTrace}</pre>
                </div>
              )}
              {selectedError.resolution && (
                <div><span className="text-slate-400">Resolution:</span> <span className="text-green-300">{selectedError.resolution}</span></div>
              )}
              <div><span className="text-slate-400">Created:</span> <span className="text-white">{new Date(selectedError.createdAt).toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              {selectedError.status !== "resolved" && (
                <Button size="sm" onClick={() => { markReviewed.mutate({ id: selectedError.id }); setSelectedError(null); }} className="bg-green-700 text-white hover:bg-green-600">
                  Mark Reviewed
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setSelectedError(null)} className="text-slate-300">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
