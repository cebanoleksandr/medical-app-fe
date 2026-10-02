import type { Analysis, DetectedEntity, IdentifierKey } from '../../api/types'

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

export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'document', label: 'Order in document' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'type', label: 'Type' },
]

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
  value === null ? '-' : `${Math.round(value * 100)}%`

export const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

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
  const included = entities.filter((e) => e.included)
  const settings = analysis.riskLevel
    ? `Risk level: ${analysis.riskLevel}`
    : `Method: ${analysis.method} · Output: ${analysis.outputMode} · Sensitivity: ${analysis.sensitivity}`
  const rows = entities.map((entity, index) => {
    const status = entity.included ? `→ ${entity.replacement ?? ''}` : 'unchanged (excluded)'
    const flag = entity.lowConfidence ? '  ⚠ low confidence' : ''
    return `${String(index + 1).padStart(3)}. ${categoryOf(entity).label.padEnd(22)} ${entity.score.toFixed(2)}  ${status}${flag}`
  })

  return [
    'De-identification report',
    '========================',
    '',
    `Source: ${source}`,
    `Analyzed: ${formatDate(analysis.createdAt)}`,
    `Framework: ${analysis.framework} · Language: ${analysis.language}`,
    settings,
    '',
    `Detected entities: ${entities.length}`,
    `Processed entities: ${included.length}`,
    `Avg. confidence: ${formatPercent(analysis.stats.avgConfidence)}`,
    `Processing time: ${formatSeconds(analysis.stats.processingMs)}`,
    '',
    'Entities (original values omitted)',
    '----------------------------------',
    ...(rows.length ? rows : ['None detected']),
    '',
    'De-identified text',
    '------------------',
    deidentified,
  ].join('\n')
}
