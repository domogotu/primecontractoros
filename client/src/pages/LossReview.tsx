import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingDown, FileSearch } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function LossReview() {
  return (
    <PageLayout
      title="Loss Review"
      subtitle="Analyze lost proposals to identify patterns and improve future win rates"
      label="Analysis"
      summaryCards={[
        { label: "Total Reviews", value: 0 },
        { label: "This Quarter", value: 0, color: "text-blue-600" },
        { label: "Actionable Items", value: 0, color: "text-amber-600" },
        { label: "Implemented", value: 0, color: "text-green-600" },
      ]}
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <FileSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Loss Reviews</h3>
        <p className="text-gray-600 mb-6">When proposals are marked as lost, you can conduct a loss review to learn from the experience and improve future submissions.</p>
      </Card>
    </PageLayout>
  );
}
