import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import {
  Scale, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  Loader2, TrendingUp, TrendingDown
} from "lucide-react";

export default function RateParityDashboard() {
  const { data: results, isLoading, refetch } = trpc.rateParity.getResults.useQuery({ limit: 50 });
  const { data: alerts = [] } = trpc.rateParity.getAlerts.useQuery();
  const runAllMutation = trpc.rateParity.runAllChecks.useMutation({
    onSuccess: () => refetch(),
  });
  const resolveMutation = trpc.rateParity.resolveAlert.useMutation({
    onSuccess: () => refetch(),
  });

  const summary = results?.summary || { total: 0, pass: 0, fail: 0, warning: 0 };

  return (
    <PageLayout
      title="Rate Parity Testing"
      subtitle="Compare rates across proposals, contracts, invoices, and payments"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Checks</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <Scale className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Passing</p>
                <p className="text-2xl font-bold text-green-600">{summary.pass}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-amber-600">{summary.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{summary.fail}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Parity Check Results</h3>
        <Button
          onClick={() => runAllMutation.mutate()}
          disabled={runAllMutation.isPending}
        >
          {runAllMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Run All Checks
        </Button>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  {alert.status === "fail" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{alert.sourceLabel} → {alert.targetLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      Expected: ${alert.expectedRate} | Actual: ${alert.actualRate} | Variance: {alert.variancePercent}%
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resolveMutation.mutate({ checkId: alert.id })}
                >
                  Resolve
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results?.checks && results.checks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Source</th>
                    <th className="text-left p-3 font-medium">Target</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Expected</th>
                    <th className="text-right p-3 font-medium">Actual</th>
                    <th className="text-right p-3 font-medium">Variance</th>
                    <th className="text-left p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.checks.map((check) => (
                    <tr key={check.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={
                            check.status === "pass" ? "bg-green-50 text-green-700 border-green-200" :
                            check.status === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {check.status}
                        </Badge>
                      </td>
                      <td className="p-3">{check.sourceLabel}</td>
                      <td className="p-3">{check.targetLabel}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-[10px]">{check.rateType}</Badge>
                      </td>
                      <td className="p-3 text-right font-mono">${check.expectedRate}</td>
                      <td className="p-3 text-right font-mono">${check.actualRate}</td>
                      <td className="p-3 text-right">
                        <span className={
                          check.status === "pass" ? "text-green-600" :
                          check.status === "warning" ? "text-amber-600" : "text-red-600"
                        }>
                          {check.variancePercent}%
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(check.checkedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No parity checks run yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Run All Checks" to compare rates across your records</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
