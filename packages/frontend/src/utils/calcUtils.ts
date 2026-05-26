import type { FoodEntry, ExerciseEntry } from '@cadence/shared';

export function sumCalories(entries: FoodEntry[]): number {
  return entries.reduce((sum, e) => sum + e.calories, 0);
}

export function sumMacros(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      protein: acc.protein + (e.protein ?? 0),
      carbs: acc.carbs + (e.carbs ?? 0),
      fat: acc.fat + (e.fat ?? 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
}

export function calcExerciseVolume(entry: ExerciseEntry): number {
  if (!entry.sets?.length) return 0;
  return entry.sets.reduce((sum, s) => sum + s.reps * s.weightLbs, 0);
}

export function calcDailyVolume(entries: ExerciseEntry[]): number {
  return entries.reduce((sum, e) => sum + calcExerciseVolume(e), 0);
}
