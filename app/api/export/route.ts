/**
 * GET /api/export?format=csv — エネルギーログをCSVとしてダウンロード
 * クエリパラメータ:
 *   format: 'csv' (デフォルト)
 *   from:   YYYY-MM-DD (オプション)
 *   to:     YYYY-MM-DD (オプション)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/validations'

// Vercel: 最大1万行のCSV生成のため60秒を宣言（Proプラン必須）
export const maxDuration = 60

const CSV_HEADERS = ['日付', '電力源', 'kWh', 'SOC(%)', 'メモ', '登録日時']

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // フィールドにカンマ・改行・ダブルクォートが含まれる場合はクォート
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const SOURCE_LABELS: Record<string, string> = {
  solar:   '太陽光',
  battery: '蓄電池',
  ev:      'EV',
  grid:    '電力消費',
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // レート制限: 1分間に5回まで（大量データDLを抑制）
  const rl = checkRateLimit(`export:${user.id}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'レート制限: しばらく待ってからお試しください' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // データ取得（最大10,000件）
  let query = supabase
    .from('energy_logs')
    .select('logged_date, source, kwh, soc, notes, created_at')
    .eq('user_id', user.id)
    .order('logged_date', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(10000)

  if (from) query = query.gte('logged_date', from)
  if (to) query = query.lte('logged_date', to)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // CSV生成
  const rows: string[] = [
    // BOM for Excel Japanese support
    '\uFEFF' + CSV_HEADERS.join(','),
  ]

  for (const log of (data ?? [])) {
    const row = [
      escapeCsvField(log.logged_date),
      escapeCsvField(SOURCE_LABELS[log.source] ?? log.source),
      escapeCsvField(Number(log.kwh).toFixed(2)),
      escapeCsvField(log.soc),
      escapeCsvField(log.notes),
      escapeCsvField(new Date(log.created_at).toLocaleString('ja-JP')),
    ]
    rows.push(row.join(','))
  }

  const csv = rows.join('\r\n')
  const today = new Date().toISOString().slice(0, 10)
  const filename = `powerwallet_energy_logs_${today}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
