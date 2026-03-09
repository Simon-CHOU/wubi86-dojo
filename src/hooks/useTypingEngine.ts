import { useState, useEffect, useRef, useCallback } from 'react';

export interface TypingStats {
  wpm: number;
  accuracy: number;
  duration: number;
  progress: number;
  isFinished: boolean;
}

export const useTypingEngine = (targetText: string, durationLimit?: number) => {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Timer ref to handle intervals
  const timerRef = useRef<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setStartTime(Date.now());
    setEndTime(null);
    setUserInput('');
    setElapsedTime(0);
  }, [isRunning]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    setIsRunning(false);
    setEndTime(Date.now());
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setEndTime(null);
    setUserInput('');
    setElapsedTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!isRunning && !endTime) {
      start();
    }
    const newValue = e.target.value;
    setUserInput(newValue);

    // Check completion
    if (newValue.length >= targetText.length) {
       // Ideally we should check if it matches, but for now just length
       // Real completion check logic can be more complex
       if (newValue === targetText) {
         stop();
       }
    }
  }, [isRunning, endTime, start, stop, targetText]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
           const newTime = prev + 1;
           if (durationLimit && newTime >= durationLimit) {
             stop();
           }
           return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, durationLimit, stop]);

  // Calculate stats
  const calculateStats = (): TypingStats => {
    const timeInMinutes = (elapsedTime === 0 ? 1 : elapsedTime) / 60;
    
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (i < targetText.length && userInput[i] === targetText[i]) {
        correctChars++;
      }
    }

    // WPM = (Correct Characters) / Time
    const wpm = Math.round(correctChars / timeInMinutes);
    
    // Accuracy
    const accuracy = userInput.length > 0 
      ? Math.round((correctChars / userInput.length) * 100) 
      : 100;

    const progress = Math.min(100, Math.round((userInput.length / targetText.length) * 100));

    return {
      wpm,
      accuracy,
      duration: elapsedTime,
      progress,
      isFinished: !isRunning && !!endTime,
    };
  };

  return {
    userInput,
    handleInputChange,
    start,
    stop,
    reset,
    stats: calculateStats(),
    isRunning,
  };
};
