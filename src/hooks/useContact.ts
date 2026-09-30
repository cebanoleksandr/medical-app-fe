import { useMutation } from '@tanstack/react-query'
import { contactService } from '../services'

/** Public endpoint: works without a session. */
export function useSendContactMessage() {
  return useMutation({ mutationFn: contactService.send })
}
