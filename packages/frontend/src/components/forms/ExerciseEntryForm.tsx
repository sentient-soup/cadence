import { useState } from 'react';
import type { ExerciseEntry, ExerciseType, StrengthSet } from '@fitness/shared';
import { getISODate } from '../../utils/dateUtils';
import styles from './Form.module.css';

interface Props {
  onSave: (entry: Omit<ExerciseEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function ExerciseEntryForm({ onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ExerciseType>('strength');
  const [durationMin, setDurationMin] = useState('');
  const [sets, setSets] = useState<StrengthSet[]>([{ reps: 0, weightLbs: 0 }]);
  const [distanceMiles, setDistanceMiles] = useState('');
  const [avgHeartRate, setAvgHeartRate] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');

  const updateSet = (i: number, field: keyof StrengthSet, val: string) => {
    setSets((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: Number(val) } : s))
    );
  };

  const addSet = () => setSets((prev) => [...prev, { reps: 0, weightLbs: 0 }]);
  const removeSet = (i: number) => setSets((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      date: getISODate(),
      name: name.trim(),
      type,
      durationMin: durationMin ? Number(durationMin) : undefined,
      sets: type === 'strength' ? sets : undefined,
      distanceMiles: distanceMiles ? Number(distanceMiles) : undefined,
      avgHeartRate: avgHeartRate ? Number(avgHeartRate) : undefined,
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const types: ExerciseType[] = ['strength', 'cardio', 'flexibility', 'sport'];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Exercise Name</label>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bench Press"
          required
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Type</label>
        <div className={styles.pillRow}>
          {types.map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.pill} ${type === t ? styles.pillActive : ''}`}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Duration (min)</label>
        <input
          className={styles.input}
          type="number"
          inputMode="decimal"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
          placeholder="0"
          min={0}
        />
      </div>

      {type === 'strength' && (
        <div className={styles.field}>
          <label className={styles.label}>Sets</label>
          {sets.map((s, i) => (
            <div key={i} className={styles.setRow}>
              <span className={styles.setNum}>#{i + 1}</span>
              <div className={styles.setField}>
                <label className={styles.miniLabel}>Reps</label>
                <input
                  className={styles.input}
                  type="number"
                  inputMode="decimal"
                  value={s.reps || ''}
                  onChange={(e) => updateSet(i, 'reps', e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </div>
              <div className={styles.setField}>
                <label className={styles.miniLabel}>lbs</label>
                <input
                  className={styles.input}
                  type="number"
                  inputMode="decimal"
                  value={s.weightLbs || ''}
                  onChange={(e) => updateSet(i, 'weightLbs', e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </div>
              {sets.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeSet(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className={styles.toggleBtn} onClick={addSet}>
            + Add Set
          </button>
        </div>
      )}

      {(type === 'cardio' || type === 'sport') && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Distance (miles)</label>
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              value={distanceMiles}
              onChange={(e) => setDistanceMiles(e.target.value)}
              placeholder="0.0"
              min={0}
              step={0.01}
            />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Avg HR (bpm)</label>
              <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                value={avgHeartRate}
                onChange={(e) => setAvgHeartRate(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cal Burned</label>
              <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
          </div>
        </>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Notes (optional)</label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes..."
          rows={2}
        />
      </div>

      <button type="submit" className={styles.submitBtn}>
        SAVE EXERCISE
      </button>
    </form>
  );
}
