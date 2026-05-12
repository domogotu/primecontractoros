// @ts-nocheck
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import { Bell } from "lucide-react";

export default function NotificationsCenter() {
  return (
    <PageLayout title="Notifications" subtitle="Stay updated on important events" label="System">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Notifications</h3>
        </Card>
      </div>
    </PageLayout>
  );
}
