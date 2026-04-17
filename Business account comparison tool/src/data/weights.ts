import type { CategoryWeights, ScoringMode } from '../types'

export const defaultWeights: CategoryWeights = {
  accountAndTransfers: 20,
  debitCard: 10,
  corporateCards: 25,
  creditFinancing: 15,
  onboarding: 20,
  pricing: 10,
}

/** Pre-built weight presets for each scoring mode */
export const scoringPresets: Record<ScoringMode, { label: string; description: string; weights: CategoryWeights }> = {
  micro_merchant: {
    label: 'Micro Merchant',
    description: 'Prioritises onboarding speed, low fixed cost, and simplicity.',
    weights: {
      accountAndTransfers: 20,
      debitCard: 15,
      corporateCards: 10,
      creditFinancing: 5,
      onboarding: 25,
      pricing: 25,
    },
  },
  small_business: {
    label: 'Small Business',
    description: 'Balances account utility, card controls, pricing, and employee expense management.',
    weights: {
      accountAndTransfers: 20,
      debitCard: 10,
      corporateCards: 25,
      creditFinancing: 15,
      onboarding: 20,
      pricing: 10,
    },
  },
  medium_business: {
    label: 'Medium Business',
    description: 'Prioritises controls, integrations, credit access, and admin workflows.',
    weights: {
      accountAndTransfers: 15,
      debitCard: 5,
      corporateCards: 30,
      creditFinancing: 25,
      onboarding: 15,
      pricing: 10,
    },
  },
  custom: {
    label: 'Custom',
    description: 'Manually configured weights.',
    weights: defaultWeights,
  },
}

export const categoryLabels: Record<keyof CategoryWeights, string> = {
  accountAndTransfers: 'Account & Transfers',
  debitCard: 'Debit Card',
  corporateCards: 'Corporate / Controlled Cards',
  creditFinancing: 'Credit & Financing',
  onboarding: 'Onboarding',
  pricing: 'Pricing',
}
