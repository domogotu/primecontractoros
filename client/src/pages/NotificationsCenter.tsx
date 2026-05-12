// @ts-nocheck
import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
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
  Filter
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Demo Data
const DEMO_NOTIFICATIONS = [
  {
    id: "1",
    type: "Alert",
    title: "Contract Expiring Soon",
    message: "Contract #CON-2023-001 with Dept of Defense expires in 30 days.",
    timestamp: "2 hours ago",
    read: false,
    link: "/app/contracts/1"
  },
  {
    id: "2",
    type: "Task",
    title: "Compliance Review Required",
    message: "Please review the latest compliance requirements for the upcoming audit.",
    timestamp: "5 hours ago",
    read: false,
    link: "/app/compliance/audit-1"
  },
  {
    id: "3",
    type: "Finance",
    title: "Invoice Paid",
    message: "Invoice #INV-092 for $45,000 has been marked as paid.",
    timestamp: "1 day ago",
    read: true,
    link: "/app/finance/invoices/092"
  },
  {
    id: "4",
    type: "AI",
    title: "Proposal Draft Ready",
    message: "AI has finished drafting the proposal for RFP-2024-Cyber.",
    timestamp: "2 days ago",
    read: true,
    link: "/app/proposals/rfp-2024-cyber"
  },
  {
    id: "5",
    type: "System",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Saturday at 2:00 AM EST.",
    timestamp: "3 days ago",
    read: true,
    link: null
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Alert": return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "Task": return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    case "Finance": return <DollarSign className="h-5 w-5 text-green-500" />;
    case "AI": return <Sparkles className="h-5 w-5 text-purple-500" />;
    case "System": return <Info className="h-5 w-5 text-gray-500" />;
    default: return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Alert": return "red";
    case "Task": return "blue";
    case "Finance": return "green";
    case "AI": return "purple";
    case "System": return "gray";
    default: return "gray";
  }
};

export default function NotificationsCenter() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchStatus = 
        statusFilter === "All" ? true : 
        statusFilter === "Unread" ? !n.read : 
        n.read;
      
      const matchType = typeFilter === "All" ? true : n.type === typeFilter;
      
      return matchStatus && matchType;
    });
  }, [notifications, statusFilter, typeFilter]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast({ title: "Notification marked as read" });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read" });
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification dismissed" });
  };

  const handleNotificationClick = (link: string | null) => {
    if (link) {
      setLocation(link);
    } else {
      toast({ title: "No related record for this notification" });
    }
  };

  return (
    <PageLayout>
      <PageGuide
        title="Notifications"
        description="View and manage all your workspace alerts, tasks, and system updates."
        whenToUse="Check this page regularly to stay updated on contract expirations, pending tasks, and system events."
        whatToDoNext="Review unread notifications and take necessary actions on related records."
        relatedRecords={[
          { title: "Tasks", link: "/app/tasks" },
          { title: "Contracts", link: "/app/contracts" }
        ]}
        alerts={
          unreadCount > 0 
            ? [{ type: "warning", message: `You have ${unreadCount} unread notifications.` }]
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
                <SelectItem value="Alert">Alerts</SelectItem>
                <SelectItem value="Task">Tasks</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        <Card className="bg-card text-foreground border-border">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Bell className="h-12 w-12 mb-4 opacity-20" />
                <p>No notifications found matching your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.link)}
                    className={`p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/20' : ''}`}
                  >
                    <div className="mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getTypeColor(notification.type)}-100 text-${getTypeColor(notification.type)}-800 dark:bg-${getTypeColor(notification.type)}-900/30 dark:text-${getTypeColor(notification.type)}-400`}>
                          {notification.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDismiss(notification.id, e)}
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
