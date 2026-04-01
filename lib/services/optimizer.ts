/**
 * AI最適化エンジン v1.0 — PowerWallet コアロジック
 *
 * 入力: JEPX市場価格 + 天気/太陽光予測 + 蓄電池/EVのSOC + 消費実績
 * 出力: 最適な充放電アクション + 収益予測 + CO₂削減量
 *
 * アルゴリズム:
 * 1. 時間帯別の売電/買電単価を比較
 * 2. 蓄電池SOC + 太陽光予測から放電余力を算出
 * 3. VPP調整力市場の単価とピーク時間帯を照合
 * 4. 最大収益となるアクションを決定
 */

import type { JepxForecast } from './jepx'
import type { WeatherForecast } from './weather'

// ---- 型定義 ----

export interface EnergyState {
  /** 蓄電池SOC（%） */
  batterySoc: number
  /** 蓄電池容量（kWh） */
  batteryCapacity: number
  /** EV SOC（%）— 接続されていない場合はnull */
  evSoc: number | null
  /** EV電池容量（kWh） */
  evCapacity: number
  /** 太陽光パネル容量（kW） */
  solarCapacity: number
  /** 本日の家庭消費実績（kWh）— データがない場合はnull */
  dailyConsumption: number | null
}

export interface OptimizationAction {
  /** アクション種別 */
  action: 'sell' | 'vpp' | 'store' | 'hold'
  /** ラベル */
  label: string
  /** ヘッドライン */
  headline: string
  /** 分析理由（自然言語） */
  reason: string
  /** 市場状況テキスト */
  marketContext: string
  /** 予想収入（円） */
  estimatedIncome: number
  /** 収益内訳 */
  breakdown: {
    label: string
    amount: number
    color: string
  }[]
  /** AI信頼度（%） */
  confidence: number
  /** 緊急度 */
  urgency: 'high' | 'medium' | 'low'
  /** 推奨時間窓 */
  timeWindow: string
  /** CO₂削減量（kg） */
  co2Benefit: number
  /** 制御コマンド（Phase 2でIoT連携） */
  commands: ControlCommand[]
}

export interface ControlCommand {
  /** ターゲットデバイス */
  device: 'battery' | 'ev' | 'grid'
  /** アクション */
  action: 'charge' | 'discharge' | 'hold' | 'v2g'
  /** パラメータ */
  params: {
    targetSoc?: number
    kwhAmount?: number
    startTime?: string
    endTime?: string
  }
}

export interface OptimizationResult {
  /** メインの推奨アクション */
  primary: OptimizationAction
  /** 代替アクション（比較用） */
  alternatives: OptimizationAction[]
  /** 分析メタデータ */
  meta: {
    jepxSource: string
    weatherSource: string
    analyzedAt: string
    modelVersion: string
  }
}

// ---- 定数 ----

/** VPP調整力の平均単価（円/kWh） */
const VPP_RATE = 8.2
/** VPP参加ボーナス（円/回） */
const VPP_PARTICIPATION_BONUS = 15
/** CO₂排出係数（kg-CO₂/kWh）— 東京電力2025実績 */
const CO2_FACTOR = 0.42
/** 蓄電池の放電効率 */
const DISCHARGE_EFFICIENCY = 0.92
/** EV V2Gの放電効率 */
const V2G_EFFICIENCY = 0.85
/** 最低SOC（蓄電池、%） */
const MIN_BATTERY_SOC = 20
/** 最低SOC（EV、%） */
const MIN_EV_SOC = 30

// ---- エンジン本体 ----

/**
 * 最適化を実行する
 */
