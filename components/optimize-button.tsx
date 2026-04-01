'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  TrendingUp,
  RotateCcw,
  Zap,
  X,
  Clock,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Leaf,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OptimizationAction } from '@/lib/services/optimizer'

// ---- 型定義 ----
type OptimizeState = 'idle' | 'loading' | 'result' | 'error'

interface ApiResponse {
  success: boolean
  result: {
    primary: OptimizationAction
    alternatives: OptimizationAction[]
    meta: {
      jepxSource: string
      weatherSource: string
      analyzedAt: string
      modelVersion: string
    }
  }
  market: {
    currentPrice: number
    avgPrice: number
    peakPrice: number
    trend: 'rising' | 'falling' | 'stable'
  }
  weather: {
    todayKwh: number
    tomorrowKwh: number
    summary: string
  }
}

const urgencyConfig = {
  high:   { label: '要対応', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
  medium: { label: '推奨',   color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  low:    { label: '参考',   color: 'text-zinc-400',   bg: 'bg-zinc-700/30',   border: 'border-zinc-700'      },
}

const trendLabel = {
  rising:  { label: '上昇中↑', color: 'text-red-400'    },
  falling: { label: '下降中↓', color: 'text-blue-400'   },
  stable:  { label: '安定 →',  color: 'text-zinc-400'   },
}

const ANALYSIS_STEPS = [
  'JEPX市場データを取得中...',
  '天気・日射量予測を分析中...',
  'エネルギー状態を確認中...',
  '最適化アルゴリズムを実行中...',
  '収益シミュレーションを計算中...',
]

interface OptimizeButtonProps {
  compact?: boolean
  /** SOCデータをリアルタイムで渡せる場合に使用 */
  batterySoc?: number
  batteryCapacity?: number
  evSoc?: number | null
  evCapacity?: number
  solarCapacity?: number
}

export function OptimizeButton({
  compact = false,
  batterySoc,
  batteryCapacity,
  evSoc,
  evCapacity,
  solarCapacity,
}: OptimizeButtonProps) {
  const [state, setState] = useState<OptimizeState>('idle')
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)

  // ESC キーでモーダルを閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleOptimize = async () => {
    setState('loading')
    setStep(0)
    setErrorMsg('')

    // ステップアニメーション（API呼び出し中に表示）
    const stepInterval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, ANALYSIS_STEPS.length - 1))
    }, 500)

    try {
      const body: Record<string, unknown> = {}
      if (batterySoc !== undefined)  body.batterySoc = batterySoc
      if (batteryCapacity !== undefined) body.batteryCapacity = batteryCapacity
      if (evSoc !== undefined)       body.evSoc = evSoc
      if (evCapacity !== undefined)  body.evCapacity = evCapacity
      if (solarCapacity !== undefined) body.solarCapacity = solarCapacity

      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `APIエラー ${res.status}`)
      }

      const data: ApiResponse = await res.json()
      clearInterval(stepInterval)
      setStep(ANALYSIS_STEPS.length - 1)

      await new Promise((r) => setTimeout(r, 200))
      setResponse(data)
      setState('result')
      setModalOpen(true)
    } catch (err) {
      clearInterval(stepInterval)
      setErrorMsg(err instanceof Error ? err.message : '不明なエラー')
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setResponse(null)
    setErrorMsg('')
    setModalOpen(false)
    setShowAlternatives(false)
  }

  const result = response?.result.primary
  const urg = result ? urgencyConfig[result.urgency] : null

  return (
    <>
      {/* ---- トリガー領域 ---- */}
      <div className="space-y-3">

        {/* アイドル or エラー → ボタン表示 */}
        {(state === 'idle' || state === 'error') && (
          <button
            onClick={handleOptimize}
            className={cn(
              'w-full flex items-center justify-center gap-2.5 rounded-xl font-semibold text-sm',
              'bg-green-500 text-black hover:bg-green-400',
              'shadow-lg shadow-green-500/20 hover:shadow-green-500/35',
              'transition-all duration-200',
              compact ? 'py-2.5 px-4' : 'py-3.5 px-6'
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI最適化を実行する
          </button>
        )}

        {/* エラー表示 */}
        {state === 'error' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <WifiOff className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">{errorMsg || '接続に失敗しました。再試行してください。'}</p>
          </div>
        )}

        {/* ロード中 → ステップ表示 */}
        {state === 'loading' && (
          <>
            <button
              disabled
              className={cn(
                'w-full flex items-center justify-center gap-2.5 rounded-xl font-semibold text-sm',
                'bg-green-500/70 text-black',
                'shadow-lg shadow-green-500/10',
                compact ? 'py-2.5 px-4' : 'py-3.5 px-6',
                'cursor-not-allowed'
              )}
            >
              <Sparkles className="w-4 h-4 animate-spin" />
              {ANALYSIS_STEPS[step]}
            </button>
            <div className="space-y-1.5 px-1">
              {ANALYSIS_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300',
                      i < step  ? 'bg-green-400'
                      : i === step ? 'bg-green-400 animate-pulse'
                      : 'bg-zinc-700'
                    )}
                  />
                  <span className={cn(
                    'text-xs transition-colors duration-300',
                    i === step ? 'text-green-400'
                    : i < step  ? 'text-zinc-500'
                    : 'text-zinc-700'
                  )}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 結果サマリーカード */}
        {state === 'result' && result && (
          <div className="rounded-xl border p-4 space-y-3 bg-green-500/5 border-green-500/25">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-green-400 leading-tight">
                {result.headline}
              </p>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 border',
                urg?.bg, urg?.border, urg?.color
              )}>
                {urg?.label}
              </span>
            </div>
            {/* マーケット情報バー */}
            {response?.market && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-500">
                  現在価格: <span className="text-white font-medium tabular-nums">¥{response.market.currentPrice}/kWh</span>
                </span>
                <span className={trendLabel[response.market.trend].color}>
                  {trendLabel[response.market.trend].label}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.timeWindow}
              </span>
              <span className="flex items-center gap-1">
                <BarChart2 className="w-3 h-3" />
                信頼度 {result.confidence}%
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 py-2 rounded-lg bg-green-500 text-black text-xs font-semibold hover:bg-green-400 transition-colors"
              >
                詳細を見る
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================
          モーダル — 詳細な最適化提案
          ================================================================ */}
      {modalOpen && result && response && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#0e0e0e] shadow-2xl shadow-black/60">

            {/* ヘッダー */}
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-zinc-800 bg-[#0e0e0e]/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">{result.label}</h2>
                  <p className="text-xs text-zinc-500">
                    AI最適化エンジン {response.result.meta.modelVersion} •{' '}
                    {new Date(response.result.meta.analyzedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}時点
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ボディ */}
            <div className="p-5 space-y-5">

              {/* マーケット情報バー */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '現在価格', value: `¥${response.market.currentPrice}/kWh`, color: 'text-white' },
                  { label: '日平均', value: `¥${response.market.avgPrice}/kWh`, color: 'text-zinc-400' },
                  { label: 'トレンド', value: trendLabel[response.market.trend].label, color: trendLabel[response.market.trend].color },
                ].map((item) => (
                  <div key={item.label} className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-center">
                    <p className="text-[10px] text-zinc-500 mb-0.5">{item.label}</p>
                    <p className={cn('text-xs font-bold', item.color)}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* 緊急度 + 時間窓 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                  urg?.bg, urg?.border, urg?.color
                )}>
                  {result.urgency === 'high'
                    ? <AlertTriangle className="w-3 h-3" />
                    : <CheckCircle className="w-3 h-3" />}
                  {urg?.label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <Clock className="w-3 h-3" />
                  {result.timeWindow}
                </span>
              </div>

              {/* 予想収入 + 信頼度 */}
              <div className="p-4 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">予想収入（本日）</p>
                  <p className="text-3xl font-bold text-green-400 tabular-nums">
                    +¥{result.estimatedIncome.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 mb-0.5">AI信頼度</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-700"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {result.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 分析理由 */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  分析理由
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{result.reason}</p>
              </div>

              {/* 市場状況 */}
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/60">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  市場状況
                </h3>
                <div className="space-y-1">
                  {result.marketContext.split('\n').map((line, i) => (
                    <p key={i} className="text-xs text-zinc-400 leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>

              {/* 天気 */}
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  🌤 太陽光発電予測
                </h3>
                <p className="text-xs text-zinc-400">{response.weather.summary}</p>
              </div>

              {/* 収益内訳 */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  収益内訳
                </h3>
                <div className="space-y-2.5">
                  {result.breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', item.color.replace('text-', 'bg-'))} />
                        <span className="text-xs text-zinc-400">{item.label}</span>
                      </div>
                      <span className={cn('text-sm font-bold tabular-nums', item.color)}>
                        {item.amount >= 0 ? '+' : ''}¥{Math.abs(item.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-2 flex justify-between">
                    <span className="text-xs text-zinc-300 font-medium">合計（予想）</span>
                    <span className="text-sm font-bold text-green-400 tabular-nums">
                      +¥{result.estimatedIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* CO₂削減 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-zinc-400">
                  この最適化により{' '}
                  <span className="text-emerald-400 font-semibold">約{result.co2Benefit}kg</span>{' '}
                  のCO₂削減が見込まれます
                </p>
              </div>

              {/* 代替アクション */}
              {response.result.alternatives.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showAlternatives ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    代替シナリオ（{response.result.alternatives.length}件）
                  </button>
                  {showAlternatives && (
                    <div className="mt-2 space-y-2">
                      {response.result.alternatives.map((alt, i) => (
                        <div key={i} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-medium text-zinc-300">{alt.label}</span>
                            <span className="text-xs text-zinc-500 tabular-nums">¥{alt.estimatedIncome.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">{alt.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    // Phase 2: 実際の制御コマンドを実行
                    // 現在は保存済みコマンドを実行済みとしてマーク
                    setModalOpen(false)
                    setState('idle')
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl',
                    'bg-green-500 text-black font-bold text-sm',
                    'hover:bg-green-400 transition-colors',
                    'shadow-lg shadow-green-500/20'
                  )}
                >
                  <Zap className="w-4 h-4" />
                  実行する（+¥{result.estimatedIncome.toLocaleString()}獲得）
                </button>
                <button
                  onClick={handleReset}
                  className={cn(
                    'px-4 py-3 rounded-xl border border-zinc-700',
                    'text-zinc-400 text-sm hover:text-white hover:bg-zinc-800',
                    'transition-colors'
                  )}
                >
                  後で
                </button>
              </div>

              {/* データソース */}
              <div className="flex items-center justify-between text-xs text-zinc-700 pt-1 border-t border-zinc-900">
                <span>
                  JEPX: {response.result.meta.jepxSource} / 天気: {response.result.meta.weatherSource}
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Phase 1: シミュレーション値
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
