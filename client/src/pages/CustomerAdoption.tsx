// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp } from "lucide-react";

export default function CustomerAdoption() {
  const { data: metrics, isLoading } = trpc.customerAdoption.getMetrics.useQuery();

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Customer Adoption</h1><p className="text-muted-foreground">Track feature usage and adoption metrics</p></div>
      {isLoading ? <p>Loading...</p> : !metrics?.length ? (
        <Card><CardContent className="py-12 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No adoption data yet. Usage metrics will appear as your team uses features.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((m: any, i: number) => (
            <Card key={i}><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-primary" /><span className="font-medium">{m.featureName}</span></div><p className="text-sm text-muted-foreground">{m.action}</p></CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
