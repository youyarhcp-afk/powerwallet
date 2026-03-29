export type EnergySourceType = 'solar' | 'battery' | 'ev' | 'grid'

export interface EnergyReading {
  id: string
  date: string
  source: EnergySourceType
  kwh: number
  soc?: number
  notes?: string
  createdAt: string
}

export interface VPPSimulation {
  monthlyIncome: number
  annualIncome: number
  co2Saved: number
  sessionsPerMonth: number
}

export interface OptimizationSuggestion {
  action: 'sell' | 'store' | 'charge' | 'vpp' | 'hold'
  label: string
  reason: string
  estimatedIncome: number
  confidence: number
  urgency: 'low' | 'medium' | 'high'
}
