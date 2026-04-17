import { Database } from 'lucide-react'
import type { BenchmarkResult, Competitor, TabbyOffer } from '../types'

interface Props {
  tabbyResult: BenchmarkResult
  competitorResults: BenchmarkResult[]
  competitors: Competitor[]
  tabby: TabbyOffer
}

function Bar({ pct }: { pct: number }) {
  const colour = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${colour}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function DataCompletenessView({ tabbyResult, competitorResults, competitors, tabby }: Props) {
  const all = [
    { id: 'tabby', name: tabby.name, result: tabbyResult, isTabby: true },
    ...competitorResults.map(r => ({
      id: r.competitorId,
      name: competitors.find(c => c.id === r.competitorId)?.name ?? r.competitorId,
      result: r,
      isTabby: false,
    })),
  ].sort((a, b) => b.result.confidence - a.result.confidence)

  const avgConfidence = all.length > 0
    ? Math.round(all.reduce((s, a) => s + a.result.confidence, 0) / all.length)
    : 0

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title flex items-center gap-2">
          <Database className="w-4 h-4 text-tabby-500" /> Data Completeness
        </span>
        <span className="text-xs text-gray-500">Dataset avg: <strong>{avgConfidence}%</strong></span>
      </div>

      <div className="px-6 py-4 space-y-3">
        {all.map(({ id, name, result, isTabby }) => (
          <div key={id} className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-24 text-sm font-medium truncate ${isTabby ? 'text-tabby-600' : 'text-gray-700'}`}>
              {name}
            </div>
            <Bar pct={result.confidence} />
            <div className="flex-shrink-0 text-xs text-gray-500 w-32 text-right">
              {result.populatedFields}/{result.totalFields} fields · {result.confidence}%
            </div>
            <span className={`flex-shrink-0 badge ${result.confidence >= 80 ? 'badge-green' : result.confidence >= 50 ? 'badge-yellow' : 'badge-red'}`}>
              {result.confidence >= 80 ? 'High' : result.confidence >= 50 ? 'Medium' : 'Low'}
            </span>
          </div>
        ))}
      </div>

      <div className="px-6 pb-4">
        <p className="text-xs text-gray-400">
          Low-confidence competitors have many unknown fields (null values). Their scores may be under- or over-estimated until exact data from fee schedules or statements is filled in.
          Edit competitor data in <code className="font-mono bg-gray-100 px-1 rounded">src/data/competitors.ts</code>.
        </p>
      </div>
    </div>
  )
}
