// @ts-nocheck
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import { ScrollText } from "lucide-react";

export default function AuditLog() {
  return (
    <PageLayout title="Audit Log" subtitle="Track all system actions and changes" label="Security">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <Card className="p-12 text-center">
          <ScrollText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Audit Log Empty</h3>
          <p className="text-gray-500">System actions will be recorded here.</p>
        </Card>
      </div>
    </PageLayout>
  );
}
