import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Shield, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from "@/components/PageLayout";

const ACTION_TYPES = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Created" },
  { value: "update", label: "Updated" },
  { value: "delete", label: "Deleted" },
  { value: "archive", label: "Archived" },
  { value: "ai_scan", label: "AI Scan" },
  { value: "ai_approval", label: "AI Approval" },
  { value: "ai_rejection", label: "AI Rejection" },
  { value: "login", label: "Login" },
  { value: "file_upload", label: "File Upload" },
  { value: "status_change", label: "Status Change" },
];

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  archive: "bg-slate-100 text-slate-800",
  ai_scan: "bg-indigo-100 text-indigo-800",
  ai_approval: "bg-emerald-100 text-emerald-800",
  ai_rejection: "bg-orange-100 text-orange-800",
  login: "bg-purple-100 text-purple-800",
  file_upload: "bg-cyan-100 text-cyan-800",
  status_change: "bg-amber-100 text-amber-800",
};

export default function AuditLog() {
  const [filterAction, setFilterAction] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [], isLoading } = trpc.systemInfra.audit.list.useQuery({
    limit: 100,
    actionType: filterAction !== "all" ? filterAction : undefined,
  });

  const filtered = logs.filter((log: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.targetType || "").toLowerCase().includes(term) ||
      (log.actionType || "").toLowerCase().includes(term) ||
      (log.note || "").toLowerCase().includes(term)
    );
  });

  return (
    <PageLayout title="Audit Log" subtitle="System activity trail for compliance and security">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search audit log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Log Entries */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading audit log...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Shield className="mx-auto h-12 w-12 mb-4 text-slate-300" />
          <p>No audit entries found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log: any) => (
            <Card key={log.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.actionType] || "bg-slate-100 text-slate-700"}`}>
                    {log.actionType}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 truncate">
                      {log.targetType} {log.targetId ? `#${log.targetId}` : ""}
                      {log.note && <span className="text-slate-500 ml-2">— {log.note}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
