import type { Analysis, DetectedEntity, IdentifierKey } from '../../api/types'
import i18n from '../../i18n'
import { formatDate as formatLocalDate, formatNumber } from '../../i18n/format'

// ---------- Categories ----------

export interface EntityCategory {
  /** Filter key and label, e.g. PERSON, DATE. */
  label: string
  /** EntityTypeLabel icon key. */
  icon: string
}

// HIPAA analyses group by identifier, labelled as in the design's chips.
const IDENTIFIER_LABELS: Record<IdentifierKey, string> = {
  names: 'PERSON',
  geographic: 'LOCATION',
  dates: 'DATE',
  phone: 'PHONE',
  fax: 'FAX',
  email: 'EMAIL',
  ssn: 'SSN',
  mrn: 'MRN',
  health_plan: 'BENEFICIARY',
  account: 'ACCOUNT',
  license: 'LICENSE',
  vehicle: 'VEHICLE',
  device: 'DEVICE',
  url: 'URL',
  ip: 'IP',
  biometric: 'BIOMETRIC',
  photo: 'PHOTO',
  other: 'OTHER',
  organization: 'ORG',
  special_category: 'NRP',
}

// Risk-level analyses group by entity type, with short labels that fit the
// 62px type column; icons reuse the closest ones.
const ENTITY_CATEGORIES: Record<string, EntityCategory> = {
  PERSON: { label: 'PERSON', icon: 'PERSON' },
  ORGANIZATION: { label: 'ORG', icon: 'ORG' },
  LOCATION: { label: 'LOCATION', icon: 'LOCATION' },
  DATE_TIME: { label: 'DATE', icon: 'DATE' },
  IP: { label: 'IP', icon: 'IP' },
  GEOPOINT: { label: 'GEO', icon: 'LOCATION' },
  NATIONAL_ID: { label: 'NATIONAL ID', icon: 'NATIONAL_ID' },
  ID_NUMBER: { label: 'ID NUMBER', icon: 'LICENSE' },
  PASSPORT: { label: 'PASSPORT', icon: 'PASSPORT' },
  CREDIT_CARD: { label: 'CARD', icon: 'ACCOUNT' },
  BANK_ACCOUNT: { label: 'ACCOUNT', icon: 'ACCOUNT' },
  EMAIL: { label: 'EMAIL', icon: 'EMAIL' },
  PHONE: { label: 'PHONE', icon: 'PHONE' },
  MEDICAL_RECORD_NUMBER: { label: 'MRN', icon: 'MRN' },
  DEVICE_ID: { label: 'DEVICE', icon: 'DEVICE' },
  FREE_TEXT: { label: 'FREE TEXT', icon: 'OTHER' },
  BIOLOGICAL_DATA: { label: 'BIOMETRIC', icon: 'BIOMETRIC' },
  PHOTO: { label: 'PHOTO', icon: 'PHOTO' },
}

export function categoryOf(entity: DetectedEntity): EntityCategory {
  if (entity.entityType) {
    return ENTITY_CATEGORIES[entity.entityType] ?? { label: entity.entityType, icon: 'OTHER' }
  }
  if (entity.identifier) {
    const label = IDENTIFIER_LABELS[entity.identifier]
    return { label, icon: label }
  }
  return { label: entity.type, icon: 'OTHER' }
}

// ---------- Sorting ----------

export type SortOrder = 'document' | 'confidence' | 'type'

/** Labels are `deIdentify:review.sort.<order>`. */
export const SORT_ORDERS: SortOrder[] = ['document', 'confidence', 'type']

export function sortEntities(entities: DetectedEntity[], order: SortOrder) {
  const sorted = [...entities]
  if (order === 'confidence') sorted.sort((a, b) => b.score - a.score || a.start - b.start)
  else if (order === 'type')
    sorted.sort(
      (a, b) => categoryOf(a).label.localeCompare(categoryOf(b).label) || a.start - b.start,
    )
  else sorted.sort((a, b) => a.start - b.start)
  return sorted
}

// ---------- Text segments ----------

export type Segment = string | { entity: DetectedEntity }

/** The text cut at entity boundaries; entities never overlap. */
export function segmentText(text: string, entities: DetectedEntity[]): Segment[] {
  const segments: Segment[] = []
  let cursor = 0
  for (const entity of [...entities].sort((a, b) => a.start - b.start)) {
    if (entity.start > cursor) segments.push(text.slice(cursor, entity.start))
    segments.push({ entity })
    cursor = entity.end
  }
  if (cursor < text.length) segments.push(text.slice(cursor))
  return segments
}

/** The de-identified text, as the server builds it from the same entities. */
export function deidentifiedText(text: string, entities: DetectedEntity[]) {
  return segmentText(text, entities)
    .map((segment) =>
      typeof segment === 'string'
        ? segment
        : segment.entity.included
          ? (segment.entity.replacement ?? '')
          : segment.entity.text,
    )
    .join('')
}

// ---------- Formatting ----------

export const formatPercent = (value: number | null) =>
  value === null ? '-' : formatNumber(value, { style: 'percent', maximumFractionDigits: 0 })

export const formatSeconds = (ms: number) =>
  i18n.t('deIdentify:review.seconds', {
    value: formatNumber(ms / 1000, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  })

export const formatDate = (iso: string) =>
  formatLocalDate(iso, { month: 'short', day: 'numeric', year: 'numeric' })

/** A category code (PERSON, FREE TEXT) in the UI language. */
export const categoryText = (label: string) =>
  i18n.t(`deIdentify:review.categories.${label}` as 'deIdentify:review.categories.PERSON', {
    defaultValue: label,
  })

// ---------- Report ----------

/**
 * Plain-text report: settings, stats and what happened to each entity.
 * Original values are left out on purpose; only the de-identified text is
 * included, so the file is safe to share.
 */
export function buildReport(
  analysis: Analysis,
  entities: DetectedEntity[],
  source: string,
  deidentified: string,
) {
  const t = i18n.getFixedT(null, 'deIdentify', 'review.report')
  const included = entities.filter((e) => e.included)
  const settings = analysis.riskLevel
    ? t('risk', { value: analysis.riskLevel })
    : t('settings', {
        method: analysis.method,
        output: analysis.outputMode,
        sensitivity: analysis.sensitivity,
      })
  const rows = entities.map((entity, index) => {
    const status = entity.included ? `→ ${entity.replacement ?? ''}` : t('excluded')
    const flag = entity.lowConfidence ? `  ${t('lowConfidence')}` : ''
    return `${String(index + 1).padStart(3)}. ${categoryText(categoryOf(entity).label).padEnd(22)} ${entity.score.toFixed(2)}  ${status}${flag}`
  })
  const heading = (text: string, rule: string) => [text, rule.repeat(text.length)]

  return [
    ...heading(t('title'), '='),
    '',
    t('source', { value: source }),
    t('analyzed', { value: formatDate(analysis.createdAt) }),
    t('framework', { framework: analysis.framework, language: analysis.language }),
    settings,
    '',
    t('detected', { value: entities.length }),
    t('processed', { value: included.length }),
    t('confidence', { value: formatPercent(analysis.stats.avgConfidence) }),
    t('time', { value: formatSeconds(analysis.stats.processingMs) }),
    '',
    ...heading(t('entities'), '-'),
    ...(rows.length ? rows : [t('none')]),
    '',
    ...heading(t('text'), '-'),
    deidentified,
  ].join('\n')
}
