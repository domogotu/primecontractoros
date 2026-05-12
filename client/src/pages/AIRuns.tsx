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

// Demo data for AI runs
const DEMO_RUNS = [
  {
    id: "run-001",
    date: "2023-10-25T14:30:00Z",
    workflowType: "Contract Scan",
    inputSummary: "Scanned contract DOC-2023-892 for compliance clauses.",
    status: "Completed",
    tokensUsed: 4500,
    cost: 0.09,
    duration: "12s",
    fullInput: "Analyze the attached contract DOC-2023-892 and extract all compliance clauses related to FAR 52.204-21.",
    fullOutput: "Found 3 compliance clauses:\n1. FAR 52.204-21 Basic Safeguarding of Covered Contractor Information Systems.\n2. DFARS 252.204-7012 Safeguarding Covered Defense Information and Cyber Incident Reporting.\n3. DFARS 252.204-7020 NIST SP 800-171 DoD Assessment Requirements.",
  },
  {
    id: "run-002",
    date: "2023-10-25T11:15:00Z",
    workflowType: "Proposal Assist",
    inputSummary: "Generated executive summary for RFP-2023-445.",
    status: "Completed",
    tokensUsed: 12500,
    cost: 0.25,
    duration: "45s",
    fullInput: "Generate an executive summary for our proposal responding to RFP-2023-445 (Cloud Migration Services). Emphasize our past performance with the VA.",
    fullOutput: "Executive Summary:\nOur team brings unparalleled expertise in cloud migration, demonstrated by our successful modernization of the VA's legacy systems. We propose a phased approach to minimize downtime and ensure seamless transition to the new cloud infrastructure...",
  },
  {
    id: "run-003",
    date: "2023-10-24T16:45:00Z",
    workflowType: "File Analysis",
    inputSummary: "Analyzed technical specifications document.",
    status: "Failed",
    tokensUsed: 800,
    cost: 0.02,
    duration: "5s",
    fullInput: "Extract key technical requirements from TechSpec_v2.pdf.",
    fullOutput: "Error: Document exceeds maximum token limit. Please split the document into smaller sections and try again.",
  },
  {
    id: "run-004",
    date: "2023-10-24T09:20:00Z",
    workflowType: "Opportunity Review",
    inputSummary: "Evaluated solicitation SOL-9982 against company capabilities.",
    status: "Completed",
    tokensUsed: 8200,
    cost: 0.16,
    duration: "28s",
    fullInput: "Review solicitation SOL-9982 and score it against our core capabilities in cybersecurity and data analytics.",
    fullOutput: "Opportunity Score: 85/100\n\nStrengths:\n- Strong alignment with our cybersecurity past performance.\n- Requires data analytics expertise which matches our recent hires.\n\nWeaknesses:\n- Requires TS/SCI facility clearance (we currently only have Secret).",
  },
  {
    id: "run-005",
    date: "2023-10-23T13:10:00Z",
    workflowType: "Dashboard Summary",
    inputSummary: "Generated weekly performance summary.",
    status: "In Progress",
    tokensUsed: 1200,
    cost: 0.02,
    duration: "8s",
    fullInput: "Summarize key metrics from the dashboard for the week of Oct 16-22.",
    fullOutput: "Generating summary...",
  },
];

export default function AIRuns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // In a real app, we would use tRPC to fetch data
  // const { data: usageData, isLoading } = trpc.aiWorkflow.getUsage.useQuery();
  
  const runs = DEMO_RUNS;

  const filteredRuns = runs.filter((run) => {
    const matchesSearch = run.inputSummary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          run.workflowType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || run.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || run.workflowType.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleRow = (id: string) => {
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
    toast({
      title: "Feature coming soon",
      description: "Exporting AI run history is not yet implemented.",
    });
  };

  // Calculate summary metrics
  const totalRuns = runs.length;
  const totalTokens = runs.reduce((acc, run) => acc + run.tokensUsed, 0);
  const totalCost = runs.reduce((acc, run) => acc + run.cost, 0);
  const avgDuration = "20s"; // Mocked for demo

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <PageGuide
          title="AI Run History"
          description="View and manage all AI workflow executions across your organization."
          whenToUse="Use this page to audit AI usage, troubleshoot failed runs, and monitor token consumption and costs."
          whatToDoNext="Review recent runs, filter by workflow type, or expand a run to see the full input and output."
          relatedRecords={[
            { label: "AI Settings", href: "/app/settings/ai" },
            { label: "Billing", href: "/app/settings/billing" }
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
                <h3 className="text-2xl font-bold">${totalCost.toFixed(2)}</h3>
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
                        onClick={() => toggleRow(run.id)}
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
                          {run.workflowType}
                        </div>
                        <div className="col-span-3 text-sm truncate text-muted-foreground">
                          {run.inputSummary}
                        </div>
                        <div className="col-span-2">
                          {getStatusBadge(run.status)}
                        </div>
                        <div className="col-span-1 text-sm text-right text-muted-foreground">
                          {run.tokensUsed.toLocaleString()}
                        </div>
                        <div className="col-span-1 text-sm text-right text-muted-foreground">
                          ${run.cost.toFixed(2)}
                        </div>
                        <div className="col-span-1 text-sm text-right text-muted-foreground flex items-center justify-end gap-2">
                          {run.duration}
                          {expandedRow === run.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {expandedRow === run.id && (
                        <div className="p-4 bg-muted/30 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Full Input</h4>
                            <div className="p-3 bg-background rounded-md border border-border text-sm whitespace-pre-wrap">
                              {run.fullInput}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Full Output</h4>
                            <div className="p-3 bg-background rounded-md border border-border text-sm whitespace-pre-wrap">
                              {run.fullOutput}
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
