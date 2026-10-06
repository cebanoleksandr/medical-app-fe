import type { DashboardParams, EntityMethod, EntityType, Framework } from '../../api/types'
import { formatDate, formatDayMonth, formatNumber } from '../../i18n/format'
import { colors } from '../../theme'

export const ALL_ANALYSES_URL = '/app/analyses'

export type PeriodDays = '7' | '30' | '90'

/** Labels are `dashboard:periods.<value>`. */
export const PERIODS: PeriodDays[] = ['7', '30', '90']

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

/** Labels are `common:frameworks.<id>`. */
export const FRAMEWORK_ORDER: Framework[] = ['HIPAA', 'EU_GDPR', 'UK_GDPR', 'SWISS_FADP']

/** Fixed per framework (never by rank), so a filter never repaints a slice. */
export const FRAMEWORK_COLORS: Record<Framework, string> = {
  HIPAA: colors.primary[800],
  EU_GDPR: colors.primary[500],
  UK_GDPR: colors.accent[400],
  SWISS_FADP: colors.accent[600],
}

/**
 * Order from the design; Token sits next to the placeholder it resembles.
 * Labels are `common:methods.<id>`.
 */
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

/** Catalogue entity types have labels; others are raw detector names (US_BANK_NUMBER). */
export const isEntityType = (type: string): type is EntityType => ENTITY_TYPES.includes(type as EntityType)

const ENTITY_TYPES: EntityType[] = [
  'PERSON',
  'ORGANIZATION',
  'LOCATION',
  'DATE_TIME',
  'IP',
  'GEOPOINT',
  'NATIONAL_ID',
  'ID_NUMBER',
  'PASSPORT',
  'CREDIT_CARD',
  'BANK_ACCOUNT',
  'EMAIL',
  'PHONE',
  'MEDICAL_RECORD_NUMBER',
  'DEVICE_ID',
  'FREE_TEXT',
  'BIOLOGICAL_DATA',
  'PHOTO',
]

export { formatNumber } from '../../i18n/format'

export const formatRate = (rate: number | null) =>
  rate === null
    ? '—'
    : formatNumber(rate, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** "2026-04-01" (a calendar day, no zone) → "01 Apr". */
export const formatDay = (day: string) => formatDayMonth(`${day}T00:00:00`)
const LONG_DATE = { month: 'short', day: 'numeric', year: 'numeric' } as const
export const formatLongDay = (day: string) => formatDate(`${day}T00:00:00`, LONG_DATE)
export const formatDateTime = (iso: string) => formatDate(iso, LONG_DATE)

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
