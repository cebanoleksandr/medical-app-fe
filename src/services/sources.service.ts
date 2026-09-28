import { api, fileForm } from '../api/client'
import type { Language, Source, SourceFromAnalysisRequest } from '../api/types'

// A source feeds createDataset({ sourceId, ... }); it expires with its datasets.
export const sourcesService = {
  /** .xlsx, .csv or .json up to 5 MB; only column statistics are kept. */
  fromFile(file: File, language: Language = 'en') {
    return api.post<Source>('/synthetic/sources/file', fileForm(file), {
      params: { language },
    })
  },

  /** Turns a de-identified document into a template for synthetic copies. */
  fromAnalysis(request: SourceFromAnalysisRequest) {
    return api.post<Source>('/synthetic/sources/analysis', request)
  },

  get(id: string) {
    return api.get<Source>(`/synthetic/sources/${id}`)
  },
}
