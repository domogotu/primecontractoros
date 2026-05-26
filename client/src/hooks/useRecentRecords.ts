import { useState, useEffect, useCallback } from "react";

interface RecentRecord {
  type: string;
  id: number;
  title: string;
  viewedAt: string;
  route: string;
}

const STORAGE_KEY = "primecontractor_recent_records";
const MAX_RECORDS = 10;

export function useRecentRecords() {
  const [records, setRecords] = useState<RecentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecord = useCallback((record: Omit<RecentRecord, "viewedAt">) => {
    setRecords(prev => {
      // Remove existing entry for same record
      const filtered = prev.filter(r => !(r.type === record.type && r.id === record.id));
      // Add to front
      const updated = [{ ...record, viewedAt: new Date().toISOString() }, ...filtered];
      // Keep only MAX_RECORDS
      return updated.slice(0, MAX_RECORDS);
    });
  }, []);

  const clearRecords = useCallback(() => {
    setRecords([]);
  }, []);

  return { records, addRecord, clearRecords };
}
