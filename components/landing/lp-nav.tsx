'use client'

import Link from 'next/link'
import { Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function LpNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900/80 bg-[#050505]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            Power<span className="text-green-400">Wallet</span>
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">β</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">機能</a>
          <a href="#howitworks" className="hover:text-white transition-colors">使い方</a>
          <a href="#vpp" className="hover:text-white transition-colors">VPP収益</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
          >
            ログイン
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold bg-green-500 hover:bg-green-400 text-black px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-green-500/20"
          >
            無料で始める
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-900 bg-[#050505] px-4 py-4 space-y-3">
          <a href="#features" className="block text-sm text-zinc-400 hover:text-white py-1.5" onClick={() => setOpen(false)}>機能</a>
          <a href="#howitworks" className="block text-sm text-zinc-400 hover:text-white py-1.5" onClick={() => setOpen(false)}>使い方</a>
          <a href="#vpp" className="block text-sm text-zinc-400 hover:text-white py-1.5" onClick={() => setOpen(false)}>VPP収益</a>
          <a href="#faq" className="block text-sm text-zinc-400 hover:text-white py-1.5" onClick={() => setOpen(false)}>FAQ</a>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="block text-center text-sm text-zinc-300 border border-zinc-700 rounded-lg py-2">ログイン</Link>
            <Link href="/login" className="block text-center text-sm font-semibold bg-green-500 text-black rounded-lg py-2">無料で始める</Link>
          </div>
        </div>
      )}
    </header>
  )
}
