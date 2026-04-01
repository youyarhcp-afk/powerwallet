import { ClipboardList, BrainCircuit, Banknote } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: ClipboardList,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    title: 'データを入力する',
    description:
      '太陽光の発電量、蓄電池のSOC、EV充電量などを入力。CSV一括インポートにも対応。手入力でも数分で設定完了。',
  },
  {
    step: '02',
    icon: BrainCircuit,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'AIが最適化を提案',
    description:
      '天気・電力価格・あなたの使用パターンをもとにAIが分析。「今日は16時に売電を増やすと+¥1,200」のような具体的な提案を毎日届けます。',
  },
  {
    step: '03',
    icon: Banknote,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    title: 'VPP収益を自動受取',
    description:
      'Proプランではアグリゲーターへの自動参加申請も可能。VPP参加による調整力収益が毎月自動的に口座に振り込まれます。',
  },
]

export function LpHowItWorks() {
  return (
    <section id="howitworks" className="py-24 px-4 bg-zinc-950/50">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-green-400 text-sm font-medium tracking-wider uppercase">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            3ステップで始まる<br className="sm:hidden" />エネルギー投資
          </h2>
          <p className="text-zinc-500 text-base max-w-xl mx-auto">
            難しい設定は一切不要。スマートフォンだけで、今日から電力の資産化が始まります。
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.666%] right-[16.666%] h-px bg-gradient-to-r from-green-500/0 via-green-500/30 to-green-500/0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.step} className="relative flex flex-col items-center text-center space-y-4">
                  {/* Step number */}
                  <div className={`w-12 h-12 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center relative z-10`}>
                    <Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div className={`text-xs font-bold ${s.color} tracking-widest`}>STEP {s.step}</div>
                  <h3 className="font-semibold text-white text-lg">{s.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-sm transition-all shadow-lg shadow-green-500/20"
          >
            今すぐ無料で始める
          </a>
          <p className="text-zinc-600 text-xs mt-3">セットアップ時間 約5分 · クレジットカード不要</p>
        </div>
      </div>
    </section>
  )
}
