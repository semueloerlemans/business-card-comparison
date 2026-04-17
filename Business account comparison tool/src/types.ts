// ─── Core domain types ───────────────────────────────────────────────────────

export type CompetitorGroup = 'traditional_bank' | 'spend_platform'
export type TargetSegment = 'micro' | 'small' | 'medium' | 'enterprise' | 'corporate'
export type OnboardingType = 'fully_digital' | 'hybrid' | 'physical'
export type PaperworkIntensity = 'low' | 'medium' | 'high'

// Tri-state: true = confirmed yes, false = confirmed no, null = unknown
export type Trilean = boolean | null

export interface AccountFeatures {
  businessAccount: Trilean
  monthlyFee: number | null          // AED/month, null = unknown
  monthlyFeeAltTier?: number | null  // alternate/higher tier monthly fee
  monthlyFeeNote?: string
  setupFee: number | null            // AED one-off, null = unknown
  minimumBalance: number | null      // AED, null = unknown
  minimumBalanceNote?: string
  belowMinFee?: number | null        // AED/month charged when below minimum balance
  belowMinFeeNote?: string
  accountOpeningAmount?: number | null
  accountOpeningAmountNote?: string
  benchmarkTier?: string             // named account tier used as the SME benchmark
  localTransferFee: number | null    // AED per transfer, null = unknown
  localTransferFeeCurrency?: string
  localTransferFeeNote?: string
  localTransferFeeBranch?: number | null
  internalTransferFee?: number | null
  internalTransferFeeBranch?: number | null
  internalThirdPartyTransferFee?: number | null
  internalThirdPartyTransferFeeNote?: string
  internationalTransferFee: number | null
  internationalTransferFeeNote?: string
  internationalTransferFeeBranch?: number | null
  internationalTransferFeeOur?: number | null
  internationalTransferFeeOurNote?: string
  freeLocalTransfersIncluded: number | null
  freeInternationalTransfersIncluded: number | null
  dailyTransferLimit?: number | null
  multiCurrency: Trilean
  incomingTransfers: Trilean
  outgoingTransfers: Trilean
  internationalPayments: Trilean
  payrollSupport: Trilean
  invoicingSupport: Trilean
}

/** Debit card tied to the primary account — limited or no per-card controls */
export interface DebitFeatures {
  debitCardIncluded: Trilean
  physicalDebitCard: Trilean
  virtualDebitCard: Trilean
  cashbackDebit: Trilean
  /** Cashback rate as a percentage on relevant debit spend (e.g. advertising). null = unknown */
  cashbackDebitPercent?: number | null
  /** Monthly AED cap on total cashback earned. null = no cap / unknown */
  cashbackDebitMonthlyCap?: number | null
  /** Category IDs that cashback applies to (e.g. ['advertising'], ['all'], ['all_international']) */
  cashbackDebitCategories?: string[]
  rewardsDebit: Trilean
  cardSpendingFee: number | null     // AED per spend event, 0 = free, null = unknown
  fxMarkup: number | null            // percentage, null = unknown
  fxMarkupAEDAbroad?: number | null  // extra markup when AED card is used abroad
  extraSchemeFee?: number | null     // scheme/MasterCard/Visa uplift %
  atmWithdrawal: Trilean
  /** Extra cards linked to same account, limited controls */
  supplementaryCards: Trilean
  replacementFee?: number | null
  dailyWithdrawalLimit?: number | null
  dailyPurchaseLimit?: number | null
  dailyDepositLimit?: number | null
  dailyTransactionLimit?: number | null
}

/**
 * Corporate / controlled cards — assigned to employees/teams, with
 * configurable limits, MCC restrictions, approval policies, etc.
 * This is explicitly distinct from supplementary debit cards.
 */
export interface CorporateCardFeatures {
  available: Trilean
  physicalCards: Trilean
  virtualCards: Trilean
  unlimitedCards: Trilean
  perCardLimits: Trilean
  /** Category / MCC restrictions on individual cards */
  mccRestrictions: Trilean
  approvalWorkflows: Trilean
  roleBasedPermissions: Trilean
  realTimeSpendVisibility: Trilean
  receiptCapture: Trilean
  expenseCategorisation: Trilean
  accountingIntegrations: Trilean
  erpIntegrations: Trilean
  procurementWorkflows: Trilean
  reimbursements: Trilean
  maxActiveVirtualCards?: number | null
  maxVirtualCardsCreatedDaily?: number | null
}

