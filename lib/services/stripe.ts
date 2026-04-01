/**
 * Stripe サービス — PowerWallet 決済・サブスクリプション管理
 *
 * 使用パターン（2026年 Next.js App Router推奨）:
 * - Server Actions でチェックアウトセッション作成
 * - Webhook (/api/stripe/webhook) で状態同期
 * - Embedded Checkout（Stripe.js iframeをページ内に表示）
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stripe = any

// Stripeクライアントのシングルトン
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY が設定されていません')
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const StripeLib = require('stripe')
    _stripe = new StripeLib(secretKey, {
      apiVersion: '2025-01-27.acacia',
      typescript: true,
    })
  }
  return _stripe
}

// ----------------------------------------------------------------
// プラン定義
// ----------------------------------------------------------------

export interface PlanConfig {
  id: 'free' | 'pro' | 'premium'
  name: string
  price: number          // 月額（円）
  stripePriceId: string  // 環境変数で管理
  features: string[]
  highlight?: string     // バッジ表示
  color: string
}

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    stripePriceId: '',
    color: 'zinc',
    features: [
      'エネルギーデータ記録（無制限）',
      'VPP収入シミュレーター',
      'AI最適化（月3回まで）',
      'ダッシュボード閲覧',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 980,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? '',
    highlight: '人気No.1',
    color: 'green',
    features: [
      'Free プランの全機能',
      'AI最適化 実行権（無制限）',
      'JEPX価格リアルタイム表示',
      'VPP調整力収入のリアルタイム受け取り',
      '月次収益レポート（PDF）',
      '優先サポート',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2980,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM ?? '',
    highlight: '最大収益化',
    color: 'blue',
    features: [
      'Pro プランの全機能',
      'AIアシスタント（チャット形式）',
      'HEMS連携（Phase 2）',
      'EV V2G最適化',
      'カスタムVPP戦略設定',
      '専任サポート担当',
      '早期アクセス（新機能ベータ）',
    ],
  },
]

export function getPlanById(id: string): PlanConfig {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

// ----------------------------------------------------------------
// Stripe Checkout セッション作成
// ----------------------------------------------------------------

export interface CreateCheckoutParams {
  userId: string
  userEmail: string
  priceId: string
  plan: 'pro' | 'premium'
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const stripe = getStripe()

  // 既存のStripe顧客IDを取得（あれば再利用）
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sub } = await (supabase as any)
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', params.userId)
    .single()

  let customerId = sub?.stripe_customer_id

  if (!customerId) {
    // 新規顧客を作成
    const customer = await stripe.customers.create({
      email: params.userEmail,
      metadata: { userId: params.userId },
    })
    customerId = customer.id

    // DBに保存
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('subscriptions')
      .upsert({
        user_id: params.userId,
        stripe_customer_id: customerId,
      })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    locale: 'ja',
    subscription_data: {
      metadata: { userId: params.userId, plan: params.plan },
      trial_period_days: 14,  // 14日間無料トライアル
    },
    allow_promotion_codes: true,
  })

  return session
}

// ----------------------------------------------------------------
// Customer Portal セッション（プラン変更・キャンセル）
// ----------------------------------------------------------------

export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session
}

// ----------------------------------------------------------------
// Webhook イベント処理
// ----------------------------------------------------------------

export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<{ success: boolean; event?: string }> {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Stripe] STRIPE_WEBHOOK_SECRET が設定されていません')
    return { success: false }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Stripe] Webhook 署名検証エラー:', err)
    return { success: false }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const userId = sub.metadata.userId
        const plan = sub.metadata.plan

        if (userId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: sub.id,
            stripe_price_id: sub.items.data[0]?.price.id,
            plan: plan ?? 'pro',
            status: 'active',
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          }, { onConflict: 'user_id' })
        }
        break
      }

      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        const userId = sub.metadata.userId
        if (userId) {
          const plan = sub.metadata.plan ??
            (sub.items.data[0]?.price.id === process.env.STRIPE_PRICE_PREMIUM ? 'premium' : 'pro')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: sub.id,
            plan,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          }, { onConflict: 'user_id' })
        }
        break
      }

      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        const userId = sub.metadata.userId
        if (userId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('subscriptions').upsert({
            user_id: userId,
            plan: 'free',
            status: 'inactive',
            stripe_subscription_id: null,
          }, { onConflict: 'user_id' })
        }
        break
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const customerId = invoice.customer as string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId)
        break
      }

      default:
        console.log(`[Stripe] 未処理イベント: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Stripe] イベント処理エラー (${event.type}):`, err)
    return { success: false, event: event.type }
  }

  return { success: true, event: event.type }
}
