'use client'

/**
 * PowerWallet — 実績バッジ・レベルシステム
 * データ蓄積量・VPP参加・AI最適化使用回数に基づくゲーミフィケーション
 */

import { useMemo } from 'react'
import { Trophy, Zap, Sun, Battery, TrendingUp, Star, Award, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---- バッジ定義 ----
export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  condition: (stats: UserStats) => boolean
  points: number
}

export interface UserStats {
  totalLogs: number
  totalKwh: number
  solarKwh: number
  batteryKwh: number
  consecutiveDays: number
  optimizeCount: number
  monthIncome: number
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_log',
    title: 'はじめての一歩',
    description: '初めてエネルギーデータを記録',
    icon: Star,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    condition: (s) => s.totalLogs >= 1,
    points: 10,
  },
  {
    id: 'ten_logs',
    title: 'データコレクター',
    description: '10件のデータを記録',
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    condition: (s) => s.totalLogs >= 10,
    points: 25,
  },
  {
    id: 'fifty_logs',
    title: 'エネルギーマスター',
    description: '50件のデータを記録',
    icon: Award,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    condition: (s) => s.totalLogs >= 50,
    points: 100,
  },
  {
    id: 'solar_100kwh',
    title: 'ソーラーパイオニア',
    description: '太陽光発電100kWh達成',
    icon: Sun,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    condition: (s) => s.solarKwh >= 100,
    points: 50,
  },
  {
    id: 'solar_1000kwh',
    title: 'ソーラーキング',
    description: '太陽光発電1,000kWh達成',
    icon: Sun,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    condition: (s) => s.solarKwh >= 1000,
    points: 200,
  },
  {
    id: 'battery_100kwh',
    title: '蓄電池ウォリアー',
    description: '蓄電池充放電100kWh達成',
    icon: Battery,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    condition: (s) => s.batteryKwh >= 100,
    points: 50,
  },
  {
    id: 'first_optimize',
    title: 'AI共闘',
    description: 'AI最適化を初めて実行',
    icon: Zap,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    condition: (s) => s.optimizeCount >= 1,
    points: 30,
  },
  {
    id: 'seven_days',
    title: '7日連続記録',
    description: '7日間連続でデータを記録',
    icon: Trophy,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    condition: (s) => s.consecutiveDays >= 7,
    points: 70,
  },
  {
    id: 'income_1000',
    title: '電力で稼ぐ',
    description: '月収益¥1,000達成',
    icon: TrendingUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    condition: (s) => s.monthIncome >= 1000,
    points: 100,
  },
]

// ---- レベル定義 ----
const LEVELS = [
  { level: 1, name: 'ビギナー',     minPoints: 0,    color: 'text-zinc-400'  },
  { level: 2, name: 'ユーザー',     minPoints: 50,   color: 'text-blue-400'  },
  { level: 3, name: 'エコ戦士',     minPoints: 150,  color: 'text-green-400' },
  { level: 4, name: 'VPP戦士',      minPoints: 300,  color: 'text-yellow-400' },
  { level: 5, name: 'エネルギー王', minPoints: 600,  color: 'text-orange-400' },
]

function getLevel(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i]
  }
  return LEVELS[0]
}

// ---- バッジコンポーネント ----
function BadgeCard({ badge, earned }: { badge: AchievementDef; earned: boolean }) {
  const Icon = badge.icon
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all',
        earned
          ? `${badge.bgColor} ${badge.borderColor}`
          : 'bg-zinc-900/40 border-zinc-800/50 opacity-40 grayscale'
      )}
      title={earned ? `獲得済み (+${badge.points}pt)` : '未獲得'}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        earned ? badge.bgColor : 'bg-zinc-800'
      )}>
        <Icon className={cn('w-4 h-4', earned ? badge.color : 'text-zinc-600')} />
      </div>
      <div className="min-w-0">
        <p className={cn('text-xs font-semibold', earned ? 'text-white' : 'text-zinc-500')}>
          {badge.title}
        </p>
        <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">{badge.description}</p>
        {earned && (
          <p className="text-[10px] text-green-400 mt-0.5">+{badge.points}pt</p>
        )}
      </div>
    </div>
  )
}

// ---- メインコンポーネント ----
interface Props {
  stats: UserStats
}

export function AchievementBadges({ stats }: Props) {
  const earned = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.condition(stats)),
    [stats]
  )

  const totalPoints = earned.reduce((s, a) => s + a.points, 0)
  const currentLevel = getLevel(totalPoints)
  const nextLevel = LEVELS.find((l) => l.minPoints > totalPoints)
  const progress = nextLevel
    ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-semibold text-white">実績・バッジ</h2>
        </div>
        <div className="text-right">
          <p className={cn('text-sm font-bold', currentLevel.color)}>{currentLevel.name}</p>
          <p className="text-xs text-zinc-500">{totalPoints}pt</p>
        </div>
      </div>

      {/* Level progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className={currentLevel.color}>Lv.{currentLevel.level}</span>
          {nextLevel ? (
            <span className="text-zinc-500">
              次のレベルまで {nextLevel.minPoints - totalPoints}pt
            </span>
          ) : (
            <span className="text-yellow-400">MAX</span>
          )}
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earned.some((e) => e.id === badge.id)}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-500">
        <span>{earned.length} / {ACHIEVEMENTS.length} バッジ獲得</span>
        <span className="text-green-400 font-medium">{totalPoints} pt 合計</span>
      </div>
    </div>
  )
}
