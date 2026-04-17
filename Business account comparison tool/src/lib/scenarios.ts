import type { Scenario, TabbyOffer, Competitor, CategoryWeights, ScoringMode } from '../types'

const STORAGE_KEY = 'uae_benchmarker_scenarios'

export function loadScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveScenario(scenario: Scenario): void {
  const existing = loadScenarios()
  const idx = existing.findIndex(s => s.id === scenario.id)
  if (idx >= 0) existing[idx] = scenario
  else existing.push(scenario)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function deleteScenario(id: string): void {
  const existing = loadScenarios().filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function createScenario(
  name: string,
  tabby: TabbyOffer,
  competitors: Competitor[],
  weights: CategoryWeights,
  scoringMode: ScoringMode,
  selectedCompetitorIds: string[],
  notes: string,
): Scenario {
  return {
    id: `scenario_${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    tabby,
    competitors,
    weights,
    scoringMode,
    selectedCompetitorIds,
    notes,
  }
}

export function duplicateScenario(scenario: Scenario, newName: string): Scenario {
  return { ...scenario, id: `scenario_${Date.now()}`, name: newName, createdAt: new Date().toISOString() }
}
