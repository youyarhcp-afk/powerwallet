/**
 * 天気予報・太陽光発電予測サービス
 *
 * Open-Meteo JMA API（無料・APIキー不要）を使用
 * - JMA（気象庁）GSM/MSMモデルで日本全国の精度が高い
 * - Himawari-8/9衛星ベースの日射量データ
 *
 * 参考: https://open-meteo.com/en/docs/jma-api
 */

export interface HourlyWeather {
  /** 時刻（ISO 8601） */
  time: string
  /** 気温（℃） */
  temperature: number
  /** 短波放射量（W/m²） */
  shortwave_radiation: number
  /** 直達日射量（W/m²） */
  direct_radiation: number
  /** 散乱日射量（W/m²） */
  diffuse_radiation: number
  /** 天気コード（WMO） */
  weather_code: number
  /** 雲量（%） */
  cloud_cover: number
  /** 降水量（mm） */
  precipitation: number
  /** 風速（m/s） */
  wind_speed: number
}

export interface SolarForecast {
  /** 当日の発電予測（kWh） */
  todayKwh: number
  /** 翌日の発電予測（kWh） */
  tomorrowKwh: number
  /** 当日のピーク発電時刻 */
  peakHour: number
  /** 日射量合計（kWh/m²） */
  totalIrradiance: number
  /** 天気概要 */
  weatherSummary: string
  /** 天気コード（主要） */
  mainWeatherCode: number
}

export interface WeatherForecast {
  /** 取得日時 */
  fetchedAt: string
  /** 地点（緯度・経度） */
  location: { lat: number; lon: number; name: string }
  /** 時間別天気データ（当日+翌日） */
  hourly: HourlyWeather[]
  /** 太陽光発電予測 */
  solar: SolarForecast
  /** データソース */
  source: 'open-meteo' | 'fallback'
}

/**
 * WMO天気コードを日本語に変換
 */
function weatherCodeToText(code: number): string {
  if (code === 0) return '快晴'
  if (code <= 3) return '晴れ'
  if (code <= 48) return '曇り'
  if (code <= 57) return '霧雨'
  if (code <= 67) return '雨'
  if (code <= 77) return '雪'
  if (code <= 82) return 'にわか雨'
  if (code <= 86) return 'にわか雪'
  if (code >= 95) return '雷雨'
  return '不明'
}

/**
 * 日射量から太陽光パネルの発電量を推定
 *
 * @param irradianceWm2 短波放射量の時間別配列（W/m²）
 * @param panelCapacityKw パネル定格出力（kW）
 * @param efficiency システム効率（デフォルト: 0.85 = パネル劣化+パワコン損失）
 * @returns 予測発電量（kWh）
 */
function estimateSolarGeneration(
  irradianceWm2: number[],
  panelCapacityKw: number = 5.5,
  efficiency: number = 0.85
): number {
  // 1kWパネルは1000W/m²の日射で1kW発電
  // 1時間あたりのkWhに変換
  const totalKwh = irradianceWm2.reduce((sum, irr) => {
    const hourlyKwh = (irr / 1000) * panelCapacityKw * efficiency
    return sum + hourlyKwh
  }, 0)
  return Math.round(totalKwh * 10) / 10
}

/**
 * Open-Meteo JMA APIから天気予報を取得
 *
 * @param lat 緯度（デフォルト: 東京 35.6762）
 * @param lon 経度（デフォルト: 東京 139.6503）
 * @param panelCapacityKw 太陽光パネル容量（kW）
 */
