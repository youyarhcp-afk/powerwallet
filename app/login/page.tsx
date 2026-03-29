'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [mode, setMode] = useState<Mode>('login')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })
        if (error) throw error
        setSuccessMsg(
          '確認メールを送信しました。メールを確認してアカウントを有効化してください。'
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      // Supabase エラーを日本語に変換
      if (msg.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else if (msg.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。確認メールをご確認ください。')
      } else if (msg.includes('User already registered')) {
        setError('このメールアドレスはすでに登録されています')
      } else if (msg.includes('Password should be at least')) {
        setError('パスワードは6文字以上で設定してください')
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setError('')
    setSuccessMsg('')
  }

  const inputBase =
    'w-full h-10 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50'

  return (
    <div className="min-h-screen bg-[#050505] bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-green-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[380px] relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4 animate-glow">
            <Zap className="w-7 h-7 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Power<span className="text-green-400">Wallet</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1.5">
            あなたのエネルギーウォレット
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-7">
          <h2 className="text-base font-semibold text-white mb-6">
            {mode === 'login' ? 'ログイン' : '新規アカウント登録'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={cn(inputBase, 'pl-9 pr-3')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                パスワード
                {mode === 'signup' && (
                  <span className="text-zinc-600 ml-1">（6文字以上）</span>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  className={cn(inputBase, 'pl-9 pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 leading-relaxed">
                {error}
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 leading-relaxed">
                {successMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-2',
                'bg-green-500 text-black font-semibold text-sm',
                'hover:bg-green-400 active:scale-[0.99] transition-all duration-150',
                'shadow-lg shadow-green-500/20 hover:shadow-green-500/30',
                'disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100'
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {mode === 'login' ? 'ログイン' : 'アカウントを作成'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {mode === 'login'
                ? 'アカウントをお持ちでない方はこちら →'
                : 'すでにアカウントをお持ちの方はこちら →'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs text-zinc-700">
            2026年4月 低圧VPP解禁対応 · PowerWallet Beta
          </p>
        </div>
      </div>
    </div>
  )
}
