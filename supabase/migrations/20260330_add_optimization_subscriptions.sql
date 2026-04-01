-- ================================================================
-- PowerWallet — Migration: AI最適化コマンド + サブスクリプション
-- 2026-03-30
-- ================================================================

-- ----------------------------------------------------------------
-- 1. optimization_commands テーブル
--    AIが生成した制御コマンドを保存（Phase 2でIoT連携）
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS optimization_commands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action          TEXT NOT NULL CHECK (action IN ('sell', 'vpp', 'store', 'hold')),
  estimated_income INTEGER NOT NULL DEFAULT 0,
  confidence      INTEGER NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  commands        JSONB NOT NULL DEFAULT '[]',
  jepx_price      DECIMAL(10, 2),
  weather_summary TEXT,
  executed        BOOLEAN NOT NULL DEFAULT FALSE,
  executed_at     TIMESTAMPTZ,
  actual_income   INTEGER,           -- Phase 2: 実際の収入（円）
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: 自分のコマンドのみ参照・操作可
ALTER TABLE optimization_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "optimization_commands_select_own"
  ON optimization_commands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "optimization_commands_insert_own"
  ON optimization_commands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "optimization_commands_update_own"
  ON optimization_commands FOR UPDATE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_opt_commands_user_created
  ON optimization_commands(user_id, created_at DESC);

-- ----------------------------------------------------------------
-- 2. subscriptions テーブル
--    Stripeサブスクリプション状態を管理
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Stripe IDs
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id       TEXT,
  -- プラン
  plan                  TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'pro', 'premium')),
  status                TEXT NOT NULL DEFAULT 'inactive'
                          CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  -- 期間
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT FALSE,
  -- メタデータ
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ユーザーごとに1レコードのみ（upsert用）
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------
-- 3. 新規ユーザー登録時に free プランを自動作成する関数
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users への INSERT トリガー
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- 既存ユーザーへの free プランを一括付与
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'free', 'active'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
