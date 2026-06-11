import { describe, it, expect } from 'vitest';
import {
  calculateCPM,
  calculateWPM,
  calculateAccuracy,
  calculateProgress,
  formatDuration,
} from '../../lib/wpm';

// ---------------------------------------------------------------------------
// calculateCPM
// ---------------------------------------------------------------------------

describe('calculateCPM', () => {
  it('calculates CPM correctly for normal input', () => {
    // 30 correct chars in 60 seconds = 30 CPM
    expect(calculateCPM(30, 60000)).toBe(30);
  });

  it('handles half-minute durations', () => {
    // 15 chars in 30 seconds = 30 CPM
    expect(calculateCPM(15, 30000)).toBe(30);
  });

  it('returns 0 when timeMs is 0', () => {
    expect(calculateCPM(10, 0)).toBe(0);
  });

  it('returns 0 when timeMs is negative', () => {
    expect(calculateCPM(10, -1000)).toBe(0);
  });

  it('returns 0 when correctChars is 0', () => {
    expect(calculateCPM(0, 60000)).toBe(0);
  });

  it('returns 0 when correctChars is negative', () => {
    expect(calculateCPM(-5, 60000)).toBe(0);
  });

  it('returns 0 when both inputs are zero', () => {
    expect(calculateCPM(0, 0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    // 100 chars in 3 minutes = 33.33... -> 33 CPM
    expect(calculateCPM(100, 180000)).toBe(33);
  });

  it('handles high-speed input', () => {
    // 300 chars in 60 seconds = 300 CPM
    expect(calculateCPM(300, 60000)).toBe(300);
  });

  it('handles sub-second durations correctly', () => {
    // 5 chars in 500ms = 600 CPM
    expect(calculateCPM(5, 500)).toBe(600);
  });
});

// ---------------------------------------------------------------------------
// calculateWPM
// ---------------------------------------------------------------------------

describe('calculateWPM', () => {
  it('converts CPM to WPM dividing by 5', () => {
    expect(calculateWPM(50)).toBe(10);
  });

  it('handles 0 CPM', () => {
    expect(calculateWPM(0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    // 33 / 5 = 6.6 -> 7
    expect(calculateWPM(33)).toBe(7);
  });

  it('handles round division evenly', () => {
    expect(calculateWPM(100)).toBe(20);
  });

  it('handles small CPM values', () => {
    expect(calculateWPM(1)).toBe(0); // 1 / 5 = 0.2 -> 0
    expect(calculateWPM(3)).toBe(1); // 3 / 5 = 0.6 -> 1
  });
});

// ---------------------------------------------------------------------------
// calculateAccuracy
// ---------------------------------------------------------------------------

describe('calculateAccuracy', () => {
  it('returns 100% when all chars correct', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('returns 50% when half correct', () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
  });

  it('returns 0% when nothing typed (totalInput = 0)', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('returns 0% when totalInput is negative', () => {
    expect(calculateAccuracy(5, -1)).toBe(0);
  });

  it('returns 0% when positive total but zero correct', () => {
    expect(calculateAccuracy(0, 10)).toBe(0);
  });

  it('handles partial accuracy: 7/10', () => {
    expect(calculateAccuracy(7, 10)).toBe(70);
  });

  it('handles 1/3 = 33%', () => {
    expect(calculateAccuracy(1, 3)).toBe(33);
  });

  it('handles 2/3 = 67%', () => {
    expect(calculateAccuracy(2, 3)).toBe(67);
  });
});

// ---------------------------------------------------------------------------
// calculateProgress
// ---------------------------------------------------------------------------

describe('calculateProgress', () => {
  it('returns 100% when at target', () => {
    expect(calculateProgress(100, 100)).toBe(100);
  });

  it('returns 50% at halfway', () => {
    expect(calculateProgress(5, 10)).toBe(50);
  });

  it('caps at 100% when past target', () => {
    expect(calculateProgress(150, 100)).toBe(100);
  });

  it('returns 100% when total is 0 (nothing to type)', () => {
    expect(calculateProgress(0, 0)).toBe(100);
  });

  it('returns 100% when total is negative', () => {
    expect(calculateProgress(5, -1)).toBe(100);
  });

  it('returns 0% when current is 0 and total is positive', () => {
    expect(calculateProgress(0, 100)).toBe(0);
  });

  it('scales linearly: 25%', () => {
    expect(calculateProgress(25, 100)).toBe(25);
  });

  it('scales linearly: 99%', () => {
    expect(calculateProgress(99, 100)).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(205)).toBe('3分25秒');
  });

  it('formats exact minute (omits seconds when zero)', () => {
    // Implementation omits "0秒" when seconds are zero
    expect(formatDuration(60)).toBe('1分');
  });

  it('formats seconds only when under a minute', () => {
    expect(formatDuration(45)).toBe('45秒');
  });

  it('formats 0 seconds', () => {
    expect(formatDuration(0)).toBe('0秒');
  });

  it('handles negative input safely (clamps to 0)', () => {
    expect(formatDuration(-5)).toBe('0秒');
  });

  it('handles large values (1 hour = 60 minutes)', () => {
    expect(formatDuration(3600)).toBe('60分');
  });

  it('handles large values with seconds', () => {
    expect(formatDuration(3661)).toBe('61分1秒');
  });

  it('handles very large values', () => {
    // 2 hours = 120 minutes
    expect(formatDuration(7200)).toBe('120分');
  });

  it('rounds fractional seconds', () => {
    expect(formatDuration(90.7)).toBe('1分31秒'); // 90.7 -> 91 -> 1分31秒
  });
});