export function runOptimization(
  jepx: JepxForecast,
  weather: WeatherForecast,
  state: EnergyState
): OptimizationResult {
  const now = new Date()
  const currentHour = now.getHours()
  const currentSlot = currentHour * 2 + (now.getMinutes() >= 30 ? 1 : 0)

  // 放電可能量を計算
  const batteryAvailable = Math.max(
    0,
    ((state.batterySoc - MIN_BATTERY_SOC) / 100) * state.batteryCapacity * DISCHARGE_EFFICIENCY
  )
  const evAvailable = state.evSoc !== null
    ? Math.max(0, ((state.evSoc - MIN_EV_SOC) / 100) * state.evCapacity * V2G_EFFICIENCY)
    : 0

  // 日平均消費量（データがない場合は一般家庭平均 12kWh/日）
  const dailyConsumption = state.dailyConsumption ?? 12.0

  // 残りの時間帯で使える太陽光発電量
  const remainingSolarHours = Math.max(0, 18 - currentHour)
  const remainingSolar = (weather.solar.todayKwh / 12) * remainingSolarHours

  // 各アクションのスコアリング
  const sellScore = scoreSellAction(jepx, batteryAvailable, evAvailable, currentSlot)
  const vppScore = scoreVppAction(jepx, batteryAvailable, evAvailable, currentHour)
  const storeScore = scoreStoreAction(jepx, weather, state, currentHour)
  const holdScore = scoreHoldAction(jepx, currentSlot, remainingSolar, dailyConsumption)

  // スコア順にソート
  const scoredActions = [
    { type: 'sell' as const, score: sellScore },
    { type: 'vpp' as const, score: vppScore },
    { type: 'store' as const, score: storeScore },
    { type: 'hold' as const, score: holdScore },
  ].sort((a, b) => b.score - a.score)

  // メインアクションを構築
  const primary = buildAction(
    scoredActions[0].type,
    jepx,
    weather,
    state,
    batteryAvailable,
    evAvailable,
    currentHour,
    currentSlot
  )

  // 代替アクション（上位2つ）
  const alternatives = scoredActions.slice(1, 3).map((s) =>
    buildAction(s.type, jepx, weather, state, batteryAvailable, evAvailable, currentHour, currentSlot)
  )

  return {
    primary,
    alternatives,
    meta: {
      jepxSource: jepx.source,
      weatherSource: weather.source,
      analyzedAt: now.toISOString(),
      modelVersion: 'v1.0.0',
    },
  }
}

// ---- スコアリング関数 ----

function scoreSellAction(
  jepx: JepxForecast,
  batteryKwh: number,
  evKwh: number,
  currentSlot: number
): number {
  let score = 0
  const price = jepx.currentPrice

  // 現在価格が平均より高い → 売電有利
  const priceRatio = price / jepx.avgPrice
  score += priceRatio * 40

  // ピーク価格に近いほど高スコア
  if (price >= jepx.peakPrice * 0.85) score += 25

  // 放電余力がある
  if (batteryKwh > 2) score += 15
  if (evKwh > 5) score += 10

  // 上昇トレンドなら少し待った方がいいかも → スコア減
  if (jepx.trend === 'rising') score -= 10
  // 下降トレンドなら今がチャンス
  if (jepx.trend === 'falling') score += 15

  // 深夜は売電意味なし
  if (currentSlot < 12 || currentSlot > 44) score -= 30

  return Math.max(0, score)
}

function scoreVppAction(
  jepx: JepxForecast,
  batteryKwh: number,
  evKwh: number,
  currentHour: number
): number {
  let score = 0

  // VPPピーク時間帯（17:00-20:00）に近いほど高スコア
  if (currentHour >= 15 && currentHour <= 20) {
    score += 35
    if (currentHour >= 17 && currentHour <= 19) score += 20
  }

  // 合計放電余力が大きいほど有利
  const totalKwh = batteryKwh + evKwh
  if (totalKwh >= 10) score += 25
  else if (totalKwh >= 5) score += 15
  else if (totalKwh >= 2) score += 5

  // 市場価格が高いとVPP単価も上がる傾向
  if (jepx.currentPrice > 20) score += 15
  if (jepx.peakPrice > 25) score += 10

  // 朝や深夜はVPPなし
  if (currentHour < 7 || currentHour > 22) score -= 40

  return Math.max(0, score)
}

function scoreStoreAction(
  jepx: JepxForecast,
  weather: WeatherForecast,
  state: EnergyState,
  currentHour: number
): number {
  let score = 0

  // 明日の太陽光発電が多い → 充電して明日売る
  if (weather.solar.tomorrowKwh > 10) score += 20

  // 現在価格がオフピーク価格に近い → 安値買い
  if (jepx.currentPrice <= jepx.offPeakPrice * 1.2) score += 25

  // SOCが低い → 充電の余地が大きい
  if (state.batterySoc < 40) score += 20
  else if (state.batterySoc < 60) score += 10

  // 明日のピーク価格との差額が大きいほど有利
  const priceDiff = jepx.peakPrice - jepx.currentPrice
  if (priceDiff > 10) score += 25
  else if (priceDiff > 5) score += 15

  // 夜間充電推奨
  if (currentHour >= 22 || currentHour <= 6) score += 15

  return Math.max(0, score)
}

