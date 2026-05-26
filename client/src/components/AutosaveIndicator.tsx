import { Cloud, CloudOff, Loader2, Check } from "lucide-react";

interface AutosaveIndicatorProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

export default function AutosaveIndicator({ isSaving, hasUnsavedChanges, lastSaved }: AutosaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600">
        <CloudOff className="h-3 w-3" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    const timeAgo = getTimeAgo(lastSaved);
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600">
        <Check className="h-3 w-3" />
        <span>Saved {timeAgo}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Cloud className="h-3 w-3" />
      <span>Auto-save enabled</span>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}
