import { Wand2, Check, RotateCcw, Gift } from 'lucide-react'
import type { TabbyOffer } from '../types'
import { tabbyDefaults, defaultTabby, cashbackCategoryOptions } from '../data/tabby'

interface Props {
  tabby: TabbyOffer
  onChange: (t: TabbyOffer) => void
}

interface FeatureToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

function FeatureToggle({ label, description, checked, onChange }: FeatureToggleProps) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
      checked ? 'bg-tabby-50 border-tabby-300' : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 mt-0.5 transition-colors ${
        checked ? 'bg-tabby-500 border-tabby-500' : 'border-gray-300 bg-white'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${checked ? 'text-tabby-900' : 'text-gray-700'}`}>{label}</div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
      </div>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
    </label>
  )
}

interface PriceInputProps {
  label: string
  value: number | null
  defaultValue: number
  prefix?: string
  suffix?: string
  step?: number
  onChange: (v: number) => void
}

function PriceInput({ label, value, defaultValue, prefix, suffix, step = 1, onChange }: PriceInputProps) {
  const displayValue = value === null ? defaultValue : value
  const isDefault = displayValue === defaultValue

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {!isDefault && (
          <button
            onClick={() => onChange(defaultValue)}
            className="text-tabby-600 hover:text-tabby-700 flex items-center gap-0.5 text-[10px]"
            title="Reset to default"
          >
            <RotateCcw className="w-2.5 h-2.5" /> default
          </button>
        )}
      </label>
      <div className={`flex items-center rounded-lg border bg-white transition-colors ${
        isDefault ? 'border-gray-200' : 'border-tabby-300 ring-1 ring-tabby-100'
      }`}>
        {prefix && <span className="pl-3 text-xs text-gray-500 font-medium">{prefix}</span>}
        <input
          type="number"
          value={displayValue}
          step={step}
          min={0}
          onChange={e => onChange(e.target.value === '' ? defaultValue : Number(e.target.value))}
          className="flex-1 px-2.5 py-2 text-sm bg-transparent focus:outline-none min-w-0"
        />
        {suffix && <span className="pr-3 text-xs text-gray-500 font-medium">{suffix}</span>}
      </div>
    </div>
  )
}

export default function TabbyAccountComposer({ tabby, onChange }: Props) {
  // ─── Feature toggle handlers ────────────────────────────────────────────────

  const toggleBusinessAccount = (v: boolean) => {
    onChange({ ...tabby, account: { ...tabby.account, businessAccount: v } })
  }

  const togglePhysicalCard = (v: boolean) => {
    onChange({
      ...tabby,
      debit: {
        ...tabby.debit,
        physicalDebitCard: v,
        // if neither physical nor virtual, debit card is effectively off
        debitCardIncluded: v || tabby.debit.virtualDebitCard === true,
      },
    })
  }

  const toggleVirtualCard = (v: boolean) => {
    onChange({
      ...tabby,
      debit: {
        ...tabby.debit,
        virtualDebitCard: v,
        debitCardIncluded: v || tabby.debit.physicalDebitCard === true,
      },
    })
  }

  const toggleCashbackDebit = (v: boolean) => {
    onChange({
      ...tabby,
      debit: {
        ...tabby.debit,
        cashbackDebit: v,
        cashbackDebitPercent: v ? (tabby.debit.cashbackDebitPercent ?? tabbyDefaults.cashbackDebitPercent) : null,
        cashbackDebitCategories: v
          ? (tabby.debit.cashbackDebitCategories && tabby.debit.cashbackDebitCategories.length > 0
              ? tabby.debit.cashbackDebitCategories
              : ['advertising'])
          : [],
      },
    })
  }

  const setCashbackCap = (v: number | null) => {
    onChange({ ...tabby, debit: { ...tabby.debit, cashbackDebitMonthlyCap: v } })
  }

  // Category selection — compound options ('all', 'all_international') replace any selection.
  // Picking an individual category removes the compound selection.
  const toggleCashbackCategory = (id: string) => {
    const current = tabby.debit.cashbackDebitCategories ?? []
    const opt = cashbackCategoryOptions.find(o => o.id === id)
    let next: string[]

    if (opt?.compound) {
      // Compound: if already selected, clear it. Otherwise set it as the only selection.
      next = current.includes(id) ? [] : [id]
    } else {
      // Individual: remove any compound selection, toggle this one
      const withoutCompound = current.filter(c => {
        const o = cashbackCategoryOptions.find(opt => opt.id === c)
        return !o?.compound
      })
      next = withoutCompound.includes(id)
        ? withoutCompound.filter(c => c !== id)
        : [...withoutCompound, id]
    }
    onChange({ ...tabby, debit: { ...tabby.debit, cashbackDebitCategories: next } })
  }

  const toggleAtm = (v: boolean) => {
    onChange({ ...tabby, debit: { ...tabby.debit, atmWithdrawal: v } })
  }

  // When corporate cards are toggled, cascade to all sub-features.
  // Reset to defaultTabby's corporate capabilities when turning on (rich controls package).
  const toggleCorporateCards = (v: boolean) => {
    if (v) {
      onChange({
        ...tabby,
        corporateCards: {
          available: true,
          physicalCards: true,
          virtualCards: true,
          unlimitedCards: false,
          perCardLimits: true,
          mccRestrictions: true,
          approvalWorkflows: true,
          roleBasedPermissions: true,
          realTimeSpendVisibility: true,
          receiptCapture: true,
          expenseCategorisation: true,
          accountingIntegrations: false,
          erpIntegrations: false,
          procurementWorkflows: false,
          reimbursements: false,
        },
      })
    } else {
      onChange({
        ...tabby,
        corporateCards: {
          available: false,
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
      })
    }
  }

  const toggleMultiCurrency = (v: boolean) => {
    onChange({ ...tabby, account: { ...tabby.account, multiCurrency: v } })
  }

  // ─── Price handlers ─────────────────────────────────────────────────────────
  const setMonthlyFee = (v: number) => onChange({ ...tabby, account: { ...tabby.account, monthlyFee: v } })
  const setSetupFee = (v: number) => onChange({ ...tabby, account: { ...tabby.account, setupFee: v } })
  const setMinBalance = (v: number) => onChange({ ...tabby, account: { ...tabby.account, minimumBalance: v } })
  const setLocalFee = (v: number) => onChange({ ...tabby, account: { ...tabby.account, localTransferFee: v } })
  const setIntlFee = (v: number) => onChange({ ...tabby, account: { ...tabby.account, internationalTransferFee: v } })
  const setFxMarkup = (v: number) => onChange({ ...tabby, debit: { ...tabby.debit, fxMarkup: v } })
  const setCashbackPct = (v: number) => onChange({ ...tabby, debit: { ...tabby.debit, cashbackDebitPercent: v } })

  const resetToDefault = () => onChange(defaultTabby)

  return (
    <section className="section-card no-print">
      <div className="section-header">
        <span className="section-title flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-tabby-500" />
          Compose Tabby's Business Account
        </span>
        <button
          onClick={resetToDefault}
          className="text-xs text-gray-500 hover:text-tabby-600 flex items-center gap-1 transition-colors"
          title="Reset all fields to default Tabby offer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
        </button>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* ─── Feature toggles ───────────────────────────────────────────── */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FeatureToggle
              label="Business Account"
              description="Core account with local & international transfers"
              checked={tabby.account.businessAccount === true}
              onChange={toggleBusinessAccount}
            />
            <FeatureToggle
              label="Physical Debit Card"
              description="Issued plastic card for in-person spend"
              checked={tabby.debit.physicalDebitCard === true}
              onChange={togglePhysicalCard}
            />
            <FeatureToggle
              label="Virtual Debit Card"
              description="Instant digital card for online use"
              checked={tabby.debit.virtualDebitCard === true}
              onChange={toggleVirtualCard}
            />
            <FeatureToggle
              label="Corporate Cards"
              description="Employee cards with limits & controls"
              checked={tabby.corporateCards.available === true}
              onChange={toggleCorporateCards}
            />
            <FeatureToggle
              label="ATM Withdrawal"
              description="Cash withdrawal at ATMs"
              checked={tabby.debit.atmWithdrawal === true}
              onChange={toggleAtm}
            />
            <FeatureToggle
              label="Multi-Currency"
              description="Hold & transact in multiple currencies"
              checked={tabby.account.multiCurrency === true}
              onChange={toggleMultiCurrency}
            />
          </div>
        </div>

        {/* ─── Pricing inputs ────────────────────────────────────────────── */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pricing</h3>
          <div className="grid grid-cols-2 gap-3">
            <PriceInput
              label="Monthly Fee"
              value={tabby.account.monthlyFee}
              defaultValue={tabbyDefaults.monthlyFee}
              prefix="AED"
              onChange={setMonthlyFee}
            />
            <PriceInput
              label="Set-up Fee"
              value={tabby.account.setupFee}
              defaultValue={tabbyDefaults.setupFee}
              prefix="AED"
              onChange={setSetupFee}
            />
            <PriceInput
              label="Minimum Balance"
              value={tabby.account.minimumBalance}
              defaultValue={tabbyDefaults.minimumBalance}
              prefix="AED"
              onChange={setMinBalance}
            />
            <PriceInput
              label="Local Transfer"
              value={tabby.account.localTransferFee}
              defaultValue={tabbyDefaults.localTransferFee}
              prefix="AED"
              onChange={setLocalFee}
            />
            <PriceInput
              label="Intl. Transfer"
              value={tabby.account.internationalTransferFee}
              defaultValue={tabbyDefaults.internationalTransferFee}
              prefix="AED"
              onChange={setIntlFee}
            />
            <PriceInput
              label="FX Markup"
              value={tabby.debit.fxMarkup}
              defaultValue={tabbyDefaults.fxMarkup}
              suffix="%"
              step={0.1}
              onChange={setFxMarkup}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
            Default prices apply unless overridden. Fields highlighted in green indicate custom values.
          </p>
        </div>
      </div>

      {/* ─── Cashback details — always visible, controlled by header switch ─ */}
      <div className="px-6 pb-5 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3 mt-3">
          <div className="flex items-center gap-2">
            <Gift className={`w-4 h-4 ${tabby.debit.cashbackDebit === true ? 'text-tabby-500' : 'text-gray-300'}`} />
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cashback Details</h3>
          </div>
          <button
            role="switch"
            aria-checked={tabby.debit.cashbackDebit === true}
            onClick={() => toggleCashbackDebit(tabby.debit.cashbackDebit !== true)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              tabby.debit.cashbackDebit === true ? 'bg-tabby-500' : 'bg-gray-200'
            }`}
            title={tabby.debit.cashbackDebit === true ? 'Turn cashback off' : 'Turn cashback on'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                tabby.debit.cashbackDebit === true ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-[140px_180px_1fr] gap-4 transition-opacity ${
            tabby.debit.cashbackDebit === true ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}
          aria-disabled={tabby.debit.cashbackDebit !== true}
        >
            {/* Rate */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
                <span>Rate</span>
                {tabby.debit.cashbackDebitPercent !== tabbyDefaults.cashbackDebitPercent && (
                  <button
                    onClick={() => setCashbackPct(tabbyDefaults.cashbackDebitPercent)}
                    className="text-tabby-600 hover:text-tabby-700 flex items-center gap-0.5 text-[10px]"
                    title="Reset to default"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> default
                  </button>
                )}
              </label>
              <div className={`flex items-center rounded-lg border bg-white transition-colors ${
                tabby.debit.cashbackDebitPercent === tabbyDefaults.cashbackDebitPercent
                  ? 'border-gray-200'
                  : 'border-tabby-300 ring-1 ring-tabby-100'
              }`}>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={tabby.debit.cashbackDebitPercent ?? tabbyDefaults.cashbackDebitPercent}
                  onChange={e => setCashbackPct(e.target.value === '' ? tabbyDefaults.cashbackDebitPercent : Number(e.target.value))}
                  className="flex-1 px-2.5 py-2 text-sm bg-transparent focus:outline-none min-w-0"
                />
                <span className="pr-3 text-xs text-gray-500 font-medium">%</span>
              </div>
            </div>

            {/* Monthly cap */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Monthly Cap</label>
              <div className={`flex items-center rounded-lg border bg-white transition-colors ${
                tabby.debit.cashbackDebitMonthlyCap ? 'border-tabby-300 ring-1 ring-tabby-100' : 'border-gray-200'
              }`}>
                <span className="pl-3 text-xs text-gray-500 font-medium">AED</span>
                <input
                  type="number"
                  min={0}
                  value={tabby.debit.cashbackDebitMonthlyCap ?? ''}
                  placeholder="No cap"
                  onChange={e => setCashbackCap(e.target.value === '' ? null : Number(e.target.value))}
                  className="flex-1 px-2.5 py-2 text-sm bg-transparent focus:outline-none min-w-0 placeholder:text-gray-300"
                />
                {tabby.debit.cashbackDebitMonthlyCap !== null && tabby.debit.cashbackDebitMonthlyCap !== undefined && (
                  <button
                    onClick={() => setCashbackCap(null)}
                    className="pr-3 text-gray-400 hover:text-tabby-600"
                    title="Remove cap"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Leave empty for no monthly cap.</p>
            </div>

            {/* Category pills */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Eligible Categories
                <span className="text-gray-400 ml-1 font-normal">
                  ({(tabby.debit.cashbackDebitCategories ?? []).length} selected)
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {cashbackCategoryOptions.map(opt => {
                  const selected = (tabby.debit.cashbackDebitCategories ?? []).includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleCashbackCategory(opt.id)}
                      className={`text-xs rounded-full px-3 py-1 border font-medium transition-all ${
                        selected
                          ? opt.compound
                            ? 'bg-tabby-500 text-white border-tabby-500'
                            : 'bg-tabby-50 border-tabby-300 text-tabby-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Picking "All Spend" or "All International" replaces individual categories.
              </p>
            </div>
          </div>
        </div>
    </section>
  )
}