function scoreHoldAction(
  jepx: JepxForecast,
  currentSlot: number,
  remainingSolar: number,
  dailyConsumption: number
): number {
  let score = 30 // ベーススコア（安全策）

  // 価格が平均圏内 → 動く理由がない
  const priceRatio = jepx.currentPrice / jepx.avgPrice
  if (priceRatio > 0.85 && priceRatio < 1.15) score += 20

  // トレンドが安定 → 動かない方が安全
  if (jepx.trend === 'stable') score += 15

  // 太陽光の余剰が少ない → 自家消費重視
  if (remainingSolar < dailyConsumption * 0.3) score += 10

  return Math.max(0, score)
}

// ---- アクション構築 ----

function buildAction(
  type: 'sell' | 'vpp' | 'store' | 'hold',
  jepx: JepxForecast,
  weather: WeatherForecast,
  state: EnergyState,
  batteryKwh: number,
  evKwh: number,
  currentHour: number,
  currentSlot: number
): OptimizationAction {
  switch (type) {
    case 'sell':
      return buildSellAction(jepx, weather, state, batteryKwh, evKwh, currentSlot)
    case 'vpp':
      return buildVppAction(jepx, weather, state, batteryKwh, evKwh, currentHour)
    case 'store':
      return buildStoreAction(jepx, weather, state, currentHour)
    case 'hold':
      return buildHoldAction(jepx, weather, state, currentSlot)
  }
}

function buildSellAction(
  jepx: JepxForecast,
  weather: WeatherForecast,
  state: EnergyState,
  batteryKwh: number,
  evKwh: number,
  currentSlot: number
): OptimizationAction {
  const sellKwh = Math.min(batteryKwh, state.batteryCapacity * 0.5)
  const sellIncome = Math.round(sellKwh * jepx.currentPrice)
  const solarSurplus = Math.round(weather.solar.todayKwh * 0.3 * jepx.avgPrice)
  const totalIncome = sellIncome + solarSurplus

  // 信頼度: データソースと価格安定性で計算
  let confidence = 70
  if (jepx.source === 'api') confidence += 10
  if (weather.source === 'open-meteo') confidence += 8
  if (jepx.trend !== 'rising') confidence += 5
  confidence = Math.min(95, confidence)

  return {
    action: 'sell',
    label: '今すぐ売電推奨',
    headline: `売電推奨 ⚡  予想収入 +¥${totalIncome} / 今日`,
    reason: `JEPX市場のスポット価格が現在¥${jepx.currentPrice}/kWhで${
      jepx.currentPrice > jepx.avgPrice ? '平均を上回っています' : '安定圏内です'
    }。蓄電池SOC ${state.batterySoc}%から${MIN_BATTERY_SOC}%まで約${sellKwh.toFixed(1)}kWhを放電売電すると、¥${sellIncome}の収入が見込めます。${
      weather.solar.tomorrowKwh > 8
        ? `明日は${weatherCodeToSimple(weather.solar.mainWeatherCode)}で${weather.solar.tomorrowKwh}kWh発電予測のため、再充電が可能です。`
        : ''
    }`,
    marketContext: `市場参考単価: ¥${jepx.currentPrice}/kWh（平均¥${jepx.avgPrice}/kWh比 ${
      Math.round((jepx.currentPrice / jepx.avgPrice - 1) * 100)
    }%）\n天気予報: ${weather.solar.weatherSummary}`,
    estimatedIncome: totalIncome,
    breakdown: [
      { label: `売電収入（${sellKwh.toFixed(1)}kWh × ¥${jepx.currentPrice}）`, amount: sellIncome, color: 'text-yellow-400' },
      { label: '太陽光余剰売電', amount: solarSurplus, color: 'text-orange-400' },
    ],
    confidence,
    urgency: jepx.currentPrice > jepx.avgPrice * 1.3 ? 'high' : 'medium',
    timeWindow: `${currentSlotToTime(currentSlot)}〜${currentSlotToTime(Math.min(47, currentSlot + 4))}が最適`,
    co2Benefit: Math.round(sellKwh * CO2_FACTOR * 10) / 10,
    commands: [
      {
        device: 'battery',
        action: 'discharge',
        params: { targetSoc: MIN_BATTERY_SOC, kwhAmount: sellKwh },
      },
    ],
  }
}

