/**
 * POST /api/waitlist — ウェイトリスト登録
 * Body: { email: string, source?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'lp' } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'メールアドレスが必要です' }, { status: 400 })
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 })
    }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('waitlist')
      .upsert(
        { email: email.toLowerCase().trim(), source },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'リクエストの処理に失敗しました' }, { status: 500 })
  }
}
