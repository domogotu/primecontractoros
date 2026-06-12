import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Search, FileText, ExternalLink, Loader2 } from "lucide-react";
import ProposalForm from "@/components/ProposalForm";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import LifecycleProgress from "@/components/LifecycleProgress";
import AIStatusPanel, { AICheck } from "@/components/AIStatusPanel";
import WhatsNext, { NextAction } from "@/components/WhatsNext";
import ValidationWarnings, { ValidationWarning } from "@/components/ValidationWarnings";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

export default function Proposals() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Open create dialog when navigated here with ?create=true (e.g. from CommandPalette)
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("create") === "true") {
      setIsCreateDialogOpen(true);
    }
  }, [searchString]);

  const { data: proposals = [], isLoading } = trpc.proposals.list.useQuery();

  const filteredProposals = proposals.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    under_review: "bg-amber-100 text-amber-800",
    submitted: "bg-purple-100 text-purple-800",
    won: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
    withdrawn: "bg-slate-100 text-slate-800",
    archived: "bg-slate-200 text-slate-800",
  };

  // Pipeline metrics
  const drafts = proposals.filter((p) => p.status === "draft").length;
  const inProgress = proposals.filter((p) => p.status === "in_progress").length;
  const underReview = proposals.filter((p) => p.status === "under_review").length;
  const submitted = proposals.filter((p) => p.status === "submitted").length;
  const won = proposals.filter((p) => p.status === "won").length;

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return (proposals as any[])
      .filter((p) => p.dueDate && new Date(p.dueDate) >= now && new Date(p.dueDate) <= oneWeek && p.status !== "submitted" && p.status !== "won" && p.status !== "lost")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [proposals]);

  // Overdue proposals
  const overdueProposals = useMemo(() => {
    const now = new Date();
    return (proposals as any[])
      .filter((p) => p.dueDate && new Date(p.dueDate) < now && p.status !== "submitted" && p.status !== "won" && p.status !== "lost" && p.status !== "withdrawn" && p.status !== "archived")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [proposals]);

  // AI Status Checks
  const aiChecks = useMemo((): AICheck[] => {
    const checks: AICheck[] = [];

    checks.push({
      id: "submission-readiness",
      name: "Submission Readiness",
      status: underReview > 0 ? "verified" : inProgress > 0 ? "flagged" : "pending",
      message: underReview > 0 ? `${underReview} proposal(s) ready for final review` : inProgress > 0 ? `${inProgress} proposal(s) still in development` : "No active proposals",
      severity: underReview > 0 ? "info" : inProgress > 0 ? "warning" : "info",
    });

    checks.push({
      id: "deadline-compliance",
      name: "Deadline Compliance",
      status: overdueProposals.length > 0 ? "flagged" : upcomingDeadlines.length > 0 ? "flagged" : "verified",
      message: overdueProposals.length > 0 ? `${overdueProposals.length} proposal(s) past submission deadline` : upcomingDeadlines.length > 0 ? `${upcomingDeadlines.length} deadline(s) within 7 days` : "All deadlines on track",
      severity: overdueProposals.length > 0 ? "error" : upcomingDeadlines.length > 0 ? "warning" : "info",
    });

    checks.push({
      id: "draft-proposals",
      name: "Stalled Drafts",
      status: drafts > 0 ? "flagged" : "verified",
      message: drafts > 0 ? `${drafts} proposal(s) still in draft — advance or archive them` : "No stalled drafts",
      severity: drafts > 0 ? "warning" : "info",
    });

    checks.push({
      id: "win-rate",
      name: "Win Rate Tracking",
      status: won > 0 ? "verified" : submitted > 0 ? "flagged" : "pending",
      message: won > 0 ? `${won} proposal(s) won` : submitted > 0 ? `${submitted} awaiting decision` : "No submissions yet",
      severity: "info",
    });

    return checks;
  }, [underReview, inProgress, overdueProposals, upcomingDeadlines, drafts, won, submitted]);

  // Next Best Steps
  const nextSteps = useMemo((): NextAction[] => {
    const steps: NextAction[] = [];

    if (overdueProposals.length > 0) {
      steps.push({
        id: "overdue",
        title: `${overdueProposals.length} Overdue Proposal${overdueProposals.length > 1 ? "s" : ""}`,
        description: "These proposals are past their submission deadline. Submit, withdraw, or archive them.",
        priority: "high",
        action: {
          label: "Address",
          onClick: () => navigate(`/app/proposals/${overdueProposals[0].id}`),
        },
      });
    }

    if (upcomingDeadlines.length > 0) {
      steps.push({
        id: "upcoming-deadlines",
        title: `${upcomingDeadlines.length} Deadline${upcomingDeadlines.length > 1 ? "s" : ""} in 7 Days`,
        description: "Finalize and submit these proposals before their deadlines",
        priority: "high",
        action: {
          label: "Review",
          onClick: () => navigate(`/app/proposals/${upcomingDeadlines[0].id}`),
        },
      });
    }

    if (underReview > 0) {
      steps.push({
        id: "review",
        title: `${underReview} Proposal${underReview > 1 ? "s" : ""} Under Review`,
        description: "Complete final review and submit",
        priority: "medium",
        action: {
          label: "Review",
          onClick: () => setSearchTerm("under_review"),
        },
      });
    }

    if (inProgress > 0) {
      steps.push({
        id: "in-progress",
        title: `${inProgress} Proposal${inProgress > 1 ? "s" : ""} In Progress`,
        description: "Continue developing these proposals toward submission",
        priority: "medium",
        action: {
          label: "Continue",
          onClick: () => setSearchTerm("in_progress"),
        },
      });
    }

    if (drafts > 0) {
      steps.push({
        id: "drafts",
        title: `${drafts} Draft Proposal${drafts > 1 ? "s" : ""}`,
        description: "Advance drafts to in-progress or archive if no longer needed",
        priority: "low",
        action: {
          label: "Open",
          onClick: () => setSearchTerm("draft"),
        },
      });
    }

    if (proposals.length === 0) {
      steps.push({
        id: "create-first",
        title: "Create Your First Proposal",
        description: "Start building a proposal from a pursued opportunity or standalone",
        priority: "high",
        action: {
          label: "Create",
          onClick: () => setIsCreateDialogOpen(true),
        },
      });
    }

    return steps.slice(0, 5);
  }, [overdueProposals, upcomingDeadlines, underReview, inProgress, drafts, proposals.length, navigate]);

  // Validation Warnings
  const validationWarnings = useMemo((): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    if (overdueProposals.length > 0) {
      warnings.push({
        id: "overdue",
        message: `${overdueProposals.length} proposal(s) are past their submission deadline. Take action immediately.`,
        type: "error",
        dismissible: true,
      });
    }

    if (upcomingDeadlines.length > 0) {
      warnings.push({
        id: "deadlines",
        message: `${upcomingDeadlines.length} proposal(s) have deadlines within 7 days. Ensure they are ready for submission.`,
        type: "warning",
        dismissible: true,
      });
    }

    return warnings;
  }, [overdueProposals, upcomingDeadlines]);

  return (
    <PageLayout
      title="Proposals"
      subtitle="Build, review, and submit proposals for government contracting opportunities"
      label="Proposals"
      summaryCards={[
        { label: "Total", value: proposals.length },
        { label: "In Progress", value: inProgress, color: "text-blue-600" },
        { label: "Submitted", value: submitted, color: "text-purple-600" },
        { label: "Won", value: won, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Proposal
        </Button>
      }
    >
      <PageGuide
        title="Proposals Pipeline"
        description="Manage your proposal pipeline from draft through submission and decision. Each proposal moves through: Draft → In Progress → Under Review → Submitted → Won/Lost."
        whenToUse="When building, reviewing, or tracking proposals for government contracts."
        whatToDoNext={["Create proposals from pursued opportunities", "Build proposal outlines and compliance matrices", "Track submission deadlines", "Record win/loss outcomes and lessons"]}
        relatedRecords={[{ label: "Opportunities", path: "/app/opportunities" }, { label: "Contracts", path: "/app/contracts" }, { label: "Templates", path: "/app/templates" }]}
      />

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && <ValidationWarnings warnings={validationWarnings} />}

      {/* Lifecycle Progress */}
      <LifecycleProgress currentPhase="proposal" />

      {/* AI Status Panel */}
      <AIStatusPanel checks={aiChecks} title="PROPOSAL PIPELINE STATUS" />

      {/* What's Next */}
      {nextSteps.length > 0 && <WhatsNext actions={nextSteps} />}

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="proposals" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="proposals" />

      {/* Search */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals by title..."
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
          <p className="text-gray-600">Loading proposals...</p>
        </Card>
      ) : filteredProposals.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Proposals Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search" : "Create your first proposal to start building your submissions."}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Your First Proposal
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProposals.map((proposal) => {
            const daysUntilDue = proposal.dueDate ? Math.ceil((new Date(proposal.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && proposal.status !== "submitted" && proposal.status !== "won" && proposal.status !== "lost";
            const isUrgent = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

            return (
              <Card
                key={proposal.id}
                onClick={() => navigate(`/app/proposals/${proposal.id}`)}
                className={`bg-white border p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  isOverdue ? "border-red-300 bg-red-50" : isUrgent ? "border-amber-300 bg-amber-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{proposal.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[proposal.status || "draft"]}`}>
                        {(proposal.status || "draft").replace(/_/g, " ")}
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Framework</p>
                        <p className="font-medium text-gray-900 truncate">{proposal.framework || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p className={`font-medium ${isOverdue ? "text-red-700" : isUrgent ? "text-amber-700" : "text-gray-900"}`}>
                          {proposal.dueDate ? new Date(proposal.dueDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Opportunity</p>
                        <p className="font-medium text-gray-900 truncate">{proposal.opportunityId ? `#${proposal.opportunityId}` : "Standalone"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">
                          {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0 hidden sm:block" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <ProposalForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
      <PageGuidancePanel
        pageKey="proposals"
        title="Proposals Help"
        description="Manage your proposal pipeline. Each proposal is linked to an opportunity. Track status from draft through submission. When won, convert to a contract."
        whatToDoNext={[
          "Create proposals from pursued opportunities",
          "Track proposal status through the submission lifecycle",
          "Mark proposals as won or lost after decision",
          "Convert won proposals to contracts"
        ]}
        helpArticleSlug="what-is-a-proposal"
        glossaryTerms={["proposal", "opportunity", "solicitation"]}
      />
    </PageLayout>
  );
}
