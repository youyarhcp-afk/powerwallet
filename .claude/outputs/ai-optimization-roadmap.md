# AI最適化機能 開発ロードマップ
> 担当: AI Engineer + CTO
> 最終更新: 2026-03-30

---

## 🧠 機能マップ（優先度順）

```
優先度A（4月中）: データ基盤 + 最初の価値提供
優先度B（5月中）: 個別最適化 + 精度向上
優先度C（6月〜）: 自動化 + レポート + 高度予測
```

---

## 優先度A — 4月中にリリース

### A-1: JEPX価格データ取得パイプライン
**目的**: AI提案の「根拠データ」を実データ化する（現在はモック）

実装仕様:
```typescript
// lib/data/jepx-fetcher.ts
// JEPX公開データ: https://www.jepx.jp/electricpower/market-data/
// スポット市場: 翌日のコマ別価格（30分単位・48コマ）をCSVで取得

export interface JEPXPrice {
  date: string          // YYYY-MM-DD
  slot: number          // 1〜48 (30分単位)
  area: string          // エリアコード (01=北海道 ... 09=九州)
  price_yen_kwh: number // 円/kWh
}

// Supabase テーブル: jepx_prices
// 毎日AM5時にVercel Cron で自動取得 → Supabaseに保存
// RLS: SELECT は全ユーザー可 / INSERT は server-sideのみ
```

Vercel Cron設定 (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/fetch-jepx",
    "schedule": "0 5 * * *"
  }]
}
```

完了条件: 過去30日分のJEPX価格がSupabaseに蓄積されていること

---

### A-2: 天気予報連携（発電量予測）
**目的**: 「明日の発電量」をAI提案の前提データにする

実装仕様:
```typescript
// lib/data/weather-fetcher.ts
// OpenMeteo API (無料・商用可): https://open-meteo.com/
// 必要データ: 日射量(shortwave_radiation) / 雲量 / 気温

export async function getDailyForecast(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&daily=shortwave_radiation_sum,cloudcover_mean,temperature_2m_max` +
    `&timezone=Asia%2FTokyo&forecast_days=3`
  // 返値: 3日分の気象データ
}

// 発電量予測モデル（シンプル線形モデル from Phase 1）:
// 予測発電量(kWh) = 設置容量(kW) × 日射量(kWh/m²) × パネル効率(0.15〜0.22) × 設置角度係数
```

完了条件: ユーザーの緯度経度から翌日発電量予測が計算できること

---

### A-3: /api/optimize エンドポイント v1（実データ版）
**目的**: モックAIをリアルデータ駆動のClaudeAPIに置き換える

```typescript
// app/api/optimize/route.ts
// リクエスト
interface OptimizeRequest {
  user_id: string
  battery_soc: number      // 現在のSOC (0-100%)
  battery_capacity_kwh: number
  solar_kw: number         // 太陽光パネル容量
  location_lat: number
  location_lon: number
  target_date: string      // YYYY-MM-DD (デフォルト: 明日)
}

// レスポンス
interface OptimizeResponse {
  recommendation: 'charge' | 'discharge' | 'hold' | 'vpp_standby'
  optimal_time_slots: { start: string; end: string; action: string }[]
  confidence: number           // 0.0 〜 1.0
  reasoning: string            // 日本語の説明文
  estimated_revenue_jpy: number
  data_sources: string[]       // 使用したデータソース
  generated_at: string
  disclaimer: string           // 「本提案は情報提供のみ。投資助言ではありません。」
}

// Claude API プロンプト骨格（skills/analysis/optimize-prompt-v1.md 参照）
const SYSTEM_PROMPT = `
あなたは家庭用エネルギー最適化の専門AIです。
以下の情報を基に、充電・放電・VPP参加のタイミングを提案してください。

【重要な制約】
- この提案は「情報提供」のみです。投資助言・売電の代理行為ではありません
- 電力価格の予測は確実ではなく、実際の収益を保証するものではありません
- VPP参加はアグリゲーターとの契約が別途必要です

【入力データ】
- 現在のSOC: {battery_soc}%（容量: {battery_capacity_kwh}kWh）
- 太陽光容量: {solar_kw}kW
- 明日のJEPX予測価格: {jepx_prices}
- 明日の天気予報（発電量予測）: {weather_forecast}
- 過去7日間のユーザー行動パターン: {user_history}

推奨アクション、最適な時間帯、信頼度（0-1）、理由を日本語で回答してください。
`
```

完了条件: 実JEPXデータ + 天気データを使ったAI提案がダッシュボードに表示されること

---

## 優先度B — 5月中にリリース

### B-1: ユーザー別パーソナライズ提案
```
機能: 過去のユーザー行動（提案を実行した/しなかった）を学習
実装: Supabase の optimization_logs テーブルに実行結果を蓄積
     → ユーザーごとの「提案実行率」「収益実績」をフィードバックループに
テーブル設計:
  CREATE TABLE optimization_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    recommendation text NOT NULL,
    was_executed boolean,
    actual_revenue_jpy numeric,
    created_at timestamptz DEFAULT now()
  );
```

### B-2: 電力価格予測モデル（JEPX）
```
目的: 当日AM7時に「今日の最高値・最安値の時間帯」を予測
手法: 過去データのパターン認識（曜日・季節・気温の相関）
実装: Claude API に過去30日のJEPX価格を渡して予測
精度目標: ±15%以内の価格予測
評価基準: 実績価格との乖離率を毎日計測・記録
```

### B-3: 充放電最適化アルゴリズム
```
目的: 「いつ充電して、いつ放電するか」を1日単位で自動計画
入力: JEPX価格予測 + 天気予報 + ユーザーの電力消費パターン
出力: 1時間単位の推奨スケジュール（24スロット）
数式モデル:
  収益 = Σ(放電量[t] × JEPX価格[t]) - Σ(充電量[t] × 系統価格[t])
  制約: SOC[t] ∈ [20%, 90%] （バッテリー寿命保護）
        充電速度 ≤ 最大充電レート
        Σ放電量 ≤ 実際の放電可能量
```

---

## 優先度C — 6月以降

### C-1: 月次自動エネルギーレポート
```
内容: 先月の発電量・消費量・VPP収益・AI提案の実行率・節約額
形式: PDF（将来）/ ダッシュボード内ビュー（まずはこれ）
配信: 毎月1日にメール通知
```

### C-2: VPP参加スケジューラー
```
機能: アグリゲーターからの指令を受けて自動的に放電スケジュールを組む
前提: アグリゲーターAPIとの連携が必要（Phase 2以降）
```

---

## 今週のAI Engineerタスク（即着手可能）

| # | タスク | 期限 | 成果物パス |
|---|---|---|---|
| 1 | JEPXデータアクセス方法調査 | 4/2 | outputs/ai-datasource-evaluation.md |
| 2 | OpenMeteo API PoC（緯度経度→発電量予測） | 4/4 | outputs/ai-weather-poc.md |
| 3 | /api/optimize 仕様書v1 | 4/7 | outputs/ai-optimize-endpoint-spec-v1.md |
| 4 | Claudeプロンプトv1 | 4/10 | skills/analysis/optimize-prompt-v1.md |
