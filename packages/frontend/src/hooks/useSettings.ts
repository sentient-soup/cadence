import { useState, useCallback } from 'react';
import type { AppSettings } from '@cadence/shared';
import { STORAGE_KEYS } from '../storage/keys';
import { getOne, setOne } from '../storage/storage';

const DEFAULTS: AppSettings = {
  calorieGoal: 2000,
  waterGoalOz: 64,
  updatedAt: 0,
};

export function useSettings(onMutate?: () => void) {
  const [settings, setSettingsState] = useState<AppSettings>(
    () => getOne<AppSettings>(STORAGE_KEYS.APP_SETTINGS) ?? DEFAULTS
  );

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      const next = { ...settings, ...partial, updatedAt: Date.now() };
      setOne(STORAGE_KEYS.APP_SETTINGS, next);
      setSettingsState(next);
      onMutate?.();
    },
    [settings, onMutate]
  );

  const refresh = useCallback(() => {
    setSettingsState(getOne<AppSettings>(STORAGE_KEYS.APP_SETTINGS) ?? DEFAULTS);
  }, []);

  return { settings, updateSettings, refresh };
}
