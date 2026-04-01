import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { TutorialOverlay } from '@/components/tutorial-overlay'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ミドルウェアでも保護しているが、二重チェック
  if (!user) {
    redirect('/login')
  }

  // プラン情報を取得してサイドバーに渡す
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sub } = await (supabase as any)
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()
  const userPlan = (sub?.status === 'active' || sub?.status === 'trialing')
    ? (sub?.plan ?? 'free')
    : 'free'

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* 初回ユーザー向けチュートリアル */}
      <TutorialOverlay />

      {/* Side Navigation */}
      <Sidebar userEmail={user.email} userPlan={userPlan} />

      {/* Main content — left margin for sidebar */}
      {/* pt-14: モバイルのハンバーガーボタン(fixed top-3)との重なりを防ぐ */}
      <main className="lg:ml-52 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
