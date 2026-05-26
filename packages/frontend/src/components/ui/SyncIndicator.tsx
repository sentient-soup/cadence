import type { SyncStatus } from '../../hooks/useSync';
import styles from './SyncIndicator.module.css';

const STATUS_CONFIG: Record<SyncStatus, { label: string; color: string }> = {
  idle:    { label: '',        color: 'var(--text-faint)' },
  syncing: { label: 'Syncing', color: 'var(--accent)' },
  success: { label: 'Synced',  color: 'var(--success)' },
  error:   { label: 'Sync failed', color: 'var(--danger)' },
  offline: { label: 'Offline', color: 'var(--text-dim)' },
};

interface Props {
  status: SyncStatus;
  onSync?: () => void;
}

export function SyncIndicator({ status, onSync }: Props) {
  const cfg = STATUS_CONFIG[status];
  if (status === 'idle') return null;

  return (
    <button
      className={styles.indicator}
      style={{ color: cfg.color }}
      onClick={onSync}
      title={status === 'error' ? 'Tap to retry sync' : undefined}
    >
      {status === 'syncing' && <span className={styles.spinner}>◌</span>}
      {status === 'success' && <span>✓</span>}
      {status === 'error' && <span>⚠</span>}
      {status === 'offline' && <span>⊘</span>}
      <span className={styles.label}>{cfg.label}</span>
    </button>
  );
}
