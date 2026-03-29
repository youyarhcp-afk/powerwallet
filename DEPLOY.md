# PowerWallet — Vercel デプロイガイド

リポジトリ: https://github.com/youyarhcp-afk/powerwallet

---

## Step 1: GitHubへプッシュ

```bash
cd ~/powerwallet

# リモートを追加してプッシュ（初回のみ）
git remote add origin https://github.com/youyarhcp-afk/powerwallet.git
git branch -M main
git push -u origin main
```

> ⚠️ `.env.local` は `.gitignore` で除外済みなので絶対にコミットされません。

---

## Step 2: Vercel にデプロイ

### 2-1. Vercel にログイン
https://vercel.com にアクセスして GitHub アカウントでログイン。

### 2-2. プロジェクトをインポート
1. 「Add New...」→「Project」をクリック
2. `youyarhcp-afk/powerwallet` を選択して「Import」
3. Framework Preset: **Next.js**（自動検出される）
4. Root Directory: `./`（そのまま）

### 2-3. 環境変数を設定（重要！）
「Environment Variables」セクションに以下を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hbazcygggwuyjkfzqvpa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`（Supabase → Settings → API → anon public key） |

### 2-4. デプロイ実行
「Deploy」ボタンをクリック → 約2〜3分で完了。

デプロイ後のURLは `https://powerwallet-xxx.vercel.app` の形式。

---

## Step 3: Supabase の本番設定を更新

デプロイ完了後、Supabase Dashboard で設定を更新：

1. https://supabase.com/dashboard/project/hbazcygggwuyjkfzqvpa/auth/url-configuration を開く
2. **Site URL** を Vercel の URL に変更：
   ```
   https://powerwallet-xxx.vercel.app
   ```
3. **Redirect URLs** に追加（改行区切りで2行）：
   ```
   https://powerwallet-xxx.vercel.app/**
   https://powerwallet.jp/**
   ```
4. 「Save」をクリック

---

## Step 4: カスタムドメイン powerwallet.jp を設定

### 4-1. Vercel 側でドメイン追加
1. Vercel プロジェクト → 「Settings」→「Domains」
2. `powerwallet.jp` を入力して「Add」
3. Vercel が表示する DNS レコードをメモ：
   - `A レコード: @ → 76.76.21.21`
   - `CNAME レコード: www → cname.vercel-dns.com`

### 4-2. ドメインレジストラで DNS 設定
お名前.com / Google Domains / Cloudflare 等の DNS 設定画面で：

```
タイプ  : A
ホスト名: @（またはルート）
値      : 76.76.21.21

タイプ  : CNAME
ホスト名: www
値      : cname.vercel-dns.com
```

DNS 反映まで最大24時間（通常30分〜2時間）。

### 4-3. SSL 証明書
Vercel が自動で Let's Encrypt の SSL 証明書を発行します（5〜10分）。

### 4-4. Supabase の Site URL を最終更新
```
https://powerwallet.jp
```

---

## Step 5: デプロイ後の動作確認チェックリスト

- [ ] `https://powerwallet.jp` にアクセスできる
- [ ] `/login` でサインアップ / ログインができる
- [ ] `/dashboard` でデータが表示される
- [ ] データ入力 → ダッシュボードにリアルタイム反映される
- [ ] ログアウトが機能する
- [ ] モバイルでサイドバーが正常に動作する

---

## 環境変数まとめ

### ローカル開発（`~/powerwallet/.env.local`）
```env
NEXT_PUBLIC_SUPABASE_URL=https://hbazcygggwuyjkfzqvpa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（本物のキー）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel 本番環境
Vercel Dashboard → Settings → Environment Variables で設定：
```
NEXT_PUBLIC_SUPABASE_URL=https://hbazcygggwuyjkfzqvpa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（本物のキー）
```

---

## Supabase Realtime 有効化（未実施の場合）

Supabase SQL Editor で実行：
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_logs;
```

---

## トラブルシューティング

**ビルドエラーが出る場合**
```bash
cd ~/powerwallet && npm run build
```
エラーを確認してから push する。

**認証リダイレクトが失敗する場合**
Supabase → Authentication → URL Configuration の Site URL と Redirect URLs を確認。

**環境変数が読み込まれない場合**
Vercel → Settings → Environment Variables を確認後、Deployments → Redeploy で再デプロイ。
