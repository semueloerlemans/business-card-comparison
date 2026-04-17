import type {
  Competitor,
  TabbyOffer,
  CategoryWeights,
  CategoryScores,
  BenchmarkResult,
  ComparisonRow,
  Insight,
  Trilean,
} from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a Trilean to a 0-10 score. null = unknown treated as partial credit. */
function trilean(v: Trilean, unknownScore = 3): number {
  if (v === true) return 10
  if (v === false) return 0
  return unknownScore // null = unknown
}

/** Map onboarding type to numeric score */
function onboardingTypeScore(t: string): number {
  if (t === 'fully_digital') return 10
  if (t === 'hybrid') return 5
  return 1
}

/** Map paperwork intensity to numeric score */
function paperworkScore(p: string): number {
  if (p === 'low') return 10
  if (p === 'medium') return 5
  return 1
}

/** Count non-null, non-undefined fields in an object recursively */
function countFields(obj: unknown): { populated: number; total: number } {
  if (obj === null || obj === undefined) return { populated: 0, total: 1 }
  if (typeof obj !== 'object') return { populated: 1, total: 1 }

  let populated = 0
  let total = 0
  for (const val of Object.values(obj as Record<string, unknown>)) {
    if (Array.isArray(val)) continue // skip notes arrays
    const child = countFields(val)
    populated += child.populated
    total += child.total
  }
  return { populated, total }
}

