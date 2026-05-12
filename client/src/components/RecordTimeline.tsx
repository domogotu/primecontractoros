// @ts-nocheck
import { trpc } from "@/lib/trpc";
import { Clock, FileText, MessageSquare, User, CheckCircle2 } from "lucide-react";

const iconMap = { note: MessageSquare, file: FileText, status: CheckCircle2, user: User, default: Clock };

export default function RecordTimeline({ recordType, recordId }) {
  const { data: events = [], isLoading } = trpc.recordTimeline.list.useQuery({ recordType, recordId });
  if (isLoading) return <div className="text-sm text-gray-400">Loading timeline...</div>;
  if ((events as any[]).length === 0) return <div className="text-sm text-gray-400 italic">No activity yet.</div>;
  return (
    <div className="space-y-0">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Clock className="h-4 w-4" />Activity Timeline</h4>
      <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
        {(events as any[]).map((event) => {
          const Icon = iconMap[event.eventType] || iconMap.default;
          return (
            <div key={event.id} className="relative">
              <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center">
                <Icon className="h-2.5 w-2.5 text-blue-500" />
              </div>
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-sm text-gray-800">{event.description}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
