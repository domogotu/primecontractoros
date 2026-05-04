import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Compliance() {
  return (
    <PageLayout
      title="Compliance"
      subtitle="Monitor regulatory compliance, certifications, and audit readiness across all contracts"
      label="Governance"
      summaryCards={[
        { label: "Requirements", value: 0 },
        { label: "Compliant", value: 0, color: "text-green-600" },
        { label: "At Risk", value: 0, color: "text-amber-600" },
        { label: "Non-Compliant", value: 0, color: "text-red-600" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Certifications</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Track SAM.gov registration, CAGE code, small business certifications, and clearances.</p>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">Manage Certifications</Button>
        </Card>

        <Card className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Audit Readiness</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Ensure your documentation and processes are audit-ready at all times.</p>
          <Button variant="outline" size="sm" className="text-green-600 border-green-200">Run Audit Check</Button>
        </Card>

        <Card className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Identify and mitigate compliance risks before they become issues.</p>
          <Button variant="outline" size="sm" className="text-amber-600 border-amber-200">View Risks</Button>
        </Card>

        <Card className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">FAR/DFARS Compliance</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Track compliance with Federal Acquisition Regulation requirements.</p>
          <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">Review Requirements</Button>
        </Card>
      </div>
    </PageLayout>
  );
}
