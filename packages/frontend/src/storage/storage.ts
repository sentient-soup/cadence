import type { BaseEntry } from '@fitness/shared';

export function getAll<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

export function getOne<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setOne<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function appendEntry<T extends BaseEntry>(key: string, entry: T): void {
  const all = getAll<T>(key);
  all.push(entry);
  localStorage.setItem(key, JSON.stringify(all));
}

export function upsertByDate<T extends BaseEntry>(key: string, entry: T): void {
  const all = getAll<T>(key);
  const idx = all.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...entry };
  } else {
    all.push(entry);
  }
  localStorage.setItem(key, JSON.stringify(all));
}

export function deleteEntry(key: string, id: string): void {
  const all = getAll<BaseEntry>(key);
  const now = Date.now();
  // Soft delete: mark as deleted + bump updatedAt so sync propagates the deletion
  const updated = all.map((e) =>
    e.id === id ? { ...e, deleted: true, updatedAt: now } : e
  );
  localStorage.setItem(key, JSON.stringify(updated));
}

/**
 * Merge entries received from the server into localStorage.
 * Server wins when updatedAt is newer; deleted entries are kept as tombstones.
 */
export function mergeEntries<T extends BaseEntry>(key: string, serverEntries: T[]): void {
  if (!serverEntries.length) return;
  const all = getAll<T>(key);
  const byId = new Map(all.map((e) => [e.id, e]));

  for (const s of serverEntries) {
    const local = byId.get(s.id);
    if (!local || s.updatedAt > local.updatedAt) {
      byId.set(s.id, s);
    }
  }

  localStorage.setItem(key, JSON.stringify([...byId.values()]));
}

/**
 * Returns entries modified after `since` (for pushing to server).
 */
export function getChangedSince<T extends BaseEntry>(key: string, since: number): T[] {
  return getAll<T>(key).filter((e) => e.updatedAt > since);
}
