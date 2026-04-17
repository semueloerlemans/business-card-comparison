import { useState } from 'react'
import { ChevronDown, ChevronRight, Check, X, HelpCircle, Users } from 'lucide-react'
import type { ComparisonRow, Competitor, TabbyOffer } from '../types'
import { buildComparisonRows } from '../lib/scoring'

interface Props {
  tabby: TabbyOffer
  competitors: Competitor[]
}

const MAX_COMPARED = 5
const DEFAULT_IDS = ['wio', 'adcb', 'rakbank']

function ValueCell({ value }: { value: string }) {
  if (value === 'Yes') return <span className="flex items-center gap-1 text-green-700"><Check className="w-3.5 h-3.5" /> Yes</span>
  if (value === 'No') return <span className="flex items-center gap-1 text-red-600"><X className="w-3.5 h-3.5" /> No</span>
  if (value === 'Unknown') return <span className="flex items-center gap-1 text-gray-400"><HelpCircle className="w-3.5 h-3.5" /> Unknown</span>
  return <span className="text-gray-700">{value}</span>
}

interface UnifiedRow {
  category: string
  feature: string
  tabbyValue: string
  competitorValues: string[]
  winners: ComparisonRow['winner'][]
  notes?: string
}

function CategoryBlock({
  category,
  rows,
  colTemplate,
}: {
  category: string
  rows: UnifiedRow[]
  colTemplate: string
}) {
  const [open, setOpen] = useState(true)

  const tabbyWins = rows.filter(r => r.winners.some(w => w === 'tabby')).length
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <span className="font-medium text-sm text-gray-700">{category}</span>
        <span className="text-xs text-tabby-700 font-medium ml-auto">Tabby wins {tabbyWins}/{rows.length}</span>
      </button>
      {open && (
        <div className="divide-y divide-gray-50">
          {rows.map((row, i) => {
            const tabbyBeats = row.winners.every(w => w === 'tabby' || w === 'tie')
            const anyTabbyWin = row.winners.some(w => w === 'tabby')
            return (
              <div key={i} className="grid gap-2 px-4 py-2.5 text-sm hover:bg-gray-50/50 items-start" style={{ gridTemplateColumns: colTemplate }}>
                <div>
                  <span className="text-gray-700">{row.feature}</span>
                  {row.notes && <p className="text-xs text-gray-400 mt-0.5">{row.notes}</p>}
                </div>
                <div className={tabbyBeats && anyTabbyWin ? 'font-medium' : ''}>
                  <ValueCell value={row.tabbyValue} />
                </div>
                {row.competitorValues.map((v, idx) => {
                  const w = row.winners[idx]
                  const cls = w === 'competitor' ? 'font-medium text-blue-700' : ''
                  return <div key={idx} className={cls}><ValueCell value={v} /></div>
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function OverallComparison({ tabby, competitors }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const defaults = DEFAULT_IDS.filter(id => competitors.some(c => c.id === id))
    return defaults.slice(0, MAX_COMPARED)
  })

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX_COMPARED) return prev
      return [...prev, id]
    })
  }

  const selectedCompetitors = selectedIds
    .map(id => competitors.find(c => c.id === id))
    .filter((c): c is Competitor => !!c)

  // Build rows: one set of features (from first selected) with values per competitor
  const rowsPerCompetitor = selectedCompetitors.map(c => buildComparisonRows(tabby, c))
  const featureRows = rowsPerCompetitor[0] ?? []

  const unified: UnifiedRow[] = featureRows.map((r, idx) => ({
    category: r.category,
    feature: r.feature,
    tabbyValue: r.tabbyValue,
    competitorValues: rowsPerCompetitor.map(rows => rows[idx]?.competitorValue ?? '—'),
    winners: rowsPerCompetitor.map(rows => rows[idx]?.winner ?? 'unknown'),
    notes: r.notes,
  }))

  const grouped = unified.reduce<Record<string, UnifiedRow[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  // Column template: feature wider, then Tabby + N competitor columns equal
  const valueCols = `repeat(${1 + selectedCompetitors.length}, minmax(140px, 1fr))`
  const colTemplate = `minmax(260px, 2.4fr) ${valueCols}`

  // Tally per-competitor wins for summary
  const tallies = selectedCompetitors.map((c, idx) => {
    const wins = unified.filter(r => r.winners[idx] === 'competitor').length
    const tabbyWinsVs = unified.filter(r => r.winners[idx] === 'tabby').length
    const ties = unified.filter(r => r.winners[idx] === 'tie').length
    return { name: c.name, wins, tabbyWinsVs, ties }
  })

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title flex items-center gap-2">
          <Users className="w-4 h-4 text-tabby-500" /> Overall Comparison
        </span>
        <span className="text-xs text-gray-400">{selectedCompetitors.length}/{MAX_COMPARED} competitors selected</span>
      </div>

      {/* Competitor picker */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
        <p className="text-xs font-medium text-gray-500 mb-2">Pick up to {MAX_COMPARED} competitors</p>
        <div className="flex flex-wrap gap-2">
          {competitors.map(c => {
            const active = selectedIds.includes(c.id)
            const disabled = !active && selectedIds.length >= MAX_COMPARED
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                disabled={disabled}
                className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                  active
                    ? 'bg-tabby-50 border-tabby-300 text-tabby-700 font-medium'
                    : disabled
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      {selectedCompetitors.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-gray-400">Select at least one competitor to compare.</div>
      ) : (
        <>
          {/* Summary row */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-4 text-xs flex-wrap">
            <span className="text-gray-500">Tabby vs</span>
            {tallies.map((t, i) => (
              <span key={i} className="flex items-center gap-2">
                <strong className="text-gray-700">{t.name}</strong>
                <span className="text-green-700 font-semibold">Tabby {t.tabbyWinsVs}W</span>
                <span className="text-blue-700 font-semibold">{t.name} {t.wins}W</span>
                <span className="text-gray-400">Ties {t.ties}</span>
              </span>
            ))}
          </div>

          {/* Sticky header row */}
          <div
            className="grid gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wide sticky top-0"
            style={{ gridTemplateColumns: colTemplate }}
          >
            <div className="text-gray-500">Feature</div>
            <div className="text-tabby-700">Tabby</div>
            {selectedCompetitors.map(c => (
              <div key={c.id} className="text-gray-500 truncate">{c.name}</div>
            ))}
          </div>

          {Object.entries(grouped).map(([cat, rows]) => (
            <CategoryBlock
              key={cat}
              category={cat}
              rows={rows}
              colTemplate={colTemplate}
            />
          ))}
        </>
      )}
    </div>
  )
}
