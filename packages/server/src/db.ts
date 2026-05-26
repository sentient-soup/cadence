import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'cadence.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS food_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    meal TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL,
    carbs REAL,
    fat REAL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS exercise_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    duration_min REAL,
    sets TEXT,
    distance_miles REAL,
    avg_heart_rate REAL,
    calories_burned REAL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    weight_lbs REAL,
    body_fat_pct REAL,
    systolic REAL,
    diastolic REAL,
    resting_hr REAL,
    sleep_hours REAL,
    water_oz REAL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS mood_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    mood_score REAL NOT NULL,
    energy_level REAL NOT NULL,
    stress_level REAL NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    calorie_goal REAL NOT NULL DEFAULT 2000,
    water_goal_oz REAL NOT NULL DEFAULT 64,
    name TEXT,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_food_user_updated ON food_entries(user_id, updated_at);
  CREATE INDEX IF NOT EXISTS idx_exercise_user_updated ON exercise_entries(user_id, updated_at);
  CREATE INDEX IF NOT EXISTS idx_metrics_user_updated ON daily_metrics(user_id, updated_at);
  CREATE INDEX IF NOT EXISTS idx_mood_user_updated ON mood_entries(user_id, updated_at);
`);
