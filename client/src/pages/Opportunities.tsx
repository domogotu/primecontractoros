import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Target, ExternalLink, Loader2, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import OpportunityForm from "@/components/OpportunityForm";
import SmartIntakeOpportunity from "@/components/SmartIntakeOpportunity";
import SamImportPanel from "@/components/SamImportPanel";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import EmptyStateGuide from "@/components/EmptyStateGuide";
import LifecycleProgress, { LifecyclePhase } from "@/components/LifecycleProgress";
import AIStatusPanel, { AICheck } from "@/components/AIStatusPanel";
import WhatsNext, { NextAction } from "@/components/WhatsNext";
import ValidationWarnings, { ValidationWarning } from "@/components/ValidationWarnings";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";
import FieldHelp from "@/components/FieldHelp";
import { useMemo } from "react";

export default function Opportunities() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSmartIntakeOpen, setIsSmartIntakeOpen] = useState(false);

  // Open create dialog when navigated here with ?create=true (e.g. from CommandPalette)
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("create") === "true") {
      setIsSmartIntakeOpen(true);
    }
  }, [searchString]);

  const { data: opportunities = [], isLoading, refetch: refetchOpportunities } = trpc.opportunities.list.useQuery();

  const filteredOpportunities = opportunities.filter((opp) =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opp.agency?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    in_review: "bg-amber-100 text-amber-800",
    pursue: "bg-green-100 text-green-800",
    hold: "bg-gray-100 text-gray-800",
    no_pursue: "bg-red-100 text-red-800",
    moved_to_proposal: "bg-purple-100 text-purple-800",
    archived: "bg-slate-100 text-slate-800",
  };

  // Pipeline metrics
  const newOpps = opportunities.filter((o) => o.status === "new").length;
  const inReviewOpps = opportunities.filter((o) => o.status === "in_review").length;
  const pursuingOpps = opportunities.filter((o) => o.status === "pursue").length;
  const holdOpps = opportunities.filter((o) => o.status === "hold").length;
  const noPursueOpps = opportunities.filter((o) => o.status === "no_pursue").length;
  const movedToProposalOpps = opportunities.filter((o) => o.status === "moved_to_proposal").length;

  // Upcoming deadlines in next 7 days
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return (opportunities as any[])
      .filter((o) => o.dueDate && new Date(o.dueDate) >= now && new Date(o.dueDate) <= oneWeek)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [opportunities]);

  // Overdue opportunities
  const overdueOpps = useMemo(() => {
    const now = new Date();
    return (opportunities as any[])
      .filter((o) => o.dueDate && new Date(o.dueDate) < now && o.status !== "no_pursue" && o.status !== "moved_to_proposal" && o.status !== "archived")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [opportunities]);

  // AI Status Checks
  const aiChecks = useMemo((): AICheck[] => {
    const checks: AICheck[] = [];

    checks.push({
      id: "pipeline-health",
      name: "Pipeline Health",
      status: pursuingOpps > 0 ? "verified" : "flagged",
      message: pursuingOpps > 0 ? `${pursuingOpps} opportunity(ies) being actively pursued` : "No opportunities in pursuit status. Build your pipeline.",
      severity: pursuingOpps > 0 ? "info" : "warning",
    });

    checks.push({
      id: "pending-decisions",
      name: "Pending Decisions",
      status: inReviewOpps > 0 ? "flagged" : "verified",
      message: inReviewOpps > 0 ? `${inReviewOpps} opportunity(ies) awaiting evaluation decision` : "All opportunities have decisions",
      severity: inReviewOpps > 0 ? "warning" : "info",
    });

    checks.push({
      id: "upcoming-deadlines",
      name: "Upcoming Deadlines",
      status: upcomingDeadlines.length > 0 ? "flagged" : "verified",
      message: upcomingDeadlines.length > 0 ? `${upcomingDeadlines.length} deadline(s) in next 7 days` : "No critical deadlines",
      severity: upcomingDeadlines.length > 0 ? "warning" : "info",
    });

    checks.push({
      id: "overdue-items",
      name: "Overdue Opportunities",
      status: overdueOpps.length > 0 ? "flagged" : "verified",
      message: overdueOpps.length > 0 ? `${overdueOpps.length} opportunity(ies) past due date` : "No overdue opportunities",
      severity: overdueOpps.length > 0 ? "error" : "info",
    });

    return checks;
  }, [pursuingOpps, inReviewOpps, upcomingDeadlines, overdueOpps]);

  // Next Best Steps
  const nextSteps = useMemo((): NextAction[] => {
    const steps: NextAction[] = [];

    if (newOpps > 0) {
      steps.push({
        id: "review-new",
        title: `${newOpps} New Opportunity${newOpps > 1 ? "ies" : ""}`,
        description: "Review new opportunities and make pursue/hold/no-pursue decisions",
        priority: "high",
        action: {
          label: "Review",
          onClick: () => setSearchTerm("new"),
        },
      });
    }

    if (inReviewOpps > 0) {
      steps.push({
        id: "decide-review",
        title: `${inReviewOpps} Awaiting Decision`,
        description: "Make pursue/hold/no-pursue decisions on opportunities in review",
        priority: "high",
        action: {
          label: "Decide",
          onClick: () => setSearchTerm("in_review"),
        },
      });
    }

    if (overdueOpps.length > 0) {
      steps.push({
        id: "overdue",
        title: `${overdueOpps.length} Overdue Opportunity${overdueOpps.length > 1 ? "ies" : ""}`,
        description: "Address overdue opportunities — archive or make decision",
        priority: "high",
        action: {
          label: "Address",
          onClick: () => navigate(`/app/opportunities/${overdueOpps[0].id}`),
        },
      });
    }

    if (upcomingDeadlines.length > 0) {
      steps.push({
        id: "upcoming",
        title: `${upcomingDeadlines.length} Deadline${upcomingDeadlines.length > 1 ? "s" : ""} in 7 Days`,
        description: "Prepare for upcoming proposal deadlines",
        priority: "medium",
        action: {
          label: "Prepare",
          onClick: () => navigate(`/app/opportunities/${upcomingDeadlines[0].id}`),
        },
      });
    }

    if (pursuingOpps > 0) {
      steps.push({
        id: "pursue",
        title: `Convert to Proposals`,
        description: `Move ${pursuingOpps} pursued opportunity(ies) to proposal development`,
        priority: "medium",
        action: {
          label: "Convert",
          onClick: () => navigate("/app/proposals"),
        },
      });
    }

    if (opportunities.length === 0) {
      steps.push({
        id: "add-first",
        title: "Build Your Pipeline",
        description: "Add your first opportunity from SAM.gov or a tip",
        priority: "high",
        action: {
          label: "Add Opportunity",
          onClick: () => setIsCreateDialogOpen(true),
        },
      });
    }

    return steps.slice(0, 6);
  }, [newOpps, inReviewOpps, overdueOpps, upcomingDeadlines, pursuingOpps, opportunities.length, navigate]);

  // Validation Warnings
  const validationWarnings = useMemo((): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    if (overdueOpps.length > 0) {
      warnings.push({
        id: "overdue",
        message: `${overdueOpps.length} opportunity(ies) are past their due date. Archive or make a decision immediately.`,
        type: "error",
        dismissible: true,
      });
    }

    if (inReviewOpps > 0) {
      warnings.push({
        id: "pending-decisions",
        message: `${inReviewOpps} opportunity(ies) are awaiting your pursue/hold/no-pursue decision.`,
        type: "warning",
        dismissible: true,
      });
    }

    return warnings;
  }, [overdueOpps, inReviewOpps]);

  return (
    <PageLayout
      title="Opportunities"
      subtitle="Track and review potential government contracting opportunities from discovery to decision"
      label="Pipeline"
      summaryCards={[
        { label: "Total", value: opportunities.length },
        { label: "New", value: newOpps, color: "text-blue-600" },
        { label: "In Review", value: inReviewOpps, color: "text-amber-600" },
        { label: "Pursuing", value: pursuingOpps, color: "text-green-600" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button onClick={() => setIsSmartIntakeOpen(true)} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
            <Search className="w-4 h-4 mr-2" /> Smart Import
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Opportunity
          </Button>
        </div>
      }
    >
      <PageGuide
        title="Opportunities Pipeline"
        description="Track and manage government contracting opportunities from discovery to decision."
        whenToUse="When you find a new opportunity on SAM.gov, receive a tip, or need to evaluate your pipeline."
        whatToDoNext={["Add new opportunities as you discover them", "Evaluate each opportunity with pursue/hold/no-pursue decision", "Convert pursued opportunities to proposals", "Review AI recommendations for opportunity fit"]}
        relatedRecords={[{ label: "Proposals", path: "/app/proposals" }, { label: "Contacts", path: "/app/contacts" }, { label: "Files", path: "/app/files" }]}
      />

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <ValidationWarnings warnings={validationWarnings} />
      )}

      {/* Lifecycle Progress */}
      <LifecycleProgress currentPhase="opportunity" />

      {/* AI Status Panel */}
      <AIStatusPanel checks={aiChecks} title="OPPORTUNITY PIPELINE STATUS" />

      {/* What's Next */}
      <WhatsNext actions={nextSteps} />

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="opportunities" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="opportunities" />

      {/* SAM.gov Import Panel */}
      <SamImportPanel onImportSuccess={() => { refetchOpportunities(); }} />

      {/* Search */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, agency, or solicitation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Loading opportunities...</p>
        </Card>
      ) : filteredOpportunities.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Opportunities Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search" : "Create your first opportunity to build your pipeline."}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Opportunity
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOpportunities.map((opp) => {
            const daysUntilDue = opp.dueDate ? Math.ceil((new Date(opp.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isUrgent = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

            return (
              <Card
                key={opp.id}
                onClick={() => navigate(`/app/opportunities/${opp.id}`)}
                className={`bg-white border p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  isOverdue ? "border-red-300 bg-red-50" : isUrgent ? "border-amber-300 bg-amber-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{opp.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[opp.status || "new"]}`}>
                        {(opp.status || "new").replace(/_/g, " ")}
                      </span>
                      {isOverdue && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 whitespace-nowrap">
                          OVERDUE
                        </span>
                      )}
                      {isUrgent && !isOverdue && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 whitespace-nowrap">
                          {daysUntilDue}d LEFT
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Agency</p>
                        <p className="font-medium text-gray-900 truncate">{opp.agency || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Solicitation</p>
                        <p className="font-medium text-gray-900 truncate">{opp.solicitation || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p className={`font-medium ${isOverdue ? "text-red-700" : isUrgent ? "text-amber-700" : "text-gray-900"}`}>
                          {opp.dueDate ? new Date(opp.dueDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-900 truncate">{opp.type || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Smart Intake Modal */}
      <SmartIntakeOpportunity
        open={isSmartIntakeOpen}
        onClose={() => setIsSmartIntakeOpen(false)}
        onCreated={() => setIsSmartIntakeOpen(false)}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <OpportunityForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
      <PageGuidancePanel
        pageKey="opportunities"
        title="Opportunities Help"
        description="Track and evaluate government contracting opportunities. Import from SAM.gov or create manually. Review each opportunity to make a pursue/no-pursue decision."
        whatToDoNext={[
          "Import opportunities from SAM.gov using the Import button",
          "Review each opportunity's NAICS, set-aside, and due date",
          "Make a go/no-go decision for each opportunity",
          "Convert pursued opportunities to proposals"
        ]}
        helpArticleSlug="what-is-an-opportunity"
        glossaryTerms={["opportunity", "solicitation", "set-aside", "naics"]}
      />
    </PageLayout>
  );
}
