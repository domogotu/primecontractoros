import React from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Plug, TestTube } from "lucide-react";
import { toast } from "sonner";

function IntegrationStatusIcon({ status }: { status: string }) {
  if (status === "configured" || status === "pass") return <CheckCircle className="w-5 h-5 text-green-400" />;
  if (status === "partial" || status === "warning") return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  return <XCircle className="w-5 h-5 text-red-400" />;
}

function IntegrationStatusBadge({ status }: { status: string }) {
  if (status === "configured" || status === "pass") return <Badge className="bg-green-900/50 text-green-300 border-green-700">Connected</Badge>;
  if (status === "partial" || status === "warning") return <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-700">Partial</Badge>;
  return <Badge className="bg-red-900/50 text-red-300 border-red-700">Not Configured</Badge>;
}

export default function PlatformIntegrations() {
  const statusQuery = trpc.platformHealth.getIntegrationStatus.useQuery();
  const testConnection = trpc.platformHealth.testConnection.useMutation({
    onSuccess: (result) => {
      statusQuery.refetch();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const data = statusQuery.data;
  const integrations = data?.integrations || [];
  const testResults = data?.testResults || [];

  if (statusQuery.isLoading) {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Integrations</h1>
            <p className="text-slate-300">Manage and test external service connections.</p>
          </div>
          <Plug className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Integration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.map((integration) => {
            const latestTest = testResults.find((t: any) => t.integrationName === integration.key);
            return (
              <Card key={integration.key} className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <IntegrationStatusIcon status={integration.status} />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                      <IntegrationStatusBadge status={integration.status} />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => testConnection.mutate({ integrationKey: integration.key })}
                    disabled={testConnection.isPending}
                    className="bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {testConnection.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <TestTube className="w-3 h-3 mr-1" />}
                    Test
                  </Button>
                </div>

                {/* Required Env Vars */}
                <div className="space-y-1 mb-4">
                  <p className="text-xs text-slate-400 font-medium uppercase">Required Variables</p>
                  {integration.requiredVars.map((v) => (
                    <div key={v.key} className="flex items-center gap-2 text-xs">
                      {v.configured ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-400" />
                      )}
                      <span className={v.configured ? "text-slate-300" : "text-red-300"}>{v.label}</span>
                      <span className={`ml-auto ${v.configured ? "text-green-400" : "text-red-400"}`}>
                        {v.configured ? "Set" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Last Test Result */}
                {latestTest && (
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <p className="text-xs text-slate-400 mb-1">Last Test Result</p>
                    <div className="flex items-center gap-2">
                      {latestTest.status === "pass" && <CheckCircle className="w-3 h-3 text-green-400" />}
                      {latestTest.status === "fail" && <XCircle className="w-3 h-3 text-red-400" />}
                      {latestTest.status === "warning" && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                      <span className="text-xs text-slate-300">{latestTest.message}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(latestTest.testedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Test History */}
        {testResults.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Test History</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testResults.map((result: any) => (
                <div key={result.id} className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-3">
                  {result.status === "pass" && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                  {result.status === "fail" && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  {result.status === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white capitalize">{result.integrationName.replace(/_/g, " ")}</span>
                    <p className="text-xs text-slate-400 truncate">{result.message}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{new Date(result.testedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
