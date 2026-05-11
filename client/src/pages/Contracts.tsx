import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Search, FileCheck, ExternalLink, Loader2 } from "lucide-react";
import ContractForm from "@/components/ContractForm";
import PageLayout from "@/components/PageLayout";

export default function Contracts() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  return (
    <PageLayout
      title="Contracts"
      subtitle="Manage active contracts, track performance, and oversee compliance throughout the contract lifecycle"
      label="Contracts"
      summaryCards={[
        { label: "Total", value: contracts.length },
        { label: "Active", value: contracts.filter((c) => c.status === "active").length, color: "text-green-600" },
        { label: "Modification", value: contracts.filter((c) => c.status === "modification").length, color: "text-blue-600" },
        { label: "Closeout", value: contracts.filter((c) => c.status === "closeout").length, color: "text-amber-600" },
      ]}
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Contract
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
              placeholder="Search contracts..."
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
          {filteredContracts.map((contract) => (
            <Card
              key={contract.id}
              onClick={() => navigate(`/app/contracts/${contract.id}`)}
              className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[contract.status || "draft"]}`}>
                      {(contract.status || "draft").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Contract Number</p>
                      <p className="font-medium text-gray-900">{contract.contractNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Agency</p>
                      <p className="font-medium text-gray-900">{contract.agency || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Value</p>
                      <p className="font-medium text-gray-900">
                        {contract.value ? `$${(Number(contract.value) / 1000).toFixed(0)}K` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "N/A"}
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
    </PageLayout>
  );
}
