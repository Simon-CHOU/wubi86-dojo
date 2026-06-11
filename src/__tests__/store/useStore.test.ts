import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../../store/useStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockSession(
  overrides: Partial<{
    id: string;
    date: string;
    wpm: number;
    accuracy: number;
    duration: number;
    inputMethod: 'wubi86' | 'shuangpin';
    mistakes: string[];
  }> = {},
) {
  return {
    id: 'session-001',
    date: '2026-06-12T10:00:00.000Z',
    wpm: 30,
    accuracy: 95,
    duration: 60,
    inputMethod: 'wubi86' as const,
    mistakes: [],
    ...overrides,
  };
}

const DEFAULT_SETTINGS = {
  targetWpm: 60,
  startDate: '2026-06-12T00:00:00.000Z',
  daysDuration: 30,
  sessionLength: 60,
  showWubiHints: true,
};

function resetStore() {
  localStorage.clear();
  useStore.setState({
    sessions: [],
    baseline: null,
    settings: { ...DEFAULT_SETTINGS },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('initial state', () => {
    it('has empty sessions array', () => {
      const state = useStore.getState();
      expect(state.sessions).toEqual([]);
    });

    it('has null baseline', () => {
      const state = useStore.getState();
      expect(state.baseline).toBeNull();
    });

    it('has default settings with targetWpm = 60', () => {
      const state = useStore.getState();
      expect(state.settings.targetWpm).toBe(60);
      expect(state.settings.daysDuration).toBe(30);
      expect(state.settings.sessionLength).toBe(60);
      expect(state.settings.showWubiHints).toBe(true);
      expect(typeof state.settings.startDate).toBe('string');
    });

    it('has all action functions defined', () => {
      const state = useStore.getState();
      expect(typeof state.addSession).toBe('function');
      expect(typeof state.setBaseline).toBe('function');
      expect(typeof state.updateSettings).toBe('function');
      expect(typeof state.resetProgress).toBe('function');
    });
  });

  // -----------------------------------------------------------------------
  // addSession
  // -----------------------------------------------------------------------

  describe('addSession', () => {
    it('adds a valid session to the sessions array', () => {
      const session = createMockSession();
      useStore.getState().addSession(session);

      const state = useStore.getState();
      expect(state.sessions).toHaveLength(1);
      expect(state.sessions[0]).toEqual(session);
    });

    it('appends multiple sessions in order', () => {
      const s1 = createMockSession({ id: 's1' });
      const s2 = createMockSession({ id: 's2' });
      const s3 = createMockSession({ id: 's3' });

      useStore.getState().addSession(s1);
      useStore.getState().addSession(s2);
      useStore.getState().addSession(s3);

      expect(useStore.getState().sessions).toHaveLength(3);
      expect(useStore.getState().sessions[0].id).toBe('s1');
      expect(useStore.getState().sessions[2].id).toBe('s3');
    });

    it('handles edge case: high WPM', () => {
      const session = createMockSession({ wpm: 200 });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions[0].wpm).toBe(200);
    });

    it('handles edge case: zero accuracy', () => {
      const session = createMockSession({ accuracy: 0 });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions[0].accuracy).toBe(0);
    });

    it('handles edge case: 100% accuracy', () => {
      const session = createMockSession({ accuracy: 100 });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions[0].accuracy).toBe(100);
    });

    it('handles shuangpin input method', () => {
      const session = createMockSession({ inputMethod: 'shuangpin' });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions[0].inputMethod).toBe('shuangpin');
    });

    it('handles session with mistakes', () => {
      const session = createMockSession({ mistakes: ['错', '误'] });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions[0].mistakes).toEqual(['错', '误']);
    });

    it('discards invalid session: missing id', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const session = createMockSession({ id: '' });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions).toHaveLength(0);
      spy.mockRestore();
    });

    it('discards invalid session: negative WPM', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const session = createMockSession({ wpm: -5 });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions).toHaveLength(0);
      spy.mockRestore();
    });

    it('discards invalid session: accuracy > 100', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const session = createMockSession({ accuracy: 150 });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions).toHaveLength(0);
      spy.mockRestore();
    });

    it('discards invalid session: zero duration', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const session = createMockSession({ duration: 0 });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions).toHaveLength(0);
      spy.mockRestore();
    });

    it('discards invalid session: negative duration', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const session = createMockSession({ duration: -10 });
      useStore.getState().addSession(session);
      expect(useStore.getState().sessions).toHaveLength(0);
      spy.mockRestore();
    });

    it('discards invalid session: invalid input method', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const session = { ...createMockSession(), inputMethod: 'invalid' };
      useStore.getState().addSession(session as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(useStore.getState().sessions).toHaveLength(0);
      spy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // setBaseline
  // -----------------------------------------------------------------------

  describe('setBaseline', () => {
    it('updates baseline data', () => {
      const baseline = { wpm: 45, testDate: '2026-06-12T10:00:00.000Z' };
      useStore.getState().setBaseline(baseline);

      expect(useStore.getState().baseline).toEqual(baseline);
    });

    it('updates targetWpm in settings to match baseline WPM', () => {
      const baseline = { wpm: 45, testDate: '2026-06-12T10:00:00.000Z' };
      useStore.getState().setBaseline(baseline);

      expect(useStore.getState().settings.targetWpm).toBe(45);
    });

    it('preserves other settings when updating baseline', () => {
      const baseline = { wpm: 55, testDate: '2026-06-12T10:00:00.000Z' };
      useStore.getState().setBaseline(baseline);

      expect(useStore.getState().settings.daysDuration).toBe(30);
      expect(useStore.getState().settings.sessionLength).toBe(60);
      expect(useStore.getState().settings.showWubiHints).toBe(true);
    });

    it('overwrites previous baseline when called again', () => {
      useStore.getState().setBaseline({ wpm: 30, testDate: '2026-06-01T00:00:00.000Z' });
      useStore.getState().setBaseline({ wpm: 50, testDate: '2026-06-12T00:00:00.000Z' });

      expect(useStore.getState().baseline?.wpm).toBe(50);
      // targetWpm should reflect the latest baseline
      expect(useStore.getState().settings.targetWpm).toBe(50);
    });

    it('discards invalid baseline: missing testDate', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().setBaseline({ wpm: 45, testDate: '' });
      expect(useStore.getState().baseline).toBeNull();
      spy.mockRestore();
    });

    it('discards invalid baseline: negative WPM', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().setBaseline({ wpm: -1, testDate: '2026-06-12T00:00:00.000Z' });
      expect(useStore.getState().baseline).toBeNull();
      spy.mockRestore();
    });

    it('discards invalid baseline: NaN WPM', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().setBaseline({ wpm: NaN, testDate: '2026-06-12T00:00:00.000Z' });
      expect(useStore.getState().baseline).toBeNull();
      spy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // updateSettings
  // -----------------------------------------------------------------------

  describe('updateSettings', () => {
    it('merges partial settings into existing settings', () => {
      useStore.getState().updateSettings({ targetWpm: 80 });

      expect(useStore.getState().settings.targetWpm).toBe(80);
      // Other settings unchanged
      expect(useStore.getState().settings.daysDuration).toBe(30);
      expect(useStore.getState().settings.sessionLength).toBe(60);
    });

    it('updates all setting fields at once', () => {
      useStore.getState().updateSettings({
        targetWpm: 100,
        daysDuration: 60,
        sessionLength: 300,
        showWubiHints: false,
      });

      const s = useStore.getState().settings;
      expect(s.targetWpm).toBe(100);
      expect(s.daysDuration).toBe(60);
      expect(s.sessionLength).toBe(300);
      expect(s.showWubiHints).toBe(false);
    });

    it('preserves startDate when not provided', () => {
      useStore.getState().updateSettings({ targetWpm: 75 });
      expect(useStore.getState().settings.startDate).toBe(DEFAULT_SETTINGS.startDate);
    });

    it('allows updating startDate', () => {
      const newDate = '2026-07-01T00:00:00.000Z';
      useStore.getState().updateSettings({ startDate: newDate });
      expect(useStore.getState().settings.startDate).toBe(newDate);
    });

    it('discards invalid targetWpm (negative)', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().updateSettings({ targetWpm: -10 });
      // Settings should remain unchanged
      expect(useStore.getState().settings.targetWpm).toBe(60);
      spy.mockRestore();
    });

    it('discards invalid daysDuration (< 1)', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().updateSettings({ daysDuration: 0 });
      expect(useStore.getState().settings.daysDuration).toBe(30);
      spy.mockRestore();
    });

    it('discards invalid sessionLength (< 1)', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().updateSettings({ sessionLength: 0 });
      expect(useStore.getState().settings.sessionLength).toBe(60);
      spy.mockRestore();
    });

    it('discards invalid startDate string', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().updateSettings({ startDate: 'not-a-valid-date' });
      expect(useStore.getState().settings.startDate).toBe(DEFAULT_SETTINGS.startDate);
      spy.mockRestore();
    });

    it('discards wrong type for showWubiHints', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().updateSettings({ showWubiHints: 'true' as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(useStore.getState().settings.showWubiHints).toBe(true);
      spy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // resetProgress
  // -----------------------------------------------------------------------

  describe('resetProgress', () => {
    it('clears sessions array', () => {
      useStore.getState().addSession(createMockSession());
      useStore.getState().resetProgress();

      expect(useStore.getState().sessions).toHaveLength(0);
    });

    it('clears baseline', () => {
      useStore.getState().setBaseline({ wpm: 45, testDate: '2026-06-12T00:00:00.000Z' });
      useStore.getState().resetProgress();

      expect(useStore.getState().baseline).toBeNull();
    });

    it('preserves settings unchanged', () => {
      useStore.getState().updateSettings({
        targetWpm: 80,
        daysDuration: 45,
        sessionLength: 180,
        showWubiHints: false,
      });

      useStore.getState().resetProgress();

      const s = useStore.getState().settings;
      expect(s.targetWpm).toBe(80);
      expect(s.daysDuration).toBe(45);
      expect(s.sessionLength).toBe(180);
      expect(s.showWubiHints).toBe(false);
    });

    it('preserves startDate after reset', () => {
      useStore.getState().resetProgress();
      expect(useStore.getState().settings.startDate).toBe(DEFAULT_SETTINGS.startDate);
    });
  });

  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------

  describe('persistence', () => {
    it('writes sessions to localStorage after addSession', () => {
      const session = createMockSession();
      useStore.getState().addSession(session);

      const stored = localStorage.getItem('wubi86-dojo-storage');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.sessions).toHaveLength(1);
      expect(parsed.state.sessions[0].id).toBe('session-001');
    });

    it('writes baseline to localStorage after setBaseline', () => {
      useStore.getState().setBaseline({
        wpm: 45,
        testDate: '2026-06-12T00:00:00.000Z',
      });

      const stored = localStorage.getItem('wubi86-dojo-storage');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.baseline.wpm).toBe(45);
    });

    it('writes settings to localStorage after updateSettings', () => {
      useStore.getState().updateSettings({ showWubiHints: false });

      const stored = localStorage.getItem('wubi86-dojo-storage');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.settings.showWubiHints).toBe(false);
    });

    it('removes sessions from localStorage after resetProgress', () => {
      useStore.getState().addSession(createMockSession());
      useStore.getState().resetProgress();

      const stored = localStorage.getItem('wubi86-dojo-storage');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.sessions).toEqual([]);
    });

    it('state is stable across getState calls (no unexpected mutation)', () => {
      const state1 = useStore.getState();
      const state2 = useStore.getState();
      expect(state1.sessions).toBe(state2.sessions);
    });
  });
});
