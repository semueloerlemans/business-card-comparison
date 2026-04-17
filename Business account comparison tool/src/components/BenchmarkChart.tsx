import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { BenchmarkResult, Competitor, TabbyOffer } from '../types'
import { categoryLabels } from '../data/weights'
import type { CategoryScores } from '../types'
import { useState } from 'react'

const CATEGORY_KEYS: (keyof CategoryScores)[] = [
  'accountAndTransfers', 'debitCard', 'corporateCards', 'creditFinancing',
  'onboarding', 'pricing',
]

const SHORT_LABELS: Record<keyof CategoryScores, string> = {
  accountAndTransfers: 'Account',
  debitCard: 'Debit',
  corporateCards: 'Corp. Cards',
  creditFinancing: 'Credit',
  onboarding: 'Onboarding',
  pricing: 'Pricing',
}

const TABBY_COLOUR = '#32A952'
const COLOURS = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#84cc16', '#ec4899', '#6366f1']

interface Props {
  tabby: TabbyOffer
  tabbyResult: BenchmarkResult
  competitorResults: BenchmarkResult[]
  competitors: Competitor[]
}

export default function BenchmarkChart({ tabby, tabbyResult, competitorResults, competitors }: Props) {
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar')
  const [showIndividual, setShowIndividual] = useState(false)

  const compMap = Object.fromEntries(competitors.map(c => [c.id, c]))

  // Radar data: one entry per category
  const radarData = CATEGORY_KEYS.map(key => {
    const entry: Record<string, string | number> = { subject: SHORT_LABELS[key] }
    entry['Tabby'] = Math.round(tabbyResult.categoryScores[key] * 10) / 10
    if (showIndividual) {
      competitorResults.forEach(r => {
        entry[compMap[r.competitorId]?.name ?? r.competitorId] = Math.round(r.categoryScores[key] * 10) / 10
      })
    } else {
      const avgComp = competitorResults.length > 0
        ? competitorResults.reduce((s, r) => s + r.categoryScores[key], 0) / competitorResults.length
        : 0
      entry['Competitor Avg'] = Math.round(avgComp * 10) / 10
      if (competitorResults.length > 0) {
        const best = competitorResults.reduce((a, b) => a.categoryScores[key] > b.categoryScores[key] ? a : b)
        entry['Best Competitor'] = Math.round(best.categoryScores[key] * 10) / 10
      }
    }
    return entry
  })

  // Bar data: one entry per competitor
  const barData = [
    { name: tabby.name, score: tabbyResult.overallScore, fill: TABBY_COLOUR },
    ...competitorResults.map((r, i) => ({
      name: compMap[r.competitorId]?.name ?? r.competitorId,
      score: r.overallScore,
      fill: COLOURS[i % COLOURS.length],
    })),
  ].sort((a, b) => b.score - a.score)

  const radarKeys = showIndividual
    ? competitorResults.map(r => ({ id: r.competitorId, name: compMap[r.competitorId]?.name ?? r.competitorId }))
    : [{ id: 'avg', name: 'Competitor Avg' }, { id: 'best', name: 'Best Competitor' }]

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title">Visual Benchmark</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIndividual(v => !v)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${showIndividual ? 'bg-tabby-50 border-tabby-300 text-tabby-700' : 'border-gray-200 text-gray-600'}`}
          >
            {showIndividual ? 'Showing individual' : 'Show individual'}
          </button>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['radar', 'bar'] as const).map(t => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${chartType === t ? 'bg-tabby-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {competitorResults.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Select at least one competitor to see charts.</p>
        ) : chartType === 'radar' ? (
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9, fill: '#9ca3af' }} tickCount={5} />
              <Radar name="Tabby" dataKey="Tabby" stroke={TABBY_COLOUR} fill={TABBY_COLOUR} fillOpacity={0.2} strokeWidth={2} dot={{ r: 3 }} />
              {radarKeys.map((k, i) => (
                <Radar
                  key={k.id}
                  name={k.name}
                  dataKey={k.name}
                  stroke={COLOURS[i % COLOURS.length]}
                  fill={COLOURS[i % COLOURS.length]}
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
              <Tooltip
                formatter={(val: number) => [`${val.toFixed(1)} / 10`, '']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip
                formatter={(val: number) => [`${val.toFixed(1)} / 10`, 'Score']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Category score breakdown table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 font-medium text-gray-500">Category</th>
                <th className="px-3 py-2 font-medium text-tabby-600">Tabby</th>
                {competitorResults.map(r => (
                  <th key={r.competitorId} className="px-3 py-2 font-medium text-gray-500">
                    {compMap[r.competitorId]?.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORY_KEYS.map(key => {
                const tabbyVal = tabbyResult.categoryScores[key]
                return (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-600">{categoryLabels[key]}</td>
                    <td className={`px-3 py-2 text-center font-semibold ${tabbyVal >= 7 ? 'text-green-700' : tabbyVal >= 5 ? 'text-tabby-600' : 'text-red-600'}`}>
                      {tabbyVal.toFixed(1)}
                    </td>
                    {competitorResults.map(r => {
                      const val = r.categoryScores[key]
                      const isWin = tabbyVal > val + 0.3
                      const isLoss = val > tabbyVal + 0.3
                      return (
                        <td key={r.competitorId} className={`px-3 py-2 text-center ${isLoss ? 'text-blue-700 font-medium' : isWin ? 'text-gray-400' : 'text-gray-600'}`}>
                          {val.toFixed(1)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-700">Overall</td>
                <td className="px-3 py-2 text-center font-bold text-tabby-600">{tabbyResult.overallScore.toFixed(1)}</td>
                {competitorResults.map(r => (
                  <td key={r.competitorId} className="px-3 py-2 text-center font-semibold text-gray-700">
                    {r.overallScore.toFixed(1)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
