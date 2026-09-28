import { api } from '../api/client'

export const healthService = {
  /** Also useful to wake the Render instance before the user signs in. */
  check() {
    return api.get<{ status: 'ok' }>('/health')
  },
}
