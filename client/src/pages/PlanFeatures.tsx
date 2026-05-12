// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Check, X } from "lucide-react";

export default function PlanFeatures() {
  const { data: features, isLoading } = trpc.planFeatures.getMatrix.useQuery();

  const plans = ["starter", "growth", "advanced"];
  const featureList = [
    { name: "Opportunities", starter: true, growth: true, advanced: true },
    { name: "Proposals", starter: true, growth: true, advanced: true },
    { name: "Contracts", starter: false, growth: true, advanced: true },
    { name: "AI Suggestions", starter: false, growth: true, advanced: true },
    { name: "Team Collaboration", starter: false, growth: false, advanced: true },
    { name: "Document Generation", starter: false, growth: false, advanced: true },
    { name: "Subcontractor Mgmt", starter: false, growth: true, advanced: true },
    { name: "Custom Reports", starter: false, growth: false, advanced: true },
  ];

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Plan Features</h1><p className="text-muted-foreground">Feature availability by subscription plan</p></div>
      <Card>
        <CardContent className="pt-6">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-2">Feature</th>{plans.map(p => <th key={p} className="text-center py-2 capitalize">{p}</th>)}</tr></thead>
            <tbody>
              {featureList.map(f => (
                <tr key={f.name} className="border-b last:border-0">
                  <td className="py-3">{f.name}</td>
                  {plans.map(p => <td key={p} className="text-center">{f[p] ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
