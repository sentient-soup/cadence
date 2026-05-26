import { useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { PageShell } from './components/layout/PageShell';
import { SyncIndicator } from './components/ui/SyncIndicator';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { CaloriesPage } from './pages/CaloriesPage';
import { ExercisePage } from './pages/ExercisePage';
import { MetricsPage } from './pages/MetricsPage';
import { MoodPage } from './pages/MoodPage';
import { ProgressPage } from './pages/ProgressPage';
import { useAuth } from './hooks/useAuth';
import { useSync } from './hooks/useSync';
import type { AuthState } from '@fitness/shared';
import styles from './App.module.css';

function AppShell({ auth, onLogout }: { auth: AuthState; onLogout: () => void }) {
  const { sync, status } = useSync(auth.token);

  // Sync on mount and when coming back online
  useEffect(() => {
    sync();
    const handleOnline = () => sync();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [sync]);

  // Expose sync trigger so child components can call it after mutations
  const triggerSync = useCallback(() => {
    // Debounce: wait 500ms after mutation before syncing
    const t = setTimeout(sync, 500);
    return () => clearTimeout(t);
  }, [sync]);

  return (
    <HashRouter>
      <div className={styles.shell}>
        <div className={styles.topBar}>
          <span className={styles.user}>⬡ {auth.username}</span>
          <div className={styles.topRight}>
            <SyncIndicator status={status} onSync={sync} />
            <button className={styles.logoutBtn} onClick={onLogout}>Sign out</button>
          </div>
        </div>
        <PageShell className={styles.content}>
          <Routes>
            <Route index element={<Dashboard onMutate={triggerSync} />} />
            <Route path="calories" element={<CaloriesPage onMutate={triggerSync} />} />
            <Route path="exercise" element={<ExercisePage onMutate={triggerSync} />} />
            <Route path="metrics" element={<MetricsPage onMutate={triggerSync} />} />
            <Route path="mood" element={<MoodPage onMutate={triggerSync} />} />
            <Route path="progress" element={<ProgressPage />} />
          </Routes>
        </PageShell>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

export default function App() {
  const { auth, login, register, logout } = useAuth();

  if (!auth) {
    return (
      <AuthPage
        onAuth={() => {/* state updated inside useAuth */}}
        login={login}
        register={register}
      />
    );
  }

  return <AppShell auth={auth} onLogout={logout} />;
}
