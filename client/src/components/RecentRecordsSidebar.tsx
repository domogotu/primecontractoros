import { useLocation } from "wouter";
import { useRecentRecords } from "@/hooks/useRecentRecords";
import { Clock, Briefcase, FileText, FolderOpen, Users, Receipt, CheckSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, React.ReactNode> = {
  opportunity: <Briefcase className="h-3.5 w-3.5 text-blue-500" />,
  proposal: <FileText className="h-3.5 w-3.5 text-purple-500" />,
  contract: <FolderOpen className="h-3.5 w-3.5 text-green-500" />,
  file: <FileText className="h-3.5 w-3.5 text-gray-500" />,
  contact: <Users className="h-3.5 w-3.5 text-orange-500" />,
  invoice: <Receipt className="h-3.5 w-3.5 text-emerald-500" />,
  task: <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />,
};

export default function RecentRecordsSidebar() {
  const { records, clearRecords } = useRecentRecords();
  const [, navigate] = useLocation();

  if (records.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={clearRecords} title="Clear">
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-0.5">
        {records.map((record, idx) => (
          <div
            key={`${record.type}-${record.id}-${idx}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => navigate(record.route)}
          >
            {typeIcons[record.type] || <FileText className="h-3.5 w-3.5" />}
            <span className="text-xs truncate flex-1">{record.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
