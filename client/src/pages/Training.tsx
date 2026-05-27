import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";
import { GraduationCap, CheckCircle2, Play, RotateCcw, BookOpen } from "lucide-react";

export default function Training() {
  const [, navigate] = useLocation();
  const { data: modules = [], isLoading, refetch } = trpc.training.getAllModules.useQuery();
  const resetMutation = trpc.training.resetProgress.useMutation({
    onSuccess: () => refetch(),
  });

  const completedCount = modules.filter((m: any) => m.isCompleted).length;
  const totalCount = modules.length;

  const pageMap: Record<string, string> = {
    dashboard: "/app/dashboard",
    opportunities: "/app/opportunities",
    proposals: "/app/proposals",
    contracts: "/app/contracts",
    files: "/app/files",
    invoices: "/app/invoices",
    payments: "/app/payments",
    closeout: "/app/closeout",
    sam_search: "/app/sam-search",
    onboarding: "/app/onboarding",
    "business-profile": "/app/business-profile",
  };

  return (
    <PageLayout
      title="Training Center"
      subtitle="Interactive walkthroughs and guided tutorials to help you master PrimeContractorOS"
      label="Learning"
      summaryCards={[
        { label: "Total Modules", value: totalCount },
        { label: "Completed", value: completedCount, color: "text-green-600" },
        { label: "Remaining", value: totalCount - completedCount, color: "text-amber-600" },
        { label: "Progress", value: totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : "0%", color: "text-blue-600" },
      ]}
      actions={
        <Button
          variant="outline"
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {resetMutation.isPending ? "Resetting..." : "Reset Progress"}
        </Button>
      }
    >
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Learning Progress</h3>
              <p className="text-sm text-gray-600">
                Complete walkthroughs to learn how to use each section of the platform effectively.
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completedCount} of {totalCount} modules completed
          </p>
        </CardContent>
      </Card>

      {/* Module List */}
      {isLoading ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Loading training modules...</p>
        </Card>
      ) : modules.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Training Modules Available</h3>
          <p className="text-gray-600">Training modules will appear here as they become available.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module: any) => (
            <Card
              key={module.id}
              className={`bg-white border hover:shadow-md transition-shadow ${
                module.isCompleted ? "border-green-200 bg-green-50/30" : "border-gray-200"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{module.title}</h4>
                      {module.isCompleted && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{module.steps?.length || 0} steps</span>
                      <span className="text-gray-300">|</span>
                      <span>Page: {module.targetPage}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const path = pageMap[module.targetPage];
                      if (path) navigate(path);
                    }}
                    className={module.isCompleted ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {module.isCompleted ? "Review" : "Start"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
