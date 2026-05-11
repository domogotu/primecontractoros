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
          <h1 className="text-2xl font-bold text-gray-900">Login Events</h1>
          <p className="text-gray-500 text-sm mt-1">Security review of login attempts</p>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by email, name, IP..."
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
        <div className="text-center py-12 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No login events found</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Workspace</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Result</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">IP Address</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Device</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Failed Count</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.map((evt: any) => (
                <tr key={evt.id} className={`hover:bg-gray-50 ${!evt.success ? "bg-red-50" : ""} ${evt.suspiciousFlag ? "bg-yellow-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{evt.userName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{evt.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{evt.workspaceName || "—"}</td>
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
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(evt.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{evt.ipAddress || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[150px] truncate">{evt.deviceInfo || "—"}</td>
                  <td className="px-4 py-3">
                    {evt.email && failedCountByEmail[evt.email] ? (
                      <Badge className={failedCountByEmail[evt.email] >= 3 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                        {failedCountByEmail[evt.email]}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">0</span>
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
