
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Sparkles,
  Info,
  ChevronRight,
  FileText,
  Shield,
  Briefcase,
  DollarSign,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AISuggestions() {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("new");
  
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [dismissReason, setDismissReason] = useState("");

  const utils = trpc.useUtils();
  const { data: suggestions = [], isLoading } = trpc.ai.listSuggestions.useQuery({ limit: 200 });

  const acceptMutation = trpc.ai.acceptSuggestion.useMutation({
    onSuccess: () => {
      utils.ai.listSuggestions.invalidate();
      toast({ title: "Suggestion Accepted", description: "The suggestion has been marked as accepted." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const dismissMutation = trpc.ai.dismissSuggestion.useMutation({
    onSuccess: () => {
      utils.ai.listSuggestions.invalidate();
      setDismissDialogOpen(false);
      toast({ title: "Suggestion Dismissed", description: "Your feedback helps improve future AI suggestions." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Map DB status to display status
  const mapStatus = (status: string) => {
    if (status === "new") return "Pending";
    if (status === "accepted") return "Accepted";
    if (status === "dismissed") return "Dismissed";
    if (status === "acknowledged") return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Map relatedRecordType to category
  const mapCategory = (type: string) => {
    if (type === "contract") return "Contract";
    if (type === "proposal") return "Proposal";
    if (type === "opportunity") return "Proposal";
    if (type === "invoice" || type === "payment") return "Finance";
    if (type === "compliance") return "Compliance";
    return "Operations";
  };

  const filteredSuggestions = suggestions.filter((s: any) => {
    const title = s.suggestionTitle || "";
    const text = s.suggestionText || "";
    const category = mapCategory(s.relatedRecordType || "");
    const displayStatus = mapStatus(s.status || "new");
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || category === categoryFilter;
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "new" && (s.status === "new" || s.status === "acknowledged")) ||
      s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalSuggestions = suggestions.length;
  const pendingCount = suggestions.filter((s: any) => s.status === "new" || s.status === "acknowledged").length;
  const acceptedCount = suggestions.filter((s: any) => s.status === "accepted").length;
  const dismissedCount = suggestions.filter((s: any) => s.status === "dismissed").length;

  const handleAccept = (id: number) => {
    acceptMutation.mutate({ id });
  };

  const openDismissDialog = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    setDismissReason("");
    setDismissDialogOpen(true);
  };

  const handleDismiss = () => {
    if (!dismissReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a reason for dismissing this suggestion.", variant: "destructive" });
      return;
    }
    if (selectedSuggestion) {
      dismissMutation.mutate({ id: selectedSuggestion.id });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "Compliance": return <Shield className="h-4 w-4" />;
      case "Proposal": return <FileText className="h-4 w-4" />;
      case "Contract": return <Briefcase className="h-4 w-4" />;
      case "Finance": return <DollarSign className="h-4 w-4" />;
      case "Operations": return <Settings className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Pending":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>;
      case "Accepted":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Accepted</span>;
      case "Dismissed":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1"><XCircle className="h-3 w-3" /> Dismissed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{status}</span>;
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "critical" || priority === "high") return "text-red-500";
    if (priority === "medium") return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <PageLayout title="AI Suggestions" subtitle="Review and act on AI-generated insights, compliance warnings, and optimization recommendations.">
      <PageGuide
        title="AI Suggestions"
        description="Review and act on AI-generated insights, compliance warnings, and optimization recommendations across your contracts and proposals."
        whenToUse="Check this page daily to stay ahead of compliance issues, optimize proposals, and catch anomalies."
        whatToDoNext={["Review pending suggestions", "Accept them to create actionable tasks", "Dismiss irrelevant ones with feedback to improve the AI"]}
        relatedRecords={[
          { label: "Compliance Dashboard", path: "/app/compliance" },
          { label: "Active Proposals", path: "/app/proposals" }
        ]}
      />

      <div className="space-y-6">
        {/* AI Disclaimer Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-500">AI-Generated Insights</h4>
            <p className="text-sm text-muted-foreground mt-1">
              These suggestions are generated by AI analyzing your contracts, proposals, and operational data. 
              Always verify critical information before taking action. Dismissing irrelevant suggestions helps improve future accuracy.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Total Suggestions</span>
            <span className="text-2xl font-bold mt-1">{totalSuggestions}</span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Pending Review</span>
            <span className="text-2xl font-bold mt-1 text-yellow-500">{pendingCount}</span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Accepted</span>
            <span className="text-2xl font-bold mt-1 text-green-500">{acceptedCount}</span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Dismissed</span>
            <span className="text-2xl font-bold mt-1 text-gray-500">{dismissedCount}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suggestions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Category:</span>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm font-medium">Status:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="new">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4 animate-pulse" />
              <h3 className="text-lg font-medium">Loading suggestions...</h3>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No suggestions found</h3>
              <p className="text-muted-foreground mt-2">
                {suggestions.length === 0 
                  ? "AI suggestions will appear here once you have contracts, proposals, or opportunities in your workspace."
                  : "Try adjusting your filters to see more suggestions."
                }
              </p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion: any) => {
              const category = mapCategory(suggestion.relatedRecordType || "");
              const displayStatus = mapStatus(suggestion.status || "new");
              const isPending = suggestion.status === "new" || suggestion.status === "acknowledged";
              return (
                <div key={suggestion.id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col md:flex-row">
                  {/* Left color bar based on category */}
                  <div className={`w-1.5 shrink-0 ${
                    category === 'Compliance' ? 'bg-red-500' :
                    category === 'Proposal' ? 'bg-blue-500' :
                    category === 'Contract' ? 'bg-purple-500' :
                    category === 'Finance' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1 bg-background">
                          {getCategoryIcon(category)}
                          {category}
                        </Badge>
                        {getStatusBadge(displayStatus)}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Sparkles className={`h-4 w-4 ${getPriorityColor(suggestion.priority || "medium")}`} />
                        <span className={getPriorityColor(suggestion.priority || "medium")}>
                          {(suggestion.priority || "medium").charAt(0).toUpperCase() + (suggestion.priority || "medium").slice(1)} Priority
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mt-2">{suggestion.suggestionTitle}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {suggestion.suggestionText}
                    </p>
                    
                    {suggestion.suggestedAction && (
                      <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded text-sm text-primary">
                        <strong>Suggested Action:</strong> {suggestion.suggestedAction}
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded w-fit">
                      <Info className="h-3.5 w-3.5" />
                      <span>Source: {suggestion.relatedRecordType} #{suggestion.relatedRecordId || "N/A"}</span>
                      <span className="ml-2">· {new Date(suggestion.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Actions Panel */}
                  <div className="bg-muted/20 p-5 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center gap-3 md:w-48 shrink-0">
                    {isPending ? (
                      <>
                        <Button 
                          onClick={() => handleAccept(suggestion.id)} 
                          className="w-full justify-start" 
                          size="sm"
                          disabled={acceptMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          onClick={() => openDismissDialog(suggestion)} 
                          variant="ghost" 
                          className="w-full justify-start text-muted-foreground hover:text-destructive" 
                          size="sm"
                          disabled={dismissMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Dismiss
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground">
                        {suggestion.status === "accepted" ? (
                          <>
                            <CheckCircle className="h-8 w-8 text-green-500 mb-2 opacity-50" />
                            <p>Accepted</p>
                            {suggestion.acceptedAt && (
                              <p className="text-xs mt-1">{new Date(suggestion.acceptedAt).toLocaleDateString()}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-8 w-8 text-gray-400 mb-2 opacity-50" />
                            <p>Dismissed</p>
                            {suggestion.dismissedAt && (
                              <p className="text-xs mt-1">{new Date(suggestion.dismissedAt).toLocaleDateString()}</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dismiss Dialog */}
      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Suggestion</DialogTitle>
            <DialogDescription>
              Please provide a reason for dismissing this suggestion. This helps improve our AI models.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4 p-3 bg-muted rounded-md text-sm">
              <span className="font-medium">Suggestion:</span> {selectedSuggestion?.suggestionTitle}
            </div>
            
            <Label htmlFor="reason" className="mb-2 block">Reason for dismissal</Label>
            <Select onValueChange={setDismissReason} value={dismissReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inaccurate">Information is inaccurate</SelectItem>
                <SelectItem value="irrelevant">Not relevant to my current work</SelectItem>
                <SelectItem value="already_done">I've already handled this</SelectItem>
                <SelectItem value="unhelpful">Suggestion is not helpful</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            {dismissReason === "other" && (
              <div className="mt-3">
                <Textarea 
                  placeholder="Please specify..." 
                  className="min-h-[80px]"
                  onChange={(e) => setDismissReason(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDismissDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDismiss} disabled={dismissMutation.isPending}>
              Dismiss Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          <PageGuidancePanel
        pageKey="ai-suggestions"
        title="AI Suggestions Help"
        description="Review AI-generated guidance recommendations. Suggestions help identify missing information, next steps, or improvements. Accept, dismiss, or create tasks from suggestions."
        whatToDoNext={["Review new suggestions", "Accept or dismiss each suggestion", "Create tasks from actionable suggestions", "Check back after making changes for updated suggestions"]}
        helpArticleSlug="what-is-ai-confirmation"
        glossaryTerms={["ai-suggestion", "ai-finding"]}
      />
    </PageLayout>
  );
}
