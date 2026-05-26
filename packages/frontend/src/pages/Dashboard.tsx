import { useCalories } from '../hooks/useCalories';
import { useExercise } from '../hooks/useExercise';
import { useMetrics } from '../hooks/useMetrics';
import { useMood } from '../hooks/useMood';
import { useSettings } from '../hooks/useSettings';
import { StatCard } from '../components/ui/StatCard';
import styles from './Dashboard.module.css';

interface Props { onMutate?: () => void; }

export function Dashboard({ onMutate }: Props) {
  const { todayTotals, todayEntries: foodEntries } = useCalories(onMutate);
  const { todaySummary, todayEntries: exercises } = useExercise(onMutate);
  const { todayEntry: metrics } = useMetrics(onMutate);
  const { todayEntry: mood } = useMood(onMutate);
  const { settings } = useSettings(onMutate);

  const calPct = Math.min((todayTotals.calories / settings.calorieGoal) * 100, 100);
  const remaining = settings.calorieGoal - todayTotals.calories;
  const waterPct = metrics?.waterOz
    ? Math.min((metrics.waterOz / settings.waterGoalOz) * 100, 100)
    : 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.dateLabel}>{today}</span>
        <h1 className={styles.title}>TODAY</h1>
      </header>

      {/* Calorie gauge */}
      <div className={styles.gaugeCard}>
        <div
          className={styles.gauge}
          style={{ '--pct': `${calPct}%` } as React.CSSProperties}
        >
          <div className={styles.gaugeInner}>
            <span className={styles.gaugeNum}>{todayTotals.calories}</span>
            <span className={styles.gaugeLabel}>cal consumed</span>
          </div>
        </div>
        <div className={styles.gaugeStats}>
          <div className={styles.gaugeStat}>
            <span className={styles.gaugeStatNum} style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {Math.abs(remaining)}
            </span>
            <span className={styles.gaugeStatLabel}>
              {remaining >= 0 ? 'remaining' : 'over goal'}
            </span>
          </div>
          <div className={styles.gaugeStat}>
            <span className={styles.gaugeStatNum}>{settings.calorieGoal}</span>
            <span className={styles.gaugeStatLabel}>daily goal</span>
          </div>
        </div>
        {(todayTotals.protein > 0 || todayTotals.carbs > 0 || todayTotals.fat > 0) && (
          <div className={styles.macroRow}>
            <MacroBar label="P" value={todayTotals.protein} color="var(--info)" />
            <MacroBar label="C" value={todayTotals.carbs} color="var(--warning)" />
            <MacroBar label="F" value={todayTotals.fat} color="var(--danger)" />
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Weight"
          value={metrics?.weightLbs ?? '—'}
          unit={metrics?.weightLbs ? 'lbs' : undefined}
        />
        <StatCard
          label="Water"
          value={metrics?.waterOz ?? '—'}
          unit={metrics?.waterOz ? 'oz' : undefined}
          sub={`Goal: ${settings.waterGoalOz} oz`}
        />
        <StatCard
          label="Mood"
          value={mood?.moodScore ?? '—'}
          unit={mood ? '/10' : undefined}
          sub={mood ? `Energy ${mood.energyLevel} · Stress ${mood.stressLevel}` : undefined}
        />
        <StatCard
          label="Sleep"
          value={metrics?.sleepHours ?? '—'}
          unit={metrics?.sleepHours ? 'hrs' : undefined}
        />
      </div>

      {/* Water bar */}
      {metrics?.waterOz !== undefined && (
        <div className={styles.waterSection}>
          <div className={styles.sectionLabel}>HYDRATION</div>
          <div className={styles.waterBar}>
            <div className={styles.waterFill} style={{ width: `${waterPct}%` }} />
          </div>
          <span className={styles.waterText}>{metrics.waterOz} / {settings.waterGoalOz} oz</span>
        </div>
      )}

      {/* Today's exercises */}
      {exercises.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>TODAY'S TRAINING</div>
          <div className={styles.exerciseChips}>
            {exercises.map((e) => (
              <div key={e.id} className={styles.chip}>
                <span className={`${styles.chipBadge} ${styles[`badge_${e.type}`]}`}>
                  {e.type.slice(0, 1).toUpperCase()}
                </span>
                <span className={styles.chipName}>{e.name}</span>
                {e.durationMin ? <span className={styles.chipMeta}>{e.durationMin}m</span> : null}
              </div>
            ))}
          </div>
          <div className={styles.trainingStats}>
            {todaySummary.sessions > 0 && (
              <span className={styles.trainStat}>{todaySummary.sessions} session{todaySummary.sessions !== 1 ? 's' : ''}</span>
            )}
            {todaySummary.durationMin > 0 && (
              <span className={styles.trainStat}>{todaySummary.durationMin} min total</span>
            )}
            {todaySummary.volumeLbs > 0 && (
              <span className={styles.trainStat}>{todaySummary.volumeLbs.toLocaleString()} lbs volume</span>
            )}
          </div>
        </div>
      )}

      {/* Meal summary */}
      {foodEntries.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>TODAY'S MEALS · {foodEntries.length} entr{foodEntries.length !== 1 ? 'ies' : 'y'}</div>
          {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
            const mealEntries = foodEntries.filter((e) => e.meal === meal);
            if (!mealEntries.length) return null;
            const mealCal = mealEntries.reduce((s, e) => s + e.calories, 0);
            return (
              <div key={meal} className={styles.mealRow}>
                <span className={styles.mealName}>{meal}</span>
                <span className={styles.mealCal}>{mealCal} cal</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MacroBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={styles.macro}>
      <span className={styles.macroLabel} style={{ color }}>{label}</span>
      <span className={styles.macroVal}>{Math.round(value)}g</span>
    </div>
  );
}
