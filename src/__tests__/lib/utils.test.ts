import { describe, it, expect } from 'vitest';
import { cn, classNames, formatDate, formatTime } from '../../lib/utils';

// ---------------------------------------------------------------------------
// cn (className merger)
// ---------------------------------------------------------------------------

describe('cn', () => {
  it('merges multiple class name strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional / falsy values gracefully', () => {
    expect(cn('base', undefined, 'active')).toBe('base active');
    expect(cn('base', null, 'active')).toBe('base active');
    expect(cn('base', false, 'active')).toBe('base active');
  });

  it('resolves Tailwind conflicts via twMerge (later wins)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('resolves deeper Tailwind conflicts', () => {
    expect(cn('text-lg', 'text-sm')).toBe('text-sm');
    expect(cn('p-4', 'p-2', 'p-8')).toBe('p-8');
  });

  it('handles empty input gracefully', () => {
    expect(cn()).toBe('');
  });

  it('handles a single class name', () => {
    expect(cn('only-one')).toBe('only-one');
  });

  it('handles object syntax (clsx-style)', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
    expect(cn({ foo: true }, { bar: true })).toBe('foo bar');
  });

  it('handles mixed array and string arguments', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });
});

// ---------------------------------------------------------------------------
// classNames (alias)
// ---------------------------------------------------------------------------

describe('classNames', () => {
  it('is an alias for cn (same function reference)', () => {
    expect(classNames).toBe(cn);
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  it('formats ISO string to zh-CN date', () => {
    const result = formatDate('2026-06-12T10:30:00.000Z');
    expect(result).toContain('2026');
    expect(result).toContain('6');
    expect(result).toContain('12');
  });

  it('formats a date near year-end correctly', () => {
    // Use a time that stays in 2026 in any timezone (UTC noon = evening in UTC+8)
    const result = formatDate('2026-12-30T23:00:00.000Z');
    expect(result).toContain('2026');
    expect(result).toContain('12');
  });

  it('formats a date near year-start correctly', () => {
    const result = formatDate('2026-01-01T00:00:00.000Z');
    expect(result).toContain('2026');
    expect(result).toContain('1');
    expect(result).toContain('1');
  });

  it('returns the original string for invalid date input', () => {
    const invalid = 'not-a-date';
    expect(formatDate(invalid)).toBe(invalid);
  });

  it('returns original string for empty string', () => {
    expect(formatDate('')).toBe('');
  });

  it('returns original string for malformed ISO strings', () => {
    const malformed = '2026-13-45';
    expect(formatDate(malformed)).toBe(malformed);
  });

  it('handles full ISO datetime with timezone offset', () => {
    const result = formatDate('2026-06-12T00:00:00+08:00');
    expect(result).toContain('2026');
  });
});

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2分5秒');
  });

  it('formats seconds only when under a minute', () => {
    expect(formatTime(30)).toBe('30秒');
  });

  it('handles 0 seconds', () => {
    expect(formatTime(0)).toBe('0秒');
  });

  it('handles negative values safely (clamps to 0)', () => {
    expect(formatTime(-10)).toBe('0秒');
  });

  it('formats exact minute (includes zero seconds)', () => {
    // formatTime always includes seconds when mins > 0, unlike formatDuration
    expect(formatTime(60)).toBe('1分0秒');
  });

  it('rounds fractional seconds', () => {
    expect(formatTime(90.7)).toBe('1分31秒');
  });

  it('handles large values', () => {
    expect(formatTime(3600)).toBe('60分0秒');
    expect(formatTime(3661)).toBe('61分1秒');
  });

  it('handles single-digit seconds with minutes', () => {
    expect(formatTime(61)).toBe('1分1秒');
  });
});
