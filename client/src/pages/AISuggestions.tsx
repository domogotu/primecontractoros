// @ts-nocheck
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import { Lightbulb } from "lucide-react";

export default function AISuggestions() {
  return (
    <PageLayout title="AI Suggestions" subtitle="Intelligent recommendations for your workflow" label="AI">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <Card className="p-12 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Suggestions Yet</h3>
          <p className="text-gray-500">AI suggestions will appear as you use the platform.</p>
        </Card>
      </div>
    </PageLayout>
  );
}