function buildVppAction(
  jepx: JepxForecast,
  weather: WeatherForecast,
  state: EnergyState,
  batteryKwh: number,
  evKwh: number,
  currentHour: number
): OptimizationAction {
  const vppStartHour = Math.max(currentHour, 17)
  const vppEndHour = 20
  const vppHours = Math.max(1, vppEndHour - vppStartHour)

  const batteryVppKwh = Math.min(batteryKwh, state.batteryCapacity * 0.4)
  const evVppKwh = state.evSoc !== null ? Math.min(evKwh, state.evCapacity * 0.15) : 0
  const totalVppKwh = batteryVppKwh + evVppKwh

  const vppIncome = Math.round(totalVppKwh * VPP_RATE * vppHours * 0.6)
  const drBonus = VPP_PARTICIPATION_BONUS
  const totalIncome = vppIncome + drBonus

  let confidence = 75
  if (currentHour >= 15 && currentHour <= 17) confidence += 10
  if (totalVppKwh > 10) confidence += 8
  if (weather.source === 'open-meteo') confidence += 5
  confidence = Math.min(95, confidence)

  return {
    action: 'vpp',
    label: 'VPP市場参加推奨',
    headline: `調整力市場参加推奨 🔋  予想収入 +¥${totalIncome} / 今日`,
    reason: `${vppStartHour}:00〜${vppEndHour}:00のピーク時間帯に需要応答（DR）へ参加すると調整力収入が見込めます。蓄電池${batteryVppKwh.toFixed(1)}kWh${
      evVppKwh > 0 ? `＋EV ${evVppKwh.toFixed(1)}kWh` : ''
    }で計${totalVppKwh.toFixed(1)}kWhの放電余力があり、十分な参加条件を満たしています。`,
    marketContext: `調整力単価: ¥${VPP_RATE}/kWh\n参加時間帯: ${vppStartHour}:00〜${vppEndHour}:00（${
      currentHour < vppStartHour ? `${vppStartHour - currentHour}時間後開始` : '現在参加可能'
    }）`,
    estimatedIncome: totalIncome,
    breakdown: [
      { label: `調整力収入（蓄電池 ${batteryVppKwh.toFixed(1)}kWh）`, amount: Math.round(batteryVppKwh * VPP_RATE * vppHours * 0.6), color: 'text-green-400' },
      ...(evVppKwh > 0
        ? [{ label: `調整力収入（EV V2G ${evVppKwh.toFixed(1)}kWh）`, amount: Math.round(evVppKwh * VPP_RATE * vppHours * 0.6), color: 'text-blue-400' }]
        : []),
      { label: 'DR参加インセンティブ', amount: drBonus, color: 'text-purple-400' },
    ],
    confidence,
    urgency: currentHour >= 16 && currentHour <= 19 ? 'high' : 'medium',
    timeWindow: `${vppStartHour}:00〜${vppEndHour}:00に参加`,
    co2Benefit: Math.round(totalVppKwh * CO2_FACTOR * 1.5 * 10) / 10,
    commands: [
      {
        device: 'battery',
        action: 'discharge',
        params: {
          targetSoc: MIN_BATTERY_SOC,
          kwhAmount: batteryVppKwh,
          startTime: `${vppStartHour}:00`,
          endTime: `${vppEndHour}:00`,
        },
      },
      ...(evVppKwh > 0
        ? [{
            device: 'ev' as const,
            action: 'v2g' as const,
            params: {
              targetSoc: MIN_EV_SOC,
              kwhAmount: evVppKwh,
              startTime: `${vppStartHour}:00`,
              endTime: `${vppEndHour}:00`,
            },
          }]
        : []),
    ],
  }
}

