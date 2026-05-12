import { useState } from "react";
import { Search, Plus, MoreVertical, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function PlatformAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: stats, isLoading: statsLoading } = trpc.platform.stats.useQuery();
  const { data: workspaces = [], isLoading: wsLoading } = trpc.platform.workspaces.list.useQuery();
  const { data: tickets = [] } = trpc.platform.support.list.useQuery();

  const openTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in_progress");

  const filteredWorkspaces = workspaces.filter((ws: any) => {
    const matchesSearch = ws.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (statsLoading || wsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Platform Admin</h1>
        <p className="text-gray-600">Manage all customer workspaces, billing, and support</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
        <Link href="/platform/workspaces">
          <Button className="bg-blue-900 hover:bg-blue-800 text-white">
            View All Workspaces
          </Button>
        </Link>
      </div>

      {/* Workspace Table */}
      <div className="bg-white m-4 sm:m-6 rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Workspace</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Onboarded</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Model</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWorkspaces.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No workspaces found
                </td>
              </tr>
            ) : (
              filteredWorkspaces.map((ws: any) => (
                <tr key={ws.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{ws.name}</p>
                      <p className="text-sm text-gray-500">ID: {ws.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ws.companyName || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      ws.onboardingCompleted ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {ws.onboardingCompleted ? "Yes" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ws.contractingModel || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/platform/workspaces/${ws.id}`}>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 sm:px-6 pb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Total Workspaces</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.totalWorkspaces || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Total Users</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Plans</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.totalPlans || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Open Tickets</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats?.openTickets || 0}</p>
        </div>
      </div>

      {/* Next Actions */}
      <div className="bg-blue-900 text-white rounded-lg p-6 mx-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Next Actions</h3>
        <div className="space-y-3">
          {openTickets.length > 0 && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{openTickets.length} open support ticket(s)</p>
                <p className="text-sm text-blue-100">Review and respond to customer issues</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Review workspace onboarding status</p>
              <p className="text-sm text-blue-100">Ensure new workspaces complete setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
