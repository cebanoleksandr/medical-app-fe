import { QueryClient, hashKey } from '@tanstack/react-query'
import { setSessionExpiredHandler } from './client'
import { ApiError } from './errors'
import { queryKeys } from './queryKeys'

// The client and services reject with ApiError, so hooks expose it as `error`.
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}

const MAX_RETRIES = 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx won't change on retry (401 is already refreshed by the client);
      // network errors and 5xx may, e.g. while Render wakes up.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < MAX_RETRIES
      },
    },
    mutations: {
      retry: false,
    },
  },
})

const sessionHash = hashKey(queryKeys.auth.session)

/** Drops every user's cached data and marks the session as signed out. */
export function resetSession() {
  // Update the session query in place: useSession observers are subscribed to
  // it, and clear() would remove it from under them, so the null never reached
  // AppLayout and nothing redirected to the sign-in page.
  queryClient.setQueryData(queryKeys.auth.session, null)
  queryClient.removeQueries({
    predicate: (query) => query.queryHash !== sessionHash,
  })
}

setSessionExpiredHandler(resetSession)
