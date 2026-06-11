import {
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  calculateCPM,
  calculateWPM,
  calculateAccuracy,
  calculateProgress,
} from '../lib/wpm';
import type { TypingStats } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CharState = 'correct' | 'incorrect' | 'pending';
type Status = 'idle' | 'running' | 'paused' | 'finished';

interface State {
  userInput: string;
  status: Status;
  startTime: number | null;
  elapsedMs: number;
  charStates: CharState[];
  targetText: string;
  durationLimit: number | undefined;
}

type Action =
  | { type: 'START' }
  | { type: 'INPUT_CHAR'; payload: string }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | {
      type: 'SET_TARGET';
      payload: string;
      durationLimit: number | undefined;
    };

// ---------------------------------------------------------------------------
// Reducer (pure — all logic lives here)
// ---------------------------------------------------------------------------

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        status: 'running',
        startTime: Date.now(),
        userInput: '',
        elapsedMs: 0,
        charStates: state.targetText.split('').map((): CharState => 'pending'),
      };

    case 'INPUT_CHAR': {
      const { targetText } = state;
      const input = action.payload;

      // Build per-character states up to the target length
      const charStates: CharState[] = targetText
        .split('')
        .map((char, i) => {
          if (i < input.length) {
            return input[i] === char ? 'correct' : 'incorrect';
          }
          return 'pending';
        });

      // Auto-finish when the input exactly matches the target
      const isFinished = input === targetText;

      return {
        ...state,
        userInput: input,
        charStates,
        status: isFinished ? 'finished' : state.status,
      };
    }

    case 'TICK': {
      const elapsedMs = state.elapsedMs + 100;
      const timeUp =
        state.durationLimit !== undefined &&
        elapsedMs >= state.durationLimit * 1000;

      return {
        ...state,
        elapsedMs,
        status: timeUp ? 'finished' : state.status,
      };
    }

    case 'PAUSE':
      return { ...state, status: 'paused' };

    case 'RESUME':
      return { ...state, status: 'running' };

    case 'STOP':
      return { ...state, status: 'finished' };

    case 'RESET':
      return {
        ...state,
        userInput: '',
        status: 'idle',
        startTime: null,
        elapsedMs: 0,
        charStates: state.targetText.split('').map((): CharState => 'pending'),
      };

    case 'SET_TARGET':
      return {
        ...state,
        targetText: action.payload,
        durationLimit: action.durationLimit,
        userInput: '',
        status: 'idle',
        startTime: null,
        elapsedMs: 0,
        charStates: action.payload.split('').map((): CharState => 'pending'),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTypingEngine(
  targetText: string,
  durationLimit?: number,
) {
  const initialState: State = {
    userInput: '',
    status: 'idle',
    startTime: null,
    elapsedMs: 0,
    charStates: targetText.split('').map((): CharState => 'pending'),
    targetText,
    durationLimit,
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  // -- Refs for stable callbacks -----------------------------------------

  const statusRef = useRef(state.status);
  statusRef.current = state.status;

  // -- Sync external prop changes ----------------------------------------

  const prevTargetRef = useRef(targetText);
  const prevLimitRef = useRef(durationLimit);

  useEffect(() => {
    if (
      targetText !== prevTargetRef.current ||
      durationLimit !== prevLimitRef.current
    ) {
      prevTargetRef.current = targetText;
      prevLimitRef.current = durationLimit;
      dispatch({ type: 'SET_TARGET', payload: targetText, durationLimit });
    }
  }, [targetText, durationLimit]);

  // -- Timer --------------------------------------------------------------

  useEffect(() => {
    if (state.status !== 'running') return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100);

    return () => clearInterval(interval);
  }, [state.status]);

  // -- Action creators ----------------------------------------------------

  const start = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);

  const stop = useCallback(() => {
    dispatch({ type: 'STOP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  /**
   * Stable callback — never re-created across renders since it reads the
   * current status from `statusRef` rather than from its closure.  This
   * avoids the stale-closure problem inherent in the old `setState`-based
   * implementation.
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const newValue = e.target.value;

      if (statusRef.current === 'idle') {
        dispatch({ type: 'START' });
      }

      if (statusRef.current === 'idle' || statusRef.current === 'running') {
        dispatch({ type: 'INPUT_CHAR', payload: newValue });
      }
      // Paused / finished states silently drop the keystroke.
    },
    [],
  );

  // -- Stats --------------------------------------------------------------

  const stats = useMemo((): TypingStats => {
    const { userInput, targetText, elapsedMs, status } = state;
    const timeMs = elapsedMs;

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (i < targetText.length && userInput[i] === targetText[i]) {
        correctChars++;
      }
    }

    const cpm = calculateCPM(correctChars, timeMs);
    const wpm = calculateWPM(cpm);
    const accuracy = calculateAccuracy(correctChars, userInput.length);
    const progress = calculateProgress(userInput.length, targetText.length);

    return {
      wpm,
      cpm,
      accuracy,
      duration: Math.round(timeMs / 1000),
      progress,
      isFinished: status === 'finished',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userInput, state.targetText, state.elapsedMs, state.status]);

  // -----------------------------------------------------------------------

  return {
    /** The raw text the user has typed so far. */
    userInput: state.userInput,
    /**
     * Stable callback to attach to an `<input>` / `<textarea>` onChange.
     * Automatically starts the engine on the first keystroke.
     */
    handleInputChange,
    /** Manually start / restart the session (clears previous input). */
    start,
    /** Pause the timer (input is ignored while paused). */
    pause,
    /** Resume the timer after a pause. */
    resume,
    /** Force-finish the session. */
    stop,
    /** Reset back to the idle state. */
    reset,
    /** Derived statistics (CPM, WPM, accuracy, progress, …). */
    stats,
    /** True while the timer is actively counting. */
    isRunning: state.status === 'running',
    /** True once the session has finished (auto or manual). */
    isFinished: state.status === 'finished',
    /** Current lifecycle status of the engine. */
    status: state.status,
    /** The target text the user is typing against. */
    targetText: state.targetText,
  };
}
