import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Alias for cn */
export const classNames = cn;

/**
 * Format an ISO date string to a human-readable date.
 * Example: "2026-06-12T10:30:00Z" => "2026年6月12日"
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

/**
 * Format a duration in seconds to a localized Chinese time string.
 * Examples:
 *   formatTime(205)  => "3分25秒"
 *   formatTime(60)   => "1分0秒"
 *   formatTime(0)    => "0秒"
 */
export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins > 0) return `${mins}分${secs}秒`;
  return `${secs}秒`;
}
