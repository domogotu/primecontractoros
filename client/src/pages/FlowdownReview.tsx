import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, CheckCircle2, AlertTriangle, XCircle, FileText, Search, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

const SAMPLE_CLAUSES = [
  { id: 1, number: "FAR 52.219-8", title: "Utilization of Small Business Concerns", category: "Small Business", flowdownRequired: true, status: "included", risk: "low" },
  { id: 2, number: "FAR 52.222-26", title: "Equal Opportunity", category: "Labor", flowdownRequired: true, status: "included", risk: "low" },
  { id: 3, number: "FAR 52.222-35", title: "Equal Opportunity for Veterans", category: "Labor", flowdownRequired: true, status: "missing", risk: "high" },
  { id: 4, number: "FAR 52.222-36", title: "Equal Opportunity for Workers with Disabilities", category: "Labor", flowdownRequired: true, status: "missing", risk: "high" },
  { id: 5, number: "DFARS 252.204-7012", title: "Safeguarding Covered Defense Information", category: "Cybersecurity", flowdownRequired: true, status: "included", risk: "low" },
  { id: 6, number: "DFARS 252.225-7001", title: "Buy American and Balance of Payments Program", category: "Trade", flowdownRequired: true, status: "review_needed", risk: "medium" },
  { id: 7, number: "FAR 52.244-6", title: "Subcontracts for Commercial Products", category: "Subcontracting", flowdownRequired: false, status: "not_applicable", risk: "low" },
  { id: 8, number: "DFARS 252.227-7013", title: "Rights in Technical Data — Noncommercial Items", category: "IP Rights", flowdownRequired: true, status: "review_needed", risk: "medium" },
  { id: 9, number: "FAR 52.203-13", title: "Contractor Code of Business Ethics", category: "Ethics", flowdownRequired: true, status: "included", risk: "low" },
  { id: 10, number: "FAR 52.215-2", title: "Audit and Records — Negotiation", category: "Audit", flowdownRequired: true, status: "missing", risk: "high" },
];

export default function FlowdownReview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const statusConfig: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    included: { color: "bg-green-100 text-green-800", label: "Included", icon: CheckCircle2 },
    missing: { color: "bg-red-100 text-red-800", label: "Missing", icon: XCircle },
    review_needed: { color: "bg-yellow-100 text-yellow-800", label: "Review Needed", icon: AlertTriangle },
    not_applicable: { color: "bg-gray-100 text-gray-600", label: "N/A", icon: FileText },
  };

  const riskColors: Record<string, string> = {
    high: "text-red-600 bg-red-50",
    medium: "text-yellow-600 bg-yellow-50",
    low: "text-green-600 bg-green-50",
  };

  const filtered = SAMPLE_CLAUSES.filter((c) => {
    const matchesSearch = !searchTerm || c.number.toLowerCase().includes(searchTerm.toLowerCase()) || c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: SAMPLE_CLAUSES.length,
    included: SAMPLE_CLAUSES.filter(c => c.status === "included").length,
    missing: SAMPLE_CLAUSES.filter(c => c.status === "missing").length,
    reviewNeeded: SAMPLE_CLAUSES.filter(c => c.status === "review_needed").length,
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flowdown Review</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage clause flowdown to subcontracts</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => toast.info("AI flowdown analysis will scan your contract for required clauses.")}>
          <Shield className="w-4 h-4 mr-2" /> Run AI Analysis
        </Button>
      </div>

      <PageGuide
        title="Flowdown Review"
        description="Ensure required FAR/DFARS clauses are properly flowed down to subcontractors. Missing flowdown clauses create compliance risk."
        whenToUse="When issuing subcontracts, during compliance reviews, or when prime contract modifications add new clauses."
        whatToDoNext={["Review missing clauses and add them to subcontracts", "Mark review-needed items after legal review", "Run AI analysis for automated clause detection"]}
        relatedRecords={[{ label: "FAR/DFARS Reference", path: "/app/far-reference" }, { label: "Compliance Matrix", path: "/app/compliance-matrix" }, { label: "Subcontractors", path: "/app/subcontractors" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Total Clauses</p></CardContent></Card>
        <Card className="border-l-4 border-l-green-400"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{stats.included}</p><p className="text-xs text-gray-500">Included</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-400"><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{stats.missing}</p><p className="text-xs text-gray-500">Missing</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-400"><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{stats.reviewNeeded}</p><p className="text-xs text-gray-500">Review Needed</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search clauses..." className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          <option value="included">Included</option>
          <option value="missing">Missing</option>
          <option value="review_needed">Review Needed</option>
          <option value="not_applicable">N/A</option>
        </select>
      </div>

      {/* Clauses Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filtered.map((clause) => {
          const cfg = statusConfig[clause.status] || statusConfig.included;
          const StatusIcon = cfg.icon;
          const isExpanded = expandedId === clause.id;

          return (
            <div key={clause.id} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-semibold text-blue-700">{clause.number}</span>
                    <span className="text-sm text-gray-900">{clause.title}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{clause.category}</Badge>
                <Badge className={cfg.color}><StatusIcon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[clause.risk]}`}>{clause.risk} risk</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 pl-11 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500">Category:</span> <span className="font-medium">{clause.category}</span></div>
                    <div><span className="text-gray-500">Flowdown Required:</span> <span className="font-medium">{clause.flowdownRequired ? "Yes" : "No"}</span></div>
                    <div><span className="text-gray-500">Risk Level:</span> <span className={`font-medium capitalize ${clause.risk === "high" ? "text-red-600" : clause.risk === "medium" ? "text-yellow-600" : "text-green-600"}`}>{clause.risk}</span></div>
                  </div>
                  <div className="flex gap-2">
                    {clause.status === "missing" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success(`Marked ${clause.number} as included`)}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Included
                      </Button>
                    )}
                    {clause.status === "review_needed" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success(`Approved ${clause.number}`)}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => toast.info(`Flagged ${clause.number} for further review`)}>
                          <AlertTriangle className="w-3 h-3 mr-1" /> Flag Issue
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Opening FAR/DFARS reference for ${clause.number}`)}>
                      <FileText className="w-3 h-3 mr-1" /> View Reference
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4">AI analysis identifies clauses but does not make legal determinations. Always verify with legal counsel.</p>
    </div>
  );
}
