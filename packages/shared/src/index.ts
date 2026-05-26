export interface BaseEntry {
  id: string;
  date: string; // "2026-05-24"
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface FoodEntry extends BaseEntry {
  name: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface StrengthSet {
  reps: number;
  weightLbs: number;
}

export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'sport';

export interface ExerciseEntry extends BaseEntry {
  name: string;
  type: ExerciseType;
  durationMin?: number;
  sets?: StrengthSet[];
  distanceMiles?: number;
  avgHeartRate?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface DailyMetrics extends BaseEntry {
  weightLbs?: number;
  bodyFatPct?: number;
  systolic?: number;
  diastolic?: number;
  restingHR?: number;
  sleepHours?: number;
  waterOz?: number;
}

export interface MoodEntry extends BaseEntry {
  moodScore: number;
  energyLevel: number;
  stressLevel: number;
  notes?: string;
}

export interface AppSettings {
  calorieGoal: number;
  waterGoalOz: number;
  name?: string;
  updatedAt?: number;
}

export interface AuthState {
  token: string;
  username: string;
}
