import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type {
  AnalysesFilter,
  DashboardParams,
  IsoDate,
  ListAnalysesParams,
} from '../api/types'
import { activityService, analysesService, saveFile } from '../services'

/** Keeps the previous numbers on screen while a new period loads. */
export function useDashboard(params: DashboardParams = {}) {
  return useQuery({
    queryKey: queryKeys.activity.dashboard(params),
    queryFn: () => activityService.getDashboard(params),
    placeholderData: keepPreviousData,
  })
}

/** One page of past analyses; the previous page stays on screen while the next loads. */
export function useAnalysesPage(params: ListAnalysesParams) {
  return useQuery({
    queryKey: queryKeys.activity.analyses(params),
    queryFn: () => analysesService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Downloads the filtered analyses as CSV. */
export function useExportAnalyses() {
  return useMutation({
    mutationFn: (filter: AnalysesFilter) => analysesService.exportCsv(filter),
    onSuccess: saveFile,
  })
}

/** Newest first; `fetchNextPage()` loads older events. */
export function useActivity(limit = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.activity.list(limit),
    queryFn: ({ pageParam }) =>
      activityService.list({ limit, before: pageParam }),
    initialPageParam: undefined as IsoDate | undefined,
    // A short page means there is nothing older.
    getNextPageParam: (lastPage) =>
      lastPage.length < limit ? undefined : lastPage.at(-1)?.createdAt,
  })
}
