import { useState } from 'react';
import type { FoodEntry } from '@cadence/shared';
import { getISODate } from '../../utils/dateUtils';
import styles from './Form.module.css';

type MealType = FoodEntry['meal'];

interface Props {
  onSave: (entry: Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function FoodEntryForm({ onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [meal, setMeal] = useState<MealType>('lunch');
  const [calories, setCalories] = useState('');
  const [showMacros, setShowMacros] = useState(false);
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;
    onSave({
      date: getISODate(),
      name: name.trim(),
      meal,
      calories: Number(calories),
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
    });
    onClose();
  };

  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Food / Meal</label>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken breast"
          required
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Meal</label>
        <div className={styles.pillRow}>
          {meals.map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.pill} ${meal === m ? styles.pillActive : ''}`}
              onClick={() => setMeal(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Calories</label>
        <input
          className={styles.input}
          type="number"
          inputMode="decimal"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="0"
          required
          min={0}
        />
      </div>

      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => setShowMacros((v) => !v)}
      >
        {showMacros ? '− Hide macros' : '+ Add macros (optional)'}
      </button>

      {showMacros && (
        <div className={styles.macroRow}>
          {[
            { label: 'Protein (g)', val: protein, set: setProtein },
            { label: 'Carbs (g)',   val: carbs,   set: setCarbs   },
            { label: 'Fat (g)',     val: fat,     set: setFat     },
          ].map(({ label, val, set }) => (
            <div key={label} className={styles.macroField}>
              <label className={styles.label}>{label}</label>
              <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
          ))}
        </div>
      )}

      <button type="submit" className={styles.submitBtn}>
        SAVE ENTRY
      </button>
    </form>
  );
}
