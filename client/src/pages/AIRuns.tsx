// @ts-nocheck
import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  Coins,
  Cpu,
} from "lucide-react";


export default function AIRuns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { data: runs = [], isLoading } = trpc.ai.listRuns.useQuery({ limit: 100 });

  const filteredRuns = runs.filter((run: any) => {
    const matchesSearch = (run.inputSummary || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (run.runType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (run.purpose || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (run.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || (run.runType || "").toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleRow = (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case "Failed":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      case "In Progress":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Date", "Type", "Purpose", "Status", "Input Tokens", "Output Tokens"];
    const rows = filteredRuns.map((r: any) => [
      r.id, new Date(r.createdAt).toLocaleString(), r.runType || r.aiType, r.purpose || "", r.status,
      r.inputTokens || 0, r.outputTokens || 0
    ]);
    const csv = [headers, ...rows].map((row: any[]) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ai-runs.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "AI run history exported as CSV." });
  };

  // Calculate summary metrics
  const totalRuns = runs.length;
  const totalTokens = runs.reduce((acc: number, run: any) => acc + (run.inputTokens || 0) + (run.outputTokens || 0), 0);
  const completedRuns = runs.filter((r: any) => r.status === "completed").length;

  return (
    <PageLayout title="AI Run History" subtitle="View and manage all AI workflow executions across your organization.">
      <div className="flex flex-col gap-6">
        <PageGuide
          title="AI Run History"
          description="View and manage all AI workflow executions across your organization."
          whenToUse="Use this page to audit AI usage, troubleshoot failed runs, and monitor token consumption and costs."
          whatToDoNext={["Review recent runs, filter by workflow type, or expand a run to see the full input and output."]}
          relatedRecords={[
            { label: "Settings", path: "/app/settings" },
            { label: "Billing", path: "/app/billing" }
          ]}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Runs</p>
                <h3 className="text-2xl font-bold">{totalRuns}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Tokens</p>
                <h3 className="text-2xl font-bold">{totalTokens.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Cost</p>
                <h3 className="text-2xl font-bold">{completedRuns} done</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Avg Duration</p>
                <h3 className="text-2xl font-bold">{avgDuration}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <CardTitle>Run History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search runs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Workflow Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Contract Scan">Contract Scan</SelectItem>
                  <SelectItem value="File Analysis">File Analysis</SelectItem>
                  <SelectItem value="Opportunity Review">Opportunity Review</SelectItem>
                  <SelectItem value="Proposal Assist">Proposal Assist</SelectItem>
                  <SelectItem value="Invoice Review">Invoice Review</SelectItem>
                  <SelectItem value="Dashboard Summary">Dashboard Summary</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Workflow Type</div>
                <div className="col-span-3">Input Summary</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Tokens</div>
                <div className="col-span-1 text-right">Cost</div>
                <div className="col-span-1 text-right">Duration</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {filteredRuns.length > 0 ? (
                  filteredRuns.map((run) => (
                    <div key={run.id} className="flex flex-col">
                      <div 
                        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => toggleRow((run as any).id)}
                      >
                        <div className="col-span-2 text-sm">
                          {new Date(run.date).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="col-span-2 text-sm font-medium">
                          {(run as any).runType || (run as any).aiType || "—"}
                        </div>
                        <div className="col-span-3 text-sm truncate text-muted-foreground">
                          {(run as any).inputSummary || (run as any).purpose || "—"}
                        </div>
                        <div className="col-span-2">
                          {getStatusBadge((run as any).status || "pending")}
                        </div>
                        <div className="col-span-1 text-sm text-right text-muted-foreground">
                          {((run as any).inputTokens + (run as any).outputTokens || 0).toLocaleString()}
                        </div>
                        <div className="col-span-1 text-sm text-right text-muted-foreground">
                          ${run.cost.toFixed(2)}
                        </div>
                        <div className="col-span-1 text-sm text-right text-muted-foreground flex items-center justify-end gap-2">
                          {(run as any).completedAt ? Math.round((new Date((run as any).completedAt).getTime() - new Date((run as any).createdAt).getTime()) / 1000) + "s" : "—"}
                          {expandedRow === (run as any).id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {expandedRow === (run as any).id && (
                        <div className="p-4 bg-muted/30 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Full Input</h4>
                            <div className="p-3 bg-background rounded-md border border-border text-sm whitespace-pre-wrap">
                              {(run as any).inputSummary || "No input recorded"}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Full Output</h4>
                            <div className="p-3 bg-background rounded-md border border-border text-sm whitespace-pre-wrap">
                              {(run as any).errorMessage || "Output not stored"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No AI runs found matching your filters.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
