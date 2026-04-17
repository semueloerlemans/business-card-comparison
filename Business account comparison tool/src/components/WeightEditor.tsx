import { Sliders } from 'lucide-react'
import type { CategoryWeights, ScoringMode } from '../types'
import { scoringPresets, categoryLabels } from '../data/weights'

interface Props {
  weights: CategoryWeights
  mode: ScoringMode
  onWeightsChange: (w: CategoryWeights) => void
  onModeChange: (m: ScoringMode) => void
}

export default function WeightEditor({ weights, mode, onWeightsChange, onModeChange }: Props) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)

  const handlePreset = (m: ScoringMode) => {
    onModeChange(m)
    if (m !== 'custom') {
      onWeightsChange(scoringPresets[m].weights)
    }
  }

  const handleSlider = (key: keyof CategoryWeights, val: number) => {
    onModeChange('custom')
    onWeightsChange({ ...weights, [key]: val })
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title flex items-center gap-2">
          <Sliders className="w-4 h-4 text-tabby-500" /> Scoring Weights & Mode
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${total === 100 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
          Total: {total}%
        </span>
      </div>

      {/* Preset buttons */}
      <div className="px-6 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-2 font-medium">Scoring preset</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(scoringPresets) as ScoringMode[]).map(m => (
            <button
              key={m}
              onClick={() => handlePreset(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mode === m ? 'bg-tabby-500 text-white border-tabby-500' : 'bg-white text-gray-600 border-gray-200 hover:border-tabby-300 hover:text-tabby-600'}`}
            >
              {scoringPresets[m].label}
            </button>
          ))}
        </div>
        {mode !== 'custom' && (
          <p className="text-xs text-gray-400 mt-2 italic">{scoringPresets[mode].description}</p>
        )}
      </div>

      {/* Weight sliders */}
      <div className="px-6 py-4 space-y-3">
        {(Object.keys(weights) as (keyof CategoryWeights)[]).map(key => {
          const val = weights[key]
          const pct = total > 0 ? Math.round((val / total) * 100) : 0
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{categoryLabels[key]}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={val}
                    onChange={e => handleSlider(key, Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-14 text-sm text-right border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-tabby-400"
                  />
                  <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={val}
                onChange={e => handleSlider(key, Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-tabby-500 cursor-pointer"
              />
            </div>
          )
        })}
      </div>

      {total !== 100 && (
        <div className="mx-6 mb-4 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
          Weights sum to {total} — scores are still valid (they are normalised), but consider adjusting to 100 for clarity.
        </div>
      )}
    </div>
  )
}
