import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import LifecycleProgress from "@/components/LifecycleProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Shield, Calendar,
  DollarSign, Users, Briefcase, ArrowRight, Activity, BarChart3,
} from "lucide-react";

export default function ContractHub() {
  const [, navigate] = useLocation();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();
  const { data: deliverables = [] } = trpc.deliverables.list.useQuery({});
  const { data: deadlines = [] } = trpc.deadlines.list.useQuery();
  const { data: compliance = [] } = trpc.compliance.list.useQuery({});

  const activeContracts = (contracts as any[]).filter((c) => c.status === "active" || c.status === "awarded");
  const pendingDeliverables = (deliverables as any[]).filter((d) => d.status !== "submitted" && d.status !== "accepted");
  const upcomingDeadlines = (deadlines as any[]).filter((d) => {
    if (!d.dueDate) return false;
    const due = new Date(d.dueDate);
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return due >= now && due <= twoWeeks;
  });
  const openCompliance = (compliance as any[]).filter((c) => c.status !== "compliant");

  const modules = [
    { title: "Requirements", description: "Track all contract requirements and verification status", path: "/app/requirements", icon: FileText, color: "bg-blue-500" },
    { title: "Deliverables", description: "Manage contract deliverables and submission schedules", path: "/app/deliverables", icon: CheckCircle2, color: "bg-green-500" },
    { title: "Deadlines", description: "Monitor upcoming deadlines and milestones", path: "/app/deadlines", icon: Calendar, color: "bg-amber-500" },
    { title: "Compliance Matrix", description: "Full compliance tracking with clause references", path: "/app/compliance", icon: Shield, color: "bg-purple-500" },
    { title: "Change Management", description: "Track modifications and change orders", path: "/app/change-management", icon: Briefcase, color: "bg-indigo-500" },
    { title: "Finance & Invoicing", description: "Billing, payments, and financial tracking", path: "/app/finance", icon: DollarSign, color: "bg-yellow-600" },
    { title: "Subcontractors", description: "Manage subcontractor relationships and flowdowns", path: "/app/subcontractors", icon: Users, color: "bg-cyan-500" },
    { title: "AI Contract Review", description: "AI-powered contract analysis with confirmation", path: "/app/ai-contract-review", icon: AlertTriangle, color: "bg-rose-500" },
  ];

  return (
    <PageLayout
      label="Contract Lifecycle"
      title="Contract Hub"
      subtitle={`${activeContracts.length} active contract${activeContracts.length !== 1 ? "s" : ""} in performance. Manage requirements, deliverables, compliance, and finance from one place.`}
      actions={
        <Button
          variant="outline"
          className="border-blue-300 text-blue-100 hover:bg-blue-800 bg-transparent"
          onClick={() => navigate("/app/contracts")}
        >
          View All Contracts
        </Button>
      }
      summaryCards={[
        { label: "Active Contracts", value: activeContracts.length, color: "text-green-700" },
        { label: "Pending Deliverables", value: pendingDeliverables.length, color: "text-amber-700" },
        { label: "Upcoming Deadlines", value: upcomingDeadlines.length, color: "text-blue-700" },
        { label: "Compliance Gaps", value: openCompliance.length, color: "text-red-700" },
      ]}
    >
      <LifecycleProgress currentPhase="performance" />

      {/* Active Contracts List */}
      {activeContracts.length > 0 && (
        <Card className="bg-white border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" /> Active Contracts
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/contracts")}>View All</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {activeContracts.slice(0, 4).map((contract: any) => (
              <div
                key={contract.id}
                className="flex items-start justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/app/contracts/${contract.id}/hub`)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{contract.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{contract.contractNumber || "No number assigned"}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 ml-2 flex-shrink-0">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state for no contracts */}
      {activeContracts.length === 0 && (
        <Card className="p-8 text-center">
          <Briefcase className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Contracts</h3>
          <p className="text-sm text-gray-500 mb-4">Win proposals to create contracts, or add contracts manually from the Contracts page.</p>
          <Button onClick={() => navigate("/app/contracts")} className="bg-blue-900 hover:bg-blue-800">
            Go to Contracts
          </Button>
        </Card>
      )}

      {/* Module Navigation */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" /> Contract Modules
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => navigate(mod.path)}
              >
                <div className={`${mod.color} text-white rounded-lg p-2 w-9 h-9 flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{mod.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{mod.description}</p>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors mt-2" />
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
