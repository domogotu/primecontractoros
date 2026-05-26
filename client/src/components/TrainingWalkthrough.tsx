import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { X, ChevronRight, ChevronLeft, GraduationCap, CheckCircle2 } from "lucide-react";

interface TrainingStep {
  title: string;
  content: string;
  target?: string;
  position?: string;
}

interface TrainingWalkthroughProps {
  pageContext: string;
}

export default function TrainingWalkthrough({ pageContext }: TrainingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: module, isLoading } = trpc.training.getModulesForPage.useQuery(
    { targetPage: pageContext },
    { enabled: !isDismissed }
  );

  const markCompleteMutation = trpc.training.markComplete.useMutation();

  // Don't show if already completed or dismissed
  if (isLoading || isDismissed || !module || module.isCompleted) return null;

  const steps: TrainingStep[] = module.steps || [];
  if (steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (module.id) {
      markCompleteMutation.mutate({ moduleId: module.id });
    }
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <Card className="border-blue-200 shadow-lg bg-white">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">
                {module.title}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDismiss}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Step content */}
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-1">{currentStepData?.title}</h4>
            <p className="text-sm text-muted-foreground">{currentStepData?.content}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? "w-4 bg-blue-600" :
                  idx < currentStep ? "w-1.5 bg-blue-300" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="text-xs"
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Back
            </Button>

            <span className="text-[10px] text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>

            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
