import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/services/stripe'
import { SubscriptionClient } from './subscription-client'
import { Crown, Zap, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'プラン・料金 — PowerWallet',
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; plan?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 現在のサブスクリプション状態を取得
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription } = await (supabase as any)
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const currentPlan = subscription?.plan ?? 'free'
  const subStatus = subscription?.status ?? 'active'
  const params = await searchParams

  return (
    <div className="min-h-screen bg-[#050505] bg-grid">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ---- ヘッダー ---- */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            2026年4月 低圧VPP解禁直前 — 今すぐProにアップグレード
          </div>
          <h1 className="text-2xl font-bold text-white">
            エネルギーで、もっと稼ぐ
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            PowerWallet Proで、AIが市場を24時間監視。<br />
            充放電タイミングを自動最適化し、VPP収入を最大化します。
          </p>
        </div>

        {/* ---- 成功 / キャンセル通知 ---- */}
        {params.success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-400">
                {params.plan === 'premium' ? 'Premium' : 'Pro'} プランへのアップグレードが完了しました！
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                14日間の無料トライアル開始。AI最適化が無制限に使えます。
              </p>
            </div>
          </div>
        )}

        {params.canceled && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/60 border border-zinc-700">
            <p className="text-sm text-zinc-400">
              購入がキャンセルされました。いつでもアップグレードできます。
            </p>
          </div>
        )}

        {/* ---- 現在のプラン状態 ---- */}
        <CurrentPlanBanner plan={currentPlan} status={subStatus} periodEnd={subscription?.current_period_end} />

        {/* ---- 料金カード（クライアントコンポーネント） ---- */}
        <SubscriptionClient
          plans={PLANS}
          currentPlan={currentPlan}
          hasStripeCustomer={!!subscription?.stripe_customer_id}
        />

        {/* ---- 収益シミュレーション比較 ---- */}
        <RevenueComparison />

        {/* ---- FAQ ---- */}
        <FaqSection />
      </div>
    </div>
  )
}

// ---- サブコンポーネント ----

function CurrentPlanBanner({
  plan, status, periodEnd,
}: { plan: string; status: string; periodEnd?: string }) {
  if (plan === 'free') return null

  const planLabel = plan === 'premium' ? 'Premium' : 'Pro'
  const endDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
      <div className="flex items-center gap-3">
        <Crown className="w-5 h-5 text-yellow-400" />
        <div>
          <p className="text-sm font-semibold text-white">
            現在のプラン: <span className="text-green-400">{planLabel}</span>
            {status === 'trialing' && (
              <span className="ml-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                トライアル中
              </span>
            )}
          </p>
          {endDate && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {status === 'trialing' ? `トライアル終了: ${endDate}` : `次回更新: ${endDate}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function RevenueComparison() {
  const rows = [
    { feature: 'AI最適化実行回数', free: '月3回まで', pro: '無制限', premium: '無制限' },
    { feature: 'VPP収入受け取り', free: '—', pro: '✓ リアルタイム', premium: '✓ リアルタイム' },
    { feature: 'JEPX価格表示', free: '—', pro: '✓ リアルタイム', premium: '✓ リアルタイム' },
    { feature: '月次収益レポート', free: '—', pro: '✓ PDF', premium: '✓ PDF' },
    { feature: 'EV V2G最適化', free: '—', pro: '—', premium: '✓ Phase 2' },
    { feature: 'HEMS連携', free: '—', pro: '—', premium: '✓ Phase 2' },
    { feature: '想定月収（10kWh蓄電池）', free: '¥0', pro: '¥1,200〜', premium: '¥2,800〜' },
  ]

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-white">プラン比較</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">機能</th>
              <th className="text-center px-4 py-3 text-xs text-zinc-500 font-medium">Free</th>
              <th className="text-center px-4 py-3 text-xs text-green-400 font-semibold">Pro</th>
              <th className="text-center px-4 py-3 text-xs text-blue-400 font-semibold">Premium</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-800/40 last:border-0">
                <td className="px-5 py-3 text-xs text-zinc-400">{row.feature}</td>
                <td className="px-4 py-3 text-center text-xs text-zinc-600">{row.free}</td>
                <td className="px-4 py-3 text-center text-xs text-green-400 font-medium">{row.pro}</td>
                <td className="px-4 py-3 text-center text-xs text-blue-400 font-medium">{row.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FaqSection() {
  const faqs = [
    {
      q: '14日間のトライアルについて',
      a: 'Pro/Premiumプランは14日間無料でお試しいただけます。トライアル期間中はいつでもキャンセル可能で、費用は一切かかりません。',
    },
    {
      q: 'VPP収入はいつから受け取れますか？',
      a: '2026年4月の低圧VPP解禁後、Proプラン以上のユーザーから順次アグリゲーター登録のご案内をお送りします。現在はシミュレーション値で収益を確認できます。',
    },
    {
      q: 'プランのアップグレード・ダウングレードは？',
      a: 'いつでもプラン変更が可能です。アップグレードは即時反映、ダウングレードは次の請求サイクル開始時に反映されます。',
    },
    {
      q: '支払い方法は何が使えますか？',
      a: 'Visa、Mastercard、JCB、American Expressのクレジットカード/デビットカードが使用できます。',
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white">よくある質問</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <details key={i} className="group rounded-xl border border-zinc-800 bg-zinc-900/40">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm text-zinc-300 font-medium list-none">
              {faq.q}
              <span className="text-zinc-600 group-open:rotate-180 transition-transform duration-200">▼</span>
            </summary>
            <p className="px-5 pb-4 text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
