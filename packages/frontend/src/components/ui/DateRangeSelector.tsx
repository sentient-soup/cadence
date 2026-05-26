import type { DateRange } from '../../hooks/useDateRange';
import styles from './DateRangeSelector.module.css';

const OPTIONS: { label: string; value: DateRange }[] = [
  { label: '7D',  value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: '1Y',  value: 365 },
];

interface Props {
  range: DateRange;
  onChange: (r: DateRange) => void;
}

export function DateRangeSelector({ range, onChange }: Props) {
  return (
    <div className={styles.row}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          className={`${styles.pill} ${range === o.value ? styles.active : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
