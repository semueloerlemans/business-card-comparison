import type { TabbyOffer } from '../types'

/**
 * Default Tabby offering — these values seed the composer at the top of the app.
 * All fields remain editable by the user.
 */
export const defaultTabby: TabbyOffer = {
  id: 'tabby',
  name: 'Tabby',
  category: 'planned_offer',
  group: 'spend_platform',
  targetSegment: ['micro', 'small', 'medium'],
  account: {
    businessAccount: true,
    monthlyFee: 0,
    setupFee: 0,
    minimumBalance: 0,
    localTransferFee: 5,
    localTransferFeeCurrency: 'AED',
    localTransferFeeNote: 'plus VAT per transfer',
    internationalTransferFee: 40,
    freeLocalTransfersIncluded: 0,
    freeInternationalTransfersIncluded: 0,
    multiCurrency: false,
    incomingTransfers: true,
    outgoingTransfers: true,
    internationalPayments: true,
    payrollSupport: false,
    invoicingSupport: false,
  },
  debit: {
    debitCardIncluded: true,
    physicalDebitCard: false,        // off by default
    virtualDebitCard: true,
    cashbackDebit: true,             // on by default (0.5% on advertising)
    cashbackDebitPercent: 0.5,
    cashbackDebitMonthlyCap: null,   // no cap by default
    cashbackDebitCategories: ['advertising'],
    rewardsDebit: false,
    cardSpendingFee: 0,
    fxMarkup: 2.5,                   // 2.5% default
    atmWithdrawal: false,
    supplementaryCards: true,
  },
  corporateCards: {
    available: false,                // off by default
    physicalCards: false,
    virtualCards: false,
    unlimitedCards: false,
    perCardLimits: false,
    mccRestrictions: false,
    approvalWorkflows: false,
    roleBasedPermissions: false,
    realTimeSpendVisibility: false,
    receiptCapture: false,
    expenseCategorisation: false,
    accountingIntegrations: false,
    erpIntegrations: false,
    procurementWorkflows: false,
    reimbursements: false,
  },
  credit: {
    businessCreditCard: false,
    cashbackCredit: false,
    rewardsCredit: false,
    annualFee: null,
    creditLimit: null,
    lineOfCredit: false,
    businessLoan: false,
    supplyChainFinance: false,
  },
  onboarding: {
    type: 'fully_digital',
    speedDays: 1,
    branchVisitRequired: false,
    paperworkIntensity: 'medium',    // medium, not low
    uaeSmeFriendly: 9,
    startupFriendly: 9,
  },
  strategicValue: {
    instantAccessToMerchantEarnings: true,
    avoidsSettlementDelay: true,
    cashFlowValueScore: 10,
    merchantNativeRelevanceScore: 10,
    tabbyMerchantSpecificAdvantage: true,
  },
  notes: [
    'Core proposition is business account + debit card + controlled employee cards',
    'External transfers cost AED 5 + VAT per transfer',
    'Card spending should not cost merchants',
    'Big differentiator is immediate access to Tabby earnings instead of waiting for payout cycles that can be around 7 days or longer',
  ],
}

/** Default pricing values used by the composer when a field is cleared */
export const tabbyDefaults = {
  monthlyFee: 0,
  setupFee: 0,
  minimumBalance: 0,
  localTransferFee: 5,
  internationalTransferFee: 40,
  fxMarkup: 2.5,
  cashbackDebitPercent: 0.5,
} as const

/**
 * Cashback category options for the composer.
 * 'all' and 'all_international' are special compound options that override individual picks.
 */
export const cashbackCategoryOptions: { id: string; label: string; compound?: boolean }[] = [
  { id: 'all', label: 'All Spend', compound: true },
  { id: 'all_international', label: 'All International', compound: true },
  { id: 'advertising', label: 'Advertising' },
  { id: 'dining', label: 'Dining' },
  { id: 'travel', label: 'Travel' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'online', label: 'Online' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'software', label: 'Software / SaaS' },
]
