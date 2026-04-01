-- ================================================================
-- PowerWallet — Migration: energy_logs パフォーマンス最適化
-- 2026-03-31
-- ----------------------------------------------------------------
-- ユーザーが増えてもダッシュボード・履歴ページが高速に動作するよう
-- 複合インデックスを追加する
-- ================================================================

-- (user_id, logged_date DESC): ダッシュボード・履歴ページの主要クエリ
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date
  ON energy_logs(user_id, logged_date DESC);

-- (user_id, source): ソース別集計クエリ（太陽光だけ抽出など）
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_source
  ON energy_logs(user_id, source);

-- (user_id, logged_date, source): 月別・ソース別の複合集計
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date_source
  ON energy_logs(user_id, logged_date DESC, source);
