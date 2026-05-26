import { useState } from 'react';
import type { AuthState } from '@cadence/shared';
import styles from './AuthPage.module.css';

interface Props {
  onAuth: (state: AuthState) => void;
  login: (u: string, p: string) => Promise<AuthState>;
  register: (u: string, p: string) => Promise<AuthState>;
}

export function AuthPage({ onAuth, login, register }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const state = mode === 'login'
        ? await login(username, password)
        : await register(username, password);
      onAuth(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoMark}>⬡</div>
        <h1 className={styles.appName}>CADENCE</h1>
        <p className={styles.tagline}>Your personal training log</p>

        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'login' ? styles.modeActive : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            LOG IN
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'register' ? styles.modeActive : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>USERNAME</label>
            <input
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              autoComplete="username"
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>PASSWORD</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '...' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
