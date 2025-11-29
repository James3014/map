/**
 * ErrorBoundary - 錯誤邊界組件
 *
 * Linus Principle: "Never break userspace" - 即使出錯也要給用戶優雅的體驗
 * P2-6: 提升生產環境魯棒性
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 記錄錯誤到監控服務（生產環境）
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 自定義 fallback 或默認錯誤 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="glass-panel rounded-2xl p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              哎呀，出現錯誤了
            </h2>
            <p className="text-gray-400 mb-6">
              地圖載入時發生問題。別擔心，你的數據都還在！
            </p>
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-300">
                  技術細節
                </summary>
                <pre className="mt-2 p-4 bg-gray-900 rounded text-xs text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold"
            >
              重新載入地圖
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
