import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface Props {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: Props) {
  return (
    <main className={`${styles.shell} ${className ?? ''}`}>
      {children}
    </main>
  );
}
