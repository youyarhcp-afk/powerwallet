/**
 * PowerWallet — 入力バリデーション定義
 * Zodスキーマで全APIエンドポイントの入力を厳密に検証
 * セキュリティ・UX品質の両方を担保する
 */

// Zodが未インストールの場合に備えた軽量バリデーション実装
// （npm install zod 後に zod版に切り替え可能）

export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }

// ---- エネルギーログ入力 ----

export interface EnergyLogInput {
  date: string
  source: string
  kwh: number
  soc?: number | null
  notes?: string | null
}

export function validateEnergyLog(input: unknown): ValidationResult<EnergyLogInput> {
  const errors: ValidationError[] = []
  const data = input as Record<string, unknown>

  // date
  if (!data.date || typeof data.date !== 'string') {
    errors.push({ field: 'date', message: '日付は必須です' })
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push({ field: 'date', message: '日付は YYYY-MM-DD 形式で入力してください' })
  } else {
    const d = new Date(data.date)
    const now = new Date()
    if (isNaN(d.getTime())) {
      errors.push({ field: 'date', message: '無効な日付です' })
    } else if (d > now) {
      errors.push({ field: 'date', message: '未来の日付は登録できません' })
    } else if (d.getFullYear() < 2020) {
      errors.push({ field: 'date', message: '2020年以前のデータは登録できません' })
    }
  }

  // source
  const validSources = ['solar', 'battery', 'ev', 'grid']
  if (!data.source || !validSources.includes(data.source as string)) {
    errors.push({ field: 'source', message: `電力源は ${validSources.join(' / ')} のいずれかを選択してください` })
  }

  // kwh
  const kwh = Number(data.kwh)
  if (data.kwh === undefined || data.kwh === null || data.kwh === '') {
    errors.push({ field: 'kwh', message: '電力量（kWh）は必須です' })
  } else if (isNaN(kwh)) {
    errors.push({ field: 'kwh', message: '電力量は数値を入力してください' })
  } else if (kwh < 0) {
    errors.push({ field: 'kwh', message: '電力量は0以上を入力してください' })
  } else if (kwh > 10000) {
    errors.push({ field: 'kwh', message: '電力量が大きすぎます（10,000kWh以下）' })
  }

  // soc（オプション）
  if (data.soc !== undefined && data.soc !== null && data.soc !== '') {
    const soc = Number(data.soc)
    if (isNaN(soc) || soc < 0 || soc > 100) {
      errors.push({ field: 'soc', message: 'SOCは0〜100の整数を入力してください' })
    }
  }

  // notes（オプション）
  if (data.notes && typeof data.notes === 'string' && data.notes.length > 500) {
    errors.push({ field: 'notes', message: 'メモは500文字以内で入力してください' })
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    data: {
      date: data.date as string,
      source: data.source as string,
      kwh,
      soc: data.soc != null && data.soc !== '' ? Math.round(Number(data.soc)) : null,
      notes: (data.notes as string) || null,
    },
  }
}

// ---- CSV一括インポート ----

export interface CsvRowInput {
  date: string
  source: string
  kwh: number
  soc?: number | null
  notes?: string | null
}

export function validateCsvRows(rows: unknown[]): {
  valid: CsvRowInput[]
  errors: { row: number; messages: string[] }[]
} {
  const valid: CsvRowInput[] = []
  const errors: { row: number; messages: string[] }[] = []

  rows.forEach((row, index) => {
    const result = validateEnergyLog(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      errors.push({
        row: index + 1,
        messages: result.errors.map((e) => `${e.field}: ${e.message}`),
      })
    }
  })

  return { valid, errors }
}

// ---- ユーザープロフィール ----

export interface UserProfileInput {
  battery_capacity?: number
  solar_capacity?: number
  ev_capacity?: number
  latitude?: number
  longitude?: number
  prefecture?: string
  utility_company?: string
  tariff_plan?: string
  display_name?: string
}

export function validateUserProfile(input: unknown): ValidationResult<UserProfileInput> {
  const errors: ValidationError[] = []
  const data = input as Record<string, unknown>
  const out: UserProfileInput = {}

  const numField = (key: string, min: number, max: number, label: string) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      const v = Number(data[key])
      if (isNaN(v) || v < min || v > max) {
        errors.push({ field: key, message: `${label}は${min}〜${max}の数値を入力してください` })
      } else {
        ;(out as Record<string, unknown>)[key] = v
      }
    }
  }

  numField('battery_capacity', 0, 200, '蓄電池容量（kWh）')
  numField('solar_capacity', 0, 100, '太陽光容量（kW）')
  numField('ev_capacity', 0, 200, 'EV電池容量（kWh）')
  numField('latitude', 24, 46, '緯度')
  numField('longitude', 122, 154, '経度')

  if (data.display_name && typeof data.display_name === 'string') {
    if (data.display_name.length > 50) {
      errors.push({ field: 'display_name', message: '表示名は50文字以内で入力してください' })
    } else {
      out.display_name = data.display_name.trim()
    }
  }

  if (data.prefecture) out.prefecture = String(data.prefecture)
  if (data.utility_company) out.utility_company = String(data.utility_company)
  if (data.tariff_plan) out.tariff_plan = String(data.tariff_plan)

  if (errors.length > 0) return { success: false, errors }
  return { success: true, data: out }
}

// ---- レート制限チェック（メモリベース、軽量実装） ----

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

// 古いエントリを定期的にクリーンアップ（メモリリーク防止）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    rateLimitMap.forEach((v, k) => { if (now > v.resetAt) rateLimitMap.delete(k) })
  }, 300_000)
}
