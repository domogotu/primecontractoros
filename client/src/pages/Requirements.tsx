import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, FileText, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const statusColors: Record<string, string> = {
  identified: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  met: "bg-green-100 text-green-700",
  at_risk: "bg-amber-100 text-amber-700",
  not_met: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  identified: FileText,
  in_progress: Clock,
  met: CheckCircle2,
  at_risk: AlertTriangle,
  not_met: XCircle,
};

export default function Requirements() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const contractId = urlParams.get("contractId") ? parseInt(urlParams.get("contractId")!) : undefined;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Use contractRequirements if contractId is present, otherwise fall back to compliance list
  const { data: contractReqs, isLoading: reqsLoading } = trpc.contractRequirements.list.useQuery(
    { contractId: contractId! },
    { enabled: !!contractId }
  );
  const { data: complianceReqs, isLoading: compLoading } = trpc.compliance.list.useQuery(
    contractId ? { contractId } : undefined,
    { enabled: !contractId }
  );
  const requirements = contractId ? contractReqs : complianceReqs;
  const isLoading = contractId ? reqsLoading : compLoading;

  const filtered = useMemo(() => {
    if (!requirements) return [];
    return requirements.filter((req: any) => {
      const matchesSearch = !search || 
        req.title?.toLowerCase().includes(search.toLowerCase()) ||
        req.description?.toLowerCase().includes(search.toLowerCase()) ||
        req.clauseReference?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesSource = sourceFilter === "all" || req.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [requirements, search, statusFilter, sourceFilter]);

  const stats = useMemo(() => {
    if (!requirements) return { total: 0, met: 0, atRisk: 0, notMet: 0 };
    return {
      total: requirements.length,
      met: requirements.filter((r: any) => r.status === "met").length,
      atRisk: requirements.filter((r: any) => r.status === "at_risk").length,
      notMet: requirements.filter((r: any) => r.status === "not_met").length,
    };
  }, [requirements]);

  return (
    <PageLayout
        label="Contract Operations"
        title="Contract Requirements"
        subtitle="Track and verify all contract requirements and their compliance status."
        summaryCards={[{ label: "Total", value: (requirements ?? []).length }, { label: "Verified", value: (requirements ?? []).filter((r:any)=>r.status==="verified").length, color: "text-green-600" }, { label: "Pending", value: (requirements ?? []).filter((r:any)=>r.status!=="verified").length, color: "text-amber-600" }]}
      >
      <PageGuide
        title="Requirements Tracking"
        description="Track all contract requirements, their sources, verification status, and compliance evidence."
        whenToUse="Use this page when you need to track what your contract requires you to do, verify compliance status, or prepare for audits and reviews."
        whatToDoNext={[
          "Import requirements from your contract documents using AI scan",
          "Assign verification methods and responsible parties",
          "Link evidence documents to prove compliance",
          "Review at-risk items and create action plans",
        ]}
        relatedRecords={[
          { label: "Compliance Matrix", path: "/app/compliance" },
          { label: "Deliverables", path: "/app/deliverables" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "FAR/DFARS Reference", path: "/app/far-reference" },
        ]}
        alerts={
          stats.atRisk > 0
            ? [{ message: `${stats.atRisk} requirements at risk - review needed`, type: "warning" }]
            : []
        }
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requirements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track contract requirements, verification status, and compliance evidence
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-green-600 uppercase">Met</p>
            <p className="text-2xl font-bold text-green-700">{stats.met}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 uppercase">At Risk</p>
            <p className="text-2xl font-bold text-amber-700">{stats.atRisk}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-red-600 uppercase">Not Met</p>
            <p className="text-2xl font-bold text-red-700">{stats.notMet}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search requirements, clauses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="identified">Identified</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="met">Met</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="not_met">Not Met</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="far">FAR</SelectItem>
            <SelectItem value="dfars">DFARS</SelectItem>
            <SelectItem value="sow">SOW</SelectItem>
            <SelectItem value="cdrl">CDRL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requirements Table */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading requirements...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Requirements Found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {requirements?.length === 0
                ? "Start by importing requirements from your contract or adding them manually."
                : "No requirements match your current filters."}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add First Requirement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Requirement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden lg:table-cell">Clause</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req: any) => {
                const StatusIcon = statusIcons[req.status] || FileText;
                return (
                  <tr key={req.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/app/compliance`)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 text-sm">{req.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{req.description}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-600">{req.source || "Contract"}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs font-mono text-slate-600">{req.clauseReference || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusColors[req.status] || statusColors.identified} text-xs`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {req.status?.replace("_", " ") || "identified"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-600">{req.verificationMethod || "—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    
      </PageLayout>
  );
}
