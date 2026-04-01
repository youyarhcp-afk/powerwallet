'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipHelpProps {
  /** ツールチップに表示する説明テキスト */
  text: string
  /** ポジション: デフォルトは bottom */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** サイズ: アイコンサイズ */
  size?: 'sm' | 'md'
}

export function TooltipHelp({ text, position = 'bottom', size = 'sm' }: TooltipHelpProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 外部クリックで閉じる
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const btnSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className={cn(
          btnSize,
          'rounded-full flex items-center justify-center',
          'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/60',
          'transition-all duration-150',
          open && 'text-green-400 bg-green-500/10'
        )}
        aria-label="ヘルプ"
      >
        <HelpCircle className={iconSize} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 w-56 sm:w-64',
            'bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40',
            'p-3 text-xs text-zinc-300 leading-relaxed',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            positionClasses[position]
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-zinc-600 hover:text-zinc-400"
          >
            <X className="w-3 h-3" />
          </button>
          <p>{text}</p>
        </div>
      )}
    </div>
  )
}