/** Average an array of 0-10 scores */
function avg(scores: number[]): number {
  if (scores.length === 0) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

// ─── Category scorers ─────────────────────────────────────────────────────────

function scoreAccount(c: Competitor | TabbyOffer): number {
  const a = c.account
  const scores = [
    trilean(a.businessAccount),
    a.monthlyFee === null ? 5 : a.monthlyFee === 0 ? 10 : Math.max(0, 10 - a.monthlyFee / 50),
    a.minimumBalance === null ? 5 : a.minimumBalance === 0 ? 10 : Math.max(0, 10 - a.minimumBalance / 5000),
    trilean(a.multiCurrency),
    trilean(a.incomingTransfers),
    trilean(a.outgoingTransfers),
    trilean(a.internationalPayments),
    trilean(a.payrollSupport),
    trilean(a.invoicingSupport),
    a.localTransferFee === 0
      ? 10
      : a.freeLocalTransfersIncluded === null
        ? 3
        : Math.min(10, (a.freeLocalTransfersIncluded / 10) * 10),
  ]
  return avg(scores)
}

function scoreDebit(c: Competitor | TabbyOffer): number {
  const d = c.debit
  const scores = [
    trilean(d.debitCardIncluded),
    trilean(d.physicalDebitCard),
    trilean(d.virtualDebitCard),
    trilean(d.cashbackDebit),
    trilean(d.rewardsDebit),
    d.cardSpendingFee === null ? 5 : d.cardSpendingFee === 0 ? 10 : Math.max(0, 8 - d.cardSpendingFee),
    trilean(d.atmWithdrawal),
    trilean(d.supplementaryCards),
  ]
  return avg(scores)
}

function scoreCorporateCards(c: Competitor | TabbyOffer): number {
  const cc = c.corporateCards
  const scores = [
    trilean(cc.available),
    trilean(cc.physicalCards),
    trilean(cc.virtualCards),
    trilean(cc.unlimitedCards),
    trilean(cc.perCardLimits),
    trilean(cc.mccRestrictions),   // MCC restrictions = granular spend controls
    trilean(cc.approvalWorkflows),
    trilean(cc.roleBasedPermissions),
    trilean(cc.realTimeSpendVisibility),
    trilean(cc.receiptCapture),
    trilean(cc.expenseCategorisation),
    trilean(cc.accountingIntegrations),
    trilean(cc.erpIntegrations),
    trilean(cc.procurementWorkflows),
    trilean(cc.reimbursements),
  ]
  return avg(scores)
}

function scoreCredit(c: Competitor | TabbyOffer): number {
  const cr = c.credit
  const scores = [
    trilean(cr.businessCreditCard),
    trilean(cr.cashbackCredit),
    trilean(cr.rewardsCredit),
    cr.annualFee === null ? 3 : cr.annualFee === 0 ? 10 : Math.max(0, 8 - cr.annualFee / 500),
    trilean(cr.lineOfCredit),
    trilean(cr.businessLoan),
    trilean(cr.supplyChainFinance),
  ]
  return avg(scores)
}

function scoreOnboarding(c: Competitor | TabbyOffer): number {
  const o = c.onboarding
  const speedScore =
    o.speedDays === null ? 4 : o.speedDays <= 1 ? 10 : o.speedDays <= 3 ? 8 : o.speedDays <= 7 ? 5 : 2
  const branchPenalty = o.branchVisitRequired ? 0 : 10
  const scores = [
    onboardingTypeScore(o.type),
    speedScore,
    branchPenalty,
    paperworkScore(o.paperworkIntensity),
  ]
  return avg(scores)
}

function scorePricing(c: Competitor | TabbyOffer): number {
  const a = c.account
  const fees = [
    a.monthlyFee === null ? 5 : a.monthlyFee === 0 ? 10 : Math.max(0, 10 - a.monthlyFee / 30),
    a.minimumBalance === null ? 5 : a.minimumBalance === 0 ? 10 : Math.max(0, 10 - a.minimumBalance / 3000),
    a.localTransferFee === null ? 5 : a.localTransferFee === 0 ? 10 : Math.max(0, 10 - a.localTransferFee),
    a.internationalTransferFee === null ? 4 : a.internationalTransferFee === 0 ? 10 : Math.max(0, 10 - a.internationalTransferFee / 20),
  ]
  const cardFee = c.debit.cardSpendingFee === null ? 5 : c.debit.cardSpendingFee === 0 ? 10 : Math.max(0, 8 - c.debit.cardSpendingFee)
  const creditAnnual = c.credit.annualFee === null ? 5 : c.credit.annualFee === 0 ? 10 : Math.max(0, 8 - c.credit.annualFee / 300)
  return avg([...fees, cardFee, creditAnnual])
}

// ─── Main scoring engine ──────────────────────────────────────────────────────

export function scoreCompetitor(
  c: Competitor | TabbyOffer,
  weights: CategoryWeights,
): BenchmarkResult {
  const totalWeight =
    weights.accountAndTransfers +
    weights.debitCard +
    weights.corporateCards +
    weights.creditFinancing +
    weights.onboarding +
    weights.pricing

  const categoryScores: CategoryScores = {
    accountAndTransfers: scoreAccount(c),
    debitCard: scoreDebit(c),
    corporateCards: scoreCorporateCards(c),
    creditFinancing: scoreCredit(c),
    onboarding: scoreOnboarding(c),
    pricing: scorePricing(c),
  }

  const weightedSum =
    categoryScores.accountAndTransfers * weights.accountAndTransfers +
    categoryScores.debitCard * weights.debitCard +
    categoryScores.corporateCards * weights.corporateCards +
    categoryScores.creditFinancing * weights.creditFinancing +
    categoryScores.onboarding * weights.onboarding +
    categoryScores.pricing * weights.pricing

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0
  const percentageScore = (overallScore / 10) * 100

  // Data completeness
  const sections = [c.account, c.debit, c.corporateCards, c.credit, c.onboarding, c.strategicValue]
  const totals = sections.map(countFields)
  const populated = totals.reduce((s, t) => s + t.populated, 0)
  const total = totals.reduce((s, t) => s + t.total, 0)
  const confidence = total > 0 ? Math.round((populated / total) * 100) : 0

  return {
    competitorId: c.id,
    overallScore: Math.round(overallScore * 10) / 10,
    percentageScore: Math.round(percentageScore),
    categoryScores,
    confidence,
    populatedFields: populated,
    totalFields: total,
  }
}

// ─── Rank builder ─────────────────────────────────────────────────────────────

export function buildRankings(
  tabby: TabbyOffer,
  competitors: Competitor[],
  weights: CategoryWeights,
): { tabbyResult: BenchmarkResult; competitorResults: BenchmarkResult[]; tabbyRank: number } {
  const tabbyResult = scoreCompetitor(tabby, weights)
  const competitorResults = competitors.map(c => scoreCompetitor(c, weights))
  const allScores = [tabbyResult, ...competitorResults].sort((a, b) => b.overallScore - a.overallScore)
  const tabbyRank = allScores.findIndex(r => r.competitorId === 'tabby') + 1
  return { tabbyResult, competitorResults, tabbyRank }
}

// ─── Comparison rows ──────────────────────────────────────────────────────────

function formatTrilean(v: Trilean): string {
  if (v === true) return 'Yes'
  if (v === false) return 'No'
  return 'Unknown'
}

function formatNum(v: number | null, suffix = ''): string {
  if (v === null) return 'Unknown'
  return `${v.toLocaleString('en-GB')}${suffix}`
}

/**
 * Free local transfers display: if the per-transfer fee is 0, transfers are
 * effectively unlimited regardless of the seeded number. Otherwise show the
 * configured allowance.
 */
function formatFreeLocalTransfers(localFee: number | null, included: number | null): string {
  if (localFee === 0) return 'Unlimited'
  return formatNum(included)
}

function winner(tabbyVal: number, compVal: number, higherIsBetter = true): 'tabby' | 'competitor' | 'tie' | 'unknown' {
  if (tabbyVal === 5 && compVal === 5) return 'unknown' // both unknown
  if (higherIsBetter) {
    if (tabbyVal > compVal) return 'tabby'
    if (compVal > tabbyVal) return 'competitor'
    return 'tie'
  } else {
    if (tabbyVal < compVal) return 'tabby'
    if (compVal < tabbyVal) return 'competitor'
    return 'tie'
  }
}

function trileanWinner(t: Trilean, c: Trilean): 'tabby' | 'competitor' | 'tie' | 'unknown' {
  if (t === null && c === null) return 'unknown'
  if (t === null) return c === true ? 'competitor' : 'tie'
  if (c === null) return t === true ? 'tabby' : 'tie'
  if (t === c) return 'tie'
  return t === true ? 'tabby' : 'competitor'
}

export function buildComparisonRows(tabby: TabbyOffer, comp: Competitor): ComparisonRow[] {
  const rows: ComparisonRow[] = []

  const add = (
    category: string,
    feature: string,
    tabbyValue: string,
    competitorValue: string,
    w: 'tabby' | 'competitor' | 'tie' | 'unknown',
    notes?: string,
  ) => rows.push({ category, feature, tabbyValue, competitorValue, winner: w, notes })

  // Account
  add('Account', 'Business Account', formatTrilean(tabby.account.businessAccount), formatTrilean(comp.account.businessAccount), trileanWinner(tabby.account.businessAccount, comp.account.businessAccount))
  add('Account', 'Monthly Fee (AED)', formatNum(tabby.account.monthlyFee), formatNum(comp.account.monthlyFee), winner(tabby.account.monthlyFee ?? 5, comp.account.monthlyFee ?? 5, false))
  add('Account', 'Minimum Balance (AED)', formatNum(tabby.account.minimumBalance), formatNum(comp.account.minimumBalance), winner(tabby.account.minimumBalance ?? 5, comp.account.minimumBalance ?? 5, false))
  add('Account', 'Local Transfer Fee (AED)', formatNum(tabby.account.localTransferFee), formatNum(comp.account.localTransferFee), winner(tabby.account.localTransferFee ?? 5, comp.account.localTransferFee ?? 5, false), tabby.account.localTransferFeeNote)
  add('Account', 'International Transfer Fee (AED)', formatNum(tabby.account.internationalTransferFee), formatNum(comp.account.internationalTransferFee), winner(tabby.account.internationalTransferFee ?? 50, comp.account.internationalTransferFee ?? 50, false))
  add(
    'Account',
    'Free Local Transfers',
    formatFreeLocalTransfers(tabby.account.localTransferFee, tabby.account.freeLocalTransfersIncluded),
    formatFreeLocalTransfers(comp.account.localTransferFee, comp.account.freeLocalTransfersIncluded),
    winner(
      tabby.account.localTransferFee === 0 ? Infinity : tabby.account.freeLocalTransfersIncluded ?? 0,
      comp.account.localTransferFee === 0 ? Infinity : comp.account.freeLocalTransfersIncluded ?? 0,
    ),
  )
  add('Account', 'Multi-Currency', formatTrilean(tabby.account.multiCurrency), formatTrilean(comp.account.multiCurrency), trileanWinner(tabby.account.multiCurrency, comp.account.multiCurrency))
  add('Account', 'Payroll Support', formatTrilean(tabby.account.payrollSupport), formatTrilean(comp.account.payrollSupport), trileanWinner(tabby.account.payrollSupport, comp.account.payrollSupport))
  add('Account', 'Invoicing Support', formatTrilean(tabby.account.invoicingSupport), formatTrilean(comp.account.invoicingSupport), trileanWinner(tabby.account.invoicingSupport, comp.account.invoicingSupport))

  // Debit
  add('Debit Card', 'Debit Card Included', formatTrilean(tabby.debit.debitCardIncluded), formatTrilean(comp.debit.debitCardIncluded), trileanWinner(tabby.debit.debitCardIncluded, comp.debit.debitCardIncluded))
  add('Debit Card', 'Physical Debit Card', formatTrilean(tabby.debit.physicalDebitCard), formatTrilean(comp.debit.physicalDebitCard), trileanWinner(tabby.debit.physicalDebitCard, comp.debit.physicalDebitCard))
  add('Debit Card', 'Virtual Debit Card', formatTrilean(tabby.debit.virtualDebitCard), formatTrilean(comp.debit.virtualDebitCard), trileanWinner(tabby.debit.virtualDebitCard, comp.debit.virtualDebitCard))
  add('Debit Card', 'Cashback on Debit', formatTrilean(tabby.debit.cashbackDebit), formatTrilean(comp.debit.cashbackDebit), trileanWinner(tabby.debit.cashbackDebit, comp.debit.cashbackDebit))
  add('Debit Card', 'ATM Withdrawal', formatTrilean(tabby.debit.atmWithdrawal), formatTrilean(comp.debit.atmWithdrawal), trileanWinner(tabby.debit.atmWithdrawal, comp.debit.atmWithdrawal))
  add('Debit Card', 'Supplementary Cards', formatTrilean(tabby.debit.supplementaryCards), formatTrilean(comp.debit.supplementaryCards), trileanWinner(tabby.debit.supplementaryCards, comp.debit.supplementaryCards), 'Extra cards linked to main account; limited controls')

  // Corporate cards
  add('Corporate Cards', 'Corporate Cards Available', formatTrilean(tabby.corporateCards.available), formatTrilean(comp.corporateCards.available), trileanWinner(tabby.corporateCards.available, comp.corporateCards.available))
  add('Corporate Cards', 'Physical Employee Cards', formatTrilean(tabby.corporateCards.physicalCards), formatTrilean(comp.corporateCards.physicalCards), trileanWinner(tabby.corporateCards.physicalCards, comp.corporateCards.physicalCards))
  add('Corporate Cards', 'Virtual Employee Cards', formatTrilean(tabby.corporateCards.virtualCards), formatTrilean(comp.corporateCards.virtualCards), trileanWinner(tabby.corporateCards.virtualCards, comp.corporateCards.virtualCards))
  add('Corporate Cards', 'Per-Card Spend Limits', formatTrilean(tabby.corporateCards.perCardLimits), formatTrilean(comp.corporateCards.perCardLimits), trileanWinner(tabby.corporateCards.perCardLimits, comp.corporateCards.perCardLimits))
  add('Corporate Cards', 'MCC / Category Restrictions', formatTrilean(tabby.corporateCards.mccRestrictions), formatTrilean(comp.corporateCards.mccRestrictions), trileanWinner(tabby.corporateCards.mccRestrictions, comp.corporateCards.mccRestrictions))
  add('Corporate Cards', 'Approval Workflows', formatTrilean(tabby.corporateCards.approvalWorkflows), formatTrilean(comp.corporateCards.approvalWorkflows), trileanWinner(tabby.corporateCards.approvalWorkflows, comp.corporateCards.approvalWorkflows))
  add('Corporate Cards', 'Role-Based Permissions', formatTrilean(tabby.corporateCards.roleBasedPermissions), formatTrilean(comp.corporateCards.roleBasedPermissions), trileanWinner(tabby.corporateCards.roleBasedPermissions, comp.corporateCards.roleBasedPermissions))
  add('Corporate Cards', 'Real-Time Spend Visibility', formatTrilean(tabby.corporateCards.realTimeSpendVisibility), formatTrilean(comp.corporateCards.realTimeSpendVisibility), trileanWinner(tabby.corporateCards.realTimeSpendVisibility, comp.corporateCards.realTimeSpendVisibility))
  add('Corporate Cards', 'Receipt Capture', formatTrilean(tabby.corporateCards.receiptCapture), formatTrilean(comp.corporateCards.receiptCapture), trileanWinner(tabby.corporateCards.receiptCapture, comp.corporateCards.receiptCapture))
  add('Corporate Cards', 'Expense Categorisation', formatTrilean(tabby.corporateCards.expenseCategorisation), formatTrilean(comp.corporateCards.expenseCategorisation), trileanWinner(tabby.corporateCards.expenseCategorisation, comp.corporateCards.expenseCategorisation))
  add('Corporate Cards', 'Accounting Integrations', formatTrilean(tabby.corporateCards.accountingIntegrations), formatTrilean(comp.corporateCards.accountingIntegrations), trileanWinner(tabby.corporateCards.accountingIntegrations, comp.corporateCards.accountingIntegrations))
  add('Corporate Cards', 'ERP Integrations', formatTrilean(tabby.corporateCards.erpIntegrations), formatTrilean(comp.corporateCards.erpIntegrations), trileanWinner(tabby.corporateCards.erpIntegrations, comp.corporateCards.erpIntegrations))
  add('Corporate Cards', 'Reimbursements', formatTrilean(tabby.corporateCards.reimbursements), formatTrilean(comp.corporateCards.reimbursements), trileanWinner(tabby.corporateCards.reimbursements, comp.corporateCards.reimbursements))

  // Credit
  add('Credit & Financing', 'Business Credit Card', formatTrilean(tabby.credit.businessCreditCard), formatTrilean(comp.credit.businessCreditCard), trileanWinner(tabby.credit.businessCreditCard, comp.credit.businessCreditCard))
  add('Credit & Financing', 'Cashback on Credit', formatTrilean(tabby.credit.cashbackCredit), formatTrilean(comp.credit.cashbackCredit), trileanWinner(tabby.credit.cashbackCredit, comp.credit.cashbackCredit))
  add('Credit & Financing', 'Rewards on Credit', formatTrilean(tabby.credit.rewardsCredit), formatTrilean(comp.credit.rewardsCredit), trileanWinner(tabby.credit.rewardsCredit, comp.credit.rewardsCredit))
  add('Credit & Financing', 'Line of Credit', formatTrilean(tabby.credit.lineOfCredit), formatTrilean(comp.credit.lineOfCredit), trileanWinner(tabby.credit.lineOfCredit, comp.credit.lineOfCredit))
  add('Credit & Financing', 'Business Loan', formatTrilean(tabby.credit.businessLoan), formatTrilean(comp.credit.businessLoan), trileanWinner(tabby.credit.businessLoan, comp.credit.businessLoan))
  add('Credit & Financing', 'Supply Chain Finance', formatTrilean(tabby.credit.supplyChainFinance), formatTrilean(comp.credit.supplyChainFinance), trileanWinner(tabby.credit.supplyChainFinance, comp.credit.supplyChainFinance))

  // Onboarding
  add('Onboarding', 'Onboarding Type', tabby.onboarding.type.replace(/_/g, ' '), comp.onboarding.type.replace(/_/g, ' '), winner(onboardingTypeScore(tabby.onboarding.type), onboardingTypeScore(comp.onboarding.type)))
  add('Onboarding', 'Onboarding Speed (days)', formatNum(tabby.onboarding.speedDays), formatNum(comp.onboarding.speedDays), winner(tabby.onboarding.speedDays ?? 10, comp.onboarding.speedDays ?? 10, false))
  add('Onboarding', 'Branch Visit Required', tabby.onboarding.branchVisitRequired ? 'Yes' : 'No', comp.onboarding.branchVisitRequired ? 'Yes' : 'No', !tabby.onboarding.branchVisitRequired && comp.onboarding.branchVisitRequired ? 'tabby' : tabby.onboarding.branchVisitRequired && !comp.onboarding.branchVisitRequired ? 'competitor' : 'tie')
  add('Onboarding', 'Paperwork Intensity', tabby.onboarding.paperworkIntensity, comp.onboarding.paperworkIntensity, winner(paperworkScore(tabby.onboarding.paperworkIntensity), paperworkScore(comp.onboarding.paperworkIntensity)))

  return rows
}

// ─── Insight generator ────────────────────────────────────────────────────────

export function generateInsights(
  tabbyResult: BenchmarkResult,
  competitorResults: BenchmarkResult[],
  competitors: Competitor[],
): Insight[] {
  const insights: Insight[] = []
  const compMap = Object.fromEntries(competitors.map(c => [c.id, c]))

  const avgComp = avg(competitorResults.map(r => r.overallScore))
  const best = competitorResults.reduce((a, b) => (a.overallScore > b.overallScore ? a : b), competitorResults[0])

  // Overall position
  if (tabbyResult.overallScore > avgComp + 0.5) {
    insights.push({ type: 'strength', text: `Tabby scores above the competitor average (${tabbyResult.overallScore.toFixed(1)} vs ${avgComp.toFixed(1)}), making it a competitive overall offer.` })
  } else if (tabbyResult.overallScore < avgComp - 0.5) {
    insights.push({ type: 'weakness', text: `Tabby scores below the competitor average (${tabbyResult.overallScore.toFixed(1)} vs ${avgComp.toFixed(1)}). Focus on areas with the highest weight gaps.` })
  }

  // Onboarding
  if (tabbyResult.categoryScores.onboarding >= 9) {
    insights.push({ type: 'strength', text: 'Tabby clearly wins on onboarding speed — fully digital with same-day setup and no branch visit required.' })
  }

  // Corporate cards vs spend platforms
  const spendPlatforms = competitorResults.filter(r => {
    const c = compMap[r.competitorId]
    return c?.group === 'spend_platform'
  })
  if (spendPlatforms.length > 0) {
    const avgSpendPlatformCards = avg(spendPlatforms.map(r => r.categoryScores.corporateCards))
    if (tabbyResult.categoryScores.corporateCards < avgSpendPlatformCards - 1) {
      insights.push({ type: 'weakness', text: `Tabby underperforms spend platforms on corporate card controls — especially accounting integrations, ERP connections, and reimbursements. Avg spend platform score: ${avgSpendPlatformCards.toFixed(1)}/10.` })
    }
  }

  // Pricing wins
  const pricingWins = competitorResults.filter(r => tabbyResult.categoryScores.pricing > r.categoryScores.pricing + 0.5)
  if (pricingWins.length > 0) {
    const names = pricingWins.map(r => compMap[r.competitorId]?.name).filter(Boolean).join(', ')
    insights.push({ type: 'pricing_win', text: `Tabby wins on pricing vs ${names} — no monthly fee, no minimum balance, and zero card spending fees.` })
  }

  // Best competitor call-out
  if (best && compMap[best.competitorId]) {
    insights.push({ type: 'weakness', text: `${compMap[best.competitorId].name} is the strongest benchmark in this comparison at ${best.overallScore.toFixed(1)}/10. Focus on the gap in the weighted categories.` })
  }

  // Credit gap
  if (tabbyResult.categoryScores.creditFinancing < 3) {
    insights.push({ type: 'weakness', text: 'Tabby has no credit card, business loan, or supply chain finance — this is a material gap vs banks and Wio that offer credit products.' })
  }

  // Feature wins on controlled cards vs traditional banks
  const banks = competitorResults.filter(r => compMap[r.competitorId]?.group === 'traditional_bank')
  if (banks.length > 0) {
    const avgBankCards = avg(banks.map(r => r.categoryScores.corporateCards))
    if (tabbyResult.categoryScores.corporateCards > avgBankCards + 0.5) {
      insights.push({ type: 'feature_win', text: `Tabby's controlled corporate cards outperform the traditional bank average (${tabbyResult.categoryScores.corporateCards.toFixed(1)} vs ${avgBankCards.toFixed(1)}) — with MCC restrictions, approval workflows, and real-time visibility.` })
    }
  }

  return insights
}

// Re-export helpers for components
export { onboardingTypeScore, paperworkScore }
