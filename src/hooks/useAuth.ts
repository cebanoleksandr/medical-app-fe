import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { resetSession } from '../api/queryClient'
import { queryKeys } from '../api/queryKeys'
import type { Language } from '../api/types'
import { authService } from '../services'

/**
 * Restores the session from the refresh cookie once per app load. `data` is
 * null when signed out; verify, logout and session expiry keep it up to date.
 */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.restoreSession,
    staleTime: Infinity,
    gcTime: Infinity,
    // Refreshing rotates the token, so never refetch in the background.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.me,
    enabled,
  })
}

export function useRequestMagicLink() {
  return useMutation({
    mutationFn: ({ email, locale }: { email: string; locale?: Language }) =>
      authService.requestMagicLink(email, locale),
  })
}

export function useVerifyMagicLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.verify,
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.session, session)
      queryClient.setQueryData(queryKeys.auth.me, session.user)
    },
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
    // The local token is gone even if the request failed.
    onSettled: resetSession,
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: authService.deleteAccount,
    onSuccess: resetSession,
  })
}
