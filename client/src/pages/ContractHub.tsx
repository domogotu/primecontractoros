import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, Shield, Calendar, DollarSign, Users, Briefcase } from "lucide-react";

export default function ContractHub() {
  const [, navigate] = useLocation();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();

  const activeContracts = contracts.filter((c: any) => c.status === "active");
  
  const sections = [
    { title: "Requirements", description: "Track all contract requirements and verification status", path: "/app/requirements", icon: FileText, count: 0 },
    { title: "Deliverables", description: "Manage contract deliverables and submission schedules", path: "/app/deliverables", icon: CheckCircle2, count: 0 },
    { title: "Deadlines", description: "Monitor upcoming deadlines and milestones", path: "/app/deadlines", icon: Calendar, count: 0 },
    { title: "Compliance Matrix", description: "Full compliance tracking with clause references", path: "/app/compliance", icon: Shield, count: 0 },
    { title: "Change Management", description: "Track modifications and change orders", path: "/app/change-management", icon: Briefcase, count: 0 },
    { title: "Finance & Invoicing", description: "Billing, payments, and financial tracking", path: "/app/finance", icon: DollarSign, count: 0 },
    { title: "Subcontractors", description: "Manage subcontractor relationships and flowdowns", path: "/app/subcontractors", icon: Users, count: 0 },
    { title: "AI Contract Review", description: "AI-powered contract analysis with confirmation", path: "/app/ai-contract-review", icon: AlertTriangle, count: 0 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Contract Hub"
        description="Central command center for your active contracts. Access all contract-related modules from one place."
        whenToUse="Use this as your starting point when working on contract operations. Navigate to specific modules for detailed work."
        whatToDoNext={[
          "Review active contract status and upcoming deadlines",
          "Check compliance matrix for any gaps",
          "Process pending deliverable submissions",
          "Review AI findings awaiting confirmation",
        ]}
        relatedRecords={[
          { label: "Contracts", path: "/app/contracts" },
          { label: "Opportunities", path: "/app/opportunities" },
          { label: "Closeout", path: "/app/closeout" },
          { label: "Reports", path: "/app/reports" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contract Hub</h1>
        <p className="text-sm text-slate-500 mt-1">
          {activeContracts.length} active contract{activeContracts.length !== 1 ? "s" : ""} | Central operations dashboard
        </p>
      </div>

      {/* Active Contracts Summary */}
      {activeContracts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Active Contracts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeContracts.slice(0, 4).map((contract: any) => (
              <Card key={contract.id} className="hover:border-blue-300 transition-colors cursor-pointer" onClick={() => navigate("/app/contracts")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{contract.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{contract.contractNumber || "No number assigned"}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Module Navigation */}
      <h2 className="text-lg font-semibold text-slate-800 mb-3">Contract Modules</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate(section.path)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Icon className="w-8 h-8 text-blue-600 mb-3" />
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{section.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{section.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
