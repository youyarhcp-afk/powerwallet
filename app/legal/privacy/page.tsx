import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'プライバシーポリシー — PowerWallet',
}

const UPDATED_AT = '2026年3月1日'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            トップページへ
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">プライバシーポリシー</h1>
          </div>
          <p className="text-sm text-zinc-500">最終更新: {UPDATED_AT}</p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <p className="text-zinc-400">
              PowerWallet（以下「当社」）は、ユーザーの個人情報の保護を重要な責務と考え、
              個人情報保護法その他の関連法令を遵守します。
              本ポリシーは当サービスにおける個人情報の取り扱いについて定めます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第1条（収集する情報）</h2>
            <p className="mb-3">当社は以下の情報を収集します。</p>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <p className="font-medium text-white text-xs mb-1">アカウント情報</p>
                <p className="text-zinc-400 text-xs">メールアドレス、表示名（任意）</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <p className="font-medium text-white text-xs mb-1">設備・所在地情報</p>
                <p className="text-zinc-400 text-xs">
                  蓄電池・太陽光パネル・EV容量、緯度・経度、都道府県、電力会社・契約プラン（任意）
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <p className="font-medium text-white text-xs mb-1">エネルギーデータ</p>
                <p className="text-zinc-400 text-xs">
                  ユーザーが入力した発電量・消費量・SOC・メモ等のエネルギーログ
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <p className="font-medium text-white text-xs mb-1">利用ログ</p>
                <p className="text-zinc-400 text-xs">
                  AI最適化の実行履歴、機能の利用状況（匿名化集計のみ）
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <p className="font-medium text-white text-xs mb-1">決済情報</p>
                <p className="text-zinc-400 text-xs">
                  Stripe社が管理する顧客ID・サブスクリプションID（当社はカード番号を保持しません）
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第2条（利用目的）</h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>エネルギー管理・AI最適化サービスの提供</li>
              <li>VPP参加支援・収益計算機能の提供</li>
              <li>天気・JEPX価格予測との組み合わせによる個人向けアドバイス生成</li>
              <li>サービス改善のための統計分析（個人を特定しない匿名化データ）</li>
              <li>サービスに関する重要なお知らせの送信</li>
              <li>カスタマーサポート対応</li>
              <li>法令上の義務の履行</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第3条（第三者提供）</h2>
            <p className="mb-3">
              当社はユーザーの同意なく個人情報を第三者に提供しません。
              ただし、以下の場合を除きます。
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>法令に基づく開示要求がある場合</li>
              <li>人の生命・身体・財産を保護するために必要な場合</li>
              <li>以下の業務委託先への提供（目的の範囲内）</li>
            </ul>
            <div className="mt-3 space-y-2">
              {[
                { name: 'Supabase Inc.', purpose: 'データベース・認証基盤', region: '米国' },
                { name: 'Stripe Inc.', purpose: '決済処理', region: '米国' },
                { name: 'Vercel Inc.', purpose: 'サーバーホスティング', region: '米国' },
                { name: 'Open-Meteo', purpose: '気象データAPI（匿名アクセス）', region: 'EU' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <span className="font-medium text-white w-32 flex-shrink-0">{p.name}</span>
                  <span className="text-zinc-400 flex-1">{p.purpose}</span>
                  <span className="text-zinc-600">{p.region}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第4条（データの保管・セキュリティ）</h2>
            <p className="mb-2">
              当社はユーザーのデータを適切に保護するため以下の措置を講じます。
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>全通信のTLS/HTTPS暗号化</li>
              <li>Supabase RLS（行レベルセキュリティ）による他ユーザーからのデータ分離</li>
              <li>パスワードはSupabase Authが管理（当社はプレーンテキストを保持しない）</li>
              <li>API全エンドポイントへの認証要求・レート制限</li>
              <li>定期的なセキュリティレビュー</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第5条（データの保存期間）</h2>
            <p>
              エネルギーログはアカウント有効期間中保存します。
              アカウント削除から30日後に全データを完全削除します。
              決済履歴は法令上の要件（7年）の範囲で保持します。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第6条（ユーザーの権利）</h2>
            <p className="mb-2">ユーザーは以下の権利を有します。</p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>個人情報の開示請求</li>
              <li>個人情報の訂正・削除請求</li>
              <li>個人情報の利用停止請求</li>
              <li>エネルギーデータのCSVエクスポート（履歴ページより随時可能）</li>
              <li>アカウント削除（設定ページより申請可能）</li>
            </ul>
            <p className="mt-3 text-zinc-500 text-xs">
              権利行使はサポートメール（support@powerwallet.jp）へご連絡ください。30日以内に対応します。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第7条（Cookie・トラッキング）</h2>
            <p>
              当サービスは認証セッション管理のためにCookieを使用します。
              広告目的のトラッキングCookieは使用しません。
              アナリティクスについては匿名化された集計データのみを取得します。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第8条（未成年者の個人情報）</h2>
            <p>
              当サービスは18歳未満の方のご利用を想定していません。
              18歳未満の方の登録が判明した場合、アカウントおよびデータを削除します。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第9条（ポリシーの変更）</h2>
            <p>
              本ポリシーは事前に通知の上変更する場合があります。
              重要な変更の場合、登録メールアドレスへ通知します。
              変更後もサービスを継続利用することで、新しいポリシーへの同意とみなします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第10条（お問い合わせ）</h2>
            <p>個人情報に関するお問い合わせは以下までご連絡ください。</p>
            <div className="mt-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
              <p className="text-white font-medium">PowerWallet 個人情報管理責任者</p>
              <p className="text-zinc-400">Email: <a href="mailto:privacy@powerwallet.jp" className="text-green-400 hover:underline">privacy@powerwallet.jp</a></p>
              <p className="text-zinc-400">対応時間: 平日 10:00〜17:00（祝日除く）</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
