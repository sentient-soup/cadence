import { useState, useCallback } from 'react';
import type { FoodEntry } from '@fitness/shared';
import { STORAGE_KEYS } from '../storage/keys';
import { getAll, appendEntry, deleteEntry } from '../storage/storage';
import { getISODate, getLastNDays } from '../utils/dateUtils';
import { sumCalories, sumMacros } from '../utils/calcUtils';

export function useCalories(onMutate?: () => void) {
  const [entries, setEntries] = useState<FoodEntry[]>(() =>
    getAll<FoodEntry>(STORAGE_KEYS.FOOD_ENTRIES).filter((e) => !e.deleted)
  );

  const refresh = useCallback(() => {
    setEntries(getAll<FoodEntry>(STORAGE_KEYS.FOOD_ENTRIES).filter((e) => !e.deleted));
  }, []);

  const addEntry = useCallback(
    (entry: Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const full: FoodEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      appendEntry(STORAGE_KEYS.FOOD_ENTRIES, full);
      refresh();
      onMutate?.();
    },
    [refresh, onMutate]
  );

  const removeEntry = useCallback(
    (id: string) => {
      deleteEntry(STORAGE_KEYS.FOOD_ENTRIES, id);
      refresh();
      onMutate?.();
    },
    [refresh, onMutate]
  );

  const today = getISODate();
  const todayEntries = entries.filter((e) => e.date === today);
  const todayTotals = {
    calories: sumCalories(todayEntries),
    ...sumMacros(todayEntries),
  };

  const getEntriesForRange = useCallback(
    (days: number) => {
      const range = new Set(getLastNDays(days));
      return entries.filter((e) => range.has(e.date));
    },
    [entries]
  );

  return { entries, todayEntries, todayTotals, addEntry, removeEntry, getEntriesForRange, refresh };
}
