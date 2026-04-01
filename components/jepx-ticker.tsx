'use client'

/**
 * PowerWallet — JEPXリアルタイム価格ティッカー
 * 現在のJEPXスポット価格 + 48コマ価格帯を表示
 * 30分ごとに自動更新
 */

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JepxData {
  currentPrice: number
  avgPrice: number
  peakPrice: number
  offPeakPrice: number
  trend: 'up' | 'down' | 'flat'
  today: number[]
  tomorrow: number[]
}

function PriceBadge({ price, label, color }: { price: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color}`}>
        ¥{price.toFixed(1)}
        <span className="text-xs font-normal text-zinc-500">/kWh</span>
      </p>
    </div>
  )
}

// ミニバーチャート（24コマ分）
function MiniPriceChart({ prices, height = 40 }: { prices: number[]; height?: number }) {
  if (!prices.length) return null

  const max = Math.max(...prices)
  const min = Math.min(...prices)
  const range = max - min || 1
  const now = new Date()
  const currentSlot = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0)

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {prices.map((p, i) => {
        const h = ((p - min) / range) * 0.75 + 0.25  // 25%〜100%
        const isPast = i < currentSlot
        const isCurrent = i === currentSlot
        return (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-t-sm min-w-[2px] transition-all',
              isCurrent ? 'bg-green-400' : isPast ? 'bg-zinc-700' : 'bg-zinc-600'
            )}
            style={{ height: `${h * 100}%` }}
            title={`${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'} — ¥${p.toFixed(1)}/kWh`}
          />
        )
      })}
    </div>
  )
}

export function JepxTicker() {
  const [data, setData] = useState<JepxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      // /api/optimize からJEPXデータを取得（キャッシュ済み）
      const res = await fetch('/api/jepx', { next: { revalidate: 1800 } } as RequestInit)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
    } catch {
      // サイレントフェイル — 再試行
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // 30分ごとに更新
    const interval = setInterval(fetchData, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  const TrendIcon = data?.trend === 'up'
    ? TrendingUp
    : data?.trend === 'down'
    ? TrendingDown
    : Minus

  const trendColor = data?.trend === 'up'
    ? 'text-red-400'
    : data?.trend === 'down'
    ? 'text-green-400'
    : 'text-zinc-400'

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">JEPX価格</p>
            <p className="text-[10px] text-zinc-500">市場スポット価格</p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData() }}
          disabled={loading}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {loading && !data ? (
        <div className="space-y-2">
          <div className="h-8 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-10 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      ) : data ? (
        <>
          {/* 現在価格 */}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-zinc-500">現在価格</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tabular-nums">
                  ¥{data.currentPrice.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500">/kWh</span>
                <TrendIcon className={cn('w-4 h-4', trendColor)} />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2 border-l border-zinc-800 pl-3">
              <PriceBadge price={data.avgPrice} label="平均" color="text-zinc-300" />
              <PriceBadge price={data.peakPrice} label="ピーク" color="text-red-400" />
              <PriceBadge price={data.offPeakPrice} label="夜間" color="text-blue-400" />
            </div>
          </div>

          {/* 価格チャート */}
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-600">本日の価格推移（48コマ）</p>
            <MiniPriceChart prices={data.today} height={40} />
            <div className="flex justify-between text-[9px] text-zinc-700">
              <span>0:00</span>
              <span>6:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>

          {/* 更新時刻 */}
          {lastUpdate && (
            <p className="text-[9px] text-zinc-700 text-right">
              統計モデル（更新: {lastUpdate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}）
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-zinc-600 text-center py-4">
          価格データを取得できませんでした
        </p>
      )}
    </div>
  )
}
