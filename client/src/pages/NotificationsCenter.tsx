
import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  DollarSign,
  Filter,
  Plus
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "warning": return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "critical": return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case "success": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "info": return <Info className="h-5 w-5 text-blue-500" />;
    default: return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "critical": return "bg-red-100 text-red-800";
    case "warning": return "bg-yellow-100 text-yellow-800";
    case "success": return "bg-green-100 text-green-800";
    case "info": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function NotificationsCenter() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const utils = trpc.useUtils();
  const { data: alerts = [], isLoading } = trpc.alerts.list.useQuery();

  const markReadMutation = trpc.alerts.markRead.useMutation({
    onSuccess: () => utils.alerts.list.invalidate(),
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const markAllReadMutation = trpc.alerts.markAllRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      toast({ title: "All notifications marked as read" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const dismissMutation = trpc.alerts.dismiss.useMutation({
    onSuccess: () => utils.alerts.list.invalidate(),
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const unreadCount = alerts.filter((n: any) => !n.isRead).length;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((n: any) => {
      const matchStatus = 
        statusFilter === "All" ? true : 
        statusFilter === "Unread" ? !n.isRead : 
        n.isRead;
      const matchType = typeFilter === "All" ? true : n.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [alerts, statusFilter, typeFilter]);

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    markReadMutation.mutate({ id });
    toast({ title: "Notification marked as read" });
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const handleDismiss = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissMutation.mutate({ id });
    toast({ title: "Notification dismissed" });
  };

  const handleNotificationClick = (alert: any) => {
    if (alert.linkedRecordType && alert.linkedRecordId) {
      const paths: Record<string, string> = {
        contract: `/app/contracts/${alert.linkedRecordId}`,
        invoice: `/app/invoices/${alert.linkedRecordId}`,
        proposal: `/app/proposals/${alert.linkedRecordId}`,
        task: `/app/tasks`,
      };
      const path = paths[alert.linkedRecordType];
      if (path) {
        setLocation(path);
        return;
      }
    }
    toast({ title: "No related record for this notification" });
  };

  return (
    <PageLayout title="Notifications" subtitle="View and manage all your workspace alerts, tasks, and system updates.">
      <PageGuide
        title="Notifications"
        description="View and manage all your workspace alerts, tasks, and system updates."
        whenToUse="Check this page regularly to stay updated on contract expirations, pending tasks, and system events."
        whatToDoNext={["Review unread notifications", "Take necessary actions on related records", "Dismiss resolved notifications"]}
        relatedRecords={[
          { label: "Tasks", path: "/app/tasks" },
          { label: "Contracts", path: "/app/contracts" }
        ]}
        alerts={
          unreadCount > 0 
            ? [{ type: "warning", message: `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}.` }]
            : []
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Unread">Unread</SelectItem>
                  <SelectItem value="Read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading notifications...</div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm mt-2">
                  {alerts.length === 0 
                    ? "Alerts will appear here when contracts expire, tasks are overdue, or other important events occur."
                    : "No notifications match your current filters."
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredAlerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors cursor-pointer ${!alert.isRead ? "bg-primary/5" : ""}`}
                    onClick={() => handleNotificationClick(alert)}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getTypeIcon(alert.type || "info")}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{alert.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeBadgeColor(alert.type || "info")}`}>
                          {alert.type || "info"}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      {alert.message && (
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                        {alert.linkedRecordType && (
                          <span className="ml-2 capitalize">· {alert.linkedRecordType}</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => handleMarkAsRead(alert.id, e)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDismiss(alert.id, e)}
                        title="Dismiss"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
