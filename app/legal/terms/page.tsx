import { Scroll, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '利用規約 — PowerWallet',
}

const UPDATED_AT = '2026年3月1日'

export default function TermsPage() {
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
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Scroll className="w-4 h-4 text-zinc-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">利用規約</h1>
          </div>
          <p className="text-sm text-zinc-500">最終更新: {UPDATED_AT}</p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">第1条（適用）</h2>
            <p>
              本規約は、PowerWallet（以下「当サービス」）が提供するエネルギー管理・VPP参加支援サービスの利用条件を定めるものです。
              ユーザーの皆様（以下「ユーザー」）は本規約に同意した上でサービスをご利用ください。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第2条（登録）</h2>
            <p>
              当サービスへの登録は18歳以上の個人または法人が行うことができます。
              登録情報は正確かつ最新の状態に維持する義務があります。
              1人につき1アカウントのみ登録できます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第3条（禁止事項）</h2>
            <p className="mb-2">ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>虚偽のエネルギーデータの入力・改ざん</li>
              <li>当サービスへの不正アクセス・リバースエンジニアリング</li>
              <li>他のユーザーの個人情報の無断取得・利用</li>
              <li>法令または公序良俗に反する行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>AIアルゴリズムを悪用した市場操作</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第4条（サービス内容）</h2>
            <p>
              当サービスは太陽光・蓄電池・EVのエネルギーデータ管理、JEPX市場価格情報の提供、
              AI最適化アドバイス、VPP参加支援機能を提供します。
              AI最適化の推奨はあくまで参考情報であり、最終的な判断はユーザー自身が行うものとします。
              収益シミュレーターの結果は将来の収益を保証するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第5条（料金・支払い）</h2>
            <p>
              Freeプランは永続的に無料でご利用いただけます。
              ProプランおよびPremiumプランは月額制のサブスクリプションです。
              料金はStripe社の決済システムを通じてお支払いください。
              サブスクリプションはいつでもキャンセルできます。解約月末まで有料機能をご利用いただけます。
              返金は原則として行いませんが、システム障害等の当社起因の場合は個別対応いたします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第6条（免責事項）</h2>
            <p>
              当サービスは「現状のまま」提供されます。
              JEPX価格予測・AI最適化提案・収益シミュレーション結果に関して、
              当社は正確性・完全性を保証せず、これらに基づく損害について責任を負いません。
              電力会社との契約・VPP事業者との契約に関するトラブルについても責任を負いません。
              法令上の制限により本サービスを通じた収益が制限される場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第7条（知的財産権）</h2>
            <p>
              当サービスに関する知的財産権は全て当社に帰属します。
              ユーザーが入力したエネルギーデータはユーザー自身に帰属しますが、
              サービス改善のため匿名化・集計した形で利用する場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第8条（サービスの変更・終了）</h2>
            <p>
              当社はサービス内容の変更・終了を事前に通知の上行うことができます。
              サービス終了の場合、30日前までに通知し、データのエクスポート期間を設けます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">第9条（準拠法・管轄）</h2>
            <p>
              本規約は日本法に準拠します。紛争が生じた場合は、東京地方裁判所を専属的合意管轄とします。
            </p>
          </section>

          <section className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs">
              ご不明な点は <a href="mailto:support@powerwallet.jp" className="text-green-400 hover:underline">support@powerwallet.jp</a> までお問い合わせください。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
