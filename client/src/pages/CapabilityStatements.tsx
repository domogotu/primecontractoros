import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function CapabilityStatements() {
  return (
    <PageLayout
      title="Capability Statements"
      subtitle="Create and manage capability statements for marketing to government agencies"
      label="Marketing"
      summaryCards={[
        { label: "Total", value: 0 },
        { label: "Active", value: 0, color: "text-green-600" },
        { label: "Draft", value: 0, color: "text-gray-600" },
        { label: "Shared", value: 0, color: "text-blue-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Statement
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Capability Statements</h3>
        <p className="text-gray-600 mb-6">Create your first capability statement to showcase your company qualifications to government agencies.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Your First Statement
        </Button>
      </Card>
    </PageLayout>
  );
}
