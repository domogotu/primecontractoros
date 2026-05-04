import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Lightbulb } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function LessonsLearned() {
  return (
    <PageLayout
      title="Lessons Learned"
      subtitle="Capture and share insights from completed contracts, proposals, and projects"
      label="Knowledge"
      summaryCards={[
        { label: "Total Lessons", value: 0 },
        { label: "This Quarter", value: 0, color: "text-blue-600" },
        { label: "Applied", value: 0, color: "text-green-600" },
        { label: "Pending Review", value: 0, color: "text-amber-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Lesson
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Lessons Captured</h3>
        <p className="text-gray-600 mb-6">Document lessons learned from contracts and proposals to build institutional knowledge and improve future performance.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Capture Your First Lesson
        </Button>
      </Card>
    </PageLayout>
  );
}
