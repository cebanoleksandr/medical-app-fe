import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type { RenderAnalysisRequest } from '../api/types'
import { analysesService } from '../services'

export function useAnalysisOptions() {
  return useQuery({
    queryKey: queryKeys.analyses.options,
    queryFn: analysesService.getOptions,
    staleTime: Infinity,
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
