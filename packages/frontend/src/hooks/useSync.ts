import { useState, useCallback, useRef } from 'react';
import type { AppSettings } from '@cadence/shared';
import { STORAGE_KEYS } from '../storage/keys';
import { getChangedSince, mergeEntries, getOne, setOne } from '../storage/storage';

const LAST_SYNC_KEY = 'ft_last_sync';
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export function useSync(token: string | null) {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncAt, setLastSyncAt] = useState<number>(
    () => Number(localStorage.getItem(LAST_SYNC_KEY) ?? 0)
  );
  const syncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (!token || syncingRef.current) return;
    if (!navigator.onLine) { setStatus('offline'); return; }

    syncingRef.current = true;
    setStatus('syncing');

    try {
      const since = Number(localStorage.getItem(LAST_SYNC_KEY) ?? 0);

      const changes = {
        food:     getChangedSince(STORAGE_KEYS.FOOD_ENTRIES,     since),
        exercise: getChangedSince(STORAGE_KEYS.EXERCISE_ENTRIES, since),
        metrics:  getChangedSince(STORAGE_KEYS.DAILY_METRICS,    since),
        mood:     getChangedSince(STORAGE_KEYS.MOOD_ENTRIES,     since),
        settings: (() => {
          const s = getOne<AppSettings & { updatedAt?: number }>(STORAGE_KEYS.APP_SETTINGS);
          return s?.updatedAt && s.updatedAt > since ? s : null;
        })(),
      };

      const res = await fetch(`${API_BASE}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ since, changes }),
      });

      if (res.status === 401) {
        // Token expired — user needs to re-login
        setStatus('error');
        return;
      }
      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);

      const { syncedAt, serverChanges } = await res.json() as {
        syncedAt: number;
        serverChanges: {
          food: Parameters<typeof mergeEntries>[1];
          exercise: Parameters<typeof mergeEntries>[1];
          metrics: Parameters<typeof mergeEntries>[1];
          mood: Parameters<typeof mergeEntries>[1];
          settings: (AppSettings & { updatedAt: number }) | null;
        };
      };

      // Merge server entries into localStorage
      mergeEntries(STORAGE_KEYS.FOOD_ENTRIES,     serverChanges.food);
      mergeEntries(STORAGE_KEYS.EXERCISE_ENTRIES, serverChanges.exercise);
      mergeEntries(STORAGE_KEYS.DAILY_METRICS,    serverChanges.metrics);
      mergeEntries(STORAGE_KEYS.MOOD_ENTRIES,     serverChanges.mood);

      if (serverChanges.settings) {
        const local = getOne<AppSettings & { updatedAt?: number }>(STORAGE_KEYS.APP_SETTINGS);
        if (!local?.updatedAt || serverChanges.settings.updatedAt > local.updatedAt) {
          setOne(STORAGE_KEYS.APP_SETTINGS, serverChanges.settings);
        }
      }

      localStorage.setItem(LAST_SYNC_KEY, String(syncedAt));
      setLastSyncAt(syncedAt);
      setStatus('success');
    } catch (err) {
      console.error('Sync error:', err);
      setStatus(navigator.onLine ? 'error' : 'offline');
    } finally {
      syncingRef.current = false;
    }
  }, [token]);

  return { sync, status, lastSyncAt };
}
