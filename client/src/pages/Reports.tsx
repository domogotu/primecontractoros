import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Download, FileText } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Reports() {
  return (
    <PageLayout
      title="Reports"
      subtitle="Generate and view reports on contract performance, financials, and compliance"
      label="Analytics"
      summaryCards={[
        { label: "Available Reports", value: 6 },
        { label: "Generated This Month", value: 0, color: "text-blue-600" },
        { label: "Scheduled", value: 0, color: "text-green-600" },
        { label: "Exported", value: 0, color: "text-purple-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      }
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Contract Performance", desc: "Track KPIs, milestones, and deliverable completion rates" },
          { title: "Financial Summary", desc: "Revenue, expenses, and profitability by contract" },
          { title: "Pipeline Analysis", desc: "Opportunity-to-award conversion rates and pipeline health" },
          { title: "Compliance Status", desc: "Certification status, audit readiness, and risk areas" },
          { title: "Team Utilization", desc: "Resource allocation and capacity planning" },
          { title: "Subcontractor Performance", desc: "Sub performance tracking and payment status" },
        ].map((report, idx) => (
          <Card key={idx} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
              <FileText className="w-3 h-3 mr-1" /> Generate
            </Button>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
