import { useState } from 'react';
import { useExercise } from '../hooks/useExercise';
import { InputModal } from '../components/ui/InputModal';
import { FAB } from '../components/ui/FAB';
import { EmptyState } from '../components/ui/EmptyState';
import { ExerciseEntryForm } from '../components/forms/ExerciseEntryForm';
import type { ExerciseEntry } from '@cadence/shared';
import styles from './ExercisePage.module.css';

const TYPE_COLORS: Record<string, string> = {
  strength:    'var(--accent)',
  cardio:      'var(--success)',
  flexibility: 'var(--info)',
  sport:       'var(--warning)',
};

interface Props { onMutate?: () => void; }

export function ExercisePage({ onMutate }: Props) {
  const { todayEntries, todaySummary, addEntry, removeEntry } = useExercise(onMutate);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>TRAIN</h1>

      {/* Summary bar */}
      <div className={styles.summaryRow}>
        <SumStat label="Sessions" value={todaySummary.sessions} />
        <SumStat label="Minutes"  value={todaySummary.durationMin} />
        <SumStat label="Vol (lbs)" value={todaySummary.volumeLbs > 0 ? todaySummary.volumeLbs.toLocaleString() : 0} />
      </div>

      {todayEntries.length === 0 ? (
        <EmptyState message="Tap + to log a workout" />
      ) : (
        todayEntries.map((e) => (
          <ExerciseCard key={e.id} entry={e} onDelete={() => removeEntry(e.id)} />
        ))
      )}

      <FAB onClick={() => setModalOpen(true)} label="Log exercise" />

      <InputModal open={modalOpen} title="Log Exercise" onClose={() => setModalOpen(false)}>
        <ExerciseEntryForm
          onSave={addEntry}
          onClose={() => setModalOpen(false)}
        />
      </InputModal>
    </div>
  );
}

function SumStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={styles.sumStat}>
      <span className={styles.sumStatNum}>{value}</span>
      <span className={styles.sumStatLabel}>{label}</span>
    </div>
  );
}

function ExerciseCard({ entry, onDelete }: { entry: ExerciseEntry; onDelete: () => void }) {
  const color = TYPE_COLORS[entry.type] ?? 'var(--text-dim)';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <span className={styles.typeBadge} style={{ color, borderColor: color }}>
            {entry.type.toUpperCase()}
          </span>
          <span className={styles.exerciseName}>{entry.name}</span>
        </div>
        <button className={styles.deleteBtn} onClick={onDelete} aria-label="Delete">✕</button>
      </div>

      <div className={styles.cardMeta}>
        {entry.durationMin ? <MetaChip label={`${entry.durationMin} min`} /> : null}
        {entry.distanceMiles ? <MetaChip label={`${entry.distanceMiles} mi`} /> : null}
        {entry.avgHeartRate ? <MetaChip label={`${entry.avgHeartRate} bpm`} /> : null}
        {entry.caloriesBurned ? <MetaChip label={`${entry.caloriesBurned} cal`} /> : null}
      </div>

      {entry.sets && entry.sets.length > 0 && (
        <div className={styles.setsTable}>
          <div className={styles.setsHeader}>
            <span>SET</span><span>REPS</span><span>LBS</span>
          </div>
          {entry.sets.map((s, i) => (
            <div key={i} className={styles.setRow}>
              <span>{i + 1}</span>
              <span>{s.reps}</span>
              <span>{s.weightLbs}</span>
            </div>
          ))}
        </div>
      )}

      {entry.notes && (
        <p className={styles.notes}>{entry.notes}</p>
      )}
    </div>
  );
}

function MetaChip({ label }: { label: string }) {
  return <span className={styles.metaChip}>{label}</span>;
}
