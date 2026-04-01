import Link from 'next/link'
import { Zap } from 'lucide-react'

export function LpFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-green-400" />
              </div>
              <span className="font-bold text-white text-sm">
                Power<span className="text-green-400">Wallet</span>
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-xs">
              個人の太陽光・蓄電池・EVをひとつのウォレットに。AIが電力収益を最大化する、日本初の個人向けエネルギー銀行。
            </p>
            <p className="text-xs text-zinc-700">
              © {year} PowerWallet. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">プロダクト</p>
            <ul className="space-y-2.5">
              {[
                { label: 'ダッシュボード', href: '/dashboard' },
                { label: 'シミュレーター', href: '/dashboard/simulate' },
                { label: '料金プラン', href: '/dashboard/subscription' },
                { label: '機能一覧', href: '#features' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">会社情報</p>
            <ul className="space-y-2.5">
              {[
                { label: 'ミッション', href: '#features' },
                { label: 'VPP解禁について', href: '#vpp' },
                { label: 'ブログ（準備中）', href: '#' },
                { label: 'お問い合わせ', href: 'mailto:support@powerwallet.jp' },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">法的情報</p>
            <ul className="space-y-2.5">
              {[
                { label: '利用規約', href: '/terms' },
                { label: 'プライバシーポリシー', href: '/privacy' },
                { label: '特定商取引法に基づく表記', href: '/commerce' },
                { label: 'セキュリティポリシー', href: '/security' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-700">
            {year}年4月 低圧VPP解禁対応 · PowerWallet Beta
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/powerwallet_jp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              X (Twitter)
            </a>
            <a
              href="https://github.com/youyarhcp-afk/powerwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
