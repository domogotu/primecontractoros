import { AlertCircle, ArrowRight, FileWarning, DollarSign, Brain } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function AttentionItemsCard() {
  const { data: items = [] } = trpc.dashboardData.getAttentionItems.useQuery();

  if (items.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "contract_confirmation": return <FileWarning className="w-4 h-4 text-amber-500" />;
      case "ai_finding_review": return <Brain className="w-4 h-4 text-purple-500" />;
      case "invoice_overdue": return <DollarSign className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPath = (item: typeof items[0]) => {
    if (item.recordType === "contract") return `/app/contracts/${item.recordId}`;
    if (item.recordType === "ai_finding") return `/app/ai-suggestions`;
    if (item.recordType === "invoice") return `/app/invoices`;
    return "/app/dashboard";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Needs Attention</h3>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
          {items.length}
        </span>
      </div>
      <ul className="space-y-3">
        {items.slice(0, 5).map((item, idx) => (
          <li key={idx}>
            <Link href={getPath(item)} className="flex items-start gap-3 group">
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 mt-1 flex-shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
