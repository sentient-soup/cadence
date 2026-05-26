import type { FoodEntry, ExerciseEntry, DailyMetrics, MoodEntry } from '@fitness/shared';
import { getLastNDays, groupByDate, formatDayLabel } from './dateUtils';
import { sumCalories, calcDailyVolume } from './calcUtils';

export interface WeightPoint {
  date: string;
  weight: number | null;
}

export interface CaloriePoint {
  date: string;
  calories: number;
  goal: number;
}

export interface VolumePoint {
  date: string;
  volumeLbs: number;
  sessions: number;
}

export interface MoodPoint {
  date: string;
  mood: number | null;
  energy: number | null;
  stress: number | null;
}

export interface MetricsPoint {
  date: string;
  hr: number | null;
  systolic: number | null;
  diastolic: number | null;
  sleep: number | null;
  weight: number | null;
}

export function toWeightPoints(metrics: DailyMetrics[], days: number): WeightPoint[] {
  const grouped = groupByDate(metrics);
  return getLastNDays(days).map((d) => {
    const entry = grouped.get(d)?.[0];
    return { date: formatDayLabel(d), weight: entry?.weightLbs ?? null };
  });
}

export function toCaloriePoints(food: FoodEntry[], days: number, goal: number): CaloriePoint[] {
  const grouped = groupByDate(food);
  return getLastNDays(days).map((d) => ({
    date: formatDayLabel(d),
    calories: sumCalories(grouped.get(d) ?? []),
    goal,
  }));
}

export function toVolumePoints(exercises: ExerciseEntry[], days: number): VolumePoint[] {
  const grouped = groupByDate(exercises);
  return getLastNDays(days).map((d) => {
    const entries = grouped.get(d) ?? [];
    return {
      date: formatDayLabel(d),
      volumeLbs: calcDailyVolume(entries),
      sessions: entries.length,
    };
  });
}

export function toMoodPoints(moods: MoodEntry[], days: number): MoodPoint[] {
  const grouped = groupByDate(moods);
  return getLastNDays(days).map((d) => {
    const entry = grouped.get(d)?.[0];
    return {
      date: formatDayLabel(d),
      mood: entry?.moodScore ?? null,
      energy: entry?.energyLevel ?? null,
      stress: entry?.stressLevel ?? null,
    };
  });
}

export function toMetricsPoints(metrics: DailyMetrics[], days: number): MetricsPoint[] {
  const grouped = groupByDate(metrics);
  return getLastNDays(days).map((d) => {
    const entry = grouped.get(d)?.[0];
    return {
      date: formatDayLabel(d),
      hr: entry?.restingHR ?? null,
      systolic: entry?.systolic ?? null,
      diastolic: entry?.diastolic ?? null,
      sleep: entry?.sleepHours ?? null,
      weight: entry?.weightLbs ?? null,
    };
  });
}
