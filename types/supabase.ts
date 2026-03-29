// Supabase Database 型定義
// npx supabase gen types typescript --project-id <id> で自動生成も可能

export type EnergySource = 'solar' | 'battery' | 'ev' | 'grid'

export interface EnergyLog {
  id: string
  user_id: string
  logged_date: string       // DATE: "2026-03-26"
  source: EnergySource
  kwh: number
  soc: number | null        // State of Charge (%)
  notes: string | null
  created_at: string        // TIMESTAMPTZ
}

export type Database = {
  // @supabase/supabase-js v2.100+ が内部で使用するメタフィールド
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      energy_logs: {
        Row: EnergyLog
        Insert: {
          id?: string
          user_id: string
          logged_date: string
          source: EnergySource
          kwh: number
          soc?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          logged_date?: string
          source?: EnergySource
          kwh?: number
          soc?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      energy_source: EnergySource
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
