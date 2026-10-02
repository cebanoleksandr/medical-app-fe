import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type { RenderAnalysisRequest } from '../api/types'
import { analysesService } from '../services'

/**
 * The catalogue never changes while the app runs, but the request also wakes
 * the detection service, which sleeps when idle on the free hosting tier. So
 * it is re-sent in the background whenever a wizard step that uses it opens
 * or the tab regains focus; cached data shows meanwhile.
 */
export function useAnalysisOptions() {
  return useQuery({
    queryKey: queryKeys.analyses.options,
    queryFn: analysesService.getOptions,
    staleTime: Infinity,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })
}

export function useExtractText() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: analysesService.extractText,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.all }),
  })
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: analysesService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.all }),
  })
}

/** Re-renders the output after toggling entities or changing the output mode. */
export function useRenderAnalysis() {
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: RenderAnalysisRequest }) =>
      analysesService.render(id, request),
  })
}
