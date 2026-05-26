import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../auth';
import type { Request } from 'express';
import type { AuthPayload } from '../auth';
import type { FoodEntry, ExerciseEntry, DailyMetrics, MoodEntry, AppSettings } from '@fitness/shared';

const router = Router();
router.use(requireAuth);

type AuthedRequest = Request & { user: AuthPayload };

// ── helpers ──────────────────────────────────────────────────────────────────

function getChangedSince(table: string, userId: string, since: number) {
  return db.prepare(`SELECT * FROM ${table} WHERE user_id = ? AND updated_at > ?`).all(userId, since);
}

// ── sync endpoint ─────────────────────────────────────────────────────────────

router.post('/', (req, res) => {
  const { userId } = (req as AuthedRequest).user!;
  const { since = 0, changes } = req.body as {
    since: number;
    changes: {
      food: ClientFoodEntry[];
      exercise: ClientExerciseEntry[];
      metrics: ClientMetricsEntry[];
      mood: ClientMoodEntry[];
      settings: ClientSettings | null;
    };
  };

  const syncedAt = Date.now();

  // ── apply client changes ──────────────────────────────────────────────────

  const upsertFood = db.prepare(`
    INSERT INTO food_entries (id, user_id, date, name, meal, calories, protein, carbs, fat, created_at, updated_at, deleted)
    VALUES (@id, @userId, @date, @name, @meal, @calories, @protein, @carbs, @fat, @createdAt, @updatedAt, @deleted)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, meal=excluded.meal, calories=excluded.calories,
      protein=excluded.protein, carbs=excluded.carbs, fat=excluded.fat,
      updated_at=excluded.updated_at, deleted=excluded.deleted
    WHERE excluded.updated_at > food_entries.updated_at
  `);

  const upsertExercise = db.prepare(`
    INSERT INTO exercise_entries (id, user_id, date, name, type, duration_min, sets, distance_miles, avg_heart_rate, calories_burned, notes, created_at, updated_at, deleted)
    VALUES (@id, @userId, @date, @name, @type, @durationMin, @sets, @distanceMiles, @avgHeartRate, @caloriesBurned, @notes, @createdAt, @updatedAt, @deleted)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, type=excluded.type, duration_min=excluded.duration_min,
      sets=excluded.sets, distance_miles=excluded.distance_miles,
      avg_heart_rate=excluded.avg_heart_rate, calories_burned=excluded.calories_burned,
      notes=excluded.notes, updated_at=excluded.updated_at, deleted=excluded.deleted
    WHERE excluded.updated_at > exercise_entries.updated_at
  `);

  const upsertMetrics = db.prepare(`
    INSERT INTO daily_metrics (id, user_id, date, weight_lbs, body_fat_pct, systolic, diastolic, resting_hr, sleep_hours, water_oz, created_at, updated_at, deleted)
    VALUES (@id, @userId, @date, @weightLbs, @bodyFatPct, @systolic, @diastolic, @restingHR, @sleepHours, @waterOz, @createdAt, @updatedAt, @deleted)
    ON CONFLICT(id) DO UPDATE SET
      weight_lbs=excluded.weight_lbs, body_fat_pct=excluded.body_fat_pct,
      systolic=excluded.systolic, diastolic=excluded.diastolic,
      resting_hr=excluded.resting_hr, sleep_hours=excluded.sleep_hours,
      water_oz=excluded.water_oz, updated_at=excluded.updated_at, deleted=excluded.deleted
    WHERE excluded.updated_at > daily_metrics.updated_at
  `);

  const upsertMood = db.prepare(`
    INSERT INTO mood_entries (id, user_id, date, mood_score, energy_level, stress_level, notes, created_at, updated_at, deleted)
    VALUES (@id, @userId, @date, @moodScore, @energyLevel, @stressLevel, @notes, @createdAt, @updatedAt, @deleted)
    ON CONFLICT(id) DO UPDATE SET
      mood_score=excluded.mood_score, energy_level=excluded.energy_level,
      stress_level=excluded.stress_level, notes=excluded.notes,
      updated_at=excluded.updated_at, deleted=excluded.deleted
    WHERE excluded.updated_at > mood_entries.updated_at
  `);

  const upsertSettings = db.prepare(`
    INSERT INTO app_settings (user_id, calorie_goal, water_goal_oz, name, updated_at)
    VALUES (@userId, @calorieGoal, @waterGoalOz, @name, @updatedAt)
    ON CONFLICT(user_id) DO UPDATE SET
      calorie_goal=excluded.calorie_goal, water_goal_oz=excluded.water_goal_oz,
      name=excluded.name, updated_at=excluded.updated_at
    WHERE excluded.updated_at > app_settings.updated_at
  `);

  const applyAll = db.transaction(() => {
    for (const e of changes.food ?? []) {
      upsertFood.run({ ...e, userId, deleted: e.deleted ? 1 : 0 });
    }
    for (const e of changes.exercise ?? []) {
      upsertExercise.run({ ...e, userId, sets: e.sets ? JSON.stringify(e.sets) : null, deleted: e.deleted ? 1 : 0 });
    }
    for (const e of changes.metrics ?? []) {
      upsertMetrics.run({ ...e, userId, deleted: e.deleted ? 1 : 0 });
    }
    for (const e of changes.mood ?? []) {
      upsertMood.run({ ...e, userId, deleted: e.deleted ? 1 : 0 });
    }
    if (changes.settings) {
      upsertSettings.run({ userId, ...changes.settings });
    }
  });

  applyAll();

  // ── return server changes since last sync ─────────────────────────────────

  const rawFood = getChangedSince('food_entries', userId, since) as RawFoodRow[];
  const rawExercise = getChangedSince('exercise_entries', userId, since) as RawExerciseRow[];
  const rawMetrics = getChangedSince('daily_metrics', userId, since) as RawMetricsRow[];
  const rawMood = getChangedSince('mood_entries', userId, since) as RawMoodRow[];
  const rawSettings = db.prepare('SELECT * FROM app_settings WHERE user_id = ?').get(userId) as RawSettingsRow | undefined;

  res.json({
    syncedAt,
    serverChanges: {
      food: rawFood.map(toFoodEntry),
      exercise: rawExercise.map(toExerciseEntry),
      metrics: rawMetrics.map(toMetricsEntry),
      mood: rawMood.map(toMoodEntry),
      settings: rawSettings ? toSettings(rawSettings) : null,
    },
  });
});

