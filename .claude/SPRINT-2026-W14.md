# Sprint Week 14（2026-03-30 〜 04-12）— チーム起動スプリント

> VPP低圧解禁（4/1）直後に乗る。全エージェントが並列で動く最初の2週間。

---

## 🚀 全役割の初期タスク割り当て

### 並列実行マップ

```
Week 1 (3/30-4/5)                    Week 2 (4/6-4/12)
┌─────────────────────────┐          ┌─────────────────────────┐
│ CTO                     │          │ CTO                     │
│ ├ LP実装（app/page.tsx）│          │ ├ LP本番デプロイ        │
│ ├ OGP/meta設定          │          │ ├ user_profilesテーブル │
│ └ メール収集API          │          │ └ エラーモニタリング導入│
├─────────────────────────┤          ├─────────────────────────┤
│ Product Designer        │          │ Product Designer        │
│ ├ LP UIデザイン仕様     │          │ ├ ダッシュボードUI改善  │
│ ├ コピーライティング    │          │ └ オンボーディング設計  │
│ └ OGP画像設計           │          │                         │
├─────────────────────────┤          ├─────────────────────────┤
│ Growth Lead             │          │ Growth Lead             │
│ ├ X アカウント開設      │          │ ├ VPP解禁記事（note）  │
│ ├ SEOキーワード戦略     │          │ ├ 初期ユーザー5人DM    │
│ └ コンテンツカレンダー  │          │ └ Google Search Console │
├─────────────────────────┤          ├─────────────────────────┤
│ Energy Policy Expert    │          │ Energy Policy Expert    │
│ ├ VPP低圧解禁の速報分析│          │ ├ 弁護士初回相談準備    │
│ ├ アグリゲーター要件調査│          │ └ AI提案の法的整理     │
│ └ 利用規約ドラフト      │          │                         │
├─────────────────────────┤          ├─────────────────────────┤
│ AI Engineer             │          │ AI Engineer             │
│ ├ EREB公開データ調査    │          │ ├ 天気予報API連携PoC   │
│ ├ /api/optimize設計書   │          │ └ プロンプトv1作成     │
│ └ 現行モックの分析      │          │                         │
├─────────────────────────┤          ├─────────────────────────┤
│ Finance Strategist      │          │ Finance Strategist      │
│ ├ 12ヶ月財務モデルv1    │          │ ├ 補助金候補リスト     │
│ ├ コスト構造の確定      │          │ └ 投資家ターゲット10社 │
│ └ ランウェイ計算        │          │                         │
├─────────────────────────┤          ├─────────────────────────┤
│ Blockchain Architect    │          │ Blockchain Architect    │
│ └ トークン設計書v0      │          │ └ 法的リスク事前整理   │
│   （Phase 3準備のみ）   │          │   （Energy Policyと連携）│
└─────────────────────────┘          └─────────────────────────┘
```

---

## 🏆 直近2週間 優先タスク Top 5

### #1 ランディングページ（LP）の設計・実装・公開
**担当**: Product Designer → CTO（実装）→ Growth Lead（コピー監修）
**期限**: 2026年4月7日（月曜日）
**依存関係**: Product Designerのデザイン仕様 → CTOの実装 → Growth Leadの最終確認

**タスク分解**:
| # | サブタスク | 担当 | 期限 |
|---|---|---|---|
| 1-1 | LPワイヤーフレーム + コピー案 | Product Designer | 4/1 |
| 1-2 | OGP画像・ファビコン作成 | Product Designer | 4/2 |
| 1-3 | `app/page.tsx` 実装 + メール収集フォーム | CTO | 4/4 |
| 1-4 | SEOメタタグ・サイトマップ・robots.txt | CTO | 4/5 |
| 1-5 | コピー最終チェック + X初投稿 | Growth Lead | 4/7 |

**完了条件**:
- powerwallet.jp（or powerwallet-taupe.vercel.app）でLP表示
- メール収集 → Supabase `waitlist` テーブルに保存
- OGP画像がX・LINEで正しく表示される
- Google Search Consoleにインデックスリクエスト送信済み

**📦 アウトプット形式（具体的な成果物）**:
| 成果物 | ファイルパス/場所 | 形式 |
|---|---|---|
| LPページ本体 | `app/page.tsx` + 関連コンポーネント | TSX (React Server Component) |
| waitlistテーブル | Supabase `public.waitlist` | SQL: id, email, source, created_at |
| waitlist API | `app/api/waitlist/route.ts` | POST endpoint (JSON) |
| OGP画像 | `public/og-image.png` (1200x630) | PNG |
| サイトマップ | `app/sitemap.ts` | Next.js dynamic sitemap |
| robots.txt | `app/robots.ts` | Next.js dynamic robots |
| LPデザイン仕様書 | `.claude/outputs/lp-design-spec-v1.md` | Markdown |

