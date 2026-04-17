import { useState } from 'react'
import { ChevronDown, ChevronRight, Check, X, HelpCircle } from 'lucide-react'
import type { ComparisonRow, Competitor, TabbyOffer } from '../types'
import { buildComparisonRows } from '../lib/scoring'

interface Props {
  tabby: TabbyOffer
  competitors: Competitor[]
}

const WINNER_BADGE: Record<string, { label: string; cls: string }> = {
  tabby: { label: 'Tabby', cls: 'badge-green' },
  competitor: { label: 'Competitor', cls: 'badge-red' },
  tie: { label: 'Tie', cls: 'badge-gray' },
  unknown: { label: '?', cls: 'badge-yellow' },
}

function WinnerCell({ winner }: { winner: ComparisonRow['winner'] }) {
  const b = WINNER_BADGE[winner]
  return <span className={`badge ${b.cls}`}>{b.label}</span>
}

function ValueCell({ value }: { value: string }) {
  if (value === 'Yes') return <span className="flex items-center gap-1 text-green-700"><Check className="w-3.5 h-3.5" /> Yes</span>
  if (value === 'No') return <span className="flex items-center gap-1 text-red-600"><X className="w-3.5 h-3.5" /> No</span>
  if (value === 'Unknown') return <span className="flex items-center gap-1 text-gray-400"><HelpCircle className="w-3.5 h-3.5" /> Unknown</span>
  return <span className="text-gray-700">{value}</span>
}

function CategoryGroup({ category, rows, competitorName }: { category: string; rows: ComparisonRow[]; competitorName: string }) {
  const [open, setOpen] = useState(true)
  const tabbyWins = rows.filter(r => r.winner === 'tabby').length
  const compWins = rows.filter(r => r.winner === 'competitor').length

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <span className="font-medium text-sm text-gray-700">{category}</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-green-700 font-medium">Tabby {tabbyWins}W</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-blue-700 font-medium">{competitorName} {compWins}W</span>
        </div>
      </button>
      {open && (
        <div className="divide-y divide-gray-50">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_1fr_80px] gap-2 px-4 py-2.5 text-sm hover:bg-gray-50/50">
              <div>
                <span className="text-gray-700">{row.feature}</span>
                {row.notes && <p className="text-xs text-gray-400 mt-0.5">{row.notes}</p>}
              </div>
              <div><ValueCell value={row.tabbyValue} /></div>
              <div><ValueCell value={row.competitorValue} /></div>
              <div><WinnerCell winner={row.winner} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComparisonTable({ tabby, competitors }: Props) {
  const [activeCompId, setActiveCompId] = useState<string>(competitors[0]?.id ?? '')

  const activeComp = competitors.find(c => c.id === activeCompId)

  if (competitors.length === 0) {
    return (
      <div className="section-card p-8 text-center">
        <p className="text-gray-400 text-sm">Select at least one competitor to see the comparison table.</p>
      </div>
    )
  }

  const rows = activeComp ? buildComparisonRows(tabby, activeComp) : []

  const grouped = rows.reduce<Record<string, ComparisonRow[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  const totalTabbyWins = rows.filter(r => r.winner === 'tabby').length
  const totalCompWins = rows.filter(r => r.winner === 'competitor').length
  const totalTies = rows.filter(r => r.winner === 'tie').length

  return (
    <div className="section-card">
      <div className="section-header flex-col items-start gap-3 sm:flex-row sm:items-center">
        <span className="section-title">Detailed Comparison</span>
        <div className="flex items-center gap-2 flex-wrap">
          {competitors.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCompId(c.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${activeCompId === c.id ? 'bg-tabby-500 text-white border-tabby-500' : 'border-gray-200 text-gray-600 hover:border-tabby-300'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {activeComp && (
        <>
          {/* Summary bar */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-4 text-xs">
            <span className="text-gray-500">Tabby vs <strong>{activeComp.name}</strong></span>
            <span className="text-green-700 font-semibold">✓ Tabby wins: {totalTabbyWins}</span>
            <span className="text-blue-700 font-semibold">✓ {activeComp.name} wins: {totalCompWins}</span>
            <span className="text-gray-500">Ties: {totalTies}</span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div>Feature</div>
            <div>Tabby</div>
            <div>{activeComp.name}</div>
            <div>Winner</div>
          </div>

          {Object.entries(grouped).map(([cat, catRows]) => (
            <CategoryGroup key={cat} category={cat} rows={catRows} competitorName={activeComp.name} />
          ))}

          {/* Notes */}
          {activeComp.notes.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Notes on {activeComp.name}</p>
              <ul className="space-y-1">
                {activeComp.notes.map((n, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                    <span className="text-gray-400 flex-shrink-0">·</span> {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
