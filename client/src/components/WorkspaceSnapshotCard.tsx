import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Search, FileText, Briefcase, Receipt, CreditCard, CheckSquare, FolderOpen, Brain } from "lucide-react";

export default function WorkspaceSnapshotCard() {
  const { data: snapshot } = trpc.dashboardData.getLifecycleSnapshot.useQuery();

  if (!snapshot) return null;

  const metrics = [
    { label: "Opportunities", value: snapshot.opportunities, path: "/app/opportunities", icon: Search, color: "text-blue-600" },
    { label: "Proposals", value: snapshot.proposals, path: "/app/proposals", icon: FileText, color: "text-indigo-600" },
    { label: "Contracts", value: snapshot.contracts, path: "/app/contracts", icon: Briefcase, color: "text-green-600" },
    { label: "Invoices", value: snapshot.invoices, path: "/app/invoices", icon: Receipt, color: "text-amber-600" },
    { label: "Payments", value: snapshot.payments, path: "/app/payments", icon: CreditCard, color: "text-emerald-600" },
    { label: "Open Tasks", value: snapshot.openTasks, path: "/app/tasks", icon: CheckSquare, color: "text-purple-600" },
    { label: "Files", value: snapshot.files, path: "/app/files", icon: FolderOpen, color: "text-gray-600" },
    { label: "AI Suggestions", value: snapshot.pendingSuggestions, path: "/app/ai-suggestions", icon: Brain, color: "text-pink-600" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Workspace Overview</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.label} href={m.path} className="flex flex-col items-center p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group">
              <Icon className={`w-5 h-5 ${m.color} mb-1`} />
              <span className="text-lg font-bold text-gray-900">{m.value}</span>
              <span className="text-[10px] text-gray-500 text-center group-hover:text-blue-600">{m.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
