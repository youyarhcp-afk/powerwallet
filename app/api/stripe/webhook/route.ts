import { NextRequest, NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/lib/services/stripe'

/**
 * POST /api/stripe/webhook
 * Stripeからのwebhookイベントを受信・処理する
 *
 * Vercel設定: この関数はボディパース無効が必要
 * → next.config.tsで /api/stripe/webhook のbodyParserを無効化するか、
 *   request.text() で生のボディを取得する
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'stripe-signatureヘッダーがありません' }, { status: 400 })
  }

  const result = await handleStripeWebhook(body, signature)

  if (!result.success) {
    return NextResponse.json({ error: 'Webhook処理に失敗しました' }, { status: 400 })
  }

  return NextResponse.json({ received: true, event: result.event })
}
