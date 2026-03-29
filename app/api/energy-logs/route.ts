import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/energy-logs — 認証済みユーザーのログ一覧を取得
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '50')
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

// POST /api/energy-logs — 1件または複数件を保存
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // 単件 or 複数件に対応
  const rows = Array.isArray(body) ? body : [body]

  const inserts = rows.map((row) => ({
    user_id: user.id,
    logged_date: row.date,
    source: row.source,
    kwh: parseFloat(row.kwh),
    soc: row.soc ? parseInt(row.soc) : null,
    notes: row.notes || null,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('energy_logs')
    .insert(inserts)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count: data.length }, { status: 201 })
}

// DELETE /api/energy-logs?id=xxx — 1件削除
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
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
