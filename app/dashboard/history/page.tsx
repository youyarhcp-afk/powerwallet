import { createClient } from '@/lib/supabase/server'
import { History, Trash2, Sun, Battery, Car, Zap } from 'lucide-react'
import type { EnergyLog } from '@/types/supabase'
import { DeleteLogButton } from '@/components/delete-log-button'

export const metadata = {
  title: '履歴 — PowerWallet',
}

const SOURCE_CONFIG = {
  solar:   { label: '太陽光', icon: Sun,     color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  battery: { label: '蓄電池', icon: Battery, color: 'text-green-400',  bg: 'bg-green-500/10'  },
  ev:      { label: 'EV',     icon: Car,     color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  grid:    { label: '電力消費', icon: Zap,   color: 'text-purple-400', bg: 'bg-purple-500/10' },
}

function SourceBadge({ source }: { source: string }) {
  const cfg = SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG] ?? SOURCE_CONFIG.grid
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
        <History className="w-5 h-5 text-zinc-600" />
      </div>
      <p className="text-zinc-500 font-medium">データがありません</p>
      <p className="text-zinc-600 text-sm mt-1">
        「データ入力」ページからエネルギーデータを登録してください
      </p>
    </div>
  )
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Supabase から最新100件を取得
  const { data: logsRaw, error } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', user!.id)
    .order('logged_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)
  const logs = (logsRaw ?? []) as EnergyLog[]

  // 日付でグループ化
  const grouped = logs.reduce<Record<string, EnergyLog[]>>((acc, log) => {
    const date = log.logged_date
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen bg-[#050505] bg-grid">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">履歴</h1>
            <p className="text-zinc-500 text-sm mt-1">
              登録済みのエネルギーデータ（最新{logs.length}件）
            </p>
          </div>
          {logs && logs.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-zinc-600">合計</p>
              <p className="text-lg font-bold text-white tabular-nums">
                {logs.reduce((s, l) => s + Number(l.kwh), 0).toFixed(1)}
                <span className="text-sm text-zinc-500 ml-1">kWh</span>
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-400">
            データの読み込みに失敗しました: {error.message}
          </div>
        )}

        {/* Empty state */}
        {!error && sortedDates.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
            <EmptyState />
          </div>
        )}

        {/* Data grouped by date */}
        {sortedDates.map((date) => {
          const dayLogs = grouped[date]
          const totalKwh = dayLogs.reduce((s, l) => s + Number(l.kwh), 0)

          return (
            <div key={date} className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
              {/* Date header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-800/30">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-sm font-semibold text-white">
                    {new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {dayLogs.length}件 / {totalKwh.toFixed(1)} kWh
                </span>
              </div>

              {/* Logs table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium">電力源</th>
                      <th className="text-right px-4 py-2.5 text-xs text-zinc-500 font-medium">kWh</th>
                      <th className="text-right px-4 py-2.5 text-xs text-zinc-500 font-medium">SOC%</th>
                      <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium hidden sm:table-cell">メモ</th>
                      <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium hidden sm:table-cell">登録日時</th>
                      <th className="px-4 py-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <SourceBadge source={log.source} />
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-mono text-white tabular-nums">
                          {Number(log.kwh).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-zinc-400 tabular-nums">
                          {log.soc != null ? `${log.soc}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500 hidden sm:table-cell max-w-[150px] truncate">
                          {log.notes || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-600 hidden sm:table-cell font-mono">
                          {new Date(log.created_at).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DeleteLogButton logId={log.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
