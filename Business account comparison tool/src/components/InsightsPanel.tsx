import { TrendingUp, TrendingDown, DollarSign, Zap, StickyNote } from 'lucide-react'
import type { Insight } from '../types'

const ICON_MAP: Record<Insight['type'], { icon: typeof TrendingUp; cls: string; bg: string; label: string }> = {
  strength: { icon: TrendingUp, cls: 'text-green-700', bg: 'bg-green-50 border-green-200', label: 'Strength' },
  weakness: { icon: TrendingDown, cls: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Weakness' },
  pricing_win: { icon: DollarSign, cls: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Pricing Win' },
  feature_win: { icon: Zap, cls: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', label: 'Feature Win' },
}

interface Props {
  insights: Insight[]
  strategicNotes: string
  onNotesChange: (n: string) => void
}

export default function InsightsPanel({ insights, strategicNotes, onNotesChange }: Props) {
  const grouped = insights.reduce<Record<Insight['type'], Insight[]>>((acc, i) => {
    if (!acc[i.type]) acc[i.type] = []
    acc[i.type].push(i)
    return acc
  }, {} as Record<Insight['type'], Insight[]>)

  const order: Insight['type'][] = ['strength', 'feature_win', 'pricing_win', 'weakness']

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title">Strengths, Weaknesses & Opportunities</span>
      </div>

      {insights.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">
          Select competitors and configure weights to generate insights.
        </div>
      ) : (
        <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {order.map(type => {
            const items = grouped[type]
            if (!items || items.length === 0) return null
            const cfg = ICON_MAP[type]
            const Icon = cfg.icon
            return (
              <div key={type} className={`rounded-xl border p-4 ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className={`w-4 h-4 ${cfg.cls}`} />
                  <span className={`text-sm font-semibold ${cfg.cls}`}>{cfg.label}</span>
                </div>
                <ul className="space-y-2">
                  {items.map((ins, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">·</span>
                      <span>{ins.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {/* Strategic notes */}
      <div className="px-6 pb-5 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Strategic Notes</span>
        </div>
        <textarea
          value={strategicNotes}
          onChange={e => onNotesChange(e.target.value)}
          rows={4}
          placeholder="Add internal observations, hypotheses, or context for this benchmarking scenario..."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tabby-400 resize-none placeholder:text-gray-300"
        />
      </div>
    </div>
  )
}
