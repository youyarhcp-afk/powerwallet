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
} from 'lucide-react'
import { cn } from '@/lib/utils'

type OptimizeState = 'idle' | 'loading' | 'result'

interface IncomeBreakdown {
  label: string
  amount: number
  color: string
}

interface OptimizationResult {
  action: 'sell' | 'vpp' | 'store' | 'hold'
  label: string
  headline: string
  reason: string
  marketContext: string
  estimatedIncome: number
  breakdown: IncomeBreakdown[]
  confidence: number
  urgency: 'high' | 'medium' | 'low'
  timeWindow: string
  co2Benefit: number
}

const MOCK_RESULTS: OptimizationResult[] = [
  {
    action: 'sell',
    label: '今すぐ売電推奨',
    headline: '売電推奨 ⚡  予想収入 +¥180 / 今日',
    reason:
      'JEPX市場のスポット価格が現在¥24.5/kWhと高値圏です。蓄電池残量72%から25%まで約4.7kWhを放電売電すると最大収益が見込めます。',
    marketContext:
      '市場参考単価: ¥24.5/kWh（通常の1.8倍）\n天気予報: 明日も晴れ → 明日は太陽光で再充電可能',
    estimatedIncome: 180,
    breakdown: [
      { label: '売電収入（4.7kWh × ¥24.5）', amount: 115, color: 'text-yellow-400' },
      { label: 'VPP調整力インセンティブ', amount: 42, color: 'text-green-400' },
      { label: '余剰売電（太陽光）', amount: 23, color: 'text-orange-400' },
    ],
    confidence: 87,
    urgency: 'high',
    timeWindow: '今後2時間が最適',
    co2Benefit: 2.1,
  },
  {
    action: 'vpp',
    label: 'VPP市場参加推奨',
    headline: '調整力市場参加推奨 🔋  予想収入 +¥312 / 今日',
    reason:
      '17:00〜20:00のピーク時間帯に需要応答（DR）へ参加すると調整力収入が見込めます。蓄電池4kWh＋EV10kWhで計14kWhの放電余力があり、十分な参加条件を満たしています。',
    marketContext:
      '調整力単価: ¥8.2/kWh（今月平均+12%）\n参加可能時間帯: 17:00〜20:00（残り4時間22分）',
    estimatedIncome: 312,
    breakdown: [
      { label: '調整力収入（蓄電池）', amount: 178, color: 'text-green-400' },
      { label: '調整力収入（EV V2G）', amount: 98, color: 'text-blue-400' },
      { label: 'DR参加インセンティブ', amount: 36, color: 'text-purple-400' },
    ],
    confidence: 92,
    urgency: 'high',
    timeWindow: '17:00〜20:00に参加',
    co2Benefit: 5.8,
  },
  {
    action: 'store',
    label: '充電・蓄電推奨',
    headline: '今夜充電を推奨 ☀️  明日の収益最大化',
    reason:
      '天気予報によると明日は快晴（発電量予測13.2kWh）。今夜オフピーク時間帯（23:00〜7:00）に安値電力を購入して蓄電し、明日の高値時間帯に放電すると収益効率が向上します。',
    marketContext:
      'オフピーク単価: ¥9.2/kWh（22:00〜翌8:00）\n明日ピーク予測: ¥22-26/kWh（差額¥12〜17/kWh）',
    estimatedIncome: 120,
    breakdown: [
      { label: '明日の売電収入（予測）', amount: 78, color: 'text-yellow-400' },
      { label: '電力コスト差益', amount: 42, color: 'text-green-400' },
    ],
    confidence: 75,
    urgency: 'medium',
    timeWindow: '23:00〜翌7:00に充電',
    co2Benefit: 1.4,
  },
  {
    action: 'hold',
    label: '現状維持推奨',
    headline: '現状維持が最適 ⏸️  市場待機モード',
    reason:
      '市場価格は現在安定しており（¥13.2/kWh）、大きな最適化余地がありません。蓄電池SOC72%を維持し、17時以降の価格上昇タイミングを待つことを推奨します。',
    marketContext:
      '現在価格: ¥13.2/kWh（通常水準）\n次のピーク予測: 本日17:30〜（3時間後）',
    estimatedIncome: 45,
    breakdown: [
      { label: '余剰太陽光（現状）', amount: 28, color: 'text-yellow-400' },
      { label: 'ベースライン収入', amount: 17, color: 'text-zinc-400' },
    ],
    confidence: 68,
    urgency: 'low',
    timeWindow: '17:30以降に再最適化',
    co2Benefit: 0.6,
  },
]

