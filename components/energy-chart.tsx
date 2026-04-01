'use client'

/**
 * PowerWallet — エネルギー履歴グラフ
 * 外部ライブラリ不要のピュアSVG実装
 * 積み上げ棒グラフ（ソース別・日別）+ 折れ線グラフ（累積kWh）
 */

import { useState, useMemo } from 'react'
import { Sun, Battery, Car, Zap, TrendingUp, BarChart2 } from 'lucide-react'

// ---- 型 ----
export interface ChartDataPoint {
  date: string   // 'YYYY-MM-DD'
  solar: number
  battery: number
  ev: number
  grid: number
}

interface Props {
  data: ChartDataPoint[]
  height?: number
}

// ---- カラー定義 ----
const SOURCE_COLORS = {
  solar:   { fill: '#facc15', label: '太陽光',   icon: Sun     },
  battery: { fill: '#22c55e', label: '蓄電池',   icon: Battery },
  ev:      { fill: '#3b82f6', label: 'EV',        icon: Car     },
  grid:    { fill: '#a855f7', label: '電力消費', icon: Zap     },
} as const

type SourceKey = keyof typeof SOURCE_COLORS

// ---- フォーマット ----
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function fmtDateLong(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

export function EnergyChart({ data, height = 220 }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeSource, setActiveSource] = useState<SourceKey | 'all'>('all')

  // データを最新30件に絞り昇順に並べる
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
  }, [data])

  const sources: SourceKey[] = ['solar', 'battery', 'ev', 'grid']

  // 各日の合計・最大値を計算
  const totals = useMemo(() => chartData.map(d => {
    const srcs = activeSource === 'all' ? sources : [activeSource]
    return srcs.reduce((s, k) => s + d[k], 0)
  }), [chartData, activeSource])

  const maxTotal = Math.max(...totals, 0.1)

  // SVGレイアウト
  const paddingTop = 12
  const paddingBottom = 36
  const paddingLeft = 36
  const paddingRight = 8
  const chartWidth = 100   // viewBox上の幅（%単位は使わず後でscale）
  const chartHeight = height - paddingTop - paddingBottom

  // バー幅 / ギャップ
  const n = chartData.length
  const totalSlots = Math.max(n, 1)
  const slotWidth = (chartWidth) / totalSlots   // 各スロット幅（viewBox単位）
  const barWidth = slotWidth * 0.7
  const barGap = slotWidth * 0.15

  // Y軸グリッド（4段階）
  const gridLines = [0, 0.25, 0.5, 0.75, 1.0].map(v => ({
    y: paddingTop + chartHeight * (1 - v),
    label: v === 0 ? '0' : (maxTotal * v).toFixed(1),
  }))

  // 全体のviewBox
  const viewBoxW = paddingLeft + chartWidth + paddingRight
  const viewBoxH = height

  return (
    <div className="space-y-3">
      {/* 凡例 + フィルター */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSource('all')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeSource === 'all'
              ? 'bg-zinc-600 text-white'
              : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'
          }`}
        >
          <BarChart2 className="w-3 h-3" />
          すべて
        </button>
        {sources.map((src) => {
          const cfg = SOURCE_COLORS[src]
          const Icon = cfg.icon
          return (
            <button
              key={src}
              onClick={() => setActiveSource(activeSource === src ? 'all' : src)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeSource === src
                  ? 'text-white'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'
              }`}
              style={activeSource === src ? { backgroundColor: cfg.fill + '30', color: cfg.fill } : {}}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* グラフ本体 */}
      {chartData.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-600 text-sm"
          style={{ height }}
        >
          <div className="text-center">
            <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>データがありません</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl bg-zinc-900/40 border border-zinc-800 overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
            className="w-full"
            style={{ height }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Y軸グリッド線 */}
            {gridLines.map(({ y, label }) => (
              <g key={y}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={viewBoxW - paddingRight}
                  y2={y}
                  stroke="#27272a"
                  strokeWidth="0.4"
                />
                <text
                  x={paddingLeft - 3}
                  y={y + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="4"
                  fill="#52525b"
                >
                  {label}
                </text>
              </g>
            ))}

            {/* バー */}
            {chartData.map((d, i) => {
              const x = paddingLeft + i * slotWidth + barGap
              const isHovered = hoveredIndex === i
              const srcs = activeSource === 'all' ? sources : [activeSource as SourceKey]

              let yOffset = paddingTop + chartHeight  // 下から積み上げ
              return (
                <g key={d.date}>
                  {/* ホバー背景 */}
                  <rect
                    x={paddingLeft + i * slotWidth}
                    y={paddingTop}
                    width={slotWidth}
                    height={chartHeight}
                    fill={isHovered ? 'rgba(255,255,255,0.03)' : 'transparent'}
                    onMouseEnter={() => setHoveredIndex(i)}
                  />
                  {/* 積み上げバー */}
                  {srcs.map((src) => {
                    const val = d[src]
                    if (val <= 0) return null
                    const barH = (val / maxTotal) * chartHeight
                    yOffset -= barH
                    const cfg = SOURCE_COLORS[src]
                    return (
                      <rect
                        key={src}
                        x={x}
                        y={yOffset}
                        width={barWidth}
                        height={barH}
                        fill={cfg.fill}
                        opacity={isHovered ? 1 : 0.8}
                        rx="1"
                      />
                    )
                  })}
                  {/* X軸ラベル（5件おき or 少数の場合は全件） */}
                  {(n <= 10 || i % Math.ceil(n / 8) === 0) && (
                    <text
                      x={paddingLeft + i * slotWidth + slotWidth / 2}
                      y={paddingTop + chartHeight + 10}
                      textAnchor="middle"
                      fontSize="3.5"
                      fill="#52525b"
                    >
                      {fmtDate(d.date)}
                    </text>
                  )}
                </g>
              )
            })}

            {/* 平均ライン */}
            {totals.length > 0 && (() => {
              const avg = totals.reduce((s, v) => s + v, 0) / totals.length
              const avgY = paddingTop + chartHeight * (1 - avg / maxTotal)
              return (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={avgY}
                    x2={viewBoxW - paddingRight}
                    y2={avgY}
                    stroke="#22c55e"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                  <text
                    x={viewBoxW - paddingRight - 1}
                    y={avgY - 2}
                    textAnchor="end"
                    fontSize="3.5"
                    fill="#22c55e"
                    opacity="0.7"
                  >
                    平均 {avg.toFixed(1)}
                  </text>
                </g>
              )
            })()}
          </svg>

          {/* ホバートゥールチップ */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <HoverTooltip
              data={chartData[hoveredIndex]}
              total={totals[hoveredIndex]}
              index={hoveredIndex}
              totalBars={chartData.length}
              sources={activeSource === 'all' ? sources : [activeSource as SourceKey]}
            />
          )}
        </div>
      )}

      {/* 統計サマリー */}
      {chartData.length > 0 && (
        <ChartSummary data={chartData} totals={totals} />
      )}
    </div>
  )
}

