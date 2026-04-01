/**
 * PowerWallet — ローディングスケルトンコンポーネント
 * ページ読み込み中のちらつきを防ぎ、知覚速度を向上させる
 */

import React from 'react'
import { cn } from '@/lib/utils'

// ---- ベーススケルトン ----
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-zinc-800/60',
        className
      )}
      style={style}
    />
  )
}

// ---- KPIカードスケルトン ----
export function KpiCardSkeleton() {
  return (
    <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-24" />
    </div>
  )
}

// ---- エネルギーカードスケルトン ----
export function EnergyCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// ---- テーブル行スケルトン ----
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-zinc-800/40">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[100px]" />
        </td>
      ))}
    </tr>
  )
}

// ---- 最適化ボタン領域スケルトン ----
export function OptimizeSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- チャートスケルトン ----
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-end gap-1.5 justify-between px-2" style={{ height }}>
        {[70, 45, 85, 60, 95, 50, 75, 40, 88, 65, 92, 55].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between px-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-8" />
        ))}
      </div>
    </div>
  )
}

// ---- ダッシュボード全体スケルトン ----
export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-8">
      {/* KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
      </div>
      {/* エネルギーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <EnergyCardSkeleton key={i} />)}
      </div>
      {/* AI + logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <OptimizeSkeleton />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    </div>
  )
}
