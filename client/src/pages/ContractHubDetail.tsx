import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, CheckCircle2, Clock, AlertTriangle, Shield, Calendar, DollarSign, Users, Briefcase, Package, ClipboardList, Brain, Loader2, FolderOpen } from "lucide-react";
import ContractFiles from "@/components/ContractFiles";

export default function ContractHubDetail() {
  const [, params] = useRoute("/app/contracts/:id/hub");
  const [, navigate] = useLocation();
  const contractId = params?.id ? parseInt(params.id) : undefined;
  const { data: contract, isLoading } = trpc.contracts.get.useQuery(
    { id: contractId! },
    { enabled: !!contractId }
  );

  if (isLoading) return <div className="p-6 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading contract hub...</div>;
  if (!contract) return <div className="p-6"><p className="text-red-500">Contract not found.</p><Button variant="outline" onClick={() => navigate("/app/contracts")}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></div>;

  const cid = contractId!;

  const hubSections = [
    { title: "Requirements", description: "Track contract requirements and verification", path: `/app/requirements?contractId=${cid}`, icon: ClipboardList, color: "bg-blue-50 text-blue-700 border-blue-200" },
    { title: "Deliverables", description: "Manage deliverables and submission schedules", path: `/app/deliverables?contractId=${cid}`, icon: Package, color: "bg-green-50 text-green-700 border-green-200" },
    { title: "Deadlines", description: "Monitor milestones and due dates", path: `/app/deadlines?contractId=${cid}`, icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
    { title: "Compliance Matrix", description: "Full compliance tracking with clause references", path: `/app/compliance?contractId=${cid}`, icon: Shield, color: "bg-purple-50 text-purple-700 border-purple-200" },
    { title: "Change Orders", description: "Track modifications and change orders", path: `/app/change-management?contractId=${cid}`, icon: Briefcase, color: "bg-orange-50 text-orange-700 border-orange-200" },
    { title: "Finance", description: "Invoices, payments, and financial tracking", path: `/app/finance?contractId=${cid}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { title: "Subcontractors", description: "Manage subs and flowdown requirements", path: `/app/subcontractors?contractId=${cid}`, icon: Users, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { title: "Files", description: "Contract documents, governing docs, and versions", path: `/app/files?contractId=${cid}`, icon: FolderOpen, color: "bg-slate-50 text-slate-700 border-slate-200" },
    { title: "AI Review", description: "AI-powered contract analysis", path: `/app/contracts/${cid}/ai-confirmation`, icon: Brain, color: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/app/contracts/" + contractId)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Contract Detail
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{contract.title || contract.contractNumber}</h1>
          <p className="text-sm text-gray-500">Contract Hub — Central management view</p>
        </div>
        <Badge className="ml-auto" variant={contract.status === "active" ? "default" : "secondary"}>{contract.status}</Badge>
      </div>

      <PageGuide
        title="Contract Hub"
        description="Central command center for this contract. Access all related modules, track progress, and manage operations from one place."
        whenToUse="Use this hub whenever you need a birds-eye view of a specific contract or need to navigate to any contract-related module."
        whatToDoNext={["Review each section below for items needing attention. Click any card to drill into that module filtered for this contract."]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">Status</p><p className="text-lg font-bold capitalize">{contract.status}</p></CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">Value</p><p className="text-lg font-bold">{contract.value ? "$" + Number(contract.value).toLocaleString() : "\u2014"}</p></CardContent></Card>
        <Card className="border-l-4 border-l-amber-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">Start Date</p><p className="text-lg font-bold">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "\u2014"}</p></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">End Date</p><p className="text-lg font-bold">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "\u2014"}</p></CardContent></Card>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Modules</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {hubSections.map((section) => {
          const Icon = section.icon;
          return (
            <button key={section.title} onClick={() => navigate(section.path)} className={"text-left p-4 rounded-lg border " + section.color + " hover:shadow-md transition-shadow"}>
              <Icon className="w-6 h-6 mb-2" />
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <p className="text-xs mt-1 opacity-80">{section.description}</p>
            </button>
          );
        })}
      </div>

      {/* Contract Files Section */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Contract Files & Governing Documents</CardTitle></CardHeader>
        <CardContent>
          {contractId && <ContractFiles contractId={contractId} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/app/contracts/${cid}/ai-confirmation`)}><Brain className="w-4 h-4 mr-1" /> Run AI Review</Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/app/contracts/${cid}/closeout`)}><CheckCircle2 className="w-4 h-4 mr-1" /> Start Closeout</Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/app/reports?contractId=${cid}`)}><FileText className="w-4 h-4 mr-1" /> Generate Report</Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/app/change-management?contractId=${cid}&create=true`)}><Briefcase className="w-4 h-4 mr-1" /> New Change Order</Button>
        </CardContent>
      </Card>
    </div>
  );
}
