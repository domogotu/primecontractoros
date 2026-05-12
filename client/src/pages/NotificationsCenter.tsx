import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, string> = {
  deadline: "text-red-600",
  compliance: "text-amber-600",
  ai_finding: "text-indigo-600",
  system: "text-slate-600",
  task: "text-blue-600",
  contract: "text-green-600",
};

export default function NotificationsCenter() {
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const { data: notifications = [], isLoading, refetch } = trpc.systemInfra.notifications.list.useQuery({
    unreadOnly: filter === "unread",
  });

  const markRead = trpc.systemInfra.notifications.markRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllRead = trpc.systemInfra.notifications.markAllRead.useMutation({
    onSuccess: () => { toast.success("All notifications marked as read"); refetch(); },
  });

  return (
    <PageLayout title="Notifications" subtitle="Stay informed about deadlines, findings, and system events">
      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark All Read
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Bell className="mx-auto h-12 w-12 mb-4 text-slate-300" />
          <p>{filter === "unread" ? "No unread notifications." : "No notifications yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any) => (
            <Card
              key={notif.id}
              className={`p-4 cursor-pointer transition-colors ${!notif.readAt ? "border-l-4 border-l-indigo-500 bg-indigo-50/30" : ""}`}
              onClick={() => {
                if (!notif.readAt) markRead.mutate({ id: notif.id });
                if (notif.actionUrl) window.location.href = notif.actionUrl;
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${!notif.readAt ? "text-slate-900" : "text-slate-600"}`}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className={`capitalize ${TYPE_ICONS[notif.notificationType] || "text-slate-500"}`}>
                      {(notif.notificationType || "system").replace(/_/g, " ")}
                    </span>
                    <span>•</span>
                    <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ""}</span>
                  </div>
                </div>
                {!notif.readAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); markRead.mutate({ id: notif.id }); }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
