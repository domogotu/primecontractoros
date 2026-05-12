import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, GitBranch, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const statusConfig: Record<string, { color: string }> = {
  draft: { color: "bg-slate-100 text-slate-700" },
  submitted: { color: "bg-blue-100 text-blue-700" },
  under_review: { color: "bg-amber-100 text-amber-700" },
  approved: { color: "bg-green-100 text-green-700" },
  rejected: { color: "bg-red-100 text-red-700" },
  implemented: { color: "bg-purple-100 text-purple-700" },
};

const mockChanges = [
  { id: 1, title: "Extend Period of Performance by 90 days", type: "schedule", status: "under_review", contractTitle: "IT Services Contract", impactCost: 0, impactSchedule: "90 days", submittedAt: "2026-04-15", submittedBy: "John Smith" },
  { id: 2, title: "Add CMMC Level 2 Compliance Requirement", type: "scope", status: "approved", contractTitle: "IT Services Contract", impactCost: 45000, impactSchedule: "30 days", submittedAt: "2026-03-20", submittedBy: "Jane Doe" },
  { id: 3, title: "Replace Key Personnel - Project Manager", type: "personnel", status: "submitted", contractTitle: "Engineering Support", impactCost: 0, impactSchedule: "None", submittedAt: "2026-05-01", submittedBy: "Mike Johnson" },
  { id: 4, title: "Increase CLIN 0003 Quantity by 200 units", type: "cost", status: "draft", contractTitle: "Engineering Support", impactCost: 120000, impactSchedule: "None", submittedAt: "2026-05-10", submittedBy: "Sarah Lee" },
  { id: 5, title: "Modify Data Rights - Technical Data Package", type: "scope", status: "rejected", contractTitle: "IT Services Contract", impactCost: 0, impactSchedule: "None", submittedAt: "2026-02-28", submittedBy: "John Smith" },
];

export default function ChangeManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return mockChanges.filter((change) => {
      const matchesSearch = !search ||
        change.title.toLowerCase().includes(search.toLowerCase()) ||
        change.contractTitle.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || change.status === statusFilter;
      const matchesType = typeFilter === "all" || change.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const stats = {
    total: mockChanges.length,
    pending: mockChanges.filter((c) => ["submitted", "under_review"].includes(c.status)).length,
    approved: mockChanges.filter((c) => c.status === "approved").length,
    totalCostImpact: mockChanges.filter((c) => c.status !== "rejected").reduce((sum, c) => sum + c.impactCost, 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Change Management"
        description="Track contract modifications, change orders, and their approval status. Manage scope, cost, schedule, and personnel changes."
        whenToUse="Use when a contract modification is needed, when the government issues a change order, or when tracking the impact of approved changes."
        whatToDoNext={[
          "Create a change request for any scope, cost, or schedule modification",
          "Track approval workflow through submission, review, and decision",
          "Document cost and schedule impact for each change",
          "Link changes to affected contract CLINs and deliverables",
        ]}
        relatedRecords={[
          { label: "Contracts", path: "/app/contracts" },
          { label: "Deliverables", path: "/app/deliverables" },
          { label: "Finance", path: "/app/finance" },
          { label: "Compliance", path: "/app/compliance" },
        ]}
        alerts={stats.pending > 0 ? [{ message: `${stats.pending} change requests awaiting review`, type: "warning" }] : []}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Change Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track contract modifications and change orders</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Change Request
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500 uppercase">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-amber-600 uppercase">Pending</p><p className="text-2xl font-bold text-amber-700">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-green-600 uppercase">Approved</p><p className="text-2xl font-bold text-green-700">{stats.approved}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500 uppercase">Cost Impact</p><p className="text-2xl font-bold">${stats.totalCostImpact.toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search changes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="scope">Scope</SelectItem>
            <SelectItem value="cost">Cost</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="personnel">Personnel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Change Request</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Contract</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden lg:table-cell">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((change) => {
              const config = statusConfig[change.status] || statusConfig.draft;
              return (
                <tr key={change.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 text-sm">{change.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Submitted {change.submittedAt} by {change.submittedBy}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-slate-600">{change.contractTitle}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge variant="outline" className="capitalize">{change.type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={config.color}>{change.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-xs text-slate-600">
                      {change.impactCost > 0 && <span className="block">${change.impactCost.toLocaleString()}</span>}
                      {change.impactSchedule !== "None" && <span className="block">{change.impactSchedule}</span>}
                      {change.impactCost === 0 && change.impactSchedule === "None" && <span>No impact</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
