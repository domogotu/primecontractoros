import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  BarChart3, Clock, Activity, Heart, Briefcase,
  AlertTriangle, CheckCircle2, XCircle, Loader2
} from "lucide-react";

export default function DashboardWidgets() {
  const { data: dashData, isLoading } = trpc.efficiency.getDashboardData.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!dashData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pipeline Summary */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-500" />
            Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{dashData.pipelineSummary.total}</p>
          <p className="text-xs text-muted-foreground mb-2">Total opportunities</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(dashData.pipelineSummary.byStatus).map(([status, count]) => (
              <Badge key={status} variant="outline" className="text-[10px]">
                {status}: {count as number}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{dashData.upcomingDeadlines.length}</p>
          <p className="text-xs text-muted-foreground mb-2">Due in 30 days</p>
          <div className="space-y-1">
            {dashData.upcomingDeadlines.slice(0, 3).map((d: any) => (
              <div key={d.id} className="flex items-center gap-1 text-xs">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="truncate flex-1">{d.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{dashData.recentActivity.length}</p>
          <p className="text-xs text-muted-foreground mb-2">Updates this week</p>
          <div className="space-y-1">
            {dashData.recentActivity.slice(0, 3).map((a: any) => (
              <div key={a.id} className="flex items-center gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="truncate flex-1">{a.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Health */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Health
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{dashData.contractHealth.total}</p>
          <p className="text-xs text-muted-foreground mb-2">Active contracts</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs">{dashData.contractHealth.healthy}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs">{dashData.contractHealth.atRisk}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs">{dashData.contractHealth.critical}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
