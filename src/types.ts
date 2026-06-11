export type Difficulty = 'easy' | 'medium' | 'hard';

export type InputMethod = 'wubi86' | 'shuangpin';

export interface TypingStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  duration: number;
  progress: number;
  isFinished: boolean;
}

export interface PracticeSession {
  id: string;
  date: string; // ISO string
  wpm: number;
  accuracy: number;
  duration: number; // seconds
  inputMethod: InputMethod;
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
