import { BarChart2, Download, Save, Copy, Trash2 } from 'lucide-react'
import type { Scenario } from '../types'

interface Props {
  scenarios: Scenario[]
  activeScenarioId: string
  onSave: () => void
  onLoad: (id: string) => void
  onDuplicate: () => void
  onDelete: (id: string) => void
  onExportCsv: () => void
  onExportPrint: () => void
}

export default function Header({
  scenarios,
  activeScenarioId,
  onSave,
  onLoad,
  onDuplicate,
  onDelete,
  onExportCsv,
  onExportPrint,
}: Props) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-tabby-500">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-none">Tabby Business Card</h1>
            <p className="text-xs text-gray-500 mt-0.5">Tabby vs UAE competitors · Internal tool</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scenario selector */}
          {scenarios.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={activeScenarioId}
                onChange={e => onLoad(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-tabby-400"
              >
                <option value="">Unsaved scenario</option>
                {scenarios.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {activeScenarioId && (
                <button
                  onClick={() => onDelete(activeScenarioId)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
                  title="Delete scenario"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button onClick={onDuplicate} className="btn-secondary text-xs">
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <button onClick={onSave} className="btn-secondary text-xs">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={onExportCsv} className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={onExportPrint} className="btn-primary text-xs">
            <Download className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>
    </header>
  )
}
