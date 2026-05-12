import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PlatformActivityPage() {
  const [search, setSearch] = useState("");
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);

  const { data: events, isLoading } = trpc.platformAdmin.activity.list.useQuery({
    limit: 200,
    suspiciousOnly,
  });
  const { data: stats } = trpc.platformAdmin.activity.stats.useQuery();

  const filteredEvents = events?.filter((e: any) => {
    const q = search.toLowerCase();
    return (
      (e.email || "").toLowerCase().includes(q) ||
      (e.userName || "").toLowerCase().includes(q) ||
      (e.workspaceName || "").toLowerCase().includes(q)
    );
  }) || [];

  const formatDateTime = (d: any) => d ? new Date(d).toLocaleString() : "—";

  const getEventBadge = (eventType: string, success: boolean) => {
    if (!success) return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    switch (eventType) {
      case "login_success": return <Badge className="bg-green-100 text-green-800">Login</Badge>;
      case "logout": return <Badge className="bg-slate-700 text-slate-100">Logout</Badge>;
      case "token_refresh": return <Badge className="bg-blue-100 text-blue-800">Refresh</Badge>;
      case "password_reset": return <Badge className="bg-yellow-100 text-yellow-800">Reset</Badge>;
      default: return <Badge variant="secondary">{eventType}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity & Login Events</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor login activity and security events</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-400">Total Events</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-slate-400">Failed Logins</p>
                <p className="text-xl font-bold text-red-600">{stats.failures}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-slate-400">Suspicious Activity</p>
                <p className="text-xl font-bold text-yellow-600">{stats.suspicious}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by email, name, or workspace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={suspiciousOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setSuspiciousOnly(!suspiciousOnly)}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Suspicious Only
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No activity events found</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-200">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Workspace</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Event Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">IP (Internet Protocol) Address</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Device</th>
                <th className="text-left px-4 py-3 font-medium text-slate-200">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredEvents.map((evt: any) => (
                <tr key={evt.id} className={`hover:bg-slate-900 ${evt.suspiciousFlag ? "bg-yellow-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-white">{evt.userName || "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{evt.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{evt.workspaceName || "—"}</td>
                  <td className="px-4 py-3">{getEventBadge(evt.eventType, evt.success)}</td>
                  <td className="px-4 py-3">
                    {evt.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDateTime(evt.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{evt.ipAddress || "—"}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-[150px] truncate">{evt.deviceInfo || "—"}</td>
                  <td className="px-4 py-3">
                    {evt.suspiciousFlag && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Suspicious
                      </Badge>
                    )}
                    {evt.failureReason && (
                      <span className="text-xs text-red-600">{evt.failureReason}</span>
                    )}
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
