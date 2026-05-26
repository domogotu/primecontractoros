import { useEffect, useRef, useState, useCallback } from "react";

interface UseAutosaveOptions {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void> | void;
  interval?: number; // ms, default 30000 (30 seconds)
  enabled?: boolean;
}

export function useAutosave({ data, onSave, interval = 30000, enabled = true }: UseAutosaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previousDataRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track changes
  useEffect(() => {
    const serialized = JSON.stringify(data);
    if (serialized !== previousDataRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [data]);

  // Autosave on interval
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(async () => {
      const serialized = JSON.stringify(data);
      if (serialized !== previousDataRef.current && hasUnsavedChanges) {
        setIsSaving(true);
        try {
          await onSave(data);
          previousDataRef.current = serialized;
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Autosave failed:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data, onSave, interval, enabled, hasUnsavedChanges]);

  // Manual save
  const saveNow = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      previousDataRef.current = JSON.stringify(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Manual save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave]);

  // Reset tracking (e.g., after initial load)
  const resetTracking = useCallback(() => {
    previousDataRef.current = JSON.stringify(data);
    setHasUnsavedChanges(false);
  }, [data]);

  return {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveNow,
    resetTracking,
  };
}
