import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Activity,
  User,
  Clock,
  ShieldAlert,
  FileText,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



export default function AuditLog() {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const { data: logs = [], isLoading } = trpc.audit.list.useQuery({ limit: 100 });

  const toggleRow = (id: number | string) => {
    setExpandedRows(prev => ({
      ...prev,
      [String(id)]: !prev[String(id)]
    }));
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast({ title: "Nothing to export", description: "No audit records match the current filters." });
      return;
    }
    const escapeCsv = (value: unknown) => {
      const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = filteredLogs.map((log) => [log.id, log.timestamp, log.userId, log.action, log.entity, log.entityId, log.changes]);
    const csv = [["Event ID", "Timestamp", "User ID", "Action", "Record Type", "Record ID", "Changes"], ...rows]
      .map(row => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `primecontractoros-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Export complete", description: `${filteredLogs.length} audit records exported as CSV.` });
  };

  const getActionClass = (action: string) => {
    switch (action) {
      case "create": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "update": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "delete": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "archive": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "restore": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = 
      (log.entity || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.changes || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    const logDate = new Date(log.timestamp);
    const matchesDateFrom = !dateFrom || logDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || logDate <= new Date(dateTo + "T23:59:59");
    
    return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
  });

  return (
    <PageLayout title="Audit Log" subtitle="Track and monitor all activities, changes, and access events across your workspace.">
      <div className="space-y-6">
        <PageGuide
          title="Audit Log"
          description="Track and monitor all activities, changes, and access events across your workspace."
          whenToUse="Use this page to investigate changes, monitor user activity, or generate compliance reports."
          whatToDoNext={[
            "Filter by specific action types or users",
            "Export logs for external compliance audits",
            "Expand individual records to inspect the recorded change payload"
          ]}
          relatedRecords={[
            { label: "User Management", path: "/app/users" },
            { label: "Settings", path: "/app/settings" }
          ]}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events Today</p>
                <h3 className="text-2xl font-bold text-foreground">{logs.filter((l: any) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events This Week</p>
                <h3 className="text-2xl font-bold text-foreground">{logs.filter((l: any) => { const d = new Date(l.timestamp); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; }).length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <ShieldAlert className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events (30d)</p>
                <h3 className="text-2xl font-bold text-foreground">{logs.filter((l: any) => { const d = new Date(l.timestamp); const now = new Date(); return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000; }).length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-1 gap-4 w-full">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by record, action, or details..."
                    className="pl-9 bg-background border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px] bg-background border-border">
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="archive">Archive</SelectItem>
                    <SelectItem value="restore">Restore</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowDateFilter(!showDateFilter)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Date Filter
                </Button>
              </div>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
            </div>
            {showDateFilter && (
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">From Date</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">To Date</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-2">User</div>
                <div className="col-span-2">Action</div>
                <div className="col-span-2">Record</div>
                <div className="col-span-3">Details</div>
                <div className="col-span-1 text-right">More</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No audit logs found matching your criteria.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="flex flex-col">
                      <div 
                        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => toggleRow(log.id)}
                      >
                        <div className="col-span-2 text-sm text-foreground flex items-center">
                          <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="col-span-2 text-sm text-foreground flex items-center">
                          <User className="mr-2 h-3 w-3 text-muted-foreground" />
                          <span className="truncate">User #{log.userId}</span>
                        </div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionClass(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <div className="col-span-2 text-sm text-foreground">
                          <div className="font-medium">{log.entity}</div>
                          <div className="text-xs text-muted-foreground">ID: {log.entityId}</div>
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground truncate">
                          {log.changes ? JSON.stringify(JSON.parse(log.changes)).substring(0, 80) : "—"}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {expandedRows[log.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedRows[log.id] && (
                        <div className="p-4 bg-muted/20 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              Event Metadata
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Event ID:</span>
                                <span className="col-span-2 font-mono text-foreground">{log.id}</span>
                              </div>

                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Recorded Changes</h4>
                            <pre className="text-xs text-foreground overflow-x-auto bg-background border border-border rounded p-3">
                              {log.changes || "No change payload recorded."}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
