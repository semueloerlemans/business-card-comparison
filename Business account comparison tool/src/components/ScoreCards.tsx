import { Trophy, TrendingUp, TrendingDown, Target, ShieldCheck } from 'lucide-react'
import type { BenchmarkResult, Competitor } from '../types'

interface Props {
  tabbyResult: BenchmarkResult
  competitorResults: BenchmarkResult[]
  competitors: Competitor[]
  tabbyRank: number
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 10) * circumference
  const colour = score >= 7 ? '#32A952' : score >= 5 ? '#F2CC33' : '#F06859'

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={colour} strokeWidth={6}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export default function ScoreCards({ tabbyResult, competitorResults, competitors, tabbyRank }: Props) {
  const avgScore = competitorResults.length > 0
    ? competitorResults.reduce((s, r) => s + r.overallScore, 0) / competitorResults.length
    : 0

  const bestResult = competitorResults.length > 0
    ? competitorResults.reduce((a, b) => a.overallScore > b.overallScore ? a : b)
    : null

  const bestComp = bestResult ? competitors.find(c => c.id === bestResult.competitorId) : null
  const total = 1 + competitorResults.length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tabby overall score */}
      <div className="section-card p-5 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ScoreRing score={tabbyResult.overallScore} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{tabbyResult.overallScore.toFixed(1)}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Tabby Score</p>
          <p className="text-2xl font-bold text-gray-900">{tabbyResult.percentageScore}%</p>
          <p className="text-xs text-gray-400 mt-0.5">out of 10 points</p>
        </div>
      </div>

      {/* Rank */}
      <div className="section-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-tabby-50 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-tabby-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Tabby Rank</p>
          <p className="text-2xl font-bold text-gray-900">#{tabbyRank}<span className="text-sm text-gray-400"> / {total}</span></p>
          <p className="text-xs text-gray-400 mt-0.5">
            {tabbyRank === 1 ? 'Top ranked' : tabbyRank <= Math.ceil(total / 2) ? 'Above median' : 'Below median'}
          </p>
        </div>
      </div>

      {/* Competitor average */}
      <div className="section-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Competitor Average</p>
          <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {tabbyResult.overallScore >= avgScore
              ? <TrendingUp className="w-3 h-3 text-green-500" />
              : <TrendingDown className="w-3 h-3 text-red-500" />}
            <span className={`text-xs font-medium ${tabbyResult.overallScore >= avgScore ? 'text-green-600' : 'text-red-600'}`}>
              Tabby {tabbyResult.overallScore >= avgScore ? '+' : ''}{(tabbyResult.overallScore - avgScore).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Best competitor / Data confidence */}
      <div className="section-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Data Confidence</p>
          <p className="text-2xl font-bold text-gray-900">{tabbyResult.confidence}%</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {bestComp ? `Best competitor: ${bestComp.name} (${bestResult!.overallScore.toFixed(1)})` : 'No competitors selected'}
          </p>
        </div>
      </div>
    </div>
  )
}
