import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { toApiError } from './errors'
import type { AuthSession } from './types'

/**
 * Relative by default: the dev server (vite.config.ts) and the production host
 * proxy /api to the backend, so the httpOnly refresh cookie stays first-party.
 */
const baseURL = import.meta.env.VITE_API_URL || '/api'

// Render's free tier sleeps: the first request after idle can take ~50 s.
const TIMEOUT_MS = 90_000

export const http = axios.create({
  baseURL,
  timeout: TIMEOUT_MS,
  // Sends the refresh_token cookie to /api/auth/*.
  withCredentials: true,
})

// The access token lives in memory only; the refresh cookie restores it on reload.
let accessToken: string | null = null
let onSessionExpired: (() => void) | null = null

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token
  },
}

/** Called once refresh fails: the user must sign in again. */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

// One refresh at a time: parallel 401s all wait for the same request, since
// the backend rotates the refresh token on every use.
let refreshing: Promise<AuthSession> | null = null

export function refreshSession(): Promise<AuthSession> {
  refreshing ??= axios
    .post<AuthSession>('/auth/refresh', null, {
      baseURL,
      timeout: TIMEOUT_MS,
      withCredentials: true,
    })
    .then(({ data }) => {
      tokenStore.set(data.accessToken)
      return data
    })
    .catch(async (err) => {
      tokenStore.set(null)
      throw await toApiError(err)
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

const NO_REFRESH_URLS = ['/auth/magic-link', '/auth/verify', '/auth/refresh', '/auth/logout']

http.interceptors.response.use(undefined, async (err) => {
  const config = err?.config as RetriableConfig | undefined
  const canRefresh =
    err?.response?.status === 401 &&
    config &&
    !config._retried &&
    !NO_REFRESH_URLS.includes(config.url ?? '')

  if (!canRefresh) throw await toApiError(err)

  config._retried = true
  try {
    await refreshSession()
  } catch (refreshErr) {
    onSessionExpired?.()
    throw refreshErr
  }
  return http(config)
})

/** Unwraps `data` so services return plain payloads. */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    http.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.post<T>(url, body, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    http.delete<T>(url, config).then((r) => r.data),
}

/** Multipart body with a single `file` field, as the upload endpoints expect. */
export function fileForm(file: File | Blob, filename?: string): FormData {
  const form = new FormData()
  if (filename) form.append('file', file, filename)
  else form.append('file', file)
  return form
}
