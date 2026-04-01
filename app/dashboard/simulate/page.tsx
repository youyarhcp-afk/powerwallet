import { VppSimulator } from '@/components/vpp-simulator'
import { OptimizeButton } from '@/components/optimize-button'
import { TooltipHelp } from '@/components/tooltip-help'
import { TrendingUp, Sparkles, Info } from 'lucide-react'

export const metadata = {
  title: 'シミュレーター — PowerWallet',
}

export default function SimulatePage() {
  return (
    <div className="min-h-screen bg-[#050505] bg-grid">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-white">シミュレーター</h1>
            <TooltipHelp text="VPP（仮想発電所）参加時の収入をシミュレーションしたり、AIによる充放電の最適化提案を受け取ることができます。" position="right" size="md" />
          </div>
          <p className="text-zinc-500 text-sm mt-1">
            VPP収入の試算と AI最適化提案
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VPP Simulator */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-white text-sm">
                    VPP収入シミュレーター
                  </h2>
                  <TooltipHelp text="蓄電池容量・太陽光発電容量・VPP参加率の3つのスライダーを調整して、月間の想定VPP収入を試算できます。実際の収入は市場状況により変動します。" position="right" />
                </div>
                <p className="text-xs text-zinc-500">
                  2026年4月 低圧VPP解禁後の試算
                </p>
              </div>
            </div>
            <VppSimulator />
          </div>

          {/* AI Optimization */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-white text-sm">
                    AI最適化エンジン
                  </h2>
                  <TooltipHelp text="電力市場価格と天気予報に基づき、充電・放電・VPP参加の最適タイミングをAIが提案します。" position="left" />
                </div>
                <p className="text-xs text-zinc-500">
                  リアルタイム収益最大化
                </p>
              </div>
            </div>
            <OptimizeButton />
          </div>
        </div>

        {/* Market info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
              <p>
                <span className="text-white font-medium">
                  2026年4月 低圧VPP解禁について
                </span>
                <br />
                資源エネルギー庁の方針により、2026年4月からEREBアグリゲーター経由での低圧需要家（家庭・小規模事業者）のVPP市場参加が解禁されます。
              </p>
              <p>
                PowerWalletは解禁直後から対応し、家庭の太陽光・蓄電池・EVを束ねて
                EREB市場の「調整力」として参加。ユーザーに収益を直接シェアします。
              </p>
              <p className="text-zinc-600">
                ※ 現在はPhase 1（MVP）のため、AI提案・収益はシミュレーション値です。
                Phase 2で実際のHEMS連携・市場接続を実装予定。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
