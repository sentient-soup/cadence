import { useState } from 'react';
import { useCalories } from '../hooks/useCalories';
import { useSettings } from '../hooks/useSettings';
import { InputModal } from '../components/ui/InputModal';
import { FAB } from '../components/ui/FAB';
import { EmptyState } from '../components/ui/EmptyState';
import { FoodEntryForm } from '../components/forms/FoodEntryForm';
import type { FoodEntry } from '@fitness/shared';
import styles from './CaloriesPage.module.css';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

interface Props { onMutate?: () => void; }

export function CaloriesPage({ onMutate }: Props) {
  const { todayEntries, todayTotals, addEntry, removeEntry } = useCalories(onMutate);
  const { settings } = useSettings(onMutate);
  const [modalOpen, setModalOpen] = useState(false);

  const calPct = Math.min((todayTotals.calories / settings.calorieGoal) * 100, 100);
  const over = todayTotals.calories > settings.calorieGoal;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>FUEL</h1>

      {/* Progress bar */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <span className={styles.progressNum}>{todayTotals.calories}</span>
          <span className={styles.progressGoal}>/ {settings.calorieGoal} cal</span>
        </div>
        <div className={styles.bar}>
          <div
            className={styles.barFill}
            style={{
              width: `${calPct}%`,
              background: over ? 'var(--danger)' : 'var(--accent)',
            }}
          />
        </div>
        <div className={styles.remaining}>
          {over
            ? <span style={{ color: 'var(--danger)' }}>{todayTotals.calories - settings.calorieGoal} over goal</span>
            : <span style={{ color: 'var(--success)' }}>{settings.calorieGoal - todayTotals.calories} remaining</span>
          }
        </div>
        {(todayTotals.protein > 0 || todayTotals.carbs > 0 || todayTotals.fat > 0) && (
          <div className={styles.macros}>
            <MacroStat label="Protein" value={todayTotals.protein} unit="g" color="var(--info)" />
            <MacroStat label="Carbs"   value={todayTotals.carbs}   unit="g" color="var(--warning)" />
            <MacroStat label="Fat"     value={todayTotals.fat}     unit="g" color="var(--danger)" />
          </div>
        )}
      </div>

      {/* Meal groups */}
      {todayEntries.length === 0 ? (
        <EmptyState message="Tap + to log your first meal" />
      ) : (
        MEALS.map((meal) => {
          const entries = todayEntries.filter((e) => e.meal === meal);
          if (!entries.length) return null;
          const mealCal = entries.reduce((s, e) => s + e.calories, 0);
          return (
            <div key={meal} className={styles.mealGroup}>
              <div className={styles.mealHeader}>
                <span className={styles.mealName}>{meal.toUpperCase()}</span>
                <span className={styles.mealTotal}>{mealCal} cal</span>
              </div>
              {entries.map((e) => (
                <FoodRow key={e.id} entry={e} onDelete={() => removeEntry(e.id)} />
              ))}
            </div>
          );
        })
      )}

      <FAB onClick={() => setModalOpen(true)} label="Log food" />

      <InputModal open={modalOpen} title="Log Food" onClose={() => setModalOpen(false)}>
        <FoodEntryForm
          onSave={addEntry}
          onClose={() => setModalOpen(false)}
        />
      </InputModal>
    </div>
  );
}

function FoodRow({ entry, onDelete }: { entry: FoodEntry; onDelete: () => void }) {
  return (
    <div className={styles.foodRow}>
      <div className={styles.foodInfo}>
        <span className={styles.foodName}>{entry.name}</span>
        {(entry.protein || entry.carbs || entry.fat) ? (
          <span className={styles.foodMacros}>
            {entry.protein ? `P ${Math.round(entry.protein)}g` : ''}
            {entry.carbs ? ` · C ${Math.round(entry.carbs)}g` : ''}
            {entry.fat ? ` · F ${Math.round(entry.fat)}g` : ''}
          </span>
        ) : null}
      </div>
      <div className={styles.foodRight}>
        <span className={styles.foodCal}>{entry.calories}</span>
        <button className={styles.deleteBtn} onClick={onDelete} aria-label="Delete">✕</button>
      </div>
    </div>
  );
}

function MacroStat({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className={styles.macroStat}>
      <span className={styles.macroStatLabel} style={{ color }}>{label}</span>
      <span className={styles.macroStatVal}>{Math.round(value)}{unit}</span>
    </div>
  );
}
