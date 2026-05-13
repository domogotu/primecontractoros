import { trpc } from "@/lib/trpc";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bell, Clock, DollarSign, FileText, Briefcase, BarChart3 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const PREF_ITEMS = [
  {
    key: "deadlineReminders" as const,
    icon: Clock,
    title: "Deadline Reminders",
    description: "Email when a task or contract deadline is approaching within 48 hours",
  },
  {
    key: "invoiceAlerts" as const,
    icon: DollarSign,
    title: "Invoice Alerts",
    description: "Email when an invoice becomes overdue by more than 7 days",
  },
  {
    key: "contractStatusChanges" as const,
    icon: Briefcase,
    title: "Contract Status Changes",
    description: "Email when a contract's status is updated (e.g., awarded, active, closed)",
  },
  {
    key: "proposalUpdates" as const,
    icon: FileText,
    title: "Proposal Updates",
    description: "Email when a proposal is submitted or its status changes",
  },
  {
    key: "weeklyDigest" as const,
    icon: BarChart3,
    title: "Weekly Digest",
    description: "A weekly summary of activity across your workspace (sent every Monday)",
  },
];

export default function EmailNotificationPreferences() {
  const { toast } = useToast();
  const { data: prefs, isLoading, refetch } = trpc.emailPrefs.get.useQuery();

  const updateMutation = trpc.emailPrefs.update.useMutation({
    onSuccess: () => {
      toast({ title: "Preferences saved" });
      refetch();
    },
    onError: (err) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  function handleToggle(key: keyof typeof PREF_ITEMS[0], value: boolean) {
    updateMutation.mutate({ [key]: value } as any);
  }

  return (
    <PageLayout
        label="Settings"
        title="Notification Preferences"
        subtitle="Choose which email notifications you want to receive."
      >
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          Email Notification Preferences
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose which emails you receive from PrimeContractorOS. Changes take effect immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Types</CardTitle>
          <CardDescription>
            Toggle individual notification types on or off. All notifications are sent to your registered email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {PREF_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center justify-between px-6 py-5">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {PREF_ITEMS.map((item) => {
                const Icon = item.icon;
                const currentValue = prefs ? (prefs as any)[item.key] ?? true : true;
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-6 py-5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-6">
                      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <Label
                          htmlFor={`pref-${item.key}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {item.title}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={`pref-${item.key}`}
                      checked={currentValue}
                      onCheckedChange={(val) => handleToggle(item.key as any, val)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Note: System-critical emails (password resets, security alerts, billing receipts) are always sent regardless of these settings.
      </p>
    
      </PageLayout>
  );
}
