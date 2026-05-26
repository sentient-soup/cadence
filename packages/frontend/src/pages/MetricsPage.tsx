import { useState } from 'react';
import { useMetrics } from '../hooks/useMetrics';
import { useSettings } from '../hooks/useSettings';
import { InputModal } from '../components/ui/InputModal';
import { FAB } from '../components/ui/FAB';
import { MetricsEntryForm } from '../components/forms/MetricsEntryForm';
import styles from './MetricsPage.module.css';

interface Props { onMutate?: () => void; }

export function MetricsPage({ onMutate }: Props) {
  const { todayEntry, upsertToday } = useMetrics(onMutate);
  const { settings } = useSettings(onMutate);
  const [modalOpen, setModalOpen] = useState(false);

  const waterOz = todayEntry?.waterOz ?? 0;
  const droplets = Math.round(settings.waterGoalOz / 8);
  const filledDroplets = Math.round((waterOz / settings.waterGoalOz) * droplets);

  const addWater = () => {
    upsertToday({ waterOz: Math.min(waterOz + 8, settings.waterGoalOz * 1.5) });
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>VITALS</h1>

      {/* Metrics grid */}
      <div className={styles.grid}>
        <MetricTile
          label="WEIGHT"
          value={todayEntry?.weightLbs ? `${todayEntry.weightLbs}` : '—'}
          unit="lbs"
        />
        <MetricTile
          label="BODY FAT"
          value={todayEntry?.bodyFatPct ? `${todayEntry.bodyFatPct}` : '—'}
          unit="%"
        />
        <MetricTile
          label="BLOOD PRESSURE"
          value={todayEntry?.systolic && todayEntry?.diastolic
            ? `${todayEntry.systolic}/${todayEntry.diastolic}`
            : '—'}
          unit={todayEntry?.systolic ? 'mmHg' : undefined}
          wide
        />
        <MetricTile
          label="RESTING HR"
          value={todayEntry?.restingHR ? `${todayEntry.restingHR}` : '—'}
          unit="bpm"
        />
        <MetricTile
          label="SLEEP"
          value={todayEntry?.sleepHours ? `${todayEntry.sleepHours}` : '—'}
          unit="hrs"
        />
      </div>

      {/* Water intake widget */}
      <div className={styles.waterCard}>
        <div className={styles.waterHeader}>
          <div className={styles.waterLabel}>
            <span className={styles.sectionLabel}>HYDRATION</span>
            <span className={styles.waterReading}>
              {waterOz} <span className={styles.waterUnit}>/ {settings.waterGoalOz} oz</span>
            </span>
          </div>
          <button className={styles.waterAddBtn} onClick={addWater}>+8 oz</button>
        </div>
        <div className={styles.droplets}>
          {Array.from({ length: droplets }).map((_, i) => (
            <button
              key={i}
              className={`${styles.droplet} ${i < filledDroplets ? styles.dropletFilled : ''}`}
              onClick={() => upsertToday({ waterOz: Math.round((i + 1) * (settings.waterGoalOz / droplets)) })}
              aria-label={`Set water to ${Math.round((i + 1) * (settings.waterGoalOz / droplets))} oz`}
            >
              ◆
            </button>
          ))}
        </div>
        {waterOz >= settings.waterGoalOz && (
          <span className={styles.goalMet}>Goal reached!</span>
        )}
      </div>

      <FAB onClick={() => setModalOpen(true)} label="Edit vitals" />

      <InputModal open={modalOpen} title="Log Vitals" onClose={() => setModalOpen(false)}>
        <MetricsEntryForm
          existing={todayEntry}
          onSave={upsertToday}
          onClose={() => setModalOpen(false)}
        />
      </InputModal>
    </div>
  );
}

function MetricTile({ label, value, unit, wide }: {
  label: string; value: string; unit?: string; wide?: boolean;
}) {
  const hasValue = value !== '—';
  return (
    <div className={`${styles.tile} ${wide ? styles.wide : ''}`}>
      <span className={styles.tileLabel}>{label}</span>
      <div className={styles.tileValue}>
        <span className={`${styles.tileNum} ${!hasValue ? styles.tileDash : ''}`}>{value}</span>
        {unit && hasValue && <span className={styles.tileUnit}>{unit}</span>}
      </div>
    </div>
  );
}
