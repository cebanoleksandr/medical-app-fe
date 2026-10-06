import {
  MAX_RECORDS,
  MAX_UPLOAD_BYTES,
  type DatasetType,
  type OutputFormat,
  type SyntheticOptions,
} from '../../api/types'
import i18n from '../../i18n'
import { formatNumber } from '../../i18n/format'
import { formatFileSize } from '../de-identify/dataInput'

/** The formats POST /synthetic/sources/file reads. */
export const SOURCE_EXTENSIONS = ['.xlsx', '.csv', '.json'] as const
export const SOURCE_ACCEPT = [
  ...SOURCE_EXTENSIONS,
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
].join(',')

export interface SourceFileProblem {
  title: string
  message: string
}

/** Checks done before uploading, so a wrong file fails at once. */
export function checkSourceFile(file: File): SourceFileProblem | null {
  const name = file.name.toLowerCase()
  if (!SOURCE_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return {
      title: i18n.t('synthetic:settings.fileUnsupported'),
      message: i18n.t('synthetic:settings.fileUnsupportedText'),
    }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      title: i18n.t('synthetic:settings.fileTooLarge'),
      message: i18n.t('synthetic:settings.fileTooLargeText', { max: formatFileSize(MAX_UPLOAD_BYTES) }),
    }
  }
  return null
}

/** "100000" → "100,000" in English, as the design writes record counts. */
export function formatRecords(value: number) {
  return formatNumber(value)
}

/** Shown in the empty field; also the count the size estimate assumes. */
export const DEFAULT_RECORDS = 1000

/** Error for the "Number of Records" field, or null; empty isn't an error yet. */
export function recordsError(value: string, max = MAX_RECORDS): string | null {
  if (value === '') return null
  const count = Number(value)
  if (count < 1) return i18n.t('synthetic:settings.recordsMin')
  if (count > max) return i18n.t('synthetic:settings.recordsMax', { max: formatRecords(max) })
  return null
}

/**
 * Rough output size for a built-in dataset type. Sources have their own
 * columns, so there is nothing to estimate from until the dataset exists.
 */
export function estimateSize(
  options: SyntheticOptions,
  datasetType: DatasetType,
  format: OutputFormat | null,
  records: string,
) {
  const perRecord = options.bytesPerRecord[datasetType]?.[format ?? 'CSV']
  if (!perRecord) return null
  return formatFileSize(perRecord * (Number(records) || DEFAULT_RECORDS))
}
