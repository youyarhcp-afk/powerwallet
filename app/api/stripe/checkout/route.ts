import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, PLANS } from '@/lib/services/stripe'

/**
 * POST /api/stripe/checkout
 * Stripeチェックアウトセッションを作成してURLを返す
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { plan } = body as { plan: 'pro' | 'premium' }

    if (!plan || !['pro', 'premium'].includes(plan)) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 })
    }

    const planConfig = PLANS.find((p) => p.id === plan)
    if (!planConfig?.stripePriceId) {
      return NextResponse.json({ error: 'Stripe Price IDが未設定です' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email ?? '',
      priceId: planConfig.stripePriceId,
      plan,
      successUrl: `${appUrl}/dashboard/subscription?success=1&plan=${plan}`,
      cancelUrl: `${appUrl}/dashboard/subscription?canceled=1`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe/Checkout] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'チェックアウト作成に失敗しました' },
      { status: 500 }
    )
  }
}
