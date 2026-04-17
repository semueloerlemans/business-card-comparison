import { Building2, Zap, CheckSquare, Square, Users } from 'lucide-react'
import type { Competitor, FilterState } from '../types'

interface Props {
  competitors: Competitor[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onSelectNone: () => void
  filters: FilterState
  onFilterChange: (f: FilterState) => void
}

const FILTER_LABELS: { key: keyof FilterState; label: string }[] = [
  { key: 'hasBusinessAccount', label: 'Has business account' },
  { key: 'hasControlledCards', label: 'Has corporate cards' },
  { key: 'hasCreditCard', label: 'Has credit card' },
  { key: 'fullyDigital', label: 'Fully digital onboarding' },
  { key: 'hasCashback', label: 'Cashback available' },
  { key: 'zeroMonthlyFee', label: 'Zero monthly fee' },
]

export default function CompetitorSelector({ competitors, selectedIds, onToggle, onSelectAll, onSelectNone, filters, onFilterChange }: Props) {
  const banks = competitors.filter(c => c.group === 'traditional_bank')
  const platforms = competitors.filter(c => c.group === 'spend_platform')

  const filtered = (group: Competitor[]) =>
    group.filter(c => {
      if (filters.hasBusinessAccount && !c.account.businessAccount) return false
      if (filters.hasControlledCards && !c.corporateCards.available) return false
      if (filters.hasCreditCard && !c.credit.businessCreditCard) return false
      if (filters.fullyDigital && c.onboarding.type !== 'fully_digital') return false
      if (filters.hasCashback && !c.debit.cashbackDebit && !c.credit.cashbackCredit) return false
      if (filters.zeroMonthlyFee && c.account.monthlyFee !== 0) return false
      return true
    })

  const visibleBanks = filtered(banks)
  const visiblePlatforms = filtered(platforms)
  const allVisible = [...visibleBanks, ...visiblePlatforms]
  const allSelected = allVisible.length > 0 && allVisible.every(c => selectedIds.has(c.id))

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title flex items-center gap-2">
          <Users className="w-4 h-4 text-tabby-500" /> Competitor Selection
        </span>
        <div className="flex items-center gap-2">
          <button onClick={onSelectAll} className="text-xs text-tabby-600 hover:text-tabby-700 font-medium">Select all</button>
          <span className="text-gray-300">|</span>
          <button onClick={onSelectNone} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Clear</button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
        <p className="text-xs font-medium text-gray-500 mb-2">Filters</p>
        <div className="flex flex-wrap gap-2">
          {FILTER_LABELS.map(({ key, label }) => {
            const val = filters[key] as boolean
            return (
              <button
                key={key}
                onClick={() => onFilterChange({ ...filters, [key]: !val })}
                className={`text-xs rounded-full px-3 py-1 border transition-colors ${val ? 'bg-tabby-50 border-tabby-300 text-tabby-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Traditional Banks</span>
          </div>
          <div className="space-y-1.5">
            {visibleBanks.length === 0 && <p className="text-xs text-gray-400 italic">No banks match current filters</p>}
            {visibleBanks.map(c => (
              <CompetitorChip key={c.id} competitor={c} selected={selectedIds.has(c.id)} onToggle={onToggle} />
            ))}
          </div>
        </div>

        {/* Spend platforms */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Spend Platforms</span>
          </div>
          <div className="space-y-1.5">
            {visiblePlatforms.length === 0 && <p className="text-xs text-gray-400 italic">No platforms match current filters</p>}
            {visiblePlatforms.map(c => (
              <CompetitorChip key={c.id} competitor={c} selected={selectedIds.has(c.id)} onToggle={onToggle} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {selectedIds.size} of {allVisible.length} visible competitors selected
          {allVisible.length < competitors.length && ` (${competitors.length - allVisible.length} hidden by filters)`}
        </span>
        <button
          onClick={() => allSelected ? onSelectNone() : onSelectAll()}
          className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          {allSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          {allSelected ? 'Deselect all' : 'Select all visible'}
        </button>
      </div>
    </div>
  )
}

function CompetitorChip({ competitor, selected, onToggle }: { competitor: Competitor; selected: boolean; onToggle: (id: string) => void }) {
  const segs = competitor.targetSegment.join(', ')
  return (
    <button
      onClick={() => onToggle(competitor.id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
        selected
          ? 'bg-tabby-50 border-tabby-300 text-tabby-900'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${selected ? 'bg-tabby-500 border-tabby-500' : 'border-gray-300'}`}>
        {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{competitor.name}</span>
          {competitor.onboarding.type === 'fully_digital' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 flex-shrink-0 leading-none">Digital</span>
          )}
        </div>
        <div className="text-[11px] text-gray-400 truncate mt-0.5">{segs}</div>
      </div>
    </button>
  )
}
