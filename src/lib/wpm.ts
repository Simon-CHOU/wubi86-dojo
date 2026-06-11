/**
 * CPM/WPM calculation utilities for wubi86-dojo.
 *
 * For Chinese text, WPM (words per minute) is derived from CPM
 * (characters per minute). One "word" in Chinese is conventionally
 * 5 characters: WPM = CPM / 5.
 */

/**
 * Calculate Characters Per Minute.
 * Returns 0 when timeMs is zero or negative to avoid division by zero.
 * Returns 0 when correctChars is zero (nothing typed).
 */
export function calculateCPM(correctChars: number, timeMs: number): number {
  if (timeMs <= 0 || correctChars <= 0) return 0;
  const minutes = timeMs / 60000;
  return Math.round(correctChars / minutes);
}

/**
 * Calculate Words Per Minute from CPM.
 * WPM = CPM / 5, following the Chinese text convention
 * where one "word" equals five characters.
 */
export function calculateWPM(cpm: number): number {
  return Math.round(cpm / 5);
}

/**
 * Calculate typing accuracy as a percentage in the range [0, 100].
 * Returns 0 when nothing has been typed (totalInput is 0).
 */
export function calculateAccuracy(
  correctChars: number,
  totalInput: number,
): number {
  if (totalInput <= 0) return 0;
  return Math.round((correctChars / totalInput) * 100);
}

/**
 * Calculate progress as a percentage in the range [0, 100].
 * Returns 100 when total is 0 or negative (nothing to type).
 */
export function calculateProgress(current: number, total: number): number {
  if (total <= 0) return 100;
  return Math.min(100, Math.round((current / total) * 100));
}

/**
 * Format a duration in seconds to a Chinese-localized string.
 *
 * Examples:
 *   formatDuration(205)  => "3分25秒"
 *   formatDuration(60)   => "1分"
 *   formatDuration(45)   => "45秒"
 *   formatDuration(0)    => "0秒"
 *   formatDuration(-5)   => "0秒"
 */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;

  if (mins > 0 && secs > 0) return `${mins}分${secs}秒`;
  if (mins > 0) return `${mins}分`;
  return `${secs}秒`;
}
