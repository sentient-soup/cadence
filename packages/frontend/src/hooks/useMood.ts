import { useState, useCallback } from 'react';
import type { MoodEntry } from '@fitness/shared';
import { STORAGE_KEYS } from '../storage/keys';
import { getAll, upsertByDate } from '../storage/storage';
import { getISODate, getLastNDays } from '../utils/dateUtils';

export function useMood(onMutate?: () => void) {
  const [entries, setEntries] = useState<MoodEntry[]>(() =>
    getAll<MoodEntry>(STORAGE_KEYS.MOOD_ENTRIES).filter((e) => !e.deleted)
  );

  const refresh = useCallback(() => {
    setEntries(getAll<MoodEntry>(STORAGE_KEYS.MOOD_ENTRIES).filter((e) => !e.deleted));
  }, []);

  const today = getISODate();
  const todayEntry = entries.find((e) => e.date === today) ?? null;

  const upsertToday = useCallback(
    (data: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt' | 'date'>) => {
      const now = Date.now();
      const existing = getAll<MoodEntry>(STORAGE_KEYS.MOOD_ENTRIES).find(
        (e) => e.date === today
      );
      const entry: MoodEntry = {
        id: existing?.id ?? crypto.randomUUID(),
        date: today,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        ...data,
      };
      upsertByDate(STORAGE_KEYS.MOOD_ENTRIES, entry);
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
