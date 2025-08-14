"use client";

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.resetError} />;
    }

    return this.props.children;
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };
}

interface ErrorFallbackProps {
  error?: Error;
  onReset?: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card bg-base-100 shadow-lg max-w-md w-full">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="card-title text-error justify-center mb-2">
            앗! 문제가 발생했습니다
          </h2>
          <p className="text-base-content/70 mb-6">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          
          {error && (
            <details className="collapse collapse-arrow bg-base-200 mb-4">
              <summary className="collapse-title text-sm font-medium">
                에러 상세 정보
              </summary>
              <div className="collapse-content">
                <pre className="text-xs text-left bg-base-300 p-3 rounded overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </div>
            </details>
          )}

          <div className="card-actions justify-center gap-2">
            <button 
              className="btn btn-primary"
              onClick={onReset}
            >
              다시 시도
            </button>
            <button 
              className="btn btn-ghost"
              onClick={() => window.location.reload()}
            >
              페이지 새로고침
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => window.history.back()}
            >
              이전 페이지
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 에러 보고 유틸리티
export function reportError(error: Error, context?: string) {
  console.error(`[${context || 'Unknown'}] Error:`, error);
  
  // 실제 프로덕션에서는 에러 로깅 서비스로 전송
  // 예: Sentry, LogRocket, Bugsnag 등
}

// 비동기 에러 처리를 위한 훅
export function useErrorHandler() {
  return (error: Error, context?: string) => {
    reportError(error, context);
    
    // 에러 상태를 전역 상태로 관리하려면 상태 관리 라이브러리 활용
    throw error; // ErrorBoundary가 캐치하도록
  };
}