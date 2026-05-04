import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Layout } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Templates() {
  return (
    <PageLayout
      title="Templates"
      subtitle="Reusable templates for proposals, contracts, invoices, and other documents"
      label="Library"
      summaryCards={[
        { label: "Total", value: 0 },
        { label: "Proposals", value: 0, color: "text-blue-600" },
        { label: "Contracts", value: 0, color: "text-green-600" },
        { label: "Invoices", value: 0, color: "text-purple-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Created</h3>
        <p className="text-gray-600 mb-6">Create reusable templates to speed up proposal writing, contract setup, and document generation.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Your First Template
        </Button>
      </Card>
    </PageLayout>
  );
}