function buildStoreAction(
  jepx: JepxForecast,
  weather: WeatherForecast,
  state: EnergyState,
  currentHour: number
): OptimizationAction {
  const chargeNeeded = ((100 - state.batterySoc) / 100) * state.batteryCapacity
  const buyPrice = jepx.offPeakPrice
  const chargeCost = Math.round(chargeNeeded * buyPrice)
  const sellTomorrow = Math.round(chargeNeeded * 0.7 * jepx.peakPrice * 0.8)
  const netIncome = sellTomorrow - chargeCost

  let confidence = 65
  if (weather.solar.tomorrowKwh > 10) confidence += 10
  if (jepx.peakPrice - jepx.offPeakPrice > 10) confidence += 10
  if (weather.source === 'open-meteo') confidence += 5
  confidence = Math.min(95, confidence)

  const chargeStart = currentHour >= 22 ? `${currentHour}:00` : '23:00'

  return {
    action: 'store',
    label: '充電・蓄電推奨',
    headline: `今夜充電を推奨 ☀️  明日の収益最大化`,
    reason: `天気予報によると明日は${weatherCodeToSimple(weather.solar.mainWeatherCode)}（発電量予測${weather.solar.tomorrowKwh}kWh）。今夜オフピーク時間帯に安値電力（¥${buyPrice}/kWh）で${chargeNeeded.toFixed(1)}kWhを充電し、明日のピーク時間帯に放電すると差額利益が見込めます。`,
    marketContext: `オフピーク単価: ¥${buyPrice}/kWh（${chargeStart}〜翌7:00）\n明日ピーク予測: ¥${jepx.peakPrice}/kWh（差額¥${Math.round(jepx.peakPrice - buyPrice)}/kWh）`,
    estimatedIncome: Math.max(0, netIncome),
    breakdown: [
      { label: `明日の売電収入（予測）`, amount: sellTomorrow, color: 'text-yellow-400' },
      { label: `充電コスト`, amount: -chargeCost, color: 'text-red-400' },
    ],
    confidence,
    urgency: currentHour >= 20 ? 'medium' : 'low',
    timeWindow: `${chargeStart}〜翌7:00に充電`,
    co2Benefit: Math.round(weather.solar.tomorrowKwh * CO2_FACTOR * 0.5 * 10) / 10,
    commands: [
      {
        device: 'battery',
        action: 'charge',
        params: {
          targetSoc: 95,
          startTime: chargeStart,
          endTime: '07:00',
        },
      },
    ],
  }
}

function buildHoldAction(
  jepx: JepxForecast,
  weather: WeatherForecast,
  state: EnergyState,
  currentSlot: number
): OptimizationAction {
  const solarSurplus = Math.round(weather.solar.todayKwh * 0.2 * jepx.avgPrice)
  const baselineIncome = Math.round(state.solarCapacity * 3.5)
  const totalIncome = solarSurplus + baselineIncome

  // 次のピーク時間帯を探す
  const remainingPrices = jepx.todayPrices.slice(currentSlot)
  const nextPeakSlot = remainingPrices.findIndex((p) => p.price > jepx.avgPrice * 1.3)
  const nextPeakTime = nextPeakSlot >= 0
    ? currentSlotToTime(currentSlot + nextPeakSlot)
    : '明日'

  return {
    action: 'hold',
    label: '現状維持推奨',
    headline: `現状維持が最適 ⏸️  市場待機モード`,
    reason: `市場価格は現在¥${jepx.currentPrice}/kWhで安定しており、大きな最適化余地がありません。蓄電池SOC${state.batterySoc}%を維持し、${nextPeakTime}以降の価格変動を待つことを推奨します。`,
    marketContext: `現在価格: ¥${jepx.currentPrice}/kWh（平均¥${jepx.avgPrice}/kWh）\n次のピーク予測: ${nextPeakTime}以降`,
    estimatedIncome: totalIncome,
    breakdown: [
      { label: '余剰太陽光売電（現状）', amount: solarSurplus, color: 'text-yellow-400' },
      { label: 'ベースライン収入', amount: baselineIncome, color: 'text-zinc-400' },
    ],
    confidence: 80,
    urgency: 'low',
    timeWindow: `${nextPeakTime}以降に再最適化`,
    co2Benefit: Math.round(weather.solar.todayKwh * CO2_FACTOR * 0.3 * 10) / 10,
    commands: [
      { device: 'battery', action: 'hold', params: { targetSoc: state.batterySoc } },
    ],
  }
}

// ---- ヘルパー ----

function currentSlotToTime(slot: number): string {
  const hour = Math.floor(slot / 2)
  const min = (slot % 2) * 30
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
}

function weatherCodeToSimple(code: number): string {
  if (code <= 1) return '快晴'
  if (code <= 3) return '晴れ'
  if (code <= 48) return '曇り'
  if (code <= 67) return '雨'
  return '荒天'
}
