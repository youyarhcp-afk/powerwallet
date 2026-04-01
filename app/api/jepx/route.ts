/**
 * GET /api/jepx — JEPX価格データ（30分キャッシュ）
 * jepx.ts の統計モデルから取得
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchJepxForecast } from '@/lib/services/jepx'

export async function GET() {
  // 認証チェック（ダッシュボード専用）
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const forecast = await fetchJepxForecast('東京')
    return NextResponse.json(
      {
        currentPrice: forecast.currentPrice,
        avgPrice: forecast.avgPrice,
        peakPrice: forecast.peakPrice,
        offPeakPrice: forecast.offPeakPrice,
        trend: forecast.trend,
        // Flatten JepxPrice[] → number[] for the ticker widget
        today: forecast.todayPrices.map((p) => p.price),
        tomorrow: forecast.tomorrowPrices.map((p) => p.price),
      },
      {
        headers: {
          // 30分キャッシュ（CDN + ブラウザ）
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
  } catch (err) {
    console.error('[JEPX API]', err)
    return NextResponse.json({ error: 'Failed to fetch JEPX data' }, { status: 500 })
  }
}
