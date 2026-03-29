'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteLogButton({ logId }: { logId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('このデータを削除しますか？')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/energy-logs?id=${logId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh() // Server Component を再レンダリング
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
