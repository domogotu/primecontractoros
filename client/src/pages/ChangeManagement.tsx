// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function ChangeManagement() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: contracts = [] } = trpc.contracts.list.useQuery();

  return (
    <PageLayout title="Change Management" subtitle="Track contract modifications and change orders" label="Operations"
      actions={<Button onClick={() => setShowForm(true)} className="bg-white text-blue-900 hover:bg-blue-50"><Plus className="h-4 w-4 mr-2" />Log Change</Button>}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search changes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Card className="p-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Change Orders Yet</h3>
          <p className="text-gray-500 mb-4">Log contract modifications, change orders, and scope adjustments.</p>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Log First Change</Button>
        </Card>
      </div>
    </PageLayout>
  );
}
