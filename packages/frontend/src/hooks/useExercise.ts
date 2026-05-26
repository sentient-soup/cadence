import { useState, useCallback } from 'react';
import type { ExerciseEntry } from '@fitness/shared';
import { STORAGE_KEYS } from '../storage/keys';
import { getAll, appendEntry, deleteEntry } from '../storage/storage';
import { getISODate, getLastNDays, groupByDate, formatDayLabel } from '../utils/dateUtils';
import { calcDailyVolume } from '../utils/calcUtils';

export function useExercise(onMutate?: () => void) {
  const [entries, setEntries] = useState<ExerciseEntry[]>(() =>
    getAll<ExerciseEntry>(STORAGE_KEYS.EXERCISE_ENTRIES).filter((e) => !e.deleted)
  );

  const refresh = useCallback(() => {
    setEntries(getAll<ExerciseEntry>(STORAGE_KEYS.EXERCISE_ENTRIES).filter((e) => !e.deleted));
  }, []);

  const addEntry = useCallback(
    (entry: Omit<ExerciseEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const full: ExerciseEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      appendEntry(STORAGE_KEYS.EXERCISE_ENTRIES, full);
      refresh();
      onMutate?.();
    },
    [refresh, onMutate]
  );

  const removeEntry = useCallback(
    (id: string) => {
      deleteEntry(STORAGE_KEYS.EXERCISE_ENTRIES, id);
      refresh();
      onMutate?.();
    },
    [refresh, onMutate]
  );

  const today = getISODate();
  const todayEntries = entries.filter((e) => e.date === today);
  const todaySummary = {
    sessions: todayEntries.length,
    volumeLbs: calcDailyVolume(todayEntries),
    durationMin: todayEntries.reduce((s, e) => s + (e.durationMin ?? 0), 0),
  };

  const getEntriesForRange = useCallback(
    (days: number) => {
      const range = new Set(getLastNDays(days));
      return entries.filter((e) => range.has(e.date));
    },
    [entries]
  );

  const getDailyVolume = useCallback(
    (days: number) => {
      const rangeEntries = getEntriesForRange(days);
      const grouped = groupByDate(rangeEntries);
      return getLastNDays(days).map((d) => ({
        date: formatDayLabel(d),
        volumeLbs: calcDailyVolume(grouped.get(d) ?? []),
        sessions: (grouped.get(d) ?? []).length,
      }));
    },
    [getEntriesForRange]
  );

  return { entries, todayEntries, todaySummary, addEntry, removeEntry, getEntriesForRange, getDailyVolume, refresh };
}
