import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Search, FileCheck, ExternalLink, Loader2 } from "lucide-react";
import ContractForm from "@/components/ContractForm";
import SmartIntakeContract from "@/components/SmartIntakeContract";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import LifecycleProgress from "@/components/LifecycleProgress";
import AIStatusPanel, { AICheck } from "@/components/AIStatusPanel";
import WhatsNext, { NextAction } from "@/components/WhatsNext";
import ValidationWarnings, { ValidationWarning } from "@/components/ValidationWarnings";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

export default function Contracts() {
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

  const { data: contracts = [], isLoading } = trpc.contracts.list.useQuery();

  const filteredContracts = contracts.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    in_performance: "bg-blue-100 text-blue-800",
    closeout: "bg-amber-100 text-amber-800",
    closed: "bg-slate-100 text-slate-800",
    terminated: "bg-red-100 text-red-800",
  };

  // Metrics
  const activeContracts = contracts.filter((c) => c.status === "active" || c.status === "modification").length;
  const closeoutContracts = contracts.filter((c) => c.status === "closeout").length;
  const draftContracts = contracts.filter((c) => c.status === "setup").length;

  // Contracts ending soon (within 30 days)
  const endingSoon = useMemo(() => {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return (contracts as any[])
      .filter((c) => c.endDate && new Date(c.endDate) >= now && new Date(c.endDate) <= thirtyDays && c.status !== "closed" && c.status !== "terminated")
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [contracts]);

  // Expired contracts still not closed
  const expiredNotClosed = useMemo(() => {
    const now = new Date();
    return (contracts as any[])
      .filter((c) => c.endDate && new Date(c.endDate) < now && c.status !== "closed" && c.status !== "terminated")
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [contracts]);

  // AI Status Checks
  const aiChecks = useMemo((): AICheck[] => {
    const checks: AICheck[] = [];

    checks.push({
      id: "active-performance",
      name: "Active Contracts",
      status: activeContracts > 0 ? "verified" : "pending",
      message: activeContracts > 0 ? `${activeContracts} contract(s) in active performance` : "No active contracts",
      severity: "info",
    });

    checks.push({
      id: "expiring-contracts",
      name: "Expiring Contracts",
      status: endingSoon.length > 0 ? "flagged" : "verified",
      message: endingSoon.length > 0 ? `${endingSoon.length} contract(s) ending within 30 days` : "No contracts expiring soon",
      severity: endingSoon.length > 0 ? "warning" : "info",
    });

    checks.push({
      id: "expired-not-closed",
      name: "Expired Contracts",
      status: expiredNotClosed.length > 0 ? "flagged" : "verified",
      message: expiredNotClosed.length > 0 ? `${expiredNotClosed.length} expired contract(s) not yet closed out` : "All expired contracts properly closed",
      severity: expiredNotClosed.length > 0 ? "error" : "info",
    });

    checks.push({
      id: "closeout-pending",
      name: "Closeout Queue",
      status: closeoutContracts > 0 ? "flagged" : "verified",
      message: closeoutContracts > 0 ? `${closeoutContracts} contract(s) in closeout process` : "No pending closeouts",
      severity: closeoutContracts > 0 ? "warning" : "info",
    });

    return checks;
  }, [activeContracts, endingSoon, expiredNotClosed, closeoutContracts]);

  // Next Steps
  const nextSteps = useMemo((): NextAction[] => {
    const steps: NextAction[] = [];

    if (expiredNotClosed.length > 0) {
      steps.push({
        id: "close-expired",
        title: `${expiredNotClosed.length} Expired Contract${expiredNotClosed.length > 1 ? "s" : ""} Need Closeout`,
        description: "These contracts have ended but are not formally closed. Begin closeout process.",
        priority: "high",
        action: {
          label: "Start Closeout",
          onClick: () => navigate(`/app/contracts/${expiredNotClosed[0].id}`),
        },
      });
    }

    if (endingSoon.length > 0) {
      steps.push({
        id: "ending-soon",
        title: `${endingSoon.length} Contract${endingSoon.length > 1 ? "s" : ""} Ending Within 30 Days`,
        description: "Prepare for contract end — review deliverables, final invoices, and closeout readiness",
        priority: "high",
        action: {
          label: "Review",
          onClick: () => navigate(`/app/contracts/${endingSoon[0].id}`),
        },
      });
    }

    if (closeoutContracts > 0) {
      steps.push({
        id: "closeout",
        title: `${closeoutContracts} Contract${closeoutContracts > 1 ? "s" : ""} in Closeout`,
        description: "Complete closeout steps: final deliverables, invoicing, and documentation",
        priority: "medium",
        action: {
          label: "Continue",
          onClick: () => setSearchTerm("closeout"),
        },
      });
    }

    if (draftContracts > 0) {
      steps.push({
        id: "drafts",
        title: `${draftContracts} Draft Contract${draftContracts > 1 ? "s" : ""}`,
        description: "Complete contract setup — add details, requirements, and activate",
        priority: "medium",
        action: {
          label: "Complete Setup",
          onClick: () => setSearchTerm("draft"),
        },
      });
    }

    if (contracts.length === 0) {
      steps.push({
        id: "create-first",
        title: "Add Your First Contract",
        description: "Create a contract record after winning a proposal or receiving an award",
        priority: "high",
        action: {
          label: "Add Contract",
          onClick: () => setIsCreateDialogOpen(true),
        },
      });
    }

    return steps.slice(0, 5);
  }, [expiredNotClosed, endingSoon, closeoutContracts, draftContracts, contracts.length, navigate]);

  // Validation Warnings
  const validationWarnings = useMemo((): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    if (expiredNotClosed.length > 0) {
      warnings.push({
        id: "expired",
        message: `${expiredNotClosed.length} contract(s) have expired without formal closeout. Begin closeout immediately to avoid compliance issues.`,
        type: "error",
        dismissible: true,
      });
    }

    if (endingSoon.length > 0) {
      warnings.push({
        id: "ending-soon",
        message: `${endingSoon.length} contract(s) ending within 30 days. Prepare final deliverables and closeout documentation.`,
        type: "warning",
        dismissible: true,
      });
    }

    return warnings;
  }, [expiredNotClosed, endingSoon]);

  return (
    <PageLayout
      title="Contracts"
      subtitle="Manage active contracts, track performance, and oversee compliance throughout the contract lifecycle"
      label="Contract Management"
      summaryCards={[
        { label: "Total", value: contracts.length },
        { label: "Active", value: activeContracts, color: "text-green-600" },
        { label: "Closeout", value: closeoutContracts, color: "text-amber-600" },
        { label: "Ending Soon", value: endingSoon.length, color: "text-red-600" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button onClick={() => setIsSmartIntakeOpen(true)} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" /> Smart Import
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Contract
          </Button>
        </div>
      }
    >
      <PageGuide
        title="Contract Management"
        description="Track and manage contracts from award through closeout. Monitor performance, compliance, deliverables, and financial obligations."
        whenToUse="When managing active contracts, checking compliance, or reviewing contract history."
        whatToDoNext={["Review active contract statuses", "Check for upcoming deadlines or deliverables", "Open Contract Hub for detailed management", "Start closeout process for completed contracts"]}
        relatedRecords={[{ label: "Proposals", path: "/app/proposals" }, { label: "Finance", path: "/app/finance" }, { label: "Deliverables", path: "/app/deliverables" }]}
      />

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && <ValidationWarnings warnings={validationWarnings} />}

      {/* Lifecycle Progress */}
      <LifecycleProgress currentPhase="contract" />

      {/* AI Status Panel */}
      <AIStatusPanel checks={aiChecks} title="CONTRACT PORTFOLIO STATUS" />

      {/* What's Next */}
      {nextSteps.length > 0 && <WhatsNext actions={nextSteps} />}

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="contracts" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="contracts" />

      {/* Search */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts by title..."
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
          <p className="text-gray-600">Loading contracts...</p>
        </Card>
      ) : filteredContracts.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Contracts Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search" : "Create your first contract to start tracking performance."}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Contract
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map((contract) => {
            const daysUntilEnd = contract.endDate ? Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            const isExpired = daysUntilEnd !== null && daysUntilEnd < 0 && contract.status !== "closed";
            const isEndingSoon = daysUntilEnd !== null && daysUntilEnd <= 30 && daysUntilEnd >= 0;

            return (
              <Card
                key={contract.id}
                onClick={() => navigate(`/app/contracts/${contract.id}`)}
                className={`bg-white border p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  isExpired ? "border-red-300 bg-red-50" : isEndingSoon ? "border-amber-300 bg-amber-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{contract.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[contract.status || "draft"]}`}>
                        {(contract.status || "draft").replace(/_/g, " ")}
                      </span>
                      {isExpired && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 whitespace-nowrap">
                          EXPIRED
                        </span>
                      )}
                      {isEndingSoon && !isExpired && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 whitespace-nowrap">
                          {daysUntilEnd}d LEFT
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Contract #</p>
                        <p className="font-medium text-gray-900 truncate">{contract.contractNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Agency</p>
                        <p className="font-medium text-gray-900 truncate">{contract.agency || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Value</p>
                        <p className="font-medium text-gray-900">
                          {contract.value ? `$${Number(contract.value).toLocaleString()}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className={`font-medium ${isExpired ? "text-red-700" : isEndingSoon ? "text-amber-700" : "text-gray-900"}`}>
                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "N/A"}
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

      {/* Smart Intake Modal */}
      <SmartIntakeContract
        open={isSmartIntakeOpen}
        onClose={() => setIsSmartIntakeOpen(false)}
        onCreated={() => setIsSmartIntakeOpen(false)}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Contract</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <ContractForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
      <PageGuidancePanel
        pageKey="contracts"
        title="Contracts Help"
        description="Your awarded contracts and active contract pipeline. Each contract should have a governing file uploaded for AI Confirmation. Track status from setup through closeout."
        whatToDoNext={[
          "Upload governing contract file for each new contract",
          "Run AI Confirmation to extract requirements",
          "Review and approve AI findings",
          "Move to Contract Hub for active operations"
        ]}
        helpArticleSlug="what-is-an-awarded-contract"
        glossaryTerms={["awarded-contract", "modification", "contract-hub", "ai-finding"]}
      />
    </PageLayout>
  );
}
