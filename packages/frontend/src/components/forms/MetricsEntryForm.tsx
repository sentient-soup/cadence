import { useState } from 'react';
import type { DailyMetrics } from '@cadence/shared';
import styles from './Form.module.css';

interface Props {
  existing?: DailyMetrics | null;
  onSave: (partial: Partial<Omit<DailyMetrics, 'id' | 'createdAt' | 'date'>>) => void;
  onClose: () => void;
}

export function MetricsEntryForm({ existing, onSave, onClose }: Props) {
  const [weightLbs, setWeightLbs] = useState(existing?.weightLbs?.toString() ?? '');
  const [bodyFatPct, setBodyFatPct] = useState(existing?.bodyFatPct?.toString() ?? '');
  const [systolic, setSystolic] = useState(existing?.systolic?.toString() ?? '');
  const [diastolic, setDiastolic] = useState(existing?.diastolic?.toString() ?? '');
  const [restingHR, setRestingHR] = useState(existing?.restingHR?.toString() ?? '');
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours?.toString() ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      weightLbs: weightLbs ? Number(weightLbs) : undefined,
      bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined,
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      restingHR: restingHR ? Number(restingHR) : undefined,
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label}>Weight (lbs)</label>
          <input className={styles.input} type="number" inputMode="decimal"
            value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="0" min={0} step={0.1} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Body Fat (%)</label>
          <input className={styles.input} type="number" inputMode="decimal"
            value={bodyFatPct} onChange={(e) => setBodyFatPct(e.target.value)} placeholder="0" min={0} max={100} step={0.1} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Blood Pressure</label>
        <div className={styles.bpRow}>
          <input className={styles.input} type="number" inputMode="decimal"
            value={systolic} onChange={(e) => setSystolic(e.target.value)} placeholder="Systolic" min={0} />
          <span className={styles.bpSlash}>/</span>
          <input className={styles.input} type="number" inputMode="decimal"
            value={diastolic} onChange={(e) => setDiastolic(e.target.value)} placeholder="Diastolic" min={0} />
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label}>Resting HR (bpm)</label>
          <input className={styles.input} type="number" inputMode="decimal"
            value={restingHR} onChange={(e) => setRestingHR(e.target.value)} placeholder="0" min={0} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Sleep (hrs)</label>
          <input className={styles.input} type="number" inputMode="decimal"
            value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} placeholder="0" min={0} max={24} step={0.5} />
        </div>
      </div>

      <button type="submit" className={styles.submitBtn}>
        SAVE VITALS
      </button>
    </form>
  );
}