export async function fetchWeatherForecast(
  lat: number = 35.6762,
  lon: number = 139.6503,
  panelCapacityKw: number = 5.5
): Promise<WeatherForecast> {
  const now = new Date()

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: [
        'temperature_2m',
        'shortwave_radiation',
        'direct_radiation',
        'diffuse_radiation',
        'weather_code',
        'cloud_cover',
        'precipitation',
        'wind_speed_10m',
      ].join(','),
      timezone: 'Asia/Tokyo',
      forecast_days: '2',
      models: 'jma_seamless',
    })

    const res = await fetch(
      `https://api.open-meteo.com/v1/jma?${params.toString()}`,
      { next: { revalidate: 1800 } } // 30分キャッシュ
    )

    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status}`)
    }

    const data = await res.json()
    const h = data.hourly

    // 時間別データを構築
    const hourly: HourlyWeather[] = (h.time as string[]).map((time: string, i: number) => ({
      time,
      temperature: h.temperature_2m[i],
      shortwave_radiation: h.shortwave_radiation[i] ?? 0,
      direct_radiation: h.direct_radiation[i] ?? 0,
      diffuse_radiation: h.diffuse_radiation[i] ?? 0,
      weather_code: h.weather_code[i],
      cloud_cover: h.cloud_cover[i],
      precipitation: h.precipitation[i],
      wind_speed: h.wind_speed_10m[i],
    }))

    // 当日・翌日を分離
    const todayStr = now.toISOString().slice(0, 10)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)

    const todayHours = hourly.filter((h) => h.time.startsWith(todayStr))
    const tomorrowHours = hourly.filter((h) => h.time.startsWith(tomorrowStr))

    // 太陽光発電量推定
    const todayKwh = estimateSolarGeneration(
      todayHours.map((h) => h.shortwave_radiation),
      panelCapacityKw
    )
    const tomorrowKwh = estimateSolarGeneration(
      tomorrowHours.map((h) => h.shortwave_radiation),
      panelCapacityKw
    )

    // ピーク発電時刻
    const peakIdx = todayHours.reduce(
      (maxIdx, h, i, arr) => (h.shortwave_radiation > (arr[maxIdx]?.shortwave_radiation ?? 0) ? i : maxIdx),
      0
    )
    const peakHour = peakIdx

    // 日射量合計
    const totalIrradiance = Math.round(
      todayHours.reduce((s, h) => s + h.shortwave_radiation, 0) / 1000 * 10
    ) / 10

    // 主要天気コード（昼間の最頻値）
    const daytimeHours = todayHours.slice(6, 18)
    const codes = daytimeHours.map((h) => h.weather_code)
    const mainCode = codes.length > 0
      ? codes.sort((a, b) => codes.filter((c) => c === a).length - codes.filter((c) => c === b).length).pop() ?? 0
      : 0

    return {
      fetchedAt: now.toISOString(),
      location: { lat, lon, name: '東京' },
      hourly,
      solar: {
        todayKwh,
        tomorrowKwh,
        peakHour,
        totalIrradiance,
        weatherSummary: `今日: ${weatherCodeToText(mainCode)}（発電予測 ${todayKwh}kWh）/ 明日: 発電予測 ${tomorrowKwh}kWh`,
        mainWeatherCode: mainCode,
      },
      source: 'open-meteo',
    }
  } catch (error) {
    console.error('[WeatherService] Open-Meteo fetch failed, using fallback:', error)
    return generateFallbackForecast(now, panelCapacityKw)
  }
}

/**
 * API接続失敗時のフォールバック予測
 */
function generateFallbackForecast(now: Date, panelCapacityKw: number): WeatherForecast {
  const month = now.getMonth() + 1
  // 月別平均日射量から概算（東京のkWh/m²/day）
  const monthlyIrradiance: Record<number, number> = {
    1: 3.2, 2: 3.8, 3: 4.2, 4: 4.8, 5: 5.0, 6: 4.0,
    7: 4.5, 8: 5.0, 9: 4.0, 10: 3.5, 11: 3.2, 12: 3.0,
  }
  const dailyIrr = monthlyIrradiance[month] ?? 4.0

  const todayKwh = Math.round(dailyIrr * panelCapacityKw * 0.85 / 5.0 * 10) / 10
  const tomorrowKwh = Math.round(todayKwh * 0.95 * 10) / 10

  return {
    fetchedAt: now.toISOString(),
    location: { lat: 35.6762, lon: 139.6503, name: '東京（フォールバック）' },
    hourly: [],
    solar: {
      todayKwh,
      tomorrowKwh,
      peakHour: 12,
      totalIrradiance: dailyIrr,
      weatherSummary: `今日: 晴れ（予測 ${todayKwh}kWh）/ 明日: 予測 ${tomorrowKwh}kWh（統計ベース）`,
      mainWeatherCode: 1,
    },
    source: 'fallback',
  }
}
