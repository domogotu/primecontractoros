import { useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, BookOpen, ExternalLink, Star, StarOff, Shield, Users, FileText,
  AlertTriangle, CheckCircle, Link2, ClipboardList, Plus, Filter, RotateCcw,
  BookMarked, Eye, ChevronDown, ChevronUp, Bookmark, ArrowRight, Info,
  Download, Sparkles, ListChecks
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { STARTER_CLAUSES, CLAUSE_CATEGORIES, type StarterClause } from "@/data/farDfarsStarterClauses";
import { trpc } from "@/lib/trpc";
import ClauseDetailDrawer from "./far-dfars/ClauseDetailDrawer";
import LinkToContractModal from "./far-dfars/LinkToContractModal";
import CreateTaskModal from "./far-dfars/CreateTaskModal";
import CreateComplianceItemModal from "./far-dfars/CreateComplianceItemModal";
import FlowdownNoteModal from "./far-dfars/FlowdownNoteModal";
import CustomClauseModal from "./far-dfars/CustomClauseModal";
import AIClausePanel from "./far-dfars/AIClausePanel";

// Merge DB clauses with starter clauses for display
function useClauseData() {
  const dbClausesQuery = trpc.farDfars.listClauses.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const bookmarksQuery = trpc.farDfars.listBookmarks.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const statsQuery = trpc.farDfars.getStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use DB clauses if available, otherwise fall back to starter data
  const clauses = useMemo(() => {
    if (dbClausesQuery.data && dbClausesQuery.data.length > 0) {
      return dbClausesQuery.data.map((c: any) => ({
        id: c.id,
        clauseNumber: c.clauseNumber,
        title: c.title,
        sourceType: c.sourceType,
        farPart: c.farPart || "",
        category: c.category || "",
        summary: c.summary || "",
        plainLanguageMeaning: c.plainLanguageMeaning || "",
        whyItMatters: c.whyItMatters || "",
        applicabilityNote: c.applicabilityNote || "",
        commonRecordsAffected: c.commonRecordsAffected || "",
        officialSourceUrl: c.officialSourceUrl || "",
        tags: c.tags || "",
        flowdownWatch: c.flowdownWatch || false,
        subcontractingWatch: c.subcontractingWatch || false,
        cybersecurityWatch: c.cybersecurityWatch || false,
        paymentWatch: c.paymentWatch || false,
        smallBusinessWatch: c.smallBusinessWatch || false,
        laborWatch: c.laborWatch || false,
        closeoutWatch: c.closeoutWatch || false,
        isCustom: c.isCustom || false,
      }));
    }
    // Fallback to starter data with synthetic IDs
    return STARTER_CLAUSES.map((c, idx) => ({
      id: idx + 1,
      ...c,
      isCustom: false,
    }));
  }, [dbClausesQuery.data]);

  const bookmarkedIds = useMemo(() => {
    if (bookmarksQuery.data) {
      return new Set(bookmarksQuery.data.map((b: any) => b.clauseId));
    }
    return new Set<number>();
  }, [bookmarksQuery.data]);

  const stats = statsQuery.data || {
    total: clauses.length,
    bookmarked: bookmarkedIds.size,
    linkedToContracts: 0,
    complianceItems: 0,
    flowdownWatch: clauses.filter(c => c.flowdownWatch).length,
    needsReview: 0,
  };

  return { clauses, bookmarkedIds, stats, refetchBookmarks: bookmarksQuery.refetch, refetchStats: statsQuery.refetch };
}

export default function FarReference() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [partFilter, setPartFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [applicabilityFilter, setApplicabilityFilter] = useState("all");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [localBookmarks, setLocalBookmarks] = useState<Set<number>>(new Set());
  
  // Modal states
  const [selectedClause, setSelectedClause] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showFlowdownModal, setShowFlowdownModal] = useState(false);
  const [showCustomClauseModal, setShowCustomClauseModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHowConnects, setShowHowConnects] = useState(false);

  const { clauses, bookmarkedIds, stats, refetchBookmarks, refetchStats } = useClauseData();
  const toggleBookmarkMutation = trpc.farDfars.toggleBookmark.useMutation({
    onSuccess: () => { refetchBookmarks(); refetchStats(); }
  });

  // Combine DB bookmarks with local state
  const allBookmarks = useMemo(() => {
    const combined = new Set(bookmarkedIds);
    localBookmarks.forEach(id => combined.add(id));
    return combined;
  }, [bookmarkedIds, localBookmarks]);

  const toggleBookmark = useCallback((clauseId: number) => {
    toggleBookmarkMutation.mutate({ clauseId }, {
      onError: () => {
        // Fallback to local state
        setLocalBookmarks(prev => {
          const next = new Set(prev);
          if (next.has(clauseId)) next.delete(clauseId);
          else next.add(clauseId);
          return next;
        });
      }
    });
  }, [toggleBookmarkMutation]);

  const filtered = useMemo(() => {
    return clauses.filter((clause: any) => {
      if (showBookmarkedOnly && !allBookmarks.has(clause.id)) return false;
      
      const matchesSearch = !search ||
        clause.clauseNumber.toLowerCase().includes(search.toLowerCase()) ||
        clause.title.toLowerCase().includes(search.toLowerCase()) ||
        clause.summary.toLowerCase().includes(search.toLowerCase()) ||
        clause.category.toLowerCase().includes(search.toLowerCase()) ||
        (clause.tags || "").toLowerCase().includes(search.toLowerCase()) ||
        (clause.applicabilityNote || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesSource = sourceFilter === "all" || clause.sourceType === sourceFilter;
      const matchesPart = partFilter === "all" || clause.farPart === partFilter;
      const matchesCategory = categoryFilter === "all" || clause.category === categoryFilter;
      
      let matchesApplicability = true;
      if (applicabilityFilter === "flowdown") matchesApplicability = clause.flowdownWatch;
      else if (applicabilityFilter === "cyber") matchesApplicability = clause.cybersecurityWatch;
      else if (applicabilityFilter === "small_business") matchesApplicability = clause.smallBusinessWatch;
      else if (applicabilityFilter === "payment") matchesApplicability = clause.paymentWatch;
      else if (applicabilityFilter === "labor") matchesApplicability = clause.laborWatch;
      else if (applicabilityFilter === "subcontracting") matchesApplicability = clause.subcontractingWatch;

      return matchesSearch && matchesSource && matchesPart && matchesCategory && matchesApplicability;
    });
  }, [clauses, search, sourceFilter, partFilter, categoryFilter, applicabilityFilter, showBookmarkedOnly, allBookmarks]);

  const resetFilters = () => {
    setSearch("");
    setSourceFilter("all");
    setPartFilter("all");
    setCategoryFilter("all");
    setApplicabilityFilter("all");
    setShowBookmarkedOnly(false);
  };

  const uniqueParts = useMemo(() => Array.from(new Set(clauses.map((c: any) => c.farPart).filter(Boolean))).sort(), [clauses]);
  const uniqueCategories = useMemo(() => Array.from(new Set(clauses.map((c: any) => c.category).filter(Boolean))).sort(), [clauses]);

  return (
    <PageLayout
      label="Compliance"
      title="FAR/DFARS Reference"
      subtitle="Clause Reference and Compliance Awareness Hub — Research common FAR and DFARS clauses, understand requirements, and link clause awareness to contracts, compliance items, flowdown reviews, and tasks."
      actions={
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}>
            <BookMarked className="w-4 h-4 mr-1" /> {showBookmarkedOnly ? "Show All" : "Bookmarked"}
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => { setCategoryFilter("Cybersecurity"); }}>
            <Shield className="w-4 h-4 mr-1" /> Cybersecurity
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => { setCategoryFilter("Small Business"); }}>
            <Users className="w-4 h-4 mr-1" /> Small Business
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => { setApplicabilityFilter("flowdown"); }}>
            <ArrowRight className="w-4 h-4 mr-1" /> Flowdown
          </Button>
          <Link href="/app/compliance">
            <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <ClipboardList className="w-4 h-4 mr-1" /> Compliance Matrix
            </Button>
          </Link>
          <Link href="/app/contract-hub">
            <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <FileText className="w-4 h-4 mr-1" /> Contract Hub
            </Button>
          </Link>
        </div>
      }
      summaryCards={[
        { label: "Total Clauses", value: stats.total || clauses.length },
        { label: "Bookmarked", value: stats.bookmarked || allBookmarks.size, color: "text-amber-600" },
        { label: "Linked to Contracts", value: stats.linkedToContracts },
        { label: "Compliance Items", value: stats.complianceItems },
        { label: "Flowdown Watch", value: stats.flowdownWatch || clauses.filter((c: any) => c.flowdownWatch).length, color: "text-purple-600" },
        { label: "Needs Review", value: stats.needsReview, color: "text-red-600" },
      ]}
    >
      {/* Reference Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Reference Notice</p>
            <p className="text-xs text-amber-700 mt-1">
              This library is for organization, education, and workflow support. Clause applicability must be confirmed against the actual solicitation, awarded contract, modifications, agency supplements, and contracting officer direction. PrimeContractorOS does not replace legal counsel, contracting officer guidance, or final compliance review.
            </p>
          </div>
        </div>
      </div>

      <PageGuide
        title="FAR/DFARS Clause Reference"
        description="Starter Reference Library — Searchable library of Federal Acquisition Regulation and Defense FAR Supplement clauses relevant to your contracts."
        whenToUse="Use this page when reviewing contract clauses, checking compliance requirements, researching regulations, linking clauses to contracts, or creating compliance/flowdown review items."
        whatToDoNext={[
          "Search for clauses referenced in your contract",
          "Bookmark frequently-used clauses for quick access",
          "Link clauses to contracts, compliance matrix items, or tasks",
          "Start flowdown reviews for subcontractor-relevant clauses",
          "Create compliance items or tasks from clause references",
          "Use AI Clause Assistance to research clause applicability",
        ]}
        relatedRecords={[
          { label: "Compliance Matrix", path: "/app/compliance" },
          { label: "Requirements", path: "/app/requirements" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Flowdown Review", path: "/app/flowdown-review" },
          { label: "Contract Hub", path: "/app/contract-hub" },
          { label: "Tasks", path: "/app/tasks" },
        ]}
      />

      {/* Search and Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by clause number, title, category, keyword, or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex-shrink-0">
              <Filter className="w-4 h-4 mr-1" /> Filters {showFilters ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetFilters} className="flex-shrink-0">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCustomClauseModal(true)} className="flex-shrink-0">
              <Plus className="w-4 h-4 mr-1" /> Add Custom
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="FAR">FAR</SelectItem>
                  <SelectItem value="DFARS">DFARS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={partFilter} onValueChange={setPartFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="FAR Part" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parts</SelectItem>
                  {uniqueParts.map((part: string) => (
                    <SelectItem key={part} value={part}>{part}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={applicabilityFilter} onValueChange={setApplicabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Applicability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applicability</SelectItem>
                  <SelectItem value="flowdown">Flowdown Watch</SelectItem>
                  <SelectItem value="cyber">Cybersecurity</SelectItem>
                  <SelectItem value="small_business">Small Business</SelectItem>
                  <SelectItem value="payment">Payment Related</SelectItem>
                  <SelectItem value="labor">Labor/Wage</SelectItem>
                  <SelectItem value="subcontracting">Subcontracting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count and AI panel toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filtered.length}</span> of {clauses.length} clauses
          {showBookmarkedOnly && " (bookmarked only)"}
        </p>
        <Button variant="outline" size="sm" onClick={() => setShowAIPanel(!showAIPanel)}>
          <Sparkles className="w-4 h-4 mr-1" /> AI Clause Assistance
        </Button>
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <AIClausePanel
          selectedClause={selectedClause}
          onClose={() => setShowAIPanel(false)}
        />
      )}

      {/* Clause Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Clauses Found</h3>
              <p className="text-sm text-slate-500 mb-4">No clauses matched your search or filters.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCustomClauseModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Custom Reference
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Try searching by clause number, topic (cybersecurity, payment, subcontracting, SAM, closeout), or keyword.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((clause: any) => (
            <Card key={clause.id} className="hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <Badge variant="outline" className={clause.sourceType === "DFARS" ? "border-purple-300 text-purple-700 text-xs" : "border-blue-300 text-blue-700 text-xs"}>
                        {clause.sourceType} {clause.clauseNumber}
                      </Badge>
                      {clause.category && CLAUSE_CATEGORIES[clause.category] && (
                        <Badge variant="outline" className={`text-xs ${CLAUSE_CATEGORIES[clause.category].color}`}>
                          {clause.category}
                        </Badge>
                      )}
                      {clause.flowdownWatch && (
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">Flowdown Watch</Badge>
                      )}
                      {clause.cybersecurityWatch && (
                        <Badge variant="outline" className="text-xs border-red-200 text-red-600">Cyber</Badge>
                      )}
                      {clause.smallBusinessWatch && (
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">SB</Badge>
                      )}
                      {clause.paymentWatch && (
                        <Badge variant="outline" className="text-xs border-amber-200 text-amber-600">Payment</Badge>
                      )}
                      {allBookmarks.has(clause.id) && (
                        <Badge variant="outline" className="text-xs border-amber-300 text-amber-600">
                          <Star className="w-3 h-3 mr-0.5 fill-amber-500" /> Bookmarked
                        </Badge>
                      )}
                      {clause.isCustom && (
                        <Badge variant="outline" className="text-xs border-green-200 text-green-600">Custom</Badge>
                      )}
                    </div>
                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 text-sm">{clause.title}</h3>
                    {/* Summary */}
                    <p className="text-sm text-slate-600 mt-1">{clause.summary}</p>
                    {/* Why it matters */}
                    {clause.whyItMatters && (
                      <p className="text-xs text-slate-500 mt-1.5">
                        <span className="font-medium text-slate-600">Why it matters:</span> {clause.whyItMatters}
                      </p>
                    )}
                    {/* Applicability */}
                    {clause.applicabilityNote && (
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-medium">Applicability:</span> {clause.applicabilityNote}
                      </p>
                    )}
                    {/* Common records affected */}
                    {clause.commonRecordsAffected && (
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-medium">Records affected:</span> {clause.commonRecordsAffected}
                      </p>
                    )}
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setSelectedClause(clause); setShowDetail(true); }}>
                        <Eye className="w-3 h-3 mr-1" /> Detail
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setSelectedClause(clause); setShowLinkModal(true); }}>
                        <Link2 className="w-3 h-3 mr-1" /> Link to Contract
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setSelectedClause(clause); setShowComplianceModal(true); }}>
                        <ClipboardList className="w-3 h-3 mr-1" /> Compliance
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setSelectedClause(clause); setShowTaskModal(true); }}>
                        <ListChecks className="w-3 h-3 mr-1" /> Task
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setSelectedClause(clause); setShowFlowdownModal(true); }}>
                        <ArrowRight className="w-3 h-3 mr-1" /> Flowdown
                      </Button>
                    </div>
                  </div>
                  {/* Right side actions */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBookmark(clause.id)}
                      className="h-8 w-8"
                      title={allBookmarks.has(clause.id) ? "Remove bookmark" : "Bookmark"}
                    >
                      {allBookmarks.has(clause.id) ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setSelectedClause(clause); setShowDetail(true); }}
                      title="View detail"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                    </Button>
                    {clause.officialSourceUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(clause.officialSourceUrl, "_blank")}
                        title="Open official source"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* How This Page Connects section */}
      <Card className="mt-6">
        <CardHeader className="cursor-pointer" onClick={() => setShowHowConnects(!showHowConnects)}>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              How FAR/DFARS References Connect to Your Workspace
            </span>
            {showHowConnects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        {showHowConnects && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Contracts</h4>
                <p className="text-xs text-slate-500">Clauses can be linked to awarded contracts, but the awarded contract remains the governing source.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Compliance Matrix</h4>
                <p className="text-xs text-slate-500">Clauses can become draft compliance items after review.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Contract Hub</h4>
                <p className="text-xs text-slate-500">Approved clause findings can support requirements, deliverables, deadlines, tasks, and alerts.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Files</h4>
                <p className="text-xs text-slate-500">Clause applicability should be tied to source files, awarded contracts, modifications, and evidence.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Subcontractors</h4>
                <p className="text-xs text-slate-500">Certain clauses may require flowdown awareness, subcontractor review, or consent-to-subcontract review.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Invoices & Payments</h4>
                <p className="text-xs text-slate-500">Payment clauses may support proper-invoice checks, billing terms, overdue follow-up, and payment matching.</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modals */}
      {showDetail && selectedClause && (
        <ClauseDetailDrawer
          clause={selectedClause}
          isBookmarked={allBookmarks.has(selectedClause.id)}
          onClose={() => setShowDetail(false)}
          onBookmark={() => toggleBookmark(selectedClause.id)}
          onLinkToContract={() => { setShowDetail(false); setShowLinkModal(true); }}
          onCreateTask={() => { setShowDetail(false); setShowTaskModal(true); }}
          onCreateCompliance={() => { setShowDetail(false); setShowComplianceModal(true); }}
          onStartFlowdown={() => { setShowDetail(false); setShowFlowdownModal(true); }}
        />
      )}
      {showLinkModal && selectedClause && (
        <LinkToContractModal
          clause={selectedClause}
          onClose={() => setShowLinkModal(false)}
        />
      )}
      {showTaskModal && selectedClause && (
        <CreateTaskModal
          clause={selectedClause}
          onClose={() => setShowTaskModal(false)}
        />
      )}
      {showComplianceModal && selectedClause && (
        <CreateComplianceItemModal
          clause={selectedClause}
          onClose={() => setShowComplianceModal(false)}
        />
      )}
      {showFlowdownModal && selectedClause && (
        <FlowdownNoteModal
          clause={selectedClause}
          onClose={() => setShowFlowdownModal(false)}
        />
      )}
      {showCustomClauseModal && (
        <CustomClauseModal
          onClose={() => setShowCustomClauseModal(false)}
        />
      )}
    </PageLayout>
  );
}
