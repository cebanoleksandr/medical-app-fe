import { api, fileForm, http } from '../api/client'
import { toApiError } from '../api/errors'
import type {
  Analysis,
  AnalysisOptions,
  AnalysesFilter,
  AnalysesPage,
  CreateAnalysisRequest,
  ExtractTextResponse,
  ListAnalysesParams,
  RenderAnalysisRequest,
} from '../api/types'
import type { DownloadedFile } from './synthetic.service'

export const analysesService = {
  /** Frameworks, methods, output modes: everything the wizard needs. */
  getOptions() {
    return api.get<AnalysisOptions>('/analyses/options')
  },

  /** .pdf, .docx or .txt up to 5 MB. */
  extractText(file: File) {
    return api.post<ExtractTextResponse>('/analyses/extract-text', fileForm(file))
  },

  /** One page, newest first, metadata only (the server keeps no text). */
  list(params: ListAnalysesParams = {}) {
    return api.get<AnalysesPage>('/analyses', { params })
  },

  /** The filtered list as CSV. Use saveFile() to hand it to the user. */
  async exportCsv(filter: AnalysesFilter = {}): Promise<DownloadedFile> {
    try {
      const res = await http.get<Blob>('/analyses/export', {
        params: filter,
        responseType: 'blob',
      })
      return { blob: res.data, filename: 'analyses.csv' }
    } catch (err) {
      throw await toApiError(err)
    }
  },

  create(request: CreateAnalysisRequest) {
    return api.post<Analysis>('/analyses', request)
  },

  /**
   * Re-applies the output after toggling entities or changing the mode. The
   * server keeps no text, so `text` must be the exact text that was analysed;
   * `entities` can be the analysis' own entities with `included` toggled.
   */
  render(id: string, request: RenderAnalysisRequest) {
    return api.post<Analysis>(`/analyses/${id}/render`, request)
  },
}
