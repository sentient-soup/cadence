import { useState, useCallback } from 'react';
import type { DailyMetrics } from '@fitness/shared';
import { STORAGE_KEYS } from '../storage/keys';
import { getAll, upsertByDate } from '../storage/storage';
import { getISODate, getLastNDays } from '../utils/dateUtils';

export function useMetrics(onMutate?: () => void) {
  const [entries, setEntries] = useState<DailyMetrics[]>(() =>
    getAll<DailyMetrics>(STORAGE_KEYS.DAILY_METRICS).filter((e) => !e.deleted)
  );

  const refresh = useCallback(() => {
    setEntries(getAll<DailyMetrics>(STORAGE_KEYS.DAILY_METRICS).filter((e) => !e.deleted));
  }, []);

  const today = getISODate();
  const todayEntry = entries.find((e) => e.date === today) ?? null;

  const upsertToday = useCallback(
    (partial: Partial<Omit<DailyMetrics, 'id' | 'createdAt' | 'updatedAt' | 'date'>>) => {
      const now = Date.now();
      const existing = getAll<DailyMetrics>(STORAGE_KEYS.DAILY_METRICS).find(
        (e) => e.date === today
      );
      const entry: DailyMetrics = {
        id: existing?.id ?? crypto.randomUUID(),
        date: today,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        ...existing,
        ...partial,
      };
      upsertByDate(STORAGE_KEYS.DAILY_METRICS, entry);
      refresh();
      onMutate?.();
    },
    [today, refresh, onMutate]
  );

  const getEntriesForRange = useCallback(
    (days: number) => {
      const range = new Set(getLastNDays(days));
      return entries.filter((e) => range.has(e.date));
    },
    [entries]
  );

  return { entries, todayEntry, upsertToday, getEntriesForRange, refresh };
}
