import { EnergyForm } from '@/components/energy-form'
import { CsvUpload } from '@/components/csv-upload'
import { TooltipHelp } from '@/components/tooltip-help'
import { DatabaseZap, FileSpreadsheet } from 'lucide-react'

export const metadata = {
  title: 'データ入力 — PowerWallet',
}

export default function InputPage() {
  return (
    <div className="min-h-screen bg-[#050505] bg-grid">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-white">データ入力</h1>
            <TooltipHelp text="太陽光発電量、蓄電池のSOC、EV充電量、電力消費量などを記録します。データが蓄積されるほどAI最適化の提案精度が向上します。" position="right" size="md" />
          </div>
          <p className="text-zinc-500 text-sm mt-1">
            エネルギーデータを手動入力またはCSVで一括登録します
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                <DatabaseZap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-white text-sm">手動入力</h2>
                  <TooltipHelp text="日付・電力源・kWh・SOC（充電状態）を1件ずつ入力できます。メモ欄には天気や特記事項を記録しておくと後で分析に役立ちます。" position="right" />
                </div>
                <p className="text-xs text-zinc-500">1件ずつデータを登録</p>
              </div>
            </div>
            <EnergyForm />
          </div>

          {/* CSV Upload */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-white text-sm">
                    CSVアップロード
                  </h2>
                  <TooltipHelp text="CSVファイルで複数のデータを一括登録できます。下のフォーマット仕様に従ってCSVを作成してください。HEMSやパワコンからエクスポートしたデータも取り込めます。" position="left" />
                </div>
                <p className="text-xs text-zinc-500">複数件を一括インポート</p>
              </div>
            </div>
            <CsvUpload />
          </div>
        </div>

        {/* CSV format guide */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            📋 CSVフォーマット仕様
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['カラム名', '型', '必須', '説明', '例'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 text-zinc-500 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                {[
                  ['date', 'DATE', '✓', '記録日付', '2026-03-26'],
                  ['source', 'TEXT', '✓', 'solar / battery / ev / grid', 'solar'],
                  ['kwh', 'DECIMAL', '✓', '電力量（kWh）', '12.4'],
                  ['soc', 'INTEGER', '—', 'SOC % (0〜100)', '72'],
                  ['notes', 'TEXT', '—', 'メモ', '快晴'],
                ].map(([col, type, req, desc, ex]) => (
                  <tr
                    key={col}
                    className="border-b border-zinc-800/50 last:border-0"
                  >
                    <td className="px-3 py-2 font-mono text-zinc-200">{col}</td>
                    <td className="px-3 py-2 text-zinc-500">{type}</td>
                    <td className="px-3 py-2 text-center">{req}</td>
                    <td className="px-3 py-2">{desc}</td>
                    <td className="px-3 py-2 font-mono text-green-400/80">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-zinc-800/40 font-mono text-xs text-zinc-400">
            <span className="text-zinc-600">例: </span>
            date,source,kwh,soc,notes<br />
            2026-03-26,solar,12.4,72,快晴<br />
            2026-03-26,battery,8.6,,<br />
            2026-03-26,ev,32.0,45,
          </div>
        </div>
      </div>
    </div>
  )
}
