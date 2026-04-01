/**
 * POST /api/user-profile — ユーザープロフィール保存
 * GET  /api/user-profile — ユーザープロフィール取得
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUserProfile, checkRateLimit } from '@/lib/validations'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data ?? null })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // レート制限: 1分間に5回まで
  const rl = checkRateLimit(`profile:${user.id}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'レート制限: しばらく待ってから再試行してください' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = validateUserProfile(body)
  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 422 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_profiles')
    .upsert(
      { user_id: user.id, ...result.data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[UserProfile] upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
