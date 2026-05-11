import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Target, ExternalLink, Loader2 } from "lucide-react";
import OpportunityForm from "@/components/OpportunityForm";
import PageLayout from "@/components/PageLayout";

export default function Opportunities() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: opportunities = [], isLoading } = trpc.opportunities.list.useQuery();

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

  return (
    <PageLayout
      title="Opportunities"
      subtitle="Track and review potential government contracting opportunities from discovery to decision"
      label="Pipeline"
      summaryCards={[
        { label: "Total", value: opportunities.length },
        { label: "New", value: opportunities.filter((o) => o.status === "new").length, color: "text-blue-600" },
        { label: "In Review", value: opportunities.filter((o) => o.status === "in_review").length, color: "text-amber-600" },
        { label: "Pursuing", value: opportunities.filter((o) => o.status === "pursue").length, color: "text-green-600" },
      ]}
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Opportunity
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
          {filteredOpportunities.map((opp) => (
            <Card
              key={opp.id}
              onClick={() => navigate(`/app/opportunities/${opp.id}`)}
              className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[opp.status || "new"]}`}>
                      {(opp.status || "new").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Agency</p>
                      <p className="font-medium text-gray-900">{opp.agency || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Solicitation</p>
                      <p className="font-medium text-gray-900">{opp.solicitation || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {opp.dueDate ? new Date(opp.dueDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">{opp.type || "N/A"}</p>
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
    </PageLayout>
  );
}
