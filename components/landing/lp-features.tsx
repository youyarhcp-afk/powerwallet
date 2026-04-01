import { BarChart3, BrainCircuit, Coins, Battery, Sun, Car } from 'lucide-react'

const FEATURES = [
  {
    icon: BarChart3,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    title: 'リアルタイム見える化',
    titleSub: 'Energy Dashboard',
    description:
      '太陽光・蓄電池・EV・電力消費を1つのダッシュボードに集約。今どれだけ発電・蓄電・消費しているか、秒単位でリアルタイム表示。',
    items: ['太陽光発電量・売電額', '蓄電池SOC%・充放電', 'EV充電状況', 'JEPX電力価格'],
  },
  {
    icon: BrainCircuit,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'AIエネルギー最適化',
    titleSub: 'AI Optimization',
    description:
      '天気予報・電力市場価格・使用パターンをAIが学習。「今売る？貯める？VPP参加？」を自動判断し、収益を最大化します。',
    items: ['72時間先行き予測', '最適充放電スケジュール', '売電タイミング提案', 'コスト削減シミュレーション'],
  },
  {
    icon: Coins,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    title: 'VPP収益シェア',
    titleSub: 'VPP Revenue',
    description:
      '2026年4月から解禁の低圧VPP（仮想発電所）に自動参加。電力会社・アグリゲーターと協調して調整力を提供し、毎月収益を獲得。',
    items: ['低圧VPP自動参加', '調整力収益の自動受取', 'アグリゲーター連携', '将来：PWATTトークン化'],
  },
]

const DEVICES = [
  { icon: Sun, label: '太陽光パネル', desc: '発電量・売電額を管理' },
  { icon: Battery, label: '蓄電池', desc: 'SOC・充放電を最適化' },
  { icon: Car, label: 'EV・電気自動車', desc: 'V2H・充電スケジュール' },
]

export function LpFeatures() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section header */}
        <div className="text-center space-y-3">
          <p className="text-green-400 text-sm font-medium tracking-wider uppercase">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            家庭のエネルギーを、<br className="sm:hidden" />すべて最適化
          </h2>
          <p className="text-zinc-500 text-base max-w-xl mx-auto">
            見えなかった電力の流れを可視化し、AIが最適な判断を下す。
            PowerWalletは個人が電力市場で勝つための武器です。
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5 hover:border-zinc-700 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">{f.title}</h3>
                  <p className={`text-xs font-medium ${f.color} mt-0.5`}>{f.titleSub}</p>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
                <ul className="space-y-1.5">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className={`w-1 h-1 rounded-full ${f.color.replace('text-', 'bg-')}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Supported devices */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <p className="text-center text-sm text-zinc-500 mb-6">対応デバイス</p>
          <div className="flex flex-wrap justify-center gap-8">
            {DEVICES.map(({ icon: DevIcon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <DevIcon className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-zinc-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
