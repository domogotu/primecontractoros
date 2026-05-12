import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, CheckCircle2, XCircle, Users, TrendingUp, Calendar } from "lucide-react";

export default function PlatformConsentRecords() {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const { data, isLoading } = trpc.platformAdmin.consentRecords.list.useQuery({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const { data: stats } = trpc.platformAdmin.consentRecords.stats.useQuery();

  const formatDate = (ts: number | Date | null | undefined) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-6 h-6 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Consent Records</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Aggregate accept/decline rates and per-user consent audit trail
          </p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Records"
            value={stats.total}
            icon={<Users className="w-5 h-5 text-blue-400" />}
            color="blue"
          />
          <StatCard
            label="Accepted"
            value={stats.accepted}
            icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
            color="green"
          />
          <StatCard
            label="Declined"
            value={stats.declined}
            icon={<XCircle className="w-5 h-5 text-red-400" />}
            color="red"
          />
          <StatCard
            label="Accept Rate"
            value={stats.total > 0 ? `${Math.round((stats.accepted / stats.total) * 100)}%` : "—"}
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            color="purple"
          />
        </div>
      )}

      {/* By policy version breakdown */}
      {stats?.byVersion && stats.byVersion.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-200">By Policy Version</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 pr-4 font-medium text-slate-400">Version</th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-400">Accepted</th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-400">Declined</th>
                  <th className="text-left py-2 font-medium text-slate-400">Accept Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.byVersion.map((v) => {
                  const total = v.accepted + v.declined;
                  const rate = total > 0 ? Math.round((v.accepted / total) * 100) : 0;
                  return (
                    <tr key={v.version} className="border-b border-slate-700/50">
                      <td className="py-2 pr-4 font-mono text-slate-200">{v.version}</td>
                      <td className="py-2 pr-4 text-green-400">{v.accepted}</td>
                      <td className="py-2 pr-4 text-red-400">{v.declined}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-slate-300 text-xs">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full records table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">All Consent Records</h2>
          <p className="text-xs text-slate-400 mt-0.5">Showing {PAGE_SIZE} records per page</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading records…</div>
        ) : !data || data.records.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic">No consent records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40">
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Date &amp; Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">User ID</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Workspace</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Version</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">IP (Internet Protocol) Address</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">{formatDate(record.acceptedAt)}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-xs">{record.userId}</td>
                    <td className="py-2.5 px-4 text-slate-400 text-xs">{record.workspaceId ?? "—"}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-300 text-xs">{record.policyVersion}</td>
                    <td className="py-2.5 px-4">
                      {record.action === "accepted" ? (
                        <span className="inline-flex items-center gap-1 text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Accepted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Declined
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-xs">{record.consentType?.replace(/_/g, " ")}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-xs">{record.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > PAGE_SIZE && (
          <div className="px-5 py-4 border-t border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, data.total)} of {data.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * PAGE_SIZE >= data.total}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card helper
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "purple";
}) {
  const bg: Record<string, string> = {
    blue: "bg-blue-900/30 border-blue-700/40",
    green: "bg-green-900/30 border-green-700/40",
    red: "bg-red-900/30 border-red-700/40",
    purple: "bg-purple-900/30 border-purple-700/40",
  };
  return (
    <div className={`rounded-lg border p-4 ${bg[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-400">{label}</span></div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
