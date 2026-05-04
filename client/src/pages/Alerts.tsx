import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Alerts() {
  return (
    <PageLayout
      title="Alerts"
      subtitle="System notifications, compliance reminders, and deadline warnings"
      label="Notifications"
      summaryCards={[
        { label: "Active Alerts", value: 0 },
        { label: "Critical", value: 0, color: "text-red-600" },
        { label: "Warnings", value: 0, color: "text-amber-600" },
        { label: "Resolved Today", value: 0, color: "text-green-600" },
      ]}
      actions={
        <Button variant="outline" className="border-gray-300 text-gray-700">
          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All Read
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Alerts</h3>
        <p className="text-gray-600 mb-6">You are all caught up. Alerts will appear here when deadlines approach, compliance items need attention, or system events occur.</p>
      </Card>
    </PageLayout>
  );
}
