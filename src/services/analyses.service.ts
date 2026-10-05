import { api, fileForm } from '../api/client'
import type {
  Analysis,
  AnalysisOptions,
  AnalysisSummary,
  CreateAnalysisRequest,
  ExtractTextResponse,
  ListAnalysesParams,
  RenderAnalysisRequest,
} from '../api/types'

export const analysesService = {
  /** Frameworks, methods, output modes: everything the wizard needs. */
  getOptions() {
    return api.get<AnalysisOptions>('/analyses/options')
  },

  /** .pdf, .docx or .txt up to 5 MB. */
  extractText(file: File) {
    return api.post<ExtractTextResponse>('/analyses/extract-text', fileForm(file))
  },

  /** Newest first, metadata only. Page with the last item's `createdAt`. */
  list(params: ListAnalysesParams = {}) {
    return api.get<AnalysisSummary[]>('/analyses', { params })
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
