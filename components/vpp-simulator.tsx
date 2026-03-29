'use client'

import { useState } from 'react'
import { Zap, Leaf, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimulatorConfig {
  batteryCapacity: number // kWh
  solarCapacity: number   // kW
  evBattery: number       // kWh
}

function calculateVppIncome(config: SimulatorConfig) {
  // Based on EREB market data and typical VPP participation rates
  const vppRatePerKwh = 8       // ¥/kWh average VPP adjustment rate
  const participationRate = 0.6 // 60% participation rate
  const sessionsPerMonth = 15   // Average DR sessions per month

  const totalCapacity = config.batteryCapacity + config.evBattery * 0.4
  const avgDischarge = totalCapacity * 0.35

  const vppIncome = Math.round(
    vppRatePerKwh * avgDischarge * sessionsPerMonth * participationRate
  )
  const solarBonus = Math.round(config.solarCapacity * 95) // ¥/kW FIT/余剰

  const monthly = vppIncome + solarBonus
  const annual = monthly * 12
  const co2Saved = Math.round((config.solarCapacity * 1200 * 0.42) / 1000 * 10) / 10 // t-CO2

  return { monthly, annual, co2Saved, vppIncome, solarBonus }
}

interface SliderProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}

function Slider({ label, unit, value, min, max, step = 1, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <label className="text-zinc-400">{label}</label>
        <span className="text-white font-medium tabular-nums">
          {value}
          <span className="text-zinc-500 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 appearance-none rounded-full bg-zinc-800 outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e ${pct}%, #27272a ${pct}%)`,
          }}
        />
      </div>
    </div>
  )
}

export function VppSimulator() {
  const [config, setConfig] = useState<SimulatorConfig>({
    batteryCapacity: 10,
    solarCapacity: 5.5,
    evBattery: 40,
  })

  const result = calculateVppIncome(config)

  return (
    <div className="space-y-5">
      {/* Results */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
          <div className="text-xl font-bold text-green-400 tabular-nums">
            ¥{result.monthly.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">月収入予想</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
          <div className="text-xl font-bold text-blue-400 tabular-nums">
            ¥{Math.round(result.annual / 10000)}万
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">年収入予想</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
          <div className="text-xl font-bold text-emerald-400">
            {result.co2Saved}
            <span className="text-xs">t</span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">CO₂削減/年</div>
        </div>
      </div>

      {/* Income breakdown */}
      <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 space-y-2 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>⚡ VPP調整力収入</span>
          <span className="text-white">¥{result.vppIncome.toLocaleString()}/月</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>☀️ 太陽光余剰・FIT</span>
          <span className="text-white">¥{result.solarBonus.toLocaleString()}/月</span>
        </div>
        <div className="border-t border-zinc-700 pt-2 flex justify-between font-medium">
          <span className="text-zinc-300">合計</span>
          <span className="text-green-400">¥{result.monthly.toLocaleString()}/月</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <Slider
          label="🔋 蓄電池容量"
          unit="kWh"
          value={config.batteryCapacity}
          min={0}
          max={30}
          onChange={(v) => setConfig((c) => ({ ...c, batteryCapacity: v }))}
        />
        <Slider
          label="☀️ 太陽光パネル容量"
          unit="kW"
          value={config.solarCapacity}
          min={0}
          max={20}
          step={0.5}
          onChange={(v) => setConfig((c) => ({ ...c, solarCapacity: v }))}
        />
        <Slider
          label="🚗 EV電池容量"
          unit="kWh"
          value={config.evBattery}
          min={0}
          max={100}
          onChange={(v) => setConfig((c) => ({ ...c, evBattery: v }))}
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/15">
        <Zap className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="text-green-400 font-medium">2026年4月 低圧VPP解禁後</span>の試算。
          EREB市場参加率60%・調整力平均単価¥8/kWhに基づく概算です。
        </p>
      </div>
    </div>
  )
}
