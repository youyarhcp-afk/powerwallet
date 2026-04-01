'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: '無料プランでどこまで使えますか？',
    a: '無料プランでは、エネルギーデータの入力・履歴管理・基本ダッシュボード表示が月30件まで利用できます。AIシミュレーターの基本機能も無料でお試しいただけます。',
  },
  {
    q: 'どんな設備があれば使えますか？',
    a: '太陽光パネル・蓄電池・EVのいずれか1つから利用可能です。データは手動入力でもOK。将来的にはHEMS連携による自動取得にも対応予定です。',
  },
  {
    q: 'VPPに参加するには何が必要ですか？',
    a: '蓄電池（低圧用・系統連系対応）と、電力会社またはアグリゲーターとの契約が必要です。PowerWallet Proプランでは、申請サポートとアグリゲーター連携を自動化します（2026年中に順次対応）。',
  },
  {
    q: '月額料金はいくらですか？',
    a: 'Freeプランは永久無料。Proプランは月額980円（年払い時）で、AIシミュレーター・VPP収益最適化・データエクスポートなどの高度な機能が使えます。',
  },
  {
    q: 'データのセキュリティは大丈夫ですか？',
    a: 'データはSupabase（AWS基盤）で管理され、通信はTLS1.3で暗号化されています。RLS（行レベルセキュリティ）により、他のユーザーのデータには一切アクセスできません。',
  },
  {
    q: '将来のPWATTトークンとは何ですか？',
    a: 'PowerWalletが計画する次世代機能です。1kWh = 1 PWATT（電力トークン）として、家庭間でP2P電力取引を行う仕組みです。Solanaブロックチェーン上での実装を2027年以降に予定しています。',
  },
]

export function LpFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-4 bg-zinc-950/50">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-green-400 text-sm font-medium tracking-wider uppercase">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">よくある質問</h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200',
                    open === i && 'rotate-180'
                  )}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-600 text-sm">
          その他のご質問は{' '}
          <a href="mailto:support@powerwallet.jp" className="text-green-400 hover:text-green-300 transition-colors">
            support@powerwallet.jp
          </a>{' '}
          まで
        </p>
      </div>
    </section>
  )
}
