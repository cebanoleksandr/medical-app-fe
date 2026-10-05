import type { DashboardParams, EntityMethod, EntityType, Framework } from '../../api/types'
import { colors } from '../../theme'

export const ALL_ANALYSES_URL = '/app/analyses'

export type PeriodDays = '7' | '30' | '90'

export const PERIOD_OPTIONS: { value: PeriodDays; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export type FrameworkFilter = Framework | 'ALL'

/** From local midnight `days - 1` days ago until now, counted in the user's zone. */
export function periodParams(days: PeriodDays, framework: FrameworkFilter): DashboardParams {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate() - (Number(days) - 1))
  return {
    from: from.toISOString(),
    framework: framework === 'ALL' ? undefined : framework,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  HIPAA: 'HIPAA',
  EU_GDPR: 'EU GDPR',
  UK_GDPR: 'UK GDPR',
  SWISS_FADP: 'Swiss FADP',
}

export const FRAMEWORK_ORDER = Object.keys(FRAMEWORK_LABELS) as Framework[]

/** Fixed per framework (never by rank), so a filter never repaints a slice. */
export const FRAMEWORK_COLORS: Record<Framework, string> = {
  HIPAA: colors.primary[800],
  EU_GDPR: colors.primary[500],
  UK_GDPR: colors.accent[400],
  SWISS_FADP: colors.accent[600],
}

/** Order from the design; Token sits next to the placeholder it resembles. */
export const METHOD_ORDER: EntityMethod[] = [
  'REDACT',
  'PLACEHOLDER',
  'TOKEN',
  'MASK',
  'HASH',
  'GENERALISE',
  'PSEUDONYMISE',
  'SYNTHETIC',
  'NLP_REDACTION',
]

export const METHOD_LABELS: Record<EntityMethod, string> = {
  REDACT: 'Redact',
  PLACEHOLDER: 'Replace',
  TOKEN: 'Token',
  MASK: 'Mask',
  HASH: 'Hash',
  GENERALISE: 'Generalise',
  PSEUDONYMISE: 'Pseudonymise',
  SYNTHETIC: 'Synthetic',
  NLP_REDACTION: 'NLP redaction',
}

const ENTITY_LABELS: Record<EntityType, string> = {
  PERSON: 'Person',
  ORGANIZATION: 'Organisation',
  LOCATION: 'Location',
  DATE_TIME: 'Date / Time',
  IP: 'IP Address',
  GEOPOINT: 'Geopoint',
  NATIONAL_ID: 'National ID',
  ID_NUMBER: 'ID Number',
  PASSPORT: 'Passport',
  CREDIT_CARD: 'Credit Card',
  BANK_ACCOUNT: 'Bank Account',
  EMAIL: 'Email',
  PHONE: 'Phone',
  MEDICAL_RECORD_NUMBER: 'MRN',
  DEVICE_ID: 'Device ID',
  FREE_TEXT: 'Free Text PHI',
  BIOLOGICAL_DATA: 'Bio. Data',
  PHOTO: 'Photo / Image',
}

/** Types outside the catalogue arrive as raw detector names, e.g. US_BANK_NUMBER. */
export const entityLabel = (type: string) =>
  ENTITY_LABELS[type as EntityType] ?? type.replace(/_/g, ' ')

const numberFormat = new Intl.NumberFormat('en-US')
export const formatNumber = (value: number) => numberFormat.format(value)

export const formatRate = (rate: number | null) =>
  rate === null ? '—' : `${(rate * 100).toFixed(1)}%`

const shortDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' })
const longDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** "2026-04-01" (a calendar day, no zone) → "01 Apr". */
export const formatDay = (day: string) => shortDate.format(new Date(`${day}T00:00:00`))
export const formatLongDay = (day: string) => longDate.format(new Date(`${day}T00:00:00`))
export const formatDate = (iso: string) => longDate.format(new Date(iso))

/** A round top for the axis and evenly spaced ticks: 0, 200, … 1000. */
export function niceScale(max: number, ticks = 5) {
  if (max <= 0) return { max: ticks, ticks: Array.from({ length: ticks + 1 }, (_, i) => i) }
  const raw = max / ticks
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  // Counts are whole numbers, so ticks are too.
  const step = Math.max(
    1,
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw && Number.isInteger(s)) ??
      Math.ceil(10 * magnitude),
  )
  const top = step * ticks
  return { max: top, ticks: Array.from({ length: ticks + 1 }, (_, i) => i * step) }
}
