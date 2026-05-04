import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, AlertTriangle } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Deadlines() {
  return (
    <PageLayout
      title="Deadlines"
      subtitle="View all upcoming deadlines across contracts, proposals, and compliance items"
      label="Timeline"
      summaryCards={[
        { label: "This Week", value: 0 },
        { label: "This Month", value: 0, color: "text-blue-600" },
        { label: "Overdue", value: 0, color: "text-red-600" },
        { label: "Completed", value: 0, color: "text-green-600" },
      ]}
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Deadlines</h3>
        <p className="text-gray-600 mb-6">Deadlines from your contracts, proposals, and obligations will appear here automatically.</p>
      </Card>
    </PageLayout>
  );
}