**✅ 成功定義（これを満たしたら「成功」）**:
```
必須 (Must):
  □ LPがpowerwallet.jpで表示される
  □ メール入力 → Supabase保存 → 完了メッセージ表示
  □ モバイル（iPhone SE〜）で崩れない
  □ OGPがX/LINEプレビューで正しく表示
  □ Lighthouse Performance 80以上

望ましい (Should):
  □ LP公開後1週間でwaitlist登録 10件以上
  □ 「VPP」「蓄電池 収益」でGoogle検索可能
  □ CTAボタンのクリック率 5%以上

理想 (Could):
  □ LP公開後のXシェア 20件以上
  □ note記事からのLP流入が確認できる
```

---

### #2 VPP低圧解禁の規制分析と利用規約ドラフト
**担当**: Energy Policy Expert
**期限**: 2026年4月10日（木曜日）
**依存関係**: なし（単独で即時開始可能）

**タスク分解**:
| # | サブタスク | 担当 | 期限 |
|---|---|---|---|
| 2-1 | 4/1解禁の省令・告示・ガイドラインの速報収集 | Energy Policy Expert | 4/2 |
| 2-2 | アグリゲーター登録要件のチェックリスト作成 | Energy Policy Expert | 4/5 |
| 2-3 | 利用規約ドラフト（AI提案免責事項含む） | Energy Policy Expert | 4/8 |
| 2-4 | プライバシーポリシードラフト | Energy Policy Expert | 4/10 |

**完了条件**:
- VPP解禁速報レポート（A4 2ページ相当）完成
- 利用規約・プライバシーポリシーのドラフト完成（弁護士レビュー前）
- 弁護士初回相談のアジェンダ確定

**📦 アウトプット形式（具体的な成果物）**:
| 成果物 | ファイルパス/場所 | 形式 |
|---|---|---|
| VPP解禁速報レポート | `.claude/outputs/report-vpp-regulation-20260401.md` | Markdown (A4 2ページ相当) |
| アグリゲーター登録要件チェックリスト | `.claude/outputs/checklist-aggregator-registration.md` | Yes/No チェックリスト |
| 利用規約ドラフト | `.claude/outputs/legal-terms-of-service-v1.md` | Markdown (弁護士レビュー前) |
| プライバシーポリシードラフト | `.claude/outputs/legal-privacy-policy-v1.md` | Markdown (弁護士レビュー前) |
| 弁護士相談アジェンダ | `.claude/outputs/legal-lawyer-agenda-v1.md` | Markdown (質問リスト) |

**✅ 成功定義（これを満たしたら「成功」）**:
```
必須 (Must):
  □ VPP解禁日(4/1)の省令・告示・ガイドラインが網羅的に収集されている
  □ アグリゲーター登録に必要な要件が「資本金・技術・書類」の3軸で整理
  □ 利用規約に「AI提案は情報提供であり投資助言ではない」の免責条項が含まれる
  □ 全文書に「弁護士レビュー前」の明示あり
  □ 弁護士に聞くべき質問が優先順位付きで5つ以上リスト化

望ましい (Should):
  □ 「PowerWalletが合法的にできること/できないこと」が明確な境界線で分類
  □ Energy Policy Expert → CTO への技術要件の引き継ぎ3点セットが完成
  □ 資金決済法・金融商品取引法のPWATTトークン初期リスク整理

理想 (Could):
  □ 弁護士事務所の候補3社リストアップ（エネルギー法専門）
  □ OCCTO（電力広域的運営推進機関）への問い合わせドラフト
```

---

### #3 12ヶ月財務モデルとランウェイ計算
**担当**: Finance Strategist
**期限**: 2026年4月8日（火曜日）
**依存関係**: CTOからインフラコスト情報の共有

**タスク分解**:
| # | サブタスク | 担当 | 期限 |
|---|---|---|---|
| 3-1 | Supabase/Vercel/API 月次コスト見積もり | CTO → Finance | 4/1 |
| 3-2 | ユーザー成長モデル（3シナリオ） | Finance Strategist | 4/4 |
| 3-3 | MRR予測（フリーミアム転換率想定） | Finance Strategist | 4/6 |
| 3-4 | ランウェイ計算 + ブレークイーブン分析 | Finance Strategist | 4/8 |

