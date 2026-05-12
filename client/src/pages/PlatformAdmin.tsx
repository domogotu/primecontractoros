import { useState } from "react";
import { Search, AlertCircle, Clock, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";

export default function PlatformAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wsPage, setWsPage] = useState(1);
  const WS_PAGE_SIZE = 10;
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = trpc.platform.stats.useQuery();
  const { data: workspaces = [], isLoading: wsLoading } = trpc.platform.workspaces.list.useQuery();
  const { data: tickets = [] } = trpc.platform.support.list.useQuery();

  const openTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in_progress");

  const allFilteredWorkspaces = workspaces.filter((ws: any) => {
    const matchesSearch = ws.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  const totalWsPages = Math.max(1, Math.ceil(allFilteredWorkspaces.length / WS_PAGE_SIZE));
  const filteredWorkspaces = allFilteredWorkspaces.slice((wsPage - 1) * WS_PAGE_SIZE, wsPage * WS_PAGE_SIZE);

  if (statsLoading || wsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Workspaces",
      value: stats?.totalWorkspaces || 0,
      color: "text-blue-900",
      href: "/platform/workspaces",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      color: "text-green-600",
      href: "/platform/users",
    },
    {
      label: "Plans",
      value: stats?.totalPlans || 0,
      color: "text-purple-600",
      href: "/platform/plans",
    },
    {
      label: "Open Tickets",
      value: stats?.openTickets || 0,
      color: "text-amber-600",
      href: "/platform/support",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1">Platform Admin</h1>
        <p className="text-gray-600 text-sm">Manage all customer workspaces, billing, and support</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
        <Link href="/platform/workspaces">
          <Button className="bg-blue-900 hover:bg-blue-800 text-white text-sm shrink-0">
            View All Workspaces
          </Button>
        </Link>
      </div>

      {/* Workspace Table */}
      <div className="bg-white m-4 sm:m-6 rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Workspace</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Onboarded</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allFilteredWorkspaces.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                  No workspaces found
                </td>
              </tr>
            ) : (
              filteredWorkspaces.map((ws: any) => (
                <tr
                  key={ws.id}
                  className="hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/platform/workspaces/${ws.id}`)}
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{ws.name}</p>
                      <p className="text-xs text-gray-500">ID: {ws.id}</p>
                      {ws.companyName && (
                        <p className="text-xs text-gray-500">{ws.companyName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      ws.onboardingCompleted ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {ws.onboardingCompleted ? "Yes" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">
                    {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-blue-600 ml-auto" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {totalWsPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Showing {(wsPage - 1) * WS_PAGE_SIZE + 1}–{Math.min(wsPage * WS_PAGE_SIZE, allFilteredWorkspaces.length)} of {allFilteredWorkspaces.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setWsPage(p => Math.max(1, p - 1))}
                disabled={wsPage === 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-xs text-gray-600">{wsPage} / {totalWsPages}</span>
              <button
                onClick={() => setWsPage(p => Math.min(totalWsPages, p + 1))}
                disabled={wsPage === totalWsPages}
                className="px-3 py-1 text-xs border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clickable Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-6 pb-4">
        {statCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm active:bg-blue-50 transition-all cursor-pointer group">
              <p className="text-xs text-gray-600 font-medium uppercase leading-tight">{card.label}</p>
              <p className={`text-2xl sm:text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-blue-600 font-medium">View</span>
                <ChevronRight className="w-3 h-3 text-blue-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Next Actions */}
      <div className="bg-blue-900 text-white rounded-lg p-4 sm:p-6 mx-4 sm:mx-6 mb-6">
        <h3 className="text-base font-semibold mb-3">Next Actions</h3>
        <div className="space-y-3">
          {openTickets.length > 0 && (
            <Link href="/platform/support">
              <div className="flex items-start gap-3 hover:bg-blue-800/50 rounded-lg p-2 -mx-2 cursor-pointer transition-colors">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{openTickets.length} open support ticket(s)</p>
                  <p className="text-xs text-blue-100">Review and respond to customer issues</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto shrink-0 mt-0.5" />
              </div>
            </Link>
          )}
          <Link href="/platform/workspaces">
            <div className="flex items-start gap-3 hover:bg-blue-800/50 rounded-lg p-2 -mx-2 cursor-pointer transition-colors">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Review workspace onboarding status</p>
                <p className="text-xs text-blue-100">Ensure new workspaces complete setup</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 mt-0.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
