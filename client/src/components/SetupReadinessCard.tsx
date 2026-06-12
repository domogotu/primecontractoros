import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function SetupReadinessCard() {
  const { data: readiness } = trpc.dashboardData.getSetupReadiness.useQuery();

  if (!readiness) return null;

  const checks = [
    { key: "hasBusinessProfile", label: "Business Profile created", path: "/app/business-profile" },
    { key: "hasUEI", label: "UEI number entered", path: "/app/business-profile" },
    { key: "hasCAGE", label: "CAGE code entered", path: "/app/business-profile" },
    { key: "hasSAM", label: "SAM status confirmed", path: "/app/business-profile" },
    { key: "hasNAICS", label: "Primary NAICS code set", path: "/app/business-profile" },
  ];

  const completedCount = checks.filter((c) => readiness[c.key as keyof typeof readiness]).length;
  const allComplete = completedCount === checks.length;

  if (allComplete) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Entity Readiness</h3>
        <span className="text-xs text-gray-500">{completedCount}/{checks.length} complete</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${(completedCount / checks.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-2">
        {checks.map((check) => {
          const done = readiness[check.key as keyof typeof readiness];
          return (
            <li key={check.key} className="flex items-center gap-2">
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <Link href={check.path} className={`text-sm ${done ? "text-gray-500 line-through" : "text-gray-700 hover:text-blue-600"}`}>
                {check.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {!allComplete && (
        <p className="mt-3 text-xs text-amber-700 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Complete these before pursuing opportunities
        </p>
      )}
    </div>
  );
}
