import { Sparkles, Check, X } from "lucide-react";
import { useState } from "react";

interface AutoPopulationBannerProps {
  sourceLabel: string;
  fieldsApplied: string[];
  onAccept?: () => void;
  onDismiss?: () => void;
}

export default function AutoPopulationBanner({
  sourceLabel,
  fieldsApplied,
  onAccept,
  onDismiss,
}: AutoPopulationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || fieldsApplied.length === 0) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-indigo-900">
              Auto-populated from {sourceLabel}
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Fields filled: {fieldsApplied.join(", ")}
            </p>
            <p className="text-xs text-indigo-600 mt-1 italic">
              Review the values below and edit as needed.
            </p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {onAccept && (
            <button
              onClick={onAccept}
              className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
              title="Confirm auto-fill"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => {
                setDismissed(true);
                onDismiss();
              }}
              className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
