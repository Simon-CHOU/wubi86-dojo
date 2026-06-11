import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import TypingArea from '../../components/TypingArea';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getWubiCode = (char: string): string => {
  const mapping: Record<string, string> = {
    '你': 'wq',
    '好': 'vb',
    '世': 'an',
    '界': 'lw',
    'A': '',
    'B': '',
    'C': '',
  };
  return mapping[char] || '';
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TypingArea', () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------

  describe('rendering', () => {
    it('renders all characters from the target text', () => {
      const { getByText } = render(
        <TypingArea
          text="ABC"
          userInput=""
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      expect(getByText('A')).toBeDefined();
      expect(getByText('B')).toBeDefined();
      expect(getByText('C')).toBeDefined();
    });

    it('renders Chinese characters correctly', () => {
      const { getByText } = render(
        <TypingArea
          text="你好"
          userInput=""
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      expect(getByText('你')).toBeDefined();
      expect(getByText('好')).toBeDefined();
    });

    it('applies correct role and aria-label to the container', () => {
      const { getByRole } = render(
        <TypingArea
          text="ABC"
          userInput=""
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      const region = getByRole('region');
      expect(region).toHaveAttribute('aria-label', '练习文本显示区域');
    });
  });

  // -----------------------------------------------------------------------
  // Wubi hints
  // -----------------------------------------------------------------------

  describe('wubi hints', () => {
    it('shows wubi hints when showHints is true', () => {
      const { container } = render(
        <TypingArea
          text="你"
          userInput=""
          showHints={true}
          getWubiCode={getWubiCode}
        />,
      );

      // Find the character span container for '你'
      const charSpan = container.querySelector('[aria-label^="字符 你"]');
      expect(charSpan).not.toBeNull();

      // Inside it there should be a hint span showing the wubi code
      const hintSpan = charSpan!.querySelector('.text-\\[0\\.55rem\\]');
      expect(hintSpan).not.toBeNull();
      expect(hintSpan?.textContent).toBe('wq');
    });

    it('hides wubi hints when showHints is false', () => {
      const { container } = render(
        <TypingArea
          text="你"
          userInput=""
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      const charSpan = container.querySelector('[aria-label^="字符 你"]');
      expect(charSpan).not.toBeNull();

      // There should NOT be a hint span when showHints is false
      const hintSpan = charSpan!.querySelector('.text-\\[0\\.55rem\\]');
      expect(hintSpan).toBeNull();
    });

    it('does not render hint span for characters without a wubi code', () => {
      const { container } = render(
        <TypingArea
          text="A"
          userInput=""
          showHints={true}
          getWubiCode={getWubiCode}
        />,
      );

      const charSpan = container.querySelector('[aria-label^="字符 A"]');
      expect(charSpan).not.toBeNull();

      // No wubi code for 'A', so no hint span should appear
      // The first (and only) child span is the character itself
      // There should be no second span for the hint
      const allSpans = charSpan!.querySelectorAll('span');
      expect(allSpans.length).toBe(1); // Only the character span
    });
  });

  // -----------------------------------------------------------------------
  // Character styling
  // -----------------------------------------------------------------------

  describe('character styling', () => {
    it('applies green styling to correct characters', () => {
      const { container } = render(
        <TypingArea
          text="ABC"
          userInput="A"
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      const correctChar = container.querySelector('[aria-label="字符 A (正确)"]');
      expect(correctChar).not.toBeNull();
      expect(correctChar).toHaveClass('text-green-700');
    });

    it('applies red styling to incorrect characters', () => {
      const { container } = render(
        <TypingArea
          text="ABC"
          userInput="X"
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      const incorrectChar = container.querySelector('[aria-label="字符 A (错误)"]');
      expect(incorrectChar).not.toBeNull();
      expect(incorrectChar).toHaveClass('text-red-600');
    });

    it('highlights the current cursor position', () => {
      const { container } = render(
        <TypingArea
          text="ABC"
          userInput=""
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      // Cursor should be at position 0 (first character)
      const cursorChar = container.querySelector('[aria-label="字符 A (当前输入位置)"]');
      expect(cursorChar).not.toBeNull();
      expect(cursorChar).toHaveClass('ring-2');
      expect(cursorChar).toHaveClass('ring-blue-400');
    });

    it('moves cursor to next position after typing', () => {
      const { container } = render(
        <TypingArea
          text="ABC"
          userInput="A"
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      // After typing 'A', cursor moves to position 1 (character 'B')
      const cursorChar = container.querySelector('[aria-label="字符 B (当前输入位置)"]');
      expect(cursorChar).not.toBeNull();

      // The first character should now be marked as correct, not cursor
      const typedChar = container.querySelector('[aria-label="字符 A (正确)"]');
      expect(typedChar).not.toBeNull();
    });

    it('applies pending styling to untyped characters after cursor', () => {
      const { container } = render(
        <TypingArea
          text="ABC"
          userInput="A"
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      // After typing 'A', cursor is at position 1 ('B')
      // 'C' at position 2 is pending (untyped and not current)
      const pendingChar = container.querySelector('[aria-label="字符 C"]');
      expect(pendingChar).not.toBeNull();
      // Should NOT have cursor or error classes
      expect(pendingChar).not.toHaveClass('ring-2');
      expect(pendingChar).not.toHaveClass('text-red-600');
      expect(pendingChar).not.toHaveClass('text-green-700');
    });

    it('marks characters after the target text length as pending', () => {
      // Edge: userInput longer than target
      const { container } = render(
        <TypingArea
          text="AB"
          userInput="ABC"
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      // Both characters of the target should be typed (correct check)
      const charFirst = container.querySelector('[aria-label="字符 A (正确)"]');
      expect(charFirst).not.toBeNull();
      const charSecond = container.querySelector('[aria-label="字符 B (正确)"]');
      expect(charSecond).not.toBeNull();
    });

    it('applies correct aria-labels for each character state', () => {
      const { container } = render(
        <TypingArea
          text="ABC"
          userInput="AX"
          showHints={false}
          getWubiCode={getWubiCode}
        />,
      );

      // A is correct
      expect(container.querySelector('[aria-label="字符 A (正确)"]')).not.toBeNull();
      // B is incorrect (user typed X at index 1)
      expect(container.querySelector('[aria-label="字符 B (错误)"]')).not.toBeNull();
      // C is current cursor position (index 2 = userInput.length)
      expect(container.querySelector('[aria-label="字符 C (当前输入位置)"]')).not.toBeNull();
    });
  });
});
