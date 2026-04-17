import type { ComparisonRow, Competitor, TabbyOffer } from '../types'
import { buildComparisonRows } from './scoring'

export function exportCsv(tabby: TabbyOffer, competitors: Competitor[]): void {
  const allRows: (ComparisonRow & { competitor: string })[] = []

  for (const comp of competitors) {
    const rows = buildComparisonRows(tabby, comp)
    rows.forEach(r => allRows.push({ ...r, competitor: comp.name }))
  }

  const headers = ['Competitor', 'Category', 'Feature', 'Tabby Value', 'Competitor Value', 'Winner', 'Notes']
  const lines = [
    headers.join(','),
    ...allRows.map(r =>
      [r.competitor, r.category, r.feature, r.tabbyValue, r.competitorValue, r.winner, r.notes ?? '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tabby_benchmark_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function triggerPrint(): void {
  window.print()
}
