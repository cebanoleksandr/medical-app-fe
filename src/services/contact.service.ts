import { api } from '../api/client'

export interface ContactMessage {
  firstName: string
  lastName: string
  company?: string
  email: string
  message?: string
}

export const contactService = {
  // TODO: the backend has no /contact endpoint yet.
  send(message: ContactMessage) {
    return api.post<void>('/contact', message)
  },
}
