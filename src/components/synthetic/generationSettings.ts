import {
  MAX_RECORDS,
  MAX_UPLOAD_BYTES,
  type DatasetType,
  type OutputFormat,
  type SyntheticOptions,
} from '../../api/types'
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
    return { title: 'File format not supported', message: 'Please upload .xlsx, .csv or .json' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      title: 'File is too large',
      message: `Please upload a file up to ${formatFileSize(MAX_UPLOAD_BYTES)}`,
    }
  }
  return null
}

/** "100000" → "100,000", as the design writes record counts. */
export function formatRecords(value: number) {
  return value.toLocaleString('en-US')
}

/** Shown in the empty field; also the count the size estimate assumes. */
export const DEFAULT_RECORDS = 1000

/** Error for the "Number of Records" field, or null; empty isn't an error yet. */
export function recordsError(value: string, max = MAX_RECORDS): string | null {
  if (value === '') return null
  const count = Number(value)
  if (count < 1) return 'Enter at least 1 record'
  if (count > max) return `Max ${formatRecords(max)} records`
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
