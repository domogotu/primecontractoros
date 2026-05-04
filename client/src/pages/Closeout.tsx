import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, FileCheck } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Closeout() {
  return (
    <PageLayout
      title="Contract Closeout"
      subtitle="Manage the contract closeout process — final deliverables, audits, and administrative closure"
      label="Lifecycle"
      summaryCards={[
        { label: "In Closeout", value: 0 },
        { label: "Pending Final", value: 0, color: "text-amber-600" },
        { label: "Completed", value: 0, color: "text-green-600" },
        { label: "Audit Required", value: 0, color: "text-red-600" },
      ]}
    >
      <Card className="bg-white border border-gray-200 p-12 text-center">
        <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Contracts in Closeout</h3>
        <p className="text-gray-600 mb-6">When contracts reach their end date or are completed, they will appear here for the closeout process.</p>
      </Card>
    </PageLayout>
  );
}
