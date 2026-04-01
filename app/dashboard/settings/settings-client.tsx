'use client'

/**
 * PowerWallet — 設定クライアントコンポーネント
 * 蓄電池・太陽光・EV容量、所在地、電力会社・プランを登録
 */

import { useState, useTransition } from 'react'
import { Battery, Sun, Car, MapPin, Building2, Zap, User, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import { validateUserProfile } from '@/lib/validations'

// ---- プロフィール型 ----
interface UserProfile {
  user_id?: string
  display_name?: string
  battery_capacity?: number
  solar_capacity?: number
  ev_capacity?: number
  latitude?: number
  longitude?: number
  prefecture?: string
  utility_company?: string
  tariff_plan?: string
}

interface Props {
  userId: string
  userEmail: string
  initialProfile: UserProfile | null
}

// ---- 都道府県リスト ----
const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
]

// ---- 主要電力会社 ----
const UTILITY_COMPANIES = [
  '北海道電力','東北電力','東京電力','中部電力','北陸電力',
  '関西電力','中国電力','四国電力','九州電力','沖縄電力',
  '新電力（その他）',
]

// ---- フォームフィールド ----
type FieldKey = keyof UserProfile

function FormField({
  label, icon: Icon, children, error, hint,
}: {
  label: string
  icon: React.ElementType
  children: React.ReactNode
  error?: string
  hint?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm text-zinc-300 font-medium mb-1.5">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-zinc-600 mt-1">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

export function SettingsClient({ userId, userEmail, initialProfile }: Props) {
  const [form, setForm] = useState<UserProfile>(initialProfile ?? {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()

  function update(key: FieldKey, value: string | number | undefined) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  function handleNumericInput(key: FieldKey, value: string) {
    if (value === '') {
      update(key, undefined)
    } else {
      update(key, parseFloat(value) || 0)
    }
  }

  async function handleSave() {
    // バリデーション
    const result = validateUserProfile(form)
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.errors.forEach(e => { errs[e.field] = e.message })
      setErrors(errs)
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...result.data }),
        })
        if (!res.ok) throw new Error(await res.text())
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 4000)
      }
    })
  }

  const inputClass = `w-full px-3 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700
    text-white text-sm placeholder-zinc-600
    focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50
    transition-colors`

  return (
    <div className="space-y-6">
      {/* アカウント情報 */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-400" />
          アカウント
        </h2>
        <div className="space-y-4">
          <FormField label="メールアドレス" icon={User}>
            <input
              type="email"
              value={userEmail}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </FormField>
          <FormField
            label="表示名"
            icon={User}
            error={errors.display_name}
            hint="ダッシュボードの挨拶に表示されます（50文字以内）"
          >
            <input
              type="text"
              value={form.display_name ?? ''}
              onChange={e => update('display_name', e.target.value)}
              placeholder="例: 田中 太郎"
              maxLength={50}
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* 設備情報 */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-zinc-400" />
          設備情報
          <span className="text-xs text-zinc-600 font-normal">AI最適化に使用されます</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="蓄電池容量 (kWh)"
            icon={Battery}
            error={errors.battery_capacity}
            hint="0〜200 kWh"
          >
            <input
              type="number"
              value={form.battery_capacity ?? ''}
              onChange={e => handleNumericInput('battery_capacity', e.target.value)}
              placeholder="例: 9.8"
              min={0}
              max={200}
              step={0.1}
              className={inputClass}
            />
          </FormField>
          <FormField
            label="太陽光パネル容量 (kW)"
            icon={Sun}
            error={errors.solar_capacity}
            hint="0〜100 kW"
          >
            <input
              type="number"
              value={form.solar_capacity ?? ''}
              onChange={e => handleNumericInput('solar_capacity', e.target.value)}
              placeholder="例: 4.5"
              min={0}
              max={100}
              step={0.1}
              className={inputClass}
            />
          </FormField>
          <FormField
            label="EV電池容量 (kWh)"
            icon={Car}
            error={errors.ev_capacity}
            hint="0〜200 kWh"
          >
            <input
              type="number"
              value={form.ev_capacity ?? ''}
              onChange={e => handleNumericInput('ev_capacity', e.target.value)}
              placeholder="例: 40.0"
              min={0}
              max={200}
              step={0.1}
              className={inputClass}
            />
          </FormField>
        </div>

        {/* 蓄電池 / 太陽光 / EV 参考値 */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: '一般的な家庭用蓄電池', value: '5〜16 kWh', color: 'text-green-400' },
            { label: '標準的な太陽光', value: '3〜6 kW', color: 'text-yellow-400' },
            { label: 'EV（日産リーフ）', value: '40〜62 kWh', color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-2.5 py-2 rounded-lg bg-zinc-800/40 border border-zinc-800">
              <p className="text-zinc-600">{label}</p>
              <p className={`font-medium mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 所在地 */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-zinc-400" />
          所在地
          <span className="text-xs text-zinc-600 font-normal">日照量予測・VPP参加エリア判定に使用</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="都道府県" icon={MapPin} error={errors.prefecture}>
            <select
              value={form.prefecture ?? ''}
              onChange={e => update('prefecture', e.target.value)}
              className={inputClass}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField
            label="緯度"
            icon={MapPin}
            error={errors.latitude}
            hint="北緯 24〜46 度"
          >
            <input
              type="number"
              value={form.latitude ?? ''}
              onChange={e => handleNumericInput('latitude', e.target.value)}
              placeholder="例: 35.681"
              min={24}
              max={46}
              step={0.001}
              className={inputClass}
            />
          </FormField>
          <FormField
            label="経度"
            icon={MapPin}
            error={errors.longitude}
            hint="東経 122〜154 度"
          >
            <input
              type="number"
              value={form.longitude ?? ''}
              onChange={e => handleNumericInput('longitude', e.target.value)}
              placeholder="例: 139.767"
              min={122}
              max={154}
              step={0.001}
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* 電力会社・プラン */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-zinc-400" />
          電力契約
          <span className="text-xs text-zinc-600 font-normal">売電・買電単価計算に使用</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="電力会社" icon={Building2} error={errors.utility_company}>
            <select
              value={form.utility_company ?? ''}
              onChange={e => update('utility_company', e.target.value)}
              className={inputClass}
            >
              <option value="">選択してください</option>
              {UTILITY_COMPANIES.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </FormField>
          <FormField
            label="契約プラン名"
            icon={Zap}
            error={errors.tariff_plan}
            hint="例: スマートライフプラン、夜得プランなど"
          >
            <input
              type="text"
              value={form.tariff_plan ?? ''}
              onChange={e => update('tariff_plan', e.target.value)}
              placeholder="例: スマートライフプラン"
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* 保存ボタン */}
      <div className="flex items-center justify-between">
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" />
            保存しました
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4" />
            保存に失敗しました。再度お試しください
          </div>
        )}
        {saveStatus === 'idle' && <div />}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-black
            text-sm font-bold hover:bg-green-400 active:scale-95 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending ? '保存中...' : '設定を保存'}
        </button>
      </div>
    </div>
  )
}
