import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Receipt } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout
      title="Invoices"
      subtitle="Create, submit, and track invoices for your government contracts"
      label="Finance"
      summaryCards={[
        { label: "Total", value: 0 },
        { label: "Submitted", value: 0, color: "text-blue-600" },
        { label: "Approved", value: 0, color: "text-green-600" },
        { label: "Overdue", value: 0, color: "text-red-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-gray-200 p-12 text-center">
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Invoices Found</h3>
        <p className="text-gray-600 mb-6">Create your first invoice to start billing against your contracts.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Your First Invoice
        </Button>
      </Card>
    </PageLayout>
  );
}
