import axios from 'axios'
import i18n from '../i18n'

/** NestJS error body: `message` is an array for validation errors. */
interface NestErrorBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}

export class ApiError extends Error {
  /** HTTP status; 0 when the request never got a response (network, timeout). */
  readonly status: number
  /** Every message from the backend (validation errors come as a list). */
  readonly messages: string[]

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? i18n.t('errors.requestFailed'))
    this.name = 'ApiError'
    this.status = status
    this.messages = messages
  }

  get isUnauthorized() {
    return this.status === 401
  }

  /** Dataset or source expired: regenerate / upload again. */
  get isGone() {
    return this.status === 410
  }

  get isRateLimited() {
    return this.status === 429
  }

  get isNetworkError() {
    return this.status === 0
  }
}

export async function toApiError(err: unknown): Promise<ApiError> {
  if (err instanceof ApiError) return err
  if (!axios.isAxiosError(err)) {
    return new ApiError(0, [err instanceof Error ? err.message : String(err)])
  }
  if (!err.response) {
    const timedOut = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT'
    return new ApiError(0, [
      timedOut ? i18n.t('errors.timeout') : i18n.t('errors.network'),
    ])
  }

  const body = await parseErrorBody(err.response.data)
  const message = body?.message ?? body?.error ?? err.message
  return new ApiError(
    err.response.status,
    Array.isArray(message) ? message : [message],
  )
}

async function parseErrorBody(
  data: unknown,
): Promise<NestErrorBody | undefined> {
  // Downloads use responseType 'blob', so their error bodies arrive as a Blob.
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()) as NestErrorBody
    } catch {
      return undefined
    }
  }
  return data as NestErrorBody | undefined
}
