import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateEnergyLog, validateCsvRows, checkRateLimit } from '@/lib/validations'

// GET /api/energy-logs — 認証済みユーザーのログ一覧を取得
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 500) // 最大500件
  const source = searchParams.get('source')
  const from = searchParams.get('from') // YYYY-MM-DD
  const to = searchParams.get('to')     // YYYY-MM-DD

  let query = supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (source) query = query.eq('source', source)
  if (from) query = query.gte('logged_date', from)
  if (to) query = query.lte('logged_date', to)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST /api/energy-logs — 1件または複数件を保存（バリデーション付き）
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // レート制限: 1分間に30件まで（CSVインポートを考慮して高め）
  const rl = checkRateLimit(`energy-logs:${user.id}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'レート制限: 1分間の送信回数が上限に達しました。しばらく待ってからお試しください。' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rows = Array.isArray(body) ? body : [body]

  // 一度に保存できる件数を制限（CSVインポート安全策）
  if (rows.length > 200) {
    return NextResponse.json(
      { error: '一度に保存できるのは200件までです' },
      { status: 400 }
    )
  }

  // バリデーション
  if (rows.length === 1) {
    // 単件: 詳細なエラーメッセージを返す
    const result = validateEnergyLog(rows[0])
    if (!result.success) {
      return NextResponse.json({ errors: result.errors }, { status: 422 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('energy_logs')
      .insert({
        user_id: user.id,
        logged_date: result.data.date,
        source: result.data.source,
        kwh: result.data.kwh,
        soc: result.data.soc,
        notes: result.data.notes,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, count: 1 }, { status: 201 })
  } else {
    // 複数件: バルクバリデーション → 有効なものだけ保存
    const { valid, errors } = validateCsvRows(rows)

    if (valid.length === 0) {
      return NextResponse.json(
        { error: '全件のバリデーションに失敗しました', errors },
        { status: 422 }
      )
    }

    const inserts = valid.map((row) => ({
      user_id: user.id,
      logged_date: row.date,
      source: row.source,
      kwh: row.kwh,
      soc: row.soc,
      notes: row.notes,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('energy_logs')
      .insert(inserts)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        data,
        count: data.length,
        skipped: rows.length - valid.length,
        validationErrors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    )
  }
}

// DELETE /api/energy-logs?id=xxx — 1件削除
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // レート制限: 1分間に20件まで
  const rl = checkRateLimit(`energy-logs-delete:${user.id}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'レート制限: しばらく待ってからお試しください' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || typeof id !== 'string' || id.length > 50) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('energy_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // RLSに加えてここでも保護

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