**完了条件**:
- 12ヶ月P/Lモデル（楽観/基本/悲観の3シナリオ）
- 月次バーンレート確定
- 「ユーザーX人でブレークイーブン」の数字が明確

**📦 アウトプット形式（具体的な成果物）**:
| 成果物 | ファイルパス/場所 | 形式 |
|---|---|---|
| 12ヶ月財務モデル | `.claude/outputs/finance-model-12month-v1.md` | Markdown表 (将来Excel化) |
| コスト構造表 | `.claude/outputs/finance-cost-structure-v1.md` | 月次コスト内訳表 |
| ランウェイ計算 | 上記財務モデルに含む | 手元資金 ÷ 月次バーンレート |
| ブレークイーブン分析 | 上記財務モデルに含む | ユーザー数 × ARPU = 月次コスト の解 |
| 補助金候補リスト | `.claude/outputs/finance-subsidy-candidates.md` | リスト (名称・金額・期限・適合度) |

**✅ 成功定義（これを満たしたら「成功」）**:
```
必須 (Must):
  □ 楽観/基本/悲観の3シナリオで12ヶ月の月次P/Lが作成されている
  □ 各前提条件（ユーザー成長率・チャーン率・ARPU・プレミアム転換率）が明示
  □ 月次バーンレートが「サービス費 + 人件費 + 法務 + その他」の内訳付き
  □ 「プレミアム¥980/月 × N人 + VPP収益シェア = ブレークイーブン」のNが算出
  □ 現在のランウェイが「Xヶ月」と明確

望ましい (Should):
  □ Supabase/Vercel/OpenAIの実際のプラン料金を根拠に使っている
  □ NEDO・GX推進等の補助金で申請期限3ヶ月以内のものが特定済み
  □ 投資家に見せられる品質（出典明記・前提条件の透明性）

理想 (Could):
  □ Series Seed の調達額・バリュエーション・希薄化率の初期試算
  □ VC10社のターゲットリスト（エネルギー/気候tech特化ファンド）
```

---

### #4 SNS・コンテンツマーケティング開始
**担当**: Growth Lead + CEO
**期限**: 2026年4月5日（土曜日）— X初投稿
**依存関係**: LP完成と連動（LP URLをSNSに掲載）

**タスク分解**:
| # | サブタスク | 担当 | 期限 |
|---|---|---|---|
| 4-1 | X アカウント開設 + プロフィール設定 | Growth Lead | 3/31 |
| 4-2 | VPP解禁日の投稿5本を事前作成 | Growth Lead | 3/31 |
| 4-3 | note連載第1回ドラフト | Growth Lead | 4/3 |
| 4-4 | 太陽光コミュニティリサーチ（投稿先3選） | Growth Lead | 4/5 |
| 4-5 | CEO個人アカウントから創業ストーリー投稿 | CEO | 4/5 |

**完了条件**:
- X アカウント運用開始（最低5投稿）
- note記事第1回が下書き完成
- 太陽光フォーラム等へのアプローチ先3つ特定

**📦 アウトプット形式（具体的な成果物）**:
| 成果物 | ファイルパス/場所 | 形式 |
|---|---|---|
| X投稿文5本 | `.claude/outputs/growth-x-posts-week1.md` | 投稿文テキスト (各280文字以内) |
| コンテンツカレンダー(4月) | `.claude/outputs/growth-content-calendar-april.md` | 日付×チャネル×内容の表 |
| SEOキーワード戦略 | `.claude/outputs/growth-seo-keywords-v1.md` | キーワード×検索ボリューム×難易度 |
| note第1回ドラフト | `.claude/outputs/growth-note-article-01-draft.md` | Markdown (2000〜3000文字) |
| コミュニティアプローチ先 | `.claude/outputs/growth-community-targets.md` | 3チャネル×アプローチ方法 |

**✅ 成功定義（これを満たしたら「成功」）**:
```
必須 (Must):
  □ Xアカウントが開設され、プロフィール・ヘッダーが設定済み
  □ 4/1（VPP解禁日）に最低1本の投稿が予定されている
  □ 投稿5本の下書きが完成（VPP解禁・PowerWallet紹介・教育系 等）
  □ note第1回の下書きが完成（テーマ: VPP解禁で何が変わるか）
  □ SEOで狙うキーワード候補が最低10個リスト化

望ましい (Should):
  □ 4月のコンテンツカレンダーが週単位で計画されている
  □ 太陽光コミュニティ3箇所が特定され、アプローチ方法が決まっている
  □ CEO個人アカウントの創業ストーリー投稿が下書き完成

理想 (Could):
  □ LP公開前の「ティザー投稿」戦略が設計されている
  □ インフルエンサー（太陽光/蓄電池系）候補5名のリストアップ
  □ Xフォロワー100人獲得の30日計画
```

