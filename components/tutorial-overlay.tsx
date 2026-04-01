'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronRight, ChevronLeft, Zap, LayoutDashboard, DatabaseZap, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TutorialStep {
  title: string
  description: string
  icon: React.ReactNode
  highlight?: string // 何を指しているかの補足
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'PowerWalletへようこそ！',
    description:
      'PowerWalletは、家庭の太陽光パネル・蓄電池・EVのエネルギーをAIで最適化し、収益を最大化するプラットフォームです。簡単な4ステップでアプリの使い方をご案内します。',
    icon: <Zap className="w-5 h-5 text-green-400" />,
    highlight: 'アプリ全体',
  },
  {
    title: 'ダッシュボードで全体を把握',
    description:
      '太陽光発電量、蓄電池の充電状態、EVの接続状況、電力消費量を一目で確認できます。KPIカード（本日の収入・最適化スコア・今月累計）でパフォーマンスも把握できます。',
    icon: <LayoutDashboard className="w-5 h-5 text-green-400" />,
    highlight: 'エネルギー状態カード＆KPI',
  },
  {
    title: 'データを入力して分析精度UP',
    description:
      '「データ入力」ページから、発電量や蓄電池のSOC（充電状態）を手動で入力するか、CSVファイルで一括登録できます。データが多いほどAI提案の精度が上がります。',
    icon: <DatabaseZap className="w-5 h-5 text-purple-400" />,
    highlight: 'サイドバー → データ入力',
  },
  {
    title: 'AI最適化 & VPPシミュレーター',
    description:
      '「AI最適化エンジン」ボタンで充放電の最適タイミングを提案。「シミュレーター」ページでは2026年4月の低圧VPP解禁後の収入を試算できます。各セクションの「?」マークで詳しい説明を確認できます。',
    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
    highlight: 'AI最適化 & シミュレーター',
  },
]

const STORAGE_KEY = 'powerwallet_tutorial_seen'

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // ローカルストレージでチュートリアル表示済みかチェック
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        // 少し遅延させてダッシュボード描画後に表示
        const timer = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage が使えない場合はスキップ
    }
  }, [])

  const close = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      setExiting(false)
      try {
        window.localStorage.setItem(STORAGE_KEY, 'true')
      } catch {
        // ignore
      }
    }, 200)
  }, [])

  const next = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      close()
    }
  }

  const prev = () => {
    if (step > 0) setStep(step - 1)
  }

  if (!visible) return null

  const current = TUTORIAL_STEPS[step]
  const isLast = step === TUTORIAL_STEPS.length - 1

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-black/70 backdrop-blur-sm',
        exiting ? 'animate-out fade-out-0 duration-200' : 'animate-in fade-in-0 duration-300'
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-md',
          'bg-zinc-900 border border-zinc-700 rounded-2xl',
          'shadow-2xl shadow-green-500/5',
          'overflow-hidden',
          exiting ? 'animate-out zoom-out-95 duration-200' : 'animate-in zoom-in-95 duration-300'
        )}
      >
        {/* Green gradient top bar */}
        <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-blue-500" />

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="px-6 pt-6 pb-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === step
                    ? 'w-8 bg-green-400'
                    : i < step
                      ? 'w-4 bg-green-500/40'
                      : 'w-4 bg-zinc-700'
                )}
              />
            ))}
            <span className="ml-auto text-xs text-zinc-600">
              {step + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              {current.icon}
            </div>
            <h2 className="text-base font-bold text-white leading-snug">{current.title}</h2>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed mb-1">
            {current.description}
          </p>

          {/* Highlight badge */}
          {current.highlight && (
            <span className="inline-block text-xs text-green-400/80 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5 mt-2">
              📍 {current.highlight}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={close}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            スキップ
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                戻る
              </button>
            )}
            <button
              onClick={next}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors',
                isLast
                  ? 'bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
              )}
            >
              {isLast ? '始めましょう！' : '次へ'}
              {!isLast && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * チュートリアルを再表示するボタン（サイドバーや設定画面に配置可能）
 */
export function TutorialResetButton() {
  const handleReset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-green-400 hover:bg-green-500/5 transition-colors"
    >
      <Sparkles className="w-3.5 h-3.5" />
      チュートリアルを再表示
    </button>
  )
}
