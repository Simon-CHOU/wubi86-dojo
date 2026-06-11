import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypingEngine } from '../../hooks/useTypingEngine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createChangeEvent(value: string) {
  return {
    target: { value },
  } as React.ChangeEvent<HTMLTextAreaElement>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTypingEngine', () => {
  const TARGET = '你好世界';

  afterEach(() => {
    vi.useRealTimers();
  });

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('initial state', () => {
    it('has status idle', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      expect(result.current.status).toBe('idle');
    });

    it('has empty userInput', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      expect(result.current.userInput).toBe('');
    });

    it('is not running and not finished', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });

    it('has zeroed stats', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      expect(result.current.stats.wpm).toBe(0);
      expect(result.current.stats.cpm).toBe(0);
      expect(result.current.stats.accuracy).toBe(0);
      expect(result.current.stats.progress).toBe(0);
      expect(result.current.stats.duration).toBe(0);
      expect(result.current.stats.isFinished).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // start
  // -----------------------------------------------------------------------

  describe('start()', () => {
    it('sets status to running', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      expect(result.current.status).toBe('running');
    });

    it('sets isRunning to true', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      expect(result.current.isRunning).toBe(true);
    });

    it('clears previous userInput', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      // Type something first
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      // Then start again
      act(() => {
        result.current.start();
      });
      expect(result.current.userInput).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // handleInputChange
  // -----------------------------------------------------------------------

  describe('handleInputChange', () => {
    it('updates userInput', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent('你'));
      });
      expect(result.current.userInput).toBe('你');
    });

    it('auto-starts the engine on first keystroke', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      expect(result.current.status).toBe('idle');

      act(() => {
        result.current.handleInputChange(createChangeEvent('你'));
      });
      expect(result.current.status).toBe('running');
    });

    it('ignores input after engine is finished', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      // Type to complete
      act(() => {
        result.current.handleInputChange(createChangeEvent(TARGET));
      });
      expect(result.current.isFinished).toBe(true);

      // Try typing more
      act(() => {
        result.current.handleInputChange(createChangeEvent(TARGET + '!'));
      });
      // Input should NOT have changed
      expect(result.current.userInput).toBe(TARGET);
    });

    it('ignores input when paused', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      act(() => {
        result.current.pause();
      });
      expect(result.current.status).toBe('paused');

      act(() => {
        result.current.handleInputChange(createChangeEvent('你'));
      });
      expect(result.current.userInput).toBe('');
    });

    it('allows input after resume from pause', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      act(() => {
        result.current.pause();
      });
      act(() => {
        result.current.resume();
      });
      act(() => {
        result.current.handleInputChange(createChangeEvent('你'));
      });
      expect(result.current.userInput).toBe('你');
      expect(result.current.status).toBe('running');
    });
  });

  // -----------------------------------------------------------------------
  // Completion detection
  // -----------------------------------------------------------------------

  describe('completion detection', () => {
    it('completes when userInput exactly matches targetText', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent(TARGET));
      });
      expect(result.current.status).toBe('finished');
      expect(result.current.isFinished).toBe(true);
    });

    it('does NOT complete when input does not fully match', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      expect(result.current.status).toBe('running');
      expect(result.current.isFinished).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Duration limit
  // -----------------------------------------------------------------------

  describe('duration limit', () => {
    it('triggers finished when elapsed time exceeds durationLimit', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTypingEngine(TARGET, 1)); // 1 second

      act(() => {
        result.current.start();
      });

      // Advance time past the 1-second limit
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.isFinished).toBe(true);
      expect(result.current.status).toBe('finished');
    });

    it('allows typing up to the duration limit', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTypingEngine(TARGET, 2)); // 2 seconds

      act(() => {
        result.current.start();
      });

      // Advance 1 second (still within limit)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.isRunning).toBe(true);

      // Type while within limit
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      expect(result.current.userInput).toBe('你好');
    });
  });

  // -----------------------------------------------------------------------
  // stop
  // -----------------------------------------------------------------------

  describe('stop()', () => {
    it('manually finishes the session', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      act(() => {
        result.current.stop();
      });
      expect(result.current.isFinished).toBe(true);
      expect(result.current.status).toBe('finished');
    });

    it('preserves userInput when stopped', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      act(() => {
        result.current.stop();
      });
      expect(result.current.userInput).toBe('你好');
    });
  });

  // -----------------------------------------------------------------------
  // reset
  // -----------------------------------------------------------------------

  describe('reset()', () => {
    it('returns status to idle', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.status).toBe('idle');
    });

    it('clears userInput', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.userInput).toBe('');
    });

    it('resets isRunning and isFinished', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      act(() => {
        result.current.stop();
      });
      expect(result.current.isFinished).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });

    it('resets stats to zero', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      // Type something first
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.stats.cpm).toBe(0);
      expect(result.current.stats.wpm).toBe(0);
      expect(result.current.stats.progress).toBe(0);
    });

    it('allows a fresh start after reset', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });
      act(() => {
        result.current.reset();
      });
      // Type again
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好世界'));
      });
      expect(result.current.isFinished).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Stats calculation
  // -----------------------------------------------------------------------

  describe('stats calculation', () => {
    it('calculates correct stats after typing with elapsed time', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTypingEngine(TARGET));

      act(() => {
        result.current.start();
      });
      // Let 1 second elapse
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Type first 2 characters correctly
      act(() => {
        result.current.handleInputChange(createChangeEvent('你好'));
      });

      // CPM = 2 chars / (1s / 60s) = 2 / 0.0167 = 120
      // WPM = 120 / 5 = 24
      // Accuracy = 2/2 = 100%
      // Progress = 2/4 = 50%
      expect(result.current.stats.cpm).toBe(120);
      expect(result.current.stats.wpm).toBe(24);
      expect(result.current.stats.accuracy).toBe(100);
      expect(result.current.stats.progress).toBe(50);
      expect(result.current.stats.isFinished).toBe(false);
    });

    it('calculates accuracy with mixed correct/incorrect characters', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTypingEngine(TARGET));

      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Type: first char correct, second incorrect
      act(() => {
        result.current.handleInputChange(createChangeEvent('你x'));
      });

      expect(result.current.stats.accuracy).toBe(50); // 1/2 = 50%
    });

    it('calculates progress as 0% when nothing typed', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      expect(result.current.stats.progress).toBe(0);
    });

    it('calculates progress as 100% after completion', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent(TARGET));
      });
      expect(result.current.stats.progress).toBe(100);
    });

    it('reports isFinished true in stats after completion', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.handleInputChange(createChangeEvent(TARGET));
      });
      expect(result.current.stats.isFinished).toBe(true);
    });

    it('reports duration in seconds (rounded)', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTypingEngine(TARGET));

      act(() => {
        result.current.start();
      });
      // Advance by 1000ms = 10 TICK dispatches (each adds 100ms)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // 1000ms / 1000 = 1 second
      expect(result.current.stats.duration).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // pause / resume
  // -----------------------------------------------------------------------

  describe('pause / resume', () => {
    it('pause transitions to paused status', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      act(() => {
        result.current.pause();
      });
      expect(result.current.status).toBe('paused');
    });

    it('resume returns to running status', () => {
      const { result } = renderHook(() => useTypingEngine(TARGET));
      act(() => {
        result.current.start();
      });
      act(() => {
        result.current.pause();
      });
      act(() => {
        result.current.resume();
      });
      expect(result.current.status).toBe('running');
    });

    it('timer does not tick while paused', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTypingEngine(TARGET));

      act(() => {
        result.current.start();
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.pause();
      });

      // Advance time while paused — timer should not tick
      const durationBefore = result.current.stats.duration;
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Duration should be the same as before (paused timer doesn't tick)
      expect(result.current.stats.duration).toBe(durationBefore);
    });
  });

  // -----------------------------------------------------------------------
  // targetText propagation
  // -----------------------------------------------------------------------

  describe('targetText', () => {
    it('reflects the target text passed to the hook', () => {
      const { result } = renderHook(() => useTypingEngine('ABC'));
      expect(result.current.targetText).toBe('ABC');
    });
  });
});
