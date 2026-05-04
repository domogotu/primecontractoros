import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ClipboardList } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Obligations() {
  return (
    <PageLayout
      title="Obligations"
      subtitle="Track contractual obligations, requirements, and compliance commitments"
      label="Compliance"
      summaryCards={[
        { label: "Total", value: 0 },
        { label: "Active", value: 0, color: "text-green-600" },
        { label: "Due Soon", value: 0, color: "text-amber-600" },
        { label: "Overdue", value: 0, color: "text-red-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Obligation
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Obligations Tracked</h3>
        <p className="text-gray-600 mb-6">Add contractual obligations to track compliance requirements and deadlines.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Your First Obligation
        </Button>
      </Card>
    </PageLayout>
  );
}