export interface CreditFeatures {
  businessCreditCard: Trilean
  cashbackCredit: Trilean
  rewardsCredit: Trilean
  annualFee: number | null           // AED, 0 = free, null = unknown
  annualFeeAltTier?: number | null
  annualFeeNote?: string
  creditLimit: number | null         // indicative AED, null = unknown
  lineOfCredit: Trilean
  businessLoan: Trilean
  supplyChainFinance: Trilean
  gracePeriodDays?: number | null
  supplementaryCardsIncluded?: number | null
  supplementaryCardsFeeFrom?: number | null
  supplementaryCardFee?: number | null
  monthlyProfitRate?: number | null
  neobizDedicatedCreditCard?: Trilean
  quickCash?: Trilean
  quickCashLimitPct?: number | null
  depositBackedCredit?: Trilean
  depositBackedLimitPct?: number | null
  minimumRepaymentPct?: number | null
  minimumRepaymentFloor?: number | null
  exampleMonthlyRolloverRate?: number | null
  exampleAPR?: number | null
  cashbackRate?: number | null
  cashbackCap?: number | null
}

export interface OnboardingFeatures {
  type: OnboardingType
  speedDays: number | null           // working days, null = unknown
  branchVisitRequired: boolean
  paperworkIntensity: PaperworkIntensity
  uaeSmeFriendly?: number | null     // 1-10, null = unknown (Tabby-specific field)
  startupFriendly?: number | null    // 1-10, null = unknown (Tabby-specific field)
}

export interface StrategicValue {
  /** True only for Tabby: merchants get Tabby earnings immediately */
  instantAccessToMerchantEarnings: boolean
  /** True only for Tabby: bypasses the standard 7-day+ settlement cycle */
  avoidsSettlementDelay?: boolean
  cashFlowValueScore: number         // 1-10
  merchantNativeRelevanceScore: number // 1-10
  tabbyMerchantSpecificAdvantage?: boolean
}

// ─── Top-level competitor record ─────────────────────────────────────────────

export interface Competitor {
  id: string
  name: string
  group: CompetitorGroup
  targetSegment: TargetSegment[]
  account: AccountFeatures
  debit: DebitFeatures
  corporateCards: CorporateCardFeatures
  credit: CreditFeatures
  onboarding: OnboardingFeatures
  strategicValue: StrategicValue
  notes: string[]
}

// Tabby is modelled identically but flagged separately
export type TabbyOffer = Competitor & { category: 'planned_offer' }

// ─── Scoring types ────────────────────────────────────────────────────────────

export interface CategoryWeights {
  accountAndTransfers: number
  debitCard: number
  corporateCards: number
  creditFinancing: number
  onboarding: number
  pricing: number
}

export type ScoringMode = 'micro_merchant' | 'small_business' | 'medium_business' | 'custom'

export interface CategoryScores {
  accountAndTransfers: number
  debitCard: number
  corporateCards: number
  creditFinancing: number
  onboarding: number
  pricing: number
}

export interface BenchmarkResult {
  competitorId: string
  overallScore: number       // 0-10
  percentageScore: number    // 0-100
  categoryScores: CategoryScores
  confidence: number         // 0-100 — dataset completeness %
  populatedFields: number
  totalFields: number
}

export interface ComparisonRow {
  category: string
  feature: string
  tabbyValue: string
  competitorValue: string
  winner: 'tabby' | 'competitor' | 'tie' | 'unknown'
  notes?: string
}

export interface Insight {
  type: 'strength' | 'weakness' | 'pricing_win' | 'feature_win'
  text: string
}

// ─── Scenario (localStorage persistence) ────────────────────────────────────

export interface Scenario {
  id: string
  name: string
  createdAt: string
  tabby: TabbyOffer
  competitors: Competitor[]
  weights: CategoryWeights
  scoringMode: ScoringMode
  selectedCompetitorIds: string[]
  notes: string
}

// ─── Filter state ─────────────────────────────────────────────────────────────

export interface FilterState {
  group: 'all' | CompetitorGroup
  segment: 'all' | TargetSegment
  hasBusinessAccount: boolean
  hasControlledCards: boolean
  hasCreditCard: boolean
  fullyDigital: boolean
  hasCashback: boolean
  zeroMonthlyFee: boolean
}
