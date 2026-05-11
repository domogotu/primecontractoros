import React, { useState, useEffect } from "react";
import { ChevronDown, Lightbulb, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface AIGuidancePanelProps {
  recordType: string;
  recordId: number;
  context: string;
  title?: string;
}

export function AIGuidancePanel({
  
  recordType,
  recordId,
  context,
  title = "AI Assistant",
}: AIGuidancePanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get suggestions
  const { data: suggestions = [], refetch: refetchSuggestions } = trpc.ai.getSuggestions.useQuery(
    {
      
      recordType,
      recordId,
    },
    { enabled: isOpen }
  );

  // Generate guidance mutation
  const generateGuidance = trpc.ai.generateGuidance.useMutation({
    onSuccess: () => {
      refetchSuggestions();
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error("Error generating guidance:", error);
      setIsGenerating(false);
    },
  });

  // Dismiss suggestion mutation
  const dismissSuggestion = trpc.ai.dismissSuggestion.useMutation({
    onSuccess: () => {
      refetchSuggestions();
    },
  });

  // Accept suggestion mutation
  const acceptSuggestion = trpc.ai.acceptSuggestion.useMutation({
    onSuccess: () => {
      refetchSuggestions();
    },
  });

  // Auto-generate guidance on mount
  useEffect(() => {
    if (isOpen && suggestions.length === 0 && !isGenerating) {
      setIsGenerating(true);
      generateGuidance.mutate({
        
        recordType,
        recordId,
        context,
      });
    }
  }, [isOpen]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-amber-100 text-amber-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {suggestions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {suggestions.length}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-gray-200 p-4 space-y-3">
          {isGenerating && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-gray-500">Analyzing...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">No suggestions at this time.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsGenerating(true);
                  generateGuidance.mutate({
                    
                    recordType,
                    recordId,
                    context,
                  });
                }}
              >
                Generate Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion: any) => (
                <Card key={suggestion.id} className="p-3 bg-gray-100/30 border-muted">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">
                        {suggestion.suggestionTitle}
                      </h4>
                      {suggestion.priority && (
                        <Badge className={`mt-1 ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {suggestion.suggestionText}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() =>
                        acceptSuggestion.mutate({
                          id: suggestion.id,
                          
                        })
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() =>
                        dismissSuggestion.mutate({
                          id: suggestion.id,
                          
                        })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                    {suggestion.suggestedAction && (
                      <Button size="sm" variant="outline" className="h-8">
                        <Plus className="h-4 w-4 mr-1" />
                        Create Task
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
