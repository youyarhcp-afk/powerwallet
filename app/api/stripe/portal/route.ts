import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/services/stripe'

/**
 * POST /api/stripe/portal
 * Stripeカスタマーポータル（プラン変更・キャンセル）へのリダイレクトURL取得
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sub } = await (supabase as any)
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'Stripeカスタマーが見つかりません' }, { status: 404 })
    }

    const session = await createPortalSession(
      sub.stripe_customer_id,
      `${appUrl}/dashboard/subscription`
    )

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe/Portal] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'ポータルセッション作成に失敗しました' },
      { status: 500 }
    )
  }
}
