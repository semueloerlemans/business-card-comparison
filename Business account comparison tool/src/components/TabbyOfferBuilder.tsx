import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react'
import type { TabbyOffer, Trilean } from '../types'

/**
 * Advanced Tabby configuration — covers fields NOT already in the top composer.
 * The top composer owns: business account toggle, debit card toggles (physical/virtual/cashback/ATM),
 * multi-currency, corporate cards umbrella toggle, and the core pricing fields
 * (monthly fee, min balance, local/international transfer fees, FX markup, cashback rate/cap/categories).
 *
 * This builder covers everything else: transfer bundles, payroll/invoicing, debit extras,
 * granular corporate card controls, credit & financing, onboarding, and strategic value.
 */

interface Props {
  tabby: TabbyOffer
  onChange: (t: TabbyOffer) => void
}

function TrileanToggle({ value, onChange }: { value: Trilean; onChange: (v: Trilean) => void }) {
  const opts: { v: Trilean; label: string; cls: string }[] = [
    { v: true, label: 'Yes', cls: 'bg-green-100 text-green-800 border-green-300' },
    { v: false, label: 'No', cls: 'bg-red-50 text-red-700 border-red-200' },
    { v: null, label: '?', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  ]
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      {opts.map(o => (
        <button
          key={String(o.v)}
          onClick={() => onChange(o.v)}
          className={`px-2.5 py-1 text-xs font-medium border-r last:border-r-0 transition-colors ${value === o.v ? o.cls : 'bg-white text-gray-400 hover:bg-gray-50'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function NumField({ value, onChange, placeholder = 'Unknown', suffix = '' }: {
  value: number | null; onChange: (v: number | null) => void; placeholder?: string; suffix?: string
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-24 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-tabby-400"
      />
      {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
    </div>
  )
}

function SelectField<T extends string>({ value, options, onChange }: {
  value: T; options: { v: T; label: string }[]; onChange: (v: T) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-tabby-400"
    >
      {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>
  )
}

interface SectionProps { title: string; children: React.ReactNode; defaultOpen?: boolean }
function Section({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default function TabbyOfferBuilder({ tabby, onChange }: Props) {
  const set = <K extends keyof TabbyOffer>(key: K, val: TabbyOffer[K]) => onChange({ ...tabby, [key]: val })
  const setA = <K extends keyof TabbyOffer['account']>(key: K, val: TabbyOffer['account'][K]) => set('account', { ...tabby.account, [key]: val })
  const setD = <K extends keyof TabbyOffer['debit']>(key: K, val: TabbyOffer['debit'][K]) => set('debit', { ...tabby.debit, [key]: val })
  const setC = <K extends keyof TabbyOffer['corporateCards']>(key: K, val: TabbyOffer['corporateCards'][K]) => set('corporateCards', { ...tabby.corporateCards, [key]: val })
  const setCr = <K extends keyof TabbyOffer['credit']>(key: K, val: TabbyOffer['credit'][K]) => set('credit', { ...tabby.credit, [key]: val })
  const setO = <K extends keyof TabbyOffer['onboarding']>(key: K, val: TabbyOffer['onboarding'][K]) => set('onboarding', { ...tabby.onboarding, [key]: val })
  const setSv = <K extends keyof TabbyOffer['strategicValue']>(key: K, val: TabbyOffer['strategicValue'][K]) => set('strategicValue', { ...tabby.strategicValue, [key]: val })

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-tabby-500" /> Advanced Tabby Configuration
        </span>
        <span className="badge badge-blue">Extends composer</span>
      </div>

      <div className="px-5 py-2 text-[11px] text-gray-500 italic border-b border-gray-100">
        Fine-tune features not covered by the composer above.
      </div>

      <Section title="Account Extras">
        <Row label="Free Local Transfers / month"><NumField value={tabby.account.freeLocalTransfersIncluded} onChange={v => setA('freeLocalTransfersIncluded', v)} /></Row>
        <Row label="Free International Transfers / month"><NumField value={tabby.account.freeInternationalTransfersIncluded} onChange={v => setA('freeInternationalTransfersIncluded', v)} /></Row>
        <Row label="International Payments"><TrileanToggle value={tabby.account.internationalPayments} onChange={v => setA('internationalPayments', v)} /></Row>
        <Row label="Payroll Support"><TrileanToggle value={tabby.account.payrollSupport} onChange={v => setA('payrollSupport', v)} /></Row>
        <Row label="Invoicing Support"><TrileanToggle value={tabby.account.invoicingSupport} onChange={v => setA('invoicingSupport', v)} /></Row>
      </Section>

      <Section title="Debit Card Extras">
        <Row label="Card Spending Fee (AED)"><NumField value={tabby.debit.cardSpendingFee} onChange={v => setD('cardSpendingFee', v)} /></Row>
        <Row label="Rewards on Debit"><TrileanToggle value={tabby.debit.rewardsDebit} onChange={v => setD('rewardsDebit', v)} /></Row>
        <Row label="Supplementary Cards"><TrileanToggle value={tabby.debit.supplementaryCards} onChange={v => setD('supplementaryCards', v)} /></Row>
      </Section>

      <Section title="Corporate Card Controls">
        <p className="text-xs text-gray-500 italic pb-1">Granular settings for the corporate cards programme. Turned on/off at the top via the composer.</p>
        <Row label="Unlimited Cards"><TrileanToggle value={tabby.corporateCards.unlimitedCards} onChange={v => setC('unlimitedCards', v)} /></Row>
        <Row label="Per-Card Spend Limits"><TrileanToggle value={tabby.corporateCards.perCardLimits} onChange={v => setC('perCardLimits', v)} /></Row>
        <Row label="MCC / Category Restrictions"><TrileanToggle value={tabby.corporateCards.mccRestrictions} onChange={v => setC('mccRestrictions', v)} /></Row>
        <Row label="Approval Workflows"><TrileanToggle value={tabby.corporateCards.approvalWorkflows} onChange={v => setC('approvalWorkflows', v)} /></Row>
        <Row label="Role-Based Permissions"><TrileanToggle value={tabby.corporateCards.roleBasedPermissions} onChange={v => setC('roleBasedPermissions', v)} /></Row>
        <Row label="Real-Time Spend Visibility"><TrileanToggle value={tabby.corporateCards.realTimeSpendVisibility} onChange={v => setC('realTimeSpendVisibility', v)} /></Row>
        <Row label="Receipt Capture"><TrileanToggle value={tabby.corporateCards.receiptCapture} onChange={v => setC('receiptCapture', v)} /></Row>
        <Row label="Expense Categorisation"><TrileanToggle value={tabby.corporateCards.expenseCategorisation} onChange={v => setC('expenseCategorisation', v)} /></Row>
        <Row label="Accounting Integrations"><TrileanToggle value={tabby.corporateCards.accountingIntegrations} onChange={v => setC('accountingIntegrations', v)} /></Row>
        <Row label="ERP Integrations"><TrileanToggle value={tabby.corporateCards.erpIntegrations} onChange={v => setC('erpIntegrations', v)} /></Row>
        <Row label="Procurement Workflows"><TrileanToggle value={tabby.corporateCards.procurementWorkflows} onChange={v => setC('procurementWorkflows', v)} /></Row>
        <Row label="Reimbursements"><TrileanToggle value={tabby.corporateCards.reimbursements} onChange={v => setC('reimbursements', v)} /></Row>
      </Section>

      <Section title="Credit & Financing">
        <Row label="Business Credit Card"><TrileanToggle value={tabby.credit.businessCreditCard} onChange={v => setCr('businessCreditCard', v)} /></Row>
        <Row label="Cashback on Credit"><TrileanToggle value={tabby.credit.cashbackCredit} onChange={v => setCr('cashbackCredit', v)} /></Row>
        <Row label="Rewards on Credit"><TrileanToggle value={tabby.credit.rewardsCredit} onChange={v => setCr('rewardsCredit', v)} /></Row>
        <Row label="Annual Fee (AED)"><NumField value={tabby.credit.annualFee} onChange={v => setCr('annualFee', v)} /></Row>
        <Row label="Line of Credit"><TrileanToggle value={tabby.credit.lineOfCredit} onChange={v => setCr('lineOfCredit', v)} /></Row>
        <Row label="Business Loan"><TrileanToggle value={tabby.credit.businessLoan} onChange={v => setCr('businessLoan', v)} /></Row>
        <Row label="Supply Chain Finance"><TrileanToggle value={tabby.credit.supplyChainFinance} onChange={v => setCr('supplyChainFinance', v)} /></Row>
      </Section>

      <Section title="Onboarding">
        <Row label="Onboarding Type">
          <SelectField
            value={tabby.onboarding.type}
            options={[
              { v: 'fully_digital', label: 'Fully Digital' },
              { v: 'hybrid', label: 'Hybrid' },
              { v: 'physical', label: 'Physical' },
            ]}
            onChange={v => setO('type', v)}
          />
        </Row>
        <Row label="Onboarding Speed (days)"><NumField value={tabby.onboarding.speedDays} onChange={v => setO('speedDays', v)} /></Row>
        <Row label="Branch Visit Required">
          <TrileanToggle
            value={tabby.onboarding.branchVisitRequired}
            onChange={v => setO('branchVisitRequired', v === true)}
          />
        </Row>
        <Row label="Paperwork Intensity">
          <SelectField
            value={tabby.onboarding.paperworkIntensity}
            options={[
              { v: 'low', label: 'Low' },
              { v: 'medium', label: 'Medium' },
              { v: 'high', label: 'High' },
            ]}
            onChange={v => setO('paperworkIntensity', v)}
          />
        </Row>
        <Row label="UAE SME Friendly (1-10)"><NumField value={tabby.onboarding.uaeSmeFriendly ?? null} onChange={v => setO('uaeSmeFriendly', v)} /></Row>
        <Row label="Startup Friendly (1-10)"><NumField value={tabby.onboarding.startupFriendly ?? null} onChange={v => setO('startupFriendly', v)} /></Row>
      </Section>

      <Section title="Strategic Value">
        <Row label="Instant Access to Tabby Earnings">
          <TrileanToggle value={tabby.strategicValue.instantAccessToMerchantEarnings} onChange={v => setSv('instantAccessToMerchantEarnings', v === true)} />
        </Row>
        <Row label="Avoids Settlement Delay">
          <TrileanToggle value={tabby.strategicValue.avoidsSettlementDelay ?? null} onChange={v => setSv('avoidsSettlementDelay', v === true)} />
        </Row>
      </Section>
    </div>
  )
}
