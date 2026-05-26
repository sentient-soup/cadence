import styles from './FAB.module.css';

interface Props {
  onClick: () => void;
  label?: string;
}

export function FAB({ onClick, label = 'Add' }: Props) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label={label}>
      <span className={styles.icon}>+</span>
    </button>
  );
}
