-- ================================================================
-- PowerWallet — Migration: ユーザープロフィール・設備情報
-- 2026-03-31
-- ================================================================

-- ----------------------------------------------------------------
-- user_profiles テーブル
-- 蓄電池・太陽光・EV容量、所在地、電力契約情報を保存
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT        CHECK (char_length(display_name) <= 50),
  -- 設備容量
  battery_capacity  DECIMAL(6,1) CHECK (battery_capacity BETWEEN 0 AND 200),
  solar_capacity    DECIMAL(6,1) CHECK (solar_capacity BETWEEN 0 AND 100),
  ev_capacity       DECIMAL(6,1) CHECK (ev_capacity BETWEEN 0 AND 200),
  -- 所在地（Open-Meteo天気API・VPPエリア判定に使用）
  latitude          DECIMAL(8,5) CHECK (latitude BETWEEN 24 AND 46),
  longitude         DECIMAL(8,5) CHECK (longitude BETWEEN 122 AND 154),
  prefecture        TEXT,
  -- 電力契約
  utility_company   TEXT,
  tariff_plan       TEXT,
  -- タイムスタンプ
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: 自分のプロフィールのみ参照・操作可
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_all_own"
  ON user_profiles FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
  ON user_profiles(user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON user_profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
