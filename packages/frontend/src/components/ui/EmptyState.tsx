import styles from './EmptyState.module.css';

interface Props {
  message?: string;
}

export function EmptyState({ message = 'No entries yet' }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>◎</div>
      <p className={styles.text}>{message}</p>
    </div>
  );
}
