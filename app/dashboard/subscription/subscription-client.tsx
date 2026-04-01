'use client'

import { useState } from 'react'
import { Check, Sparkles, Crown, Zap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlanConfig } from '@/lib/services/stripe'

interface SubscriptionClientProps {
  plans: PlanConfig[]
  currentPlan: string
  hasStripeCustomer: boolean
}

export function SubscriptionClient({ plans, currentPlan, hasStripeCustomer }: SubscriptionClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleUpgrade = async (plan: PlanConfig) => {
    if (plan.id === 'free' || plan.id === currentPlan) return
    setLoadingPlan(plan.id)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'エラーが発生しました')
      }
    } catch {
      alert('通信エラーが発生しました。再度お試しください。')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleManage = async () => {
    setLoadingPlan('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'ポータルを開けませんでした')
      }
    } catch {
      alert('通信エラーが発生しました。')
    } finally {
      setLoadingPlan(null)
    }
  }

  const planIcons: Record<string, React.ReactNode> = {
    free: <Zap className="w-5 h-5 text-zinc-400" />,
    pro: <Sparkles className="w-5 h-5 text-green-400" />,
    premium: <Crown className="w-5 h-5 text-blue-400" />,
  }

  const planBorderColors: Record<string, string> = {
    free: 'border-zinc-800',
    pro: 'border-green-500/40',
    premium: 'border-blue-500/40',
  }

  const planBgColors: Record<string, string> = {
    free: 'bg-zinc-900/40',
    pro: 'bg-green-500/5',
    premium: 'bg-blue-500/5',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlan
        const isLoading = loadingPlan === plan.id

        return (
          <div
            key={plan.id}
            className={cn(
              'relative rounded-2xl border p-5 flex flex-col gap-4',
              planBorderColors[plan.id],
              planBgColors[plan.id],
              isCurrent && 'ring-1 ring-green-500/30',
              plan.highlight && 'shadow-lg shadow-green-500/5'
            )}
          >
            {/* バッジ */}
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold',
                  plan.id === 'pro'
                    ? 'bg-green-500 text-black'
                    : 'bg-blue-500 text-white'
                )}>
                  {plan.highlight}
                </span>
              </div>
            )}

            {/* ヘッダー */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {planIcons[plan.id]}
                <h3 className="text-base font-bold text-white">{plan.name}</h3>
                {isCurrent && (
                  <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                    現在のプラン
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                {plan.price === 0 ? (
                  <span className="text-2xl font-bold text-white">無料</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-white tabular-nums">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-zinc-500">/月（税込）</span>
                  </>
                )}
              </div>
              {plan.price > 0 && (
                <p className="text-xs text-zinc-600">14日間無料トライアルあり</p>
              )}
            </div>

            {/* 機能一覧 */}
            <ul className="flex-1 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <Check className={cn(
                    'w-3.5 h-3.5 flex-shrink-0 mt-0.5',
                    plan.id === 'free' ? 'text-zinc-600' :
                    plan.id === 'pro' ? 'text-green-400' : 'text-blue-400'
                  )} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* ボタン */}
            {isCurrent ? (
              hasStripeCustomer && plan.id !== 'free' ? (
                <button
                  onClick={handleManage}
                  disabled={loadingPlan === 'portal'}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingPlan === 'portal' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 処理中...</>
                  ) : 'プランを管理'}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-zinc-800/50 text-zinc-600 border border-zinc-800">
                  現在のプラン
                </div>
              )
            ) : plan.id === 'free' ? (
              <div className="w-full py-2.5 rounded-xl text-sm text-center text-zinc-600 border border-zinc-800">
                ダウングレードはサポートへ
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isLoading}
                className={cn(
                  'w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                  'flex items-center justify-center gap-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  plan.id === 'pro'
                    ? 'bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20'
                    : 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20'
                )}
              >
                {isLoading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 処理中...</>
                ) : (
                  <>{plan.name} にアップグレード</>
                )}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
