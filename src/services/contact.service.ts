import { api } from '../api/client'
import type { ContactMessageRequest, MessageResponse } from '../api/types'

export const contactService = {
  /**
   * Landing page "Send us a message": the backend emails the team and stores
   * nothing. Public, 5 messages per 15 min; 503 when mail is not configured.
   */
  send(message: ContactMessageRequest) {
    return api.post<MessageResponse>('/contact', message)
  },
}
