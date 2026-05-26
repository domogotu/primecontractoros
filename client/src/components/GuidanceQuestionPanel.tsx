import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, ListTodo, X, Lightbulb, Shield
} from "lucide-react";

interface GuidanceQuestionPanelProps {
  pageContext: string;
  recordType?: string;
  recordId?: number;
  recordData?: Record<string, unknown>;
}

export default function GuidanceQuestionPanel({
  pageContext,
  recordType,
  recordId,
  recordData,
}: GuidanceQuestionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedLocal, setDismissedLocal] = useState<number[]>([]);

  const { data: questions = [], isLoading } = trpc.guidanceQuestions.getQuestionsForPage.useQuery({
    pageContext,
    recordType,
    recordId,
    limit: 5,
  });

  const evaluateMutation = trpc.guidanceQuestions.evaluateRecord.useMutation();
  const { data: nextAction } = trpc.guidanceQuestions.getNextBestAction.useQuery({
    pageContext,
    recordType,
    recordData,
  });

  const dismissMutation = trpc.guidanceQuestions.dismissQuestion.useMutation();
  const convertMutation = trpc.guidanceQuestions.convertToTask.useMutation();

  const visibleQuestions = questions.filter((q: any) => !dismissedLocal.includes(q.id));

  const handleDismiss = (questionId: number) => {
    setDismissedLocal(prev => [...prev, questionId]);
    if (questionId > 0) {
      dismissMutation.mutate({ questionId });
    }
  };

  const handleConvertToTask = (question: typeof questions[0]) => {
    convertMutation.mutate({
      questionId: question.id,
      title: question.questionText,
      description: `Guidance: ${question.nextBestAction || "Review and complete this action"}`,
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 animate-pulse" />
            Loading guidance questions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleQuestions.length === 0 && !nextAction) return null;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            Guidance Question Engine
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-4 pb-3 pt-0 space-y-3">
          {/* Next Best Action */}
          {nextAction && (
            <div className="bg-white rounded-lg border border-blue-100 p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700">Next Best Action</p>
                  <p className="text-sm text-gray-900 mt-0.5">{nextAction.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{nextAction.reason}</p>
                </div>
                <Badge className={`text-[10px] ${getPriorityColor(nextAction.priority)}`}>
                  {nextAction.priority}
                </Badge>
              </div>
            </div>
          )}

          {/* Questions */}
          {visibleQuestions.map((question: any) => (
            <div key={question.id} className="bg-white rounded-lg border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{question.questionText}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {question.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {question.dimension}
                      </Badge>
                      <Badge className={`text-[10px] ${getPriorityColor(question.priority)}`}>
                        {question.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleConvertToTask(question)}
                    title="Convert to task"
                  >
                    <ListTodo className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDismiss(question.id)}
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Checks */}
              {question.checks.length > 0 && (
                <div className="mt-2 space-y-1 pl-6">
                  {question.checks.map((check: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs">
                      {getSeverityIcon(check.severity)}
                      <span className={check.passed ? "text-gray-600" : "text-gray-900 font-medium"}>
                        {check.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Next action for this question */}
              {question.nextBestAction && (
                <div className="mt-2 pl-6">
                  <p className="text-xs text-blue-700 font-medium">
                    → {question.nextBestAction}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
