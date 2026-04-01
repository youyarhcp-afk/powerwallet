'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, TrendingUp, Shield, Sparkles } from 'lucide-react'

export function LpHero() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'エラーが発生しました')
      }
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-14 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-8 py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          2026年4月 低圧VPP解禁対応 — Beta公開中
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            電力を、<span className="text-green-400">資産</span>に変える。
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-400 font-light">
            太陽光・蓄電池・EVをAIが最適化。<br className="hidden sm:block" />
            VPP参加で毎月{' '}
            <span className="text-white font-semibold">収益を自動獲得</span>。
          </p>
        </div>

        {/* Sub text */}
        <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed">
          PowerWalletは家庭の再生可能エネルギー設備を「収益マシン」に変えるプラットフォームです。
          データを入力するだけで、AIが売電・蓄電・VPP参加をリアルタイムで最適化します。
        </p>

        {/* CTA */}
        {!submitted ? (
          <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              required
              className="flex-1 h-12 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/25 disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>無料で始める <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              <Zap className="w-4 h-4" />
              登録完了！まもなくご連絡します。
            </div>
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
            >
              今すぐダッシュボードにアクセス →
            </Link>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        <p className="text-zinc-600 text-xs">
          無料プランあり · クレジットカード不要 · いつでもキャンセル可
        </p>

        {/* Social proof stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-4 border-t border-zinc-900">
          {[
            { icon: TrendingUp, label: '平均削減額', value: '¥42,000/年' },
            { icon: Zap, label: 'VPP収益', value: '最大¥120,000/年' },
            { icon: Shield, label: 'セキュリティ', value: 'SOC2準拠' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-green-400" />
              <div className="text-left">
                <p className="text-xs text-zinc-600">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
