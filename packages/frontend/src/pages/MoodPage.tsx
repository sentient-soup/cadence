import { useState } from 'react';
import { useMood } from '../hooks/useMood';
import { formatShortDate } from '../utils/dateUtils';
import styles from './MoodPage.module.css';

const MOOD_EMOJIS = ['', '😞', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '😃', '🤩'];

interface Props { onMutate?: () => void; }

export function MoodPage({ onMutate }: Props) {
  const { todayEntry, getEntriesForRange, upsertToday } = useMood(onMutate);
  const recent = getEntriesForRange(7);

  const [mood, setMood] = useState(todayEntry?.moodScore ?? 5);
  const [energy, setEnergy] = useState(todayEntry?.energyLevel ?? 5);
  const [stress, setStress] = useState(todayEntry?.stressLevel ?? 5);
  const [notes, setNotes] = useState(todayEntry?.notes ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    upsertToday({ moodScore: mood, energyLevel: energy, stressLevel: stress, notes: notes.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>MOOD</h1>

      <div className={styles.card}>
        <div className={styles.mainMood}>
          <span className={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</span>
          <span className={styles.moodScore}>{mood}</span>
          <span className={styles.moodLabel}>/ 10</span>
        </div>

        <SliderField
          label="MOOD"
          value={mood}
          onChange={setMood}
          color="var(--accent)"
          lowLabel="Low"
          highLabel="Great"
        />
        <SliderField
          label="ENERGY"
          value={energy}
          onChange={setEnergy}
          color="var(--success)"
          lowLabel="Drained"
          highLabel="Energized"
        />
        <SliderField
          label="STRESS"
          value={stress}
          onChange={setStress}
          color="var(--danger)"
          lowLabel="Calm"
          highLabel="Stressed"
        />

        <div className={styles.notesField}>
          <label className={styles.fieldLabel}>NOTES</label>
          <textarea
            className={styles.notesInput}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling today?"
            rows={3}
          />
        </div>

        <button className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`} onClick={handleSave}>
          {saved ? '✓ SAVED' : 'SAVE TODAY'}
        </button>
      </div>

      {/* Recent history */}
      {recent.length > 0 && (
        <div className={styles.history}>
          <div className={styles.historyLabel}>RECENT</div>
          {[...recent].reverse().map((e) => (
            <div key={e.id} className={styles.historyRow}>
              <span className={styles.historyDate}>{formatShortDate(e.date)}</span>
              <div className={styles.historyBars}>
                <MiniBar value={e.moodScore} color="var(--accent)" label="M" />
                <MiniBar value={e.energyLevel} color="var(--success)" label="E" />
                <MiniBar value={e.stressLevel} color="var(--danger)" label="S" />
              </div>
              <span className={styles.historyScores}>
                {e.moodScore} · {e.energyLevel} · {e.stressLevel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SliderField({
  label, value, onChange, color, lowLabel, highLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className={styles.sliderField}>
      <div className={styles.sliderHeader}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.sliderNum} style={{ color }}>{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--thumb-color': color } as React.CSSProperties}
        className={styles.slider}
      />
      <div className={styles.sliderEndLabels}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function MiniBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className={styles.miniBarWrap}>
      <span className={styles.miniBarLabel} style={{ color }}>{label}</span>
      <div className={styles.miniBarTrack}>
        <div className={styles.miniBarFill} style={{ width: `${value * 10}%`, background: color }} />
      </div>
    </div>
  );
}
