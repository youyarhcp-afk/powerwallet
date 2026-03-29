'use client'

import { useState } from 'react'
import { Check, Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type EnergySource = 'solar' | 'battery' | 'ev' | 'grid'
type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface FormData {
  date: string
  source: EnergySource
  kwh: string
  soc: string
  notes: string
}

const SOURCE_OPTIONS: { value: EnergySource; label: string; emoji: string }[] = [
  { value: 'solar',   label: '太陽光',   emoji: '☀️' },
  { value: 'battery', label: '蓄電池',   emoji: '🔋' },
  { value: 'ev',      label: 'EV',       emoji: '🚗' },
  { value: 'grid',    label: '電力消費', emoji: '⚡' },
]

const fieldBase =
  'w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white' +
  ' placeholder:text-zinc-600 transition-all duration-200' +
  ' focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50'

export function EnergyForm() {
  const [form, setForm] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    source: 'solar',
    kwh: '',
    soc: '',
    notes: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/energy-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          source: form.source,
          kwh: parseFloat(form.kwh),
          soc: form.soc ? parseInt(form.soc) : null,
          notes: form.notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '保存に失敗しました')
      }

      setStatus('success')
      // フォームをリセット
      setForm((f) => ({ ...f, kwh: '', soc: '', notes: '' }))

      // 2秒後にダッシュボードへリダイレクト（Realtimeで自動反映）
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存に失敗しました'
      setErrorMsg(msg)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Date + Source */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">日付</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={fieldBase}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">電力源</label>
          <select
            value={form.source}
            onChange={(e) =>
              setForm((f) => ({ ...f, source: e.target.value as EnergySource }))
            }
            className={cn(fieldBase, 'cursor-pointer')}
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: kWh + SOC */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">
            電力量 <span className="text-zinc-600">(kWh)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="例: 12.4"
            value={form.kwh}
            onChange={(e) => setForm((f) => ({ ...f, kwh: e.target.value }))}
            className={fieldBase}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">
            SOC <span className="text-zinc-600">(% 任意)</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="例: 72"
            value={form.soc}
            onChange={(e) => setForm((f) => ({ ...f, soc: e.target.value }))}
            className={fieldBase}
          />
        </div>
      </div>

      {/* Row 3: Notes */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">
          メモ <span className="text-zinc-600">(任意)</span>
        </label>
        <input
          type="text"
          placeholder="例: 快晴、フル充電後"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className={fieldBase}
        />
      </div>

      {/* Error message */}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg',
          'font-medium text-sm transition-all duration-300',
          status === 'success'
            ? 'bg-green-600/20 text-green-400 border border-green-500/30'
            : status === 'loading'
            ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-wait'
            : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
        )}
      >
        {status === 'loading' ? (
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        ) : status === 'success' ? (
          <>
            <Check className="w-4 h-4" />
            保存しました！
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            データを保存
          </>
        )}
        {status === 'loading' && '保存中...'}
      </button>
    </form>
  )
}
