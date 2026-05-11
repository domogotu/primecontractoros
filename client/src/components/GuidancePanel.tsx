import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ChevronRight, Settings, Loader2 } from "lucide-react";

interface GuidancePanelProps {
  compact?: boolean;
  showPreferences?: boolean;
}

export const GuidancePanel: React.FC<GuidancePanelProps> = ({
  compact = false,
  showPreferences = true,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [preferenceMode, setPreferenceMode] = useState<"detailed" | "balanced" | "light">("balanced");

  // Fetch next best action
  const { data: nextAction, isLoading: loadingAction } = trpc.guidance.getNextBestAction.useQuery();

  // Fetch all actions
  const { data: allActions = [], isLoading: loadingActions } = trpc.guidance.getAllActions.useQuery();

  // Fetch user preferences
  const { data: preferences } = trpc.guidance.getPreference.useQuery();

  // Update preference mutation
  const updatePrefMutation = trpc.guidance.updatePreference.useMutation();

  // Log event mutation
  const logEventMutation = trpc.guidance.logEvent.useMutation();

  const handleDismiss = async () => {
    if (nextAction?.id) {
      await logEventMutation.mutateAsync({
        eventType: "dismissed",
        actionId: nextAction.id,
      });
    }
  };

  const handleAccept = async () => {
    if (nextAction?.id) {
      await logEventMutation.mutateAsync({
        eventType: "accepted",
        actionId: nextAction.id,
      });
    }
  };

  const handleUpdatePreference = async (mode: "detailed" | "balanced" | "light") => {
    setPreferenceMode(mode);
    await updatePrefMutation.mutateAsync({ mode });
  };

  if (compact && nextAction) {
    return (
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {nextAction.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {nextAction.description}
            </p>
            {nextAction.category && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {nextAction.category}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="flex-shrink-0"
            onClick={handleAccept}
            disabled={updatePrefMutation.isPending}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">What Do I Do Next?</h2>
        </div>
        {showPreferences && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && showPreferences && (
        <Card className="p-4 bg-gray-100/50">
          <h3 className="font-semibold text-sm mb-3">Guidance Preferences</h3>
          <div className="space-y-2">
            {(["detailed", "balanced", "light"] as const).map((mode) => (
              <Button
                key={mode}
                variant={preferenceMode === mode ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleUpdatePreference(mode)}
                disabled={updatePrefMutation.isPending}
              >
                {updatePrefMutation.isPending && (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                )}
                <span className="capitalize">{mode} Guidance</span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Next Best Action */}
      {loadingAction ? (
        <Card className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </Card>
      ) : nextAction ? (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {nextAction.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {nextAction.description}
                  </p>
                </div>
                {nextAction.priority && (
                  <Badge
                    variant={
                      nextAction.priority === "high"
                        ? "destructive"
                        : nextAction.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {nextAction.priority}
                  </Badge>
                )}
              </div>

              {nextAction.category && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Category:</span>
                  <Badge variant="outline">{nextAction.category}</Badge>
                </div>
              )}

              {nextAction.rationale && (
                <div className="mt-4 p-3 bg-white rounded border border-blue-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Why this action?
                  </p>
                  <p className="text-sm text-gray-900">{nextAction.rationale}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAccept}
                disabled={updatePrefMutation.isPending}
                className="flex-1"
              >
                {updatePrefMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Got It
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={updatePrefMutation.isPending}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-sm text-gray-500">
            No actions needed right now. Keep up the great work!
          </p>
        </Card>
      )}

      {/* All Actions List */}
      {!compact && allActions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Other Suggested Actions</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allActions.map((action) => (
              <Card key={action.id} className="p-3 hover:bg-gray-100/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {action.description}
                    </p>
                  </div>
                  {action.category && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {action.category}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Loading State for All Actions */}
      {loadingActions && !nextAction && (
        <Card className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </Card>
      )}
    </div>
  );
};
