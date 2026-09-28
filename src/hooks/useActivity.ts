import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type { IsoDate } from '../api/types'
import { activityService } from '../services'

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.activity.dashboard,
    queryFn: activityService.getDashboard,
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