const urgencyConfig = {
  high: { label: '要対応', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  medium: { label: '推奨', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  low: { label: '参考', color: 'text-zinc-400', bg: 'bg-zinc-700/30', border: 'border-zinc-700' },
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
}

export function OptimizeButton({ compact = false }: OptimizeButtonProps) {
  const [state, setState] = useState<OptimizeState>('idle')
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [step, setStep] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

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

    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 400))
      setStep(i)
    }

    await new Promise((r) => setTimeout(r, 300))
    const randomResult =
      MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
    setResult(randomResult)
    setState('result')
    setModalOpen(true)
  }

  const handleReset = () => {
    setState('idle')
    setResult(null)
    setModalOpen(false)
  }

  const urg = result ? urgencyConfig[result.urgency] : null

  return (
    <>
      {/* ---- Trigger button area ---- */}
      <div className="space-y-3">
        {state !== 'result' && (
          <button
            onClick={handleOptimize}
            disabled={state === 'loading'}
            className={cn(
              'w-full flex items-center justify-center gap-2.5 rounded-xl font-semibold text-sm',
              'bg-green-500 text-black hover:bg-green-400',
              'shadow-lg shadow-green-500/20 hover:shadow-green-500/35',
              'transition-all duration-200',
              'disabled:opacity-75 disabled:cursor-not-allowed',
              compact ? 'py-2.5 px-4' : 'py-3.5 px-6'
            )}
          >
            <Sparkles
              className={cn('w-4 h-4', state === 'loading' && 'animate-spin')}
            />
            {state === 'loading' ? ANALYSIS_STEPS[step] : 'AI最適化を実行する'}
          </button>
        )}

        {/* Loading steps */}
        {state === 'loading' && (
          <div className="space-y-1.5 px-1">
            {ANALYSIS_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300',
                    i < step
                      ? 'bg-green-400'
                      : i === step
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-zinc-700'
                  )}
                />
                <span
                  className={cn(
                    'text-xs transition-colors duration-300',
                    i === step
                      ? 'text-green-400'
                      : i < step
                      ? 'text-zinc-500'
                      : 'text-zinc-700'
                  )}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Result summary card (after analysis) */}
        {state === 'result' && result && (
          <div
            className={cn(
              'rounded-xl border p-4 space-y-3',
              'bg-green-500/5 border-green-500/25'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-green-400 leading-tight">
                {result.headline}
              </p>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                  urg?.bg,
                  urg?.border,
                  'border',
                  urg?.color
                )}
              >
                {urg?.label}
              </span>
            </div>

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

      {/* ============================================================
          MODAL — 詳細な最適化提案
          ============================================================ */}
      {modalOpen && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#0e0e0e] shadow-2xl shadow-black/60">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-zinc-800 bg-[#0e0e0e]/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">{result.label}</h2>
                  <p className="text-xs text-zinc-500">AI最適化エンジン v0.1</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Urgency + time window */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                    urg?.bg,
                    urg?.border,
                    urg?.color
                  )}
                >
                  {result.urgency === 'high' && (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {result.urgency !== 'high' && <CheckCircle className="w-3 h-3" />}
                  {urg?.label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <Clock className="w-3 h-3" />
                  {result.timeWindow}
                </span>
              </div>

              {/* Headline income */}
              <div className="p-4 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">予想収入（本日）</p>
                  <p className="text-3xl font-bold text-green-400 tabular-nums">
                    +¥{result.estimatedIncome}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 mb-0.5">AI信頼度</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {result.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis reason */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  分析理由
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {result.reason}
                </p>
              </div>

              {/* Market context */}
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/60">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  市場状況
                </h3>
                <div className="space-y-1">
                  {result.marketContext.split('\n').map((line, i) => (
                    <p key={i} className="text-xs text-zinc-400 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Income breakdown */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  収益内訳
                </h3>
                <div className="space-y-2.5">
                  {result.breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full', item.color.replace('text-', 'bg-'))} />
                        <span className="text-xs text-zinc-400">{item.label}</span>
                      </div>
                      <span className={cn('text-sm font-bold tabular-nums', item.color)}>
                        ¥{item.amount}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-2 flex justify-between">
                    <span className="text-xs text-zinc-300 font-medium">合計（予想）</span>
                    <span className="text-sm font-bold text-green-400 tabular-nums">
                      ¥{result.estimatedIncome}
                    </span>
                  </div>
                </div>
              </div>

              {/* CO2 benefit */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-zinc-400">
                  この最適化により{' '}
                  <span className="text-emerald-400 font-semibold">
                    約{result.co2Benefit}kg
                  </span>{' '}
                  のCO₂削減が見込まれます
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setModalOpen(false)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl',
                    'bg-green-500 text-black font-bold text-sm',
                    'hover:bg-green-400 transition-colors',
                    'shadow-lg shadow-green-500/20'
                  )}
                >
                  <Zap className="w-4 h-4" />
                  実行する（¥{result.estimatedIncome}獲得）
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

              <p className="text-xs text-zinc-700 text-center pb-1">
                ※ Phase 1では実際の市場接続は行いません。収益はシミュレーション値です。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
