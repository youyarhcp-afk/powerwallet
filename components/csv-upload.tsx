'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, XCircle, FileText, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface ParsedRow {
  date: string
  source: string
  kwh: number
  soc?: number
  notes?: string
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(',').map((v) => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || '' })

      return {
        date:   row['date']   || row['日付']   || '',
        source: row['source'] || row['電力源'] || row['type'] || 'solar',
        kwh:    parseFloat(row['kwh'] || row['電力量'] || '0'),
        soc:    row['soc'] ? parseInt(row['soc']) : undefined,
        notes:  row['notes'] || row['メモ'] || undefined,
      }
    })
    .filter((row) => row.date && !isNaN(row.kwh) && row.kwh > 0)
}

type UploadState = 'idle' | 'dragover' | 'processing' | 'preview' | 'saving' | 'done' | 'error'

export function CsvUpload() {
  const [state, setState] = useState<UploadState>('idle')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [savedCount, setSavedCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('CSVファイルのみアップロード可能です（.csv）')
      setState('error')
      return
    }
    setState('processing')
    setFileName(file.name)

    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      await new Promise((r) => setTimeout(r, 600))

      if (parsed.length === 0) {
        setErrorMsg('有効なデータが見つかりませんでした。フォーマットを確認してください。')
        setState('error')
        return
      }

      setRows(parsed)
      setState('preview')
    } catch {
      setErrorMsg('ファイルの読み込みに失敗しました。')
      setState('error')
    }
  }

  const handleSave = async () => {
    setState('saving')
    try {
      const res = await fetch('/api/energy-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '保存に失敗しました')
      }

      const data = await res.json()
      setSavedCount(data.count)
      setState('done')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存に失敗しました'
      setErrorMsg(msg)
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setRows([])
    setFileName('')
    setErrorMsg('')
    setSavedCount(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone — shown when not previewing/done */}
      {(state === 'idle' || state === 'dragover' || state === 'processing' || state === 'error') && (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer select-none',
            state === 'dragover' ? 'border-green-500 bg-green-500/5 scale-[1.01]' : '',
            state === 'error'    ? 'border-red-500/40 bg-red-500/5' : '',
            state === 'idle'     ? 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30' : '',
            state === 'processing' ? 'border-zinc-700' : ''
          )}
          onDragOver={(e) => { e.preventDefault(); setState('dragover') }}
          onDragLeave={() => setState('idle')}
          onDrop={handleDrop}
          onClick={() => state !== 'processing' && fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

          {state === 'processing' ? (
            <div className="space-y-2">
              <div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">解析中...</p>
            </div>
          ) : state === 'error' ? (
            <div className="space-y-1.5">
              <XCircle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-sm text-red-400">{errorMsg}</p>
              <button onClick={(e) => { e.stopPropagation(); handleReset() }} className="mt-1 text-xs text-zinc-500 hover:text-zinc-300 underline">
                やり直す
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-zinc-500 mx-auto" />
              <div>
                <p className="text-sm text-zinc-400">CSVをドラッグ＆ドロップ</p>
                <p className="text-xs text-zinc-600 mt-0.5">またはクリックしてファイルを選択</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview table */}
      {(state === 'preview' || state === 'saving') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-300 font-medium">{fileName}</span>
            </div>
            <span className="text-xs text-zinc-500">{rows.length}件を検出</span>
          </div>

          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-800">
              <p className="text-xs text-zinc-400 font-medium">プレビュー（先頭5件）</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    {['日付', '電力源', 'kWh', 'SOC%', 'メモ'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-zinc-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                      <td className="px-3 py-2 text-zinc-300 font-mono">{row.date}</td>
                      <td className="px-3 py-2 text-zinc-300">{row.source}</td>
                      <td className="px-3 py-2 text-zinc-300 font-mono">{row.kwh}</td>
                      <td className="px-3 py-2 text-zinc-400">{row.soc ?? '—'}</td>
                      <td className="px-3 py-2 text-zinc-500 max-w-[100px] truncate">{row.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={state === 'saving'}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg',
                'bg-green-500 text-black font-semibold text-sm',
                'hover:bg-green-400 transition-colors',
                'disabled:opacity-70 disabled:cursor-not-allowed'
              )}
            >
              {state === 'saving' ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {state === 'saving' ? '保存中...' : `${rows.length}件を保存する`}
            </button>
            <button
              onClick={handleReset}
              disabled={state === 'saving'}
              className="px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {state === 'done' && (
        <div className="space-y-3">
          <div className="text-center p-6 rounded-xl bg-green-500/5 border border-green-500/20">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="font-semibold text-green-400">{savedCount}件を保存しました！</p>
            <p className="text-xs text-zinc-500 mt-1">「履歴」ページで確認できます</p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-colors"
          >
            別のファイルをアップロード
          </button>
        </div>
      )}

      {/* Format hint */}
      <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/60">
        <p className="text-xs text-zinc-500">
          <span className="text-zinc-400 font-medium">フォーマット：</span>{' '}
          date, source, kwh, soc, notes
        </p>
        <p className="text-xs text-zinc-600 mt-0.5 font-mono">2026-03-26, solar, 12.4, 72</p>
      </div>
    </div>
  )
}
