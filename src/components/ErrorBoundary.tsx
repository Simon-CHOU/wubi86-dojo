import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
          role="alert"
        >
          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            出了一点问题
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2 max-w-md">
            {this.state.error?.message || '应用发生了未知错误'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-md">
            请尝试刷新页面或点击下方按钮重试。
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
