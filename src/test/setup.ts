import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill scrollIntoView for jsdom (used by TypingArea auto-scroll).
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = vi.fn();
}
