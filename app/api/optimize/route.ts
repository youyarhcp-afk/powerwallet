import { NextRequest, NextResponse } from 'next/server'

// Vercel: Hobby=10秒 / Pro=60秒。外部API2本 + DB を含むため30秒を宣言
export const maxDuration = 30
import { createClient } from '@/lib/supabase/server'
import { fetchJepxForecast } from '@/lib/services/jepx'
import { fetchWeatherForecast } from '@/lib/services/weather'
import { runOptimization, type EnergyState } from '@/lib/services/optimizer'
import { checkRateLimit } from '@/lib/validations'

/**
 * POST /api/optimize — AI最適化エンジン v1.0
 *
 * リクエストボディ（オプション — 未指定時はデフォルト値を使用）:
 * {
 *   batterySoc?: number,      // 蓄電池SOC (%)
 *   batteryCapacity?: number, // 蓄電池容量 (kWh)
 *   evSoc?: number | null,    // EV SOC (%)
 *   evCapacity?: number,      // EV電池容量 (kWh)
 *   solarCapacity?: number,   // 太陽光容量 (kW)
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // レート制限: Freeプランは1分間3回、全体10回/分
  const rl = checkRateLimit(`optimize:${user.id}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'レート制限: AI最適化の実行頻度が上限に達しました。しばらくお待ちください。' },
      { status: 429 }
    )
  }

  try {
    // リクエストボディからエネルギー状態を取得（デフォルト値あり）
    let body: Partial<EnergyState> = {}
    try {
      body = await request.json()
    } catch {
      // ボディなしの場合はデフォルト値を使用
    }

    const energyState: EnergyState = {
      batterySoc: body.batterySoc ?? 72,
      batteryCapacity: body.batteryCapacity ?? 10,
      evSoc: body.evSoc !== undefined ? body.evSoc : 45,
      evCapacity: body.evCapacity ?? 40,
      solarCapacity: body.solarCapacity ?? 5.5,
      dailyConsumption: body.dailyConsumption ?? null,
    }

    // ユーザーの直近のエネルギーログから消費量を推定
    const today = new Date().toISOString().slice(0, 10)
    const { data: todayLogs } = await supabase
      .from('energy_logs')
      .select('kwh, source, soc')
      .eq('user_id', user.id)
      .eq('logged_date', today)

    if (todayLogs && todayLogs.length > 0) {
      // 実データがあれば使用
      const gridConsumption = todayLogs
        .filter((l: { source: string }) => l.source === 'grid')
        .reduce((s: number, l: { kwh: number }) => s + Number(l.kwh), 0)
      if (gridConsumption > 0) {
        energyState.dailyConsumption = gridConsumption
      }

      // 最新のSOCデータがあれば反映
      const latestBattery = todayLogs.find((l: { source: string; soc: number | null }) => l.source === 'battery' && l.soc != null)
      if (latestBattery && latestBattery.soc != null) {
        energyState.batterySoc = latestBattery.soc
      }
      const latestEv = todayLogs.find((l: { source: string; soc: number | null }) => l.source === 'ev' && l.soc != null)
      if (latestEv && latestEv.soc != null) {
        energyState.evSoc = latestEv.soc
      }
    }

    // JEPX価格データ取得（並列実行）
    const [jepxForecast, weatherForecast] = await Promise.all([
      fetchJepxForecast('東京'),
      fetchWeatherForecast(35.6762, 139.6503, energyState.solarCapacity),
    ])

    // 最適化エンジン実行
    const result = runOptimization(jepxForecast, weatherForecast, energyState)

    // 制御コマンドをSupabaseに保存（Phase 2でIoT連携）
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('optimization_commands')
        .insert({
          user_id: user.id,
          action: result.primary.action,
          estimated_income: result.primary.estimatedIncome,
          confidence: result.primary.confidence,
          commands: JSON.stringify(result.primary.commands),
          jepx_price: jepxForecast.currentPrice,
          weather_summary: weatherForecast.solar.weatherSummary,
          executed: false,
        })
    } catch {
      // テーブルがまだない場合は無視（マイグレーション前）
      console.log('[Optimize] optimization_commands table not yet created')
    }

    return NextResponse.json({
      success: true,
      result: {
        primary: result.primary,
        alternatives: result.alternatives,
        meta: result.meta,
      },
      market: {
        currentPrice: jepxForecast.currentPrice,
        avgPrice: jepxForecast.avgPrice,
        peakPrice: jepxForecast.peakPrice,
        trend: jepxForecast.trend,
      },
      weather: {
        todayKwh: weatherForecast.solar.todayKwh,
        tomorrowKwh: weatherForecast.solar.tomorrowKwh,
        summary: weatherForecast.solar.weatherSummary,
      },
      energyState,
    })
  } catch (error) {
    console.error('[Optimize] Error:', error)
    return NextResponse.json(
      { error: 'Optimization failed', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/optimize — 直近の最適化結果を取得
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('optimization_commands')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    return NextResponse.json({ data: data ?? [] })
  } catch {
    // テーブルがない場合
    return NextResponse.json({ data: [] })
  }
}
