'use client'

import { cn } from '@/lib/utils'
import { Sun, Battery, Car, Zap, TrendingUp, TrendingDown } from 'lucide-react'

export type EnergySource = 'solar' | 'battery' | 'ev' | 'grid'

interface EnergyCardProps {
  source: EnergySource
  value: number
  unit: string
  status: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  soc?: number
}

const SOURCE_CONFIG = {
  solar: {
    icon: Sun,
    label: '太陽光',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    barColor: 'bg-yellow-400',
  },
  battery: {
    icon: Battery,
    label: '蓄電池',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    barColor: 'bg-green-400',
  },
  ev: {
    icon: Car,
    label: 'EV',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    barColor: 'bg-blue-400',
  },
  grid: {
    icon: Zap,
    label: '電力消費',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    barColor: 'bg-purple-400',
  },
}

export function EnergyCard({
  source,
  value,
  unit,
  status,
  trend,
  trendValue,
  soc,
}: EnergyCardProps) {
  const config = SOURCE_CONFIG[source]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        'bg-zinc-900/60 backdrop-blur-sm',
        'hover:bg-zinc-900/80',
        config.borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            config.bgColor,
            config.color
          )}
        >
          {status}
        </span>
      </div>

      {/* Value */}
      <div className="space-y-0.5 mb-3">
        <p className="text-xs text-zinc-500 font-medium">{config.label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white tabular-nums">
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-zinc-400">{unit}</span>
        </div>
      </div>

      {/* SOC Bar */}
      {soc !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>SOC</span>
            <span className={config.color}>{soc}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                config.barColor
              )}
              style={{ width: `${soc}%` }}
            />
          </div>
        </div>
      )}

      {/* Trend */}
      {trend && trendValue && (
        <div className="flex items-center gap-1.5">
          {trend === 'up' ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span
            className={cn(
              'text-xs',
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  )
}
