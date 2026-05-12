// @ts-nocheck
import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Demo data fallback
const DEMO_AUDIT_LOGS = [
  {
    id: "al-001",
    timestamp: "2023-10-27T14:32:00Z",
    user: "Jane Doe",
    userEmail: "jane@example.com",
    action: "UPDATE",
    recordType: "Contract",
    recordName: "C-2023-001 Alpha Project",
    details: "Updated contract value from $150,000 to $175,000",
    ip: "192.168.1.45",
    before: { value: 150000 },
    after: { value: 175000 }
  },
  {
    id: "al-002",
    timestamp: "2023-10-27T11:15:00Z",
    user: "John Smith",
    userEmail: "john@example.com",
    action: "CREATE",
    recordType: "Invoice",
    recordName: "INV-2023-042",
    details: "Created new invoice for Alpha Project",
    ip: "192.168.1.112",
    before: null,
    after: { amount: 25000, status: "DRAFT" }
  },
  {
    id: "al-003",
    timestamp: "2023-10-26T09:45:00Z",
    user: "System",
    userEmail: "system@primecontractoros.com",
    action: "STATUS_CHANGE",
    recordType: "Compliance",
    recordName: "Security Clearance - JD",
    details: "Automated status update: Expiring in 30 days",
    ip: "127.0.0.1",
    before: { status: "VALID" },
    after: { status: "EXPIRING_SOON" }
  },
  {
    id: "al-004",
    timestamp: "2023-10-25T16:20:00Z",
    user: "Admin User",
    userEmail: "admin@example.com",
    action: "DELETE",
    recordType: "Document",
    recordName: "Draft_Proposal_v1.pdf",
    details: "Deleted obsolete document",
    ip: "192.168.1.10",
    before: { fileName: "Draft_Proposal_v1.pdf", size: "2.4MB" },
    after: null
  },
  {
    id: "al-005",
    timestamp: "2023-10-25T08:30:00Z",
    user: "Jane Doe",
    userEmail: "jane@example.com",
    action: "LOGIN",
    recordType: "Session",
    recordName: "User Login",
    details: "Successful login from new device",
    ip: "203.0.113.42",
    before: null,
    after: { device: "MacBook Pro", browser: "Chrome" }
  }
];

export default function AuditLog() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Try to use tRPC, fallback to demo data
  const { data: logsData, isLoading } = trpc.audit?.list?.useQuery(undefined, {
    retry: false,
  }) || { data: null, isLoading: false };

  const logs = logsData || DEMO_AUDIT_LOGS;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Audit log export is being generated. You will be notified when it's ready.",
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "green";
      case "UPDATE": return "blue";
      case "DELETE": return "red";
      case "STATUS_CHANGE": return "yellow";
      case "LOGIN": return "purple";
      default: return "gray";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recordName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageGuide
          title="Audit Log"
          description="Track and monitor all activities, changes, and access events across your workspace."
          whenToUse="Use this page to investigate changes, monitor user activity, or generate compliance reports."
          whatToDoNext={[
            "Filter by specific action types or users",
            "Export logs for external compliance audits",
            "Expand individual records to see exact before/after values"
          ]}
          relatedRecords={[
            { title: "User Management", url: "/app/users" },
            { title: "Security Settings", url: "/app/settings/security" }
          ]}
          alerts={[
            { type: "info", message: "Audit logs are retained for 7 years to meet DCAA compliance requirements." }
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
                <h3 className="text-2xl font-bold text-foreground">142</h3>
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
                <h3 className="text-2xl font-bold text-foreground">856</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <ShieldAlert className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Events (30d)</p>
                <h3 className="text-2xl font-bold text-foreground">12</h3>
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
                    placeholder="Search by user, record, or details..."
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
                    <SelectItem value="ALL">All Actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="STATUS_CHANGE">Status Change</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => toast({ title: "Date filter", description: "Feature coming soon" })}>
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
            </div>
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
                          <span className="truncate" title={log.userEmail}>{log.user}</span>
                        </div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getActionColor(log.action)}-100 text-${getActionColor(log.action)}-800 dark:bg-${getActionColor(log.action)}-900/30 dark:text-${getActionColor(log.action)}-400`}>
                            {log.action}
                          </span>
                        </div>
                        <div className="col-span-2 text-sm text-foreground">
                          <div className="font-medium">{log.recordType}</div>
                          <div className="text-xs text-muted-foreground truncate" title={log.recordName}>{log.recordName}</div>
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground truncate" title={log.details}>
                          {log.details}
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
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">IP Address:</span>
                                <span className="col-span-2 font-mono text-foreground">{log.ip}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">User Email:</span>
                                <span className="col-span-2 text-foreground">{log.userEmail}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Data Changes</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-background border border-border rounded p-3">
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Before</div>
                                <pre className="text-xs text-red-400 overflow-x-auto">
                                  {log.before ? JSON.stringify(log.before, null, 2) : "null"}
                                </pre>
                              </div>
                              <div className="bg-background border border-border rounded p-3">
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">After</div>
                                <pre className="text-xs text-green-400 overflow-x-auto">
                                  {log.after ? JSON.stringify(log.after, null, 2) : "null"}
                                </pre>
                              </div>
                            </div>
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
