import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type { Language, Source } from '../api/types'
import { sourcesService } from '../services'

export function useSource(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.synthetic.source(id ?? ''),
    queryFn: () => sourcesService.get(id!),
    enabled: !!id,
    staleTime: Infinity,
  })
}

function useOnSourceCreated() {
  const queryClient = useQueryClient()
  return (source: Source) => {
    queryClient.setQueryData(queryKeys.synthetic.source(source.id), source)
    return queryClient.invalidateQueries({ queryKey: queryKeys.activity.all })
  }
}

export function useCreateSourceFromFile() {
  return useMutation({
    mutationFn: ({ file, language }: { file: File; language?: Language }) =>
      sourcesService.fromFile(file, language),
    onSuccess: useOnSourceCreated(),
  })
}

export function useCreateSourceFromAnalysis() {
  return useMutation({
    mutationFn: sourcesService.fromAnalysis,
    onSuccess: useOnSourceCreated(),
  })
}
