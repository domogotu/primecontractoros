import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export type LifecycleStage = "opportunity" | "proposal" | "awarded" | "active" | "closeout" | "closed" | "lessons";

interface LifecycleIndicatorProps {
  currentStage: LifecycleStage;
  compact?: boolean;
}

const STAGES: { key: LifecycleStage; label: string }[] = [
  { key: "opportunity", label: "Opportunity" },
  { key: "proposal", label: "Proposal" },
  { key: "awarded", label: "Awarded" },
  { key: "active", label: "Active Ops" },
  { key: "closeout", label: "Closeout" },
  { key: "closed", label: "Closed" },
];

export default function LifecycleIndicator({ currentStage, compact = false }: LifecycleIndicatorProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
        <span className="text-blue-600 font-medium">
          {STAGES[currentIndex]?.label || currentStage}
        </span>
        {currentIndex < STAGES.length - 1 && (
          <>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-500">{STAGES[currentIndex + 1]?.label}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contract Lifecycle</h4>
      <div className="flex items-center justify-between">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={stage.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : isCurrent
                      ? "bg-blue-100 text-blue-600 ring-2 ring-blue-300"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-[10px] mt-1 ${isCurrent ? "text-blue-600 font-semibold" : "text-gray-500"}`}>
                  {stage.label}
                </span>
              </div>
              {index < STAGES.length - 1 && (
                <div className={`w-6 h-0.5 mx-0.5 ${isCompleted ? "bg-green-200" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
