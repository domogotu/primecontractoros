import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

export interface NextAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface WhatsNextProps {
  actions: NextAction[];
  title?: string;
  isLoading?: boolean;
}

export default function WhatsNext({
  actions,
  title = "WHAT'S NEXT",
  isLoading = false,
}: WhatsNextProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Loading next steps...</p>
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="text-center py-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">All set! No immediate actions needed.</p>
        </div>
      </div>
    );
  }

  // Sort by priority: high, medium, low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedActions = [...actions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-3">
        {sortedActions.map((action, index) => (
          <div
            key={action.id}
            className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
              action.completed
                ? 'bg-green-50 border-green-200'
                : action.priority === 'high'
                ? 'bg-red-50 border-red-200'
                : action.priority === 'medium'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {/* Step Number or Checkmark */}
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                action.completed
                  ? 'bg-green-600 text-white'
                  : action.priority === 'high'
                  ? 'bg-red-600 text-white'
                  : action.priority === 'medium'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {action.completed ? '✓' : index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${
                  action.completed ? 'text-green-900 line-through' : 'text-gray-900'
                }`}
              >
                {action.title}
              </p>
              {action.description && (
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              )}
            </div>

            {/* Action Button */}
            {action.action && !action.completed && (
              <Button
                size="sm"
                variant="outline"
                onClick={action.action.onClick}
                className="flex-shrink-0 ml-2"
              >
                {action.action.label}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
