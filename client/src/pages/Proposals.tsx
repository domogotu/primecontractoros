import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Search, FileText, ExternalLink, Loader2 } from "lucide-react";
import ProposalForm from "@/components/ProposalForm";
import PageLayout from "@/components/PageLayout";

export default function Proposals() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const workspaceId = 1;
  const { data: proposals = [], isLoading } = trpc.proposals.list.useQuery({ workspaceId });

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

  return (
    <PageLayout
      title="Proposals"
      subtitle="Build, review, and submit proposals for government contracting opportunities"
      label="Proposals"
      summaryCards={[
        { label: "Total", value: proposals.length },
        { label: "In Progress", value: proposals.filter((p) => p.status === "in_progress").length, color: "text-blue-600" },
        { label: "Submitted", value: proposals.filter((p) => p.status === "submitted").length, color: "text-purple-600" },
        { label: "Won", value: proposals.filter((p) => p.status === "won").length, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Proposal
        </Button>
      }
    >
      {/* Search */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals..."
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
          {filteredProposals.map((proposal) => (
            <Card
              key={proposal.id}
              onClick={() => navigate(`/app/proposals/${proposal.id}`)}
              className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[proposal.status || "draft"]}`}>
                      {(proposal.status || "draft").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Framework</p>
                      <p className="font-medium text-gray-900">{proposal.framework || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {proposal.dueDate ? new Date(proposal.dueDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Opportunity</p>
                      <p className="font-medium text-gray-900">{proposal.opportunityId ? `#${proposal.opportunityId}` : "Standalone"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
          </DialogHeader>
          <ProposalForm
            workspaceId={workspaceId}
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
