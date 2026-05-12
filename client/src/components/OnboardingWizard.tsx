// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ArrowRight, Building2, FileText, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = [
  { id: 1, title: "Company Profile", description: "Set up your business details", icon: Building2 },
  { id: 2, title: "Certifications", description: "Add your business certifications", icon: FileText },
  { id: 3, title: "Team Members", description: "Invite your team", icon: Users },
  { id: 4, title: "First Opportunity", description: "Track your first opportunity", icon: Target },
];

export default function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState([]);
  const completeStep = (stepId) => {
    if (!completed.includes(stepId)) setCompleted([...completed, stepId]);
    if (stepId < steps.length) setCurrentStep(stepId + 1);
    else if (onComplete) onComplete();
  };
  return (
    <Card className="p-6 border-blue-200 bg-blue-50/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
          <p className="text-sm text-gray-500">Complete these steps to set up your workspace</p>
        </div>
        <span className="text-sm font-medium text-blue-600">{completed.length}/{steps.length} complete</span>
      </div>
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isComplete = completed.includes(step.id);
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className={"flex items-center gap-4 p-3 rounded-lg transition-colors " + (isCurrent ? "bg-white border border-blue-200 shadow-sm" : "bg-transparent")}>
              <div className={"w-8 h-8 rounded-full flex items-center justify-center " + (isComplete ? "bg-green-100" : isCurrent ? "bg-blue-100" : "bg-gray-100")}>
                {isComplete ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Icon className={"h-4 w-4 " + (isCurrent ? "text-blue-600" : "text-gray-400")} />}
              </div>
              <div className="flex-1">
                <p className={"text-sm font-medium " + (isComplete ? "text-green-700 line-through" : "text-gray-900")}>{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {isCurrent && !isComplete && (
                <Button size="sm" onClick={() => completeStep(step.id)}>Complete <ArrowRight className="h-3 w-3 ml-1" /></Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
