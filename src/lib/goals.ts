/**
 * Daily goal calculation for wubi86-dojo.
 *
 * Goals follow a linear progression from 0 to the user's baseline WPM
 * over the specified number of days. Day 0 starts at 0 WPM; day
 * `daysDuration` reaches `baselineWpm`.
 */

export interface DailyGoal {
  day: number;
  targetWpm: number;
}

/**
 * Generate an array of daily goals showing linear progression from 0
 * to baselineWpm.  Returns an empty array when either argument is
 * non-positive.
 */
export function generateDailyGoals(
  baselineWpm: number,
  daysDuration: number,
): DailyGoal[] {
  if (daysDuration <= 0 || baselineWpm <= 0) return [];

  const goals: DailyGoal[] = [];
  for (let day = 0; day <= daysDuration; day++) {
    goals.push({
      day,
      targetWpm: interpolate(baselineWpm, daysDuration, day),
    });
  }
  return goals;
}

/**
 * Return the target WPM for a specific day in the plan.
 * Clamps `currentDay` to the range [0, daysDuration].
 *
 * Day 0 always returns 0; day `daysDuration` returns `baselineWpm`.
 */
export function getGoalForDay(
  baselineWpm: number,
  daysDuration: number,
  currentDay: number,
): number {
  return interpolate(baselineWpm, daysDuration, currentDay);
}

/** Linear interpolation helper. */
function interpolate(
  baselineWpm: number,
  daysDuration: number,
  currentDay: number,
): number {
  if (baselineWpm <= 0 || daysDuration <= 0) return 0;

  const day = Math.max(0, Math.min(currentDay, daysDuration));
  const progress = day / daysDuration;
  return Math.round(baselineWpm * progress);
}
