'use client'

/**
 * PowerWallet — Toast通知システム
 * 外部ライブラリ不要の軽量実装
 * 使用法: import { toast, Toaster } from '@/components/toast'
 *   → toast.success('保存しました！')
 *   → toast.error('エラーが発生しました')
 *   → <Toaster /> をlayout.tsxに追加
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---- 型 ----
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

type ToastContextValue = {
  addToast: (toast: Omit<ToastItem, 'id'>) => void
}

// ---- Context ----
const ToastContext = createContext<ToastContextValue | null>(null)

// ---- Provider ----
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-4), { ...item, id }]) // 最大5件
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastList toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// ---- フック ----
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// ---- グローバル関数（Context外から呼べるように） ----
let _addToast: ((item: Omit<ToastItem, 'id'>) => void) | null = null

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-4), { ...item, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    _addToast = addToast
    return () => { _addToast = null }
  }, [addToast])

  return <ToastList toasts={toasts} onRemove={removeToast} />
}

// ---- グローバルtoastオブジェクト ----
export const toast = {
  success: (title: string, message?: string) =>
    _addToast?.({ type: 'success', title, message, duration: 4000 }),
  error: (title: string, message?: string) =>
    _addToast?.({ type: 'error', title, message, duration: 6000 }),
  warning: (title: string, message?: string) =>
    _addToast?.({ type: 'warning', title, message, duration: 5000 }),
  info: (title: string, message?: string) =>
    _addToast?.({ type: 'info', title, message, duration: 4000 }),
}

// ---- UIコンポーネント ----
const toastConfig: Record<ToastType, { icon: React.ElementType; bg: string; border: string; iconColor: string }> = {
  success: { icon: CheckCircle,   bg: 'bg-zinc-900',  border: 'border-green-500/30',  iconColor: 'text-green-400'  },
  error:   { icon: XCircle,       bg: 'bg-zinc-900',  border: 'border-red-500/30',    iconColor: 'text-red-400'    },
  warning: { icon: AlertTriangle, bg: 'bg-zinc-900',  border: 'border-yellow-500/30', iconColor: 'text-yellow-400' },
  info:    { icon: Info,          bg: 'bg-zinc-900',  border: 'border-blue-500/30',   iconColor: 'text-blue-400'   },
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const cfg = toastConfig[item.type]
  const Icon = cfg.icon

  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), item.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [item.id, item.duration, onRemove])

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-2xl shadow-black/40',
        'min-w-[280px] max-w-[380px]',
        'animate-in slide-in-from-right-full duration-300',
        cfg.bg, cfg.border
      )}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', cfg.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white leading-snug">{item.title}</p>
        {item.message && (
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function ToastList({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem item={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}
