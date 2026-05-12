import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PlatformLoginEventsPage() {
  const [search, setSearch] = useState("");
  const [failuresOnly, setFailuresOnly] = useState(false);

  const { data: events, isLoading } = trpc.platformAdmin.activity.list.useQuery({
    limit: 300,
  });
  const { data: stats } = trpc.platformAdmin.activity.stats.useQuery();

  // Filter to login events only (success + failure)
  const loginEvents = events?.filter((e: any) => {
    if (failuresOnly && e.success) return false;
    return e.eventType === "login_success" || e.eventType === "login_failure";
  }) || [];

  const filteredEvents = loginEvents.filter((e: any) => {
    const q = search.toLowerCase();
    return (
      (e.email || "").toLowerCase().includes(q) ||
      (e.userName || "").toLowerCase().includes(q) ||
      (e.workspaceName || "").toLowerCase().includes(q) ||
      (e.ipAddress || "").includes(q)
    );
  });

  const formatDateTime = (d: any) => d ? new Date(d).toLocaleString() : "—";

  // Count failed attempts per email
  const failedCountByEmail: Record<string, number> = {};
  events?.forEach((e: any) => {
    if (!e.success && e.email) {
      failedCountByEmail[e.email] = (failedCountByEmail[e.email] || 0) + 1;
    }
  });

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Login Events</h1>
          <p className="text-slate-400 text-sm mt-1">Security review of login attempts</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {stats?.total ? stats.total - stats.failures : 0} successful
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {stats?.failures || 0} failed
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by email, name, IP (Internet Protocol) address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={failuresOnly ? "destructive" : "outline"}
          size="sm"
          onClick={() => setFailuresOnly(!failuresOnly)}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Failures Only
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No login events found</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-200">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Workspace</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Result</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">IP (Internet Protocol) Address</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Device</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Failed Count</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredEvents.map((evt: any) => (
                <tr key={evt.id} className={`hover:bg-slate-900 ${!evt.success ? "bg-red-50" : ""} ${evt.suspiciousFlag ? "bg-yellow-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-white">{evt.userName || "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{evt.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{evt.workspaceName || "—"}</td>
                  <td className="px-4 py-3">
                    {evt.success ? (
                      <span className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="w-4 h-4" /> Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-700">
                        <XCircle className="w-4 h-4" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDateTime(evt.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{evt.ipAddress || "—"}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-[150px] truncate">{evt.deviceInfo || "—"}</td>
                  <td className="px-4 py-3">
                    {evt.email && failedCountByEmail[evt.email] ? (
                      <Badge className={failedCountByEmail[evt.email] >= 3 ? "bg-red-100 text-red-800" : "bg-slate-700 text-slate-100"}>
                        {failedCountByEmail[evt.email]}
                      </Badge>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {evt.suspiciousFlag && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Suspicious
                        </Badge>
                      )}
                      {evt.failureReason && (
                        <span className="text-xs text-red-600">{evt.failureReason}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
