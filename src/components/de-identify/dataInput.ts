import * as yup from 'yup'
import { MAX_PASTED_TEXT_LENGTH, MAX_UPLOAD_BYTES, MIN_TEXT_LENGTH } from '../../api/types'

/** "5000" → "5 000", as the design writes counts. */
export function formatCount(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** "2.4 MB", "830 KB". */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** "report.pdf" → "PDF". */
export function fileKind(name: string) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toUpperCase()
}

export const pastedTextSchema = yup.object({
  text: yup
    .string()
    .default('')
    .test(
      'min',
      `Please enter at least ${MIN_TEXT_LENGTH} characters to continue`,
      (value = '') => value.trim().length >= MIN_TEXT_LENGTH,
    )
    .max(
      MAX_PASTED_TEXT_LENGTH,
      `Text is too long: the limit is ${formatCount(MAX_PASTED_TEXT_LENGTH)} characters`,
    ),
})

export type PastedTextValues = yup.InferType<typeof pastedTextSchema>

export function isValidPastedText(text: string) {
  return pastedTextSchema.isValidSync({ text })
}

/** The formats /analyses/extract-text reads. */
export const UPLOAD_EXTENSIONS = ['.txt', '.pdf', '.docx'] as const
export const UPLOAD_ACCEPT = [
  ...UPLOAD_EXTENSIONS,
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
].join(',')

export interface UploadProblem {
  title: string
  message: string
  /** Short note under the drop zone. */
  note: string
}

/** Checks done before uploading, so a wrong file fails at once. */
export function checkFile(file: File): UploadProblem | null {
  const name = file.name.toLowerCase()
  if (!UPLOAD_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return {
      title: 'Unsupported file format',
      message: 'Please upload .txt, .pdf or .docx',
      note: 'File format not supported',
    }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      title: 'File is too large',
      message: `Please upload a file up to ${formatFileSize(MAX_UPLOAD_BYTES)}`,
      note: `This file is ${formatFileSize(file.size)}`,
    }
  }
  return null
}
