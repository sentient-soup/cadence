import { useState } from 'react';
import { useCalories } from '../hooks/useCalories';
import { useExercise } from '../hooks/useExercise';
import { useMetrics } from '../hooks/useMetrics';
import { useMood } from '../hooks/useMood';
import { useSettings } from '../hooks/useSettings';
import { useDateRange } from '../hooks/useDateRange';
import { DateRangeSelector } from '../components/ui/DateRangeSelector';
import { WeightChart } from '../components/charts/WeightChart';
import { CalorieChart } from '../components/charts/CalorieChart';
import { ExerciseVolumeChart } from '../components/charts/ExerciseVolumeChart';
import { MoodChart } from '../components/charts/MoodChart';
import { MetricsChart } from '../components/charts/MetricsChart';
import {
  toWeightPoints, toCaloriePoints, toVolumePoints, toMoodPoints, toMetricsPoints,
} from '../utils/chartAdapters';
import styles from './ProgressPage.module.css';

export function ProgressPage() {
  const { range, setRange } = useDateRange(30);
  const { getEntriesForRange: getFood } = useCalories();
  const { getEntriesForRange: getExercise } = useExercise();
  const { getEntriesForRange: getMetrics } = useMetrics();
  const { getEntriesForRange: getMood } = useMood();
  const { settings } = useSettings();

  const food     = getFood(range);
  const exercise = getExercise(range);
  const metrics  = getMetrics(range);
  const mood     = getMood(range);

  const weightData   = toWeightPoints(metrics, range);
  const calorieData  = toCaloriePoints(food, range, settings.calorieGoal);
  const volumeData   = toVolumePoints(exercise, range);
  const moodData     = toMoodPoints(mood, range);
  const metricsData  = toMetricsPoints(metrics, range);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>PROGRESS</h1>

      <DateRangeSelector range={range} onChange={setRange} />

      <Section title="BODY WEIGHT">
        <WeightChart data={weightData} />
      </Section>

      <Section title="CALORIES">
        <CalorieChart data={calorieData} />
      </Section>

      <Section title="EXERCISE VOLUME">
        <ExerciseVolumeChart data={volumeData} />
      </Section>

      <Section title="MOOD & ENERGY">
        <MoodChart data={moodData} />
      </Section>

      <Section title="VITALS">
        <MetricsChart data={metricsData} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen((v) => !v)}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.chevron} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}
