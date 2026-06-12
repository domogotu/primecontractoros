import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, Eye, CheckSquare, Download, Filter } from "lucide-react";
import { toast } from "sonner";

export default function PlatformSecurity() {
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"logins" | "audit" | "summary">("logins");

  const securityQuery = trpc.platformHealth.getSecurityLog.useQuery({
    limit: 50,
    offset: 0,
    eventType: eventTypeFilter || undefined,
    actionType: actionFilter || undefined,
  });
  const markReviewed = trpc.platformHealth.markAuditReviewed.useMutation({
    onSuccess: () => {
      securityQuery.refetch();
      toast.success("Marked as reviewed.");
    },
  });

  const data = securityQuery.data;
  const loginEvts = data?.loginEvents || [];
  const auditLog = data?.auditLog || [];
  const workspaceSummary = data?.workspaceSummary || [];

  function exportToCSV() {
    const rows = activeTab === "logins"
      ? loginEvts.map((e) => `${e.id},${e.eventType},${e.email || ""},${e.success},${e.ipAddress || ""},${e.createdAt}`)
      : auditLog.map((e) => `${e.id},${e.action},${e.targetType},${e.targetId},${e.performedBy},${e.createdAt}`);
    const header = activeTab === "logins"
      ? "ID,Event Type,Email,Success,IP,Created At"
      : "ID,Action,Target Type,Target ID,Performed By,Created At";
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV.");
  }

  if (securityQuery.isLoading) {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Security</h1>
            <p className="text-slate-300">Login events, audit log, and security monitoring.</p>
          </div>
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          <button
            onClick={() => setActiveTab("logins")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "logins" ? "bg-slate-800 text-blue-300 border border-slate-700 border-b-0" : "text-slate-400 hover:text-white"}`}
          >
            Login Events ({loginEvts.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "audit" ? "bg-slate-800 text-blue-300 border border-slate-700 border-b-0" : "text-slate-400 hover:text-white"}`}
          >
            Audit Log ({auditLog.length})
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "summary" ? "bg-slate-800 text-blue-300 border border-slate-700 border-b-0" : "text-slate-400 hover:text-white"}`}
          >
            Workspace Summary
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          {activeTab === "logins" && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm"
              >
                <option value="">All Event Types</option>
                <option value="login_success">Login Success</option>
                <option value="login_failure">Login Failure</option>
                <option value="logout">Logout</option>
                <option value="token_refresh">Token Refresh</option>
                <option value="password_reset">Password Reset</option>
              </select>
            </div>
          )}
          {activeTab === "audit" && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Input
                placeholder="Filter by action..."
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-9 w-48 bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          )}
          <Button size="sm" variant="ghost" onClick={exportToCSV} className="text-slate-400 hover:text-white ml-auto">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>

        {/* Login Events Tab */}
        {activeTab === "logins" && (
          <Card className="bg-slate-800 border-slate-700 p-4">
            {loginEvts.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No login events found.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {loginEvts.map((evt) => (
                  <div key={evt.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${evt.success ? "bg-green-400" : "bg-red-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={evt.success ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}>
                          {evt.eventType}
                        </Badge>
                        <span className="text-xs text-slate-300">{evt.email || `User #${evt.userId}`}</span>
                        {evt.suspiciousFlag && <Badge className="bg-orange-900/50 text-orange-300">Suspicious</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {evt.ipAddress && <span>IP: {evt.ipAddress}</span>}
                        {evt.deviceInfo && <span>{evt.deviceInfo}</span>}
                        {evt.failureReason && <span className="text-red-400">{evt.failureReason}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{new Date(evt.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && (
          <Card className="bg-slate-800 border-slate-700 p-4">
            {auditLog.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No audit log entries found.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {auditLog.map((entry) => {
                  const meta = entry.metadata ? (() => { try { return JSON.parse(entry.metadata); } catch { return null; } })() : null;
                  const isReviewed = meta?.reviewed === true;
                  return (
                    <div key={entry.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-900/50 text-blue-300">{entry.action}</Badge>
                          <span className="text-xs text-slate-300">{entry.targetType} #{entry.targetId}</span>
                          {isReviewed && <Badge className="bg-green-900/50 text-green-300">Reviewed</Badge>}
                        </div>
                        {entry.reason && <p className="text-xs text-slate-400 mt-1">{entry.reason}</p>}
                        <p className="text-xs text-slate-500 mt-1">By user #{entry.performedBy} • {new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedEntry(entry)} className="text-slate-400 hover:text-white">
                          <Eye className="w-3 h-3" />
                        </Button>
                        {!isReviewed && (
                          <Button size="sm" variant="ghost" onClick={() => markReviewed.mutate({ id: entry.id })} className="text-slate-400 hover:text-green-300">
                            <CheckSquare className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Workspace Summary Tab */}
        {activeTab === "summary" && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Workspace Status Summary</h3>
            {workspaceSummary.length === 0 ? (
              <p className="text-slate-400 text-sm">No workspace data.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {workspaceSummary.map((ws: any) => (
                  <div key={ws.status} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-300">{ws.count}</div>
                    <div className="text-xs text-slate-400 capitalize">{ws.status}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedEntry(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Audit Entry Details</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-slate-400">Action:</span> <span className="text-white">{selectedEntry.action}</span></div>
              <div><span className="text-slate-400">Target:</span> <span className="text-white">{selectedEntry.targetType} #{selectedEntry.targetId}</span></div>
              <div><span className="text-slate-400">Performed By:</span> <span className="text-white">User #{selectedEntry.performedBy}</span></div>
              {selectedEntry.reason && <div><span className="text-slate-400">Reason:</span> <span className="text-white">{selectedEntry.reason}</span></div>}
              {selectedEntry.metadata && (
                <div>
                  <span className="text-slate-400">Metadata:</span>
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded mt-1 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(selectedEntry.metadata || "{}"), null, 2)}
                  </pre>
                </div>
              )}
              <div><span className="text-slate-400">Created:</span> <span className="text-white">{new Date(selectedEntry.createdAt).toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end mt-4">
              <Button size="sm" variant="ghost" onClick={() => setSelectedEntry(null)} className="text-slate-300">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
