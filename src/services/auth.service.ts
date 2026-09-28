import { api, refreshSession, tokenStore } from '../api/client'
import { toApiError } from '../api/errors'
import type { AuthSession, Language, MessageResponse, User } from '../api/types'

export const authService = {
  /** Emails a sign-in link to APP_URL/auth/verify?token=… (5 per 15 min). */
  requestMagicLink(email: string, locale?: Language) {
    return api.post<MessageResponse>('/auth/magic-link', { email, locale })
  },

  /** Redeems the token from the magic link and starts a session. */
  async verify(token: string): Promise<AuthSession> {
    const session = await api.post<AuthSession>('/auth/verify', { token })
    tokenStore.set(session.accessToken)
    return session
  },

  /**
   * Restores the session from the refresh cookie (call on app start).
   * Returns null when there is no valid session.
   */
  async restoreSession(): Promise<AuthSession | null> {
    try {
      return await refreshSession()
    } catch (err) {
      if ((await toApiError(err)).isUnauthorized) return null
      throw err
    }
  },

  me() {
    return api.get<User>('/auth/me')
  },

  async logout(): Promise<void> {
    try {
      await api.post<void>('/auth/logout')
    } finally {
      tokenStore.set(null)
    }
  },

  /** Deletes the account and all its data. `email` must match the account's. */
  async deleteAccount(email: string): Promise<void> {
    await api.delete<void>('/auth/me', { data: { email } })
    tokenStore.set(null)
  },

  isAuthenticated() {
    return tokenStore.get() !== null
  },
}
