-- ウェイトリストテーブル
-- LPからのメール登録を管理する

CREATE TABLE IF NOT EXISTS waitlist (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  source      text NOT NULL DEFAULT 'lp',
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);

-- RLS: 一般ユーザーは自分のメールのみ参照可（管理者は全件閲覧）
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- サービスロール（サーバーサイド）のみ書き込み可
CREATE POLICY "service_role_insert_waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- 管理者のみ読み取り可（一般ユーザーは非公開）
CREATE POLICY "admin_read_waitlist"
  ON waitlist FOR SELECT
  USING (auth.role() = 'service_role');
