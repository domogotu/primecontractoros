import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './ui/button';

export interface ValidationWarning {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
  onDismiss?: (id: string) => void;
}

export default function ValidationWarnings({
  warnings,
  onDismiss,
}: ValidationWarningsProps) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    onDismiss?.(id);
  };

  const visibleWarnings = warnings.filter((w) => !dismissed.has(w.id));

  if (visibleWarnings.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      {visibleWarnings.map((warning) => {
        const isError = warning.type === 'error';
        const isWarning = warning.type === 'warning';
        const isInfo = warning.type === 'info';

        const bgColor = isError
          ? 'bg-red-50 border-red-200'
          : isWarning
          ? 'bg-amber-50 border-amber-200'
          : 'bg-blue-50 border-blue-200';

        const textColor = isError
          ? 'text-red-900'
          : isWarning
          ? 'text-amber-900'
          : 'text-blue-900';

        const iconColor = isError
          ? 'text-red-600'
          : isWarning
          ? 'text-amber-600'
          : 'text-blue-600';

        const Icon = isError
          ? AlertTriangle
          : isWarning
          ? AlertCircle
          : Info;

        return (
          <div
            key={warning.id}
            className={`border rounded-lg p-4 flex items-start gap-3 ${bgColor}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textColor}`}>{warning.message}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {warning.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={warning.action.onClick}
                  className="text-xs"
                >
                  {warning.action.label}
                </Button>
              )}
              {warning.dismissible && (
                <button
                  onClick={() => handleDismiss(warning.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
