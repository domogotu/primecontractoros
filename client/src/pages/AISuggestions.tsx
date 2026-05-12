// @ts-nocheck
import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Demo data
const DEMO_SUGGESTIONS = [
  {
    id: "sug-1",
    title: "Missing FAR Clause 52.204-24",
    description: "The recent contract modification for Project Alpha does not include the required FAR clause 52.204-24 regarding covered telecommunications equipment.",
    sourceReference: "Contract Mod #4, Project Alpha",
    confidenceLevel: 98,
    category: "Compliance",
    status: "Pending",
    date: "2023-10-25T10:30:00Z",
    impact: "High"
  },
  {
    id: "sug-2",
    title: "Optimize Pricing Strategy for RFP-2023-89",
    description: "Based on historical win rates and competitor analysis, reducing the labor rate for Senior Engineers by 4% could increase win probability by 15%.",
    sourceReference: "RFP-2023-89 Pricing Volume",
    confidenceLevel: 85,
    category: "Proposal",
    status: "Pending",
    date: "2023-10-24T14:15:00Z",
    impact: "Medium"
  },
  {
    id: "sug-3",
    title: "Upcoming Option Year Renewal",
    description: "The option year for the Beta Services contract is approaching in 60 days. Recommend initiating the renewal process and performance review.",
    sourceReference: "Beta Services Contract",
    confidenceLevel: 99,
    category: "Contract",
    status: "Accepted",
    date: "2023-10-20T09:00:00Z",
    impact: "High"
  },
  {
    id: "sug-4",
    title: "Invoice Discrepancy Detected",
    description: "Invoice #INV-4092 has a 5% variance compared to the approved timesheets for the billing period.",
    sourceReference: "Invoice #INV-4092",
    confidenceLevel: 92,
    category: "Finance",
    status: "Pending",
    date: "2023-10-26T08:45:00Z",
    impact: "High"
  },
  {
    id: "sug-5",
    title: "Resource Allocation Inefficiency",
    description: "Team Delta has 20% unutilized capacity this week while Team Echo is over-allocated by 15%. Consider reassigning resources.",
    sourceReference: "Weekly Resource Report",
    confidenceLevel: 78,
    category: "Operations",
    status: "Dismissed",
    date: "2023-10-22T11:20:00Z",
    impact: "Low"
  }
];

export default function AISuggestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [suggestions, setSuggestions] = useState(DEMO_SUGGESTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Pending");
  
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [dismissReason, setDismissReason] = useState("");

  // Stats
  const totalSuggestions = suggestions.length;
  const pendingCount = suggestions.filter(s => s.status === "Pending").length;
  const acceptedCount = suggestions.filter(s => s.status === "Accepted").length;
  const dismissedCount = suggestions.filter(s => s.status === "Dismissed").length;

  // Filtering
  const filteredSuggestions = suggestions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAccept = (id) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: "Accepted" } : s));
    toast({
      title: "Suggestion Accepted",
      description: "A task has been created based on this suggestion.",
    });
  };

  const handleReviewLater = (id) => {
    toast({
      title: "Saved for Later",
      description: "This suggestion will remain in your pending list.",
    });
  };

  const openDismissDialog = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setDismissReason("");
    setDismissDialogOpen(true);
  };

  const handleDismiss = () => {
    if (!dismissReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for dismissing this suggestion.",
        variant: "destructive"
      });
      return;
    }
    
    setSuggestions(suggestions.map(s => 
      s.id === selectedSuggestion.id ? { ...s, status: "Dismissed" } : s
    ));
    
    setDismissDialogOpen(false);
    toast({
      title: "Suggestion Dismissed",
      description: "Your feedback helps improve future AI suggestions.",
    });
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case "Compliance": return <Shield className="h-4 w-4" />;
      case "Proposal": return <FileText className="h-4 w-4" />;
      case "Contract": return <Briefcase className="h-4 w-4" />;
      case "Finance": return <DollarSign className="h-4 w-4" />;
      case "Operations": return <Settings className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
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

  const getConfidenceColor = (level) => {
    if (level >= 90) return "text-green-500";
    if (level >= 75) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <PageLayout>
      <PageGuide
        title="AI Suggestions"
        description="Review and act on AI-generated insights, compliance warnings, and optimization recommendations across your contracts and proposals."
        whenToUse="Check this page daily to stay ahead of compliance issues, optimize proposals, and catch anomalies."
        whatToDoNext="Review pending suggestions, accept them to create actionable tasks, or dismiss them with feedback to improve the AI."
        relatedRecords={[
          { title: "Compliance Dashboard", url: "/app/compliance" },
          { title: "Active Proposals", url: "/app/proposals" }
        ]}
        alerts={[
          { type: "info", message: "3 new high-confidence compliance suggestions require your attention." }
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {filteredSuggestions.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No suggestions found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later for new insights.</p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col md:flex-row">
                {/* Left color bar based on category */}
                <div className={`w-1.5 shrink-0 ${
                  suggestion.category === 'Compliance' ? 'bg-red-500' :
                  suggestion.category === 'Proposal' ? 'bg-blue-500' :
                  suggestion.category === 'Contract' ? 'bg-purple-500' :
                  suggestion.category === 'Finance' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1 bg-background">
                        {getCategoryIcon(suggestion.category)}
                        {suggestion.category}
                      </Badge>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Sparkles className={`h-4 w-4 ${getConfidenceColor(suggestion.confidenceLevel)}`} />
                      <span className={getConfidenceColor(suggestion.confidenceLevel)}>
                        {suggestion.confidenceLevel}% Confidence
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-2">{suggestion.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {suggestion.description}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded w-fit">
                    <Info className="h-3.5 w-3.5" />
                    <span>Source: {suggestion.sourceReference}</span>
                  </div>
                </div>
                
                {/* Actions Panel */}
                <div className="bg-muted/20 p-5 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center gap-3 md:w-48 shrink-0">
                  {suggestion.status === "Pending" ? (
                    <>
                      <Button onClick={() => handleAccept(suggestion.id)} className="w-full justify-start" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept & Create Task
                      </Button>
                      <Button onClick={() => handleReviewLater(suggestion.id)} variant="outline" className="w-full justify-start" size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Review Later
                      </Button>
                      <Button onClick={() => openDismissDialog(suggestion)} variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground">
                      {suggestion.status === "Accepted" ? (
                        <>
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2 opacity-50" />
                          <p>Suggestion Accepted</p>
                          <Button variant="link" size="sm" className="mt-2 h-auto p-0" onClick={() => toast({ title: "Feature coming soon" })}>
                            View Task <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-8 w-8 text-gray-400 mb-2 opacity-50" />
                          <p>Suggestion Dismissed</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
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
              <span className="font-medium">Suggestion:</span> {selectedSuggestion?.title}
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
            <Button variant="destructive" onClick={handleDismiss}>Dismiss Suggestion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
