# Skills フォルダ — PowerWallet AI仮想チーム

## このフォルダの目的

各エージェントが繰り返し使う「型化されたスキル」を格納する場所。
スキルは「手順書」ではなく「使い回せるレシピ」。
一度作れば、次回からエージェントが参照して高速・高品質に実行できる。

---

## スキルの種類と格納方法

```
.claude/skills/
├── README.md              # このファイル
├── development/           # CTO・AI Engineer向け
│   ├── supabase-rls.md    # RLSポリシー設計の型
│   ├── api-endpoint.md    # APIエンドポイント実装パターン
│   └── component.md       # Reactコンポーネント設計パターン
├── analysis/              # AI Engineer・Finance向け
│   ├── energy-data.md     # エネルギーデータ分析の手順
│   └── kpi-report.md      # KPIレポート生成の手順
├── legal/                 # Energy Policy Expert向け
│   ├── risk-assessment.md # 法的リスク評価の型
│   └── regulation-check.md # 規制チェックリスト
└── growth/                # Growth Lead向け
    ├── content-calendar.md # コンテンツ投稿カレンダー管理
    └── user-interview.md   # ユーザーインタビューの型
```

---

## スキルの追加方法

新しいスキルを追加するときは以下の形式で作成する：

```markdown
# スキル名

## 目的
このスキルが解決する問題を1〜2文で

## 適用条件
- いつ使うか
- 前提条件（必要な情報・ツール）

## 手順
1. ステップ1
2. ステップ2
...

## テンプレート / サンプルコード
[再利用可能なコード・文章・表]

## 注意事項・既知の問題
- 気をつけるべきこと

## 更新履歴
- [日付] [更新者] [変更内容]
```

---

## 既存スキルのクイックリファレンス

### 開発系スキル（CTO）

**Supabase RLSポリシー設計**
```sql
-- パターン: 自分のデータだけ読み書きできる
CREATE POLICY "Users can only access own data"
ON [テーブル名]
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Next.js APIルート（サーバー認証付き）**
```typescript
// app/api/[endpoint]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // 処理
}
```

**Tailwind v4 注意事項**
```css
/* ❌ 古い書き方 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ v4の書き方 */
@import "tailwindcss";

@theme {
  --color-accent: #22c55e;
  --font-sans: 'Geist Sans', sans-serif;
}
```

---

### 分析系スキル（AI Engineer）

**energy_logs 基本クエリパターン**
```sql
-- 月次集計
SELECT
  DATE_TRUNC('month', logged_date) as month,
  SUM(kwh) as total_kwh,
  source
FROM energy_logs
WHERE user_id = auth.uid()
GROUP BY month, source
ORDER BY month DESC;

-- 直近7日の日次推移
SELECT
  logged_date,
  SUM(CASE WHEN source = 'solar' THEN kwh ELSE 0 END) as solar_kwh,
  SUM(CASE WHEN source = 'battery' THEN kwh ELSE 0 END) as battery_kwh,
  AVG(soc) as avg_soc
FROM energy_logs
WHERE user_id = auth.uid()
  AND logged_date >= CURRENT_DATE - 7
GROUP BY logged_date
ORDER BY logged_date;
```

---

### 法的スキル（Energy Policy Expert）

**リスク評価の標準フレーム**
```
1. 該当する可能性がある法令を列挙
2. 「該当する」場合の義務・制限を確認
3. 「該当しない」ための設計変更案を検討
4. 弁護士照会が必要なレベルか判断
5. CEOへのエスカレーション要否を判断
```

---

### グロース系スキル（Growth Lead）

**ユーザーインタビューの基本フロー（30分）**
```
00:00-05:00 アイスブレイク（自己紹介・日常の電力利用について）
05:00-15:00 現在の課題（太陽光・蓄電池の管理でどんな不満が？）
15:00-25:00 プロダクト体験（実際にPowerWalletを見せて反応を観察）
25:00-30:00 まとめ（一番改善してほしい機能は？友人に勧めるか？）

記録: 発言をそのまま記録 → 解釈は後で
```

---

## スキルの評価・改善

各スキルを使ったら以下を記録して改善に活かす：

| スキル名 | 使用日 | 使用者 | 効果 | 改善点 |
|---|---|---|---|---|
| [スキル名] | [日付] | [エージェント] | [良かった点] | [改善すべき点] |
