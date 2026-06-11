import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A component that throws an error during render. */
const ThrowComponent: React.FC<{ message?: string }> = ({ message }) => {
  throw new Error(message ?? 'Intentional test error');
};

/** A stable component that renders without errors. */
function SafeComponent() {
  return <div data-testid="safe-child">正常内容</div>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ErrorBoundary', () => {
  // Suppress console.error noise from React error boundary logs
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // Normal rendering (no error)
  // -----------------------------------------------------------------------

  describe('when no error occurs', () => {
    it('renders children normally', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('safe-child')).toBeDefined();
      expect(screen.getByText('正常内容')).toBeDefined();
    });

    it('does not show the error UI', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>,
      );

      expect(screen.queryByText('出了一点问题')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('passes through multiple children', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('child-1')).toBeDefined();
      expect(screen.getByTestId('child-2')).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------

  describe('when a child throws', () => {
    it('renders error UI with role="alert"', () => {
      render(
        <ErrorBoundary>
          <ThrowComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('alert')).toBeDefined();
    });

    it('shows a heading with Chinese error title', () => {
      render(
        <ErrorBoundary>
          <ThrowComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText('出了一点问题')).toBeDefined();
    });

    it('displays the error message', () => {
      render(
        <ErrorBoundary>
          <ThrowComponent message="自定义错误信息" />
        </ErrorBoundary>,
      );

      expect(screen.getByText('自定义错误信息')).toBeDefined();
    });

    it('displays a fallback message when error has no message', () => {
      render(
        <ErrorBoundary>
          <ThrowComponent message="" />
        </ErrorBoundary>,
      );

      expect(screen.getByText('应用发生了未知错误')).toBeDefined();
    });

    it('shows a retry button with Chinese label', () => {
      render(
        <ErrorBoundary>
          <ThrowComponent />
        </ErrorBoundary>,
      );

      const retryButton = screen.getByText('重试');
      expect(retryButton).toBeDefined();
      expect(retryButton.tagName).toBe('BUTTON');
    });

    it('renders an icon (alert triangle)', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowComponent />
        </ErrorBoundary>,
      );

      // Lucide AlertTriangle renders with aria-hidden="true"
      const alertIcon = container.querySelector('[aria-hidden="true"]');
      expect(alertIcon).not.toBeNull();
    });

    it('does not render the original children when in error state', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
          <ThrowComponent />
        </ErrorBoundary>,
      );

      // Safe component should not be rendered due to the sibling error
      expect(screen.queryByTestId('safe-child')).toBeNull();
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // Retry
  // -----------------------------------------------------------------------

  describe('retry button', () => {
    it('clicking retry resets the error state (error UI still shown if child still throws)', () => {
      render(
        <ErrorBoundary>
          <ThrowComponent />
        </ErrorBoundary>,
      );

      // Should be in error state
      expect(screen.getByRole('alert')).toBeDefined();

      // Click retry — ErrorBoundary resets, but ThrowComponent throws again
      fireEvent.click(screen.getByText('重试'));

      // The error boundary is still in error state because the same child throws
      expect(screen.getByRole('alert')).toBeDefined();
    });

    it('recovers after fixing the cause of the error', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowComponent />
        </ErrorBoundary>,
      );

      // Should be in error state
      expect(screen.getByRole('alert')).toBeDefined();

      // Replace throwing child with safe child BEFORE clicking retry.
      // ErrorBoundary still hasError=true so SafeComponent is not shown yet.
      rerender(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>,
      );

      // ErrorBoundary still shows error UI because state hasn't been reset
      expect(screen.getByRole('alert')).toBeDefined();

      // Click retry to reset error boundary state
      fireEvent.click(screen.getByText('重试'));

      // Now the safe component should render (no error from SafeComponent)
      expect(screen.getByTestId('safe-child')).toBeDefined();
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('does not show retry as disabled', () => {
      render(
        <ErrorBoundary>
          <ThrowComponent />
        </ErrorBoundary>,
      );

      const retryButton = screen.getByText('重试');
      expect(retryButton).not.toBeDisabled();
    });
  });
});
