/**
 * LocalStorage utilities for wubi86-dojo.
 *
 * Provides typed read/write with optional validation (no external
 * schema library needed) and a centralised key registry.
 */

export const STORAGE_KEYS = {
  APP_STATE: 'wubi86-dojo-storage',
  /** @deprecated Use APP_STATE with the zustand persist middleware instead. */
  SETTINGS: 'wubi86-dojo-settings',
  /** @deprecated Use APP_STATE with the zustand persist middleware instead. */
  BASELINE: 'wubi86-dojo-baseline',
  /** @deprecated Use APP_STATE with the zustand persist middleware instead. */
  SESSIONS: 'wubi86-dojo-sessions',
} as const;

/**
 * Retrieve and deserialise an item from localStorage.
 *
 * Returns the parsed value when the key exists, JSON is valid, **and**
 * the provided `validate` guard returns `true`.  Returns `null` otherwise
 * (key missing, parse error, validation failure).
 *
 * @example
 * ```ts
 * interface Foo { bar: number }
 * const foo = getStorageItem<Foo>('my-key', (v): v is Foo =>
 *   typeof v === 'object' && v !== null && typeof (v as Foo).bar === 'number'
 * );
 * ```
 */
export function getStorageItem<T>(
  key: string,
  validate: (value: unknown) => value is T,
): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    // Handles both JSON parse errors and localStorage access errors
    return null;
  }
}

/**
 * Serialise a value and write it to localStorage.
 *
 * Failures (quota exceeded, private browsing restrictions, etc.) are
 * swallowed silently — the caller can choose to check `getStorageItem`
 * afterwards if a round-trip guarantee is required.
 */
export function setStorageItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or environment does not support localStorage
  }
}

/**
 * Remove a key from localStorage.
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
