'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, ArrowUpRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { EnergyLog } from '@/types/supabase'

interface RealtimeLogsProps {
  initialLogs: EnergyLog[]
  initialMonthKwh: number
}

const SOURCE_EMOJI: Record<string, string> = {
  solar: '☀️',
  battery: '🔋',
  ev: '🚗',
  grid: '⚡',
}

export function RealtimeLogs({ initialLogs, initialMonthKwh }: RealtimeLogsProps) {
  const [logs, setLogs] = useState<EnergyLog[]>(initialLogs)
  const [monthKwh, setMonthKwh] = useState(initialMonthKwh)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // energy_logsテーブルへのリアルタイム購読
    const channel = supabase
      .channel('realtime:energy_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'energy_logs' },
        async () => {
          // 変更を検知したら最新データを再取得
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          const { data: newLogsRaw } = await supabase
            .from('energy_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('logged_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(5)

          const thisMonth = new Date().toISOString().slice(0, 7)
          const { data: monthLogsRaw } = await supabase
            .from('energy_logs')
            .select('kwh')
            .eq('user_id', user.id)
            .gte('logged_date', `${thisMonth}-01`)

          if (newLogsRaw) {
            setLogs(newLogsRaw as EnergyLog[])
            setFlash(true)
            setTimeout(() => setFlash(false), 600)
          }
          if (monthLogsRaw) {
            setMonthKwh((monthLogsRaw as { kwh: number }[]).reduce((s, l) => s + Number(l.kwh), 0))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-700/60 border border-zinc-700 flex items-center justify-center">
            <Activity className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">最近の記録データ</h2>
            <p className="text-xs text-zinc-500">
              今月合計: <span className="text-zinc-300 font-mono">{monthKwh.toFixed(1)} kWh</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Realtimeインジケーター */}
          <span className="flex items-center gap-1 text-xs text-green-500/70">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
          <Link
            href="/dashboard/history"
            className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-0.5"
          >
            全件 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {logs.length > 0 ? (
        <div
          className="space-y-0.5 transition-all duration-300"
          style={{ opacity: flash ? 0.6 : 1 }}
        >
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{SOURCE_EMOJI[log.source] ?? '⚡'}</span>
                <div>
                  <p className="text-xs text-zinc-300">{log.logged_date}</p>
                  {log.notes && <p className="text-xs text-zinc-600">{log.notes}</p>}
                </div>
              </div>
              <span className="text-sm font-bold text-white tabular-nums">
                {Number(log.kwh).toFixed(1)} kWh
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-zinc-600 text-sm">データがありません</p>
          <Link
            href="/dashboard/input"
            className="inline-flex items-center gap-1.5 mt-2 text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowUpRight className="w-3 h-3" />
            データを入力する
          </Link>
        </div>
      )}
    </div>
  )
}