// ── row → client shape mappers ────────────────────────────────────────────────

interface RawFoodRow { id: string; date: string; name: string; meal: string; calories: number; protein: number | null; carbs: number | null; fat: number | null; created_at: number; updated_at: number; deleted: number; }
interface RawExerciseRow { id: string; date: string; name: string; type: string; duration_min: number | null; sets: string | null; distance_miles: number | null; avg_heart_rate: number | null; calories_burned: number | null; notes: string | null; created_at: number; updated_at: number; deleted: number; }
interface RawMetricsRow { id: string; date: string; weight_lbs: number | null; body_fat_pct: number | null; systolic: number | null; diastolic: number | null; resting_hr: number | null; sleep_hours: number | null; water_oz: number | null; created_at: number; updated_at: number; deleted: number; }
interface RawMoodRow { id: string; date: string; mood_score: number; energy_level: number; stress_level: number; notes: string | null; created_at: number; updated_at: number; deleted: number; }
interface RawSettingsRow { user_id: string; calorie_goal: number; water_goal_oz: number; name: string | null; updated_at: number; }

function toFoodEntry(r: RawFoodRow) { return { id: r.id, date: r.date, name: r.name, meal: r.meal, calories: r.calories, protein: r.protein ?? undefined, carbs: r.carbs ?? undefined, fat: r.fat ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at, deleted: r.deleted === 1 }; }
function toExerciseEntry(r: RawExerciseRow) { return { id: r.id, date: r.date, name: r.name, type: r.type, durationMin: r.duration_min ?? undefined, sets: r.sets ? JSON.parse(r.sets) : undefined, distanceMiles: r.distance_miles ?? undefined, avgHeartRate: r.avg_heart_rate ?? undefined, caloriesBurned: r.calories_burned ?? undefined, notes: r.notes ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at, deleted: r.deleted === 1 }; }
function toMetricsEntry(r: RawMetricsRow) { return { id: r.id, date: r.date, weightLbs: r.weight_lbs ?? undefined, bodyFatPct: r.body_fat_pct ?? undefined, systolic: r.systolic ?? undefined, diastolic: r.diastolic ?? undefined, restingHR: r.resting_hr ?? undefined, sleepHours: r.sleep_hours ?? undefined, waterOz: r.water_oz ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at, deleted: r.deleted === 1 }; }
function toMoodEntry(r: RawMoodRow) { return { id: r.id, date: r.date, moodScore: r.mood_score, energyLevel: r.energy_level, stressLevel: r.stress_level, notes: r.notes ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at, deleted: r.deleted === 1 }; }
function toSettings(r: RawSettingsRow) { return { calorieGoal: r.calorie_goal, waterGoalOz: r.water_goal_oz, name: r.name ?? undefined, updatedAt: r.updated_at }; }

// Re-export shared types for use as request body shapes
type ClientFoodEntry     = FoodEntry;
type ClientExerciseEntry = ExerciseEntry;
type ClientMetricsEntry  = DailyMetrics;
type ClientMoodEntry     = MoodEntry;
type ClientSettings      = AppSettings & { updatedAt: number };

export default router;
