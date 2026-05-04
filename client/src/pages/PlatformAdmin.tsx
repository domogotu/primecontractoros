import { useState } from "react";
import { Search, Plus, MoreVertical, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlatformAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const workspaces = [
    { id: 1, name: "TechFlow Solutions", status: "active", billing: "paid", support: "none", users: 3, createdAt: "2026-01-15" },
    { id: 2, name: "BuildCorp LLC", status: "active", billing: "trial", support: "email", users: 1, createdAt: "2026-02-20" },
    { id: 3, name: "Government Contractors Inc", status: "suspended", billing: "overdue", support: "urgent", users: 5, createdAt: "2025-11-10" },
    { id: 4, name: "Prime Ventures", status: "active", billing: "paid", support: "none", users: 2, createdAt: "2026-03-01" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBillingColor = (billing: string) => {
    switch (billing) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-amber-100 text-amber-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Platform Admin</h1>
        <p className="text-gray-600">Manage all customer workspaces, billing, and support</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between gap-4">
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="trial">Trial</option>
        </select>
        <Button className="bg-blue-900 hover:bg-blue-800 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Workspace
        </Button>
      </div>

      {/* Workspace Table */}
      <div className="bg-white m-6 rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Workspace</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Billing</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Support</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Users</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {workspaces.map((ws) => (
              <tr key={ws.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{ws.name}</p>
                    <p className="text-sm text-gray-500">ID: {ws.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ws.status)}`}>
                    {ws.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBillingColor(ws.billing)}`}>
                    {ws.billing}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{ws.support || "—"}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{ws.users}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{ws.createdAt}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 px-6 pb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Total Workspaces</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">24</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">19</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Suspended</p>
          <p className="text-3xl font-bold text-red-600 mt-2">2</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs text-gray-600 font-medium uppercase">Billing Issues</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">3</p>
        </div>
      </div>

      {/* Next Actions */}
      <div className="bg-blue-900 text-white rounded-lg p-6 mx-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Next Actions</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">3 workspaces with overdue billing</p>
              <p className="text-sm text-blue-100">Review and send payment reminders</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">2 trials expiring in 3 days</p>
              <p className="text-sm text-blue-100">Send renewal offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
