import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const mockDeadlines = [
  { id: 1, title: "Monthly Status Report Submission", type: "deliverable", dueDate: "2026-06-01", contract: "IT Services", status: "upcoming", daysUntil: 20 },
  { id: 2, title: "CMMC Assessment Completion", type: "compliance", dueDate: "2026-06-15", contract: "IT Services", status: "upcoming", daysUntil: 34 },
  { id: 3, title: "Option Year Exercise Decision", type: "contract", dueDate: "2026-05-25", contract: "Engineering Support", status: "urgent", daysUntil: 13 },
  { id: 4, title: "Subcontractor Performance Review", type: "operations", dueDate: "2026-05-30", contract: "IT Services", status: "upcoming", daysUntil: 18 },
  { id: 5, title: "Invoice Submission - April", type: "finance", dueDate: "2026-05-15", contract: "Engineering Support", status: "overdue", daysUntil: -3 },
  { id: 6, title: "Security Clearance Renewal - J. Smith", type: "personnel", dueDate: "2026-07-01", contract: "IT Services", status: "upcoming", daysUntil: 50 },
  { id: 7, title: "Quarterly Progress Review", type: "deliverable", dueDate: "2026-06-30", contract: "Engineering Support", status: "upcoming", daysUntil: 49 },
  { id: 8, title: "Contract End Date", type: "contract", dueDate: "2026-12-31", contract: "IT Services", status: "upcoming", daysUntil: 233 },
];

const statusColors: Record<string, string> = {
  overdue: "bg-red-100 text-red-700",
  urgent: "bg-amber-100 text-amber-700",
  upcoming: "bg-blue-100 text-blue-700",
  complete: "bg-green-100 text-green-700",
};

const typeColors: Record<string, string> = {
  deliverable: "border-blue-300 text-blue-700",
  compliance: "border-purple-300 text-purple-700",
  contract: "border-green-300 text-green-700",
  operations: "border-amber-300 text-amber-700",
  finance: "border-red-300 text-red-700",
  personnel: "border-slate-300 text-slate-700",
};

export default function Deadlines() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return mockDeadlines.filter((d) => {
      const matchesSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.contract.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || d.type === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  }, [search, typeFilter]);

  const stats = {
    overdue: mockDeadlines.filter((d) => d.status === "overdue").length,
    urgent: mockDeadlines.filter((d) => d.status === "urgent").length,
    thisMonth: mockDeadlines.filter((d) => d.daysUntil >= 0 && d.daysUntil <= 30).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Deadlines"
        description="Monitor all upcoming deadlines across contracts, deliverables, compliance, and operations."
        whenToUse="Check daily to stay ahead of upcoming deadlines. Use for planning and prioritization."
        whatToDoNext={[
          "Address overdue items immediately",
          "Plan for urgent deadlines within 14 days",
          "Set reminders for upcoming milestones",
          "Link deadlines to responsible team members",
        ]}
        relatedRecords={[
          { label: "Deliverables", path: "/app/deliverables" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Alerts & Tasks", path: "/app/alerts" },
          { label: "Calendar", path: "/app/timeline" },
        ]}
        alerts={[
          ...(stats.overdue > 0 ? [{ message: stats.overdue + " overdue deadline(s) require immediate attention", type: "warning" as const }] : []),
          ...(stats.urgent > 0 ? [{ message: stats.urgent + " deadline(s) due within 14 days", type: "warning" as const }] : []),
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deadlines</h1>
          <p className="text-sm text-slate-500 mt-1">{stats.thisMonth} due this month | {stats.overdue} overdue</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Deadline
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search deadlines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deliverable">Deliverable</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="personnel">Personnel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((deadline) => (
          <Card key={deadline.id} className={"border-l-4 " + (deadline.status === "overdue" ? "border-l-red-500" : deadline.status === "urgent" ? "border-l-amber-500" : "border-l-blue-500")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={statusColors[deadline.status]}>{deadline.status}</Badge>
                    <Badge variant="outline" className={typeColors[deadline.type]}>{deadline.type}</Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{deadline.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{deadline.contract}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-semibold text-slate-900">{deadline.dueDate}</p>
                  <p className={"text-xs mt-0.5 " + (deadline.daysUntil < 0 ? "text-red-600 font-medium" : deadline.daysUntil <= 14 ? "text-amber-600" : "text-slate-500")}>
                    {deadline.daysUntil < 0 ? Math.abs(deadline.daysUntil) + " days overdue" : deadline.daysUntil + " days remaining"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
