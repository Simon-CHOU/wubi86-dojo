import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PracticeSession, BaselineData, SettingsData } from '../types';

// ---------------------------------------------------------------------------
// Persisted schema version – bump when the shape of stored data changes.
// ---------------------------------------------------------------------------

export const STORE_VERSION = 1;

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface State {
  sessions: PracticeSession[];
  baseline: BaselineData | null;
  settings: SettingsData;

  // Actions
  addSession: (session: PracticeSession) => void;
  setBaseline: (data: BaselineData) => void;
  updateSettings: (settings: Partial<SettingsData>) => void;
  resetProgress: () => void;
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

function isValidBaselineData(value: unknown): value is BaselineData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.wpm === 'number' &&
    Number.isFinite(obj.wpm) &&
    obj.wpm >= 0 &&
    typeof obj.testDate === 'string' &&
    obj.testDate.length > 0
  );
}

function isValidSession(session: unknown): session is PracticeSession {
  if (typeof session !== 'object' || session === null) return false;
  const s = session as Record<string, unknown>;

  return (
    typeof s.id === 'string' &&
    s.id.length > 0 &&
    typeof s.date === 'string' &&
    s.date.length > 0 &&
    typeof s.wpm === 'number' &&
    Number.isFinite(s.wpm) &&
    s.wpm >= 0 &&
    typeof s.accuracy === 'number' &&
    Number.isFinite(s.accuracy) &&
    s.accuracy >= 0 &&
    s.accuracy <= 100 &&
    typeof s.duration === 'number' &&
    Number.isFinite(s.duration) &&
    s.duration > 0 &&
    (s.inputMethod === 'wubi86' || s.inputMethod === 'shuangpin') &&
    Array.isArray(s.mistakes)
  );
}

function isValidPartialSettings(
  value: unknown,
): value is Partial<SettingsData> {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;

  if (s.targetWpm !== undefined) {
    if (typeof s.targetWpm !== 'number' || !Number.isFinite(s.targetWpm) || s.targetWpm < 0) return false;
  }
  if (s.startDate !== undefined) {
    if (typeof s.startDate !== 'string') return false;
    const parsed = Date.parse(s.startDate);
    if (isNaN(parsed)) return false;
  }
  if (s.daysDuration !== undefined) {
    if (typeof s.daysDuration !== 'number' || !Number.isFinite(s.daysDuration) || s.daysDuration < 1) return false;
  }
  if (s.sessionLength !== undefined) {
    if (typeof s.sessionLength !== 'number' || !Number.isFinite(s.sessionLength) || s.sessionLength < 1) return false;
  }
  if (s.showWubiHints !== undefined) {
    if (typeof s.showWubiHints !== 'boolean') return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Migration harness
// ---------------------------------------------------------------------------

function migrate(persistedState: unknown, version: number): State {
  const state = persistedState as Record<string, unknown>;

  // Version 0 (or unversioned) → version 1: ensure all required fields exist
  if (version < 1) {
    const rawSettings = state.settings as Record<string, unknown> | undefined;

    // The persist middleware only stores data fields (non-function),
    // so the cast to State is safe — the store creator will supply actions.
    return {
      sessions: Array.isArray(state.sessions)
        ? state.sessions.filter(isValidSession)
        : [],
      baseline: isValidBaselineData(state.baseline) ? state.baseline : null,
      settings: {
        targetWpm:
          typeof rawSettings?.targetWpm === 'number' &&
          Number.isFinite(rawSettings.targetWpm) &&
          rawSettings.targetWpm >= 0
            ? rawSettings.targetWpm
            : 60,
        startDate:
          typeof rawSettings?.startDate === 'string' &&
          !isNaN(Date.parse(rawSettings.startDate))
            ? rawSettings.startDate
            : new Date().toISOString(),
        daysDuration:
          typeof rawSettings?.daysDuration === 'number' &&
          Number.isFinite(rawSettings.daysDuration) &&
          rawSettings.daysDuration >= 1
            ? rawSettings.daysDuration
            : 30,
        sessionLength:
          typeof rawSettings?.sessionLength === 'number' &&
          Number.isFinite(rawSettings.sessionLength) &&
          rawSettings.sessionLength >= 1
            ? rawSettings.sessionLength
            : 60,
        showWubiHints:
          typeof rawSettings?.showWubiHints === 'boolean'
            ? rawSettings.showWubiHints
            : true,
      },
    } as State;
  }

  // For any future / unknown version, attempt a direct cast.
  return state as unknown as State;
}

// ---------------------------------------------------------------------------
// Default settings
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: SettingsData = {
  targetWpm: 60,
  startDate: new Date().toISOString(),
  daysDuration: 30,
  sessionLength: 60,
  showWubiHints: true,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStore = create<State>()(
  persist(
    (set) => ({
      sessions: [],
      baseline: null,
      settings: { ...DEFAULT_SETTINGS },

      addSession: (session) =>
        set((state) => {
          if (!isValidSession(session)) {
            console.warn(
              '[useStore] addSession: invalid session data, discarding.',
              session,
            );
            return state;
          }
          return { sessions: [...state.sessions, session] };
        }),

      setBaseline: (data) =>
        set((state) => {
          if (!isValidBaselineData(data)) {
            console.warn(
              '[useStore] setBaseline: invalid baseline data, discarding.',
              data,
            );
            return state;
          }
          return {
            baseline: data,
            settings: {
              ...state.settings,
              targetWpm: data.wpm,
            },
          };
        }),

      updateSettings: (partial) =>
        set((state) => {
          if (!isValidPartialSettings(partial)) {
            console.warn(
              '[useStore] updateSettings: invalid settings, discarding.',
              partial,
            );
            return state;
          }
          return { settings: { ...state.settings, ...partial } };
        }),

      resetProgress: () =>
        set((state) => ({
          sessions: [],
          baseline: null,
          // Keep all other settings intact (targetWpm included).
          settings: state.settings,
        })),
    }),
    {
      name: 'wubi86-dojo-storage',
      version: STORE_VERSION,
      migrate,
    },
  ),
);
