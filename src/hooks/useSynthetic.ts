import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type { Dataset, ListRecordsParams, OutputFormat } from '../api/types'
import { saveFile, syntheticService } from '../services'

// A dataset never changes after creation (regenerate makes a new id), so its
// queries stay fresh until it expires with 410 Gone.

export function useSyntheticOptions() {
  return useQuery({
    queryKey: queryKeys.synthetic.options,
    queryFn: syntheticService.getOptions,
    staleTime: Infinity,
  })
}

export function useDataset(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.synthetic.dataset(id ?? ''),
    queryFn: () => syntheticService.getDataset(id!),
    enabled: !!id,
    staleTime: Infinity,
  })
}

export function useDatasetValidation(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.synthetic.validation(id ?? ''),
    queryFn: () => syntheticService.validate(id!),
    enabled: !!id,
    staleTime: Infinity,
  })
}

/** Keeps the previous page on screen while the next one loads. */
export function useDatasetRecords(
  id: string | undefined,
  params: ListRecordsParams = {},
) {
  return useQuery({
    queryKey: queryKeys.synthetic.records(id ?? '', params),
    queryFn: () => syntheticService.listRecords(id!, params),
    enabled: !!id,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

export function useDatasetRecord(
  id: string | undefined,
  recordId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.synthetic.record(id ?? '', recordId ?? ''),
    queryFn: () => syntheticService.getRecord(id!, recordId!),
    enabled: !!id && !!recordId,
    staleTime: Infinity,
  })
}

function useOnDatasetCreated() {
  const queryClient = useQueryClient()
  return (dataset: Dataset) => {
    queryClient.setQueryData(queryKeys.synthetic.dataset(dataset.id), dataset)
    return queryClient.invalidateQueries({ queryKey: queryKeys.activity.all })
  }
}

export function useCreateDataset() {
  return useMutation({
    mutationFn: syntheticService.createDataset,
    onSuccess: useOnDatasetCreated(),
  })
}

/** Resolves with the new dataset: navigate to its id. */
export function useRegenerateDataset() {
  return useMutation({
    mutationFn: syntheticService.regenerate,
    onSuccess: useOnDatasetCreated(),
  })
}

/** Downloads the dataset and hands the file to the browser. */
export function useDownloadDataset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format?: OutputFormat }) =>
      syntheticService.download(id, format),
    onSuccess: (file) => {
      saveFile(file)
      return queryClient.invalidateQueries({ queryKey: queryKeys.activity.all })
    },
  })
}