// ---- ホバートゥールチップ ----
function HoverTooltip({
  data, total, index, totalBars, sources,
}: {
  data: ChartDataPoint
  total: number
  index: number
  totalBars: number
  sources: SourceKey[]
}) {
  const isRight = index < totalBars / 2

  return (
    <div
      className={`absolute top-2 ${isRight ? 'right-2' : 'left-2'} z-10 pointer-events-none
        bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl min-w-[140px]`}
    >
      <p className="text-xs text-zinc-400 mb-2 font-medium">{fmtDateLong(data.date)}</p>
      <div className="space-y-1.5">
        {sources.map((src) => {
          const v = data[src]
          if (v <= 0) return null
          const cfg = SOURCE_COLORS[src]
          const Icon = cfg.icon
          return (
            <div key={src} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" style={{ color: cfg.fill }} />
                <span className="text-xs text-zinc-400">{cfg.label}</span>
              </div>
              <span className="text-xs font-mono text-white tabular-nums">
                {v.toFixed(1)} kWh
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-700 flex items-center justify-between">
        <span className="text-xs text-zinc-500">合計</span>
        <span className="text-sm font-bold text-white tabular-nums">
          {total.toFixed(1)} kWh
        </span>
      </div>
    </div>
  )
}

// ---- 統計サマリー ----
function ChartSummary({ data, totals }: { data: ChartDataPoint[]; totals: number[] }) {
  const total = totals.reduce((s, v) => s + v, 0)
  const avg = totals.length ? total / totals.length : 0
  const max = Math.max(...totals)
  const maxDay = data[totals.indexOf(max)]

  const solarTotal = data.reduce((s, d) => s + d.solar, 0)
  const batteryTotal = data.reduce((s, d) => s + d.battery, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[
        { label: '総電力量', value: `${total.toFixed(1)} kWh`, sub: `${data.length}日間` },
        { label: '日平均', value: `${avg.toFixed(1)} kWh`, sub: '1日あたり', icon: TrendingUp },
        { label: '太陽光発電', value: `${solarTotal.toFixed(1)} kWh`, sub: `${total > 0 ? ((solarTotal / total) * 100).toFixed(0) : 0}% 再生可能`, color: '#facc15' },
        { label: 'ピーク日', value: `${max.toFixed(1)} kWh`, sub: maxDay ? fmtDate(maxDay.date) : '—', color: '#22c55e' },
      ].map(({ label, value, sub, color, icon: Icon }) => (
        <div key={label} className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2.5">
          <p className="text-xs text-zinc-500 mb-1">{label}</p>
          <p className="text-sm font-bold text-white" style={color ? { color } : {}}>
            {value}
          </p>
          <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1">
            {Icon && <Icon className="w-3 h-3" />}
            {sub}
          </p>
        </div>
      ))}
    </div>
  )
}
