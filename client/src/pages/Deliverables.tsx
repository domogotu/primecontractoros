import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Deliverables() {
  return (
    <PageLayout
      title="Deliverables"
      subtitle="Track contract deliverables, submission status, and acceptance criteria"
      label="Performance"
      summaryCards={[
        { label: "Total", value: 0 },
        { label: "In Progress", value: 0, color: "text-blue-600" },
        { label: "Submitted", value: 0, color: "text-green-600" },
        { label: "Overdue", value: 0, color: "text-red-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Deliverable
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Deliverables Tracked</h3>
        <p className="text-gray-600 mb-6">Add deliverables from your contracts to track submission deadlines and acceptance status.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Your First Deliverable
        </Button>
      </Card>
    </PageLayout>
  );
}
