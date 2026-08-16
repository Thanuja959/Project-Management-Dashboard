const PREFIX = 'pm_dashboard_';

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function removeState(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function hasKey(key: string): boolean {
  return localStorage.getItem(PREFIX + key) !== null;
}
