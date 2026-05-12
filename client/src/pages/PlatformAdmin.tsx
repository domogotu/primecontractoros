import { useState } from "react";
import { Search, AlertCircle, Clock, Loader2, ChevronRight, Users, Building2, CreditCard, Flag, TrendingUp, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";

export default function PlatformAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wsPage, setWsPage] = useState(1);
  const WS_PAGE_SIZE = 10;
  const [, navigate] = useLocation();

  const { data: metrics, isLoading: metricsLoading } = trpc.platformAdmin.dashboardMetrics.useQuery();
  const { data: workspaces = [], isLoading: wsLoading } = trpc.platformAdmin.workspaces.list.useQuery();
  const { data: healthFlags = [] } = trpc.platformAdmin.healthFlags.list.useQuery({ activeOnly: true });
  const { data: recentActivity = [] } = trpc.platformAdmin.activityLog.list.useQuery({ limit: 10 });

  const allFilteredWorkspaces = workspaces.filter((ws: any) => {
    const matchesSearch = ws.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  const totalWsPages = Math.max(1, Math.ceil(allFilteredWorkspaces.length / WS_PAGE_SIZE));
  const filteredWorkspaces = allFilteredWorkspaces.slice((wsPage - 1) * WS_PAGE_SIZE, wsPage * WS_PAGE_SIZE);

  if (metricsLoading || wsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Workspaces", value: metrics?.totalWorkspaces || 0, color: "text-blue-300", icon: Building2, href: "/platform/workspaces" },
    { label: "Active Workspaces", value: metrics?.activeWorkspaces || 0, color: "text-green-400", icon: Building2, href: "/platform/workspaces" },
    { label: "Total Users", value: metrics?.totalUsers || 0, color: "text-purple-400", icon: Users, href: "/platform/users" },
    { label: "Active Users", value: metrics?.activeUsers || 0, color: "text-emerald-400", icon: Users, href: "/platform/users" },
    { label: "Paid Workspaces", value: metrics?.paidWorkspaces || 0, color: "text-amber-400", icon: CreditCard, href: "/platform/billing" },
    { label: "Trial Workspaces", value: metrics?.trialWorkspaces || 0, color: "text-cyan-400", icon: Clock, href: "/platform/workspaces" },
    { label: "Open Tickets", value: metrics?.openTickets || 0, color: "text-red-400", icon: AlertCircle, href: "/platform/support" },
    { label: "Critical Flags", value: metrics?.criticalFlags || 0, color: "text-red-500", icon: Flag, href: "/platform/workspaces" },
  ];

  const growthCards = [
    { label: "New Workspaces (30 days)", value: metrics?.newWorkspacesThisMonth || 0, color: "text-blue-300" },
    { label: "New Users (30 days)", value: metrics?.newUsersThisMonth || 0, color: "text-green-400" },
    { label: "Suspended", value: metrics?.suspendedWorkspaces || 0, color: "text-orange-400" },
    { label: "Disabled Users", value: metrics?.disabledUsers || 0, color: "text-red-400" },
  ];

  const criticalFlags = healthFlags.filter((f: any) => f.severity === "critical");

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-1">Platform Admin Dashboard</h1>
        <p className="text-slate-300 text-sm">Reed's Solutions LLC (Limited Liability Company) — PrimeContractorOS platform management overview.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-6 pt-6 pb-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-blue-400 transition-all cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                  <p className="text-xs text-slate-400 font-medium uppercase leading-tight">{card.label}</p>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Growth / Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-6 pb-4">
        {growthCards.map((card) => (
          <div key={card.label} className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Critical Flags Alert */}
      {criticalFlags.length > 0 && (
        <div className="mx-4 sm:mx-6 mb-4 bg-red-900/30 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-red-300">{criticalFlags.length} Critical Health Flag(s)</h3>
          </div>
          <div className="space-y-2">
            {criticalFlags.slice(0, 3).map((flag: any) => (
              <div key={flag.id} className="flex items-center justify-between text-xs">
                <span className="text-red-200">{flag.title}</span>
                <span className="text-red-400">Workspace #{flag.workspaceId}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-slate-800 border-y border-slate-700 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search workspaces by name, company, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
        <Link href="/platform/workspaces">
          <Button className="bg-blue-900 hover:bg-blue-800 text-white text-sm shrink-0">
            View All Workspaces
          </Button>
        </Link>
      </div>

      {/* Workspace Table */}
      <div className="bg-slate-800 m-4 sm:m-6 rounded-lg border border-slate-700 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Workspace</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Users</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Tickets</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {allFilteredWorkspaces.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">
                  No workspaces found.
                </td>
              </tr>
            ) : (
              filteredWorkspaces.map((ws: any) => (
                <tr
                  key={ws.id}
                  className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/platform/workspaces/${ws.id}`)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white text-sm">{ws.companyName || ws.name}</p>
                      <p className="text-xs text-slate-400">ID: {ws.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-200">{ws.ownerName || "Unknown"}</p>
                    <p className="text-xs text-slate-400">{ws.ownerEmail || ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-300">{ws.planName || "No Plan"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-200">{ws.activeUserCount || 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      ws.status === "active" ? "bg-green-900/50 text-green-300" :
                      ws.status === "suspended" ? "bg-red-900/50 text-red-300" :
                      "bg-slate-700 text-slate-300"
                    }`}>
                      {ws.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {ws.openSupportRequests > 0 ? (
                      <span className="text-xs text-amber-400">{ws.openSupportRequests} open</span>
                    ) : (
                      <span className="text-xs text-slate-500">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-blue-400 ml-auto" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {totalWsPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              Showing {(wsPage - 1) * WS_PAGE_SIZE + 1}–{Math.min(wsPage * WS_PAGE_SIZE, allFilteredWorkspaces.length)} of {allFilteredWorkspaces.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setWsPage(p => Math.max(1, p - 1))}
                disabled={wsPage === 1}
                className="px-3 py-1 text-xs border border-slate-600 rounded-md text-slate-300 disabled:opacity-40 hover:bg-slate-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-xs text-slate-300">{wsPage} / {totalWsPages}</span>
              <button
                onClick={() => setWsPage(p => Math.min(totalWsPages, p + 1))}
                disabled={wsPage === totalWsPages}
                className="px-3 py-1 text-xs border border-slate-600 rounded-md text-slate-300 disabled:opacity-40 hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      {recentActivity.length > 0 && (
        <div className="mx-4 sm:mx-6 mb-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Recent Platform Activity</h3>
            </div>
            <div className="space-y-2">
              {recentActivity.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between text-xs border-b border-slate-700/50 pb-2 last:border-0">
                  <div>
                    <span className="text-slate-200">{entry.title}</span>
                    {entry.description && <span className="text-slate-500 ml-2">{entry.description}</span>}
                  </div>
                  <span className="text-slate-500 shrink-0 ml-4">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Actions */}
      <div className="bg-blue-900/80 text-white rounded-lg p-4 sm:p-6 mx-4 sm:mx-6 mb-6 border border-blue-800">
        <h3 className="text-base font-semibold mb-3">Next Actions</h3>
        <div className="space-y-3">
          {(metrics?.openTickets || 0) > 0 && (
            <Link href="/platform/support">
              <div className="flex items-start gap-3 hover:bg-blue-800/50 rounded-lg p-2 -mx-2 cursor-pointer transition-colors">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{metrics?.openTickets} open support ticket(s).</p>
                  <p className="text-xs text-blue-100">Review and respond to customer issues.</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto shrink-0 mt-0.5" />
              </div>
            </Link>
          )}
          {criticalFlags.length > 0 && (
            <Link href="/platform/workspaces">
              <div className="flex items-start gap-3 hover:bg-blue-800/50 rounded-lg p-2 -mx-2 cursor-pointer transition-colors">
                <Flag className="w-5 h-5 shrink-0 mt-0.5 text-red-300" />
                <div>
                  <p className="font-medium text-sm">{criticalFlags.length} critical health flag(s) need attention.</p>
                  <p className="text-xs text-blue-100">Resolve workspace issues before they escalate.</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto shrink-0 mt-0.5" />
              </div>
            </Link>
          )}
          <Link href="/platform/workspaces">
            <div className="flex items-start gap-3 hover:bg-blue-800/50 rounded-lg p-2 -mx-2 cursor-pointer transition-colors">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Review workspace onboarding status.</p>
                <p className="text-xs text-blue-100">Ensure new workspaces complete setup.</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 mt-0.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
