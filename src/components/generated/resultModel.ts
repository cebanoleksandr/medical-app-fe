import type {
  CellValue,
  ColumnDefinition,
  Dataset,
  Framework,
  Level3,
  ValidationReport,
} from '../../api/types'
import { formatRecords } from '../synthetic/generationSettings'

/** Overall verdict: the banner, card accents and which actions are allowed. */
export type ResultStatus = 'passed' | 'warning' | 'failed'
export type Tone = 'success' | 'warning' | 'error'

export const STATUS_TONE: Record<ResultStatus, Tone> = {
  passed: 'success',
  warning: 'warning',
  failed: 'error',
}

/**
 * Failed: identifiers leaked or a check broke, so the dataset must not be
 * downloaded. Warning: usable, but quality or risk needs a look. Low-confidence
 * source fields alone are only review notes.
 */
export function resultStatus(report: ValidationReport): ResultStatus {
  const { compliance, quality, checks } = report
  if (
    compliance.directIdentifiers === 'DETECTED' ||
    compliance.riskLevel === 'HIGH' ||
    checks.some((check) => !check.passed)
  ) {
    return 'failed'
  }
  if (
    compliance.riskLevel === 'MEDIUM' ||
    quality.quality !== 'GOOD' ||
    quality.consistency !== 'HIGH'
  ) {
    return 'warning'
  }
  return 'passed'
}

export const FRAMEWORK_NAMES: Record<Framework, { short: string; long: string }> = {
  HIPAA: { short: 'HIPAA SH', long: 'HIPAA Safe Harbor' },
  EU_GDPR: { short: 'EU GDPR', long: 'EU GDPR' },
  UK_GDPR: { short: 'UK GDPR', long: 'UK GDPR' },
  SWISS_FADP: { short: 'Swiss FADP', long: 'Swiss FADP' },
}

export const LEVEL_LABELS: Record<Level3, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

export type QualityLevel = ValidationReport['quality']['quality']

export const QUALITY: Record<QualityLevel, { label: string; tone: Tone }> = {
  GOOD: { label: 'Good', tone: 'success' },
  FAIR: { label: 'Fair', tone: 'warning' },
  POOR: { label: 'Poor', tone: 'error' },
}

/** Presidio entity types the validation scan reports. */
const ENTITY_LABELS: Record<string, string> = {
  PERSON: 'Names',
  EMAIL_ADDRESS: 'Email addresses',
  PHONE_NUMBER: 'Phone numbers',
  US_SSN: 'Social security numbers',
  UA_RNOKPP: 'Tax numbers (RNOKPP)',
  UA_PASSPORT: 'Passport numbers',
  US_PASSPORT: 'Passport numbers',
  CH_AHV: 'AHV numbers',
  US_DRIVER_LICENSE: 'Driver license numbers',
  IBAN_CODE: 'Bank accounts',
  CREDIT_CARD: 'Credit card numbers',
  IP_ADDRESS: 'IP addresses',
}

export const entityLabel = (type: string) => ENTITY_LABELS[type] ?? type

/** Findings grouped by entity type, most frequent first. */
export function findingGroups(report: ValidationReport) {
  const counts = new Map<string, number>()
  for (const finding of report.findings) {
    const label = entityLabel(finding.entityType)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  return [...counts].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }))
}

/** "Quality" is not a data column: it comes from each record's rating. */
export const QUALITY_COLUMN = '__quality'

export interface ColumnOption {
  key: string
  label: string
  /** The identifier column always stays in the table. */
  locked: boolean
}

/** The dataset's preview columns plus Quality, then everything else. */
export function columnOptions(dataset: Dataset) {
  const idKey = dataset.columns.find((c) => c.role === 'id')?.key
  const toOption = (c: ColumnDefinition): ColumnOption => ({
    key: c.key,
    label: c.label,
    locked: c.key === idKey,
  })
  const preview = new Set(dataset.previewColumns)
  return {
    defaults: [
      ...dataset.columns.filter((c) => preview.has(c.key)).map(toOption),
      { key: QUALITY_COLUMN, label: 'Quality', locked: false },
    ],
    additional: dataset.columns.filter((c) => !preview.has(c.key)).map(toOption),
  }
}

export const defaultColumns = (dataset: Dataset) => [...dataset.previewColumns, QUALITY_COLUMN]

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatCell(value: CellValue, type: ColumnDefinition['type'] = 'string'): string {
  if (value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return formatRecords(value)
  if (type === 'date') {
    const time = Date.parse(value)
    if (!Number.isNaN(time)) return dateFormat.format(time)
  }
  return value
}

function saveJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function saveValidationReport(report: ValidationReport) {
  saveJson(report, `synthetic-${report.datasetId}-validation.json`)
}

/** Column names and types; the download itself carries only the values. */
export function saveSchemaSummary(dataset: Dataset) {
  saveJson(
    {
      datasetId: dataset.id,
      datasetType: dataset.datasetType,
      framework: dataset.framework,
      format: dataset.format,
      records: dataset.records,
      fields: dataset.fields,
      columns: dataset.columns,
    },
    `synthetic-${dataset.id}-schema.json`,
  )
}
