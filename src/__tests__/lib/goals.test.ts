import { describe, it, expect } from 'vitest';
import { generateDailyGoals, getGoalForDay } from '../../lib/goals';

// ---------------------------------------------------------------------------
// generateDailyGoals
// ---------------------------------------------------------------------------

describe('generateDailyGoals', () => {
  it('generates 31 entries for a 30-day plan (days 0 through 30)', () => {
    const goals = generateDailyGoals(60, 30);
    expect(goals).toHaveLength(31);
  });

  it('starts at 0 on day 0', () => {
    const goals = generateDailyGoals(60, 30);
    expect(goals[0]).toEqual({ day: 0, targetWpm: 0 });
  });

  it('reaches baseline on final day', () => {
    const goals = generateDailyGoals(60, 30);
    expect(goals[30].targetWpm).toBe(60);
  });

  it('day 15 is roughly halfway for 60 WPM baseline', () => {
    const goals = generateDailyGoals(60, 30);
    expect(goals[15].targetWpm).toBe(30);
  });

  it('handles 1-day duration (day 0 = 0, day 1 = baseline)', () => {
    const goals = generateDailyGoals(50, 1);
    expect(goals).toHaveLength(2);
    expect(goals[0].targetWpm).toBe(0);
    expect(goals[1].targetWpm).toBe(50);
  });

  it('rounds intermediate values to nearest integer', () => {
    const goals = generateDailyGoals(100, 3);
    expect(goals[0].targetWpm).toBe(0);
    expect(goals[1].targetWpm).toBe(33); // 100 * 1/3 = 33.33 -> 33
    expect(goals[2].targetWpm).toBe(67); // 100 * 2/3 = 66.66 -> 67
    expect(goals[3].targetWpm).toBe(100);
  });

  it('returns empty array for 0 days duration', () => {
    const goals = generateDailyGoals(60, 0);
    expect(goals).toHaveLength(0);
  });

  it('returns empty array for negative days duration', () => {
    const goals = generateDailyGoals(60, -5);
    expect(goals).toHaveLength(0);
  });

  it('returns empty array for 0 baseline WPM', () => {
    const goals = generateDailyGoals(0, 30);
    expect(goals).toHaveLength(0);
  });

  it('returns empty array for negative baseline WPM', () => {
    const goals = generateDailyGoals(-10, 30);
    expect(goals).toHaveLength(0);
  });

  it('generates goals with correct day indices', () => {
    const goals = generateDailyGoals(60, 30);
    goals.forEach((goal, index) => {
      expect(goal.day).toBe(index);
    });
  });

  it('generates monotonic increasing targets', () => {
    const goals = generateDailyGoals(60, 30);
    for (let i = 1; i < goals.length; i++) {
      expect(goals[i].targetWpm).toBeGreaterThanOrEqual(goals[i - 1].targetWpm);
    }
  });

  it('handles large duration plans', () => {
    const goals = generateDailyGoals(120, 90);
    expect(goals).toHaveLength(91);
    expect(goals[0].targetWpm).toBe(0);
    expect(goals[90].targetWpm).toBe(120);
  });
});

// ---------------------------------------------------------------------------
// getGoalForDay
// ---------------------------------------------------------------------------

describe('getGoalForDay', () => {
  it('returns 30 WPM for day 15 in a 30-day 60 WPM plan', () => {
    expect(getGoalForDay(60, 30, 15)).toBe(30);
  });

  it('returns baseline for the final day', () => {
    expect(getGoalForDay(60, 30, 30)).toBe(60);
  });

  it('returns 0 for day 0', () => {
    expect(getGoalForDay(100, 30, 0)).toBe(0);
  });

  it('caps at baseline for days beyond duration', () => {
    expect(getGoalForDay(60, 30, 50)).toBe(60);
  });

  it('returns 0 for negative day number', () => {
    expect(getGoalForDay(60, 30, -5)).toBe(0);
  });

  it('returns 0 when daysDuration is 0', () => {
    expect(getGoalForDay(60, 0, 0)).toBe(0);
  });

  it('returns 0 when baseline is 0', () => {
    expect(getGoalForDay(0, 30, 15)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    // 100 WPM over 3 days: day 1 -> 100 * 1/3 = 33.33 -> 33
    expect(getGoalForDay(100, 3, 1)).toBe(33);
  });
});
