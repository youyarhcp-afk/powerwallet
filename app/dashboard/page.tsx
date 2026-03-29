import { createClient } from '@/lib/supabase/server'
import { EnergyCard } from '@/components/energy-card'
import { OptimizeButton } from '@/components/optimize-button'
import { RealtimeLogs } from '@/components/realtime-logs'
import type { EnergyLog } from '@/types/supabase'
import {
  Zap,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react'
import Link from 'next/link'

// ---- Mock energy sensor data (Phase 2 でHEMS連携) ----
const ENERGY_DATA = {
  solar:   { value: 12.4, unit: 'kWh', status: '発電中',  trend: 'up'      as const, trendValue: '前日比 +2.1kWh' },
  battery: { value: 8.6,  unit: 'kWh', status: '充電中',  soc: 72, trend: 'up'   as const, trendValue: '充電継続中' },
  ev:      { value: 32.0, unit: 'kWh', status: '接続済み', soc: 45, trend: 'down' as const, trendValue: '前回比 -5kWh' },
  grid:    { value: 8.2,  unit: 'kWh', status: '消費中',  trend: 'down'    as const, trendValue: '前日比 -1.3kWh' },
}

const RECENT_ACTIVITY = [
  { time: '14:32', event: '蓄電池 → 充電完了', amount: '+3.2 kWh',  color: 'text-green-400' },
  { time: '12:10', event: '太陽光 → ピーク発電', amount: '+4.8 kWh', color: 'text-yellow-400' },
  { time: '09:15', event: 'EV → 充電開始',       amount: '-8.0 kWh', color: 'text-blue-400'  },
  { time: '07:00', event: 'VPP → 調整力提供',    amount: '+¥183',    color: 'text-purple-400' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 最近の登録データ（最新5件）
  const { data: recentLogsRaw } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', user!.id)
    .order('logged_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)
  const recentLogs = (recentLogsRaw ?? []) as EnergyLog[]

  // 今月の合計
  const thisMonth = new Date().toISOString().slice(0, 7) // "2026-03"
  const { data: monthLogsRaw } = await supabase
    .from('energy_logs')
    .select('kwh, source')
    .eq('user_id', user!.id)
    .gte('logged_date', `${thisMonth}-01`)
  const monthLogs = (monthLogsRaw ?? []) as Pick<EnergyLog, 'kwh' | 'source'>[]

  const monthTotalKwh = monthLogs.reduce((s, l) => s + Number(l.kwh), 0)

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  return (
    <div className="min-h-screen bg-[#050505] bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-8">

        {/* ---- Welcome + KPI ---- */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">おはようございます 👋</h1>
            <p className="text-zinc-500 text-sm mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {today}
            </p>
          </div>
          <div className="flex items-stretch gap-3 flex-wrap">
            <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">本日の収入</p>
              <p className="text-xl font-bold text-green-400 tabular-nums">+¥423</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">最適化スコア</p>
              <p className="text-xl font-bold text-white tabular-nums">
                87<span className="text-sm text-zinc-500">/100</span>
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">今月累計</p>
              <p className="text-xl font-bold text-blue-400 tabular-nums">¥8,240</p>
            </div>
          </div>
        </section>

        {/* ---- Energy Cards ---- */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              エネルギー状態
            </h2>
            <span className="text-xs text-zinc-600 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              リアルタイム（モック）
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <EnergyCard source="solar"   {...ENERGY_DATA.solar}   />
            <EnergyCard source="battery" {...ENERGY_DATA.battery} />
            <EnergyCard source="ev"      {...ENERGY_DATA.ev}      />
            <EnergyCard source="grid"    {...ENERGY_DATA.grid}    />
          </div>
        </section>

        {/* ---- AI + Recent logs ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* AI Optimization */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <span className="text-base">🤖</span>
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm">AI最適化エンジン</h2>
                <p className="text-xs text-zinc-500">リアルタイム収益最大化</p>
              </div>
            </div>
            <OptimizeButton />
          </div>

          {/* Recent logged data — Supabase Realtime */}
          <RealtimeLogs
            initialLogs={recentLogs ?? []}
            initialMonthKwh={monthTotalKwh}
          />
        </div>

        {/* ---- VPP Preview ---- */}
        <div className="rounded-xl border border-zinc-800/60 bg-gradient-to-r from-green-500/5 to-blue-500/5 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  2026年4月 低圧VPP解禁まであと少し
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  EREB市場予測: 月間平均 ¥1,240 / 家庭 · VPP参加で調整力収入を獲得
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/simulate"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-black text-xs font-bold hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              収入シミュレーター
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-900 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-700">
          <span>PowerWallet Beta v0.2.0 — © 2026</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-green-500/50" />
            2026年4月 低圧VPP解禁対応済み
          </span>
        </footer>
      </div>
    </div>
  )
}
