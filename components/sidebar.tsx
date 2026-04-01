'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  DatabaseZap,
  TrendingUp,
  History,
  LogOut,
  Zap,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Crown,
  Settings,
} from 'lucide-react'
import { useState } from 'react'
import { TutorialResetButton } from '@/components/tutorial-overlay'

interface NavItem {
  href: string
  label: string
  labelSub: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'ダッシュボード',
    labelSub: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/input',
    label: 'データ入力',
    labelSub: 'Input',
    icon: DatabaseZap,
  },
  {
    href: '/dashboard/simulate',
    label: 'シミュレーター',
    labelSub: 'Simulate',
    icon: TrendingUp,
  },
  {
    href: '/dashboard/history',
    label: '履歴',
    labelSub: 'History',
    icon: History,
  },
  {
    href: '/dashboard/subscription',
    label: 'プラン・料金',
    labelSub: 'Upgrade',
    icon: Crown,
  },
  {
    href: '/dashboard/settings',
    label: '設定',
    labelSub: 'Settings',
    icon: Settings,
  },
]

interface SidebarProps {
  userEmail?: string
  userPlan?: string
}

export function Sidebar({ userEmail, userPlan = 'free' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center animate-glow flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            Power<span className="text-green-400">Wallet</span>
          </span>
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
            β
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'transition-all duration-150 group relative',
                active
                  ? 'bg-green-500/10 border border-green-500/20 text-white'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-green-400 rounded-r-full" />
              )}
              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  active ? 'text-green-400' : 'group-hover:text-zinc-300'
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-none">{item.label}</p>
                <p className={cn(
                  'text-[10px] mt-0.5 leading-none',
                  active ? 'text-green-500/70' : 'text-zinc-600'
                )}>
                  {item.labelSub}
                </p>
              </div>
              {active && (
                <ChevronRight className="w-3 h-3 text-green-400/60 flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 pb-4 pt-2 border-t border-zinc-800/60 space-y-2">
        {/* User info + Plan badge */}
        <div className="px-3 py-2 rounded-lg bg-zinc-800/40 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-zinc-500 truncate flex-1">{userEmail}</p>
            {userPlan === 'premium' ? (
              <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400">
                PREMIUM
              </span>
            ) : userPlan === 'pro' ? (
              <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400">
                PRO
              </span>
            ) : (
              <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-700/50 border border-zinc-700 text-zinc-500">
                FREE
              </span>
            )}
          </div>
        </div>
        {/* Tutorial reset */}
        <TutorialResetButton />
        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'text-zinc-500 hover:text-red-400 hover:bg-red-500/5',
            'transition-all duration-150 group'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium">ログアウト</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-52 z-40',
          'bg-[#080808] border-r border-zinc-900',
          'flex flex-col',
          'transition-transform duration-200',
          // Desktop: always visible
          'lg:translate-x-0',
          // Mobile: slide in/out
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <NavContent />
      </aside>
    </>
  )
}
