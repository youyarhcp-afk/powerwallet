'use client'

/**
 * PowerWallet — エラーバウンダリー
 * Reactのエラーを捕捉してユーザーフレンドリーな画面を表示
 * + グローバルエラーハンドラー
 */

import { Component, type ReactNode, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: error.message }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // エラーログを記録（Phase 2でSentryに送信）
    console.error('[ErrorBoundary] Caught error:', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">
            予期しないエラーが発生しました
          </h2>
          <p className="text-sm text-zinc-500 mb-1 max-w-xs">
            申し訳ありません。このコンポーネントの読み込みに失敗しました。
          </p>
          <p className="text-xs text-zinc-700 font-mono mb-6 max-w-sm truncate">
            {this.state.errorInfo}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              再試行
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-black text-sm font-medium hover:bg-green-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              ダッシュボードへ
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---- グローバルエラーハンドラー（未キャッチのPromiseエラーを捕捉） ----
export function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GlobalError] Unhandled Promise rejection:', event.reason)
      // Phase 2: Sentryに送信
    }

    const handleError = (event: ErrorEvent) => {
      console.error('[GlobalError] Uncaught error:', event.error)
      // Phase 2: Sentryに送信
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}
