import { useState, useMemo, useCallback } from 'react'
import type { TabbyOffer, Competitor, CategoryWeights, ScoringMode, FilterState, Scenario } from './types'
import { defaultTabby } from './data/tabby'
import { competitors as seedCompetitors } from './data/competitors'
import { defaultWeights, scoringPresets } from './data/weights'
import { buildRankings, generateInsights, scoreCompetitor } from './lib/scoring'
import { loadScenarios, saveScenario, deleteScenario, createScenario, duplicateScenario } from './lib/scenarios'
import { exportCsv, triggerPrint } from './lib/export'
import Header from './components/Header'
import CompetitorSelector from './components/CompetitorSelector'
import TabbyAccountComposer from './components/TabbyAccountComposer'
import TabbyOfferBuilder from './components/TabbyOfferBuilder'
import WeightEditor from './components/WeightEditor'
import ScoreCards from './components/ScoreCards'
import BenchmarkChart from './components/BenchmarkChart'
import ComparisonTable from './components/ComparisonTable'
import InsightsPanel from './components/InsightsPanel'
import DataCompletenessView from './components/DataCompletenessView'
import OverallComparison from './components/OverallComparison'

type Tab = 'benchmarker' | 'overall'

const DEFAULT_FILTERS: FilterState = {
  group: 'all',
  segment: 'all',
  hasBusinessAccount: false,
  hasControlledCards: false,
  hasCreditCard: false,
  fullyDigital: false,
  hasCashback: false,
  zeroMonthlyFee: false,
}

export default function App() {
  // Core state
  const [tabby, setTabby] = useState<TabbyOffer>(defaultTabby)
  const [allCompetitors, setAllCompetitors] = useState<Competitor[]>(seedCompetitors)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(seedCompetitors.map(c => c.id)))
  const [weights, setWeights] = useState<CategoryWeights>(defaultWeights)
  const [scoringMode, setScoringMode] = useState<ScoringMode>('small_business')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [strategicNotes, setStrategicNotes] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('benchmarker')

  // Scenario management
  const [scenarios, setScenarios] = useState<Scenario[]>(loadScenarios)
  const [activeScenarioId, setActiveScenarioId] = useState('')

  // Selected competitors
  const selectedCompetitors = useMemo(
    () => allCompetitors.filter(c => selectedIds.has(c.id)),
    [allCompetitors, selectedIds],
  )

  // Scores
  const { tabbyResult, competitorResults, tabbyRank } = useMemo(
    () => buildRankings(tabby, selectedCompetitors, weights),
    [tabby, selectedCompetitors, weights],
  )

  const allCompetitorResults = useMemo(
    () => allCompetitors.map(c => scoreCompetitor(c, weights)),
    [allCompetitors, weights],
  )

  // Insights
  const insights = useMemo(
    () => generateInsights(tabbyResult, competitorResults, selectedCompetitors),
    [tabbyResult, competitorResults, selectedCompetitors],
  )

  // ─── Competitor selection ──────────────────────────────────────────────────
  const toggleCompetitor = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => setSelectedIds(new Set(allCompetitors.map(c => c.id))), [allCompetitors])
  const selectNone = useCallback(() => setSelectedIds(new Set()), [])

  // ─── Scenario management ───────────────────────────────────────────────────
  const handleSave = () => {
    const name = prompt('Scenario name:', activeScenarioId ? scenarios.find(s => s.id === activeScenarioId)?.name ?? 'Scenario' : 'Scenario')
    if (!name) return
    const s = createScenario(name, tabby, allCompetitors, weights, scoringMode, [...selectedIds], strategicNotes)
    saveScenario(s)
    const updated = loadScenarios()
    setScenarios(updated)
    setActiveScenarioId(s.id)
  }

  const handleLoad = (id: string) => {
    const s = scenarios.find(sc => sc.id === id)
    if (!s) { setActiveScenarioId(''); return }
    setTabby(s.tabby)
    setAllCompetitors(s.competitors)
    setSelectedIds(new Set(s.selectedCompetitorIds))
    setWeights(s.weights)
    setScoringMode(s.scoringMode)
    setStrategicNotes(s.notes)
    setActiveScenarioId(id)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this scenario?')) return
    deleteScenario(id)
    setScenarios(loadScenarios())
    if (activeScenarioId === id) setActiveScenarioId('')
  }

  const handleDuplicate = () => {
    const original = scenarios.find(s => s.id === activeScenarioId)
    const baseName = original?.name ?? 'Scenario'
    const name = prompt('New scenario name:', `${baseName} (copy)`)
    if (!name) return
    const dup = duplicateScenario(
      createScenario(baseName, tabby, allCompetitors, weights, scoringMode, [...selectedIds], strategicNotes),
      name,
    )
    saveScenario(dup)
    setScenarios(loadScenarios())
    setActiveScenarioId(dup.id)
  }

  const handleModeChange = (m: ScoringMode) => {
    setScoringMode(m)
    if (m !== 'custom') setWeights(scoringPresets[m].weights)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSave={handleSave}
        onLoad={handleLoad}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onExportCsv={() => exportCsv(tabby, selectedCompetitors)}
        onExportPrint={triggerPrint}
      />

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 flex gap-1">
          {([
            { id: 'benchmarker', label: 'Benchmarker' },
            { id: 'overall', label: 'Overall Comparison' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-tabby-500 text-tabby-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {activeTab === 'benchmarker' ? (
          <>
            {/* Tabby account composer — primary configuration at the top */}
            <TabbyAccountComposer tabby={tabby} onChange={setTabby} />

            {/* Score summary */}
            <ScoreCards
              tabbyResult={tabbyResult}
              competitorResults={competitorResults}
              competitors={selectedCompetitors}
              tabbyRank={tabbyRank}
            />

            {/* Main layout: left sidebar + right content */}
            <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <TabbyOfferBuilder tabby={tabby} onChange={setTabby} />
                <CompetitorSelector
                  competitors={allCompetitors}
                  selectedIds={selectedIds}
                  onToggle={toggleCompetitor}
                  onSelectAll={selectAll}
                  onSelectNone={selectNone}
                  filters={filters}
                  onFilterChange={setFilters}
                />
                <WeightEditor
                  weights={weights}
                  mode={scoringMode}
                  onWeightsChange={w => { setWeights(w); setScoringMode('custom') }}
                  onModeChange={handleModeChange}
                />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <BenchmarkChart
                  tabby={tabby}
                  tabbyResult={tabbyResult}
                  competitorResults={competitorResults}
                  competitors={selectedCompetitors}
                />
                <InsightsPanel
                  insights={insights}
                  strategicNotes={strategicNotes}
                  onNotesChange={setStrategicNotes}
                />
                <ComparisonTable tabby={tabby} competitors={selectedCompetitors} />
                <DataCompletenessView
                  tabbyResult={tabbyResult}
                  competitorResults={allCompetitorResults}
                  competitors={allCompetitors}
                  tabby={tabby}
                />
              </div>
            </div>
          </>
        ) : (
          <OverallComparison tabby={tabby} competitors={allCompetitors} />
        )}
      </main>

      {/* Print-only header */}
      <div className="hidden print-only fixed top-0 left-0 right-0 p-4 border-b">
        <h1 className="text-lg font-bold">Tabby Business Card — Internal</h1>
        <p className="text-sm text-gray-500">Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  )
}
