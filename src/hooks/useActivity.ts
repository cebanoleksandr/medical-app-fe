import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type { DashboardParams, Framework, IsoDate } from '../api/types'
import { activityService, analysesService } from '../services'

/** Keeps the previous numbers on screen while a new period loads. */
export function useDashboard(params: DashboardParams = {}) {
  return useQuery({
    queryKey: queryKeys.activity.dashboard(params),
    queryFn: () => activityService.getDashboard(params),
    placeholderData: keepPreviousData,
  })
}

/** Past analyses, newest first; `fetchNextPage()` loads older ones. */
export function useAnalysesList({
  limit = 20,
  framework,
  enabled = true,
}: { limit?: number; framework?: Framework; enabled?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.activity.analyses({ limit, framework }),
    queryFn: ({ pageParam }) =>
      analysesService.list({ limit, framework, before: pageParam }),
    initialPageParam: undefined as IsoDate | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length < limit ? undefined : lastPage.at(-1)?.createdAt,
    enabled,
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
