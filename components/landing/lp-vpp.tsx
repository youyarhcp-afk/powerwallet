import { Zap, TrendingUp, Building2, ArrowUpRight } from 'lucide-react'

const REVENUE_ITEMS = [
  { label: '余剰売電収益', amount: '¥38,000', period: '年間' },
  { label: 'VPP調整力収益', amount: '¥72,000', period: '年間' },
  { label: '電力コスト削減', amount: '¥18,000', period: '年間' },
]

export function LpVpp() {
  return (
    <section id="vpp" className="py-24 px-4 relative overflow-hidden">
      {/* BG accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                <Zap className="w-3.5 h-3.5" />
                2026年4月 低圧VPP解禁
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                VPPで電力を<br />
                <span className="text-green-400">収益に変える</span>
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed">
                低圧VPP（仮想発電所）解禁により、一般家庭の蓄電池が電力市場に参加できるようになりました。
                PowerWalletがアグリゲーターとの連携を自動化し、あなたの蓄電池が調整力を提供するたびに収益が発生します。
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: TrendingUp, text: '電力需要ピーク時に自動放電 → 調整力収益' },
                { icon: Building2, text: 'アグリゲーター申請・連携を自動化' },
                { icon: Zap, text: '将来：1kWh = 1 PWATT（電力トークン）でP2P取引' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <a
              href="/login"
              className="inline-flex items-center gap-2 text-green-400 text-sm font-medium hover:text-green-300 transition-colors"
            >
              VPP収益シミュレーターを試す <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right: revenue card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">年間収益シミュレーション</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">4kW・10kWh構成</span>
              </div>

              <div className="space-y-3">
                {REVENUE_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-zinc-800/60 last:border-0">
                    <p className="text-sm text-zinc-400">{item.label}</p>
                    <div className="text-right">
                      <p className="text-base font-bold text-white">{item.amount}</p>
                      <p className="text-xs text-zinc-600">{item.period}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-green-400">合計収益（目安）</p>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">¥128,000</p>
                  <p className="text-xs text-green-500/60">年間（試算）</p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                ※ 試算値は太陽光4kW・蓄電池10kWh・年間日照時間1,400h・JEPX参考価格をもとにした概算です。実際の収益は設備・地域・電力市場の状況により異なります。
              </p>
            </div>

            {/* Mini chart: fake bar chart */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-600 mb-3">月別VPP収益イメージ（¥）</p>
              <div className="flex items-end gap-1 h-16">
                {[3500, 4200, 5800, 6100, 7200, 8400, 9100, 8700, 7300, 5900, 4600, 3800].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-green-500/30 hover:bg-green-500/50 transition-colors"
                    style={{ height: `${(v / 9100) * 100}%` }}
                    title={`${['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'][i]}: ¥${v.toLocaleString()}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-zinc-700">
                <span>1月</span><span>6月</span><span>12月</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
