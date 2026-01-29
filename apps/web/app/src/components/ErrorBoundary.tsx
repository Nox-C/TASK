'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error details to help debug
    console.log('Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 flex items-center justify-center p-8">
          <div className="bg-red-800 rounded-lg p-8 max-w-2xl w-full border-2 border-red-600">
            <h1 className="text-3xl font-bold text-red-100 mb-4">
              🚨 Client-Side Error Detected
            </h1>
            <div className="bg-red-900 rounded p-4 mb-4">
              <h2 className="text-xl font-semibold text-red-200 mb-2">Error Details:</h2>
              <pre className="text-red-100 text-sm overflow-auto">
                {this.state.error?.message}
              </pre>
            </div>
            <div className="bg-red-900 rounded p-4 mb-4">
              <h2 className="text-xl font-semibold text-red-200 mb-2">Component Stack:</h2>
              <pre className="text-red-100 text-xs overflow-auto">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
            <div className="bg-red-900 rounded p-4 mb-4">
              <h2 className="text-xl font-semibold text-red-200 mb-2">Full Stack:</h2>
              <pre className="text-red-100 text-xs overflow-auto max-h-40">
                {this.state.error?.stack}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
