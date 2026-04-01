import { createClient } from '@/lib/supabase/server'
import { Settings } from 'lucide-react'
import { SettingsClient } from './settings-client'

export const metadata = {
  title: '設定 — PowerWallet',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // user_profiles テーブルからプロフィールを取得（なければ null）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="min-h-screen bg-[#050505] bg-grid">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-400" />
            <h1 className="text-xl font-bold text-white">設定</h1>
          </div>
          <p className="text-zinc-500 text-sm mt-1">
            設備情報・所在地・契約プランを登録するとAI最適化の精度が向上します
          </p>
        </div>

        <SettingsClient
          userId={user!.id}
          userEmail={user!.email ?? ''}
          initialProfile={profile ?? null}
        />
      </div>
    </div>
  )
}
