import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PracticeSession {
  id: string;
  date: string; // ISO string
  wpm: number;
  accuracy: number;
  duration: number; // seconds
  inputMethod: 'wubi86' | 'shuangpin';
  mistakes: string[];
}

export interface BaselineData {
  wpm: number;
  testDate: string;
}

export interface SettingsData {
  targetWpm: number;
  startDate: string;
  daysDuration: number; // default 30
  sessionLength: number; // default 300 seconds (5 mins) for practice, maybe adjustable
  showWubiHints: boolean;
}

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

export const useStore = create<State>()(
  persist(
    (set) => ({
      sessions: [],
      baseline: null,
      settings: {
        targetWpm: 60, // Default target, will be calculated from baseline
        startDate: new Date().toISOString(),
        daysDuration: 30,
        sessionLength: 60, // 1 minute default for quick practice
        showWubiHints: true,
      },

      addSession: (session) => set((state) => ({ 
        sessions: [...state.sessions, session] 
      })),

      setBaseline: (data) => set((state) => {
        // When baseline is set, we can also update the target WPM if needed
        // For now just save the baseline
        return { baseline: data };
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetProgress: () => set({ sessions: [], baseline: null }),
    }),
    {
      name: 'wubi86-dojo-storage',
    }
  )
);
