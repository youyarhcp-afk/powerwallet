'use client'

/**
 * CSVエクスポートボタン
 * クリックで /api/export からCSVをダウンロード
 */

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface Props {
  from?: string  // YYYY-MM-DD
  to?: string    // YYYY-MM-DD
  label?: string
}

export function CsvExportButton({ from, to, label = 'CSVダウンロード' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)

      const res = await fetch(`/api/export?${params.toString()}`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'エクスポートに失敗しました' }))
        throw new Error(j.error ?? 'エクスポートに失敗しました')
      }

      // Blob として受け取ってDL
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `powerwallet_energy_logs_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
      setTimeout(() => setError(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg
          bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium
          hover:bg-zinc-700 hover:text-white active:scale-95
          transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {loading ? 'エクスポート中...' : label}
      </button>
      {error && (
        <p className="absolute top-full mt-1 right-0 text-xs text-red-400 whitespace-nowrap bg-zinc-900 border border-red-500/20 rounded px-2 py-1">
          {error}
        </p>
      )}
    </div>
  )
}
