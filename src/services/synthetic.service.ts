import { api, http } from '../api/client'
import { toApiError } from '../api/errors'
import type {
  CreateDatasetRequest,
  Dataset,
  DatasetRecord,
  ListRecordsParams,
  OutputFormat,
  RecordsPage,
  SyntheticOptions,
  ValidationReport,
} from '../api/types'

export interface DownloadedFile {
  blob: Blob
  filename: string
}

function filenameFrom(disposition: unknown, fallback: string): string {
  if (typeof disposition !== 'string') return fallback
  return /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? fallback
}

/** Saves a blob through a temporary link. */
export function saveFile({ blob, filename }: DownloadedFile) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Datasets expire (410 Gone); regenerate() makes a fresh copy with a new id.
export const syntheticService = {
  getOptions() {
    return api.get<SyntheticOptions>('/synthetic/options')
  },

  createDataset(request: CreateDatasetRequest) {
    return api.post<Dataset>('/synthetic/datasets', request)
  },

  getDataset(id: string) {
    return api.get<Dataset>(`/synthetic/datasets/${id}`)
  },

  /** Same settings and source, new seed. Returns a dataset with a new id. */
  regenerate(id: string) {
    return api.post<Dataset>(`/synthetic/datasets/${id}/regenerate`)
  },

  /** Compliance, quality and checklist; can take a while on large datasets. */
  validate(id: string) {
    return api.get<ValidationReport>(`/synthetic/datasets/${id}/validation`)
  },

  listRecords(id: string, { columns, ...params }: ListRecordsParams = {}) {
    return api.get<RecordsPage>(`/synthetic/datasets/${id}/records`, {
      params: { ...params, columns: columns?.join(',') },
    })
  },

  getRecord(id: string, recordId: string) {
    return api.get<DatasetRecord>(
      `/synthetic/datasets/${id}/records/${encodeURIComponent(recordId)}`,
    )
  },

  /** Defaults to the dataset's own format. Use saveFile() to hand it to the user. */
  async download(id: string, format?: OutputFormat): Promise<DownloadedFile> {
    try {
      const res = await http.get<Blob>(`/synthetic/datasets/${id}/download`, {
        params: { format },
        responseType: 'blob',
        // Up to 100 000 records are generated while streaming.
        timeout: 0,
      })
      return {
        blob: res.data,
        filename: filenameFrom(
          res.headers['content-disposition'],
          `synthetic-${id}.${(format ?? 'csv').toLowerCase()}`,
        ),
      }
    } catch (err) {
      throw await toApiError(err)
    }
  },
}
