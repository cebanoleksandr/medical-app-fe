import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import { healthService } from '../services'

/** Also wakes the Render instance, so call it early (e.g. on the sign-in page). */
export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: healthService.check,
    staleTime: 5 * 60_000,
  })
}
