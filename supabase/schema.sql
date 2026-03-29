-- ============================================================
-- PowerWallet — Supabase スキーマ
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

-- energy_logs テーブル
CREATE TABLE IF NOT EXISTS public.energy_logs (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logged_date  DATE        NOT NULL,
  source       TEXT        NOT NULL CHECK (source IN ('solar', 'battery', 'ev', 'grid')),
  kwh          NUMERIC(10, 2) NOT NULL CHECK (kwh >= 0),
  soc          INTEGER     CHECK (soc >= 0 AND soc <= 100),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date
  ON public.energy_logs (user_id, logged_date DESC);

CREATE INDEX IF NOT EXISTS idx_energy_logs_source
  ON public.energy_logs (user_id, source);

-- ============================================================
-- Row Level Security (RLS) — 各ユーザーが自分のデータだけアクセス可能
-- ============================================================
ALTER TABLE public.energy_logs ENABLE ROW LEVEL SECURITY;

-- 自分のレコードのみ SELECT 可能
CREATE POLICY "users_select_own_logs"
  ON public.energy_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分の user_id でのみ INSERT 可能
CREATE POLICY "users_insert_own_logs"
  ON public.energy_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のレコードのみ UPDATE 可能
CREATE POLICY "users_update_own_logs"
  ON public.energy_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 自分のレコードのみ DELETE 可能
CREATE POLICY "users_delete_own_logs"
  ON public.energy_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- サンプルデータ（動作確認用 — オプション）
-- ※ 実際のユーザーIDに置き換えてください
-- ============================================================
-- INSERT INTO public.energy_logs (user_id, logged_date, source, kwh, soc, notes)
-- VALUES
--   ('<your-user-id>', '2026-03-26', 'solar',   12.4, NULL, '快晴'),
--   ('<your-user-id>', '2026-03-26', 'battery',  8.6,   72, NULL),
--   ('<your-user-id>', '2026-03-26', 'ev',       32.0,  45, NULL),
--   ('<your-user-id>', '2026-03-26', 'grid',      8.2, NULL, NULL),
--   ('<your-user-id>', '2026-03-25', 'solar',    10.1, NULL, '曇り'),
--   ('<your-user-id>', '2026-03-25', 'battery',   6.2,  55, NULL);
