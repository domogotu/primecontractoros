// @ts-nocheck
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import { Cpu } from "lucide-react";

export default function AIRuns() {
  return (
    <PageLayout title="AI Runs" subtitle="History of AI analysis executions" label="AI">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <Card className="p-12 text-center">
          <Cpu className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No AI Runs</h3>
          <p className="text-gray-500">AI analysis runs will be logged here.</p>
        </Card>
      </div>
    </PageLayout>
  );
}
