import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { AlertCircle, ExternalLink, Loader2, Plus, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import OpportunityForm from "@/components/OpportunityForm";
import SmartIntakeOpportunity from "@/components/SmartIntakeOpportunity";
import SamImportPanel from "@/components/SamImportPanel";
import PageLayout from "@/components/PageLayout";
import LifecycleProgress from "@/components/LifecycleProgress";

export default function Opportunities() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSmartIntakeOpen, setIsSmartIntakeOpen] = useState(false);
  const [showImportTools, setShowImportTools] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("create") === "true") setIsSmartIntakeOpen(true);
  }, [searchString]);

  const {
    data: opportunities = [],
    isLoading,
    refetch: refetchOpportunities,
  } = trpc.opportunities.list.useQuery();

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    in_review: "bg-amber-100 text-amber-800",
    pursue: "bg-green-100 text-green-800",
    hold: "bg-gray-100 text-gray-800",
    no_pursue: "bg-red-100 text-red-800",
    moved_to_proposal: "bg-purple-100 text-purple-800",
    archived: "bg-slate-100 text-slate-800",
  };

  const newOpps = opportunities.filter((o) => o.status === "new").length;
  const inReviewOpps = opportunities.filter((o) => o.status === "in_review").length;
  const pursuingOpps = opportunities.filter((o) => o.status === "pursue").length;

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return (opportunities as any[])
      .filter((o) => o.dueDate && new Date(o.dueDate) >= now && new Date(o.dueDate) <= oneWeek)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [opportunities]);

  const overdueOpps = useMemo(() => {
    const now = new Date();
    return (opportunities as any[])
      .filter(
        (o) =>
          o.dueDate &&
          new Date(o.dueDate) < now &&
          o.status !== "no_pursue" &&
          o.status !== "moved_to_proposal" &&
          o.status !== "archived"
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [opportunities]);

  const attentionCount = overdueOpps.length + upcomingDeadlines.length + inReviewOpps;

  const filteredOpportunities = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return opportunities;
    return opportunities.filter((opp: any) =>
      [opp.title, opp.agency, opp.solicitation, opp.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [opportunities, searchTerm]);

  return (
    <PageLayout
      title="Opportunities"
      subtitle="Find, evaluate, and move the right opportunities into proposal development"
      label="Pipeline"
      summaryCards={[
        { label: "Total", value: opportunities.length },
        { label: "New", value: newOpps, color: "text-blue-600" },
        { label: "In Review", value: inReviewOpps, color: "text-amber-600" },
        { label: "Pursuing", value: pursuingOpps, color: "text-green-600" },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsSmartIntakeOpen(true)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Search className="mr-2 h-4 w-4" /> Find / Import
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Plus className="mr-2 h-4 w-4" /> New Opportunity
          </Button>
        </div>
      }
    >
      <LifecycleProgress currentPhase="opportunity" />

      {attentionCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-amber-950">Needs attention</h2>
                  <p className="text-sm text-amber-800">
                    PrimeContractorOS is surfacing only the pipeline items that may affect your next decision.
                  </p>
                </div>
                <span className="mt-2 w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 sm:mt-0">
                  {attentionCount} item{attentionCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {overdueOpps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate(`/app/opportunities/${overdueOpps[0].id}`)}
                    className="rounded-lg border border-red-200 bg-white p-3 text-left hover:bg-red-50"
                  >
                    <p className="text-sm font-semibold text-red-800">{overdueOpps.length} overdue</p>
                    <p className="mt-1 text-xs text-slate-600">Review the oldest overdue opportunity first.</p>
                  </button>
                )}
                {upcomingDeadlines.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate(`/app/opportunities/${upcomingDeadlines[0].id}`)}
                    className="rounded-lg border border-amber-200 bg-white p-3 text-left hover:bg-amber-50"
                  >
                    <p className="text-sm font-semibold text-amber-800">{upcomingDeadlines.length} due within 7 days</p>
                    <p className="mt-1 text-xs text-slate-600">Confirm requirements and proposal readiness early.</p>
                  </button>
                )}
                {inReviewOpps > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("in_review")}
                    className="rounded-lg border border-blue-200 bg-white p-3 text-left hover:bg-blue-50"
                  >
                    <p className="text-sm font-semibold text-blue-800">{inReviewOpps} awaiting a decision</p>
                    <p className="mt-1 text-xs text-slate-600">Review fit, risk, and missing information before deciding.</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-gray-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Find and capture opportunities</h2>
            <p className="mt-1 text-sm text-slate-600">
              Start with Smart Import for a SAM.gov URL, notice number, keyword, NAICS, PSC, agency, or other opportunity input.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsSmartIntakeOpen(true)}>
              <Search className="mr-2 h-4 w-4" /> Smart Import
            </Button>
            <Button variant="outline" onClick={() => setShowImportTools((value) => !value)}>
              {showImportTools ? "Hide advanced import" : "Advanced SAM.gov import"}
            </Button>
          </div>
        </div>

        {showImportTools && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <SamImportPanel onImportSuccess={() => refetchOpportunities()} />
          </div>
        )}
      </Card>

      <Card className="border-gray-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities by title, agency, solicitation, or status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {isLoading ? (
        <Card className="border-gray-200 bg-white p-12 text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-600">Loading opportunities...</p>
        </Card>
      ) : filteredOpportunities.length === 0 ? (
        <Card className="border-gray-200 bg-white p-8 text-center md:p-12">
          <Target className="mx-auto mb-4 h-14 w-14 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900">
            {searchTerm ? "No matching opportunities" : "Start your opportunity pipeline"}
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
            {searchTerm
              ? "Try a different search term or clear the search."
              : "Import from SAM.gov or create an opportunity manually. PrimeContractorOS will keep the record connected as it moves into proposal and contract work."}
          </p>
          {!searchTerm && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={() => setIsSmartIntakeOpen(true)}>
                <Search className="mr-2 h-4 w-4" /> Find / Import Opportunity
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Manually
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOpportunities.map((opp: any) => {
            const daysUntilDue = opp.dueDate
              ? Math.ceil((new Date(opp.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isUrgent = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

            return (
              <Card
                key={opp.id}
                onClick={() => navigate(`/app/opportunities/${opp.id}`)}
                className={`cursor-pointer border bg-white p-4 transition-shadow hover:shadow-md md:p-5 ${
                  isOverdue ? "border-red-300" : isUrgent ? "border-amber-300" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 truncate text-base font-semibold text-gray-900 md:text-lg">{opp.title}</h3>
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[opp.status || "new"]}`}>
                        {(opp.status || "new").replace(/_/g, " ")}
                      </span>
                      {isOverdue && <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Overdue</span>}
                      {isUrgent && !isOverdue && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{daysUntilDue}d left</span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-sm text-gray-600">{opp.agency || "Agency not yet identified"}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-xs text-gray-500">Solicitation</p>
                        <p className="truncate font-medium text-gray-900">{opp.solicitation || "Not captured"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due date</p>
                        <p className={`font-medium ${isOverdue ? "text-red-700" : isUrgent ? "text-amber-700" : "text-gray-900"}`}>
                          {opp.dueDate ? new Date(opp.dueDate).toLocaleDateString() : "Not captured"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="truncate font-medium text-gray-900">{opp.type || "Not captured"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Next step</p>
                        <p className="font-medium text-gray-900">
                          {opp.status === "pursue" ? "Prepare proposal" : opp.status === "in_review" ? "Make pursuit decision" : "Review opportunity"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 flex-shrink-0 text-gray-400" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <details className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-800">How this page works</summary>
        <div className="mt-3 space-y-2">
          <p>Use this page to build and triage the pipeline. Open a specific opportunity for deeper AI review, requirements, documents, fit, risk, teaming, and pursuit decisions.</p>
          <p>Background checks should stay quiet when everything is healthy. Important exceptions are surfaced in “Needs attention” so the page stays readable.</p>
        </div>
      </details>

      <SmartIntakeOpportunity
        open={isSmartIntakeOpen}
        onClose={() => setIsSmartIntakeOpen(false)}
        onCreated={() => {
          setIsSmartIntakeOpen(false);
          refetchOpportunities();
        }}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <OpportunityForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                refetchOpportunities();
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
