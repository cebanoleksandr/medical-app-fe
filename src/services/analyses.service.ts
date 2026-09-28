import { api, fileForm } from '../api/client'
import type {
  Analysis,
  AnalysisOptions,
  CreateAnalysisRequest,
  DetectedEntity,
  EntityState,
  ExtractTextResponse,
  RenderAnalysisRequest,
} from '../api/types'

/** Strips a detected entity down to what render / source requests accept. */
export function toEntityState(entity: DetectedEntity): EntityState {
  const { id, type, start, end, score, included } = entity
  return { id, type, start, end, score, included }
}

export const analysesService = {
  /** Frameworks, methods, output modes: everything the wizard needs. */
  getOptions() {
    return api.get<AnalysisOptions>('/analyses/options')
  },

  /** .pdf, .docx or .txt up to 5 MB. */
  extractText(file: File) {
    return api.post<ExtractTextResponse>('/analyses/extract-text', fileForm(file))
  },

  create(request: CreateAnalysisRequest) {
    return api.post<Analysis>('/analyses', request)
  },

  /**
   * Re-applies the output after toggling entities or changing the mode. The
   * server keeps no text, so `text` must be the exact text that was analysed.
   */
  render(id: string, request: RenderAnalysisRequest) {
    return api.post<Analysis>(`/analyses/${id}/render`, request)
  },
}
