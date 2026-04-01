import { createClient } from '@/lib/supabase/server'
import { EnergyCard } from '@/components/energy-card'
import { OptimizeButton } from '@/components/optimize-button'
import { RealtimeLogs } from '@/components/realtime-logs'
import { TooltipHelp } from '@/components/tooltip-help'
import { JepxTicker } from '@/components/jepx-ticker'
import { AchievementBadges } from '@/components/achievement-badges'
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

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const thisMonth = now.toISOString().slice(0, 7) // "2026-03"

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
  const { data: monthLogsRaw } = await supabase
    .from('energy_logs')
    .select('kwh, source')
    .eq('user_id', user!.id)
    .gte('logged_date', `${thisMonth}-01`)
  const monthLogs = (monthLogsRaw ?? []) as Pick<EnergyLog, 'kwh' | 'source'>[]

  const monthTotalKwh = monthLogs.reduce((s, l) => s + Number(l.kwh), 0)

  // 今日のデータ
  const { data: todayLogsRaw } = await supabase
    .from('energy_logs')
    .select('kwh, source, soc')
    .eq('user_id', user!.id)
    .eq('logged_date', todayStr)
  const todayLogs = (todayLogsRaw ?? []) as Pick<EnergyLog, 'kwh' | 'source' | 'soc'>[]

  // 実データからKPIを計算
  // ---- 本日の収入推定（太陽光売電 × 平均価格 + 蓄電池放電 × 市場価格）
  const todaySolarKwh = todayLogs.filter((l) => l.source === 'solar').reduce((s, l) => s + Number(l.kwh), 0)
  const todayBatteryKwh = todayLogs.filter((l) => l.source === 'battery').reduce((s, l) => s + Number(l.kwh), 0)
  const JEPX_EST = 16.5 // 本日の推定平均単価（円/kWh）
  const FIT_RATE = 16    // FIT単価（円/kWh）
  const todayIncome = todayLogs.length > 0
    ? Math.round(todaySolarKwh * FIT_RATE * 0.3 + todayBatteryKwh * JEPX_EST * 0.4)
    : 423 // データなしのときデモ値

  // ---- 最適化スコア（データ蓄積量で変動）
  const dataCount = recentLogs.length
  const optimizationScore = Math.min(99, 60 + dataCount * 4)

  // ---- 今月の収入推定
  const monthSolarKwh = monthLogs.filter((l) => l.source === 'solar').reduce((s, l) => s + Number(l.kwh), 0)
  const monthBatteryKwh = monthLogs.filter((l) => l.source === 'battery').reduce((s, l) => s + Number(l.kwh), 0)
  const monthIncome = monthLogs.length > 0
    ? Math.round(monthSolarKwh * FIT_RATE * 0.3 + monthBatteryKwh * JEPX_EST * 0.35)
    : 8240 // データなしのときデモ値

  // 直近バッテリーSOC（実データがあれば）
  const latestBatterySoc = todayLogs.find((l) => l.source === 'battery' && l.soc != null)?.soc ?? 72
  const latestEvSoc = todayLogs.find((l) => l.source === 'ev' && l.soc != null)?.soc ?? 45

  const today = now.toLocaleDateString('ja-JP', {
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
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-zinc-500">本日の収入</p>
                <TooltipHelp text="太陽光発電の売電収入とVPP調整力提供による今日の合計収入です。" position="bottom" />
              </div>
              <p className="text-xl font-bold text-green-400 tabular-nums">+¥{todayIncome.toLocaleString()}</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-zinc-500">最適化スコア</p>
                <TooltipHelp text="AIが算出するエネルギー運用効率のスコアです。100に近いほど充放電タイミングが最適化されています。" position="bottom" />
              </div>
              <p className="text-xl font-bold text-white tabular-nums">
                {optimizationScore}<span className="text-sm text-zinc-500">/100</span>
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-zinc-500">今月累計</p>
                <TooltipHelp text="今月1日からの累計収入額です。売電収入とVPP調整力収入の合算です。" position="bottom" />
              </div>
              <p className="text-xl font-bold text-blue-400 tabular-nums">¥{monthIncome.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* ---- Energy Cards ---- */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                エネルギー状態
              </h2>
              <TooltipHelp text="太陽光発電、蓄電池、EV、電力消費の4つのエネルギー源のリアルタイム状態を表示します。SOC（State of Charge）は蓄電池やEVの充電残量（%）です。" position="right" />
            </div>
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
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-white text-sm">AI最適化エンジン</h2>
                  <TooltipHelp text="AIがJEPX電力価格と天気予報を分析し、蓄電池の充放電タイミングやVPP参加の最適なタイミングを提案します。ボタンを押すと最新の提案を取得できます。" position="bottom" />
                </div>
                <p className="text-xs text-zinc-500">リアルタイム収益最大化</p>
              </div>
            </div>
            <OptimizeButton
              batterySoc={latestBatterySoc}
              batteryCapacity={10}
              evSoc={latestEvSoc}
              evCapacity={40}
              solarCapacity={5.5}
            />
          </div>

          {/* Recent logged data — Supabase Realtime */}
          <RealtimeLogs
            initialLogs={recentLogs ?? []}
            initialMonthKwh={monthTotalKwh}
          />
        </div>

        {/* ---- JEPX Ticker ---- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <JepxTicker />
          </div>
          <div className="lg:col-span-2 rounded-xl border border-zinc-800/60 bg-gradient-to-r from-green-500/5 to-blue-500/5 p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-bold text-white text-sm">
                    2026年4月 低圧VPP解禁まであと少し
                  </p>
                  <TooltipHelp text="VPP（仮想発電所）とは、家庭の蓄電池を束ねて電力市場に参加する仕組みです。2026年4月の低圧VPP解禁により、一般家庭でも調整力市場で収入を得られるようになります。" position="bottom" />
                </div>
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
        </section>


        {/* ---- Achievements ---- */}
        {recentLogs.length > 0 && (
          <AchievementBadges
            stats={{
              totalLogs: recentLogs.length,
              totalKwh: monthTotalKwh,
              solarKwh: monthLogs.filter(l => l.source === 'solar').reduce((s, l) => s + Number(l.kwh), 0),
              batteryKwh: monthLogs.filter(l => l.source === 'battery').reduce((s, l) => s + Number(l.kwh), 0),
              consecutiveDays: 1, // Phase 2: 連続記録日数をDBから計算
              optimizeCount: 0,   // Phase 2: optimization_commandsテーブルから取得
              monthIncome,
            }}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-zinc-900 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-700">
          <span>PowerWallet Beta v0.3.0 — © 2026</span>
          <div className="flex items-center gap-3">
            <Link href="/legal/terms" className="hover:text-zinc-400 transition-colors">利用規約</Link>
            <Link href="/legal/privacy" className="hover:text-zinc-400 transition-colors">プライバシーポリシー</Link>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-green-500/50" />
              低圧VPP解禁対応済み
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