---

### #5 AI最適化エンドポイントの設計書作成
**担当**: AI Engineer + CTO
**期限**: 2026年4月10日（木曜日）
**依存関係**: EREB公開データの調査結果

**タスク分解**:
| # | サブタスク | 担当 | 期限 |
|---|---|---|---|
| 5-1 | EREB・JEPX公開データのアクセス方法調査 | AI Engineer | 4/2 |
| 5-2 | OpenMeteo天気予報APIの評価 | AI Engineer | 4/4 |
| 5-3 | `/api/optimize` エンドポイント仕様書 | AI Engineer + CTO | 4/7 |
| 5-4 | プロンプトテンプレートv1（Claude API用） | AI Engineer | 4/10 |

**完了条件**:
- APIリクエスト/レスポンスのJSON仕様が確定
- 利用するデータソース一覧が確定
- プロンプトテンプレートのv1が`skills/analysis/`に格納

**📦 アウトプット形式（具体的な成果物）**:
| 成果物 | ファイルパス/場所 | 形式 |
|---|---|---|
| データソース評価レポート | `.claude/outputs/ai-datasource-evaluation.md` | 各ソース×アクセス方法×コスト×精度 |
| `/api/optimize` 設計書 | `.claude/outputs/ai-optimize-endpoint-spec-v1.md` | OpenAPI風の仕様書 (Request/Response/Error) |
| プロンプトテンプレートv1 | `.claude/skills/analysis/optimize-prompt-v1.md` | Claude API用プロンプト (system/user/response形式) |
| 天気予報API評価 | `.claude/outputs/ai-weather-api-evaluation.md` | 比較表 (OpenMeteo等) |

**✅ 成功定義（これを満たしたら「成功」）**:
```
必須 (Must):
  □ /api/optimize のリクエストJSON仕様が確定:
    入力: { user_id, battery_soc, solar_kw, location, date }
    出力: { recommendation, confidence, reasoning, estimated_revenue }
  □ 利用するデータソースが確定（EREB/JEPX/天気予報の具体的なURL・API）
  □ 各データソースのアクセス方法が判明（API or スクレイピング or ファイルDL）
  □ Claude API用のプロンプトテンプレートv1が作成済み
  □ API呼び出しの月額コスト見積もりがFinance Strategistに共有済み

望ましい (Should):
  □ エンドポイントの認証・レートリミット設計が含まれている
  □ キャッシュ戦略（同一ユーザー/同日は再計算不要等）が設計されている
  □ CTO → AI Engineer の引き継ぎ3点セットが完成（DB側の準備事項）
  □ Energy Policy Expert確認: AI提案の表現が法的に安全

理想 (Could):
  □ EREB価格データの取得スクリプト（Python）のPoC
  □ プロンプトの精度評価基準（テストケース5つ以上）
  □ Phase 2実装のロードマップ（4月〜9月の機能展開計画）
```

---

## 🔗 エージェント間依存関係マップ

```
Product Designer ──(デザイン仕様)──→ CTO ──(実装)──→ Growth Lead(公開)
                                       ↑
Energy Policy Expert ──(規制要件)───────┘
                     ──(法的レビュー)──→ Growth Lead(コピー確認)

AI Engineer ──(API仕様)──→ CTO(エンドポイント実装)
            ──(データ要件)──→ CTO(DB設計)

Finance Strategist ←──(コスト情報)── CTO
                   ──(KPI定義)──→ Growth Lead(効果測定)

Blockchain Architect ──(法的論点)──→ Energy Policy Expert(リスク評価)
```

**クリティカルパス**: Product Designer → CTO → Growth Lead（LP公開フロー）

---

## 📏 週次レビュー体制

| 曜日 | アクション | 責任者 |
|---|---|---|
| 月曜 | 週次スプリント開始・タスク確認 | CEO |
| 水曜 | 中間チェック（ブロッカーの早期発見） | CEO |
| 金曜 | 週次レビュー・成果物確認・実績ログ更新 | CEO + 全エージェント |
