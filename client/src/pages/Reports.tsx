import { useState } from "react";
import { useLocation } from "wouter";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, DollarSign, Shield, Users, Calendar, Download, ArrowRight } from "lucide-react";

const reportCategories = [
  {
    title: "Contract Performance",
    description: "Track contract execution metrics, milestone completion, and overall health",
    icon: BarChart3,
    reports: [
      { name: "Contract Status Summary", description: "Overview of all active contracts with status and key dates" },
      { name: "Milestone Completion Report", description: "Track milestone achievement rates across contracts" },
      { name: "Period of Performance Timeline", description: "Visual timeline of contract periods and option years" },
    ],
  },
  {
    title: "Financial",
    description: "Revenue, invoicing, payments, and budget tracking",
    icon: DollarSign,
    reports: [
      { name: "Invoice Aging Report", description: "Track outstanding invoices and payment timelines" },
      { name: "Revenue by Contract", description: "Revenue breakdown across active contracts" },
      { name: "Budget vs. Actual", description: "Compare planned budget against actual spending" },
    ],
  },
  {
    title: "Compliance",
    description: "Compliance status, audit readiness, and regulatory tracking",
    icon: Shield,
    reports: [
      { name: "Compliance Matrix Summary", description: "Aggregate compliance status across all contracts" },
      { name: "Audit Readiness Score", description: "Assessment of documentation and process readiness" },
      { name: "FAR/DFARS Coverage Report", description: "Which clauses apply and their compliance status" },
    ],
  },
  {
    title: "Team & Resources",
    description: "Team utilization, key personnel, and subcontractor performance",
    icon: Users,
    reports: [
      { name: "Key Personnel Status", description: "Track key personnel assignments and availability" },
      { name: "Subcontractor Performance", description: "Evaluate subcontractor delivery and compliance" },
      { name: "Team Utilization", description: "Resource allocation across contracts" },
    ],
  },
  {
    title: "Deliverables",
    description: "Deliverable submission tracking and acceptance rates",
    icon: FileText,
    reports: [
      { name: "Deliverable Status Report", description: "Track all CDRLs and their acceptance status" },
      { name: "On-Time Delivery Rate", description: "Percentage of deliverables submitted on time" },
      { name: "Upcoming Deliverables", description: "Deliverables due in the next 30/60/90 days" },
    ],
  },
  {
    title: "Pipeline",
    description: "Opportunity pipeline, win rates, and proposal metrics",
    icon: Calendar,
    reports: [
      { name: "Pipeline Summary", description: "Active opportunities by stage and estimated value" },
      { name: "Win/Loss Analysis", description: "Historical win rates and contributing factors" },
      { name: "Proposal Activity", description: "Proposals in progress, submitted, and decided" },
    ],
  },
];

export default function Reports() {
  const [, navigate] = useLocation();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Reports"
        description="Generate and view reports across all aspects of your contracting operations."
        whenToUse="Use for management reviews, client reporting, audit preparation, or tracking KPIs."
        whatToDoNext={[
          "Select a report category to view available reports",
          "Generate reports for upcoming management reviews",
          "Export reports for external stakeholders",
          "Set up recurring report schedules",
        ]}
        relatedRecords={[
          { label: "Dashboard", path: "/app" },
          { label: "Finance", path: "/app/finance" },
          { label: "Compliance", path: "/app/compliance" },
          { label: "Contracts", path: "/app/contracts" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate reports across your contracting operations</p>
      </div>

      <div className="space-y-8">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{category.title}</h2>
                  <p className="text-xs text-slate-500">{category.description}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {category.reports.map((report) => (
                  <Card key={report.name} className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">{report.name}</h3>
                      <p className="text-xs text-slate-500 mb-3">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Generate
                        </Button>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
