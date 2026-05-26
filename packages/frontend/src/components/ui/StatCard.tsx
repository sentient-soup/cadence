import styles from './StatCard.module.css';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, unit, sub, accent }: Props) {
  return (
    <div className={`${styles.card} ${accent ? styles.accent : ''}`}>
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}
